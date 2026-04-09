#!/usr/bin/env python3
"""
compute-atmosphere-lut.py — Pre-compute atmospheric scattering LUT on DGX Spark.

Based on Bruneton 2008 / Hillaire 2020 single-scattering model.
Generates a 256×128 RGBA PNG lookup table:
  X axis = view zenith cosine (-1 to 1, mapped 0-255)
  Y axis = sun zenith cosine (-1 to 1, mapped 0-127)
  RGB = inscattered light color
  A = optical depth (transmittance)

The browser loads this as a texture and replaces 3 atmosphere shell meshes
(~460 lines of fake rim-glow shaders) with a single texture lookup.

Usage: python3 compute-atmosphere-lut.py [--out /path/to/output]
"""

import numpy as np
from PIL import Image
import sys
import time

OUT_DIR = '.'
for i, arg in enumerate(sys.argv[1:], 1):
    if arg == '--out' and i < len(sys.argv) - 1:
        OUT_DIR = sys.argv[i + 1]

print('\n=== Atmospheric Scattering LUT Generator ===\n')

# ── Physical Constants (Earth-like) ──
R_PLANET = 6.371e6        # Earth radius (m)
R_ATMO = 6.471e6          # Atmosphere top (100km above surface)
H_RAYLEIGH = 8500.0       # Rayleigh scale height (m)
H_MIE = 1200.0            # Mie scale height (m)

# Scattering coefficients at sea level (per meter)
BETA_R = np.array([5.8e-6, 13.5e-6, 33.1e-6])  # Rayleigh (RGB, 680/550/440nm)
BETA_M = np.array([21e-6, 21e-6, 21e-6])        # Mie (wavelength-independent)
MIE_G = 0.76  # Mie asymmetry parameter (forward scattering)

NUM_SAMPLES = 32      # Integration samples along view ray
NUM_LIGHT_SAMPLES = 8  # Integration samples toward sun

LUT_W = 256
LUT_H = 128

def ray_sphere_intersect(origin_h, dir_cos_zenith, sphere_r):
    """
    Intersect ray from (0, R_PLANET + origin_h) going at angle dir_cos_zenith
    with sphere of radius sphere_r. Returns distance to intersection or -1.
    """
    r = R_PLANET + origin_h
    # Ray: P = (0, r) + t * (sin(theta), cos(theta))
    # |P|² = sphere_r²
    # Solve quadratic: t² + 2*r*cos(theta)*t + r² - sphere_r² = 0
    b = 2.0 * r * dir_cos_zenith
    c = r * r - sphere_r * sphere_r
    discriminant = b * b - 4.0 * c

    if discriminant < 0:
        return -1.0
    sqrt_d = np.sqrt(discriminant)
    t0 = (-b - sqrt_d) / 2.0
    t1 = (-b + sqrt_d) / 2.0

    if t1 < 0:
        return -1.0
    return t1 if t0 < 0 else t0


