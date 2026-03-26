# Jinki.ai Homepage Design Specification

**Audit Date:** 2026-03-25
**Components Audited:** Hero, TrustBar, Verticals, Process
**Design System:** global.css ("Orbital Architect" token system)
**Status:** READ-ONLY AUDIT -- no source files modified

---

## 1. Design Tokens Audit

### 1.1 Color Tokens

| Token | Dark Value | Light Value | Usage |
|---|---|---|---|
| `--bg-primary` | `#121416` | `#fafbfc` | Page background, Hero section bg |
| `--bg-elevated` | `#1a1c1e` | `#ffffff` | Elevated surfaces |
| `--bg-card` | `#1e2022` | `#f0f1f3` | Process step cards |
| `--bg-card-hover` | `#282a2c` | `#e8e9eb` | Card hover state (defined but unused in audited components) |
| `--text-primary` | `#e3e5e8` | `#1a1c1e` | Headlines, primary copy |
| `--text-secondary` | `#b8c8cd` | `#3b494c` | Body text, subtitles |
| `--text-tertiary` | `#8fa0a5` | `#5f6868` | Labels, captions, trust line |
| `--accent` | `#00e5ff` | `#00838f` | CTAs, icons, eyebrows, stat values |
| `--accent-soft` | `#c3f5ff` | `#004f58` | Hover link color |
| `--accent-glow` | `rgba(0,229,255,0.15)` | `rgba(0,131,143,0.1)` | Icon backgrounds, focus rings |
| `--accent-glow-strong` | `rgba(0,229,255,0.25)` | `rgba(0,131,143,0.18)` | Scroll progress glow |
| `--surface-dim` | `#121416` | `#f5f5f5` | Verticals section background |

#### Glass Effect Tokens

| Token | Dark Value | Light Value |
|---|---|---|
| `--glass-bg` | `rgba(28,32,36,0.6)` | `rgba(255,255,255,0.88)` |
| `--glass-border` | `rgba(200,220,230,0.07)` | `rgba(0,0,0,0.10)` |
| `--glass-shadow` | `0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)` | `0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)` |
| `--glossy-shine` | `linear-gradient(135deg, rgba(255,255,255,0.12)...` | `linear-gradient(135deg, rgba(255,255,255,0.6)...` |

#### Shadow System

| Token | Dark | Light |
|---|---|---|
| `--shadow-rest` | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| `--shadow-elevated` | `0 4px 8px rgba(0,0,0,0.12), 0 12px 28px rgba(0,0,0,0.16)` | `0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)` |
| `--shadow-floating` | `0 12px 28px rgba(0,0,0,0.15), 0 24px 56px rgba(0,0,0,0.2)` | `0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)` |

**Finding:** `--shadow-rest`, `--shadow-elevated`, and `--shadow-floating` are defined in the token system but NOT used in any of the four audited components. Components define ad-hoc shadows inline instead (e.g., metric-card uses `var(--glass-shadow)` plus custom hover shadows). The 3-tier shadow system is underutilized.

#### Easing Curves

| Token | Value |
|---|---|
| `--ease-out-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--ease-reveal` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |

**Finding:** `--ease-spring` and `--ease-reveal` are defined but unused across all four audited components. All transitions use `--ease-out-premium` or hardcoded `cubic-bezier(0.16, 1, 0.3, 1)`.

### 1.2 Token Inconsistencies

| Issue | Location | Details |
|---|---|---|
| **Hardcoded fallback duplication** | Hero CTAs, metric cards, Process cards, Verticals | `var(--ease-out-premium, cubic-bezier(0.16, 1, 0.3, 1))` repeated 15+ times. The fallback is identical to the token value. Unnecessary redundancy. |
| **Hardcoded accent color** | Hero `.cta-primary` | Uses `rgba(0,229,255,...)` directly instead of `var(--accent)` or `var(--accent-glow)`. Light mode override uses `var(--accent)` correctly. Inconsistent. |
| **Card border inconsistency** | TrustBar badge-chip | Dark mode uses `rgba(255,255,255,0.1)` instead of `var(--glass-border)`. |
| **Hardcoded dark background** | Hero `.cta-primary` color, process num-circle | `#050508` hardcoded, not using `var(--bg-primary)` which is `#121416`. These are different values. |
| **Vertical card overlay** | Verticals `.card-overlay` | Uses `rgba(5,5,8,...)` hardcoded. Light mode override uses `rgba(10,12,14,...)`. Neither maps to token values. |
| **Mixed unit systems** | All components | Spacing uses rem, px, and em interchangeably. No single source of truth. |

