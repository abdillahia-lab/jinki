# iOS & Web Platform Improvements — Strategic Analysis

**Date:** 2026-03-30
**Target user:** Facility manager browsing on iPhone (B2B conversion path)
**Strategy:** "Invisible Performance" — improvements users feel but can't name
**Principle:** Vertical slice — parse, seed, deploy, test. One thing at a time.

---

## Current State

Astro v5 static site deployed on Cloudflare Pages. Technically strong foundation:
- View transitions (same-origin, named elements for nav persistence)
- GPU-optimized animations (transform/opacity only, will-change strategy)
- Safe-area insets, 100dvh, prefers-reduced-motion (30+ instances)
- Self-hosted variable fonts with preload + font-display: swap
- Strong CSP, HSTS preload, Permissions-Policy
- Scroll-driven animation CSS already exists (`@supports (animation-timeline: view())`)
- PWA manifest exists but no Service Worker (intentional — B2B marketing site doesn't need offline)

**Gaps identified:** Form inputs lack mobile keyboard hints, IntersectionObserver JS runs even when CSS scroll-driven animations handle it, no native share capability, chatbot uses hand-rolled focus management, no speculative prerendering.

---

## Priority Stack (ordered by conversion impact)

### 1. Form Input Optimization

**Friction:** Facility manager tapping email field gets generic keyboard. Must manually find `@` key. "Return" button doesn't indicate action.

**Solution:** Add `inputmode` and `enterkeyhint` attributes to all form inputs.

**Changes:**

| File | Field | Add |
|------|-------|-----|
| `src/components/LeadGen.astro` | Name (line ~95) | `enterkeyhint="next"` |
| `src/components/LeadGen.astro` | Company (line ~100) | `enterkeyhint="next"` |
| `src/components/LeadGen.astro` | Role (line ~105) | `enterkeyhint="next"` |
| `src/components/LeadGen.astro` | Email (line ~109) | `inputmode="email"` `enterkeyhint="next"` |
| `src/components/LeadGen.astro` | Message (line ~115) | `enterkeyhint="send"` |
| `src/components/Footer.astro` | Newsletter email | `inputmode="email"` `enterkeyhint="send"` |
| `src/pages/careers.astro` | Name (`apply-name`) | `enterkeyhint="next"` |
| `src/pages/careers.astro` | Email (`apply-email`) | `inputmode="email"` `enterkeyhint="next"` |
| `src/pages/careers.astro` | LinkedIn (`apply-linkedin`) | `inputmode="url"` `enterkeyhint="next"` |
| `src/pages/careers.astro` | Message textarea | `enterkeyhint="send"` |
| `src/components/Chatbot.astro` | Chat input (line ~42) | `enterkeyhint="send"` |

**Why `inputmode="email"` matters:** iOS shows the `@` and `.com` keys on the primary keyboard layout. No hunting.

**Why `enterkeyhint` matters:** The blue "Return" key on iOS changes to "Next" (with a forward arrow) or "Send" (with an up arrow). Users see clear intent, not a generic key.

**Effort:** 10 minutes. Zero risk. No visual change.
**Impact:** Direct conversion improvement on the primary CTA path.

---

### 2. Speculation Rules for Instant Navigation

**Friction:** Page transitions have a visible fetch delay. View transitions mask the swap but don't eliminate the wait.

**Solution:** Add `<script type="speculationrules">` to prerender likely next pages on hover/pointer-down.

**Changes:**

File: `src/layouts/Layout.astro`

Add before `</head>`:
```html
<script type="speculationrules">
{
  "prerender": [
    {
      "where": { "href_matches": [
        "/services/audit",
        "/verticals/*",
        "/about",
        "/security"
      ]},
      "eagerness": "moderate"
    }
  ]
}
</script>
```

**How it works:**
- `eagerness: "moderate"` = prerender on hover or pointerdown (not on page load)
- Browser fetches and renders the page in a hidden tab
- When user clicks, the pre-rendered page swaps in instantly (~0ms navigation)
- Combined with existing view transitions → feels like a native app

**Browser support:**
- Chrome 122+, Edge 122+: full support (`where` + `href_matches` syntax)
- Safari: does NOT support Speculation Rules — needs prefetch fallback
- Firefox: does NOT support

**Fallback for Safari/Firefox:** Hover-triggered prefetch for browsers without Speculation Rules support:
```javascript
if (!HTMLScriptElement.supports?.('speculationrules')) {
  document.querySelectorAll('a[href^="/"]').forEach(function(a) {
    a.addEventListener('pointerenter', function() {
      if (!document.querySelector('link[href="' + a.pathname + '"]')) {
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = a.pathname;
        document.head.appendChild(link);
      }
    }, { once: true });
  });
}
```
This mirrors the "moderate" eagerness — prefetch on hover, one request per link.

**Effort:** 30 minutes including fallback.
**Impact:** Near-instant navigation on Chrome/Edge (majority of desktop traffic). Faster navigation on Safari (prefetch cache hit).

---

### 3. CSS Scroll-Driven Animation Deduplication

**Friction:** The JS IntersectionObserver (Layout.astro lines 189-206) and the CSS `@supports (animation-timeline: view())` block (global.css lines 581-596) both handle scroll reveals. On browsers with `animation-timeline` support and Chrome 115+, both run — the CSS handles the animation, but the JS still observes every `.reveal` element and toggles `.revealed` classes unnecessarily.

**Solution:** Gate the JS observer behind a feature check, but preserve above-fold instant reveals.

**Critical detail:** The JS currently marks above-fold `.reveal` elements with `.revealed` immediately (no animation). The CSS `@supports` block targets `.reveal:not(.revealed)` — it skips elements that already have `.revealed`. If we naively gate all the JS, above-fold elements would get scroll-driven animations instead of being instantly visible.

**Change in `src/layouts/Layout.astro`:**

Replace the existing reveal observer setup with:
```javascript
var reveals = document.querySelectorAll('.reveal');
reveals.forEach(function(el) {
  var rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight + 100) {
    // Above-fold elements always get instant reveal (all browsers)
    el.classList.add('revealed');
  } else if (!CSS.supports('animation-timeline', 'view()')) {
    // Below-fold: only use IO when CSS scroll-driven animations aren't available
    observer.observe(el);
  }
});
```

**What this does:**
- Above-fold elements: instant `.revealed` class in ALL browsers (no animation, no flash)
- Below-fold elements on modern browsers: CSS scroll-driven animations handle it (no JS observer)
- Below-fold elements on older browsers: existing IntersectionObserver fallback (unchanged behavior)

**Effort:** 10 minutes. Low risk with this structured approach.
**Impact:** Less JS execution per page on modern browsers. Compositor-threaded animations where supported.

---

### 4. Web Share API on Key Pages

**Friction:** No native share button. Facility manager who wants to send a page to their boss must manually copy the URL.

**Solution:** Add a share button that triggers `navigator.share()` — the native iOS share sheet.

**Implementation pattern:**
```html
<button class="share-btn" aria-label="Share this page" style="display:none;">
  <span class="material-symbols-outlined">share</span>
</button>

<script>
  if (navigator.share) {
    var btn = document.querySelector('.share-btn');
    if (btn) {
      btn.style.display = 'flex';
      btn.addEventListener('click', function() {
        navigator.share({
          title: document.title,
          url: window.location.href
        });
      });
    }
  }
</script>
```

**Where to add:**
- Blog post pages (`blog/[slug].astro`) — near the article header
- Vertical pages (data-centers, energy-grid, security, agriculture) — near the hero CTA area

**Progressive enhancement:** Button is hidden by default, only shown when `navigator.share` is available (iOS Safari, Android Chrome, macOS Safari 15+). Desktop Chrome/Firefox without share API see nothing — no broken UI.

**Effort:** 30 minutes across files.
**Impact:** Enables the "send this to my boss" moment — critical in B2B buying cycles.

---

### 5. Popover API for Chatbot Panel

**Friction:** Chatbot.astro has ~60 lines of hand-rolled JS for panel open/close, backdrop management, escape-to-close, focus trapping, and aria-hidden toggling.

**Solution:** Replace with native `popover="auto"` attribute. Browser handles top-layer, backdrop, escape, focus.

**Changes in `src/components/Chatbot.astro`:**

HTML:
```html
<button popovertarget="jc-panel" class="jc-launcher">Ask Jinki</button>
<div id="jc-panel" popover="auto" class="jc-panel">
  <!-- existing panel content -->
</div>
```

CSS additions:
```css
#jc-panel {
  /* Entry animation */
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: opacity 0.3s var(--ease-out-premium),
              transform 0.3s var(--ease-out-premium),
              display 0.3s allow-discrete;
}

#jc-panel:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@starting-style {
  #jc-panel:popover-open {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}

#jc-panel::backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
```

**JS removed:**
- Manual `classList.toggle('open')` logic
- `aria-hidden` toggling (browser handles it)
- Backdrop click handler (browser handles light-dismiss)
- Escape key handler (browser handles it)

**JS kept:**
- Chat message sending/receiving logic (unchanged)
- Input handling and API calls (unchanged)

**Focus management note:** The Popover API does NOT provide focus trapping. It auto-focuses the first focusable element on open and restores focus on close, but tab can escape the popover. For a chat widget this is acceptable — the user should be able to tab back to the page if they want. Full focus trapping (as in a modal dialog) is not the right pattern for a chat assistant.

**Browser support:**
- Popover API: Baseline Newly Available (Jan 2025) — all browsers
- `@starting-style` + `transition-behavior: allow-discrete`: Chrome 117+, Safari 17.4+, Firefox 129+
- Graceful degradation: browsers without `@starting-style` show the panel without entry animation (still functional)

**Effort:** 1-2 hours. Medium risk — must verify chat input focus behavior in popover context.
**Impact:** ~50 lines of JS removed. Better accessibility defaults. Smoother entry animation where supported.

---

### 6. Container Queries for BentoStats

**Friction:** BentoStats cards use `@media (max-width: 767px)` to switch from multi-column to single-column. The cards respond to the viewport, not their container. If the component is ever placed in a narrower context, it won't adapt.

**Solution:** Use container queries so cards respond to their parent's width.

**Changes in `src/components/BentoStats.astro`:**

```css
.bento-container {
  container-type: inline-size;
  container-name: bento;
}

@container bento (max-width: 600px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
}

@container bento (min-width: 601px) and (max-width: 900px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**Browser support:** Container queries are Baseline Widely Available (since Sept 2022). Zero risk.

**Effort:** 30 minutes for BentoStats. Can extend to other grids later.
**Impact:** Component-level responsiveness. Architectural foundation for reuse.

---

## Implementation Order

Each improvement is a complete vertical slice: implement, build verify, test on mobile preview, commit.

| Order | Improvement | Effort | Risk |
|-------|-------------|--------|------|
| 1 | Form input optimization | 10 min | Zero |
| 2 | Scroll-driven animation dedup | 5 min | Low |
| 3 | Speculation Rules + prefetch fallback | 30 min | Low |
| 4 | Web Share API | 30 min | Low |
| 5 | Popover API for chatbot | 1-2 hr | Medium |
| 6 | Container queries for BentoStats | 30 min | Low |

---

## Verification

After each slice:
1. `npx astro build` — zero errors
2. Mobile preview at 375x812 (iPhone 14) — dark + light mode
3. Specific test per improvement:
   - **Forms:** Verify iOS keyboard shows `@` key on email field, "Next"/"Send" on return key
   - **Scroll animations:** Verify reveals work in Safari (with scroll-driven animation support)+ without JS observer running
   - **Speculation Rules:** Check Chrome DevTools > Application > Speculative loads
   - **Share:** Verify button appears on iOS Safari, hidden on unsupported browsers
   - **Popover:** Verify chatbot opens/closes, escape works, backdrop works, focus returns
   - **Container queries:** Resize viewport to verify cards respond to container not viewport

---

## What We're NOT Doing (and why)

- **PWA Service Worker:** B2B marketing site doesn't need offline mode. Push notification delivery on iOS is ~33% reliable. Install friction is too high.
- **Anchor Positioning:** Firefox doesn't support it yet. Not worth the fallback complexity.
- **`contrast-color()`:** Safari-only. Not cross-browser.
- **Cross-document View Transitions:** Still in Interop 2026. The site already has same-document transitions.
- **`text-box-trim`:** Optical refinement. Nice but doesn't move the conversion needle.
