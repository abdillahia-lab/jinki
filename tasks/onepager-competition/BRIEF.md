# Jinki Insurance One-Pager — Shared Design Brief

You are a senior brand/design team competing to produce the single best premium **one-page sales
leave-behind** for **Jinki**, sold to **property & casualty insurance** buyers. This brief is shared
by all teams; your *territory* (passed separately) is what makes your submission distinct. Read this
in full, plus `brand-kit/starter.css`, before you design.

---

## 1. The assignment
ONE page, US Letter portrait, delivered as a **self-contained HTML file** that renders to a print-
perfect, emailable PDF. It is the artifact a founder sends/leaves after a cold call. Its two jobs:
1. **Earn the call-back / second meeting** from a skeptical underwriting or claims executive.
2. **Travel intact** through a multi-stakeholder buying committee (forwarded as one PDF).

## 2. The buyer (write for this person)
A P&C **underwriting** or **claims** executive at a mid-market or large carrier. Risk-averse,
evidence-driven, document-centric, regulator-aware. They have seen every aerial/property vendor
(EagleView, Nearmap, Cape, Zesty, CoreLogic, Verisk, HOVER) and find them interchangeable. They care
about: loss ratio, claims leakage, underwriting accuracy, **defensibility** (a finding that survives a
deposition/regulator), inspection cost, and — increasingly — **AI governance** (NAIC scrutiny of AI in
underwriting/claims is rising). They do not want another SaaS dashboard or a "we replace your
adjusters" pitch.

## 3. Positioning (the argument the page makes)
- **Specialist, not generalist:** Jinki is a **roof / property-condition intelligence specialist** for
  insurers. (Underwriters trust specialists.)
- **The territory to own:** defensible, instrument-grade **"condition-of-record"** — the authoritative,
  geolocated, time-stamped record of a roof's condition, captured from the air, analyzed by AI,
  delivered as decision-ready intelligence.
- **The wedge no competitor has:** the founder's **AI-governance credentials** → *"AI you can defend to
  a regulator and in court."* Lead the credibility with this.
- **Augment, don't replace:** intelligence that makes the underwriter/adjuster sharper, not redundant.

## 4. Content to convey (substance — express it your territory's way)
Use this material; do not invent beyond it. Numbers shown are framed as **targets/capacities**, not
promises (see Voice).
- **The problem:** roof condition is among the largest drivers of property loss and one of the most
  disputed lines in claims — yet it is usually assessed late, inconsistently, or not defensibly.
- **The method (instrument-grade):**
  1. *Capture* — aerial thermal + visual imagery, flown in the right thermal window (bound by solar
     geometry — flown when thermal contrast is real, not when the calendar says so).
  2. *Analyze* — AI detects thermal/structural anomalies, **severity-ranked SEV-1 / SEV-2 / SEV-3**,
     each carrying a **confidence value**; findings below a **0.80 confidence threshold are flagged for
     human review** (human-in-the-loop).
  3. *Record* — a geolocated, time-stamped **condition-of-record**; re-scans on cadence track
     **degradation velocity** over time (a living file, not a snapshot).
- **Defensibility:** chain-of-custody + capture metadata; **imagery is one input**, not the sole basis
  for a decision; explainable outputs. This is what makes it hold up to a regulator or in court.
- **The deliverable:** a severity-ranked condition brief, on a **48-hour target**.
- **For insurers specifically:** pre-season baselines, post-event documentation, an underwriting
  condition input, and renewal-time re-assessment.
- **Verifiable facts (these may be stated definitively):** Mid-Atlantic operating area; FAA Part 107
  authority; **$5M liability per operation, additional-insured naming available**; certificate of
  insurance available before contract.
- **Founder (credibility block — names/issuers must be exact, guardrail G11):**
  **Adnan Abdillahi — Founder / CEO.** Former cyber risk senior consultant at **Deloitte**.
  Credentials: **CISSP, CCSP** (ISC2); **AIGP** (IAPP); **AAISM, AAIR** (ISACA). Founder-direct: requests
  reach his inbox; no SDRs, no handoffs. *(Do NOT claim SOC 2 attained — it is roadmap only.)*
- **CTA (cold-call-fit, founder-direct):** e.g. "Start with a single roof." / "Request a scoped
  assessment." Make it one clear action to a person, not "contact sales."