---

## 2. Component Architecture

### 2.1 Hero (`Hero.astro`)

```
<section#hero> (full viewport, flex center, z-layered)
  |-- <video.hero-video>         z:0   Background video (lazy, fade-in on load)
  |-- <div.hero-mesh>            z:0   Animated mesh gradient (CSS @property)
  |-- <div.hero-noise>           z:1   Noise texture overlay
  |-- <div.hero-grid>            z:2   Intelligence grid lines
  |-- <div> [dots container]     z:1   5x floating CSS dots
  |-- <div.hero-content>         z:10  Main content (grid)
  |     |-- <div.hero-text>
  |     |     |-- eyebrow (pip + line + text)
  |     |     |-- <h1.headline>
  |     |     |-- <p> subtitle
  |     |     |-- <div.hero-actions> (flex-wrap)
  |     |     |     |-- <a.cta-primary.btn-premium>
  |     |     |     |-- <a.cta-secondary.btn-premium>
  |     |     |-- <p.hero-trust-line>
  |     |     |-- <p.hero-urgency>
  |     |-- <div.hero-metrics> (flex column / row)
  |           |-- metric-card x3 (icon + value + unit + label)
  |-- <div.scroll-indicator>     z:10  Scroll prompt
```

**Layout:** Single-column grid below 1024px; `1.1fr 0.9fr` two-column above 1024px.
**Max-width:** 80rem (1280px) container with auto margins.

### 2.2 TrustBar (`TrustBar.astro`)

```
<section.trust-bar> (flex column)
  |-- <div.trust-counters>       Stats bar (4-col grid, max-width 1100px)
  |     |-- trust-counter x4 (val + label)
  |-- <div> [quote block]        Industry insight (max-width 700px, centered)
  |-- <div.trust-certs>          Certifications band (flex-wrap, centered)
  |     |-- header (icon + label)
  |     |-- divider
  |     |-- <div.badges-row> (flex-wrap)
  |           |-- badge-chip x6 (icon + label, CSS tooltip)
  |-- <div.trust-outcomes>       Business outcomes (3-col grid, max-width 1100px)
        |-- <h2> + <p> header
        |-- <div.outcomes-grid>
              |-- outcome-card x3 (icon-row + stat-pill + h3 + description)
```

**Inconsistency:** Container max-width is 1100px here vs 80rem (1280px) in Hero and Verticals. Intentional narrowing or oversight.

### 2.3 Verticals (`Verticals.astro`)

```
<section#verticals.verticals-section> (surface-dim bg)
  |-- <div> container (80rem max-width)
        |-- header row (flex, eyebrow + h2 + p + CTA link)
        |-- <div.verticals-grid> (1/2/4-col responsive grid)
              |-- <a.vertical-card> x4 (aspect-ratio cards)
                    |-- <picture> or pattern fallback
                    |-- <div.card-overlay> (gradient scrim)
                    |-- content overlay (icon + h3 + desc + CTA)
```

**Note:** Uses Tailwind utility classes extensively in markup (`flex`, `items-center`, `gap-3`, `text-2xl`, etc.) alongside inline styles and scoped CSS. Mixed styling paradigm.

### 2.4 Process (`Process.astro`)

```
<section#process> (relative, overflow hidden)
  |-- ambient glow (absolute, decorative)
  |-- <div> container (80rem max-width)
        |-- header (centered, eyebrow + h2 + p)
        |-- <div.process-grid> (1-col / 3-col grid)
        |     |-- process-step x3 (card with header, title, desc)
        |           |-- process-step-header (num-circle + icon)
        |           |-- h3 + p
        |           |-- process-connector (SVG dash-animated line)
        |-- deliverables section (centered)
              |-- h3 + tag chips + sample report link
```

---

## 3. Typography Scale

### 3.1 Font Family Assignments

| Semantic Token | Font | Weight Range | Usage |
|---|---|---|---|
| `--font-headline` | Space Grotesk | 300-700 | Headlines, CTA text, eyebrow text, labels |
| `--font-body` | Inter | 300-700 | Body paragraphs, descriptions, tooltips |
| `--font-label` | Space Grotesk | 300-700 | Eyebrows, badge labels, stat labels, deliverable tags |
| `--font-mono` | JetBrains Mono | 400-700 | Metric values, stat pills, urgency line, scroll text |

**Finding:** `--font-headline` and `--font-label` resolve to the same font (Space Grotesk). This is semantically clean but means there is no visual distinction between the two tokens.

