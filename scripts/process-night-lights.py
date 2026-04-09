#!/usr/bin/env python3
"""
process-night-lights.py — Download and process NASA night lights for globe shader.

Downloads NASA Black Marble (VIIRS) night lights composite, processes to
2048×1024 grayscale with noise thresholding for clean city light display.

Usage: python3 process-night-lights.py [--out /path/to/output]
       python3 process-night-lights.py --input local-file.jpg [--out /path/to/output]
"""

import numpy as np
from PIL import Image, ImageFilter
import sys
import time
import os

OUT_DIR = '.'
INPUT_FILE = None
TARGET_W = 2048
TARGET_H = 1024

for i, arg in enumerate(sys.argv[1:], 1):
    if arg == '--out' and i < len(sys.argv) - 1:
        OUT_DIR = sys.argv[i + 1]
    elif arg == '--input' and i < len(sys.argv) - 1:
        INPUT_FILE = sys.argv[i + 1]
    elif arg == '--width' and i < len(sys.argv) - 1:
        TARGET_W = int(sys.argv[i + 1])

print('\n=== NASA Night Lights Processor ===\n')

# ── Load source ──
if INPUT_FILE and os.path.exists(INPUT_FILE):
    print(f'  Loading local file: {INPUT_FILE}')
    src = Image.open(INPUT_FILE)
else:
    # Try to download NASA Black Marble
    import urllib.request
    urls = [
        # NASA VIIRS Black Marble 2016 composite (small version)
        'https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg',
        # Alternative: lower resolution
        'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg',
        # Fallback: even smaller
        'https://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/earth_lights_lrg.jpg',
    ]
    src = None
    for url in urls:
        print(f'  Trying: {url}')
        try:
            fname = os.path.join(OUT_DIR, 'nasa-nightlights-raw.jpg')
            urllib.request.urlretrieve(url, fname)
            src = Image.open(fname)
            print(f'    Downloaded: {src.size[0]}×{src.size[1]}')
            break
        except Exception as e:
            print(f'    Failed: {e}')

    if src is None:
        print('ERROR: Could not download night lights. Generating synthetic fallback.')
        # Generate synthetic night lights from city coordinates
        src_arr = np.zeros((TARGET_H, TARGET_W), dtype=np.uint8)
        cities = [
            (40.7, -74.0, 1.0),    # NYC
            (51.5, -0.1, 0.9),     # London
            (35.7, 139.7, 1.0),    # Tokyo
            (22.3, 114.2, 0.8),    # Hong Kong
            (48.9, 2.35, 0.85),    # Paris
            (1.35, 103.8, 0.7),    # Singapore
            (-33.9, 151.2, 0.6),   # Sydney
            (25.3, 55.3, 0.7),     # Dubai
            (19.4, -99.1, 0.8),    # Mexico City
            (28.6, 77.2, 0.9),     # Delhi
            (23.1, 113.3, 0.85),   # Guangzhou
            (37.5, 127.0, 0.8),    # Seoul
            (-23.5, -46.6, 0.85),  # São Paulo
            (39.9, 116.4, 0.9),    # Beijing
            (34.1, -118.2, 0.9),   # Los Angeles
            (41.9, -87.6, 0.7),    # Chicago
            (55.8, 37.6, 0.8),     # Moscow
            (30.0, 31.2, 0.7),     # Cairo
            (35.2, 136.9, 0.7),    # Nagoya
            (13.8, 100.5, 0.7),    # Bangkok
            (31.2, 121.5, 0.9),    # Shanghai
            (-34.6, -58.4, 0.7),   # Buenos Aires
            (52.5, 13.4, 0.7),     # Berlin
            (41.0, 29.0, 0.7),     # Istanbul
            (6.5, 3.4, 0.7),       # Lagos
        ]
        for lat, lng, intensity in cities:
            # Equirectangular projection
            x = int(((lng + 180) / 360) * TARGET_W) % TARGET_W
            y = int(((90 - lat) / 180) * TARGET_H)
            y = max(0, min(TARGET_H - 1, y))
            # Gaussian splat
            for dy in range(-40, 41):
                for dx in range(-60, 61):
                    px = (x + dx) % TARGET_W
                    py = max(0, min(TARGET_H - 1, y + dy))
                    dist2 = dx * dx + dy * dy
                    val = intensity * 255 * np.exp(-dist2 / 400.0)
                    src_arr[py, px] = min(255, src_arr[py, px] + int(val))
        src = Image.fromarray(src_arr, 'L')

t0 = time.time()

# ── Process ──
print(f'  Processing to {TARGET_W}×{TARGET_H}...')

# Convert to grayscale if RGB
if src.mode != 'L':
    # For night lights, use luminance (green channel dominates)
    rgb = np.array(src.convert('RGB').resize((TARGET_W, TARGET_H), Image.LANCZOS))
    # Weighted luminance emphasizing warm city light tones
    gray = (rgb[:, :, 0] * 0.35 + rgb[:, :, 1] * 0.45 + rgb[:, :, 2] * 0.20).astype(np.float64)
else:
    gray = np.array(src.resize((TARGET_W, TARGET_H), Image.LANCZOS)).astype(np.float64)

# ── Noise reduction: threshold low values (sensor noise) ──
# City lights are bright (>20 in raw), background noise is <10
threshold = 12
gray[gray < threshold] = 0

# ── Contrast enhancement: stretch remaining values ──
mask = gray > 0
if mask.any():
    lo = np.percentile(gray[mask], 5)
    hi = np.percentile(gray[mask], 99)
    gray = np.clip((gray - lo) / (hi - lo), 0, 1) * 255
    gray[~mask] = 0

# ── Slight blur to smooth pixel edges ──
img = Image.fromarray(gray.astype(np.uint8), 'L')
img = img.filter(ImageFilter.GaussianBlur(radius=1.0))

# ── Apply gamma curve (brighten mid-tones for better shader response) ──
arr = np.array(img).astype(np.float64) / 255.0
arr = np.power(arr, 0.7)  # Gamma < 1 brightens
arr = (arr * 255).astype(np.uint8)

out = Image.fromarray(arr, 'L')
out_path = f'{OUT_DIR}/night-lights-{TARGET_W}.png'
out.save(out_path, optimize=True)

file_size = os.path.getsize(out_path)
elapsed = time.time() - t0
print(f'\n  Wrote {out_path} ({file_size / 1024:.1f} KB)')
print(f'  Total time: {elapsed:.1f}s')

# Stats
nonzero = np.count_nonzero(arr)
total = arr.size
print(f'  Lit pixels: {nonzero}/{total} ({100 * nonzero / total:.1f}%)')
print(f'  Expected: ~5-10% (populated land areas at night)')
print('\nDone!')
