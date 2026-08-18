/* ============================================================================
   PULL QUOTE — the ink spread (MOTION.md §8).
   The sheet arrives blank and the ink floods it from the top; the gold quote
   mark settles, the sentence comes up line by line, and the byline is typed
   last, the way a caption is set after the plate is printed.
   ========================================================================= */

import {
  gsap,
  D,
  E,
  reduced,
  primeInk,
  inkTween,
  primeType,
  typeTween,
  onceInView,
} from './core.js';

const INK_OUT = 'inset(0% 0% 100% 0%)';
const INK_IN = 'inset(0% 0% 0% 0%)';

export function initQuote() {
  const section = document.getElementById('quote');
  if (!section) return;

  const wash = section.querySelector('.spread__ink');
  const mark = section.querySelector('.quote__mark');
  const lines = Array.from(section.querySelectorAll('.quote__line'));
  const by = section.querySelector('.quote__by');

  primeInk(lines);
  if (by) primeType(by);
  if (mark) gsap.set(mark, reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 });

  /* The spread paints itself ink in CSS. For the flood to be visible the sheet
     underneath has to be paper first — set inline, from JS only, so a page
     without motion keeps the finished ink spread Phase 1 renders. */
  if (wash && !reduced) {
    section.style.background = 'var(--paper)';
    gsap.set(wash, { clipPath: INK_OUT, webkitClipPath: INK_OUT });
  }

  onceInView(
    section,
    () => {
      const tl = gsap.timeline();

      if (wash && !reduced) {
        tl.to(
          wash,
          {
            clipPath: INK_IN,
            webkitClipPath: INK_IN,
            duration: 0.9,
            ease: E.rule,
            onComplete: () =>
              gsap.set(wash, { clipPath: 'none', webkitClipPath: 'none' }),
          },
          0,
        );
      }

      if (mark) {
        tl.to(
          mark,
          {
            opacity: 1,
            scale: 1,
            duration: reduced ? D.flat : 0.8,
            ease: E.ink,
            onComplete: () => gsap.set(mark, { clearProps: 'transform' }),
          },
          reduced ? 0 : 0.45,
        );
      }

      const lineTween = inkTween(lines, {
        duration: reduced ? D.flat : D.inkLine,
        stagger: reduced ? 0 : 0.15,
      });
      if (lineTween) tl.add(lineTween, reduced ? 0 : 0.6);

      if (by) tl.add(typeTween(by), reduced ? 0 : 1.6);
    },
    { start: 'clamp(top 70%)' },
  );
}
