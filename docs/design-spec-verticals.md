# Design Specification: Vertical & Service Pages

**Audit Date:** 2026-03-25
**Scope:** 4 vertical pages + 2 service pages
**Status:** READ-ONLY audit -- no source files modified

---

## 1. Page Template Pattern

### 1.1 Shared Structure

All six pages share a common shell structure:

```
Layout > Nav > Breadcrumb > main#main-content > [Sections] > Cross-Links > LeadGen > Footer
```

**Reusable Components (imported identically across all pages):**
| Component | Import Path | Notes |
|-----------|-------------|-------|
| `Layout` | `../../layouts/Layout.astro` | Wraps entire page, accepts `title`, `description`, `ogImage`, `jsonLd` |
| `Nav` | `../../components/Nav.astro` | Sticky navigation |
| `Breadcrumb` | `../../components/Breadcrumb.astro` | Accepts `items` array with `{label, href?}` |
| `LeadGen` | `../../components/LeadGen.astro` | Anchored as `#lead-gen` |
| `Footer` | `../../components/Footer.astro` | Site-wide footer |

**Page-Specific Content (not componentized -- inline per page):**
All section content, hero visuals, stats bars, card grids, and interactive elements are authored inline within each `.astro` file. There are no shared section-level components.

### 1.2 Section Inventory Per Page

| Section | Data Centers | Energy Grid | Security | Agriculture | Audit | Deployment |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| Hero (two-column) | Y | Y | Y | Y | Y | Y |
| Stats Bar | Y | Y | Y | Y | N (embedded in hero) | N (embedded in hero) |
| Problem/Pain Points | Y (6 accordion) | Y (6 detection cards) | Y (4 pain+solution) | N | N | N |
| Dashboard Mockup | Y | N | N | Y | N | N |
| Services Grid | N | N | Y (6 cards) | N | N | Y (6 cards) |
| Technology Showcase | Y (5-step pipeline) | Y (3 detail panels) | N | Y (4-step pipeline) | N | N |
| Comparison / Timeline | N | Y (before/after) | Y (response chart) | Y (field slider) | Y (traditional vs Jinki) | N |
| FAQ Accordion | Y (6 items) | N | N | N | N | N |
| Process Wheel | N | N | N | N | Y (6-step interactive) | N |
| Findings Gallery | N | N | N | N | Y (4 cards carousel) | N |
| Deliverable Preview | N | N | N | N | Y (5 tabbed panels) | N |
| Season Timeline | N | N | N | Y (4 seasons) | N | N |
| Night Ops Toggle | N | N | Y (day/night) | N | N | N |
| Integration Diagram | N | N | Y (4-node) | N | N | Y (5-node) |
| Coverage Calculator | N | N | N | N | N | Y (range slider) |
| Day/Night Cycle | N | N | N | N | N | Y |
| Dock Showcase | N | N | N | N | N | Y (5-step sequence + 6 spec cards) |
| Interactive Map | N | Y (SVG territory) | Y (SVG perimeter) | N | N | N |
| Alert Cascade | N | N | Y (8-event log) | N | N | N |
| Why Jinki / Differentiators | N | Y (4 cards) | Y (4 cards) | N | N | N |
| Cross-Links | Y | Y | Y | Y | Y | Y |
| LeadGen | Y | Y | Y | Y | Y | Y |
| Footer | Y | Y | Y | Y | Y | Y |

### 1.3 Observation: Componentization Opportunity

The following patterns repeat across multiple pages but are NOT shared components:
- **Eyebrow pattern** (line + text) -- 6 unique class-prefix variants
- **Stats bar** -- 4 structural variants
- **Cross-link section** -- 2 distinct patterns (vertical-to-services, service-to-verticals)
- **Card grids** (services, differentiators, capabilities) -- 3+ variants with identical structure

**Recommendation:** Extract eyebrow, stats bar, section header, and cross-link sections into shared components to reduce duplication.

