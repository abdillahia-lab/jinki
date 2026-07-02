# Jinki Insurance One-Pager — Winner & Provenance

## Result
A 10-team, 5-round adversarial design competition (5-judge panel: Design ×3, Brand ×2, Content ×3,
Creativity ×2, Holistic ×4) produced this one-pager. Final partner-review standings:

| Place | Team | Territory | Final composite |
|---|---|---|---|
| 🥇 1 | **Team 10 — "The Governance Chain"** (light) | Founder-as-expert-witness → each AI-governance credential wired to a control → a defensible condition-of-record | **7.79** |
| 🥈 2 | Team 09 — "The Roof Ledger" (light) | Condition as a living, version-controlled file | 7.64 |
| 🥉 3 | Team 04 — "Evidentiary Schedule" (light) | Audited Exhibit A–D filing | 6.57 |

Winner headline: **"AI you can defend to a regulator and in court."** All 10 competing sources are
retained in `../submissions/team-01.html` … `team-10.html`.

## Deliverables (in `public/docs/`)
- `jinki-insurance-onepager.pdf` — **canonical master** (light print-document; US Letter portrait, 1 page).
- `jinki-insurance-onepager-dark.pdf` — dark-instrument variant (same file, theme-flipped; holds cleanly).
- `.png` siblings — 2× rasters for preview/thumbnails.
- Source of truth: `winner/jinki-insurance-onepager.html` (== `submissions/team-10.html`).

## Re-render
```
# canonical light master:
node scripts/render-onepager.mjs --src=winner/jinki-insurance-onepager.html --name=jinki-insurance-onepager --out=public/docs
# dark variant:
node scripts/render-onepager.mjs --src=winner/jinki-insurance-onepager.html --name=jinki-insurance-onepager --out=public/docs --theme=dark
```
Engine: headless Google Chrome `--print-to-pdf` (spawned detached, polled, killed — the macOS
hang-on-shutdown workaround lives in `scripts/render-onepager.mjs`). Fonts self-hosted from
`public/fonts/` via `file://` `@font-face`; verified embedded+subset with `pdffonts`, single Letter
page with `pdfinfo`.

## Guardrail attestation (winner)
No "drone" (uses "aerial"); no hardware/product names; no fabricated clients / testimonials / photos;
all instrument visuals are inline SVG labeled `SCHEMATIC · ILLUSTRATIVE`; every claim carries a number
or honest qualifier; non-definitive/target voice ("48-hour target", "figures are targets … not
guarantees"); founder credentials + issuers exact (CISSP, CCSP · ISC2; AIGP · IAPP; AAISM, AAIR ·
ISACA; ex-Deloitte); **SOC 2 stated as roadmap, not attained**; Mid-Atlantic scope; brand tokens/fonts
only; flat/orthogonal; single self-contained page. Footer discloses: "Jinki has completed no client
scans to date."
