#!/usr/bin/env node
/*
  generate-thermal.mjs — synthesize radiometric-style thermal variants of
  the five hero photos, with hotspots baked at the annotation coordinates
  so imagery, labels, and the cursor temperature readout all agree.

  Two-resolution sensor simulation: decode -> sensor-res (640-class) ->
  physics in a float field (proxy mix, stretch, blobs, FPN noise) ->
  mitchell upscale -> vignette -> edge glow -> dither -> FLIR palette LUT.
  Also emits a 20xN °C sidecar grid per image (src/data/thermal/*.json).

  Run: npm run gen:thermal   (outputs are committed, not built per-deploy)
*/
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const ROOT = new URL('..', import.meta.url).pathname;
const IMG = join(ROOT, 'src/assets/images');
const DATA = join(ROOT, 'src/data/thermal');

/* ---------- palettes: control points [t, r, g, b] ---------- */
const PALETTES = {
  ironbow: [
    [0.00, 0, 0, 12], [0.05, 22, 0, 51], [0.16, 78, 0, 119],
    [0.28, 128, 6, 140], [0.40, 173, 30, 124], [0.52, 207, 58, 89],
    [0.64, 233, 94, 41], [0.75, 248, 133, 7], [0.85, 254, 177, 22],
    [0.93, 255, 220, 95], [1.00, 255, 255, 255],
  ],
  whitehot: [
    [0.00, 6, 7, 10], [0.10, 28, 30, 34], [0.50, 122, 124, 127],
    [0.90, 232, 233, 234], [1.00, 255, 255, 255],
  ],
  arctic: [
    [0.00, 6, 10, 36], [0.18, 14, 51, 124], [0.36, 38, 118, 197],
    [0.52, 110, 178, 226], [0.66, 201, 224, 238], [0.78, 248, 240, 222],
    [0.88, 255, 211, 130], [0.95, 255, 170, 60], [1.00, 255, 248, 230],
  ],
  rainbow: [
    [0.00, 8, 8, 78], [0.14, 4, 56, 168], [0.30, 0, 144, 198],
    [0.44, 44, 196, 130], [0.58, 156, 217, 56], [0.70, 244, 213, 36],
    [0.82, 248, 136, 20], [0.92, 233, 51, 35], [1.00, 255, 255, 255],
  ],
};

function buildLut(points) {
  const lut = new Uint8Array(768);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = points[0], b = points[points.length - 1];
    for (let p = 0; p < points.length - 1; p++) {
      if (t >= points[p][0] && t <= points[p + 1][0]) { a = points[p]; b = points[p + 1]; break; }
    }
    const f = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
    lut[i * 3] = Math.round(a[1] + (b[1] - a[1]) * f);
    lut[i * 3 + 1] = Math.round(a[2] + (b[2] - a[2]) * f);
    lut[i * 3 + 2] = Math.round(a[3] + (b[3] - a[3]) * f);
  }
  return lut;
}