---

## 2. Accent Color System

### 2.1 Color Assignments

| Page | Primary Accent | Secondary Accent | CSS Class |
|------|---------------|-----------------|-----------|
| Data Centers | `#00E5FF` (cyan) | `#00a8b5` | `.gradient-text-cyan` |
| Energy Grid | `#FF8C00` (orange) | `#FF6B35` | `.gradient-text-energy` |
| Security | `#7B61FF` (violet) | `#4F46E5` | `.gradient-text-violet` |
| Agriculture | `#34D399` (green) | `#10B981` | `.gradient-text-green` |
| Audit (service) | `#00E5FF` (cyan) | inherited from global | `.gradient-text-cyan` |
| Deployment (service) | `#00C9A7` (teal) | `#00897B` | `.gradient-text-teal` |

### 2.2 Gradient Text Implementation

All gradient text classes follow an identical pattern:

```css
.gradient-text-{name} {
  background: linear-gradient(90deg, PRIMARY, SECONDARY, PRIMARY);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShimmer 3s ease-in-out 1;
}
```

**Exception:** `.gradient-text-teal` uses `linear-gradient(135deg, ...)` with no `background-size` and no shimmer animation. This is inconsistent with the other four implementations.

### 2.3 Color Application Points

Each accent color is applied to:
- **Gradient text** in hero H1
- **Eyebrow line** (32px horizontal rule)
- **Eyebrow text** color
- **CTA button** background gradient and box-shadow
- **Card icon containers** and ring accents
- **SVG elements** (node fills, stroke colors, glow filters)
- **Severity/status indicators** within hero HUD elements

### 2.4 Contrast Audit

| Color | Hex | Against `#050508` (dark bg) | Against `#ffffff` (light bg) | WCAG AA (text) |
|-------|-----|-----------------------------|------------------------------|----------------|
| Cyan | `#00E5FF` | 12.6:1 | 1.6:1 | PASS dark / FAIL light |
| Orange | `#FF8C00` | 7.7:1 | 2.6:1 | PASS dark / FAIL light |
| Violet | `#7B61FF` | 4.9:1 | 4.1:1 | PASS dark / PASS light (barely) |
| Green | `#34D399` | 10.3:1 | 1.9:1 | PASS dark / FAIL light |
| Teal | `#00C9A7` | 9.4:1 | 1.8:1 | PASS dark / FAIL light |

**Findings:**
- All accent colors pass WCAG AA against dark backgrounds.
- Cyan, orange, green, and teal FAIL contrast against white backgrounds in light mode. These are used for eyebrow text and gradient-text hero titles in light mode. The gradient text uses `-webkit-text-fill-color: transparent` which renders via the gradient, so contrast depends on which part of the gradient is visible.
- **Violet** is the only accent that comes close to passing in both modes.
- **Recommendation:** Verify light mode rendering of eyebrow text and gradient titles. Consider darker accent variants for light mode via `[data-theme="light"]` overrides.

---

## 3. Hero Visual Architecture

### 3.1 Hero Layout Pattern

All heroes use a two-column grid layout:

```
[Content Column (1.1fr)] [Visual Column (0.9fr)]
```

- **Max width:** 1280px
- **Min height:** 85vh-90vh
- **Padding:** `140px clamp(20px, 5vw, 80px) 60-80px`
- **Grid gap:** 60px
- Visual column has `aria-hidden="true"`

### 3.2 Hero Visual Types

