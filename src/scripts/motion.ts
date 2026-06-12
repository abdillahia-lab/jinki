/*
  motion.ts — the deferred premier-motion layer (W1/W2).
  Loaded ONLY behind the capability gate in Base.astro (fine pointer,
  no reduced-motion, idle). Provides:
  - Lenis momentum scrolling synced to GSAP's ticker (the documented
    pattern: lenis.raf on gsap.ticker, ScrollTrigger.update on scroll)
  - magnetic primary CTAs ([data-magnetic], ≤6px pull)
  - the custom cursor accent ring
  Exposes gsap/ScrollTrigger for set pieces (Mission Player).
*/
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.05,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- magnetic CTAs ---------- */
document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    xTo(Math.max(-6, Math.min(6, dx * 0.15)));
    yTo(Math.max(-6, Math.min(6, dy * 0.15)));
  });
  el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
});

/* ---------- cursor accent ring (native cursor stays — the ring is an
   instrument accent, not a replacement) ---------- */
const ring = document.createElement('div');
ring.setAttribute('aria-hidden', 'true');
ring.style.cssText = `
  position: fixed; top: 0; left: 0; width: 28px; height: 28px;
  border: 1.5px solid var(--signal); border-radius: 999px;
  pointer-events: none; z-index: 90; opacity: 0;
  translate: -50% -50%; mix-blend-mode: difference;
  transition: width .2s, height .2s, border-radius .2s, opacity .3s;
`;
document.body.appendChild(ring);
let rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry, seen = false;
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  tx = e.clientX; ty = e.clientY;
  if (!seen) { seen = true; rx = tx; ry = ty; ring.style.opacity = '1'; }
  const overInteractive = (e.target as Element | null)?.closest?.(
    'a, button, [role="button"], input, select, textarea, summary, [data-instrument]'
  );
  if (overInteractive) {
    ring.style.width = '40px';
    ring.style.height = '40px';
    ring.style.borderRadius = '4px'; // bracket read — the registration motif
  } else {
    ring.style.width = '28px';
    ring.style.height = '28px';
    ring.style.borderRadius = '999px';
  }
}, { passive: true });
document.addEventListener('mouseleave', () => { ring.style.opacity = '0'; seen = false; });
gsap.ticker.add(() => {
  rx += (tx - rx) * 0.22;
  ry += (ty - ry) * 0.22;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  ring.style.translate = '-50% -50%';
});

export { gsap, ScrollTrigger, lenis };
