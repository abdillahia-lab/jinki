#!/usr/bin/env node
/*
  generate-og.mjs — OG cards as intelligence frames (W6).
  SVG template -> sharp raster. Every share on LinkedIn/Slack reads as
  operator output: ink field, registration ticks, folio index, title,
  thermal band. No satori needed — sharp rasterizes the SVG directly.
  Run: npm run gen:og   (outputs committed to public/images/og/)
*/
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = new URL('../public/images/og', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { file: 'og-homepage', index: 'JK', label: 'AERIAL INTELLIGENCE', title: ['Every anomaly. Found,', 'ranked, delivered', 'in 48 hours.'] },
  { file: 'og-data-centers', index: '01', label: 'DATA CENTERS', title: ['Find the hidden problem', 'before the outage.'] },
  { file: 'og-energy-grid', index: '02', label: 'ENERGY GRID', title: ['Find the failing component', 'before the outage finds you.'] },
  { file: 'og-security', index: '03', label: 'PERIMETER SECURITY', title: ['Your perimeter has gaps.', 'We close them.'] },
  { file: 'og-agriculture', index: '04', label: 'AGRICULTURE', title: ['Your fields are talking.', 'Now you can listen.'] },
  { file: 'og-real-estate', index: '05', label: 'REAL ESTATE', title: ['Photography for the', 'listings that move.'] },
  { file: 'og-intelligence-scan', index: 'S1', label: 'FACILITY INTELLIGENCE SCAN', title: ['One mission. Total', 'facility intelligence.'] },
  { file: 'og-deployment', index: 'S2', label: 'AUTONOMOUS DEPLOYMENT', title: ['Persistent intelligence.', 'Zero intervention.'] },
  { file: 'og-sample-report', index: 'SR', label: 'SAMPLE REPORT', title: ['Read the deliverable before', 'you buy the engagement.'] },
  { file: 'og-about', index: 'AB', label: 'ABOUT', title: ['Infrastructure fails quietly.', 'We listen from above.'] },
  { file: 'og-status', index: 'OPS', label: 'OPERATIONS STATUS', title: ['Systems, plainly stated.'] },
  { file: 'og-default', index: 'JK', label: 'JINKI AERIAL INTELLIGENCE', title: ['Aerial intelligence for', 'critical infrastructure.'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svgFor(p) {
  const titleLines = p.title
    .map((line, i) => `<text x="80" y="${300 + i * 78}" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="500" letter-spacing="-2" fill="#F4F4F2">${esc(line)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#0A0A0A"/>
    <!-- registration ticks -->
    <g stroke="#4a4a48" stroke-width="2.5" fill="none">
      <path d="M24 60 V24 H60"/><path d="M1140 24 H1176 V60"/>
      <path d="M1176 570 V606 H1140"/><path d="M60 606 H24 V570"/>
    </g>
    <!-- folio -->
    <line x1="80" y1="120" x2="1120" y2="120" stroke="#3a3a38" stroke-width="2"/>
    <text x="80" y="100" font-family="Courier, monospace" font-size="28" letter-spacing="4" fill="#FF4F00">${esc(p.index)}</text>
    <text x="${80 + (p.index.length + 1) * 22 + 20}" y="100" font-family="Courier, monospace" font-size="28" letter-spacing="4" fill="#8a8a86">/ ${esc(p.label)}</text>
    ${titleLines}
    <!-- footer line -->
    <text x="80" y="560" font-family="Courier, monospace" font-size="22" letter-spacing="3" fill="#8a8a86">JINKI.AI · RADIOMETRIC THERMAL · 48 HR REPORT</text>
    <!-- thermal band -->
    <defs>
      <linearGradient id="ramp" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0A0A0A"/><stop offset=".18" stop-color="#2B0B5E"/>
        <stop offset=".38" stop-color="#8B1E9B"/><stop offset=".62" stop-color="#E33F1E"/>
        <stop offset=".8" stop-color="#FF8A00"/><stop offset=".92" stop-color="#FFD24A"/>
        <stop offset="1" stop-color="#FFF8E0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="624" width="1200" height="6" fill="url(#ramp)"/>
  </svg>`;
}

for (const p of PAGES) {
  await sharp(Buffer.from(svgFor(p))).png({ compressionLevel: 9 }).toFile(join(OUT, `${p.file}.png`));
  console.log(p.file + '.png');
}
console.log('og frames done ->', OUT);