def compute_scattering(view_cos, sun_cos):
    """
    Compute single-scattering for a given view zenith angle and sun zenith angle.
    Returns (inscattered_rgb, transmittance).
    """
    # View ray starts at surface
    origin_h = 0.0

    # Distance through atmosphere along view direction
    t_max = ray_sphere_intersect(origin_h, view_cos, R_ATMO)
    if t_max < 0:
        return np.zeros(3), 1.0

    # Step along view ray
    ds = t_max / NUM_SAMPLES

    # Sun direction (in 2D, sun_cos is cos of zenith angle)
    sun_dir_y = sun_cos
    sun_dir_x = np.sqrt(max(0, 1.0 - sun_cos * sun_cos))

    # View direction
    view_dir_y = view_cos
    view_dir_x = np.sqrt(max(0, 1.0 - view_cos * view_cos))

    # Phase function angle: dot(view_dir, sun_dir)
    cos_theta = view_dir_x * sun_dir_x + view_dir_y * sun_dir_y

    # Rayleigh phase: 3/(16π) * (1 + cos²θ)
    phase_r = 3.0 / (16.0 * np.pi) * (1.0 + cos_theta * cos_theta)

    # Mie phase (Henyey-Greenstein): (1-g²) / (4π(1+g²-2g·cosθ)^1.5)
    g = MIE_G
    denom = 1.0 + g * g - 2.0 * g * cos_theta
    phase_m = (1.0 - g * g) / (4.0 * np.pi * denom * np.sqrt(max(denom, 1e-6)))

    # Integrate along view ray
    total_r = np.zeros(3)
    total_m = np.zeros(3)
    optical_depth_r = 0.0
    optical_depth_m = 0.0

    for i in range(NUM_SAMPLES):
        # Position along view ray (midpoint sampling)
        t = (i + 0.5) * ds

        # Height at this point
        px = view_dir_x * t
        py = R_PLANET + view_dir_y * t
        height = np.sqrt(px * px + py * py) - R_PLANET

        if height < 0:
            height = 0
        if height > R_ATMO - R_PLANET:
            continue

        # Local density
        hr = np.exp(-height / H_RAYLEIGH)
        hm = np.exp(-height / H_MIE)

        # Accumulate optical depth along view ray
        optical_depth_r += hr * ds
        optical_depth_m += hm * ds

        # Optical depth from this point toward the sun
        # Approximate: check if sun ray hits the planet
        norm = np.sqrt(px * px + py * py)
        local_sun_cos = (px * sun_dir_x + py * sun_dir_y) / norm

        t_sun = ray_sphere_intersect(height, local_sun_cos, R_ATMO)
        if t_sun < 0:
            continue

        # Check if sun ray intersects planet
        t_ground = ray_sphere_intersect(height, local_sun_cos, R_PLANET)
        if t_ground > 0 and t_ground < t_sun:
            continue  # In shadow

        # Light optical depth (simplified: fewer samples)
        ds_light = t_sun / NUM_LIGHT_SAMPLES
        od_light_r = 0.0
        od_light_m = 0.0

        for j in range(NUM_LIGHT_SAMPLES):
            t_l = (j + 0.5) * ds_light
            lx = px + sun_dir_x * t_l
            ly = py + sun_dir_y * t_l
            lh = np.sqrt(lx * lx + ly * ly) - R_PLANET
            if lh < 0:
                lh = 0
            od_light_r += np.exp(-lh / H_RAYLEIGH) * ds_light
            od_light_m += np.exp(-lh / H_MIE) * ds_light

        # Total transmittance from sun through atmosphere to this point and back to camera
        tau = BETA_R * (optical_depth_r + od_light_r) + BETA_M * 1.1 * (optical_depth_m + od_light_m)
        attenuation = np.exp(-tau)

        total_r += hr * ds * attenuation
        total_m += hm * ds * attenuation

    # Final inscattered light
    inscattered = (total_r * BETA_R * phase_r + total_m * BETA_M * phase_m) * 20.0  # Sun intensity

    # View transmittance
    tau_view = BETA_R * optical_depth_r + BETA_M * 1.1 * optical_depth_m
    transmittance = np.mean(np.exp(-tau_view))

    return inscattered, transmittance


# ── Generate LUT ──
t0 = time.time()
print(f'  Computing {LUT_W}×{LUT_H} LUT ({NUM_SAMPLES} view samples, {NUM_LIGHT_SAMPLES} light samples)...')

lut = np.zeros((LUT_H, LUT_W, 4), dtype=np.float64)

for yi in range(LUT_H):
    sun_cos = -1.0 + 2.0 * yi / (LUT_H - 1)  # -1 (below horizon) to 1 (zenith)
    for xi in range(LUT_W):
        view_cos = -1.0 + 2.0 * xi / (LUT_W - 1)  # -1 (nadir) to 1 (zenith)

        inscattered, transmittance = compute_scattering(view_cos, sun_cos)

        lut[yi, xi, 0:3] = inscattered
        lut[yi, xi, 3] = transmittance

    if yi % 16 == 0:
        print(f'    Row {yi}/{LUT_H} ({100 * yi / LUT_H:.0f}%)')

# ── Tone-map and save ──
# Normalize RGB to [0, 1] range
rgb_max = lut[:, :, 0:3].max()
if rgb_max > 0:
    lut[:, :, 0:3] /= rgb_max

# Apply gamma for better precision in 8-bit
lut[:, :, 0:3] = np.power(np.clip(lut[:, :, 0:3], 0, 1), 1.0 / 2.2)

# Convert to uint8
lut_u8 = np.zeros((LUT_H, LUT_W, 4), dtype=np.uint8)
lut_u8[:, :, 0:3] = (np.clip(lut[:, :, 0:3], 0, 1) * 255).astype(np.uint8)
lut_u8[:, :, 3] = (np.clip(lut[:, :, 3], 0, 1) * 255).astype(np.uint8)

img = Image.fromarray(lut_u8, 'RGBA')
out_path = f'{OUT_DIR}/atmosphere-lut.png'
img.save(out_path)

file_size = len(open(out_path, 'rb').read())
elapsed = time.time() - t0
print(f'\n  Wrote {out_path} ({file_size / 1024:.1f} KB)')
print(f'  Total time: {elapsed:.1f}s')

# Also save metadata for the shader
meta_path = f'{OUT_DIR}/atmosphere-lut-meta.txt'
with open(meta_path, 'w') as f:
    f.write(f'width={LUT_W}\n')
    f.write(f'height={LUT_H}\n')
    f.write(f'x_axis=view_zenith_cos (-1 to 1)\n')
    f.write(f'y_axis=sun_zenith_cos (-1 to 1)\n')
    f.write(f'rgb=inscattered light (gamma 2.2)\n')
    f.write(f'alpha=transmittance (linear)\n')
    f.write(f'rgb_max={rgb_max}\n')
print(f'  Wrote {meta_path}')
print('\nDone!')