/* ---------- seeded randomness (reproducible builds) ---------- */
function hash(str) { let h = 1779033703; for (const c of str) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
function mulberry32(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(rng) { return Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng()); }

/* ---------- finding-kind resolution from labels ---------- */
const LABEL_RULES = [
  [/MOISTURE STRESS/i, () => ({ kind: 'hot', dt: 5, spread: 1.5 })],
  [/MOISTURE|MEMBRANE/i, () => ({ kind: 'cool', dt: 5 })],
  [/SUBJ.*?([\d.]+)\s*°C/i, (m) => ({ kind: 'abs', t: +m[1], person: true })],
  [/(?:DELTA-T|ΔT)\s*\+([\d.]+)/i, (m) => ({ kind: 'hot', dt: +m[1] })],
  [/\+([\d.]+)\s*°C/i, (m) => ({ kind: 'hot', dt: +m[1] })],
  [/HOT JOINT/i, () => ({ kind: 'hot', dt: 12.4, halo: true })],
  [/VEGETATION/i, () => ({ kind: 'cool', dt: 4, spread: 1.4 })],
  [/COVERAGE GAP|CAM-/i, () => ({ kind: 'none' })],
  [/INSULATOR/i, () => ({ kind: 'hot', dt: 3.5 })],
  [/XFMR|TRANSFORMER/i, () => ({ kind: 'hot', dt: 6 })],
  [/IRRIGATION GAP/i, () => ({ kind: 'hot', dt: 7 })],
  [/CANOPY/i, () => ({ kind: 'hot', dt: 3 })],
  [/TERRACE|HERO ANGLE|LIGHTING|CEILING/i, () => ({ kind: 'hot', dt: 3, spread: 1.4 })],
  [/TWILIGHT|GLAZING|AMENITY/i, () => ({ kind: 'hot', dt: 2.5, spread: 1.5 })],
  [/DRIVE|SCALE FRAME|FLOOR|MARBLE/i, () => ({ kind: 'cool', dt: 2, spread: 1.6 })],
];

function resolveKind(label) {
  for (const [re, fn] of LABEL_RULES) {
    const m = label.match(re);
    if (m) return fn(m);
  }
  return { kind: 'hot', dt: 4 };
}

/* ---------- per-image configuration ----------
   proxy(r,g,b) -> warmth estimate 0-255. Physics notes:
   - sunlit aerials: warm = dark/low-albedo (asphalt hot, white membrane cool);
     vegetation pulled cool via green-excess penalty (evapotranspiration)
   - night scenes: warm = bright (lit/heated structures radiate)
   - baseline range compresses the scene into the lower palette so the
     injected anomalies own the orange/yellow/white top */
const lumOf = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const greenEx = (r, g, b) => Math.max(0, g - (r + b) / 2);

const IMAGES = [
  {
    src: 'dc-rooftop-aerial.webp', slug: 'data-centers', palette: 'ironbow',
    tMin: 18, tMax: 46, gamma: 0.95, range: [0.10, 0.62],
    proxy: (r, g, b) => 255 - 0.82 * lumOf(r, g, b) - 1.6 * greenEx(r, g, b),
    // index.astro heroAnnotations + sample-report (TS literals, baked here too)
    extraFindings: [
      { x: 14, y: 22, w: 17, h: 19, label: 'DELTA-T +14.2' },
      { x: 58, y: 48, w: 14, h: 15, label: '+8 °C CRAH' },
      { x: 38, y: 70, w: 19, h: 12, label: 'MEMBRANE MOISTURE' },
    ],
  },
  {
    src: 'powerline-aerial.webp', slug: 'energy-grid', palette: 'ironbow',
    tMin: 14, tMax: 52, gamma: 0.95, range: [0.10, 0.58],
    // top-down corridor: cleared ROW gravel warm, canopy cool
    proxy: (r, g, b) => 0.9 * lumOf(r, g, b) - 1.5 * greenEx(r, g, b) + 30,
  },
  {
    src: 'facility-night-aerial.webp', slug: 'security', palette: 'whitehot',
    tMin: 2, tMax: 37, gamma: 0.8, range: [0.04, 0.78],
    proxy: (r, g, b) => lumOf(r, g, b),
  },
  {
    src: 'agriculture-fields.jpg', slug: 'agriculture', palette: 'rainbow',
    tMin: 12, tMax: 38, gamma: 0.92, range: [0.12, 0.66], coolTop: 0.12,
    proxy: (r, g, b) => 0.75 * r + 0.15 * g + 0.10 * b,
  },
  {
    src: 'luxury-lobby.webp', slug: 'real-estate', palette: 'arctic',
    tMin: 16, tMax: 34, gamma: 0.9, range: [0.10, 0.74],
    proxy: (r, g, b) => lumOf(r, g, b),
  },
];

function loadFindings(cfg) {
  let anns = [];
  try {
    const y = parse(readFileSync(join(ROOT, 'src/content/verticals', cfg.slug + '.yaml'), 'utf8'));
    anns = (y.frame?.annotations ?? []).map((a) => ({ ...a, ...resolveKind(a.label) }));
  } catch {}
  const extra = (cfg.extraFindings ?? []).map((a) => ({ ...a, ...resolveKind(a.label) }));
  const all = [...anns, ...extra].filter((f) => f.kind !== 'none');
  // dedupe: centers within 6% — keep stronger
  const out = [];
  for (const f of all) {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    const dup = out.find((o) => Math.hypot(o.cx - cx, o.cy - cy) < 6);
    if (dup) { if ((f.dt ?? 0) > (dup.dt ?? 0)) Object.assign(dup, f, { cx, cy }); continue; }
    out.push({ ...f, cx, cy });
  }
  return out;
}

/* separable box blur ×3 ≈ gaussian — thermal diffusion (LWIR has no
   visual texture; surfaces flatten into coherent thermal zones).
   Returns a new array; input untouched. */
function boxBlur(input, W, H, radius) {
  const field = Float32Array.from(input);
  if (radius < 1) return field;
  const tmp = new Float32Array(field.length);
  for (let pass = 0; pass < 3; pass++) {
    // horizontal
    for (let y = 0; y < H; y++) {
      let acc = 0;
      const row = y * W;
      for (let x = -radius; x <= radius; x++) acc += field[row + Math.max(0, Math.min(W - 1, x))];
      for (let x = 0; x < W; x++) {
        tmp[row + x] = acc / (2 * radius + 1);
        const xAdd = Math.min(W - 1, x + radius + 1);
        const xSub = Math.max(0, x - radius);
        acc += field[row + xAdd] - field[row + xSub];
      }
    }
    // vertical
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -radius; y <= radius; y++) acc += tmp[Math.max(0, Math.min(H - 1, y)) * W + x];
      for (let y = 0; y < H; y++) {
        field[y * W + x] = acc / (2 * radius + 1);
        const yAdd = Math.min(H - 1, y + radius + 1);
        const ySub = Math.max(0, y - radius);
        acc += tmp[yAdd * W + x] - tmp[ySub * W + x];
      }
    }
  }
  return field;
}

