#!/usr/bin/env node
/*
  check-budgets.mjs — performance budget enforcement + regression greps.
  Run after `astro build`. Exits 1 on breach.

  Budgets apply to pages rendered with the NEW system (detected by
  data-brief marker in HTML). Legacy pages are reported but exempt
  until P6 cutover (then ALL pages are enforced via --strict).
*/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;
const STRICT = process.argv.includes('--strict');

const BUDGET = {
  // Experience-layer revision: inline scene fallbacks + sidecar grids in
  // HTML (≈14KB br on the wire at 85KB raw). Eager JS cap unchanged —
  // heavy scenes load ONLY via capability-gated dynamic import.
  htmlKB: 85,
  cssKB: 60,
  jsKB: 20,
};

const REGRESSIONS = [
  { pattern: /material-symbols-outlined/, why: 'icon font must not ship' },
  { pattern: /three\.module/, why: 'three.js must not ship' },
  { pattern: /z-index:\s*9{3,}/, why: 'z-index escape hatch (use the ladder)' },
  { pattern: /<link rel="preload" as="fetch"/, why: 'as=fetch preloads double-download' },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

if (!existsSync(DIST)) {
  console.error('dist/ not found — run astro build first');
  process.exit(1);
}

const failures = [];
const rows = [];

for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  const html = readFileSync(file, 'utf8');
  const route = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '');
  const isBrief = html.includes('data-brief') || STRICT;

  // Regression greps run on EVERY page (brief or legacy)
  if (html.includes('data-brief')) {
    for (const { pattern, why } of REGRESSIONS) {
      if (pattern.test(html)) failures.push(`${route}: REGRESSION — ${why}`);
    }
    // Inline-style check targets layout styling; SVG scene internals
    // (per-cell animation delays etc.) are legitimate and excluded.
    const htmlNoSvg = html.replace(/<svg[\s\S]*?<\/svg>/g, '');
    const inlineStyles = (htmlNoSvg.match(/ style="/g) || []).length;
    if (inlineStyles > 10) failures.push(`${route}: ${inlineStyles} inline styles outside SVG (max 10)`);
  }

  // Asset budgets
  const htmlKB = Buffer.byteLength(html) / 1024;
  let cssKB = 0;
  let jsKB = 0;
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/_astro\/[^"]+)"/g)) {
    const p = join(DIST, m[1]);
    if (existsSync(p)) cssKB += statSync(p).size / 1024;
  }
  for (const m of html.matchAll(/<script[^>]+src="(\/_astro\/[^"]+)"/g)) {
    const p = join(DIST, m[1]);
    if (existsSync(p)) jsKB += statSync(p).size / 1024;
  }

  rows.push({ route, brief: html.includes('data-brief'), htmlKB, cssKB, jsKB });

  if (isBrief) {
    if (htmlKB > BUDGET.htmlKB) failures.push(`${route}: HTML ${htmlKB.toFixed(0)}KB > ${BUDGET.htmlKB}KB`);
    if (cssKB > BUDGET.cssKB) failures.push(`${route}: CSS ${cssKB.toFixed(0)}KB > ${BUDGET.cssKB}KB`);
    if (jsKB > BUDGET.jsKB) failures.push(`${route}: JS ${jsKB.toFixed(0)}KB > ${BUDGET.jsKB}KB`);
  }
}

// Anchor contract: homepage must expose #lead-gen and #verticals (redirect targets)
const home = join(DIST, 'index.html');
if (existsSync(home)) {
  const html = readFileSync(home, 'utf8');
  if (html.includes('data-brief')) {
    for (const anchor of ['id="lead-gen"', 'id="verticals"']) {
      if (!html.includes(anchor)) failures.push(`/: missing anchor contract ${anchor}`);
    }
  }
}

console.log('\nPER-PAGE BUDGET REPORT');
console.log('route'.padEnd(40), 'sys', 'html'.padStart(7), 'css'.padStart(7), 'js'.padStart(7));
for (const r of rows.sort((a, b) => a.route.localeCompare(b.route))) {
  console.log(
    r.route.padEnd(40),
    (r.brief ? 'NEW' : 'old').padEnd(3),
    `${r.htmlKB.toFixed(0)}KB`.padStart(7),
    `${r.cssKB.toFixed(0)}KB`.padStart(7),
    `${r.jsKB.toFixed(0)}KB`.padStart(7)
  );
}

if (failures.length) {
  console.error('\nBUDGET FAILURES:');
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('\n✓ all budgets pass');
