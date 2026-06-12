/*
  motion.ts — the deferred premier-motion layer (W1/W2).
  Loaded ONLY behind the capability gate in Base.astro (fine pointer,
  no reduced-motion, idle). Provides:
  - Lenis momentum scrolling synced to GSAP's ticker (the documented
    pattern: lenis.raf on gsap.ticker, ScrollTrigger.update on scroll)
  - magnetic primary CTAs ([data-magnetic], ≤6px pull)
  The cursor stays native — feedback lives on the components (hover
  states, magnetic pull), not on a custom cursor. (Owner direction.)
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

export { gsap, ScrollTrigger, lenis };
