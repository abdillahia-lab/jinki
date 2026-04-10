#!/usr/bin/env python3
"""
Process NASA textures for Globe v6 "The Eye"
- Day: resize + WebP
- Night: recolor through LWIR thermal LUT (Jinki cyan palette) + WebP
- Topo: Sobel normal map + WebP
- Clouds: alpha transparency + WebP
- Specular: ocean mask from day texture + WebP
"""

from PIL import Image, ImageFilter
import numpy as np
import os

SRC = '/tmp/globe-textures'
DST = os.path.join(os.path.dirname(__file__), '..', 'public', 'textures')
os.makedirs(DST, exist_ok=True)

TARGET_W, TARGET_H = 4096, 2048
NIGHT_W, NIGHT_H = 4096, 2048
CLOUD_W, CLOUD_H = 2048, 1024

def save_webp(img, name, quality=85):
    path = os.path.join(DST, name)
    img.save(path, 'WEBP', quality=quality)
    size = os.path.getsize(path) / 1024
    print(f'  {name}: {img.size[0]}x{img.size[1]} ({size:.0f}KB)')

# === 1. Day Texture ===
print('Processing day texture...')
day = Image.open(os.path.join(SRC, 'earth-day-raw.jpg')).resize((TARGET_W, TARGET_H), Image.LANCZOS)
save_webp(day, 'earth-day.webp', quality=82)

# === 2. Night Thermal (LWIR false-color) ===
print('Processing thermal night texture...')
night = Image.open(os.path.join(SRC, 'earth-night-raw.jpg')).resize((NIGHT_W, NIGHT_H), Image.LANCZOS)
night_arr = np.array(night).astype(np.float32)

# Convert to grayscale luminance (city lights intensity)
lum = 0.299 * night_arr[:,:,0] + 0.587 * night_arr[:,:,1] + 0.114 * night_arr[:,:,2]

# Apply LWIR thermal LUT: cold black → deep indigo → teal → cyan → white
# Temperature levels:
#   0.0 → #0A0F1C (cold black)
#   0.15 → #1A2744 (deep indigo)
#   0.35 → #0088AA (teal)
#   0.6 → #00E5FF (brand cyan)
#   0.85 → #66F0FF (bright cyan)
#   1.0 → #FFFFFF (white-hot)

# Normalize luminance to 0-1 with gamma for more visible detail
lum_norm = np.clip(lum / 255.0, 0, 1)
# Apply gamma to expand dim city lights into visible range
lum_norm = np.power(lum_norm, 0.45)

# LUT control points
lut_points = [
    (0.00, (10, 15, 28)),      # #0A0F1C cold black
    (0.08, (26, 39, 68)),      # #1A2744 deep indigo
    (0.20, (0, 80, 120)),      # #005078 dark teal
    (0.40, (0, 136, 170)),     # #0088AA teal
    (0.60, (0, 200, 230)),     # #00C8E6 bright teal
    (0.75, (0, 229, 255)),     # #00E5FF brand cyan
    (0.88, (102, 240, 255)),   # #66F0FF bright cyan
    (1.00, (255, 255, 255)),   # #FFFFFF white-hot
]

# Build per-channel LUT arrays (256 entries)
lut_r = np.zeros(256)
lut_g = np.zeros(256)
lut_b = np.zeros(256)
for i in range(256):
    t = i / 255.0
    # Find surrounding control points
    for j in range(len(lut_points) - 1):
        t0, c0 = lut_points[j]
        t1, c1 = lut_points[j + 1]
        if t0 <= t <= t1:
            frac = (t - t0) / (t1 - t0) if t1 > t0 else 0
            lut_r[i] = c0[0] + (c1[0] - c0[0]) * frac
            lut_g[i] = c0[1] + (c1[1] - c0[1]) * frac
            lut_b[i] = c0[2] + (c1[2] - c0[2]) * frac
            break
    else:
        lut_r[i] = lut_points[-1][1][0]
        lut_g[i] = lut_points[-1][1][1]
        lut_b[i] = lut_points[-1][1][2]

