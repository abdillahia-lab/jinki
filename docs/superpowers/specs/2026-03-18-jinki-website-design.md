# Jinki Aerial Intelligence Website — Design Spec

## Overview
Production-ready marketing website for Jinki Aerial Intelligence (jinki.ai). Cinematic authority aesthetic, dark-first with light mode toggle, Astro + Tailwind CSS.

## Brand Position
Jinki is an **aerial intelligence firm** — not a drone manufacturer. Messaging centers on autonomous systems, AI-driven insights, and aerial data intelligence across multiple verticals.

## Tech Stack
- Astro v5 (SSG)
- Tailwind CSS v4
- Vanilla JS (IntersectionObserver scroll animations, theme toggle, mobile nav)
- No framework dependencies (React/Vue)
- Self-hosted fonts (Space Grotesk, JetBrains Mono)

## Color System (CSS Custom Properties)
| Token | Dark | Light |
|-------|------|-------|
| --bg-primary | #050508 | #FAFBFC |
| --bg-elevated | #0C0C12 | #FFFFFF |
| --bg-card | #12121A | #F4F5F7 |
| --text-primary | #F0F0F5 | #111118 |
| --text-secondary | #8A8A9A | #555566 |
| --accent | #00D4FF | #0088CC |
| --accent-glow | rgba(0,212,255,0.15) | rgba(0,136,204,0.10) |
| --border | rgba(255,255,255,0.06) | rgba(0,0,0,0.08) |

## Typography
- Primary: Space Grotesk (self-hosted)
- Monospace: JetBrains Mono (data/stats)
- Hero: 72px / -0.03em / 600 weight
- Section headings: 48px / -0.02em / 500
- Body: 18px / 400 / 1.7 line-height
- Labels: 13px / uppercase / 0.08em tracking

## Sections
1. **Nav** — Sticky, transparent-to-solid on scroll, logo left, links center, CTA + theme toggle right, hamburger on mobile
2. **Hero** — Full-viewport video bg (placeholder with swap instructions), bold headline, subtitle, primary CTA
3. **About/Mission** — Split layout: mission statement left, key stats/metrics right
4. **Capabilities** — Icon cards in grid, 4 core capabilities with hover effects
5. **Use Cases** — 4 vertical cards (Infrastructure, Data Centers, Security, Agriculture) with expand/detail
6. **Blog** — Content collection, listing page + post template
7. **Contact** — Split: form left, company info right
8. **Footer** — Nav links, social, legal, newsletter signup

## Interactions
- Scroll-triggered fade-up reveals (IntersectionObserver, 20px translate, 0.6s ease)
- Staggered card animations (100ms delay between items)
- Nav transparency transition on scroll
- Button hover: accent glow + slight scale
- Card hover: border glow + subtle lift
- Theme toggle: smooth CSS transition on all themed properties
- prefers-reduced-motion: disable all animations

## Use Case Verticals
1. Infrastructure Inspection (power lines, pipelines, bridges, cell towers, solar farms)
2. Data Center Monitoring (facility aerial intelligence)
3. Perimeter Security (corporate/private business)
4. Agriculture & Land (crop monitoring, precision ag, surveying)

## CTA Strategy
- Primary: "Get in Touch" (hero + nav)
- Secondary: "Learn More" (sections), "Read More" (blog)

## Nielsen's Heuristics Application
1. Visibility: loading states, active nav, form validation feedback
2. Real-world match: industry-specific terminology per vertical
3. User control: always-visible nav, escape from modals, back navigation
4. Consistency: unified card styles, icon system, interaction patterns
5. Error prevention: inline form validation, disabled submit until valid
6. Recognition: clear labels, visual hierarchy, breadcrumbs on blog
7. Flexibility: keyboard navigation, skip-to-content
8. Minimalist design: only content that serves the mission
9. Error recovery: clear error messages with fix suggestions
10. Help: contextual tooltips, FAQ in contact section

## Accessibility
- WCAG 2.2 AA compliance
- 4.5:1 contrast ratios minimum
- Keyboard navigable throughout
- prefers-reduced-motion respected
- Skip-to-content link
- Semantic HTML5 landmarks
- Alt text on all images
