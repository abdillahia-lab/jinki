#!/usr/bin/env python3
"""
compute-normal-map.py — Generate terrain normal map from land mask.

Converts the binary land mask into a height-based normal map using
Sobel gradient operators. Land = elevated, ocean = flat, coastlines = steep slope.

Output: 2048×1024 RGB normal map (tangent-space, OpenGL convention)
  R = Normal X (-1 to 1 → 0 to 255)
  G = Normal Y (-1 to 1 → 0 to 255)
  B = Normal Z (0 to 1 → 128 to 255, always points outward)

Usage: python3 compute-normal-map.py --mask land-mask-2048x1024.png [--out /path]
"""

import numpy as np
from PIL import Image, ImageFilter
import sys
import time
import os

OUT_DIR = '.'
MASK_PATH = None
STRENGTH = 3.0  # Normal map intensity (higher = more pronounced terrain)

for i, arg in enumerate(sys.argv[1:], 1):
    if arg == '--out' and i < len(sys.argv) - 1:
        OUT_DIR = sys.argv[i + 1]
    elif arg == '--mask' and i < len(sys.argv) - 1:
        MASK_PATH = sys.argv[i + 1]
    elif arg == '--strength' and i < len(sys.argv) - 1:
        STRENGTH = float(sys.argv[i + 1])

if not MASK_PATH:
    print('ERROR: --mask required (path to land mask PNG)')
    sys.exit(1)

print('\n=== Terrain Normal Map Generator ===\n')

t0 = time.time()

# ── Load land mask ──
print(f'  Loading mask: {MASK_PATH}')
mask = Image.open(MASK_PATH).convert('L')
W, H = mask.size
print(f'  Mask size: {W}×{H}')

# ── Create height map from land mask ──
# Land = 1.0 (elevated), ocean = 0.0 (flat)
# Blur to create smooth elevation gradient at coastlines
height = np.array(mask).astype(np.float64) / 255.0

# Multi-scale blur for realistic terrain elevation falloff
# Coastlines get a smooth gradient, interior land stays elevated
h_smooth = np.array(Image.fromarray((height * 255).astype(np.uint8), 'L')
                    .filter(ImageFilter.GaussianBlur(radius=6))).astype(np.float64) / 255.0
h_detail = np.array(Image.fromarray((height * 255).astype(np.uint8), 'L')
                    .filter(ImageFilter.GaussianBlur(radius=2))).astype(np.float64) / 255.0

# Combine: smooth base + detail edges
height_map = h_smooth * 0.7 + h_detail * 0.3

# ── Compute normals via Sobel gradient ──
print(f'  Computing Sobel gradients (strength={STRENGTH})...')

# Sobel X (horizontal gradient)
# Wrap horizontally for seamless tiling
padded = np.pad(height_map, ((1, 1), (1, 1)), mode='wrap')

# Sobel kernels
gx = (
    -1 * padded[:-2, :-2] + 1 * padded[:-2, 2:]
    -2 * padded[1:-1, :-2] + 2 * padded[1:-1, 2:]
    -1 * padded[2:, :-2]   + 1 * padded[2:, 2:]
)

gy = (
    -1 * padded[:-2, :-2] - 2 * padded[:-2, 1:-1] - 1 * padded[:-2, 2:]
    +1 * padded[2:, :-2]  + 2 * padded[2:, 1:-1]  + 1 * padded[2:, 2:]
)

# Scale gradients by strength
gx *= STRENGTH
gy *= STRENGTH

# Compute normal vectors
# Normal = normalize(-gx, -gy, 1)
nz = np.ones_like(gx)
length = np.sqrt(gx * gx + gy * gy + nz * nz)
nx = -gx / length
ny = -gy / length
nz = nz / length

# ── Pack into RGB (tangent-space, OpenGL convention) ──
# Map [-1, 1] → [0, 255]
normal_map = np.zeros((H, W, 3), dtype=np.uint8)
normal_map[:, :, 0] = ((nx * 0.5 + 0.5) * 255).astype(np.uint8)  # R = X
normal_map[:, :, 1] = ((ny * 0.5 + 0.5) * 255).astype(np.uint8)  # G = Y
normal_map[:, :, 2] = ((nz * 0.5 + 0.5) * 255).astype(np.uint8)  # B = Z

img = Image.fromarray(normal_map, 'RGB')
out_path = f'{OUT_DIR}/terrain-normals-{W}.png'
img.save(out_path, optimize=True)

file_size = os.path.getsize(out_path)
elapsed = time.time() - t0
print(f'\n  Wrote {out_path} ({file_size / 1024 / 1024:.2f} MB)')
print(f'  Total time: {elapsed:.1f}s')

# Verify: flat areas should be (128, 128, 255) = pointing straight out
center_val = normal_map[H // 2, W // 2]
print(f'  Center pixel normal: ({center_val[0]}, {center_val[1]}, {center_val[2]})')
print(f'  Expected flat: (128, 128, 255)')
print('\nDone!')
