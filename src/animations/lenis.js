/* ============================================================================
   LENIS — the paper stock.
   lerp 0.09 is deliberately heavier than a default smooth-scroll: the issue is
   printed on thick stock and should feel like it (MOTION.md §12).
   ========================================================================= */

import Lenis from 'lenis';
import { gsap, ScrollTrigger, reduced } from './core.js';

let lenis = null;

/* power3.inOut as a plain function — Lenis takes an easing callback, not a
   GSAP ease string, and anchors must match the page's easing vocabulary. */
const power3InOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const ANCHOR_DURATION = 1.2;

/* Measured from the running head itself rather than parsed out of the token,
   so it stays correct whatever unit --chrome-top is written in. */
export function chromeTop() {
  const head = document.querySelector('.runhead');
  const h = head?.getBoundingClientRect().height;
  return h && h > 0 ? h : 38;
}

function chromeOffset() {
  return -(chromeTop() + 16);
}

export function initLenis() {
  if (!reduced) {
    lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
      autoRaf: false,
    });

    /* ScrollTrigger reads scroll position from Lenis' own loop. */
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* The overlay menu freezes the page (base.css does it with :has); Lenis
       has to be told, or the frozen page still scrolls underneath. */
    const menu = document.getElementById('menu');
    menu?.addEventListener('toggle', () => {
      if (menu.open) lenis.stop();
      else lenis.start();
    });
  }

  initAnchors();
  return lenis;
}

/* Every in-page link — contents, cover lines, menu, skip link — travels at the
   same 1.2s power3.inOut (MOTION.md §3). */
function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();

    const menu = document.getElementById('menu');
    if (menu?.open) menu.open = false;

    if (lenis) {
      lenis.scrollTo(target, {
        offset: chromeOffset(),
        duration: ANCHOR_DURATION,
        easing: power3InOut,
      });
    } else {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    }

    /* Keep the keyboard where the pointer went. */
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    if (history.replaceState) history.replaceState(null, '', id);
  });
}

export function getLenis() {
  return lenis;
}
