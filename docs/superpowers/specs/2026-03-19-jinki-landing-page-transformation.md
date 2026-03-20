# Jinki Landing Page Transformation — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Approach:** Port Round 50 target design into existing Astro v5 + Tailwind v4 architecture

## 1. Overview

Transform the Jinki Aerial Intelligence landing page from its current basic Astro layout into a premium, prospect-facing asset matching the "Round 50" reference design. The result will be a polished, dark-first experience with a rotating globe hero, glassmorphism panels, thermal HUD imagery, bento stats layout, and a conversion-optimized lead generation form.

**North Star:** The "Orbital Architect" — high-altitude, high-precision, hyper-legible. Aerial intelligence as critical infrastructure, not military classified theater.

## 2. Design System (`global.css`)

### Color Tokens (Material Design)

Replace current CSS custom properties with the Round 50 token system:

```
Dark Mode (default):
- surface:              #121416
- surface-dim:          #121416
- surface-container-lowest: #0c0e10
- surface-container-low:    #1a1c1e
- surface-container:        #1e2022
- surface-container-high:   #282a2c
- surface-container-highest:#333537
- surface-bright:           #38393c
- primary:              #c3f5ff
- primary-container:    #00e5ff  (main action color)
- on-surface:           #e2e2e5
- on-surface-variant:   #bac9cc
- outline:              #849396
- outline-variant:      #3b494c
- surface-tint:         #00daf3
- error:                #ffb4ab
- tertiary:             #ffe7e2

Light Mode (via [data-theme="light"] on <html>):
- surface:              #ffffff
- surface-dim:          #f5f5f5
- surface-container-lowest: #ffffff
- surface-container-low:    #f8f9fa
- surface-container:        #f0f1f3
- surface-container-high:   #e8e9eb
- surface-container-highest:#dcdee0
- surface-bright:           #ffffff
- primary:              #004f58
- primary-container:    #006875
- on-surface:           #1a1c1e
- on-surface-variant:   #3b494c
- outline:              #6f7979
- outline-variant:      #bac9cc
- surface-tint:         #006875
- error:                #ba1a1a
- tertiary:             #8a1d00
- background:           #fafbfc
- on-background:        #1a1c1e

All light-mode tokens verified for 7:1 contrast ratio on text.
```

### Typography (Dual-Font System)

- **Space Grotesk** (`--font-headline`, `--font-label`) — Headlines, labels, data tags. Geometric precision. Self-hosted from `/public/fonts/SpaceGrotesk-Variable.woff2`.
- **Inter** (`--font-body`) — Body text, descriptions. Human legibility. Loaded via Google Fonts CDN: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap`
- **JetBrains Mono** (`--font-mono`) — **Kept** for monospace data readouts (stat values, code-like elements). Self-hosted from `/public/fonts/JetBrainsMono-Variable.woff2`.
- **Labels:** Space Grotesk, uppercase, +5% letter-spacing, 0.6875rem

### Surface Philosophy

- **No-Line Rule:** No 1px borders for **section separation**. Section boundaries defined by background shifts only. However, borders ARE retained on: form inputs (usability), glass panels (ghost borders at 20% opacity), dropdown menus, and interactive card edges.
- **Glass & Gradient:** Floating panels use `backdrop-blur(16-20px)` with semi-transparent backgrounds.
- **Ambient Shadows:** 10% opacity `surface-tint` glow at 32-64px blur. No traditional drop-shadows.
- **Ghost Border Fallback:** `outline-variant` at 20% opacity when contrast is insufficient.
- **Corner Radius:** Buttons/inputs/CTAs: `rounded-sm` (2px). Glass panels/cards: `rounded-xl`/`rounded-2xl` (12-16px). Dropdown menus: `rounded-lg`. No radius > 16px.

### Spacing & Breakpoints (LobeHub `tailwind-patterns`)

- Spacing increments of 4: `gap-4`, `p-6`, `py-8`, `py-16`, `py-24`, `py-32`
- Mobile-first breakpoints: base → sm(640) → md(768) → lg(1024) → xl(1280)
- Page container: `max-w-screen-2xl mx-auto px-6` (1536px — wider than current 1280px to accommodate the bento layout and globe hero)

## 3. Components

### 3.1 Nav (`Nav.astro`)

**Source:** Round 50 lines 146-220

- Fixed position, `backdrop-blur-xl`, semi-transparent background
- Logo: Material Symbol `radar` (filled) + "Tactical Jinki" wordmark in Space Grotesk bold. **Note:** This replaces the current SVG terrain-contour logo + "JINKI.ai" wordmark. This is an intentional brand evolution per the Round 50 direction. Requires adding Material Symbols Outlined as a new external dependency via Google Fonts CDN.
- Desktop nav: Dropdown menus triggered on hover (CSS `:hover` on `.group`), with keyboard focus support via `:focus-within`
  - **About Us:** Our Mission, Team
  - **Verticals:** Data Centers, Energy Grid, Security (anchor links to verticals section)
  - **Services:** Audit, Deployment (placeholder anchors)
  - **Careers:** Open Roles (placeholder anchor)
  - **Blog:** Insights (links to /blog)
  - Labels: Space Grotesk, uppercase, 0.6875rem, tracking-wider, font-bold
  - Active state: cyan text + cyan bottom border
  - Dropdown panels: surface-container bg, outline-variant border at 30% opacity, rounded-lg, shadow-xl
  - Keyboard: dropdowns open on `:focus-within`, items navigable with Tab
- Light/dark toggle: Material Symbol icons (`dark_mode`/`light_mode`), toggles `data-theme` attribute
- CTA: "Contact Us" — `#00E5FF` bg, dark text, rounded-sm, shadow glow
- Mobile: hamburger toggle (preserved from current), dropdowns collapse into flat link list