function addBlob(field, W, H, f, cfg, rng) {
  const spread = f.spread ?? 1;
  const cx = ((f.cx + (rng() - 0.5) * f.w * 0.04) / 100) * W;
  const cy = ((f.cy + (rng() - 0.5) * f.h * 0.04) / 100) * H;
  const jit = 1 + (rng() - 0.5) * 0.2;
  let sx = 0.22 * (f.w / 100) * W * spread * jit;
  let sy = 0.22 * (f.h / 100) * H * spread * jit;
  if (f.person) { sx = 0.10 * (f.w / 100) * W; sy = 0.16 * (f.h / 100) * H; }
  const span = cfg.tMax - cfg.tMin;

  const paint = (SX, SY, scale) => {
    const x0 = Math.max(0, Math.floor(cx - 3 * SX)), x1 = Math.min(W - 1, Math.ceil(cx + 3 * SX));
    const y0 = Math.max(0, Math.floor(cy - 3 * SY)), y1 = Math.min(H - 1, Math.ceil(cy + 3 * SY));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / SX, dy = (y - cy) / SY;
        const g = Math.exp(-(dx * dx + dy * dy) / 2);
        if (g < 0.01) continue;
        const i = y * W + x;
        if (f.kind === 'hot') {
          // 1.6x boost: the anomaly must DETONATE against the calm field
          const A = (f.dt / span) * 255 * 1.6 * scale;
          field[i] += A * g;
        } else if (f.kind === 'cool') {
          const A = (f.dt / span) * 255 * 1.4 * scale;
          field[i] -= A * g;
        } else if (f.kind === 'abs') {
          const target = ((f.t - cfg.tMin) / span) * 255;
          field[i] += (target - field[i]) * Math.min(1, g * 1.5) * scale;
        }
      }
    }
  };
  if (f.halo) { paint(sx * 0.5, sy * 0.5, 1); paint(sx * 1.3, sy * 1.3, 0.3); }
  else paint(sx, sy, 1);
}

