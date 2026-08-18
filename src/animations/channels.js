/* ============================================================================
   CHANNELS — the sticky stack (MOTION.md §6).
   Four chapter openers laid on top of one another like sheets: each card
   parks under the running head while the next one rides up and covers it, and
   the covered sheet settles back a little and loses a touch of light.

   The stacking itself is CSS position: sticky, not a ScrollTrigger pin. There
   is no pin-spacer to keep in sync, nothing to re-measure on resize, and it
   agrees with the running head, which Phase 1 already made sticky per spread.
   GSAP only drives the recede of the covered card and the name reveal.
   ========================================================================= */

import {
  gsap,
  ScrollTrigger,
  D,
  E,
  reduced,
  primeInk,
  inkTween,
} from './core.js';
import { chromeTop } from './lenis.js';

export function initChannels() {
  const stack = document.querySelector('.stack');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.stack__card'));
  if (!cards.length) return;

  const names = cards.map((c) => c.querySelector('.stack__name')).filter(Boolean);
  primeInk(names);

  const mm = gsap.matchMedia();

  mm.add(
    {
      stacked: '(min-width: 1024px)',
      plain: '(max-width: 1023.98px)',
    },
    (ctx) => {
      const { stacked } = ctx.conditions;

      if (stacked && !reduced) {
        stack.classList.add('is-stacked');

        /* Each card recedes as the next one climbs over it. Scrubbed, so it
           runs both ways — the one exception to "never replay" (MOTION.md §12). */
        cards.slice(0, -1).forEach((card, i) => {
          gsap.fromTo(
            card,
            { scale: 1, filter: 'brightness(1)' },
            {
              scale: 0.97,
              filter: 'brightness(0.96)',
              ease: 'none',
              transformOrigin: 'center top',
              scrollTrigger: {
                trigger: cards[i + 1],
                start: 'top bottom',
                end: () => `top top+=${chromeTop()}`,
                scrub: 0.35,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      }

      /* The serif channel name inks in when the sheet owns half the viewport
         (stacked) or on the page's usual reveal line (plain run). */
      names.forEach((name) => {
        ScrollTrigger.create({
          trigger: name.closest('.stack__card') ?? name,
          start: stacked ? 'clamp(top 50%)' : 'clamp(top 82%)',
          once: true,
          invalidateOnRefresh: true,
          onEnter: () => inkTween(name, { duration: D.inkLine, ease: E.ink }),
        });
      });

      return () => {
        stack.classList.remove('is-stacked');
        gsap.set(cards, { clearProps: 'transform,filter,willChange' });
      };
    },
  );

  return mm;
}
