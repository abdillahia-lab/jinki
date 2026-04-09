#!/usr/bin/env node
/**
 * prebake-globe.mjs — Pre-compute globe dot cloud geometry on DGX Spark.
 *
 * Generates binary attribute buffers for the GlobeCanvas component,
 * replacing ~130 lines of runtime JavaScript computation.
 *
 * Usage: node prebake-globe.mjs [--mask land-mask.png]
 * Output: globe-desktop.bin (100k dots), globe-tablet.bin (38k dots)
 */

import { readFileSync, writeFileSync } from 'fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Minimal Color class (replaces THREE.Color) ──
class Color {
  constructor(hex) {
    if (hex) this.set(hex);
    else { this.r = 0; this.g = 0; this.b = 0; }
  }
  set(hex) {
    if (typeof hex === 'string') {
      hex = hex.replace('#', '');
      this.r = parseInt(hex.substring(0, 2), 16) / 255;
      this.g = parseInt(hex.substring(2, 4), 16) / 255;
      this.b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    return this;
  }
  clone() {
    const c = new Color();
    c.r = this.r; c.g = this.g; c.b = this.b;
    return c;
  }
  lerp(other, t) {
    this.r += (other.r - this.r) * t;
    this.g += (other.g - this.g) * t;
    this.b += (other.b - this.b) * t;
    return this;
  }
  static lerpColors(a, b, t) {
    const c = new Color();
    c.r = a.r + (b.r - a.r) * t;
    c.g = a.g + (b.g - a.g) * t;
    c.b = a.b + (b.b - a.b) * t;
    return c;
  }
  add(other) {
    this.r += other.r;
    this.g += other.g;
    this.b += other.b;
    return this;
  }
  multiplyScalar(s) {
    this.r *= s; this.g *= s; this.b *= s;
    return this;
  }
}

// ── Land Mask ──
const maskPath = process.argv.includes('--mask')
  ? process.argv[process.argv.indexOf('--mask') + 1]
  : join(__dirname, 'land-mask-256x128.png');

console.log(`Loading land mask: ${maskPath}`);
const maskImg = await loadImage(readFileSync(maskPath));
const MASK_W = maskImg.width;
const MASK_H = maskImg.height;
console.log(`Land mask resolution: ${MASK_W}×${MASK_H}`);

const maskCanvas = createCanvas(MASK_W, MASK_H);
const maskCtx = maskCanvas.getContext('2d');
maskCtx.drawImage(maskImg, 0, 0, MASK_W, MASK_H);
const landData = maskCtx.getImageData(0, 0, MASK_W, MASK_H).data;

function isLand(lat, lng) {
  const u = Math.floor(((lng + 180) / 360) * MASK_W) % MASK_W;
  const v = Math.floor(((90 - lat) / 180) * MASK_H);
  const clampV = Math.max(0, Math.min(MASK_H - 1, v));
  return landData[(clampV * MASK_W + u) * 4] / 255;
}

function isCoastal(lat, lng) {
  const stepLat = 180 / MASK_H;
  const stepLng = 360 / MASK_W;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1],[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]];
  for (const [dy, dx] of dirs) {
    if (isLand(lat + dy * stepLat, lng + dx * stepLng) < 0.3) return true;
  }
  return false;
}

function smoothClamp(t) { return Math.max(0, Math.min(1, t)); }

// ── Brand Colors ──
const cAccent = new Color('00e5ff');
const cSecondary = new Color('7B61FF');
const cTertiary = new Color('34D399');

const cityCoords = [
  [40.7, -74.0], [51.5, -0.1], [35.7, 139.7], [22.3, 114.2],
  [48.9, 2.35], [1.35, 103.8], [-33.9, 151.2], [25.3, 55.3],
];

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const ANGLE_INC = Math.PI * 2 * GOLDEN_RATIO;