| Page | Visual Type | Base Layer | Overlay Technique |
|------|------------|------------|-------------------|
| **Data Centers** | Photo + HUD overlay | `<img>` (`dc-rooftop-aerial.jpg`) | Thermal color overlay div, CSS grid overlay, 4 HUD badges (CRITICAL/WARNING/NOMINAL/LIVE), 5 animated hotspot glows, horizontal + vertical scan lines |
| **Energy Grid** | Photo + SVG network | `<img>` (`powerline-aerial.jpg`) | SVG `viewBox="0 0 500 400"` with transmission lines, flow-line dashes, substation nodes (orange pulse), anomaly node (red pulse), electricity arc paths, animated drone dot following scan path, HUD readout divs |
| **Security** | Photo + night vision HUD | `<img>` (`facility-night-aerial.jpg`) | Night vision green overlay, scanlines, crosshair (H/V lines + 2 circles), 4 corner brackets, timestamp, MONITORING status blink, 2 thermal target boxes, radar sweep, 6 radar blips, telemetry readout |
| **Agriculture** | CSS NDVI field + HUD panel | No photo -- pure CSS | 8 `.ndvi-row` divs with gradient backgrounds (greens + stress colors), scan sweep, diagonal sweep, field grid overlay, 5 growth indicator lines. Separate HUD panel with NDVI bar, 3 metrics, alert |
| **Audit** | SVG scan interface | No photo -- pure SVG | SVG `viewBox="0 0 600 420"` facility blueprint with roof sections, HVAC units, cooling towers, 4 thermal signature gradients, 4 finding callout tags, scan line, drone with FOV cone. Toolbar + bottom panel in CSS |
| **Deployment** | SVG flight path | No photo -- pure SVG | SVG `viewBox="0 0 800 500"` with facility buildings, perimeter, flight path (animated stroke-dashoffset), animated platform dot, 4 waypoints with pulse rings, telemetry text, mission counter HUD |

### 3.3 Animation Techniques Used

| Technique | Pages Using It |
|-----------|---------------|
| SVG `<animate>` (attribute animation) | Energy Grid, Security, Audit, Deployment |
| SVG `<animateMotion>` (path following) | Energy Grid, Security, Audit, Deployment |
| CSS `@keyframes` | All pages |
| CSS custom property `--var` for animation delay | Energy Grid (`--flow-dur`), Agriculture (`--row`) |
| `animation-delay: calc()` | Agriculture (row-staggered pulse) |
| Glow filters (`feGaussianBlur + feMerge`) | Energy Grid, Security, Audit, Deployment |

### 3.4 SVG Filter Definitions

Each page defines its own SVG filters inline. No shared filter library exists.

| Page | Filter IDs |
|------|-----------|
| Energy Grid | `glow-orange`, `glow-red`, `line-grad` |
| Audit | `si-glow`, `si-hot`, `si-warm`, `therm-crit`, `therm-warn`, `therm-mod`, `therm-cool`, `scan-grad-v` |
| Deployment | `glow`, `calc-glow` |

**Risk:** Filter ID collisions if pages are ever merged or loaded in the same DOM context.

---

## 4. Stats Bar Pattern

### 4.1 Structural Variants

| Page | Wrapper Class | Item Class | Data Shape | Source Attribution |
|------|--------------|-----------|------------|-------------------|
| Data Centers | `.omega-stats-bar` > `.omega-stats-inner` | `.omega-stat-item` | `{value, label, source}` | Y -- `.omega-stat-source` |
| Energy Grid | `.eg-stats-bar` > `.eg-stats-inner` | `.eg-stat-item` | `{value, label, source}` | Y -- `.eg-stat-source` |
| Security | `.stats-bar` > `.stats-bar-inner` | `.stat-item` | `{value, label, source}` | Y -- `.stat-source` |
| Agriculture | `.ag-stats-bar` > `.ag-stats-inner` | `.ag-stat` | `{value, label, icon}` | N -- uses Material Symbol icon instead |
| Deployment | Embedded in hero (`.hero-stats-bar`) | `.hero-stat` | `{value, label}` | N -- inline in hero section |
| Audit | No stats bar | N/A | N/A | N/A |

### 4.2 Stats Data Values

