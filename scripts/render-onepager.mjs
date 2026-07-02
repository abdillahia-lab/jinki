#!/usr/bin/env node
/* Render Jinki insurance one-pager submissions → PNG (for judging) + PDF
 * (deliverable), then verify font embedding + page count with poppler.
 *
 * Headless Chrome on this machine writes output then hangs on shutdown, so we
 * spawn it detached, poll for the output file, then kill its process group.
 *
 * Usage:
 *   node scripts/render-onepager.mjs                 # all submissions/*.html as authored
 *   node scripts/render-onepager.mjs team-01 team-03 # specific teams
 *   node scripts/render-onepager.mjs --theme=light team-04        # force a theme
 *   node scripts/render-onepager.mjs --src=winner/x.html --out=public/docs --name=jinki-insurance-onepager
 */
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync, existsSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();
const COMP = resolve(ROOT, 'tasks/onepager-competition');
const SUB = resolve(COMP, 'submissions');
const OUT_DEFAULT = resolve(COMP, 'renders');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wait = ms => new Promise(r => setTimeout(r, ms));

const args = process.argv.slice(2);
let theme = null, srcOverride = null, outDir = OUT_DEFAULT, nameOverride = null;
let sizeArg = '816,1056', pngOnly = false;
const ids = [];
for (const a of args) {
  if (a.startsWith('--theme=')) theme = a.split('=')[1];
  else if (a.startsWith('--src=')) srcOverride = resolve(COMP, a.split('=')[1]);
  else if (a.startsWith('--out=')) outDir = resolve(ROOT, a.split('=')[1]);
  else if (a.startsWith('--name=')) nameOverride = a.split('=')[1];
  else if (a.startsWith('--size=')) sizeArg = a.split('=')[1].replace('x', ',');
  else if (a === '--png-only') pngOnly = true;
  else ids.push(a.replace(/\.html$/, ''));
}
mkdirSync(outDir, { recursive: true });

async function renderOne(outPath, extraArgs) {
  const prof = mkdtempSync(resolve(tmpdir(), 'jinki-chrome-'));
  try { rmSync(outPath, { force: true }); } catch {}
  const child = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', `--user-data-dir=${prof}`,
    '--force-device-scale-factor=2', ...extraArgs
  ], { detached: true, stdio: 'ignore' });
  let ok = false;
  for (let i = 0; i < 140; i++) {            // up to ~35s
    await wait(250);
    if (existsSync(outPath) && statSync(outPath).size > 0) { await wait(500); ok = true; break; }
    if (child.exitCode !== null) { ok = existsSync(outPath) && statSync(outPath).size > 0; break; }
  }
  try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} }
  try { rmSync(prof, { recursive: true, force: true }); } catch {}
  return ok;
}

let files;
if (srcOverride) files = [srcOverride];
else if (ids.length) files = ids.map(id => resolve(SUB, id + '.html'));
else files = readdirSync(SUB).filter(f => f.endsWith('.html')).map(f => resolve(SUB, f));

const report = [];
for (const file of files) {
  const baseId = nameOverride || basename(file, '.html');
  if (!existsSync(file)) { report.push({ id: baseId, error: 'missing source' }); continue; }

  let renderFile = file, tmp = null;
  if (theme === 'light' || theme === 'dark') {
    const html = readFileSync(file, 'utf8').replace(/<html([^>]*)>/i, (m, attrs) => {
      attrs = attrs.replace(/\s*data-theme="[^"]*"/i, '');
      return `<html${attrs}${theme === 'light' ? ' data-theme="light"' : ''}>`;
    });
    tmp = resolve(outDir, `.__${baseId}.${theme}.html`);
    writeFileSync(tmp, html); renderFile = tmp;
  }

  const url = 'file://' + renderFile;
  const suffix = theme ? `-${theme}` : '';
  const png = resolve(outDir, `${baseId}${suffix}.png`);
  const pdf = resolve(outDir, `${baseId}${suffix}.pdf`);
  const pngOk = await renderOne(png, [`--window-size=${sizeArg}`, `--screenshot=${png}`, url]);
  if (pngOnly) { if (tmp) { try { rmSync(tmp); } catch {} } report.push({ id: baseId, pngOk, png: png.replace(ROOT + '/', '') }); continue; }
  const pdfOk = await renderOne(pdf, ['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url]);
  let fonts = '', info = '';
  try { fonts = execFileSync('pdffonts', [pdf], { encoding: 'utf8' }); } catch {}
  try { info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }); } catch {}
  const pages = Number((info.match(/Pages:\s*(\d+)/) || [])[1] || 0);
  const brandFonts = [...new Set((fonts.match(/SpaceGrotesk|Inter|JetBrainsMono/gi) || []))];
  const fallbackOnly = /Helvetica|Times|Courier/i.test(fonts) && brandFonts.length === 0;
  if (tmp) { try { rmSync(tmp); } catch {} }
  report.push({ id: baseId, pngOk, pdfOk, pages, brandFonts, fallbackOnly,
    ok: pngOk && pdfOk && pages === 1 && brandFonts.length > 0 && !fallbackOnly,
    png: png.replace(ROOT + '/', ''), pdf: pdf.replace(ROOT + '/', '') });
}
console.log(JSON.stringify(report, null, 2));
const bad = report.filter(r => r.error || r.ok === false);
if (bad.length) console.error(`\n${bad.length} need attention: ` + bad.map(b => b.id).join(', '));