function generateDots(DOT_COUNT) {
  console.log(`Generating ${DOT_COUNT.toLocaleString()} dots...`);
  const t0 = performance.now();

  const dotPositions = new Float32Array(DOT_COUNT * 3);
  const dotSizes = new Float32Array(DOT_COUNT);
  const dotOpacities = new Float32Array(DOT_COUNT);
  const dotPhases = new Float32Array(DOT_COUNT);
  const dotColors = new Float32Array(DOT_COUNT * 3);
  const dotCityGlow = new Float32Array(DOT_COUNT);
  const dotRandom = new Float32Array(DOT_COUNT * 3);

  for (let i = 0; i < DOT_COUNT; i++) {
    const t = i / DOT_COUNT;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = ANGLE_INC * i;

    const x = Math.sin(inclination) * Math.cos(azimuth);
    const y = Math.cos(inclination);
    const z = Math.sin(inclination) * Math.sin(azimuth);

    const lat = 90 - (inclination * 180 / Math.PI);
    const lng = (azimuth * 180 / Math.PI) % 360 - 180;
    const landFactor = isLand(lat, lng);

    const jitterSeed = Math.sin(i * 127.1) * Math.cos(i * 311.7);
    const jitterNoise = jitterSeed * 0.004;
    let elevation;
    const coast = landFactor > 0.5 && isCoastal(lat, lng);
    if (coast) {
      elevation = 1.012 + jitterNoise;
    } else if (landFactor > 0.5) {
      const terrainHeight = (Math.sin(i * 0.23) * Math.cos(i * 0.41) * 0.5 + 0.5);
      elevation = 1.005 + terrainHeight * 0.006 + jitterNoise;
    } else {
      elevation = 1.0 + jitterNoise * 0.5;
    }
    dotPositions[i * 3] = x * elevation;
    dotPositions[i * 3 + 1] = y * elevation;
    dotPositions[i * 3 + 2] = z * elevation;

    const noise = Math.sin(i * 0.1) * Math.cos(i * 0.07) * 0.5 + 0.5;
    const latBrightness = 1.0 - Math.abs(lat) / 90 * 0.2;

    if (coast) {
      dotSizes[i] = 2.8 + noise * 0.9;
      dotOpacities[i] = 1.7 * latBrightness;
    } else if (landFactor > 0.5) {
      const texNoise = Math.sin(i * 0.71) * Math.cos(i * 0.43) * 0.5 + 0.5;
      dotSizes[i] = 0.9 + noise * 0.6 + texNoise * 0.25;
      dotOpacities[i] = (0.55 + noise * 0.25 + texNoise * 0.15) * latBrightness;
    } else {
      const coastProximity = isCoastal(lat, lng) ? 0.02 : 0;
      const currentFlow = Math.sin(lat * 0.08) * Math.cos(lng * 0.06 + lat * 0.03) * 0.5 + 0.5;
      const majorCurrent = Math.sin(lat * 0.04 + lng * 0.02) * Math.cos(lat * 0.06 - lng * 0.03) * 0.5 + 0.5;
      const currentBright = majorCurrent > 0.6 ? (majorCurrent - 0.6) * 0.04 : 0;
      const oceanBase = 0.018 + noise * 0.015 + currentFlow * 0.01 + currentBright;
      dotSizes[i] = 0.1 + noise * 0.08 + currentFlow * 0.05;
      dotOpacities[i] = oceanBase + coastProximity;
    }
    dotPhases[i] = i * 2.399;

    // Per-particle random for spiral dispersal
    dotRandom[i * 3] = Math.sin(i * 127.1 + 1.0) * 0.5 + 0.5;
    dotRandom[i * 3 + 1] = Math.sin(i * 311.7 + 2.0) * 0.5 + 0.5;
    dotRandom[i * 3 + 2] = Math.sin(i * 543.3 + 3.0) * 0.5 + 0.5;

    const latFactor = Math.abs(y);
    let c;
    if (coast) {
      c = Color.lerpColors(cAccent, new Color('ffffff'), 0.65);
    } else if (landFactor > 0.5) {
      const terrainNoise = Math.sin(i * 0.37) * Math.cos(i * 0.19) * 0.5 + 0.5;
      const terrainHeight = (Math.sin(i * 0.23) * Math.cos(i * 0.41) * 0.5 + 0.5);
      const moistureNoise = Math.sin(i * 0.53) * Math.cos(i * 0.31) * 0.5 + 0.5;
      const lowlandGreen = new Color('1a6b4a');
      const denseForest = new Color('0d4a30');
      const midlandAccent = Color.lerpColors(cAccent, cTertiary, 0.4);
      const aridSand = new Color('C4A44A');
      const highlandGold = new Color('D4A843');
      const snowPeak = new Color('c8d8e8');
      const absLat2 = Math.abs(lat);
      const isArid = absLat2 < 35 && absLat2 > 10 && moistureNoise < 0.35;
      const isTropical = absLat2 < 25 && moistureNoise > 0.55;
      if (terrainHeight < 0.3) {
        if (isTropical) {
          c = Color.lerpColors(denseForest, lowlandGreen, terrainHeight / 0.3);
        } else if (isArid) {
          c = Color.lerpColors(aridSand, highlandGold, terrainHeight / 0.3);
        } else {
          c = Color.lerpColors(lowlandGreen, midlandAccent, terrainHeight / 0.3);
        }
      } else if (terrainHeight < 0.7) {
        c = Color.lerpColors(midlandAccent, highlandGold, (terrainHeight - 0.3) / 0.4);
        if (isArid) c.lerp(aridSand, 0.3);
      } else {
        c = Color.lerpColors(highlandGold, snowPeak, (terrainHeight - 0.7) / 0.3);
      }
      if (latFactor < 0.4 && terrainNoise > 0.6) c.lerp(highlandGold, (terrainNoise - 0.6) * 0.4);
      if (latFactor > 0.55) c.lerp(cSecondary, (latFactor - 0.55) * 0.5);
      dotOpacities[i] *= (1.0 + terrainHeight * 0.12);
    } else {
      const oceanDeep = new Color('081620');
      const oceanMid = new Color('0e3050');
      const oceanShallow = new Color('104060');
      const oceanAccent = cAccent.clone().multiplyScalar(0.15);
      c = Color.lerpColors(oceanDeep, oceanMid, noise);
      if (isCoastal(lat, lng)) c.lerp(oceanShallow, 0.3);
      const corridorNoise = Math.sin(lat * 0.08) * Math.cos(lng * 0.06) * 0.5 + 0.5;
      if (corridorNoise > 0.6) c.add(oceanAccent);
    }
    // Polar ice caps
    const absLat = Math.abs(lat);
    if (absLat > 65) {
      const polarFactor = smoothClamp((absLat - 65) / 20);
      const iceWhite = new Color('d8e8f8');
      c.lerp(iceWhite, polarFactor * 0.7);
      dotOpacities[i] = Math.max(dotOpacities[i], (0.4 + polarFactor * 0.5) * (landFactor > 0.3 ? 1.0 : 0.6));
      dotSizes[i] = Math.max(dotSizes[i], 0.6 + polarFactor * 0.5);
    }

    dotColors[i * 3] = c.r;
    dotColors[i * 3 + 1] = c.g;
    dotColors[i * 3 + 2] = c.b;

    // City glow
    let maxCityGlow = 0;
    if (landFactor > 0.3) {
      for (const [cLat, cLng] of cityCoords) {
        const dLat = lat - cLat;
        const dLng = lng - cLng;
        const dist2 = dLat * dLat + dLng * dLng;
        const glow = Math.exp(-dist2 / 65);
        if (glow > maxCityGlow) maxCityGlow = glow;
      }
    }
    dotCityGlow[i] = maxCityGlow;
  }

  const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
  console.log(`  Generated in ${elapsed}s`);

  // ── Write Binary ──
  // Format: [uint32 DOT_COUNT] [positions] [sizes] [opacities] [phases] [colors] [cityGlow] [random]
  const totalBytes = 4 +
    DOT_COUNT * 3 * 4 + // positions
    DOT_COUNT * 4 +     // sizes
    DOT_COUNT * 4 +     // opacities
    DOT_COUNT * 4 +     // phases
    DOT_COUNT * 3 * 4 + // colors
    DOT_COUNT * 4 +     // cityGlow
    DOT_COUNT * 3 * 4;  // random

  const buffer = Buffer.alloc(totalBytes);
  let offset = 0;

  // Write DOT_COUNT as uint32 LE
  buffer.writeUInt32LE(DOT_COUNT, offset); offset += 4;

  // Write each Float32Array
  const arrays = [dotPositions, dotSizes, dotOpacities, dotPhases, dotColors, dotCityGlow, dotRandom];
  for (const arr of arrays) {
    Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).copy(buffer, offset);
    offset += arr.byteLength;
  }

  return buffer;
}

// ── Generate both sizes ──
const outputDir = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : __dirname;

console.log('\n=== Globe Pre-Bake ===\n');

const desktopBuf = generateDots(200000);
const desktopPath = join(outputDir, 'globe-desktop.bin');
writeFileSync(desktopPath, desktopBuf);
console.log(`  Wrote ${desktopPath} (${(desktopBuf.length / 1024 / 1024).toFixed(2)} MB)\n`);

const tabletBuf = generateDots(75000);
const tabletPath = join(outputDir, 'globe-tablet.bin');
writeFileSync(tabletPath, tabletBuf);
console.log(`  Wrote ${tabletPath} (${(tabletBuf.length / 1024 / 1024).toFixed(2)} MB)\n`);

console.log('Done!');
