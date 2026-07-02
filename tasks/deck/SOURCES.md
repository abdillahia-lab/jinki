# Jinki Solution Deck — Provenance

## What this is
A 16-slide landscape (16:9) solution deck that expands the winning insurance one-pager
(Team 10 · "The Governance Chain") into a full narrative for **P&C underwriting + claims**. Same
light-instrument design language, same governance-chain thesis, grafted with the runner-up's "Roof
Ledger" living-record idea, plus a competitive-differentiation slide.

## Deliverables (in `public/docs/`)
- `jinki-solution-deck.pdf` — **master** (16 pages, 960×540pt landscape, brand fonts embedded+subset,
  zero fallback fonts, selectable text, self-contained).
- `jinki-solution-deck.pptx` — editable/presentable (16 slides, 13.333×7.5in, each slide a full-bleed
  2× render). The HTML in `tasks/deck/slides/` is the editable source of truth.

## Slide arc (Situation → Regulatory forcing-function → Resolution → Proof → Fit → Ask)
01 Cover · 02 Problem · 03 Cost curve · 04 Regulatory shift · 05 What Jinki is · 06 Method — Capture ·
07 Method — Analyze · 08 Method — Record · 09 The Governance Chain (hero) · 10 Why it holds up ·
11 The Roof Ledger · 12 How Jinki is different · 13 Where it fits your book · 14 Engagement + honest
posture · 15 The founder · 16 Close / CTA.

## Build pipeline
- Locked 3-block `deck.css` (brand foundation + deck chrome/components) linked by every slide → 16
  self-contained landscape HTML slides in `slides/`.
- Reused verbatim: the Governance Chain SVG (from `../onepager-competition/submissions/team-10.html`)
  on slide 09; the Roof Ledger SVG (team-09) on slide 11.
- Content grounded by sourced, hedged industry stats (III, Verisk, Aon/Swiss Re, IRMI, NAIC/CO/NY/EU
  AI-governance) — every figure tagged as directional framing, never a Jinki measurement.
- **Built by a 4-agent parallel fan-out against 2 locked reference slides (09 hero, 13 matrix), then
  a 2-judge adversarial critique pass (design-cohesion + content-honesty).** Critique fixes applied:
  section-index desync corrected (index == folio); slide-02 loss/dispute bars relabeled; slide-03 FL
  litigation stat re-sourced (III/FL OIR ~2021–22) + "3–5×" subordinated + $200B attribution + rising
  band tamed; slide-04 timeline date format unified; slide-10 reframed to "what the record survives";
  slide-11 ledger text collision fixed.

## Re-render / re-assemble
```
node scripts/render-deck.mjs            # render all 16 slides (landscape, MediaBox + font checks)
pdfunite tasks/deck/renders/slide-*.pdf public/docs/jinki-solution-deck.pdf
python3 scripts/build-deck-pptx.py      # PPTX from the 2x PNGs
```
Engine: headless Google Chrome `--print-to-pdf` (detached-spawn + poll + kill, the macOS
hang-on-shutdown workaround); poppler `pdfunite`/`pdffonts`/`pdfinfo`; python-pptx.

## Guardrail attestation
Zero guardrail violations (verified by grep + the content-honesty judge): no "drone" (uses "aerial");
no hardware/product names; no fabricated clients/testimonials/photos; every schematic labeled
`ILLUSTRATIVE`/`SCHEMATIC`; every industry stat carries an inline source and reads as directional
framing; non-definitive/target voice; founder credentials + issuers exact (AIGP·IAPP, AAIR·ISACA,
AAISM·ISACA, CISSP·ISC2, CCSP·ISC2); **SOC 2 stated as roadmap, not attained**; no unsubstantiated ™;
Mid-Atlantic scope; founder-direct. Running footer on all 16 discloses: figures are directional
industry framing (sourced), not Jinki measurements; no client scans completed to date.
