#!/usr/bin/env node
/* Render Jinki solution-deck slides (landscape 16:9, 13.333in×7.5in = 960×540pt) →
 * per-slide PDF + 2× PNG; verify (1 page, landscape MediaBox, brand fonts embedded);
 * with --assemble, pdfunite the slide PDFs into public/docs/jinki-solution-deck.pdf.
 *
 * Usage:
 *   node scripts/render-deck.mjs               # render all tasks/deck/slides/slide-*.html
 *   node scripts/render-deck.mjs slide-09 slide-13
 *   node scripts/render-deck.mjs --assemble    # render all + merge into the deck PDF
 *
 * Reuses the proven macOS Chrome detached-spawn → poll-for-file → kill-process-group
 * pattern from render-onepager.mjs (Chrome writes output then hangs on shutdown).
 */
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync, existsSync, statSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();
const SLIDES = resolve(ROOT, 'tasks/deck/slides');
const OUT = resolve(ROOT, 'tasks/deck/renders');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wait = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const assemble = args.includes('--assemble');
const ids = args.filter(a => !a.startsWith('--'));

async function renderOne(outPath, extraArgs) {
  const prof = mkdtempSync(resolve(tmpdir(), 'jinki-deck-'));
  try { rmSync(outPath, { force: true }); } catch {}
  const child = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', `--user-data-dir=${prof}`,
    '--force-device-scale-factor=2', ...extraArgs
  ], { detached: true, stdio: 'ignore' });
  let ok = false;
  for (let i = 0; i < 160; i++) {
    await wait(250);
    if (existsSync(outPath) && statSync(outPath).size > 0) { await wait(500); ok = true; break; }
    if (child.exitCode !== null) { ok = existsSync(outPath) && statSync(outPath).size > 0; break; }
  }
  try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} }
  try { rmSync(prof, { recursive: true, force: true }); } catch {}
  return ok;
}

const files = ids.length
  ? ids.map(id => resolve(SLIDES, id.replace(/\.html$/, '') + '.html'))
  : readdirSync(SLIDES).filter(f => /^slide-\d+\.html$/.test(f)).sort().map(f => resolve(SLIDES, f));

const report = [];
for (const file of files) {
  const id = basename(file, '.html');
  if (!existsSync(file)) { report.push({ id, error: 'missing' }); continue; }
  const url = 'file://' + file;
  const png = resolve(OUT, `${id}.png`), pdf = resolve(OUT, `${id}.pdf`);
  const pngOk = await renderOne(png, ['--window-size=1280,720', `--screenshot=${png}`, url]);
  const pdfOk = await renderOne(pdf, ['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url]);
  let fonts = '', info = '';
  try { fonts = execFileSync('pdffonts', [pdf], { encoding: 'utf8' }); } catch {}
  try { info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }); } catch {}
  const pages = Number((info.match(/Pages:\s*(\d+)/) || [])[1] || 0);
  const sizeM = info.match(/Page size:\s*([\d.]+)\s*x\s*([\d.]+)/);
  const w = sizeM ? Math.round(+sizeM[1]) : 0, h = sizeM ? Math.round(+sizeM[2]) : 0;
  const landscape = w > h && Math.abs(w - 960) < 6 && Math.abs(h - 540) < 6; // 13.333×7.5in = 960×540pt
  const brandFonts = [...new Set((fonts.match(/SpaceGrotesk|Inter|JetBrainsMono/gi) || []))];
  report.push({ id, pages, size: `${w}x${h}`, landscape, brandFonts: brandFonts.length,
    ok: pngOk && pdfOk && pages === 1 && landscape && brandFonts.length > 0 });
}
console.log(JSON.stringify(report, null, 2));
const bad = report.filter(r => r.error || r.ok === false);
if (bad.length) { console.error(`\n${bad.length} slide(s) need attention: ` + bad.map(b => b.id).join(', ')); process.exitCode = 1; }

if (assemble && !bad.length) {
  const pdfs = files.map(f => resolve(OUT, basename(f, '.html') + '.pdf'));
  const outPdf = resolve(ROOT, 'public/docs/jinki-solution-deck.pdf');
  mkdirSync(resolve(ROOT, 'public/docs'), { recursive: true });
  execFileSync('pdfunite', [...pdfs, outPdf]);
  const info = execFileSync('pdfinfo', [outPdf], { encoding: 'utf8' });
  console.log('\nASSEMBLED → public/docs/jinki-solution-deck.pdf');
  console.log(info.split('\n').filter(l => /Pages|Page size/.test(l)).join('\n'));
}