# Apply LUT
lum_idx = np.clip((lum_norm * 255).astype(np.int32), 0, 255)
thermal = np.zeros((*lum_idx.shape, 3), dtype=np.uint8)
thermal[:,:,0] = lut_r[lum_idx].astype(np.uint8)
thermal[:,:,1] = lut_g[lum_idx].astype(np.uint8)
thermal[:,:,2] = lut_b[lum_idx].astype(np.uint8)

thermal_img = Image.fromarray(thermal)
save_webp(thermal_img, 'earth-thermal.webp', quality=85)

# === 3. Normal Map from Topography ===
print('Processing normal map...')
topo = Image.open(os.path.join(SRC, 'earth-topo-raw.jpg')).convert('L').resize((TARGET_W, TARGET_H), Image.LANCZOS)
topo_arr = np.array(topo).astype(np.float32) / 255.0

# Sobel filter for gradient
from scipy.ndimage import sobel
dx = sobel(topo_arr, axis=1) * 2.0  # Horizontal gradient
dy = sobel(topo_arr, axis=0) * 2.0  # Vertical gradient

# Normal = normalize(-dx, -dy, 1)
normals = np.zeros((*topo_arr.shape, 3), dtype=np.float32)
normals[:,:,0] = -dx
normals[:,:,1] = -dy
normals[:,:,2] = 1.0
length = np.sqrt(normals[:,:,0]**2 + normals[:,:,1]**2 + normals[:,:,2]**2)
normals[:,:,0] /= length
normals[:,:,1] /= length
normals[:,:,2] /= length

# Pack to RGB: [-1,1] → [0,255]
normal_rgb = ((normals + 1.0) * 0.5 * 255).astype(np.uint8)
normal_img = Image.fromarray(normal_rgb)
save_webp(normal_img, 'earth-normal.webp', quality=90)  # Lossless-ish for normal precision

# === 4. Specular Map (ocean mask) ===
print('Processing specular map...')
# Oceans in Blue Marble are dark blue/black, land is brighter
day_arr = np.array(day).astype(np.float32)
# Simple heuristic: ocean where blue > red and saturation is low
r, g, b = day_arr[:,:,0], day_arr[:,:,1], day_arr[:,:,2]
brightness = (r + g + b) / 3.0
# Ocean: darker overall, bluer
ocean_mask = ((b > r * 0.9) & (brightness < 100)).astype(np.float32)
# Smooth the mask
from scipy.ndimage import gaussian_filter
ocean_mask = gaussian_filter(ocean_mask, sigma=2)
ocean_mask = np.clip(ocean_mask * 255, 0, 255).astype(np.uint8)

# Resize to 2K (specular doesn't need full res)
spec_img = Image.fromarray(ocean_mask).resize((2048, 1024), Image.LANCZOS)
save_webp(spec_img, 'earth-specular.webp', quality=80)

# === 5. Cloud Texture ===
print('Processing cloud texture...')
clouds = Image.open(os.path.join(SRC, 'earth-clouds-raw.jpg')).resize((CLOUD_W, CLOUD_H), Image.LANCZOS)
# Convert to grayscale for alpha, keep white for color
cloud_arr = np.array(clouds.convert('L')).astype(np.float32)
# Boost contrast — clouds should be white, clear sky transparent
cloud_alpha = np.clip((cloud_arr - 40) * 1.5, 0, 255).astype(np.uint8)
# Create RGBA: white color, variable alpha
cloud_rgba = np.zeros((*cloud_alpha.shape, 4), dtype=np.uint8)
cloud_rgba[:,:,0] = 255  # R
cloud_rgba[:,:,1] = 255  # G
cloud_rgba[:,:,2] = 255  # B
cloud_rgba[:,:,3] = cloud_alpha
cloud_img = Image.fromarray(cloud_rgba, 'RGBA')
save_webp(cloud_img, 'earth-clouds.webp', quality=80)

print('\nAll textures processed!')
print(f'Output directory: {DST}')
