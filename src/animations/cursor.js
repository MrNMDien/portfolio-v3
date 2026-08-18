/* ============================================================================
   CURSOR "ĐỌC" (MOTION.md §11).
   A 6px dot of ink follows the hand. Over anything readable it opens into a
   thin 36px ring carrying the word ĐỌC set in serif italic. No outer halo, no
   magnetism — that was the previous issue's trick.
   Fine pointers only; the ring never appears on touch, never takes pointer
   events, and never touches focus styling.
   ========================================================================= */

import { gsap, D, E, reduced, finePointer } from './core.js';

const LERP = 0.14;

/* Things you can actually act on — not things you can merely read.
   `.case` was in this list and it should not have been: a whole feature
   article, headline, three columns of copy and its plate, is not a surface you
   click, so promising ĐỌC across all of it told the reader something untrue
   and left no contrast for the links that are real. The word now means what it
   says: a link, a button, a contents row, the address. */
const READABLE = 'a, button, summary, .toc__row, .email, [role="button"]';

export function initCursor() {
  if (!finePointer || reduced) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const root = document.createElement('div');
  root.className = 'cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML =
    '<i class="cursor__dot"></i>' +
    '<span class="cursor__ring"><span class="cursor__word">ĐỌC</span></span>';
  document.body.appendChild(root);
  document.documentElement.classList.add('has-cursor');

  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');

  gsap.set(ring, { rotation: -8, scale: 0.2, transformOrigin: 'center' });
  gsap.set(dot, { transformOrigin: 'center' });

  const setX = gsap.quickSetter(root, 'x', 'px');
  const setY = gsap.quickSetter(root, 'y', 'px');

  const point = { x: -100, y: -100 };
  const aim = { x: -100, y: -100 };
  let awake = false;
  let reading = false;

  const follow = () => {
    point.x += (aim.x - point.x) * LERP;
    point.y += (aim.y - point.y) * LERP;
    setX(point.x);
    setY(point.y);
  };
  gsap.ticker.add(follow);

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') {
        teardown();
        return;
      }
      aim.x = event.clientX;
      aim.y = event.clientY;
      if (!awake) {
        awake = true;
        point.x = aim.x;
        point.y = aim.y;
        gsap.to(root, { opacity: 1, duration: D.micro, ease: E.micro });
      }
    },
    { passive: true },
  );

  /* pointerover fires on every element change, which is exactly when the
     cursor's state can change — cheaper and steadier than testing on move. */
  document.addEventListener('pointerover', (event) => {
    const el = event.target instanceof Element ? event.target : null;
    setReading(!!el?.closest(READABLE));
    root.classList.toggle('is-ink', !!el?.closest('.surface-ink'));
  });

  function setReading(next) {
    if (next === reading) return;
    reading = next;

    /* The overshoot belongs to the arrival only — a ring that bounced on its
       way out would be the cursor showing off on the way to somewhere else. */
    gsap.to(ring, {
      scale: next ? 1 : 0.2,
      opacity: next ? 1 : 0,
      duration: D.micro,
      ease: next ? 'back.out(1.4)' : 'power2.in',
      overwrite: true,
    });
    /* Dot and ring are one swap, so this half stays symmetric both ways. */
    gsap.to(dot, {
      scale: next ? 0 : 1,
      duration: D.micro,
      ease: E.micro,
      overwrite: true,
    });
  }

  /* Leaving the window has to feel like the cursor was never ours: quicker
     than any hover state, and symmetric on the way back. */
  document.addEventListener('mouseleave', () =>
    gsap.to(root, { opacity: 0, duration: D.flat, ease: E.micro }),
  );
  document.addEventListener('mouseenter', () => {
    if (awake) gsap.to(root, { opacity: 1, duration: D.flat, ease: E.micro });
  });

  function teardown() {
    gsap.ticker.remove(follow);
    root.remove();
    document.documentElement.classList.remove('has-cursor');
  }
}
