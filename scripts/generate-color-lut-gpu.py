#!/usr/bin/env python3
"""
generate-color-lut-gpu.py — GPU-accelerated 3D color grading LUT.

Generates a 64×64×64 3D LUT as a 512×64 strip (8 slices of 64×64 per row).
Encodes the exact color grading pipeline from ColorGradeShader, then enhances
with proper ACES filmic curve and subtle color separation.

Runs on NVIDIA GB10 Blackwell GPU via PyTorch CUDA tensors.
"""

import torch
import numpy as np
from PIL import Image
import sys
import time

LUT_SIZE = 64
OUT_DIR = '.'

for i, arg in enumerate(sys.argv[1:], 1):
    if arg == '--out' and i < len(sys.argv) - 1:
        OUT_DIR = sys.argv[i + 1]

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'\n=== GPU Color Grading LUT Generator ({LUT_SIZE}^3) ===')
print(f'    Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"})\n')

t0 = time.time()

# Generate identity LUT on GPU — all possible RGB values
# Shape: [64, 64, 64, 3] for R, G, B
r = torch.linspace(0, 1, LUT_SIZE, device=device)
g = torch.linspace(0, 1, LUT_SIZE, device=device)
b = torch.linspace(0, 1, LUT_SIZE, device=device)
# Meshgrid: [B, G, R, 3]
rr, gg, bb = torch.meshgrid(r, g, b, indexing='ij')
lut = torch.stack([rr, gg, bb], dim=-1)  # [64, 64, 64, 3]

print('  Applying color grading pipeline on GPU...')

# Flatten for batch processing: [64^3, 3]
flat = lut.reshape(-1, 3)
col = flat.clone()

# ── Replicate the ColorGradeShader grading math ──

# Shadow/highlight tint (from uniforms)
shadow_tint = torch.tensor([0.0, 0.1, 0.18], device=device)
highlight_tint = torch.tensor([0.08, 0.035, 0.0], device=device)
contrast = 1.12
saturation = 1.18

lum = col[:, 0] * 0.2126 + col[:, 1] * 0.7152 + col[:, 2] * 0.0722

# Shadow tint (deeper in darks)
shadow_mask = (1.0 - lum) * (1.0 - lum)
col += shadow_tint.unsqueeze(0) * shadow_mask.unsqueeze(1)

# Highlight tint
highlight_mask = lum * lum
col += highlight_tint.unsqueeze(0) * highlight_mask.unsqueeze(1)

# Midtone punch — S-curve lift
midtone_mask = 1.0 - (lum - 0.4).abs() * 2.5
midtone_mask = midtone_mask.clamp(min=0)
col *= (1.0 + midtone_mask.unsqueeze(1) * 0.08)

# Luminance-adaptive contrast
contrast_lum = col[:, 0] * 0.2126 + col[:, 1] * 0.7152 + col[:, 2] * 0.0722
adaptive_contrast = contrast + (1.0 - contrast_lum) * 0.06
col = (col - 0.5) * adaptive_contrast.unsqueeze(1) + 0.5

# Saturation
grey = lum.unsqueeze(1).expand_as(col)
col = grey + (col - grey) * saturation

# Shadow lift — blue-teal blacks
lift = torch.tensor([0.005, 0.016, 0.032], device=device)
col = (col + lift.unsqueeze(0) * (1.0 - col) * (1.0 - col)).clamp(min=0)

# Deep shadow teal
deep_shadow = torch.zeros_like(lum)
mask = lum < 0.12
deep_shadow[mask] = (0.12 - lum[mask]) / 0.12
col += torch.tensor([-0.003, 0.008, 0.018], device=device).unsqueeze(0) * deep_shadow.unsqueeze(1)

# Midtone teal push
mid_mask = torch.exp(-(lum - 0.35).pow(2) * 12.0)
col[:, 1] += mid_mask * 0.008
col[:, 2] += mid_mask * 0.012

# Filmic tone curve — soft highlight shoulder
tonemapped = col * col / (col * col + 0.09) * 1.15

# Highlight preservation
max_channel = col.max(dim=1).values
hot_mask = ((max_channel - 0.6) / 0.4).clamp(0, 1)
ultra_hot = ((max_channel - 0.85) / 0.35).clamp(0, 1) * 0.08
col = tonemapped * (1 - hot_mask.unsqueeze(1) * 0.38) + col * (1 + ultra_hot.unsqueeze(1)) * (hot_mask.unsqueeze(1) * 0.38)