| Page | Stat 1 | Stat 2 | Stat 3 | Stat 4 |
|------|--------|--------|--------|--------|
| Data Centers | 29% (Uptime Institute) | $9K (Ponemon Institute) | 575+ (JLARC 2024) | 13% (CBRE Research) |
| Energy Grid | 50+ mi (Platform Capability) | 0.5C (Sensor) | 48hr (Service) | 3D (Spatial Intelligence) |
| Security | 500+ (Platform Capability) | <90s (Dock Station) | Thermal (IR Camera) | 24/7 (Autonomous) |
| Agriculture | Thermal | 0.1m | AI | 1000+ |
| Deployment | 150-200 | 24/7 | IR | <90s |

### 4.3 Observations

- Data Centers uses `data-count-target` attribute suggesting a count-up animation feature.
- Data Centers includes a `stat-divider` between items with a glow effect; other pages do not.
- Agriculture uses icons per stat instead of source attribution -- inconsistent with the other verticals.
- Deployment embeds stats in the hero rather than a standalone bar.
- **Number formatting inconsistency:** Energy Grid uses "50+ mi" with unit, Security uses "<90s" with less-than symbol. Formatting conventions are not standardized.

---

## 5. Card Pattern Library

### 5.1 Card Variants Inventory

| Variant | Used On | Class Name | Structure |
|---------|---------|-----------|-----------|
| **Problem/Accordion Card** | Data Centers | `.problem-card` | Button trigger + hidden detail region. Icon wrap + title + summary in header. Expanded state shows description + detection method + impact avoided. |
| **Detection Card** | Energy Grid | `.eg-detection-card` | Animated visual div + icon with SVG ring + severity badge + title + description. Uses `data-severity` attribute. |
| **Pain Point Card** | Security | `.pain-card` | Animated visual (radar/clock/alert/fence) + problem statement with warning icon + solution with arrow. |
| **Service Card** | Security, Deployment | `.service-card` / `.cap-card` | Icon wrap + title + description. Uses `metallic-gloss` class for premium finish. |
| **Differentiator Card** | Energy Grid, Security | `.eg-diff-card` / `.diff-card` | Numbered (01-04) + title + description. No icon. |
| **Finding Card** | Audit | `.finding-card` | Rich CSS visual (thermal/structural/radar/efficiency) + severity badge + category badge + title + meta. |
| **Spec Card** | Deployment | `.spec-card` | Icon + value + label. Compact data-display format. |
| **Timeline Card** | Agriculture | `.timeline-card` | Season badge + months + task checklist + metric. Horizontal scroll track. |
| **Tech Panel** | Energy Grid | `.eg-tech-panel` (uses `<details>`) | Summary with icon + title + subtitle + toggle. Expandable body with specs list + capabilities list. |
| **Pipeline Step** | Data Centers, Agriculture | `.pipeline-step` | Node icon + connector + label + sub-label. Horizontal flow. |
| **Report Tab Panel** | Audit | `.report-panel` | Tabbed interface. Each panel has mockup header (traffic light dots) + icon + description + visualization. |
| **Process Wheel Node** | Audit | `.wheel-node` | Circular layout with `role="tab"`. Positioned via calculated `left/top %` from angle math. |
| **FAQ Item** | Data Centers | `.faq-item` | Button trigger with question text + chevron. Hidden answer region. |

### 5.2 Border Radius Values

| Context | Radius | Pages |
|---------|--------|-------|
| CTA buttons | `12px` | All pages |
| Cross-link pills | `10px` (verticals) / `8px` (services) | Mixed |
| Dashboard mockup elements | `4px` inner, varies outer | Data Centers, Agriculture |
| SVG elements | `rx="4"` to `rx="8"` | All SVG-heavy pages |
| Detection card ring | SVG circle (no CSS radius) | Energy Grid |

**Finding:** Cross-link pill border-radius is inconsistent: verticals use `10px`, service pages use `8px`.

### 5.3 Spacing Values

