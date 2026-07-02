# Jinki Solution Deck — SLIDE SPEC (the content + build bible)

16 landscape slides (16:9), light theme, for **P&C underwriting + claims**. Every slide **links
`deck.css`** and writes ONLY a namespaced `.sNN{}` block. Build to the 2 reference slides
(`slides/slide-09.html` hero, `slides/slide-13.html` matrix) — match their line-weights, spacing,
and caption grammar.

## THE SHELL — copy verbatim into every slide (change only `NN`, the kicker/title, and the body)
```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="file:///Users/aa/JInki.ai/tasks/deck/deck.css">
<style>
/* .sNN — THIS slide's layout only. Colors via var(--*) only. No html/body font-size. */
.sNN .deck-body{ /* compose here */ }
</style>
</head>
<body>
<main class="slide sNN">
  <header class="deck-masthead">
    <div class="brand">JINKI<span class="dot">.</span><span class="desc">Roof / Property-Condition Intelligence</span></div>
    <div class="stamp">CONDITION-OF-RECORD · METHOD &amp; STANDING<br>FOR P&amp;C UNDERWRITING &amp; CLAIMS</div>
  </header>
  <div class="deck-hair"></div>
  <div class="deck-body">
    <!-- SLIDE CONTENT -->
  </div>
  <footer class="deck-footer">
    <span class="folio"><b>NN</b> / 16</span>
    <span class="disc">Illustrative schematics · industry figures are directional framing (sourced), not Jinki measurements · no client scans completed to date.</span>
    <span class="region">Mid-Atlantic</span>
  </footer>
</main>
</body>
</html>
```
Cover (slide 1) may omit the section-style body and center a title lockup, but KEEPS the masthead,
hair, and footer. Every other slide leads its `.deck-body` with a `.section-bar` (index + title + meta).

## HARD RULES (auto-fail)
- Never "drone" → "aerial". No hardware/product names. No fabricated clients/logos/testimonials/photos.
- Every industry stat carries its **source inline** (use `<span class="src">III, 2023–24</span>` etc.) and
  reads as directional framing — never as a Jinki result. No invented numbers.
- Every schematic `<figure>` carries a `figcaption` with `SCHEMATIC` or `ILLUSTRATIVE`.
- Non-definitive/target voice ("48-hour **target**", "designed to", "up to"). No guarantees/absolutes.
  Founder creds + issuers exact. **SOC 2 = roadmap, not attained.** No unsubstantiated ™. Mid-Atlantic only.
- Signal orange = accent (headline verb, cred abbrs, the 0.80 gate, flagged marks, keylines) — NOT a fill field.
- One idea per slide. Do NOT override the root font-size. Content must fit 13.333in×7.5in with no overflow.

## FOUNDER FACTS (verbatim)
Adnan Abdillahi — Founder & CEO · ex-Deloitte cyber risk senior consultant. Credentials (each
independently verifiable with its issuer): **AIGP** (IAPP) · **AAIR** (ISACA) · **AAISM** (ISACA) ·
**CISSP** (ISC2) · **CCSP** (ISC2). Coverage facts (definitive — these are facts): FAA Part 107;
$5M liability / operation; additional-insured naming available; COI available pre-contract; Mid-Atlantic.
CTA: "Start with a single roof." → Request a scoped assessment · DIRECT · adnan@jinki.ai · no SDRs, no handoffs.

## REUSED SVGs (copy VERBATIM — do not redraw)
- **Slide 9 hero:** the Governance Chain `<figure class="chain">…</figure>` from
  `tasks/onepager-competition/submissions/team-10.html` (viewBox `0 0 784 168`). Enlarge to span the slide.
- **Slide 11 hero:** the Roof Ledger `<figure class="instrument">…</figure>` from
  `tasks/onepager-competition/submissions/team-09.html` (viewBox `0 0 332 246`). Place in a right column.

---

## PER-SLIDE SPECS