# Highlight warmth
highlight_mask2 = ((lum - 0.45) / 0.4).clamp(0, 1)
col += torch.tensor([0.018, 0.006, -0.012], device=device).unsqueeze(0) * highlight_mask2.unsqueeze(1)

# Film shoulder compression
max_ch = col.max(dim=1).values
hot_clip = ((max_ch - 0.7) / 0.3).clamp(0, 1)
hot_lum = col[:, 0] * 0.2126 + col[:, 1] * 0.7152 + col[:, 2] * 0.0722
shoulder_warm = torch.stack([hot_lum * 1.02, hot_lum * 0.99, hot_lum * 0.94], dim=1)
col = col * (1 - hot_clip.unsqueeze(1) * 0.35) + shoulder_warm * (hot_clip.unsqueeze(1) * 0.35)

# ── ENHANCEMENT: ACES-inspired filmic curve ──
# Subtle additional toe/shoulder beyond the existing curve
# This is the "premium feel" enhancement
aces_a = 2.51
aces_b = 0.03
aces_c = 2.43
aces_d = 0.59
aces_e = 0.14
# Blend 15% ACES with 85% existing (preserve the look, just enhance)
aces_mapped = (col * (aces_a * col + aces_b)) / (col * (aces_c * col + aces_d) + aces_e)
col = col * 0.85 + aces_mapped.clamp(0, 1) * 0.15

# Specular amber shift on ultra-brights
spec_peak = ((col.max(dim=1).values - 0.85) / 0.25).clamp(0, 1)
col += torch.tensor([0.02, 0.008, -0.015], device=device).unsqueeze(0) * spec_peak.unsqueeze(1)

# Final clamp
col = col.clamp(0, 1)

torch.cuda.synchronize()

# ── Pack into 2D strip: 512×64 (8 slices of 64×64) ──
# Layout: 8 blue-slices across x, 64 pixels each
# Within each slice: R varies across x (0-63), G varies across y (0-63)
print('  Packing 512x64 LUT strip...')

lut_3d = col.reshape(LUT_SIZE, LUT_SIZE, LUT_SIZE, 3)  # [R, G, B, RGB]

# Create strip image: 512 wide (8 * 64), 64 tall
strip_w = LUT_SIZE * (LUT_SIZE // 8)  # 64 * 8 = 512
strip_h = LUT_SIZE  # 64
# Actually for 64^3: we tile 64 blue slices into an 8×8 grid = 512×512
# Standard layout: horizontal strip of 64 slices = 4096×64
# But for WebGL we want manageable size. Use 8×8 grid = 512×512

grid_cols = 8
grid_rows = LUT_SIZE // grid_cols  # 64/8 = 8
strip = torch.zeros(grid_rows * LUT_SIZE, grid_cols * LUT_SIZE, 3, device=device)

for b_idx in range(LUT_SIZE):
    row = b_idx // grid_cols
    col_idx = b_idx % grid_cols
    y_start = row * LUT_SIZE
    x_start = col_idx * LUT_SIZE
    # lut_3d[r, g, b, rgb] — for this blue slice, sweep R (x) and G (y)
    strip[y_start:y_start + LUT_SIZE, x_start:x_start + LUT_SIZE, :] = lut_3d[:, :, b_idx, :]

# Convert to uint8
strip_cpu = (strip.cpu().clamp(0, 1) * 255).to(torch.uint8).numpy()
img = Image.fromarray(strip_cpu, 'RGB')
out_path = f'{OUT_DIR}/color-lut-64.png'
img.save(out_path, optimize=True)

elapsed = time.time() - t0
file_size = len(open(out_path, 'rb').read())
print(f'  Wrote {out_path} ({file_size / 1024:.1f} KB)')
print(f'  LUT: {LUT_SIZE}^3 = {LUT_SIZE**3} entries, {grid_cols}x{grid_rows} grid = {grid_cols*LUT_SIZE}x{grid_rows*LUT_SIZE}px')
print(f'  Total time: {elapsed:.1f}s')
print(f'  GPU memory used: {torch.cuda.max_memory_allocated() / 1e6:.0f} MB')
print(f'\nDone! Cinematic color grading LUT computed on GB10.')
