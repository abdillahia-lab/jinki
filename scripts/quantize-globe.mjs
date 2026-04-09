#!/usr/bin/env node
/**
 * quantize-globe.mjs — Quantize Float32 globe binaries to Int16/Uint8.
 *
 * Reads existing globe-desktop.bin and globe-tablet.bin (Float32 format),
 * quantizes each attribute to the smallest sufficient type, writes new files.
 *
 * Format v2 header:
 *   [uint32 DOT_COUNT] [uint16 version=2]
 *   Then tightly-packed quantized arrays in order:
 *     positions:  Int16[N*3]   — dequant: val / 32767.0 * posScale
 *     sizes:      Uint16[N]    — dequant: val / 65535.0 * sizeScale + sizeOffset
 *     opacities:  Uint8[N]     — dequant: val / 255.0
 *     phases:     Uint16[N]    — dequant: val / 65535.0 * TWO_PI
 *     colors:     Uint8[N*3]   — dequant: val / 255.0
 *     cityGlow:   Uint8[N]     — dequant: val / 255.0
 *     random:     Int8[N*3]    — dequant: val / 127.0
 *
 * Usage: node scripts/quantize-globe.mjs
 * Output: Overwrites public/globe-desktop.bin and public/globe-tablet.bin
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function quantize(inputPath, outputPath) {
  const data = readFileSync(inputPath);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const N = view.getUint32(0, true);
  console.log(`  Dots: ${N}`);

  // Read original Float32 arrays
  let off = 4;
  const positions = new Float32Array(data.buffer, data.byteOffset + off, N * 3); off += N * 12;
  const sizes     = new Float32Array(data.buffer, data.byteOffset + off, N);     off += N * 4;
  const opacities = new Float32Array(data.buffer, data.byteOffset + off, N);     off += N * 4;
  const phases    = new Float32Array(data.buffer, data.byteOffset + off, N);     off += N * 4;
  const colors    = new Float32Array(data.buffer, data.byteOffset + off, N * 3); off += N * 12;
  const cityGlow  = new Float32Array(data.buffer, data.byteOffset + off, N);     off += N * 4;
  const random    = new Float32Array(data.buffer, data.byteOffset + off, N * 3);

  // Compute ranges for positions and sizes
  let posMin = Infinity, posMax = -Infinity;
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] < posMin) posMin = positions[i];
    if (positions[i] > posMax) posMax = positions[i];
  }
  const posScale = Math.max(Math.abs(posMin), Math.abs(posMax));

  let sizeMin = Infinity, sizeMax = -Infinity;
  for (let i = 0; i < sizes.length; i++) {
    if (sizes[i] < sizeMin) sizeMin = sizes[i];
    if (sizes[i] > sizeMax) sizeMax = sizes[i];
  }
  const sizeScale = sizeMax - sizeMin;
  const sizeOffset = sizeMin;

  // Allocate output
  // Header: 4 (count) + 2 (version) + 4 (posScale) + 4 (sizeScale) + 4 (sizeOffset) = 18 bytes
  const headerSize = 18;
  const bodySize =
    N * 3 * 2 +  // positions Int16
    N * 2 +      // sizes Uint16
    N * 1 +      // opacities Uint8
    N * 2 +      // phases Uint16
    N * 3 * 1 +  // colors Uint8
    N * 1 +      // cityGlow Uint8
    N * 3 * 1;   // random Int8
  const totalBytes = headerSize + bodySize;
  const buf = Buffer.alloc(totalBytes);
  let w = 0;

  // Header
  buf.writeUInt32LE(N, w); w += 4;
  buf.writeUInt16LE(2, w); w += 2;  // version 2
  buf.writeFloatLE(posScale, w); w += 4;
  buf.writeFloatLE(sizeScale, w); w += 4;
  buf.writeFloatLE(sizeOffset, w); w += 4;

  // Positions → Int16 (range [-posScale, posScale] → [-32767, 32767])
  for (let i = 0; i < N * 3; i++) {
    const v = Math.round((positions[i] / posScale) * 32767);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, v)), w); w += 2;
  }

  // Sizes → Uint16 (range [sizeMin, sizeMax] → [0, 65535])
  const sizeInvScale = sizeScale > 0 ? 65535 / sizeScale : 0;
  for (let i = 0; i < N; i++) {
    const v = Math.round((sizes[i] - sizeOffset) * sizeInvScale);
    buf.writeUInt16LE(Math.max(0, Math.min(65535, v)), w); w += 2;
  }

  // Opacities → Uint8 (range [0, 1] → [0, 255])
  for (let i = 0; i < N; i++) {
    buf.writeUInt8(Math.max(0, Math.min(255, Math.round(opacities[i] * 255))), w); w += 1;
  }

  // Phases → Uint16 (range [0, 2π] → [0, 65535])
  const TWO_PI = Math.PI * 2;
  for (let i = 0; i < N; i++) {
    const v = Math.round((phases[i] / TWO_PI) * 65535);
    buf.writeUInt16LE(Math.max(0, Math.min(65535, v)), w); w += 2;
  }

  // Colors → Uint8 (range [0, ~1.5] → [0, 255], clamp)
  for (let i = 0; i < N * 3; i++) {
    const v = Math.round(Math.min(colors[i], 1.0) * 255);
    buf.writeUInt8(Math.max(0, Math.min(255, v)), w); w += 1;
  }

  // CityGlow → Uint8 (range [0, 1] → [0, 255])
  for (let i = 0; i < N; i++) {
    buf.writeUInt8(Math.max(0, Math.min(255, Math.round(cityGlow[i] * 255))), w); w += 1;
  }

  // Random → Int8 (range [-0.5, 0.5] → [-127, 127])
  for (let i = 0; i < N * 3; i++) {
    const v = Math.round(random[i] * 254);  // random is typically [-0.5, 0.5] * some factor
    buf.writeInt8(Math.max(-127, Math.min(127, v)), w); w += 1;
  }

  writeFileSync(outputPath, buf);

  const origSize = data.length;
  const newSize = buf.length;
  const pct = ((1 - newSize / origSize) * 100).toFixed(1);
  console.log(`  ${(origSize / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB (${pct}% reduction)`);
  console.log(`  Bytes/dot: ${(origSize / N).toFixed(0)} → ${((newSize - headerSize) / N).toFixed(0)}`);

  return { origSize, newSize };
}

console.log('\n=== Globe Binary Quantization ===\n');

// Back up originals
import { copyFileSync, existsSync } from 'fs';
const desktopOrig = join(publicDir, 'globe-desktop.f32.bin');
const tabletOrig = join(publicDir, 'globe-tablet.f32.bin');
if (!existsSync(desktopOrig)) {
  copyFileSync(join(publicDir, 'globe-desktop.bin'), desktopOrig);
  copyFileSync(join(publicDir, 'globe-tablet.bin'), tabletOrig);
  console.log('Backed up originals as .f32.bin\n');
}

console.log('Desktop:');
const d = quantize(desktopOrig, join(publicDir, 'globe-desktop.bin'));

console.log('\nTablet:');
const t = quantize(tabletOrig, join(publicDir, 'globe-tablet.bin'));

console.log(`\nTotal: ${((d.origSize + t.origSize) / 1024 / 1024).toFixed(1)}MB → ${((d.newSize + t.newSize) / 1024 / 1024).toFixed(1)}MB`);
console.log('\nDone! Update GlobeCanvas.astro loader to read v2 format.');
