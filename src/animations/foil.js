/* ============================================================================
   FOIL — gold catching the light (MOTION.md §10).
   Held to three places on the whole issue: the contact email, the contents
   page numbers on hover, and the gold unit once its number has finished
   counting. One pass of 0.8s each time. It never loops — a looping shimmer
   would turn foil into neon.
   ========================================================================= */

import { gsap, reduced, mixToward, PAPER_RGB } from './core.js';

const SWEEP = 0.8;

/* Read the token, do not copy its value. The hover delay below has to outlast
   the colour transition CSS runs on the same element, and that transition is
   written in --dur-fast; a hard 0.32 here would go quietly wrong the day
   --dur-fast moves. */
function tokenSeconds(name, fallback) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith('ms') ? n / 1000 : n;
}

/* The gradient is built from the element's own resting colour mixed toward
   paper, so the highlight is that colour catching light — not a new colour. */
export function foilSweep(el, { delay = 0 } = {}) {
  if (!el || reduced || el.dataset.foiling === '1') return;
  el.dataset.foiling = '1';

  gsap.delayedCall(delay, () => {
    const base = getComputedStyle(el).color;
    const hi = mixToward(base, PAPER_RGB, 0.5);

    el.style.backgroundImage = `linear-gradient(100deg, ${base} 0 40%, ${hi} 50%, ${base} 60% 100%)`;
    el.style.setProperty('--foil-x', '108');
    el.classList.add('is-foiling');

    gsap.to(el, {
      '--foil-x': -8,
      duration: SWEEP,
      ease: 'power2.inOut',
      onComplete: () => {
        el.classList.remove('is-foiling');
        el.style.backgroundImage = '';
        el.style.removeProperty('--foil-x');
        delete el.dataset.foiling;
      },
    });
  });
}

export function initFoil() {
  if (reduced) return;

  /* Both hover targets tween their colour first, over --dur-fast, and the
     sweep freezes whatever colour it reads. Waiting a frame past that settle
     keeps a half-transitioned colour out of the gradient, and doubles as an
     intent filter against a cursor merely passing through. */
  const HOVER_DELAY = tokenSeconds('--dur-fast', 0.28) + 0.04;

  document.querySelectorAll('.email').forEach((email) => {
    const text = email.querySelector('.email__text');
    if (!text) return;
    email.addEventListener('mouseenter', () => foilSweep(text, { delay: HOVER_DELAY }));
    email.addEventListener('focus', () => foilSweep(text, { delay: HOVER_DELAY }));
  });

  document.querySelectorAll('.toc--page .toc__row').forEach((row) => {
    const page = row.querySelector('.toc__page');
    if (!page) return;
    row.addEventListener('mouseenter', () => foilSweep(page, { delay: HOVER_DELAY }));
  });
}