### 3.2 Complete Font Size Inventory

| Size | rem | px equiv | Component | Element | On scale? |
|---|---|---|---|---|---|
| `clamp(2.6rem,5vw+.5rem,5.5rem)` | 41.6-88px | fluid | Hero | h1 headline | Custom fluid |
| `clamp(2rem,4vw,3rem)` | 32-48px | fluid | TrustBar | Counter values | Custom fluid |
| `clamp(1.75rem,4vw,2.5rem)` | 28-40px | fluid | Process | h2 heading | Custom fluid |
| `clamp(1.5rem,3vw,2.25rem)` | 24-36px | fluid | TrustBar | h2 "Why teams choose" | Custom fluid |
| `1.75rem` | 28px | -- | Hero | Metric value | -- |
| `1.5rem` | 24px | -- | Verticals (mobile) | trust-counter-val override | -- |
| `1.25rem` | 20px | -- | Process | h3 step title, "Your Report" h3 | -- |
| `1.25rem` | 20px | -- | Hero (mobile) | metric-value override | -- |
| `1.125rem` | 18px | -- | TrustBar | h3 outcome headline | -- |
| `1.0625rem` | 17px | -- | Process | Subtitle paragraph | **VIOLATION** |
| `1rem` | 16px | -- | Hero | Metric unit | -- |
| `0.9375rem` | 15px | -- | TrustBar, Process | Quote text, outcome desc, process desc | **VIOLATION** |
| `0.875rem` | 14px | -- | TrustBar | Outcome description | -- |
| `0.85rem` | 13.6px | -- | Hero | CTA button text | **VIOLATION** |
| `0.8125rem` | 13px | -- | TrustBar, Verticals | Outcome stat val, card desc | **VIOLATION** |
| `0.8rem` | 12.8px | -- | Hero, Process | Trust line, num-circle | **VIOLATION** |
| `0.75rem` | 12px | -- | Hero, TrustBar, Process | Metric label, counter label, deliverable tag, sample link | -- |
| `0.7rem` | 11.2px | -- | Hero | Urgency line | **VIOLATION** |
| `0.6875rem` | 11px | -- | Global, TrustBar | Section eyebrow, badge label, citation | -- |
| `0.625rem` | 10px | -- | TrustBar | Outcome stat label | -- |
| `0.6rem` | 9.6px | -- | Hero | Scroll indicator "Scroll" text | **VIOLATION** |
| `0.5625rem` | 9px | -- | Hero (mobile) | Metric label mobile | **VIOLATION** |
| `0.5rem` | 8px | -- | Hero (mobile) | metric-label mobile override | **VIOLATION** |

**Scale violations flagged:** 10 font sizes do not align to a consistent modular scale (e.g., major second 1.125 or minor third 1.2). The system uses 18 distinct non-fluid font sizes. A disciplined type scale would use 8-10 sizes maximum.

### 3.3 Font Weights Used

| Weight | Usage |
|---|---|
| 400 | Hero subtitle, body text defaults, tooltip text |
| 600 | Eyebrows, badge labels, CTA text, counter labels, deliverable tags, sample report link, outcome stat labels |
| 700 | All headlines (h1-h3), counter values, metric values, outcome stat values, process num-circle |

**Finding:** Weight 600 is heavily used for small uppercase labels. This is consistent across components.

### 3.4 Line Heights

| Value | Usage |
|---|---|
| `1.0` | Metric value, section eyebrow |
| `1.02` | Hero h1 |
| `1.08` | Global h1 default |
| `1.1` | Trust counter values |
| `1.12` | Global h2 default, Process h2 |
| `1.2` | Global h3 default |
| `1.3` | Outcome headline |
| `1.55` | Verticals card desc |
| `1.65` | Global p default, Process desc, Process subtitle |
| `1.7` | Body default, TrustBar outcome subtitle, outcome desc |
| `1.75` | Hero subtitle |

**Finding:** 11 distinct line-height values. Body text alternates between 1.65, 1.7, and 1.75 without clear rationale.

### 3.5 Letter Spacing

| Value | Usage |
|---|---|
| `-0.035em` | Hero h1 |
| `-0.03em` | Global h1, trust counter values |
| `-0.02em` | Global h2, TrustBar h2, Process h2 |
| `-0.015em` | Global h3 |
| `-0.01em` | Process title |
| `0.03em` | Deliverable tag |
| `0.04em` | Urgency line, mobile metric labels, outcome stat label (inconsistent between these) |
| `0.05em` | Process num-circle |
| `0.06em` | Outcome stat label, sample report link |
| `0.08em` | CTA buttons, counter labels |
| `0.12em` | Section eyebrow |
| `0.15em` | Metric label, card CTA, cert header |
| `0.2em` | Scroll indicator, Verticals CTA |

