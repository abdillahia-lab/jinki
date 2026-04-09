#!/usr/bin/env python3
"""
Convert Natural Earth NE1_LR_LC_SR.tif to a binary land/water mask.

Ocean in Natural Earth is deep blue/black. Land varies (green, brown, white, sand).
Strategy: Convert to grayscale, threshold. Ocean pixels are consistently dark.

Usage: python3 make-landmask.py NE1_LR_LC_SR.tif [output.png] [width] [height]
"""

from PIL import Image
import sys

src_path = sys.argv[1]
out_path = sys.argv[2] if len(sys.argv) > 2 else 'land-mask-2048x1024.png'
width = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
height = int(sys.argv[4]) if len(sys.argv) > 4 else 1024

print(f"Loading {src_path}...")
src = Image.open(src_path)
print(f"Source: {src.size[0]}x{src.size[1]}, mode={src.mode}")

# Convert to RGB if needed, then analyze
rgb = src.convert('RGB').resize((width, height), Image.LANCZOS)
pixels = rgb.load()

# Create grayscale output
mask = Image.new('L', (width, height))
mpix = mask.load()

# NE1_LR_LC_SR: Ocean is near-white (RGB ~251,251,251), land has color/texture
# Land detection: pixel is NOT near-white AND has some color saturation
land_count = 0
for y in range(height):
    for x in range(width):
        r, g, b = pixels[x, y]
        brightness = r * 0.299 + g * 0.587 + b * 0.114
        # Color saturation: how far from gray?
        avg = (r + g + b) / 3.0
        sat = abs(r - avg) + abs(g - avg) + abs(b - avg)
        # Ocean: very bright AND very low saturation (near-white)
        # Land: has color (sat > 5) OR is darker (brightness < 240)
        # Ice/snow: bright but still has slight tint vs pure white ocean
        is_ocean = brightness > 245 and sat < 8
        if is_ocean:
            mpix[x, y] = 0
        else:
            mpix[x, y] = 255
            land_count += 1

total = width * height
print(f"Land: {land_count}/{total} ({100*land_count/total:.1f}%)")
print(f"Expected ~29% land (Earth's surface)")

mask.save(out_path)
print(f"Saved {width}x{height} binary mask to {out_path}")