Spacing is applied via inline styles throughout (due to Tailwind v4 utility class limitations documented in project memory). Key values:

- **Section padding:** `clamp(20px, 5vw, 80px)` horizontal
- **Card gap:** `1rem` to `1.5rem` (varies)
- **Hero actions gap:** `24px`
- **Section margin-top for pipeline/specs:** `48px` (inline)
- **Cross-link section:** `padding: 0 1.5rem 3rem`

### 5.4 Interactive Patterns

| Pattern | Mechanism | Keyboard | ARIA |
|---------|-----------|----------|------|
| Problem Explorer accordion | `<button>` click handler toggles `aria-expanded` + `hidden` attribute | Y (button is focusable) | `aria-expanded`, `aria-controls`, `role="region"`, `aria-label` |
| FAQ accordion | Same pattern as Problem Explorer | Y | Same ARIA pattern |
| Process Wheel | `<button role="tab">` with `aria-selected`, `aria-controls` | Y | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-live="polite"` |
| Report Tabs | `<button role="tab">` with `aria-selected`, `aria-controls` | Y | Same tab pattern |
| Night toggle | `<button>` with `aria-pressed` | Y | `aria-label` |
| Comparison slider | `<div role="slider">` with `tabindex="0"` | Partial -- needs keyboard event handlers | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label` |
| Perimeter zones | `<g tabindex="0" role="button">` | Y (focusable SVG group) | `aria-label` per zone |
| Coverage calculator | `<input type="range">` | Y (native range) | `aria-label` |

---

## 6. Cross-Link Pattern

### 6.1 Two Distinct Patterns

**Pattern A: Vertical pages linking to services**
Used on: Data Centers, Energy Grid, Security, Agriculture

```html
<section aria-label="Related services">
  <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
    <a href="/services/audit">Facility Intelligence Scan</a>
    <a href="/services/deployment">Autonomous Deployment</a>
  </div>
</section>
```

- Links include Material Symbol icons (`description`, `rocket_launch`)
- Pill styling: `border-radius: 10px`, `padding: 0.75rem 1.5rem`, glass background with backdrop-filter
- Font: `var(--font-label)`, `0.8rem`, weight 600, `letter-spacing: 0.06em`, uppercase

**Pattern B: Service pages linking to verticals**
Used on: Audit, Deployment

```html
<section aria-label="Industries we serve">
  <p>Industries We Serve</p>
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
    <a href="/verticals/data-centers">Data Centers</a>
    <a href="/verticals/energy-grid">Energy & Grid</a>
    <a href="/verticals/security">Perimeter Security</a>
    <a href="/verticals/agriculture">Agriculture</a>
  </div>
</section>
```

- No icons (text only)
- Smaller pills: `border-radius: 8px`, `padding: 0.6rem 1.25rem`, `font-size: 0.75rem`
- Includes heading paragraph above links

### 6.2 Link Resolution Audit

| Source Page | Link Target | Resolves? |
|------------|-------------|-----------|
| Data Centers | `/services/audit` | Y |
| Data Centers | `/services/deployment` | Y |
| Energy Grid | `/services/audit` | Y |
| Energy Grid | `/services/deployment` | Y |
| Security | `/services/audit` | Y |
| Security | `/services/deployment` | Y |
| Agriculture | `/services/audit` | Y |
| Agriculture | `/services/deployment` | Y |
| Audit | `/verticals/data-centers` | Y |
| Audit | `/verticals/energy-grid` | Y |
| Audit | `/verticals/security` | Y |
| Audit | `/verticals/agriculture` | Y |
| Deployment | `/verticals/data-centers` | Y |
| Deployment | `/verticals/energy-grid` | Y |
| Deployment | `/verticals/security` | Y |
| Deployment | `/verticals/agriculture` | Y |

All 16 cross-links resolve to existing pages. No broken links found.

### 6.3 Internal Anchor Links