**Finding:** 13 distinct letter-spacing values. Uppercase label tracking ranges from `0.03em` to `0.2em` with no clear scale. Recommend consolidating to 3-4 values (tight, normal, wide, extra-wide).

---

## 4. Spacing System

### 4.1 Padding Values

| Value | px equiv | Component | Location | 4/8px grid? |
|---|---|---|---|---|
| `6rem` | 96px | Hero | padding-top | 96 = 12x8 YES |
| `3rem` | 48px | Hero | padding-bottom | 48 = 6x8 YES |
| `5rem` | 80px | Hero (mobile) | padding-top override | 80 = 10x8 YES |
| `2rem` | 32px | Hero (mobile) | padding-bottom override | 32 = 4x8 YES |
| `7rem` | 112px | Verticals, Process | section padding-top/bottom | 112 = 14x8 YES |
| `8rem` | 128px | Verticals (768px+) | section padding override | 128 = 16x8 YES |
| `96px` | 96px | TrustBar | counters padding, outcomes padding | YES |
| `56px` | 56px | TrustBar (mobile) | counters/outcomes padding | 56 = 7x8 YES |
| `32px` | 32px | TrustBar | certs band padding, outcome card | YES |
| `24px` | 24px | TrustBar | horizontal padding, quote padding, outcome card horizontal, Process | YES |
| `16px` | 16px | TrustBar (mobile) | horizontal padding, deliverable tag | YES |
| `1.5rem` | 24px | Hero, Verticals, Process | container horizontal padding | YES |
| `3rem` | 48px | Hero (768px) | container horizontal padding | YES |
| `5rem` | 80px | Hero (1024px) | container horizontal padding | YES |
| `2rem` | 32px | Process | step card padding | YES |
| `1.75rem` | 28px | Verticals | card content bottom padding | **VIOLATION** (28 not on 4/8 grid) |
| `2rem` | 32px | Verticals | card content bottom-bottom padding | YES |
| `1.25rem` | 20px | Hero | metric card padding vertical | **VIOLATION** (20 = 5x4, on 4px grid) |
| `1.5rem` | 24px | Hero | metric card padding horizontal | YES |
| `0.75rem` | 12px | Hero (mobile) | metric card padding vertical | **VIOLATION** (12 = 3x4, on 4px grid) |
| `0.5rem` | 8px | Hero (mobile) | metric card padding horizontal | YES |
| `8px` | 8px | TrustBar | badge chip padding vertical, deliverable tag | YES |
| `14px` | 14px | TrustBar | badge chip padding horizontal | **VIOLATION** |
| `10px` | 10px | TrustBar, Process | stat pill padding, sample report link padding | **VIOLATION** |
| `4px` | 4px | TrustBar | stat pill padding vertical | YES |

### 4.2 Margin Values

| Value | px equiv | Context | 4/8px grid? |
|---|---|---|---|
| `2rem` | 32px | Hero headline margin-bottom | YES |
| `2.75rem` | 44px | Hero subtitle margin-bottom | **VIOLATION** |
| `1.5rem` | 24px | Hero eyebrow margin-bottom | YES |
| `12px` | 12px | Hero trust-line margin-top, outcome headline margin-bottom | **VIOLATION** (12 = 3x4) |
| `8px` | 8px | Hero urgency margin-top, TrustBar counter label, quote attribution | YES |
| `56px` | 56px | TrustBar outcomes subtitle margin-bottom | **VIOLATION** (7x8) |
| `4rem` | 64px | Process header margin-bottom, deliverables section margin-top | YES |
| `3.5rem` | 56px | Verticals header margin-bottom | 56 = 7x8 YES |
| `1.25rem` | 20px | Process step-header margin-bottom | **VIOLATION** |
| `1rem` | 16px | Hero metric card margin-bottom, Verticals eyebrow line margin-bottom, Process title margin, Various | YES |
| `0.75rem` | 12px | Verticals icon margin-bottom, Process title margin-bottom | **VIOLATION** |
| `0.5rem` | 8px | Hero CTA margin-bottom, Verticals card desc margin-top | YES |
| `2.5rem` | 40px | Hero metrics margin-top (mobile 2rem) | YES |
| `2rem` | 32px | Hero (768-1023) metrics margin-top | YES |
| `20px` | 20px | Process sample link margin-top, outcome icon-row margin-bottom | **VIOLATION** |
| `6px` | 6px | Hero trust/urgency gap, deliverable tag gap, badge gap, quote attribution | **VIOLATION** |
| `1.5rem` | 24px | TrustBar outcomes h2 margin-bottom (via 8px) | -- |