## 5. Voice (non-negotiable)
- **Non-definitive / target-framed.** Commitments are **targets**, never guarantees. Write "48-hour
  **target**," "**designed to** surface," "**up to**," "**aims to** reduce inspection trips." NEVER
  "guaranteed," "eliminates," "ensures," "100%," "always," "never fails," locked rates, or hard SLAs.
  *Exception:* credentials + insurance/coverage facts may stay definitive (they are facts).
- **Numbers or it doesn't ship.** Every claim carries a number or an honest qualifier. No vague hype.
- **Founder-direct, expert-witness tone.** Precise, restrained, evidentiary — not marketing.

## 6. Brand system (paste `brand-kit/starter.css` verbatim; build on top)
- **Monochrome + one accent.** Dark surfaces / light ink (or the light-theme inverse) + **Signal
  orange `var(--signal)`** used sparingly on small elements. The **thermal ramp** appears only as a
  thin 2–3px band or hairline — never a big fill.
- **Three type voices:** **Space Grotesk** (`var(--font-display)`) makes the claim; **Inter**
  (`var(--font-sans)`) carries body; **JetBrains Mono** (`var(--font-mono)`, the "instrument voice")
  carries all data — SEV-ranks, confidence %, labels, metadata, `tabular` numerals.
- **Flat & orthogonal.** No glassmorphism, no drop shadows, no SaaS-blue, no gradients except the
  sanctioned thermal ramp. Use `var(--*)` tokens for every color.
- Reuse the utilities: `.mono-label`, `.thermal-band`, `.folio-rule`, `.tabular`, `.annotation-tick`.

## 7. Honest visuals only (no real scan exists yet)
Jinki has **zero clients** and **has not completed a roof scan**. Therefore:
- **NO photographs of roofs/properties** presented as Jinki's work. **NO** client names, logos,
  testimonials, or attributed outcomes.
- Build visual richness from **inline SVG instrument/schematic diagrams**, each carrying a small mono
  caption containing **`ILLUSTRATIVE`** or **`SCHEMATIC`**. Menu (pick what fits your territory):
  severity × confidence matrix · capture-geometry / solar-window diagram · degradation-velocity curve ·
  schematic thermal-overlay on a *stylized* roof plane (not a photo) · deliverable-anatomy diagram ·
  confidence-band chart with the 0.80 human-review line · chain-of-custody pipeline · operating-area map.
- You may read these repo components for SVG grammar to emulate (do not copy their data-center copy):
  `src/components/ui/ConditionTrend.astro`, `AnnotatedFrame.astro`, `CorridorChart.astro`, `StatRow.astro`.

## 8. HARD GUARDRAILS (any violation = auto-fail, score 0)
- G1 Never the word "drone" — use **"aerial."**
- G2 No hardware/product names (DJI, M400, H30T, Matrice, Manifold, FLIR, Skydio, Dock 3, etc.).
- G3 No fabricated clients / logos / testimonials / attributed outcomes.
- G4 No real-property photos shown as Jinki's work (labeled schematic diagrams only).
- G5 Every claim carries a number or honest qualifier.
- G6 No guarantees / absolutes / locking language (see Voice §5). Credentials + privacy stay definitive.
- G7 Mid-Atlantic scope only — no national/global coverage claims.
- G8 Founder-direct tone — no "our team of experts," no "contact sales," no SDR voice.
- G9 Only the brand palette/fonts (use `var(--*)` tokens; Space Grotesk / Inter / JetBrains Mono).
- G10 No glassmorphism, no drop shadows (flat), no SaaS-blue accent.
- G11 Founder creds + issuers exact; do NOT claim SOC 2 attained.
- G12 Single page, self-contained (no external `<link>`/`<script src>`/remote images).

## 9. Output contract
1. Produce ONE self-contained HTML file:
   `<!doctype html>` → `<html lang="en">` (DARK teams) **or** `<html lang="en" data-theme="light">`
   (LIGHT teams) → `<head>` with `<meta charset="utf-8">`, a `<style>` containing the **verbatim
   `starter.css`**, then a second `<style>` with **your** design CSS → `<body>` with a single
   `<main class="page">…</main>`.
2. All graphics inline `<svg>`. No external dependencies of any kind.
3. **Write the file to the exact path you are given** (e.g. `tasks/onepager-competition/submissions/team-03.html`).
   Overwrite if it exists.
4. Return ONLY the structured manifest you are asked for (brief + design rationale + self-check vs the
   12 guardrails). Do NOT paste the full HTML into your reply — it lives in the file.
