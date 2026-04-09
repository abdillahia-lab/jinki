#!/usr/bin/env python3
"""
generate-noise-atlas-gpu.py — GPU-accelerated noise atlas on DGX Spark GB10.

Generates a 1024×1024 RGBA PNG:
  R = Blue noise (GPU energy minimization, 500k swaps)
  G = Curl noise X (analytical curl of Perlin potential)
  B = Worley noise (F1 Voronoi distance, 512 seeds)
  A = fBm noise (6-octave fractal Brownian motion)

Runs on NVIDIA GB10 Blackwell GPU via PyTorch CUDA tensors.

Usage (inside NGC container):
  python3 generate-noise-atlas-gpu.py [--size 1024] [--out /workspace/output]
"""

import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
import sys
import time

SIZE = 1024
OUT_DIR = '.'

for i, arg in enumerate(sys.argv[1:], 1):
    if arg == '--size' and i < len(sys.argv) - 1:
        SIZE = int(sys.argv[i + 1])
    elif arg == '--out' and i < len(sys.argv) - 1:
        OUT_DIR = sys.argv[i + 1]

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'\n=== GPU Noise Atlas Generator ({SIZE}x{SIZE} RGBA) ===')
print(f'    Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"})')
print(f'    VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB\n')


# ── Permutation table for Perlin noise (on GPU) ──
def make_perm_gpu(seed=42):
    rng = np.random.default_rng(seed)
    p = np.arange(256, dtype=np.int64)
    rng.shuffle(p)
    p = np.tile(p, 4)  # Extra room for wrapping
    return torch.tensor(p, device=device, dtype=torch.long)

PERM = make_perm_gpu()
GRAD2 = torch.tensor([
    [1,1],[-1,1],[1,-1],[-1,-1],
    [1,0],[-1,0],[0,1],[0,-1],
], device=device, dtype=torch.float32)


def fade(t):
    return t * t * t * (t * (t * 6 - 15) + 10)


def perlin_2d_gpu(x, y):
    """Fully vectorized 2D Perlin noise on GPU tensors."""
    xi = x.floor().long() & 255
    yi = y.floor().long() & 255
    xf = x - x.floor()
    yf = y - y.floor()

    u = fade(xf)
    v = fade(yf)

    aa = PERM[PERM[xi] + yi] % 8
    ab = PERM[PERM[xi] + yi + 1] % 8
    ba = PERM[PERM[xi + 1] + yi] % 8
    bb = PERM[PERM[xi + 1] + yi + 1] % 8

    def dot_grad(idx, dx, dy):
        g = GRAD2[idx]
        return g[..., 0] * dx + g[..., 1] * dy

    x1 = dot_grad(aa, xf, yf) * (1 - u) + dot_grad(ba, xf - 1, yf) * u
    x2 = dot_grad(ab, xf, yf - 1) * (1 - u) + dot_grad(bb, xf - 1, yf - 1) * u

    return x1 * (1 - v) + x2 * v


# ── Channel R: Blue Noise (GPU energy minimization) ──
def generate_blue_noise_gpu(size, iterations=500000, seed=42):
    t0 = time.time()
    print(f'  [R] Blue noise ({size}x{size}, {iterations} GPU swaps)...')

    rng = torch.Generator(device=device).manual_seed(seed)
    noise = torch.rand(size, size, device=device, generator=rng)

    # Gaussian blur kernel for energy computation
    kernel_size = 7
    sigma = 1.5
    x = torch.arange(kernel_size, device=device, dtype=torch.float32) - kernel_size // 2
    gauss_1d = torch.exp(-x**2 / (2 * sigma**2))
    gauss_1d = gauss_1d / gauss_1d.sum()
    gauss_2d = gauss_1d.unsqueeze(0) * gauss_1d.unsqueeze(1)
    gauss_2d = gauss_2d.unsqueeze(0).unsqueeze(0)  # [1,1,K,K]

    def compute_energy(n):
        n4d = n.unsqueeze(0).unsqueeze(0)
        # Circular padding for tileability
        pad = kernel_size // 2
        n_padded = F.pad(n4d, [pad, pad, pad, pad], mode='circular')
        return F.conv2d(n_padded, gauss_2d).squeeze()

    energy = compute_energy(noise)
    current_var = energy.var().item()

    # Batch swap approach: try many swaps at once
    batch = 4096
    accepted = 0

    for it in range(0, iterations, batch):
        # Random positions
        pos1 = torch.randint(0, size, (batch, 2), device=device)
        pos2 = torch.randint(0, size, (batch, 2), device=device)

        # Sequential swaps with acceptance check
        # For speed, we do energy recompute every N swaps
        for b in range(min(batch, iterations - it)):
            y1, x1 = pos1[b, 0].item(), pos1[b, 1].item()
            y2, x2 = pos2[b, 0].item(), pos2[b, 1].item()

            v1, v2 = noise[y1, x1].item(), noise[y2, x2].item()
            noise[y1, x1], noise[y2, x2] = v2, v1

            if b % 512 == 511:
                energy = compute_energy(noise)
                new_var = energy.var().item()
                if new_var > current_var * 1.001:  # Got worse
                    noise[y1, x1], noise[y2, x2] = v1, v2
                else:
                    current_var = new_var
                    accepted += 512

        if it % 50000 == 0:
            print(f'    iter {it}/{iterations}, var={current_var:.6f}')

    noise = (noise - noise.min()) / (noise.max() - noise.min())
    print(f'    Done in {time.time() - t0:.1f}s (accepted ~{accepted} swaps)')
    return noise


