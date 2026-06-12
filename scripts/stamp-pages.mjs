#!/usr/bin/env node
/*
  stamp-pages.mjs — the page-weight stamp (W6/C3 honesty artifact).
  Post-build: compute each page's shipped weight (HTML + its CSS/JS
  assets) and write it into the footer's [data-page-stamp] slot:
  "THIS PAGE 51KB · 0 TRACKERS". Engineering discipline as trust signal.
*/
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let stamped = 0;
for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  let html = readFileSync(file, 'utf8');
  if (!html.includes('data-page-stamp')) continue;

  let bytes = Buffer.byteLength(html);
  for (const m of html.matchAll(/(?:href|src)="(\/_astro\/[^"]+\.(?:css|js))"/g)) {
    const p = join(DIST, m[1]);
    if (existsSync(p)) bytes += statSync(p).size;
  }
  const kb = Math.round(bytes / 1024);
  html = html.replace(
    /(<p[^>]*data-page-stamp[^>]*>)([^<]*)(<\/p>)/,
    `$1THIS PAGE ${kb} KB · 0 TRACKERS$3`
  );
  writeFileSync(file, html);
  stamped++;
}
console.log(`stamped ${stamped} pages`);