### 4.3 Gap Values

| Value | Context | 4/8px grid? |
|---|---|---|
| `32px` | TrustBar counters grid | YES |
| `24px` | TrustBar outcomes grid | YES |
| `16px` | TrustBar (mobile) counters grid | YES |
| `2rem (32px)` | Verticals grid gap (768px) | YES |
| `2.5rem (40px)` | Process grid gap (768px) | YES |
| `1rem (16px)` | Verticals grid gap (mobile) | YES |
| `2rem (32px)` | Process grid gap (mobile) | YES |
| `12px` | TrustBar badges-row column-gap, Process deliverable tags, TrustBar outcomes | **VIOLATION** |
| `8px` | TrustBar badges-row row-gap, cert badges container | YES |
| `6px` | Hero trust/urgency lines, badge-chip internal, deliverable tag internal | **VIOLATION** |
| `4px` | TrustBar outcome stat pill | YES |
| `0.75rem (12px)` | Eyebrow pip spacing | **VIOLATION** |
| `0.375rem (6px)` | Verticals card CTA gap | **VIOLATION** |
| `0.5rem (8px)` | Hero (mobile) metric card gap | YES |

### 4.4 Spacing Summary

Total distinct spacing values used: ~30+
Strict 8px grid adherence: ~65%
Values on 4px sub-grid: ~80%
True violations (not on 4px grid): `6px` (used 5 times), `14px` (1 time), `10px` (2 times), `20px` (2 times), `44px` (1 time)

---

## 5. Color Contrast Audit (WCAG 2.2 AA)

### 5.1 Dark Mode

