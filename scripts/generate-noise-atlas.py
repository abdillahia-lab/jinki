#!/usr/bin/env python3
"""
generate-noise-atlas.py — Pre-compute multi-channel noise atlas on DGX Spark.

Generates a 1024×1024 RGBA PNG where:
  R = Blue noise (void-and-cluster, perceptually uniform)
  G = Curl noise X component (divergence-free vector field)
  B = Worley noise (cellular/Voronoi distance)
  A = fBm noise (fractal Brownian motion, 6 octaves)

Replaces all fract(sin(dot())) hash noise in GlobeCanvas shaders.

Usage: python3 generate-noise-atlas.py [--size 1024] [--out /path/to/output]
"""

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

print(f'\n=== Noise Atlas Generator ({SIZE}×{SIZE} RGBA) ===\n')


# ── Permutation table for Perlin/Simplex noise ──
def make_perm(seed=42):
    rng = np.random.default_rng(seed)
    p = np.arange(256, dtype=np.int32)
    rng.shuffle(p)
    return np.tile(p, 2)

PERM = make_perm()
GRAD2 = np.array([
    [1,1],[-1,1],[1,-1],[-1,-1],
    [1,0],[-1,0],[0,1],[0,-1],
], dtype=np.float64)


def fade(t):
    return t * t * t * (t * (t * 6 - 15) + 10)

def perlin_2d(x, y):
    """Vectorized 2D Perlin noise for arrays of coordinates."""
    xi = np.floor(x).astype(np.int32) & 255
    yi = np.floor(y).astype(np.int32) & 255
    xf = x - np.floor(x)
    yf = y - np.floor(y)

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


# ── Channel R: Blue Noise (white noise + high-pass iterative swap) ──
def generate_blue_noise(size, iterations=50000, seed=42):
    """Generate blue noise via iterative void-and-cluster approximation."""
    t0 = time.time()
    print(f'  [R] Blue noise ({size}×{size}, {iterations} swaps)...')

    rng = np.random.default_rng(seed)
    # Start with uniform random
    noise = rng.random((size, size), dtype=np.float64)

    # Energy-minimization via random swaps
    # Blue noise minimizes low-frequency energy
    sigma = 1.5  # Gaussian filter radius
    from scipy.ndimage import gaussian_filter

    energy = gaussian_filter(noise, sigma, mode='wrap')

    for it in range(iterations):
        # Find brightest energy point (cluster) and darkest (void)
        if it % 5000 == 0 and it > 0:
            energy = gaussian_filter(noise, sigma, mode='wrap')

        # Random swap approach (faster than full void-cluster)
        y1, x1 = rng.integers(0, size, 2)
        y2, x2 = rng.integers(0, size, 2)

        # Swap if it reduces local energy variance
        e1_before = energy[y1, x1]
        e2_before = energy[y2, x2]
        v1, v2 = noise[y1, x1], noise[y2, x2]

        # Swap values
        noise[y1, x1], noise[y2, x2] = v2, v1

        # Check if energy is more uniform after swap
        energy_new = gaussian_filter(noise, sigma, mode='wrap')
        var_before = np.var(energy)
        var_after = np.var(energy_new)

        if var_after < var_before:
            energy = energy_new
        else:
            # Revert swap
            noise[y1, x1], noise[y2, x2] = v1, v2

    # Normalize to [0, 1]
    noise = (noise - noise.min()) / (noise.max() - noise.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return noise


# ── Channel G: Curl Noise (analytical curl of Perlin potential) ──
def generate_curl_noise(size):
    """Curl of a scalar Perlin potential field → divergence-free 2D vector (X component)."""
    t0 = time.time()
    print(f'  [G] Curl noise X ({size}×{size})...')

    scale = 4.0  # Frequency
    eps = 0.5 / size  # Finite difference step

    y_coords, x_coords = np.mgrid[0:size, 0:size].astype(np.float64)
    x_coords = x_coords / size * scale
    y_coords = y_coords / size * scale

    # Curl_x = dPsi/dy (finite difference of Perlin potential)
    psi_up = perlin_2d(x_coords, y_coords + eps)
    psi_down = perlin_2d(x_coords, y_coords - eps)
    curl_x = (psi_up - psi_down) / (2 * eps)

    # Normalize to [0, 1]
    curl_x = (curl_x - curl_x.min()) / (curl_x.max() - curl_x.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return curl_x


# ── Channel B: Worley Noise (cellular/Voronoi F1 distance) ──
def generate_worley_noise(size, num_points=256, seed=42):
    """F1 Worley noise — distance to nearest feature point."""
    t0 = time.time()
    print(f'  [B] Worley noise ({size}×{size}, {num_points} seeds)...')

    rng = np.random.default_rng(seed)
    # Generate random feature points (tileable via 3×3 repetition)
    points = rng.random((num_points, 2))

    y_coords, x_coords = np.mgrid[0:size, 0:size].astype(np.float64)
    x_coords /= size
    y_coords /= size

    min_dist = np.full((size, size), 999.0)

    # Check 3×3 grid for tileability
    for ox in [-1, 0, 1]:
        for oy in [-1, 0, 1]:
            for p in points:
                px, py = p[0] + ox, p[1] + oy
                dist = np.sqrt((x_coords - px)**2 + (y_coords - py)**2)
                min_dist = np.minimum(min_dist, dist)

    # Normalize to [0, 1]
    min_dist = (min_dist - min_dist.min()) / (min_dist.max() - min_dist.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return min_dist


# ── Channel A: fBm Noise (fractal Brownian motion, 6 octaves) ──
def generate_fbm_noise(size, octaves=6, lacunarity=2.0, gain=0.5):
    """Fractal Brownian motion from summed Perlin octaves."""
    t0 = time.time()
    print(f'  [A] fBm noise ({size}×{size}, {octaves} octaves)...')

    y_coords, x_coords = np.mgrid[0:size, 0:size].astype(np.float64)

    result = np.zeros((size, size), dtype=np.float64)
    amplitude = 1.0
    frequency = 3.0
    total_amp = 0.0

    for _ in range(octaves):
        nx = x_coords / size * frequency
        ny = y_coords / size * frequency
        result += perlin_2d(nx, ny) * amplitude
        total_amp += amplitude
        amplitude *= gain
        frequency *= lacunarity

    result /= total_amp
    # Normalize to [0, 1]
    result = (result - result.min()) / (result.max() - result.min())
    print(f'    Done in {time.time() - t0:.1f}s')
    return result


# ── Generate all channels ──
t_total = time.time()

blue = generate_blue_noise(SIZE, iterations=80000)
curl = generate_curl_noise(SIZE)
worley = generate_worley_noise(SIZE, num_points=384)
fbm = generate_fbm_noise(SIZE)

# ── Pack into RGBA ──
print(f'\n  Packing RGBA atlas...')
atlas = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
atlas[:, :, 0] = (blue * 255).astype(np.uint8)   # R = blue noise
atlas[:, :, 1] = (curl * 255).astype(np.uint8)   # G = curl noise X
atlas[:, :, 2] = (worley * 255).astype(np.uint8)  # B = Worley
atlas[:, :, 3] = (fbm * 255).astype(np.uint8)    # A = fBm

img = Image.fromarray(atlas, 'RGBA')
out_path = f'{OUT_DIR}/noise-atlas-{SIZE}.png'
img.save(out_path, optimize=True)

file_size = len(open(out_path, 'rb').read())
elapsed = time.time() - t_total
print(f'  Wrote {out_path} ({file_size / 1024 / 1024:.2f} MB)')
print(f'  Total time: {elapsed:.1f}s')
print(f'\nDone!')
