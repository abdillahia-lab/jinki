# Jinki.ai — Polish Loop Backlog

Source of truth for the autonomous polish loop. Work top-down. Status: `TODO` → `DONE` / `N/A` / `BLOCKED`.
Rules: one item per commit; build + budget gates pass; visible changes verified in BOTH themes + 390px mobile;
deploy to **jinki.ai** per tier; **stop when genuine value is exhausted — no vanity churn.**
Constraints: no locking language · no fabrication · no geo-cornering · never "drone" · no product names · simplicity by design · never weaken a11y.

---

## TIER 1 — Accuracy & correctness  (deploy batch 1)

- [x] `T1` DONE — `contact.astro` datum now derived from `channels.length` (→ 05 ROUTES; can't drift). Build green, render-verified.
- [x] `T2` DONE — `sample-report.astro` Maritime added to composer chips + vertical select + SPEC map. Build green, render-verified.
- [x] `T3` DONE — `system.css` `::selection` color → `var(--surface-0)` (theme-aware). Build green, CSS-verified.

## TIER 2 — Accessibility  (deploy batch 2)

- [ ] `A1` TODO — `src/components/ui/LeadForm.astro:67,74,88` inputs: replace `focus:outline-none`+border-only with a clear on-system focus-visible treatment (resting look unchanged). Verified weak.
- [ ] `A2` TODO — `src/components/ui/LeadForm.astro` submit button: `disabled:opacity-60 disabled:cursor-not-allowed` for the "Filing…" state.
- [ ] `A3` TODO — `src/components/ui/LeadForm.astro:~106` receipt: `role="status" aria-live="polite"`.
- [ ] `A4` TODO — `src/components/ui/InspectionInstrument.astro:~145` verified-count: `role="status" aria-live="polite"`.
- [ ] `A5` TODO — `src/styles/system.css:357` wrap `:active` press state in `@media (prefers-reduced-motion: no-preference)`. Verified.
- [ ] `A6` TODO `verify-first` — `src/components/ui/Nav.astro` theme toggle focus-visible affordance.
- [ ] `A7` TODO `verify-first` — `src/components/ui/Palette.astro` `:focus-visible` on items + guard `pointerenter` to `e.pointerType==='mouse'`.
- [ ] `A8` TODO `verify-first` — `src/components/ui/Nav.astro` icon-only controls (MENU/close) ensure `aria-label`.

## TIER 3 — Polish & cleanup  (deploy batch 3)

- [ ] `P1` TODO `verify-first` — `src/components/ui/Breadcrumb.astro` `flex-wrap` on mobile (only if a trail overflows ~390px).
- [ ] `P2` TODO — `src/components/ui/Accordion.astro:38` `group-hover:text-ink` on question text.
- [ ] `P3` TODO — `src/components/ui/ProcessTimeline.astro:24` Astro conditional `{i < steps.length-1 && …}` instead of style-hidden div.
- [ ] `P4` TODO `verify-first` — `src/components/ui/CTABlock.astro:31` equal-width buttons when stacked on mobile.
- [ ] `P5` TODO — `src/components/ui/StatRow.astro:27` suffix spacing via flex gap instead of `ml-0.5` magic margin. Cosmetic/optional.

## TIER 4 — Broad-scope (only with headroom; each must clear the bar)

- [ ] `B1` TODO — Opportunistic cross-page consistency fixes spotted while working (one per iteration).
- [ ] `B2` TODO — Reduced-motion sweep: confirm rise/reveal/scenes/press all have a reduced-motion path; close gaps.
- [ ] `B3` TODO `flag-for-review` — Maritime vertical visual parity vs. thermal-pair pattern (don't auto-ship if it needs new imagery).

## EXCLUDED — do NOT do
TelemetryStrip "show UNAVAILABLE" (breaks honest degradation) · mission.ts iron-ramp→CSS tokens (over-eng) ·
SectionHeader view-transition-name change (risks VT morphs) · CorridorChart scale-bar JS / phonetic labels (over-eng) ·
CertSeal glyph re-spacing (already excellent).

---

## Shipped log
_(loop appends one line per shipped item; final summary on completion)_