async function generate(cfg) {
  const srcPath = join(IMG, cfg.src);
  const meta = await sharp(srcPath).metadata();
  const outW = Math.min(meta.width, 1600);
  const outH = Math.round((outW * meta.height) / meta.width);
  const senW = meta.width >= 1000 ? 640 : 384;
  const senH = Math.round((outH * senW) / outW);

  // A) optics + sensor-res RGB
  const { data: rgb } = await sharp(srcPath)
    .resize(senW, senH).blur(0.6).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // B) sensor-space float field
  const N = senW * senH;
  const field = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    field[i] = Math.max(0, Math.min(255, cfg.proxy(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2])));
  }
  // percentile stretch p2/p98 (raw 0-255; range compression happens after
  // the zones/detail split so the detail term isn't squashed)
  const sorted = Float32Array.from(field).sort();
  const p2 = sorted[Math.floor(N * 0.02)], p98 = sorted[Math.floor(N * 0.98)];
  const span01 = Math.max(1, p98 - p2);
  for (let i = 0; i < N; i++) {
    let l = Math.max(0, Math.min(1, (field[i] - p2) / span01));
    field[i] = Math.pow(l, cfg.gamma) * 255;
  }
  // agriculture: cool the sunrise band at top
  if (cfg.coolTop) {
    const bandH = Math.floor(senH * cfg.coolTop);
    for (let y = 0; y < bandH; y++) {
      const s = 0.6 * (1 - y / bandH);
      for (let x = 0; x < senW; x++) {
        const i = y * senW + x;
        field[i] += (0.25 * 255 - field[i]) * s;
      }
    }
  }
  // Edge-preserving thermal simplification (recipe from parameter sweep):
  // zones = heavy diffusion; detail re-injected only along zone edges.
  // Surfaces flatten like real LWIR, building boundaries stay crisp.
  const smoothR = cfg.smooth ?? Math.max(3, Math.round(senW / 106)); // ~6px @640
  const zones = boxBlur(field, senW, senH, smoothR);
  const k = cfg.detail ?? 0.8;
  const [rLo, rHi] = cfg.range ?? [0.08, 0.55];
  const final = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = i % senW, y = (i / senW) | 0;
    let grad = 0;
    if (x > 0 && x < senW - 1 && y > 0 && y < senH - 1) {
      grad = (Math.abs(zones[i + 1] - zones[i - 1]) + Math.abs(zones[i + senW] - zones[i - senW])) / 2;
    }
    const mask = Math.max(0, Math.min(1, (grad - 2) / 10));
    const detail = Math.max(-25, Math.min(25, field[i] - zones[i]));
    const z = (rLo + (zones[i] / 255) * (rHi - rLo)) * 255;
    final[i] = z + k * detail * (0.3 + 0.7 * mask);
  }
  // blobs AFTER simplification so anomalies stay crisp
  const rng = mulberry32(hash(cfg.src));
  for (const f of loadFindings(cfg)) addBlob(final, senW, senH, f, cfg, rng);

  // C) sidecar grid sampled at sensor res (same field the LUT reads)
  const cols = 20, rows = Math.max(8, Math.round((cols * senH) / senW));
  const grid = [];
  const span = cfg.tMax - cfg.tMin;
  for (let gy = 0; gy < rows; gy++) {
    const row = [];
    for (let gx = 0; gx < cols; gx++) {
      let sum = 0, n = 0;
      const x0 = Math.floor((gx / cols) * senW), x1 = Math.max(x0 + 1, Math.floor(((gx + 1) / cols) * senW));
      const y0 = Math.floor((gy / rows) * senH), y1 = Math.max(y0 + 1, Math.floor(((gy + 1) / rows) * senH));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { sum += final[y * senW + x]; n++; }
      row.push(Math.round((cfg.tMin + (sum / n / 255) * span) * 10) / 10);
    }
    grid.push(row);
  }

  // D) LUT at sensor res, single RGB upscale at encode (the sweep-proven
  // path — no second luminance round-trip, no banding)
  const lut = buildLut(PALETTES[cfg.palette]);
  const rgbOut = new Uint8Array(N * 3);
  for (let i = 0; i < N; i++) {
    const k = Math.max(0, Math.min(255, Math.round(final[i]))) * 3;
    rgbOut[i * 3] = lut[k]; rgbOut[i * 3 + 1] = lut[k + 1]; rgbOut[i * 3 + 2] = lut[k + 2];
  }

  // E/F) encode + sidecar
  const base = cfg.src.replace(/\.(webp|jpg|jpeg|png)$/, '');
  await sharp(rgbOut, { raw: { width: senW, height: senH, channels: 3 } })
    .resize(outW, outH, { kernel: 'mitchell' })
    .webp({ quality: 82, effort: 5 }).toFile(join(IMG, `${base}-thermal.webp`));
  writeFileSync(join(DATA, `${base}.json`), JSON.stringify({
    _note: 'generated by scripts/generate-thermal.mjs — do not edit',
    image: base, palette: cfg.palette, unit: 'C',
    tMin: cfg.tMin, tMax: cfg.tMax, cols, rows, data: grid,
  }));
  console.log(`${base}-thermal.webp  ${outW}x${outH}  ${cfg.palette}  ${cfg.tMin}-${cfg.tMax}°C  findings=${loadFindings(cfg).length}`);
}

mkdirSync(DATA, { recursive: true });
for (const cfg of IMAGES) await generate(cfg);
console.log('done');
