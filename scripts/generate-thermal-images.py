#!/usr/bin/env python3
"""
Generate LWIR thermal false-color versions of facility images.
Uses the same cyan palette as the globe's thermal night side.
"""
from PIL import Image
import numpy as np
import os

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'images')
DST_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'images')
os.makedirs(DST_DIR, exist_ok=True)

# LWIR thermal LUT — same as globe thermal night
LUT_POINTS = [
    (0.00, (10, 15, 28)),      # Cold black
    (0.10, (18, 30, 55)),      # Deep indigo
    (0.25, (0, 60, 100)),      # Dark teal
    (0.40, (0, 120, 155)),     # Teal
    (0.55, (0, 180, 210)),     # Bright teal
    (0.70, (0, 210, 240)),     # Cyan
    (0.82, (0, 229, 255)),     # Brand cyan #00E5FF
    (0.92, (130, 240, 255)),   # Bright cyan
    (1.00, (255, 255, 255)),   # White-hot
]

def build_lut():
    r, g, b = np.zeros(256), np.zeros(256), np.zeros(256)
    for i in range(256):
        t = i / 255.0
        for j in range(len(LUT_POINTS) - 1):
            t0, c0 = LUT_POINTS[j]
            t1, c1 = LUT_POINTS[j + 1]
            if t0 <= t <= t1:
                f = (t - t0) / (t1 - t0) if t1 > t0 else 0
                r[i] = c0[0] + (c1[0] - c0[0]) * f
                g[i] = c0[1] + (c1[1] - c0[1]) * f
                b[i] = c0[2] + (c1[2] - c0[2]) * f
                break
        else:
            r[i], g[i], b[i] = LUT_POINTS[-1][1]
    return r, g, b

lut_r, lut_g, lut_b = build_lut()

files = [f for f in os.listdir(SRC_DIR) if f.endswith(('.jpg', '.png', '.webp'))]
print(f'Processing {len(files)} facility images...\n')

for fname in files:
    src_path = os.path.join(SRC_DIR, fname)
    name = os.path.splitext(fname)[0]
    dst_path = os.path.join(DST_DIR, f'{name}-thermal.webp')

    img = Image.open(src_path).convert('RGB')
    arr = np.array(img).astype(np.float32)

    # Luminance
    lum = 0.299 * arr[:,:,0] + 0.587 * arr[:,:,1] + 0.114 * arr[:,:,2]
    lum_norm = np.clip(lum / 255.0, 0, 1)
    # Gamma expand for more visible detail in mid-tones
    lum_norm = np.power(lum_norm, 0.5)

    # Apply LUT
    idx = np.clip((lum_norm * 255).astype(np.int32), 0, 255)
    thermal = np.zeros((*idx.shape, 3), dtype=np.uint8)
    thermal[:,:,0] = lut_r[idx].astype(np.uint8)
    thermal[:,:,1] = lut_g[idx].astype(np.uint8)
    thermal[:,:,2] = lut_b[idx].astype(np.uint8)

    thermal_img = Image.fromarray(thermal)
    thermal_img.save(dst_path, 'WEBP', quality=82)
    size_kb = os.path.getsize(dst_path) / 1024
    print(f'  {fname} → {name}-thermal.webp ({size_kb:.0f}KB)')

print('\nDone! Thermal images saved to public/images/')
