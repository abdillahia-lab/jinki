#!/usr/bin/env node
/**
 * Convert globe textures from PNG to WebP for ~68% size reduction.
 * Run: node scripts/optimize-textures.mjs
 * Requires: npm install sharp (dev dependency)
 */
import sharp from 'sharp';
import { statSync } from 'fs';
import { join } from 'path';

const dir = new URL('../public/textures', import.meta.url).pathname;

const files = [
  { name: 'noise-atlas-1024', lossy: true, q: 85 },
  { name: 'terrain-normals-2048', lossy: false }, // Lossless — normal maps are sensitive
  { name: 'night-lights-2048', lossy: true, q: 90 },
  { name: 'color-lut-64', lossy: false }, // Lossless — LUT precision matters
  { name: 'atmosphere-lut', lossy: false },
];

for (const f of files) {
  const src = join(dir, `${f.name}.png`);
  const dst = join(dir, `${f.name}.webp`);
  const opts = f.lossy ? { quality: f.q } : { lossless: true };
  await sharp(src).webp(opts).toFile(dst);
  const origSize = statSync(src).size;
  const newSize = statSync(dst).size;
  const pct = ((1 - newSize / origSize) * 100).toFixed(0);
  console.log(`${f.name}: ${(origSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${pct}% reduction)`);
}
console.log('\nDone! Update GlobeCanvas.astro to load .webp instead of .png');
