#!/usr/bin/env python3
"""
compute-atmosphere-lut-gpu.py — GPU-accelerated atmospheric scattering LUT.

Bruneton 2008 / Hillaire 2020 style Rayleigh + Mie single-scattering LUT.
256×128 RGBA: view_zenith × sun_zenith → RGB scattering + transmittance alpha.

Runs on NVIDIA GB10 Blackwell GPU via PyTorch CUDA tensors.
"""

import torch
import numpy as np
from PIL import Image
import sys
import time

OUT_DIR = '.'
for i, arg in enumerate(sys.argv[1:], 1):
    if arg == '--out' and i < len(sys.argv) - 1:
        OUT_DIR = sys.argv[i + 1]

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'\n=== GPU Atmosphere LUT Generator (256x128) ===')
print(f'    Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"})\n')

t0 = time.time()

# ── Physical constants (Earth atmosphere) ──
R_EARTH = 6.371e6       # Earth radius (m)
R_ATMO = 6.471e6        # Atmosphere top (100km above surface)
H_RAYLEIGH = 8500.0     # Rayleigh scale height (m)
H_MIE = 1200.0          # Mie scale height (m)

# Scattering coefficients at sea level
BETA_R = torch.tensor([5.8e-6, 13.5e-6, 33.1e-6], device=device)  # Rayleigh (wavelength dependent)
BETA_M = torch.tensor([21e-6, 21e-6, 21e-6], device=device)        # Mie (wavelength independent)
G_MIE = 0.76  # Mie asymmetry parameter

LUT_W, LUT_H = 256, 128
NUM_SAMPLES = 64        # Integration steps along view ray
NUM_LIGHT_SAMPLES = 16  # Integration steps toward sun

PI = torch.tensor(3.14159265358979, device=device)


def ray_sphere_intersect(origin_h, dir_y, sphere_r):
    """Ray-sphere intersection from point at height origin_h above center, direction with y-component dir_y."""
    # Simplified for radial symmetry: origin at (0, R_EARTH + origin_h, 0)
    # Direction: (sqrt(1-dir_y^2), dir_y, 0)
    a = 1.0  # normalized direction
    b = 2.0 * (R_EARTH + origin_h) * dir_y
    c = (R_EARTH + origin_h)**2 - sphere_r**2
    disc = b**2 - 4*a*c
    disc = torch.clamp(disc, min=0)
    t = (-b + torch.sqrt(disc)) / (2*a)
    return torch.clamp(t, min=0)