### 3.2 Hero (`Hero.astro`)

**Source:** Round 50 lines 222-270

- Full viewport height, `pt-24` for nav clearance
- **Globe layer** (absolute positioned, centered):
  - Earth image: ~1100px on desktop, responsive down
  - CSS `globe-rotation` animation: `rotate(0→360deg)` over 120s linear infinite
  - `globe-glow-container`: `drop-shadow(0 0 50px rgba(0,229,255,0.15))`
  - Light mode: reduces glow, adjusts opacity
- **Orbital rings** (absolute, centered over globe):
  - Outer: 800px, dashed cyan border at 20% opacity, 40s spin
  - Mid: 600px, 30% opacity, 60s reverse spin
  - Inner: 1000x400px ellipse, 10% opacity, 25deg tilt, 80s spin
  - Each ring has 1-2 cyan data nodes with pulse animation
- **Content layer** (left-aligned, `max-w-4xl`):
  - Eyebrow: cyan line + "Orbital Intelligence V4.5"
  - Headline: `text-5xl md:text-8xl` — "Intelligence for the *Assets* That Power Our World."
  - Subheadline: High-precision aerial surveillance description
  - CTAs: "Request Demo" (primary) + "View Vertical Hub" (ghost outline)

### 3.3 Verticals (`Verticals.astro` — replaces `About.astro`)

**Source:** Round 50 lines 272-326

- Header: "Industrial Verticals" + subtitle + "Explore Ecosystem →"
- 4-column grid (`lg:grid-cols-4`), cards with `aspect-[3/4.2]`
- Each card:
  - Full-bleed aerial photography background
  - Gradient overlay (transparent → dark from bottom)
  - Material Symbol icon (filled, cyan, scaled)
  - Title + hover-reveal description
  - Hover: image scale(1.1), card lift(-2px), shadow
- Cards: Data Centers, Energy Grid, Security, Agriculture
- `metallic-gloss` overlay for depth

### 3.4 Thermal HUD (`ThermalHUD.astro` — replaces `Capabilities.astro`)

**Source:** Round 50 lines 328-374

- Background: `surface-container-low` at 30% opacity
- Split grid: text 50% / image 50% on lg
- **Text side:**
  - Eyebrow: "Every Pixel Accountable"
  - Headline: "Precision Structural Analysis"
  - Body: thermal imaging capabilities, 0.5°C detection, digital twin cross-referencing
  - Two stats with cyan left-border: "0.1m Spatial Res" + "Real-Time Edge Process"
- **Image side (HUD):**
  - Glass panel container with inner shadow
  - Thermal scan image with `brightness-90 contrast-125`
  - Scanline overlay: horizontal lines at 4px intervals, 20% opacity
  - Crosshair: pulsing 24px circle with center dot
  - Hotspot callout: "HOTSPOT: 142.4°F / SUBSTATION_09_A"
  - Status badge: red pulse dot + "LIVE // Thermal_v4"

### 3.5 Bento Stats (`BentoStats.astro` — replaces `UseCases.astro`)

**Source:** Round 50 lines 376-408

- 3-column grid: main panel spans 2, sidebar spans 1
- **Main panel** (glass):
  - "Autonomous Surveillance Networks" headline
  - Body copy on orbital-grade intelligence
  - 3 stats row: 98.4% Accuracy | 24/7 Active Orbit | <2m Object Def
- **Sidebar** (solid `surface-container-highest`):
  - Verified shield icon in cyan-glow circle
  - "Sovereign Data" headline
  - On-prem processing messaging
  - "Request Architecture" ghost CTA button

### 3.6 Lead Gen Form (`LeadGen.astro` — replaces `Contact.astro`)

**Source:** Round 50 lines 410-448

- Centered glass panel, `max-w-4xl`
- Header: "Initialize Intelligence" + subtitle
- Form fields:
  - First Name / Last Name (2-col row)
  - Business Email (full width)
  - Interest dropdown (Energy Infrastructure, Security & Surveillance, Precision Agriculture, Custom Enterprise Solution)
- Submit: full-width cyan button "Submit Intelligence Request"
- All inputs: `surface-container` bg, no visible border, `rounded-sm`, focus ring cyan

### 3.7 Footer

**Source:** Round 50 lines 450-491

