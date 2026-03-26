# Jinki.ai Shared Components & Interactive Elements -- Design Specification

**Audit Date:** 2026-03-25
**Scope:** Nav, Footer, LeadGen, Chatbot, CookieConsent, Breadcrumb, Layout shell
**Status:** Read-only audit. No source files modified.

---

## Table of Contents

1. [Navigation System](#1-navigation-system)
2. [Footer System](#2-footer-system)
3. [Form System (LeadGen)](#3-form-system-leadgen)
4. [Chatbot System](#4-chatbot-system)
5. [Cookie Consent](#5-cookie-consent)
6. [Layout Shell](#6-layout-shell)
7. [Accessibility Audit](#7-accessibility-audit)

---

## 1. Navigation System

**File:** `src/components/Nav.astro`

### 1.1 Architecture

Fixed-position header (`z-index: 1000`) containing a centered glass-panel nav bar. The nav uses `view-transition-name: site-nav` for cross-page transitions.

### 1.2 Desktop Layout (>768px)

| Zone | Content | Alignment |
|------|---------|-----------|
| Left | Logo (28x28 SVG radar mark + "Jinki" wordmark 18px/700) | `flex-shrink: 0` |
| Center | Link list: Verticals (dropdown), Services (dropdown), About, Security, Blog | `display: flex; gap: 4px` |
| Right | Theme toggle (40x40), CTA button, Mobile hamburger (hidden on desktop) | `gap: 12px; flex-shrink: 0` |

**Nav bar dimensions:**
- Max width: 1200px
- Padding: 10px 20px (inner), 12px 24px (outer header)
- Border radius: 16px
- Backdrop filter: blur(20px)
- Background: `var(--glass-bg)`
- Border: 1px solid `var(--glass-border)`

**Nav links:**
- Font: `var(--font-label)`, 14px, weight 500
- Color: `var(--text-secondary)` -> `var(--text-primary)` on hover
- Padding: 8px 14px
- Border radius: 8px
- Hover underline: accent-colored line animates from 0% to 60% width, centered, 1.5px tall
- Hover background: `rgba(255,255,255,0.06)` (dark) / `rgba(0,0,0,0.05)` (light)

**CTA button:**
- Font: `var(--font-label)`, 14px, weight 600
- Padding: 8px 18px
- Border radius: 12px
- Background: `var(--accent)` (#00E5FF)
- Color: #050508
- Hover: translateY(-1px), box-shadow 0 4px 16px rgba(0,229,255,0.3)
- Active: translateY(0), reduced shadow
- Shimmer sweep animation: 4s cycle, light gradient sweeps left-to-right

### 1.3 Dropdown Interaction

**Trigger:** Hover (CSS `.dropdown:hover`) AND click (JS `.dropdown.open` toggle)

**Panel specs:**
- Position: absolute, centered below trigger with 8px gap
- Min width: 200px
- Background: `var(--surface-container)`
- Border: 1px solid `var(--glass-border)`
- Border radius: 12px
- Padding: 6px
- Shadow: 0 8px 32px rgba(0,0,0,0.3)

**Open animation:**
- Panel: opacity 0->1, translateY(8px)->0, scale(0.97)->1
- Timing: 0.3s cubic-bezier(0.16, 1, 0.3, 1)
- Chevron: rotates 180deg

**Item stagger animation:**
- Each item: opacity 0->1, translateY(6px)->0
- Stagger delay: 0s, 0.03s, 0.06s, 0.09s, 0.12s per child
- Duration: 0.2s ease

**Dropdown items:**
- Font: `var(--font-label)`, 14px
- Padding: 10px 14px
- Border radius: 8px
- Verticals items include colored dot (8x8, border-radius 50%)
- Hover: background change + padding-left shifts to 18px + 2px accent bar appears on left

### 1.4 Mobile Layout (<=768px)

**Breakpoint:** `@media (max-width: 768px)`

**Hidden elements:** `.nav-links`, `.nav-cta`
**Shown elements:** `.mobile-toggle` (hamburger button)

**Hamburger button:**
- Min touch target: 44x44px
- Icon: Material Symbols "menu" / "close" (26px)

**Slide-out panel:**
- Position: fixed, right-aligned, full height
- Width: 300px, max-width: 85vw
- Background: `var(--surface-container)`
- Border-left: 1px solid `var(--glass-border)`
- Z-index: 1001
- Transform: translateX(100%) -> translateX(0) on open
- Transition: 0.3s ease
- Overflow: auto with `-webkit-overflow-scrolling: touch`

**Mobile links:**
- Font: `var(--font-label)`, 15px, weight 500
- Min height: 44px (touch target compliant)
- Padding: 14px 16px
- Border radius: 12px
- Sectioned with uppercase labels (11px, weight 600, letter-spacing 0.08em)

**Mobile CTA:**
- Full-width block
- Padding: 14px
- Font: 15px, weight 600
- Border radius: 12px
- Background: `var(--accent)`

**Backdrop:** Fixed overlay, rgba(0,0,0,0.5), z-index 1000, 0.3s fade transition

### 1.5 Scroll Behavior

**Trigger:** `window.scrollY > 20`

**Scrolled state (.nav-inner.scrolled):**
- Dark mode: background rgba(18,20,22,0.92), blur(28px) saturate(1.9)
- Shadow: 0 4px 24px rgba(0,0,0,0.25), inset highlight
- Bottom border: gradient glow (transparent -> cyan 0.25 -> cyan 0.4 -> transparent) via border-image
- Light mode: background rgba(250,251,252,0.95), teal gradient border

### 1.6 Logo Animation

**Radar mark SVG (28x28):**
- Center ping dot: 3s ease-in-out infinite, radius oscillates 2.5->3, glow filter pulses
- Three arcs: staggered boot-in (0.2s, 0.5s, 0.8s delays) with stroke-dasharray draw, then infinite opacity pulse at different phases (4s cycle)
- Sweep line: continuous 360deg rotation, 3s linear, origin center
- Light mode: all strokes/fills change to #0891b2

**Reduced motion:** All animations disabled, arcs shown at static opacities (0.9, 0.5, 0.25), sweep hidden

### 1.7 Theme Toggle

- 40x40px button, border-radius 12px
- Border: 1px solid `var(--glass-border)`, accent on hover
- Icon: "dark_mode" / "light_mode" (Material Symbols, 20px)
- Updates `aria-label` dynamically: "Switch to light/dark theme"
- Updates `aria-pressed` state
- Stores preference in localStorage key `jinki-theme`

---

## 2. Footer System

**File:** `src/components/Footer.astro`
**JavaScript:** Newsletter form handler only (inline script)

### 2.1 Structure

```
footer-divider (gradient line)
footer-main
  footer-inner (content grid)
  footer-status-bar
  footer-copyright-bar
```

### 2.2 Divider

- 1px height
- Gradient: transparent 5% -> #00E5FF 25% -> #7B61FF 50% -> transparent 85%
- Opacity: 0.5 (dark) / 0.35 (light, using #0891b2 and #6d28d9)

### 2.3 Content Grid

**Max width:** 1280px
**Padding:** 96px 32px 56px (desktop), 56px 20px 32px (mobile)
**Grid:** `1.3fr 1fr 1fr 1.2fr`, gap 48px

| Column | Content |
|--------|---------|
| 1 - Brand | Logo row (SVG + "Jinki"), tagline, status badge, email link, social buttons |
| 2 - Products & Services | Column title + 6 links |
| 3 - Company | Column title + 6 links |
| 4 - Newsletter | Column title, description, email form, note |

**Responsive stacking:**
- <=1024px: `1fr 1fr`, gap 40px
- <=640px: `1fr`, gap 36px

### 2.4 Brand Column

**Status badge ("Accepting New Clients"):**
- Inline-flex, padding 6px 14px, border-radius 8px
- Background: rgba(52,211,153,0.06), border: 1px solid rgba(52,211,153,0.15)
- Dot: 6px, #34D399, with expanding ring pulse animation (2.5s, scale 0.8->2.2)
- Text: `var(--font-mono)`, 0.625rem, #34D399

**Social buttons:**
- 42x42px, border-radius 12px
- Background: `var(--surface-container-low)`, border: 1px solid `var(--glass-border)`
- Hover: translateY(-3px) scale(1.08), color changes to accent, glow background
- Contains inline SVGs for X, LinkedIn, Instagram (18x18)

### 2.5 Link Columns

**Column title:**
- `var(--font-headline)`, 0.6875rem, weight 700, uppercase, letter-spacing 0.15em
- Bottom border with 28px accent underline accent via ::after pseudo-element

**Links:**
- `var(--font-body)`, 0.875rem, color `var(--text-secondary)`
- Hover: color changes to accent, translateX(4px) slide
- Gap between items: 12px (desktop), 16px (mobile)

### 2.6 Newsletter Form

**Input row:**
- Flex container, border-radius 12px, 1px solid `var(--glass-border)`
- Background: `var(--surface-container-low)`
- Focus-within: border-color accent, box-shadow 0 0 0 3px accent glow + inset glow

**Email input:**
- Flex: 1, padding 14px 16px
- Font: `var(--font-body)`, 1rem
- Min height: 44px
- Max length: 254

**Submit button:**
- Width: 46px, background: accent
- Contains arrow SVG icon (18x18)
- Hover: background #00c8e0, scale(1.05)

**Note:** `var(--font-body)`, 0.6875rem, `var(--text-tertiary)`

**Validation:** Client-side regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
**Backend:** Web3Forms API (POST to `https://api.web3forms.com/submit`)
**Honeypot:** Hidden input `name="botcheck"`, tabindex -1

### 2.7 Status Bar

- Border-top: 1px solid `var(--glass-border)`
- Background: `var(--surface-container-low)`
- Content: blinking green dot (8px) + "Jinki Aerial Intelligence" label + "Accepting New Clients" uptime text
- Blink animation: 2s steps(1) infinite, opacity toggles 1 <-> 0.3
- Mobile (<=640px): stacks vertically

### 2.8 Copyright Bar

- Border-top: 1px solid rgba(0,229,255,0.06)
- Content: copyright text (left) + legal links Privacy, Terms, Data Security, Cookies (right)
- Legal links separated by middle dots (aria-hidden)
- Font: 0.75rem, `var(--text-tertiary)`
- "Cookies" link uses `data-cookie-settings` attribute to reopen consent banner
- Mobile (<=640px): stacks vertically, centered

### 2.9 Print Styles

Footer background forced to white, status bar and social buttons hidden.

---

## 3. Form System (LeadGen)

**File:** `src/components/LeadGen.astro`

### 3.1 Section Container

- ID: `lead-gen` (anchor target for CTAs)
- Padding: 7rem top/bottom
- Max width: 80rem
- ARIA label: "Request Intelligence Scan"

### 3.2 Header

- Eyebrow: `var(--font-label)`, 0.6875rem, weight 600, uppercase, letter-spacing 0.12em, accent color
- Decorative lines: 2rem width, 1px height, accent background
- Heading: `var(--font-headline)`, 4xl (mobile) / 5xl (desktop), gradient text (accent -> #7B61FF)
- Subhead: 1.25rem (text-xl), `var(--text-secondary)`, max-width 36rem centered
- Response time badge: `var(--font-mono)`, 0.7rem, accent, with schedule icon

### 3.3 Wizard Container

- Max width: 52rem, centered
- Padding: 2.5rem (desktop), 1.5rem (mobile <=640px)
- Border radius: 16px
- Glass panel: `var(--glass-bg)`, blur(24px) saturate(1.8)
- Border: 1px solid `var(--glass-border)`
- Top glow line: 2px gradient (transparent -> accent -> transparent), opacity 0.6
- Ambient shadow: 0 0 60px rgba(0,229,255,0.04)

### 3.4 Progress Bar (2-Step)

- Dots: 2rem diameter, border-radius 50%
- Font: `var(--font-mono)`, 0.75rem, weight 700
- Inactive: `var(--surface-container)` bg, `var(--text-tertiary)` text, `var(--glass-border)` border
- Active/Done: accent background, #050508 text, accent border
- Done state: bounce animation (0.4s, scale 1->1.35->0.9->1)
- Connecting line: flex 1, 2px height, `var(--glass-border)` background
- Fill bar: accent background, width transitions 0->100%

### 3.5 Step 1 -- Service Selection

**Radio cards (3-column responsive grid, minmax 200px):**

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| Intelligence Scan | assignment | Intelligence Scan | One-time aerial assessment with actionable report |
| Autonomous Deployment | precision_manufacturing | Autonomous Deployment | Persistent monitoring with recurring missions |
| Consultation | forum | Consultation | Explore how aerial intelligence fits your needs |

**Radio card specs:**
- Hidden native input (opacity 0, absolute positioned)
- Card inner: padding 1.5rem 1rem, border-radius 12px, flex column centered
- Border: 1px solid `var(--glass-border)`, background: `var(--surface-container)`
- Hover: border-color accent, background mixes 5% accent
- Checked state: accent border, 10% accent background, translateY(-2px), double box-shadow
- Checked shimmer: rotating conic gradient border (accent -> #7B61FF -> #34d399), 3s linear infinite via `@property --shimmer-angle`
- Focus-visible: 2px accent outline, 2px offset

**Icon:** Material Symbols, 1.75rem, accent color
**Title:** `var(--font-headline)`, 0.875rem, weight 700
**Description:** `var(--font-body)`, 0.75rem, `var(--text-secondary)`, line-height 1.5

**Continue button:** Right-aligned

### 3.6 Step 2 -- Contact Info

**Fields:**

| Field | Type | Required | Autocomplete | Max Length |
|-------|------|----------|--------------|-----------|
| Full Name | text | Yes | name | 100 |
| Company | text | Yes | organization | 100 |
| Your Role | text | No | organization-title | 100 |
| Work Email | email | Yes | email | 254 |
| Message | textarea | No | - | 2000 |

**Field specs:**
- Label: `var(--font-label)`, 0.75rem, weight 600, uppercase, letter-spacing 0.08em
- Label color: `var(--text-secondary)` -> accent on focus-within
- Input: `var(--font-body)`, 1rem, padding 0.875rem 1rem
- Min height: 44px (inputs), 5rem (textarea)
- Border radius: 12px
- Background: `var(--surface-container)` (dark) / `var(--surface-container-low)` (light)
- Border: 1px solid `var(--glass-border)`
- Focus: accent border, 3px accent ring (15% opacity)
- Invalid: border-color `var(--error, #ef4444)`

**Buttons:**
- Font: `var(--font-label)`, 0.8125rem, weight 700, uppercase, letter-spacing 0.08em
- Min height: 44px
- Padding: 0.875rem 1.75rem
- Border radius: 12px
- Next/Submit: accent background, #050508 text, hover brightness(1.1) + translateY(-2px) + cyan shadow
- Back: transparent background, `var(--text-secondary)` text, glass border
- Disabled: opacity 0.5, cursor not-allowed

### 3.7 Trust Badges

Three inline badges below submit button:
- "AES-256 Encrypted" (lock icon, green)
- "NDA by Default" (handshake icon, green)
- "No Spam" (block icon, green)
- Font: `var(--font-label)`, 0.6875rem, weight 600, uppercase
- Padding: 6px 12px, border-radius 8px
- Border: 1px solid `var(--glass-border)`, background: `var(--surface-container)`

### 3.8 Success State

- Self-drawing SVG checkmark (64x64): circle draws in 0.6s, then check draws in 0.4s (0.5s delay) via stroke-dashoffset animation
- "Request Received" heading: `var(--font-headline)`, 1.5rem, weight 700
- Three numbered next-steps displayed vertically (Review, Scope, Proposal)
- Step numbers: 36x36 circles with accent border and glow background

### 3.9 Validation

- Client-side per-step validation before advancing
- Radio required: checks if any in group is checked
- Text required: trims and checks non-empty
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Invalid class adds red border
- Clears on input event

### 3.10 Submission

- Backend: Web3Forms API
- Honeypot: hidden `botcheck` field
- Loading state: button text -> "Sending...", opacity 0.7, disabled
- Error display: inline `role="alert"` div, red border, red text
- Success: hides form + progress, shows success panel, announces via `aria-live` region

---

## 4. Chatbot System

**File:** `src/components/Chatbot.astro`

### 4.1 Root Container

- Position: fixed, bottom 24px, right 24px
- Z-index: 9999
- Role: complementary
- ARIA label: "Jinki Intelligence Concierge"

### 4.2 Launcher (Pill Button)

- Pill shape: border-radius 9999px
- Padding: 10px 20px 10px 14px
- Background: `var(--accent)`, color #050508
- Font: `var(--font-label)`, 0.8125rem, weight 700, letter-spacing 0.03em
- Shadow: 0 4px 24px rgba(0,212,255,0.3)
- Content: layers SVG icon (18x18) + "Ask Jinki" text

**Breathing pulse animation:**
- 3s ease-in-out infinite
- Scale: 1 -> 1.03 -> 1
- Pauses on hover (animation: none)

**Hover:** translateY(-3px) scale(1.02), shadow intensifies to 0.4 opacity
**Hidden when expanded:** `[aria-expanded="true"] { display: none }`

**Mobile (<=767px):**
- Position shifts: bottom 72px, right 16px
- Smaller padding: 8px 14px 8px 10px
- Smaller font: 0.6875rem
- Smaller icon: 14x14

### 4.3 Chat Panel

- Position: fixed, bottom 24px, right 24px
- Width: 380px, height: 520px
- Display: none by default, flex column when open
- Background: `var(--surface-container)`
- Border: 1px solid `var(--glass-border)`
- Border radius: 16px
- Shadow: 0 16px 48px rgba(0,0,0,0.3), inset highlight

**Open animation:** 0.35s premium ease, translateY(16px) scale(0.96) -> translateY(0) scale(1), opacity 0->1

**Mobile (<=767px):** width calc(100vw - 32px), height calc(100dvh - 160px), max-height 420px, positioned bottom 72px right 16px
**Mobile (<=480px):** width calc(100vw - 16px), right 8px, bottom 8px, height 480px

### 4.4 Panel Header

- Flex row, padding 14px 16px
- Border-bottom with gradient accent line (::after pseudo)
- Status dot: 8px, #34d399, blink animation 2.5s
- Title: `var(--font-headline)`, 0.875rem, weight 700
- Subtitle: 0.6875rem, `var(--text-tertiary)`
- Header buttons (minimize, close): 32x32, border-radius 8px, transparent bg

### 4.5 Message Bubbles

- Max width: 88%
- Border radius: 12px
- Padding: 10px 14px
- Font size: 0.8125rem, line-height 1.55

| Type | Background | Color | Alignment |
|------|-----------|-------|-----------|
| Bot | `var(--glass-bg)`, 1px glass border | `var(--text-primary)` | flex-start |
| User | `var(--accent)` | #050508 | flex-end |

Bot links: accent color, underlined, weight 600

### 4.6 Typing Indicator

- Three dots, 7x7px, border-radius 50%, accent background
- Bounce animation: 1.2s ease-in-out infinite
- Stagger: 0s, 0.15s, 0.3s delays
- Pattern: translateY(0) -> translateY(-6px) -> translateY(0), opacity 0.4 -> 1 -> 0.4

### 4.7 Quick Replies

**Container:** flex wrap, gap 8px, flex-start aligned

**Buttons:**
- Pill shape: border-radius 9999px
- Padding: 6px 14px
- Font: `var(--font-label)`, 0.75rem, weight 600
- Border: 1px solid accent, transparent background, accent text
- Hover: accent background, #050508 text

**Stagger entrance:**
- Container fades in: 0.3s
- Each button: opacity 0->1, translateY(6px)->0, 0.25s ease
- Delays: 0.05s, 0.1s, 0.15s, 0.2s, 0.25s per child

**Default quick topics:** Assessment, Deployment, Data Centers, Process, Contact

### 4.8 Input Bar

- Flex row, gap 8px, padding 10px 12px
- Border-top: 1px solid `var(--glass-border)`
- Background: `var(--glass-bg)`

**Input:**
- Background: `var(--surface-container-low)`
- Border: 1px solid glass-border, accent on focus
- Border radius: 12px
- Padding: 10px 14px
- Font: 1rem, `var(--font-body)`
- Max length: 500

**Send button:**
- 40x40, border-radius 12px
- Accent background, #050508 color
- Hover: brightness(1.1)

### 4.9 Conversation Logic

- Keyword-based matching with regex patterns for 10 topic areas
- Fallback: calls `/api/chat` endpoint (POST, JSON) with 15s timeout via AbortController
- XSS protection: uses textContent (not raw HTML insertion) for user messages; link hrefs validated against allowlist pattern for relative URLs, anchors, and jinki.ai domain
- No session persistence between page loads

### 4.10 Z-Index Layers

| Layer | Z-Index | Element |
|-------|---------|---------|
| Mobile sticky CTA | 9998 | `.mobile-sticky-cta` |
| Chatbot root | 9999 | `.jc-root` |
| Nav header | 1000 | `#site-nav` |
| Mobile panel | 1001 | `.mobile-panel` |
| Mobile backdrop | 1000 | `.mobile-backdrop` |
| Cookie banner | 10000 | `.cookie-banner` |
| Cookie prefs modal | 10001 | `.cookie-prefs-overlay` |

---

## 5. Cookie Consent

**File:** `src/components/CookieConsent.astro`

### 5.1 Banner

- Position: fixed, bottom 0, full width
- Z-index: 10000
- Default: translateY(100%), pointer-events none
- Visible: translateY(0), pointer-events auto
- Transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1)
- Mobile bottom padding: `env(safe-area-inset-bottom)`

**Inner container:**
- Max width: 1200px, centered
- Padding: 20px 24px
- Flex row (desktop), column (mobile <=767px)
- Gap: 24px (desktop), 16px (mobile)
- Glass bg: `var(--glass-bg, rgba(28,32,36,0.92))`
- Backdrop filter: blur(20px)
- Border-top: 1px solid glass-border
- Shadow: 0 -8px 32px rgba(0,0,0,0.2)

**Text:** `var(--font-body)`, 0.875rem, line-height 1.5
**Privacy link:** 0.75rem, accent color, underlined

### 5.2 Action Buttons (No Dark Patterns)

| Button | Style | Font Size |
|--------|-------|-----------|
| Reject All | Transparent bg, text-secondary color, glass border | 0.8rem |
| Accept All | Accent bg, #050508 color | 0.8rem |
| Preferences | Transparent bg, text-tertiary color, transparent border | 0.75rem |

All buttons: `var(--font-headline)`, weight 600, uppercase, letter-spacing 0.04em, padding 10px 20px, border-radius 8px

Mobile: Accept and Reject flex to `flex: 1`, Preferences full width

### 5.3 Preferences Modal

**Overlay:** Fixed inset, z-index 10001, rgba(0,0,0,0.6), blur(4px), opacity transition 0.3s
**Panel:** max-width 480px, width 90%, border-radius 16px, shadow 0 24px 80px rgba(0,0,0,0.4)

**Categories:**

| Category | Toggle | Description |
|----------|--------|-------------|
| Essential | Always On badge (no toggle) | Required for the site to function |
| Analytics | Checkbox toggle | Helps us understand how visitors use the site |
| Marketing | Checkbox toggle | Used to deliver relevant content |

**Toggle switch:**
- 40x22px, border-radius 11px
- Track: rgba(255,255,255,0.1) off, accent on
- Thumb: 16x16 white circle, 3px offset
- Checked: translateX(18px)
- Focus-visible: 2px accent outline, 2px offset

**Save Preferences button:** Same as Accept All style

### 5.4 Consent Storage

- Key: `jinki-consent` in localStorage
- Schema: `{ essential: true, analytics: bool, marketing: bool, timestamp: ISO string, version: "1.0" }`
- Global access: `window.__jinkiConsent`
- Reopener: any element with `[data-cookie-settings]` attribute reopens the banner (used in footer Cookies link)

### 5.5 Dismissal

- Accept All: saves analytics=true, marketing=true
- Reject All: saves analytics=false, marketing=false
- Save Preferences: saves per toggle state
- Banner hidden via class removal + aria-hidden
- Prefs modal closes on: close button, overlay click, Escape key

---

## 6. Layout Shell

**File:** `src/layouts/Layout.astro`

### 6.1 HTML Head

**Meta tags:**
- charset UTF-8
- viewport: width=device-width, initial-scale=1.0
- description: from props (default provided)
- robots: index, follow, max-image-preview:large, max-snippet:-1
- author: Jinki Aerial Intelligence
- theme-color: #121416 (dark) / #fafbfc (light), media query split
- canonical URL constructed from `Astro.url.pathname`
- view-transition: same-origin

**Open Graph:** title, description, type=website, url, image (1200x630), site_name, locale
**Twitter:** summary_large_image card, creator @jinkiai

**Structured Data:**
- Organization schema on every page (name, url, logo, description, contactPoint, areaServed, serviceType)
- Optional page-specific JSON-LD via `jsonLd` prop

**Font preloading:** Space Grotesk and Inter woff2 files preloaded
**Material Symbols:** Loaded async via `onload` pattern with noscript fallback
**DNS prefetch:** api.web3forms.com, api.groq.com

**Icons:** favicon.svg, favicon.ico (32x32), apple-touch-icon (180x180)
**PWA:** manifest.json, apple-mobile-web-app-capable, format-detection telephone=no

### 6.2 Theme Script (Blocking, Inline)

Runs synchronously in `<head>` to prevent FOUC:
1. Checks localStorage for `jinki-theme`
2. Falls back to `prefers-color-scheme` media query
3. Sets `data-theme` attribute on `<html>`

### 6.3 Body Structure

```
.scroll-progress (aria-hidden)
a.skip-to-content (Skip to main content)
<slot /> (page content)
#aria-live-region (sr-only, polite, atomic)
<Chatbot />
<CookieConsent />
.mobile-sticky-cta (mobile only)
<script> (scroll/reveal/counter/tilt/magnetic)
```

### 6.4 Scroll Progress Bar

- Class: `.scroll-progress`
- Positioned via global CSS (expected fixed top, full width)
- Updated via `scaleX(pct)` transform on scroll
- Debounced with requestAnimationFrame ticking pattern

### 6.5 Reveal Animation System

- Targets: `.reveal` elements
- Uses IntersectionObserver (threshold 0.1, rootMargin "0px 0px -40px 0px")
- Above-fold elements: immediately revealed (getBoundingClientRect check)
- Below-fold: observed, then `.revealed` class added on intersection, unobserved after
- Noscript fallback: `.reveal { opacity: 1 !important; transform: none !important; }`

### 6.6 Counter Animation

- Targets: `[data-count]` elements
- IntersectionObserver with threshold 0.3
- Duration: 1500ms with cubic ease-out (1 - (1-t)^3)
- Supports decimal values (checks for "." in data-count)
- Optional `data-suffix` attribute appended to display

### 6.7 Card Tilt

- Targets: `[data-tilt]` elements
- Perspective: 800px
- Max rotation: 4deg on each axis
- Includes translateY(-2px) lift
- Resets on mouseleave
- Disabled for `prefers-reduced-motion: reduce`

### 6.8 Magnetic CTA

- Targets: `.btn-premium`, `.cta-primary` elements
- Pull factor: 0.15x of cursor offset from center
- Resets on mouseleave
- Disabled for `prefers-reduced-motion: reduce`

### 6.9 Mobile Sticky CTA

- Hidden on desktop (display: none)
- Visible on mobile (<=767px): fixed bottom, full width
- Default: translateY(100%), slides up via `.visible` class
- Appears after scrolling 400px (controlled by scroll listener)
- Z-index: 9998
- Glass background: rgba(18,20,22,0.95), blur(16px)
- Border-top: 1px solid rgba(0,229,255,0.1)
- CTA link: full-width block, 14px padding, gradient background (accent -> #00a8b5), 12px border-radius
- Safe area: padding-bottom uses `env(safe-area-inset-bottom)`
- Light mode: white background, subtle shadow

### 6.10 Skip to Content Link

- Class: `.skip-to-content`
- Targets `#main-content`
- Visually hidden by default, appears on focus (expected via global CSS)

### 6.11 ARIA Live Region

- ID: `aria-live-region`
- Attributes: `aria-live="polite"`, `aria-atomic="true"`
- Visually hidden (sr-only pattern with clip-rect)
- Used by LeadGen form success to announce to screen readers

---

## 7. Accessibility Audit

### 7.1 Navigation (`Nav.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| `<nav>` | `aria-label` | PASS | - | "Main navigation" |
| Logo link | `aria-label` | PASS | - | "Jinki -- Home" |
| Logo SVG | `aria-hidden` | PASS | - | Decorative |
| Dropdown triggers | `aria-expanded` | PASS | - | Toggled by JS |
| Dropdown triggers | `aria-haspopup` | PASS | - | `menu` |
| Dropdown panels | `role="menu"` | PASS | - | |
| Dropdown panels | `aria-label` | PASS | - | "Industry verticals" / "Services" |
| Dropdown items | `role="menuitem"` | PASS | - | |
| Theme toggle | `aria-label` | PASS | - | Dynamic "Switch to light/dark theme" |
| Theme toggle | `aria-pressed` | PASS | - | Toggled |
| Hamburger | `aria-label` | PASS | - | "Open menu" |
| Hamburger | `aria-expanded` | PASS | - | Toggled |
| Hamburger | Min touch target | PASS | - | 44x44px |
| Mobile panel | `aria-hidden` | PASS | - | Toggled |
| Mobile panel | Focus trap | PASS | - | Tab cycling implemented |
| Mobile panel | Escape key | PASS | - | Closes panel |
| Mobile panel | Focus management | PASS | - | Focuses first link on open, returns focus to toggle on close |
| Dropdown | Arrow key nav | PASS | - | ArrowDown/ArrowUp/Home/End/Escape/Tab |
| Dropdown | Escape key | PASS | - | Returns focus to trigger |
| Nav links | Keyboard accessible | PASS | - | Standard anchor/button elements |
| Reduced motion | Respected | PASS | - | All transitions/animations disabled |
| Mobile links | Min touch target | PASS | - | min-height 44px |
| Decorative dots | `aria-hidden` | PASS | - | On vertical color dots |
| Material icons | `aria-hidden` | PASS | - | All decorative icons marked |
| **Dropdown trigger** | **No custom :focus-visible** | **FLAG** | **Polish** | The `.nav-link` has no explicit `:focus-visible` style. Browser defaults apply but may not match the design system. |
| **Mobile link dots** | **No color context for SR** | **FLAG** | **Polish** | Color dots are hidden from SR; link text is sufficient. |

### 7.2 Footer (`Footer.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| `<footer>` | `role="contentinfo"` | PASS | - | |
| Logo link | `aria-label` | PASS | - | "Jinki -- Home" |
| Logo SVG | `aria-hidden` | PASS | - | |
| Social links | `aria-label` | PASS | - | "Follow us on X", "Connect on LinkedIn", "Follow us on Instagram" |
| Social links | `target="_blank"` | PASS | - | Has `rel="noopener noreferrer"` |
| Social SVGs | `aria-hidden` | PASS | - | |
| Status badge | `aria-label` | PASS | - | "System status" |
| Newsletter form | `aria-label` | PASS | - | "Newsletter signup" |
| Email input | `aria-label` | PASS | - | "Email address" |
| Email input | `autocomplete` | PASS | - | `email` |
| Submit button | `aria-label` | PASS | - | "Subscribe" |
| Submit SVG | `aria-hidden` | PASS | - | |
| Honeypot | `aria-hidden` | PASS | - | Container div hidden |
| Honeypot | `tabindex="-1"` | PASS | - | Removed from tab order |
| Separator dots | `aria-hidden` | PASS | - | Middot separators |
| **Newsletter errors** | **Not announced to SR** | **FLAG** | **Important** | Validation errors update textContent but the note element has no `role="alert"` or `aria-live`. Screen readers miss the error. |
| **Newsletter submit** | **No loading announcement** | **FLAG** | **Polish** | Button disables with opacity change but no SR announcement. |
| **Footer links** | **No custom :focus-visible** | **FLAG** | **Polish** | Browser defaults only. |
| **"Data Security" link** | **Possible 404** | **FLAG** | **Important** | `/data-security` is not in the known page list. Likely a broken link. |

### 7.3 LeadGen Form (`LeadGen.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| `<section>` | `aria-label` | PASS | - | "Request Intelligence Scan" |
| `<form>` | `novalidate` | PASS | - | Custom validation handles it |
| Radio inputs | `required` | PASS | - | On first radio |
| Radio inputs | `aria-describedby` | PASS | - | Points to description IDs |
| Radio cards | `:focus-visible` style | PASS | - | 2px accent outline, 2px offset |
| Text inputs | `<label>` with `for` | PASS | - | Explicit label-input association |
| Text inputs | `autocomplete` | PASS | - | Appropriate values |
| Text inputs | `maxlength` | PASS | - | Set on all fields |
| Textarea | `<label>` with `for` | PASS | - | |
| Honeypot | `aria-hidden` | PASS | - | Hidden from assistive tech |
| Honeypot | `tabindex="-1"` | PASS | - | |
| Error message | `role="alert"` | PASS | - | Dynamically created error div uses role=alert |
| Success announcement | `aria-live` region | PASS | - | Uses #aria-live-region from Layout |
| Step focus management | Auto-focus first input | PASS | - | setTimeout focus on step change |
| **Per-field errors** | **No error text** | **FLAG** | **Critical** | Fields get `.invalid` class (red border) but there is NO visible error text or `aria-describedby` error message per field. Users cannot determine what is wrong. |
| **Radio validation** | **Silent failure** | **FLAG** | **Critical** | If no radio is selected and Continue is pressed, validation fails with zero feedback. No error message or visual indication. |
| **Progress dots** | **No semantic labels** | **FLAG** | **Important** | Dots show "1" and "2" but have no `aria-label` for step context. |
| **Submit loading** | **Not announced** | **FLAG** | **Polish** | Button text changes to "Sending..." but not announced to SR. |

### 7.4 Chatbot (`Chatbot.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| Root | `role="complementary"` | PASS | - | Appropriate landmark |
| Root | `aria-label` | PASS | - | "Jinki Intelligence Concierge" |
| Launcher | `aria-label` | PASS | - | "Open Jinki Concierge chat" |
| Launcher | `aria-expanded` | PASS | - | Toggled |
| Launcher | `aria-controls` | PASS | - | Points to `jc-panel` |
| Panel | `role="dialog"` | PASS | - | |
| Panel | `aria-label` | PASS | - | "Jinki Concierge" |
| Panel | `aria-hidden` | PASS | - | Toggled |
| Minimize btn | `aria-label` | PASS | - | "Minimize chat" |
| Close btn | `aria-label` | PASS | - | "Close chat" |
| SVG icons | `aria-hidden` | PASS | - | All decorative |
| Messages | `aria-live="polite"` | PASS | - | Dynamic messages announced |
| Messages | `aria-label` | PASS | - | "Chat messages" |
| Input | `aria-label` | PASS | - | "Chat message" |
| Input | `maxlength` | PASS | - | 500 |
| Send btn | `aria-label` | PASS | - | "Send message" |
| Escape key | Closes panel | PASS | - | |
| XSS protection | textContent usage | PASS | - | User input safely handled |
| Link validation | Allowlist pattern | PASS | - | Only safe URLs allowed |
| **Dialog focus** | **No focus trap** | **FLAG** | **Important** | `role="dialog"` implies modal behavior but focus is not contained. Users can Tab to background content. Consider `role="region"` for non-modal chat. |
| **Dialog** | **Missing aria-modal** | **FLAG** | **Important** | Not set. If non-modal, role should be changed. |
| **Header buttons** | **32x32 touch target** | **FLAG** | **Polish** | Below 44x44 WCAG recommendation. |
| **Typing indicator** | **No SR text** | **FLAG** | **Polish** | Visual-only animation. No "typing..." text for screen readers. |
| **Quick replies** | **No descriptive context** | **FLAG** | **Polish** | Buttons lack "Quick reply:" prefix for SR context. |
| **Typing dots** | **Uses raw HTML string in JS** | **FLAG** | **Important** | The typing indicator is constructed with a raw HTML string assignment to element content in the `askLLM` function. While the string is static and safe, this pattern is fragile if the code evolves. |

### 7.5 Cookie Consent (`CookieConsent.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| Banner | `role="dialog"` | PASS | - | |
| Banner | `aria-label` | PASS | - | "Cookie consent" |
| Banner | `aria-hidden` | PASS | - | Toggled |
| Prefs modal | `role="dialog"` | PASS | - | |
| Prefs modal | `aria-label` | PASS | - | "Cookie preferences" |
| Prefs modal | `aria-hidden` | PASS | - | Toggled |
| Close btn | `aria-label` | PASS | - | "Close preferences" |
| Toggle inputs | `id` + `for` labels | PASS | - | Explicit association |
| Toggle focus | `:focus-visible` | PASS | - | 2px accent outline |
| Escape key | Closes prefs modal | PASS | - | |
| Overlay click | Closes prefs modal | PASS | - | |
| Reduced motion | Transitions disabled | PASS | - | |
| **Banner focus** | **No focus trap** | **FLAG** | **Important** | Users can Tab past the banner into page content. |
| **Banner focus** | **No initial focus** | **FLAG** | **Important** | Focus is not moved to the banner when it appears. |
| **Prefs modal** | **No focus trap** | **FLAG** | **Important** | Focus is not contained within the modal. |
| **Prefs modal** | **No initial focus** | **FLAG** | **Important** | Focus not moved to modal on open. |
| **Escape key** | **Inconsistent behavior** | **FLAG** | **Polish** | Escape closes prefs modal but not the main banner. |
| **Buttons** | **No custom :focus-visible** | **FLAG** | **Polish** | Browser defaults only. |

### 7.6 Breadcrumb (`Breadcrumb.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| `<nav>` | `aria-label="Breadcrumb"` | PASS | - | |
| `<ol>` | Schema.org BreadcrumbList | PASS | - | |
| Current page | `aria-current="page"` | PASS | - | |
| Separators | `aria-hidden="true"` | PASS | - | "/" hidden from SR |
| Position meta | `itemprop="position"` | PASS | - | Correct 1-indexed |
| Links | Keyboard accessible | PASS | - | Standard `<a>` elements |
| **Links** | **No custom :focus-visible** | **FLAG** | **Polish** | Browser defaults only. |

### 7.7 Layout Shell (`Layout.astro`)

| Element | Check | Status | Severity | Notes |
|---------|-------|--------|----------|-------|
| `<html lang="en">` | Language attribute | PASS | - | |
| Skip to content | Present | PASS | - | `.skip-to-content` |
| Scroll progress | `aria-hidden` | PASS | - | Decorative |
| ARIA live region | Proper attributes | PASS | - | polite, atomic, sr-only |
| Noscript fallback | Content visible | PASS | - | .reveal forced visible |
| Theme init | No FOUC | PASS | - | Blocking inline script |
| Reduced motion | Tilt/magnetic disabled | PASS | - | Checks media query |
| **Skip link target** | **#main-content not guaranteed** | **FLAG** | **Critical** | Each page must include `id="main-content"`. If omitted, the skip link fails silently. |
| **Mobile sticky CTA** | **No landmark role** | **FLAG** | **Polish** | Simple link, adequate text. |

---

## Summary of Accessibility Violations

### Critical (Must Fix Before Launch)

1. **LeadGen: No per-field error messages.** Fields show red borders but no text explaining what is wrong. Screen readers cannot convey the error. Add visible error text with `aria-describedby` linking each input to its error message.

2. **LeadGen: Silent radio validation failure.** Step 1 fails validation with no feedback whatsoever. Add a visible error message when no service is selected.

3. **Layout: Skip link target `#main-content` not guaranteed.** Every page must include an element with this ID, or the skip link is broken.

### Important (Should Fix)

4. **Footer newsletter: Validation errors not announced.** The note element changes text but has no `role="alert"` or `aria-live`. Screen readers miss the error.

5. **Footer: `/data-security` link may be a 404.** Not in the known page list.

6. **Chatbot dialog: No focus trap.** `role="dialog"` implies modal behavior but focus is not contained. Consider switching to `role="region"` or adding a focus trap.

7. **Chatbot dialog: Missing `aria-modal`.** If intended as non-modal, change role to `region`. If modal, add `aria-modal="true"` and focus trap.

8. **Chatbot: Raw HTML string in askLLM typing indicator.** Safe currently but fragile pattern.

9. **Cookie banner: No focus management.** Banner appears without receiving focus. Keyboard users may not notice it.

10. **Cookie preferences modal: No focus trap or initial focus.** Users can Tab out of the modal.

11. **LeadGen progress dots: No semantic labels.** Dots show numbers but no indication of what each step represents.

### Polish (Nice to Have)

12. Nav dropdown triggers: No custom `:focus-visible` style.
13. Footer links: No custom `:focus-visible` style.
14. Breadcrumb links: No custom `:focus-visible` style.
15. Cookie buttons: No custom `:focus-visible` style.
16. Chatbot header buttons: 32x32 touch targets (below 44x44 recommendation).
17. Chatbot typing indicator: No screen reader text.
18. Chatbot quick replies: No "Quick reply" context for screen readers.
19. LeadGen submit loading state: Not announced to screen readers.
20. Footer newsletter submit: Loading state not announced.

---

*End of specification.*
