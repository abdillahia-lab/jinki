/*
  reveal-fallback.ts — universal entrances (W1).
  Chromium animates reveals via CSS animation-timeline; Safari/Firefox
  get the same grammar from this ~1.2KB IO fallback: add .in, CSS
  transitions do the rest (interruptible by design).
*/
const sda = CSS.supports('animation-timeline: view()');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!sda && !reduced) {
  const els = document.querySelectorAll('.rise, .rise-stagger, .rule-draw');
  if (els.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    els.forEach((el) => {
      // Above-the-fold content shows immediately — no entrance pop on load
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.9) el.classList.add('in');
      else io.observe(el);
    });
  }
}
