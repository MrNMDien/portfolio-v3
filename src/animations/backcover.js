/* ============================================================================
   BACK COVER — the last page (MOTION.md §9).
   The headline inks in with the rest of the issue's headlines; the address
   rises and rules itself gold; the colophon sets in two columns. The foil pass
   on hover lives in foil.js — this file only owns the arrival.
   ========================================================================= */

import { gsap, E, reduced, primeFade, fadeTween, onceInView } from './core.js';

export function initBackCover() {
  const section = document.getElementById('contact');
  if (!section) return;

  const email = section.querySelector('.email');
  const rule = section.querySelector('.email__rule');
  const colophon = Array.from(section.querySelectorAll('.colophon__cols p'));

  if (email) primeFade(email, 18);
  if (rule && !reduced) {
    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' });
  }
  if (colophon.length) primeFade(colophon, 14);

  if (email) {
    onceInView(email, () => {
      const tl = gsap.timeline();
      const rise = fadeTween(email);
      if (rise) tl.add(rise, 0);

      if (rule) {
        tl.to(
          rule,
          {
            scaleX: 1,
            duration: reduced ? 0.15 : 0.7,
            ease: E.rule,
            onComplete: () => gsap.set(rule, { clearProps: 'transform' }),
          },
          reduced ? 0 : 0.25,
        );
      }
    });
  }

  if (colophon.length) {
    onceInView(colophon[0].closest('.colophon') ?? colophon[0], () => {
      fadeTween(colophon, { stagger: reduced ? 0 : 0.12 });
    });
  }
}