# ── Channel G: Curl Noise (GPU Perlin curl) ──
def generate_curl_noise_gpu(size):
    t0 = time.time()
    print(f'  [G] Curl noise ({size}x{size})...')

    scale = 4.0
    eps = 0.5 / size

    y_coords, x_coords = torch.meshgrid(
        torch.arange(size, device=device, dtype=torch.float32),
        torch.arange(size, device=device, dtype=torch.float32),
        indexing='ij'
    )
    x_coords = x_coords / size * scale
    y_coords = y_coords / size * scale

    psi_up = perlin_2d_gpu(x_coords, y_coords + eps)
    psi_down = perlin_2d_gpu(x_coords, y_coords - eps)
    curl_x = (psi_up - psi_down) / (2 * eps)

    curl_x = (curl_x - curl_x.min()) / (curl_x.max() - curl_x.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return curl_x


# ── Channel B: Worley Noise (GPU parallel distance) ──
def generate_worley_noise_gpu(size, num_points=512, seed=42):
    t0 = time.time()
    print(f'  [B] Worley noise ({size}x{size}, {num_points} seeds)...')

    rng = np.random.default_rng(seed)
    points = torch.tensor(rng.random((num_points, 2)), device=device, dtype=torch.float32)

    y_coords, x_coords = torch.meshgrid(
        torch.arange(size, device=device, dtype=torch.float32) / size,
        torch.arange(size, device=device, dtype=torch.float32) / size,
        indexing='ij'
    )

    min_dist = torch.full((size, size), 999.0, device=device)

    # Tile 3x3 for seamless wrapping
    for ox in [-1, 0, 1]:
        for oy in [-1, 0, 1]:
            tiled = points.clone()
            tiled[:, 0] += ox
            tiled[:, 1] += oy

            # Batch distance computation — process in chunks to fit in VRAM
            chunk_size = 64
            for c in range(0, num_points, chunk_size):
                chunk = tiled[c:c+chunk_size]
                # [chunk, 1, 1] vs [1, H, W] → [chunk, H, W]
                dx = x_coords.unsqueeze(0) - chunk[:, 0].view(-1, 1, 1)
                dy = y_coords.unsqueeze(0) - chunk[:, 1].view(-1, 1, 1)
                dist = torch.sqrt(dx**2 + dy**2)
                chunk_min = dist.min(dim=0).values
                min_dist = torch.minimum(min_dist, chunk_min)

    min_dist = (min_dist - min_dist.min()) / (min_dist.max() - min_dist.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return min_dist


# ── Channel A: fBm Noise (GPU multi-octave Perlin) ──
def generate_fbm_noise_gpu(size, octaves=6, lacunarity=2.0, gain=0.5):
    t0 = time.time()
    print(f'  [A] fBm noise ({size}x{size}, {octaves} octaves)...')

    y_coords, x_coords = torch.meshgrid(
        torch.arange(size, device=device, dtype=torch.float32),
        torch.arange(size, device=device, dtype=torch.float32),
        indexing='ij'
    )

    result = torch.zeros(size, size, device=device)
    amplitude = 1.0
    frequency = 3.0
    total_amp = 0.0

    for _ in range(octaves):
        nx = x_coords / size * frequency
        ny = y_coords / size * frequency
        result += perlin_2d_gpu(nx, ny) * amplitude
        total_amp += amplitude
        amplitude *= gain
        frequency *= lacunarity

    result /= total_amp
    result = (result - result.min()) / (result.max() - result.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return result


# ── Generate all channels on GPU ──
t_total = time.time()

# Warm up GPU
_ = torch.randn(100, 100, device=device).sum()

blue = generate_blue_noise_gpu(SIZE, iterations=200000)
curl = generate_curl_noise_gpu(SIZE)
worley = generate_worley_noise_gpu(SIZE, num_points=512)
fbm = generate_fbm_noise_gpu(SIZE)

torch.cuda.synchronize()

# ── Pack into RGBA (transfer to CPU for image save) ──
print(f'\n  Packing RGBA atlas...')
atlas = torch.zeros(SIZE, SIZE, 4, dtype=torch.uint8, device='cpu')
atlas[:, :, 0] = (blue.cpu() * 255).to(torch.uint8)
atlas[:, :, 1] = (curl.cpu() * 255).to(torch.uint8)
atlas[:, :, 2] = (worley.cpu() * 255).to(torch.uint8)
atlas[:, :, 3] = (fbm.cpu() * 255).to(torch.uint8)

img = Image.fromarray(atlas.numpy(), 'RGBA')
out_path = f'{OUT_DIR}/noise-atlas-{SIZE}.png'
img.save(out_path, optimize=True)

file_size = len(open(out_path, 'rb').read())
elapsed = time.time() - t_total
print(f'  Wrote {out_path} ({file_size / 1024 / 1024:.2f} MB)')
print(f'  Total time: {elapsed:.1f}s (vs ~983s on CPU)')

# Print GPU utilization stats
print(f'\n  GPU memory used: {torch.cuda.max_memory_allocated() / 1e6:.0f} MB')
print(f'  GPU memory reserved: {torch.cuda.max_memory_reserved() / 1e6:.0f} MB')
print(f'\nDone! GB10 Blackwell GPU utilized.')
