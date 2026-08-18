/* ============================================================================
   THE GLOW (MOTION.md §12).
   The gold wash behind the cover breathes: a 12s sine, so slow it is felt
   rather than watched. It stops when the tab is not being looked at — an
   infinite tween in a hidden tab is just a battery bill.

   The gradient itself carries alpha .075, so the element's own opacity is
   driven between .67 and .93 to land the spec's effective .05 -> .07.
   ========================================================================= */

import { gsap, E, reduced } from './core.js';

export function initGlow() {
  const glow = document.querySelector('.cover__glow');
  if (!glow || reduced) return;

  gsap.set(glow, { transformOrigin: '70% 32%', opacity: 0.67 });

  const breathe = gsap.to(glow, {
    scale: 1.04,
    opacity: 0.93,
    duration: 12,
    ease: E.breathe,
    repeat: -1,
    yoyo: true,
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) breathe.pause();
    else breathe.resume();
  });

  return breathe;
}
