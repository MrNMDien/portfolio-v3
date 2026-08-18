/* ============================================================================
   CONTENTS — the mục lục (MOTION.md §3).
   Reading rhythm, not a list animation: the name arrives, the leader dots run
   across to find the number, and only then does the page number print.
   The overlay copy of the table inside the menu is left alone — it lives in a
   fixed panel and must be legible the instant the panel opens.
   ========================================================================= */

import {
  gsap,
  D,
  E,
  reduced,
  primeFade,
  fadeTween,
  onceInView,
} from './core.js';

const DOTS_OUT = 'inset(0% 100% 0% 0%)';
const DOTS_IN = 'inset(0% 0% 0% 0%)';

export function initContents() {
  const toc = document.querySelector('.toc--page');
  if (!toc) return;

  const rows = Array.from(toc.querySelectorAll('.toc__row'));
  if (!rows.length) return;

  const dots = rows.map((r) => r.querySelector('.toc__dots')).filter(Boolean);
  const pages = rows.map((r) => r.querySelector('.toc__page')).filter(Boolean);

  primeFade(rows, 14);
  primeFade(pages, 0);
  if (!reduced) {
    gsap.set(dots, { clipPath: DOTS_OUT, webkitClipPath: DOTS_OUT });
  } else {
    gsap.set(dots, { opacity: 0 });
  }

  onceInView(toc, () => {
    const tl = gsap.timeline();

    rows.forEach((row, i) => {
      const t = reduced ? 0 : i * 0.08;
      const dot = row.querySelector('.toc__dots');
      const page = row.querySelector('.toc__page');

      tl.add(fadeTween(row), t);

      if (dot) {
        tl.add(
          reduced
            ? gsap.to(dot, { opacity: 1, duration: D.flat })
            : gsap.to(dot, {
                clipPath: DOTS_IN,
                webkitClipPath: DOTS_IN,
                duration: 0.5,
                ease: E.fade,
                onComplete: () =>
                  gsap.set(dot, { clipPath: 'none', webkitClipPath: 'none' }),
              }),
          t + (reduced ? 0 : 0.3),
        );
      }

      if (page) {
        tl.add(
          fadeTween(page, { duration: reduced ? D.flat : 0.35 }),
          t + (reduced ? 0 : 0.72),
        );
      }
    });
  });
}