**S1 · Cover** — *Declare the instrument + the claim.*
Center-left lockup: JINKI wordmark large; eyebrow "ROOF CONDITION-OF-RECORD · FOR P&C UNDERWRITING & CLAIMS";
hero claim **"AI you can defend to a regulator *and in court*."** (Signal on "and in court"); one-line
standfirst: "Instrument-grade roof condition — captured from the air, governed by design, delivered as a
defensible record." Small mono row: "MID-ATLANTIC · FOUNDER-DIRECT · METHODOLOGY-LED". Full-width thermal hair.

**S2 · The problem** — *Roof = leading loss driver AND most-disputed line, assessed late/indefensibly.*
section-bar idx 01. Three `.stat` cards: **~40–43%** `<u>of homeowners losses</u>` — wind & hail, the #1 driver
(`III, 2023–24`); **~25%** of residential claim value is roof-related; ~$31B 2024 roof costs (`Verisk`); **~38%**
of US roofs read moderate-to-poor by aerial assessment (`Verisk, 2025`). Closing line: "Roof condition is
assessed late, inconsistently, or in a form that doesn't hold up — so a thin file becomes a **disputed claim**."
Visual: small 2-bar "loss share vs dispute share" schematic (ILLUSTRATIVE).

**S3 · The cost curve** — *The gap is expensive today and worsening (UW vs claims).* section-bar idx 02.
Two columns. **Underwriting lens:** moderate-to-poor roofs ≈ **60% higher loss cost** (`Verisk RCS, 2025`);
20-yr roofs ~**3–5×** likelier to claim (`practitioner estimate — directional`); mispriced condition = adverse
selection. **Claims lens:** LAE ≈ **10–15%** of losses paid (`IRMI`); disputes concentrate — FL ~15% of US
property claims → **~71%** of US property litigation (`FL DOI data`). Backdrop band (thin thermal "rising"):
SCS/hail **$200B+** insured losses 2023–25; hail on >20% of roofs in **16 states (up from 12)** (`Aon/Swiss Re/Verisk`).

**S4 · The regulatory shift** — *A forcing function is arriving on a clock.* section-bar idx 03.
Horizontal timeline (mono dated ticks, Signal on 2026 markers): NAIC AI Model Bulletin — adopted/substantially
in **50%+ states**; **CO SB205** (Jun 2026); **NY DFS** Circular Letter 2024-7; **EU AI Act** — UW/claims AI
classified high-risk (Aug 2026); **NAIC AI-evaluation pilot** (2026). Takeaway: "AI in underwriting and claims
now has to be **explainable and defensible** — documented governance, not a black box." (Sets up the wedge.)

**S5 · What Jinki is** — *Name the category: a condition-of-record specialist.* section-bar idx 04.
Lede: "Jinki is a roof / property-condition **specialist** — not a generalist aerial vendor. The unit of value
is a **condition-of-record**: instrument-grade, geolocated, time-stamped, defensible." Then the `.flow` (Capture
→ Analyze → Record) with thermal connectors as a one-line method preview → a Condition-of-Record end node.

**S6 · Method — Capture** — *Capture is disciplined, not opportunistic.* section-bar idx 05 (meta "01 / METHOD").
Copy: "Aerial thermal + visual, flown in the **solar window** — when thermal contrast (ΔT) is real, not when the
calendar says." Visual: NEW capture-geometry schematic (roof section + low sun-angle arc + a labeled solar-window
band; thermal ramp used as a thin ΔT scale bar, NOT a fill). Caption `CAPTURE GEOMETRY · SCHEMATIC`.

**S7 · Method — Analyze** — *The human-in-the-loop gate is the governance control.* section-bar idx 06.
Copy: "Every anomaly is ranked **SEV-1/2/3** and confidence-scored. Findings **under 0.80 route to a logged human
review**; at/above, they auto-clear." Visual: NEW SEV×confidence gate — horizontal confidence axis 0.50→1.00,
SEV lanes, the dashed **0.80 gate** line, Signal dots under 0.80, hollow dots above (enlarge the gate node from
the Governance Chain). Caption `SEV × CONFIDENCE · HUMAN-IN-THE-LOOP · SCHEMATIC`.