| Page | Anchor Target | Element Exists? |
|------|--------------|-----------------|
| Data Centers | `#lead-gen` | Y (LeadGen component) |
| Data Centers | `#problem-explorer` | Y (`id="problem-explorer"`) |
| Energy Grid | `#lead-gen` | Y |
| Energy Grid | `#risk-detection` | Y (`id="risk-detection"`) |
| Security | `#lead-gen` | Y |
| Security | `#services` | Y (`id="services"`) |
| Agriculture | `#lead-gen` | Y |
| Agriculture | `#roi-calculator` | Y (`id="roi-calculator"`) |
| Audit | `#lead-gen` | Y |
| Audit | `#process-wheel` | Y (`id="process-wheel"`) |
| Deployment | `#lead-gen` | Y |
| Deployment | `#dock` | Y (`id="dock"`) |

All internal anchor links have corresponding target IDs.

---

## 7. Accessibility Audit

### 7.1 Positive Findings

- All hero visuals correctly use `aria-hidden="true"`.
- Interactive SVG elements (Security perimeter zones) have `tabindex="0"`, `role="button"`, and `aria-label`.
- Accordion triggers use `<button>` elements with `aria-expanded` and `aria-controls`.
- Tab interfaces use `role="tablist"`, `role="tab"`, and `role="tabpanel"` correctly.
- Night toggle uses `aria-pressed`.
- Alert cascade uses `role="log"` and `aria-live="polite"`.
- Material Symbol icons consistently use `aria-hidden="true"`.
- Dashboard mockups use `role="img"` with `aria-label`.
- SVGs use `role="img"` with `aria-label` where they convey meaning.
- All pages have `<main id="main-content">`.
- Breadcrumb component provides navigation context.

### 7.2 Violations and Concerns

| Issue | Severity | Pages Affected | Details |
|-------|----------|----------------|---------|
| **Comparison slider keyboard support** | HIGH | Agriculture | `<div role="slider" tabindex="0">` is present but no keyboard event handlers visible in markup. Arrow keys likely not wired. Needs `keydown` handler for arrow key support. |
| **No skip-to-content link** | MEDIUM | All | No visible skip navigation link to `#main-content`. Users relying on keyboard must tab through entire Nav. |
| **Focus styles not audited** | MEDIUM | All | Scoped CSS defines hover/active states for CTA buttons but focus-visible styles were not verified across all interactive elements. |
| **Auto-scrolling alert feed** | MEDIUM | Security | The alert cascade auto-scrolls. `aria-live="polite"` is set, but continuously updating live regions can be disruptive to screen readers. Consider `aria-live="off"` with manual trigger. |
| **HUD clock updates** | LOW | Security | `id="hud-clock"` is updated via JS. No `aria-live` region on this element. Acceptable since it is decorative (`aria-hidden` on parent). |
| **Color-only severity indicators** | MEDIUM | Energy Grid, Audit | Detection cards and finding cards use color (red/orange/yellow/cyan) as the primary severity indicator. Text labels ("CRITICAL", "HIGH", "MEDIUM") are present but small. |
| **Decorative images missing alt="" explicitly** | LOW | Data Centers, Energy Grid, Security | Hero photos use `alt=""` (correct empty alt for decorative images inside `aria-hidden` containers). This is correct behavior. |
| **Process wheel button positioning** | LOW | Audit | Wheel nodes are positioned with `left/top %` via inline styles. Screen readers will read them in DOM order (0-5) which is correct logical order. |
| **Inline styles prevent media query responsiveness** | LOW | All | Extensive use of inline styles for spacing means responsive adjustments require JS or scoped CSS `@media` overrides. |

### 7.3 Keyboard Navigation Summary