- Top: gradient divider line (transparent → outline-variant → transparent)
- 4-column grid:
  - Brand: logo + tagline + social icons (Material Symbols)
  - Verticals: Energy Grid, Security, Agriculture, Logistics
  - Support: Privacy, Terms, Security Architecture, Sitemap
  - Network Status: live pulse indicator
- Copyright bar with top border

## 4. Technical Details

### Framework

- **Astro v5** — static site generation, component islands
- **Tailwind v4** — integrated via `@tailwindcss/vite` plugin (existing build setup). NOT CDN. Round 50 used CDN for prototyping; we use the proper Vite integration. Tailwind config extended in `global.css` via `@theme` or inline config.
- **Vanilla JS** — no React, no Three.js

### Light/Dark Toggle

- **Mechanism:** `data-theme` attribute on `<html>` (preserving existing pattern, NOT Tailwind `dark:` class)
- Toggle via `document.documentElement.setAttribute('data-theme', next)`
- Persist to `localStorage` key `jinki-theme`
- Prevent FOWT: inline script in `<head>` reads localStorage and applies attribute before render (already exists in Layout.astro)
- All component styles use `:global([data-theme="light"])` or `[data-theme="light"]` selectors for light variants — NOT Tailwind `dark:` prefix
- The Round 50 reference used `classList.toggle('dark')` but we adapt to the existing data-attribute pattern for consistency

### Animations

- Globe rotation: CSS `@keyframes` (120s linear infinite)
- Orbital rings: CSS `@keyframes spin` at varying durations
- Data node pulse: CSS `@keyframes pulse` (4s cubic-bezier infinite)
- Card hover: CSS transitions (transform, shadow, opacity)
- Scroll reveals: IntersectionObserver (preserve existing system)

### Images

- Globe Earth: external URL from Round 50 (replaceable)
- Vertical card backgrounds: external URLs from Round 50 (replaceable)
- Thermal scan image: external URL from Round 50 (replaceable)
- All images marked with SWAP comments for future self-hosting

### Fonts

- Space Grotesk: self-hosted woff2 (already in `/public/fonts/`)
- Inter: Google Fonts CDN link
- Material Symbols Outlined: Google Fonts CDN link

### Accessibility

- Skip-to-content link preserved
- ARIA labels on all sections
- Focus-visible outlines
- `prefers-reduced-motion` media query disables all animations including globe rotation, orbital ring spins, data node pulses, and card hover transitions
- Form validation with `aria-live` error regions

## 5. File Changes

| File | Action |
|------|--------|
| `src/styles/global.css` | Rewrite — new token system, Tailwind integration |
| `src/layouts/Layout.astro` | Update — add font/icon CDN links, dark class toggle |
| `src/pages/index.astro` | Update — new component imports |
| `src/components/Nav.astro` | Rewrite — Round 50 nav with dropdowns |
| `src/components/Hero.astro` | Rewrite — globe + orbital rings |
| `src/components/About.astro` | Delete → replaced by Verticals.astro |
| `src/components/Verticals.astro` | New — 4-column vertical cards |
| `src/components/Capabilities.astro` | Delete → replaced by ThermalHUD.astro |
| `src/components/ThermalHUD.astro` | New — split layout with HUD image |
| `src/components/UseCases.astro` | Delete → replaced by BentoStats.astro |
| `src/components/BentoStats.astro` | New — bento grid with stats |
| `src/components/Contact.astro` | Delete → replaced by LeadGen.astro |
| `src/components/LeadGen.astro` | New — centered form |
| `src/components/Footer.astro` | New — complete rewrite (not a copy from Contact.astro; new 4-column layout) |
| `src/content.config.ts` | No change |
| `astro.config.mjs` | No change |
| `public/fonts/` | No change — keep Space Grotesk + JetBrains Mono. Inter loaded via CDN. |
| `public/images/` | Images from Round 50 use external Google URLs initially. SWAP comments mark each for future self-hosting. |

## 6. LobeHub Skills Applied

| Skill | Application |
|-------|-------------|
| `frontend-ui-ux` | Bold aesthetic direction, anti-generic design, intentional choices |
| `tailwind-patterns` | Spacing scale, breakpoints, responsive grid patterns |
| `3d-web-experience` | Decision to use CSS globe vs Three.js (anti-pattern: 3D for 3D's sake) |
| `react-best-practices` | Not applicable — staying vanilla Astro/JS |
| `copywriting` | Clarity > cleverness, benefits > features, specificity, CTA formulas |
| `landing-page-copywriter` | AIDA framework, PAS for problem sections, StoryBrand for bento |

## 7. Success Criteria

- Light/dark toggle works flawlessly across all components and states
- Globe + orbital rings animate smoothly on desktop and mobile
- Every section communicates clear value proposition
- Prospect immediately understands: what Jinki offers, which verticals, what services
- All interactions feel intentional and polished
- Mobile responsive at all breakpoints
- No console errors, no layout shifts, no broken images
- Lighthouse performance score > 80