**S8 · Method — Record** — *The output is a defensible artifact on a clock.* section-bar idx 07.
Copy: "A geolocated, time-stamped **condition brief**, on a **48-hour target** — pre-season baseline, post-event
documentation, an underwriting condition input, and renewal-time re-assessment." Visual: NEW deliverable-anatomy
schematic — a labeled condition-brief document with leader-line callouts (severity rank · confidence % ·
geolocation/timestamp · chain-of-custody line · "imagery is one input" footnote). Caption `DELIVERABLE ANATOMY · SCHEMATIC`.

**S9 · The Governance Chain (HERO)** — *Credential → control → record, defensible.* [REFERENCE SLIDE — build first]
kicker "THE WEDGE". Title "The Governance Chain". device-line: "Your credentials, wired to the controls that make
a finding hold up — **defensible to a regulator and in court.**" REUSE team-10 chain SVG verbatim, enlarged to
~62% width; weld the 5-col credential `.roster` beneath. Keep `SCHEMATIC · ILLUSTRATIVE` caption.

**S10 · Why it holds up** — *Defensibility spelled out for a regulator/deposition.* section-bar idx 08.
`.def-list`: **Chain-of-custody + capture metadata** on every dataset, producible on demand. **Explainable,
severity-ranked outputs** — each finding states how it was reached, built for NAIC review. **Augments your
people** — a second, defensible input, never a replacement for adjuster/underwriter judgment. Beside it, a
`.basis-note`: "**Imagery is one input**, never the sole basis for a decision — the record states what it rests on."

**S11 · The Roof Ledger** — *Condition is a living, version-controlled file.* section-bar idx 09.
Left rail copy: "One scan is a data point. Jinki opens a condition-of-record at **baseline** and accrues it on
cadence — so you watch a roof change in **velocity**, not discover it failed at the claim. A **flagged Δ** is the
entry that reprices a renewal or documents a loss." Right column: REUSE team-09 Roof Ledger SVG verbatim.

**S12 · How Jinki is different** — *Separate from every aerial/property vendor they've seen.* section-bar idx 10.
2-column attribute contrast (NO competitor names/logos): "Typical aerial report" vs "Jinki condition-of-record".
Rows: a photo/measurement dump → a **defensible record**; generalist → **roof/property specialist**; ungoverned AI
→ **AI-governance-credentialed founder**; one-off snapshot → **living, longitudinal file**; sales handoff → **founder-direct**.

**S13 · Where it fits your book** — *Concrete insertion points, both audiences.* [REFERENCE SLIDE — build first]
section-bar idx 11. Matrix: rows = book stage (New business · Renewal · FNOL / post-event · Claim · Litigation);
columns = **Underwriting** | **Claims**; cells name the Jinki artifact (e.g. New business × UW = "pre-bind condition
input"; Renewal × UW = "re-scan re-price"; Post-event × Claims = "time-stamped documentation"; Claim × Claims =
"defensible severity record"; Litigation × Claims = "chain-of-custody exhibit"). Signal keylines on the header row.

**S14 · Engagement + honest posture** — *Make the ask easy; disclose the truth up front.* section-bar idx 12.
Left: pilot — "Start with a **single roof**." + the `.facts` strip (Part 107 · $5M · COI · Add'l insured ·
Mid-Atlantic). Right: an honest-posture panel — "**What we are, plainly:** methodology-led; **zero client scans to
date**; **SOC 2 on the roadmap, not attained**; figures are targets and schematics illustrative." (Trust through transparency.)

**S15 · The founder** — *The person who signs the standard.* section-bar idx 13.
`.deponent` block (Adnan Abdillahi · Founder & CEO · ex-Deloitte cyber risk; stamped-methodology line) + the 5-col
credential `.roster` (AIGP · AAIR · AAISM · CISSP · CCSP, "each independently verifiable with its issuer").

**S16 · Close / CTA** — *One action, founder-direct.* Large: **"Start with a single roof."** + `.cta`
(Request a scoped assessment · DIRECT · adnan@jinki.ai · no SDRs, no handoffs: the person who signs the standard
answers). Restate the wedge as a closing line; closing thermal hair.