| Component | Focusable? | Keyboard Operable? | Notes |
|-----------|-----------|-------------------|-------|
| CTA buttons (links) | Y | Y (Enter) | Standard link behavior |
| Problem accordion | Y | Y (Enter/Space) | `<button>` elements |
| FAQ accordion | Y | Y (Enter/Space) | `<button>` elements |
| Process wheel tabs | Y | Partial | Tab key moves between nodes, but arrow key navigation between tabs not verified |
| Report tabs | Y | Partial | Same concern as process wheel |
| Night toggle | Y | Y (Enter/Space) | `<button>` element |
| Comparison slider | Y | Likely NO | `<div>` with tabindex but no keyboard handler in template |
| Perimeter zones (SVG) | Y | Y (Enter) | `tabindex="0"` on `<g>` elements |
| Coverage calculator | Y | Y | Native `<input type="range">` |
| Findings carousel | Y | Y | Prev/Next `<button>` elements |
| Technology details panels | Y | Y | Native `<details>` elements |

---

## Appendix A: CSS Class Prefix Convention

Each page uses a unique class prefix to scope styles:

| Page | Prefix | Example |
|------|--------|---------|
| Data Centers | `omega-` | `.omega-hero`, `.omega-stats-bar` |
| Energy Grid | `eg-` | `.eg-hero`, `.eg-stats-bar` |
| Security | `sec-` (hero) / unprefixed (sections) | `.sec-hero`, `.section`, `.pain-card` |
| Agriculture | `ag-` | `.ag-hero`, `.ag-stats-bar` |
| Audit | `omega-` (shared with DC) + `si-` (scan interface) | `.omega-hero`, `.si-viewport` |
| Deployment | unprefixed | `.deploy-hero`, `.section`, `.spec-card` |

**Finding:** Data Centers and Audit both use the `omega-` prefix for hero and section classes. This works because styles are scoped via Astro's `<style>` tag, but could cause confusion in maintenance.

**Finding:** Security and Deployment use partially unprefixed classes (`.section`, `.section-inner`, `.section-header`). These could collide if ever composed together.

## Appendix B: JSON-LD Schema

All six pages include JSON-LD structured data with `@type: "Service"`:

| Page | Service Name | Service Type |
|------|-------------|--------------|
| Data Centers | Data Center Aerial Intelligence | Aerial Thermal Inspection |
| Energy Grid | Energy Grid Aerial Intelligence | Aerial Infrastructure Inspection |
| Security | Perimeter Security Aerial Intelligence | Aerial Security Monitoring |
| Agriculture | Agriculture Aerial Intelligence | Precision Agriculture Intelligence |
| Audit | Facility Intelligence Scan | Aerial Infrastructure Inspection |
| Deployment | Autonomous Deployment | Autonomous Aerial Monitoring |

All specify `"areaServed": "Mid-Atlantic United States"` and provider `"Jinki Aerial Intelligence"`.

## Appendix C: Image Dependencies

| Page | Image Path | Load Priority |
|------|-----------|---------------|
| Data Centers | `/images/dc-rooftop-aerial.jpg` | `eager`, `fetchpriority="high"` |
| Energy Grid | `/images/powerline-aerial.jpg` | `eager`, `fetchpriority="high"` |
| Security | `/images/facility-night-aerial.jpg` | `eager`, `fetchpriority="high"` |
| Agriculture | None (pure CSS) | N/A |
| Audit | None (pure SVG) | N/A |
| Deployment | None (pure SVG) | N/A |

All hero images use `loading="eager"`, `decoding="async"`, `fetchpriority="high"`. This is correct for above-the-fold LCP images.

## Appendix D: Open Graph Images

| Page | OG Image Path |
|------|--------------|
| Data Centers | `/images/og-data-centers.png` |
| Energy Grid | `/images/og-energy-grid.png` |
| Security | `/images/og-security-vertical.png` |
| Agriculture | `/images/og-agriculture.png` |
| Audit | `/images/og-audit.png` |
| Deployment | `/images/og-deployment.png` |

**Note:** Existence of these image files on disk was not verified in this audit.