def compute_lut():
    """Compute scattering LUT on GPU with full vectorization."""
    # Parameterize: x = view zenith cos [−1, 1], y = sun zenith cos [0, 1]
    view_cos = torch.linspace(-1.0, 1.0, LUT_W, device=device)  # cos(view zenith)
    sun_cos = torch.linspace(0.0, 1.0, LUT_H, device=device)    # cos(sun zenith)

    # Create 2D grid [H, W]
    sun_grid, view_grid = torch.meshgrid(sun_cos, view_cos, indexing='ij')

    # View ray direction (in local frame, y=up)
    view_sin = torch.sqrt(torch.clamp(1.0 - view_grid**2, min=1e-8))

    # Ray marching: integrate scattering along view ray through atmosphere
    t_max = ray_sphere_intersect(torch.tensor(0.0, device=device), view_grid, R_ATMO)

    result_r = torch.zeros(LUT_H, LUT_W, 3, device=device)
    transmittance = torch.ones(LUT_H, LUT_W, 3, device=device)

    dt = t_max / NUM_SAMPLES  # [H, W]

    for i in range(NUM_SAMPLES):
        t = (i + 0.5) * dt  # [H, W]

        # Position along ray
        sample_y = (R_EARTH) + t * view_grid  # y component
        sample_x = t * view_sin               # x component
        height = torch.sqrt(sample_x**2 + sample_y**2) - R_EARTH
        height = torch.clamp(height, min=0, max=R_ATMO - R_EARTH)

        # Density at this height
        rho_r = torch.exp(-height / H_RAYLEIGH)  # [H, W]
        rho_m = torch.exp(-height / H_MIE)

        # Optical depth along sun direction from this point
        # Simplified: use analytical approximation for sun transmittance
        sun_height_factor = height / (R_ATMO - R_EARTH)
        sun_path = 1.0 / (sun_grid + 0.15 + 0.017 * sun_height_factor)  # Chapman approx
        sun_path = torch.clamp(sun_path, max=40.0)

        tau_sun_r = BETA_R.view(1, 1, 3) * H_RAYLEIGH * sun_path.unsqueeze(-1) * rho_r.unsqueeze(-1)
        tau_sun_m = BETA_M.view(1, 1, 3) * H_MIE * sun_path.unsqueeze(-1) * rho_m.unsqueeze(-1)

        sun_transmittance = torch.exp(-(tau_sun_r + tau_sun_m))

        # Scattering contribution
        scatter_r = BETA_R.view(1, 1, 3) * rho_r.unsqueeze(-1) * dt.unsqueeze(-1)
        scatter_m = BETA_M.view(1, 1, 3) * rho_m.unsqueeze(-1) * dt.unsqueeze(-1)

        # Phase functions
        cos_theta = view_grid * sun_grid + view_sin * torch.sqrt(torch.clamp(1.0 - sun_grid**2, min=1e-8))

        # Rayleigh phase: (3/16pi)(1 + cos^2(theta))
        phase_r = (3.0 / (16.0 * PI)) * (1.0 + cos_theta**2)

        # Mie phase: Henyey-Greenstein
        denom = 1.0 + G_MIE**2 - 2.0 * G_MIE * cos_theta
        phase_m = (1.0 - G_MIE**2) / (4.0 * PI * denom.pow(1.5))

        # Accumulate
        in_scatter = sun_transmittance * (scatter_r * phase_r.unsqueeze(-1) + scatter_m * phase_m.unsqueeze(-1))
        result_r += transmittance * in_scatter

        # Update transmittance along view ray
        tau_view = (BETA_R.view(1, 1, 3) * rho_r.unsqueeze(-1) + BETA_M.view(1, 1, 3) * rho_m.unsqueeze(-1)) * dt.unsqueeze(-1)
        transmittance *= torch.exp(-tau_view)

    return result_r, transmittance


print('  Computing Rayleigh + Mie scattering on GPU...')
scattering, transmittance = compute_lut()
torch.cuda.synchronize()

# Tone map and normalize
# Apply exposure
exposure = 15.0
scattering = 1.0 - torch.exp(-scattering * exposure)

# Pack to RGBA image
lut_rgba = torch.zeros(LUT_H, LUT_W, 4, dtype=torch.uint8, device='cpu')
scatter_cpu = (torch.clamp(scattering, 0, 1).cpu() * 255).to(torch.uint8)
trans_cpu = (torch.clamp(transmittance.mean(dim=-1), 0, 1).cpu() * 255).to(torch.uint8)

lut_rgba[:, :, 0] = scatter_cpu[:, :, 0]  # R
lut_rgba[:, :, 1] = scatter_cpu[:, :, 1]  # G
lut_rgba[:, :, 2] = scatter_cpu[:, :, 2]  # B
lut_rgba[:, :, 3] = trans_cpu             # A = transmittance

img = Image.fromarray(lut_rgba.numpy(), 'RGBA')
out_path = f'{OUT_DIR}/atmosphere-lut.png'
img.save(out_path, optimize=True)

elapsed = time.time() - t0
file_size = len(open(out_path, 'rb').read())
print(f'  Wrote {out_path} ({file_size / 1024:.1f} KB)')
print(f'  Total time: {elapsed:.1f}s')
print(f'  GPU memory used: {torch.cuda.max_memory_allocated() / 1e6:.0f} MB')
print(f'\nDone! Physically-based atmospheric scattering computed on GB10.')