| Foreground | Background | Ratio (approx) | Minimum Required | Result |
|---|---|---|---|---|
| `--text-primary` (#e3e5e8) | `--bg-primary` (#121416) | **13.5:1** | 4.5:1 | PASS |
| `--text-secondary` (#b8c8cd) | `--bg-primary` (#121416) | **9.6:1** | 4.5:1 | PASS |
| `--text-tertiary` (#8fa0a5) | `--bg-primary` (#121416) | **5.6:1** | 4.5:1 | PASS |
| `--accent` (#00e5ff) | `--bg-primary` (#121416) | **10.8:1** | 4.5:1 | PASS |
| `--accent` (#00e5ff) | `--bg-card` (#1e2022) | **9.7:1** | 4.5:1 | PASS |
| `--text-primary` (#e3e5e8) | `--glass-bg` (~#1c2024 at 0.6 opacity on #121416) | **~12:1** | 4.5:1 | PASS |
| `--text-tertiary` (#8fa0a5) | `--bg-card` (#1e2022) | **4.7:1** | 4.5:1 | PASS (marginal) |
| Hero `.cta-primary` text (#050508) | gradient bg (~#00e5ff) | **10.8:1** | 4.5:1 | PASS |
| Hero `.cta-secondary` text (--text-primary) | `rgba(255,255,255,0.04)` on dark | **~12:1** | 4.5:1 | PASS |
| Metric label (#8fa0a5) | glass-bg metric card | **~4.5:1** | 4.5:1 | **BORDERLINE** |
| Hero trust-line (--text-tertiary) on bg-primary | | **5.6:1** | 4.5:1 | PASS |
| Hero urgency (--accent, 0.7rem) on bg-primary | | **10.8:1** | 4.5:1 | PASS |
| Scroll indicator text (--text-tertiary, opacity 0.5) | bg-primary | **~2.8:1** | 4.5:1 | **FAIL** |
| Process num-circle (#050508) | conic-gradient bg | **varies** | 3:1 (large) | PASS (large text context) |
| Vertical card text (#ffffff) | dark overlay on image | **depends on image** | 4.5:1 | **RISK** |
| Vertical card desc (rgba(255,255,255,0.85)) | overlay | **depends on image** | 4.5:1 | **RISK** |

### 5.2 Light Mode

| Foreground | Background | Ratio (approx) | Minimum Required | Result |
|---|---|---|---|---|
| `--text-primary` (#1a1c1e) | `--bg-primary` (#fafbfc) | **15.8:1** | 4.5:1 | PASS |
| `--text-secondary` (#3b494c) | `--bg-primary` (#fafbfc) | **8.9:1** | 4.5:1 | PASS |
| `--text-tertiary` (#5f6868) | `--bg-primary` (#fafbfc) | **5.1:1** | 4.5:1 | PASS |
| `--accent` (#00838f) | `--bg-primary` (#fafbfc) | **4.6:1** | 4.5:1 | PASS (marginal) |
| `--accent` (#00838f) | white (#ffffff) | **4.5:1** | 4.5:1 | **BORDERLINE** |
| `--text-tertiary` (#5f6868) | `--bg-card` (#f0f1f3) | **4.2:1** | 4.5:1 | **FAIL** |
| Light deliverable tag (#00838f) | `rgba(0,131,143,0.06)` on bg | **~4.5:1** | 4.5:1 | **BORDERLINE** |
| Light CTA primary text (#050508) | `--accent` (#00838f) | **3.8:1** | 4.5:1 | **FAIL** for normal text, PASS for large text (3:1) |

### 5.3 Contrast Issues Summary

| Severity | Issue | Location |
|---|---|---|
| **FAIL** | Scroll indicator text at 50% opacity fails minimum contrast | Hero scroll indicator |
| **FAIL** | `--text-tertiary` on `--bg-card` in light mode (~4.2:1) | Process step labels, metric labels in light mode |
| **FAIL** | CTA primary dark text on #00838f in light mode (~3.8:1 for small text) | Hero primary CTA in light mode |
| **RISK** | White text on image-dependent overlay | Verticals card titles and descriptions (contrast depends entirely on source imagery) |
| **BORDERLINE** | `--accent` on white in light mode (4.5:1 exactly) | Multiple accent-colored small text elements |
| **BORDERLINE** | Metric label on glass background in dark mode | Hero metric cards |

---

## 6. Interaction Patterns

### 6.1 Hover States

| Element | Effect | Duration | Easing |
|---|---|---|---|
| `.cta-primary` | translateY(-2px), expanded box-shadow, shimmer pseudo-element sweep | 0.35s, shimmer 0.6s | `--ease-out-premium` |
| `.cta-primary::after` | translateX(-100% to 100%) shimmer | 0.6s | `--ease-out-premium` |
| `.cta-secondary` | translateY(-2px), bg opacity increase, border-color lighten, box-shadow | 0.35s | `--ease-out-premium` |
| `.cta-secondary svg` | translateX(4px) | 0.35s | `--ease-out-premium` |
| `.metric-card` | translateY(-2px), accent glow shadow, border-color change | 0.4s | `--ease-out-premium` |
| `.metric-icon` (on card hover) | Enhanced box-shadow glow | 0.4s | ease |
| `.badge-chip` | scale(1.02), border-color accent, subtle glow shadow | 0.3s | `--ease-out-premium` |
| `.badge-chip::after` (tooltip) | opacity 0 to 1, scale(0.95 to 1) | 0.2s | ease |
| `.outcome-card` | translateY(-4px), accent border, expanded shadow, top-line scaleX(0.3 to 1) | 0.4s | `--ease-out-premium` |
| `.vertical-card` | scale(1.02) translateY(-6px), accent top/bottom lines, image scale(1.1) | 0.5s | `cubic-bezier(0.16,1,0.3,1)` |
| `.card-cta` | opacity 0 to 1, translateY(8px to 0) | 0.4s | `--ease-out-premium` |
| `.card-cta .material-symbols-outlined` | translateX(4px) | 0.35s | `--ease-out-premium` |
| `.verticals-cta` | gap widens, arrow translateX(4px) | 0.3s, 0.35s | ease, `--ease-out-premium` |
| `.process-step` | translateY(-3px), accent border, expanded shadow | 0.4s | `--ease-out-premium` |
| `.deliverable-tag` | translateY(-2px), accent glow shadow, border-color | 0.25s | `--ease-out-premium` |
| `.sample-report-link` | background fill, border-color accent | 0.25s | ease, `--ease-out-premium` |

### 6.2 Active States

| Element | Effect |
|---|---|
| `.cta-primary:active` | translateY(0), reduced shadow |
| `.cta-secondary:active` | translateY(0) |
| `.btn-premium:active` | translateY(0), `btn-press` animation (scale 1 > 0.97 > 1, 0.2s) |

### 6.3 Focus States

| Element | Effect |
|---|---|
| Global `:focus-visible` | 2px solid accent outline, 3px offset, 4px accent-glow box-shadow |
| `.vertical-card:focus-within` | `.card-cta` revealed (opacity 1, translateY 0) |

**Finding:** Focus-visible is well-implemented globally. However, the vertical cards as `<a>` elements will show focus ring on the entire card. The CTA appears on `focus-within` which is correct.

### 6.4 Keyboard Accessibility

| Concern | Component | Details |
|---|---|---|
| **Good** | Hero CTAs | `<a>` elements, naturally focusable and keyboard-navigable |
| **Good** | Vertical cards | `<a>` elements, entire card is interactive link |
| **Good** | Skip-to-content | Defined in global.css |
| **Concern** | TrustBar badge tooltips | CSS-only tooltips via `::after` pseudo-element. Not accessible to keyboard users or screen readers. `data-tooltip` attribute is not exposed via ARIA. |
| **Concern** | Deliverable tags | Interactive hover effect but non-interactive element (`<span>`). Cursor is `default`. Misleading hover interaction for non-functional elements. |
| **Concern** | Sample report link | Links to PDF download. No `aria-label` indicating file type or size. |
| **Concern** | Process connector SVGs | `aria-hidden="true"` is correct. However, the dash animation relies on `.revealed` class from JS. |

---

## 7. Responsive Behavior

### 7.1 Breakpoint System

| Breakpoint | Type | Usage |
|---|---|---|
| `max-width: 767px` | Mobile | All components |
| `min-width: 768px` | Tablet | Hero padding, Verticals 2-col, Process 3-col |
| `min-width: 768px` and `max-width: 1023px` | Tablet-only | Hero metrics row layout |
| `max-width: 1023px` | Below desktop | TrustBar outcomes 1-col, counters 2-col |
| `min-width: 1024px` | Desktop | Hero 2-col grid, Verticals 4-col |

### 7.2 Component-by-Component Responsive Changes

#### Hero

| Property | Mobile (<768) | Tablet (768-1023) | Desktop (1024+) |
|---|---|---|---|
| Section min-height | auto | 100vh | 100vh |
| Section padding | 5rem top, 2rem bottom | default | 6rem top, 3rem bottom |
| Content grid | 1 column | 1 column | 1.1fr 0.9fr |
| Container padding-x | 1.5rem | 3rem | 5rem |
| CTA layout | Column, full-width (max 320px) | Row, flex-wrap | Row, flex-wrap |
| Metrics | Horizontal strip (flex-row, unified glass container) | Row (flex-row, individual cards) | Column (stacked cards, staggered margins) |
| Metric icons | Hidden | Visible | Visible |
| Metric value font | 1.25rem | 1.75rem | 1.75rem |
| Metric label font | 0.5625rem | 0.75rem | 0.75rem |
| Hero grid bg-size | 60px | 80px | 80px |
| Mesh blur | 40px | 50px | 50px |
| Scroll indicator | bottom: 1rem | bottom: 2rem | bottom: 2rem |

#### TrustBar

| Property | Mobile (<768) | Tablet (768-1023) | Desktop (1024+) |
|---|---|---|---|
| Counters/outcomes padding | 56px 16px | 96px 24px | 96px 24px |
| Counters grid | 2 columns, gap 16px | 2 columns | 4 columns, gap 32px |
| Counter value font | 1.5rem (override) | clamp(2rem,4vw,3rem) | clamp(2rem,4vw,3rem) |
| Outcomes grid | 1 column (max 520px) | 1 column (max 520px) | 3 columns |
| Certs layout | Column, centered | Row, wrapped | Row, wrapped |
| Cert divider | Hidden | Hidden | Visible |
| Badge row gap | 6px 8px | 8px 12px | 8px 12px |
| Badge tooltips | Hidden | Visible | Visible |

#### Verticals

| Property | Mobile (<768) | Tablet (768-1023) | Desktop (1024+) |
|---|---|---|---|
| Section padding | 7rem | 8rem | 8rem |
| Grid columns | 1 | 2 | 4 |
| Grid gap | 1rem | 2rem | 2rem |
| Card aspect ratio | 4:3 | 3:4.2 | 3:4.2 |
| Card CTA | Always visible (opacity 0.8) | Hover only | Hover only |

#### Process

| Property | Mobile (<768) | Tablet (768+) | Desktop |
|---|---|---|---|
| Grid columns | 1 | 3 | 3 |
| Grid gap | 2rem | 2.5rem | 2.5rem |
| Connector lines | Hidden | Visible (absolute positioned between cards) | Visible |

### 7.3 Reduced Motion

All four components respect `@media (prefers-reduced-motion: reduce)`:
- **Hero:** Disables dot float, pip pulse, scroll thumb bob, chevron bounce, cursor blink animations. Hides dots entirely.
- **TrustBar:** Disables all transitions on outcome-card, badge-chip, and tooltips.
- **Verticals:** Disables all transitions on card, pseudo-elements, CTA, arrow, and image zoom.
- **Process:** Disables step card transition, connector line animation, deliverable tag transitions.

### 7.4 Print Styles

Only Hero defines print styles: hides dots, scroll-indicator, and topo-map.
Other components have NO print styles defined.

### 7.5 No-JS Fallback

Global CSS provides `@media (scripting: none)` fallback: `.reveal` elements get `opacity: 1; transform: none`.

---

## 8. Additional Findings

### 8.1 Performance Observations

- **content-visibility: auto** applied to `.verticals-section` and `#lead-gen` in global.css. Not applied to TrustBar or Process sections.
- **will-change: opacity, transform** on `.reveal` elements, cleared to `auto` after reveal. Good practice.
- Hero mesh uses `@property` animation (Houdini). Falls back gracefully in non-supporting browsers (mesh will be static).
- Hero video uses `preload="none"` and lazy-loads via JS. Good performance pattern.

### 8.2 Consistency Issues Between Components

| Issue | Details |
|---|---|
| **Container max-width mismatch** | Hero/Verticals/Process use `80rem` (1280px). TrustBar uses `1100px` (68.75rem). |
| **Spacing units** | Hero uses mostly rem. TrustBar uses mostly px. Process mixes both. No single convention. |
| **Inline styles vs scoped CSS** | TrustBar uses heavy inline styles for layout. Verticals uses Tailwind utility classes. Hero/Process use scoped `<style>`. Three different paradigms in four components. |
| **Border radius** | Metric cards: 16px. Outcome cards: 12px. Process cards: 16px. Badge chips: 8px. Deliverable tags: 8px. CTAs: 12px. Verticals cards: inherited from `rounded-xl` (12px). No documented scale. |
| **Transition durations** | 0.2s, 0.25s, 0.3s, 0.35s, 0.4s, 0.5s, 0.6s, 0.8s, 0.9s, 1.2s used across components. 10 distinct durations with no clear tier system. |

### 8.3 Accessibility Wins

- Proper `aria-label` on all sections
- `aria-hidden="true"` on all decorative elements (dots, grids, noise, icons)
- Skip-to-content link in global styles
- Focus-visible with accent ring and glow
- Touch-action manipulation on interactive elements
- iOS branded tap highlight

### 8.4 Missing Focus Styles

The following interactive elements lack component-specific focus styles (relying only on global `:focus-visible`):
- `.sample-report-link` -- no focus-specific style
- `.verticals-cta` -- no focus-specific style
- `.deliverable-tag` -- not focusable at all (is a `<span>`)

---

## 9. Recommendations Summary

| Priority | Issue | Recommendation |
|---|---|---|
| **P0** | Scroll indicator text fails WCAG contrast | Remove opacity: 0.5 or increase base contrast |
| **P0** | Light mode CTA primary text on accent bg fails for small text | Darken accent or use white text with darker bg |
| **P0** | Light mode text-tertiary on bg-card fails | Darken `--text-tertiary` light value to at least #4a5656 |
| **P1** | Badge tooltips not keyboard/screen-reader accessible | Add `role="tooltip"` and `aria-describedby` pattern |
| **P1** | Vertical card image-dependent contrast | Ensure overlay gradient provides minimum 4.5:1 regardless of image |
| **P2** | 18 font sizes, no modular scale | Consolidate to 8-10 sizes on a defined scale |
| **P2** | 13 letter-spacing values | Consolidate to 4 tiers |
| **P2** | 3-tier shadow system unused | Adopt `--shadow-rest/elevated/floating` in components |
| **P2** | Container max-width inconsistency (1100px vs 1280px) | Standardize or document intentional variation |
| **P2** | Mixed styling paradigms (inline/Tailwind/scoped) | Establish one canonical approach |
| **P3** | 10 transition duration values | Consolidate to 3-4 named duration tokens |
| **P3** | 6px spacing used 5 times (off 8px grid) | Replace with 4px or 8px |
| **P3** | No print styles on TrustBar/Verticals/Process | Add minimal print styles |
| **P3** | `--ease-spring` and `--ease-reveal` tokens unused | Remove or adopt |
