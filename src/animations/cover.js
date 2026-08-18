/* ============================================================================
   COVER — the boot (MOTION.md §1).
   One continuous scene, no shutter and no covering layer: the paper is already
   there, the press types the masthead, draws the rule, floods the name up out
   of the stock, prints the cover lines, counts the sheet out, and signs off
   with a single gold hairline crossing the screen.

   Everything here is failsafe: if any step throws, or the boot has not landed
   by 3.2s, the cover is forced to the finished state Phase 1 already renders.

   Headroom is the whole reason for the numbers below. The score runs 1.88s and
   the sheet counts itself out in 1.82s, so a healthy boot lands at 1.88s with
   1.32s of slack before the failsafe — enough that a slow font response can
   never cut a healthy boot in half.
   ========================================================================= */

import {
  gsap,
  D,
  E,
  reduced,
  primeInk,
  inkTween,
  primeRule,
  ruleTween,
  primeFade,
  fadeTween,
  primeType,
  typeTween,
} from './core.js';

const FAILSAFE_MS = 3200;
const MIN_PRINT_MS = 1200;
/* The press gives up waiting for the network this far in, leaving room for the
   0.62s settle to finish inside the failsafe rather than be snapped by it. */
const PRINT_GIVEUP_MS = FAILSAFE_MS - 900;

export function initCover(onDone) {
  const cover = document.getElementById('cover');
  if (!cover) {
    onDone?.();
    return null;
  }

  const q = (sel) => Array.from(cover.querySelectorAll(sel));

  const mastname = cover.querySelector('.cover__mastname');
  const mastno = cover.querySelector('.cover__mastno');
  const rules = q('[data-rule-draw]');
  const titleLines = q('.cover__line');
  const coverline = cover.querySelector('.cover__coverline');
  const lines = q('.coverline');
  const footRow = q('.cover__footrow > *');
  const slot = cover.querySelector('[data-print-progress]');

  /* --- initial states, applied before .motion-pending is dropped --------- */
  if (mastname) primeType(mastname);
  primeFade(mastno, 0);
  primeRule(rules);
  primeInk(titleLines);
  primeInk(coverline);
  primeFade(lines, 18);
  primeFade(footRow, 10);

  let settled = false;
  let failsafe = 0;

  const sweep = () => {
    if (settled) return;
    settled = true;
    clearTimeout(failsafe);
    printHead();
    onDone?.();
  };

  /* --- the visual score -------------------------------------------------- */
  const tl = gsap.timeline();
  const at = (tween, pos) => {
    if (tween) tl.add(tween, pos);
  };

  /* Cue positions, not durations, carry the compression: every step keeps the
     length MOTION.md gives it (0.7s rule, 0.9s per title line, 0.8s ink, 0.6s
     fade) and simply starts sooner, so the boot reads at the same tempo — the
     press just stops idling between passes. Longest tail: footrow, ending at
     1.20 + 0.18 stagger + 0.50 = 1.88s. */
  if (mastname) at(typeTween(mastname), 0);
  at(fadeTween(mastno, { duration: 0.5 }), 0.08);
  at(ruleTween(rules[0]), 0.4);
  at(inkTween(titleLines, { duration: D.inkLine, stagger: 0.12 }), 0.56);
  at(inkTween(coverline), 1.02);
  at(fadeTween(lines, { stagger: 0.08 }), 1.06);
  at(ruleTween(rules[1]), 1.1);
  at(fadeTween(footRow, { duration: 0.5, stagger: 0.09 }), 1.2);

  /* --- the sheet counting itself out ------------------------------------- */
  const printing = printProgress(slot);

  const finish = () => {
    if (settled) return;
    if (tl.progress() === 1 && printing.done()) sweep();
  };

  printing.whenDone(finish);
  tl.eventCallback('onComplete', finish);

  /* The press never holds the page hostage: 3.2s and the cover is finished,
     however that has to happen. A healthy boot is done at 1.88s, so this line
     is only ever reached by a genuinely stalled load. */
  failsafe = setTimeout(() => {
    if (settled) return;
    tl.progress(1, false);
    printing.force();
    sweep();
  }, FAILSAFE_MS);

  return tl;
}

/* --------------------------------------------------------------------------
   `đang in… %` — driven by the real load (fonts + window load), floored at
   1.2s so it reads as a press run, and given up on at 2.3s so it never becomes
   a wait. The slot then hands its Phase 1 line back.
   The 1.2s floor is the spec's; the 0.62s tail (0.18 fill + 0.18 out + 0.26
   back) is trimmed from the old 0.74s so a healthy run finishes at 1.82s —
   inside the 1.88s score, so the readout is never what the boot waits on.
   ----------------------------------------------------------------------- */
function printProgress(slot) {
  if (!slot) {
    return { whenDone: (fn) => fn(), done: () => true, force: () => {} };
  }

  const resting = slot.textContent;
  const state = { v: 0 };
  const callbacks = [];
  let finished = false;

  const paint = () => {
    slot.textContent = `đang in… ${Math.round(state.v)}%`;
  };
  paint();

  const creep = reduced
    ? null
    : gsap.to(state, {
        v: 92,
        duration: 1.15,
        ease: 'power1.out',
        onUpdate: paint,
      });

  const settle = () => {
    gsap.timeline()
      .to(slot, { opacity: 0, duration: 0.18, ease: 'power2.in' })
      .add(() => {
        slot.textContent = resting;
      })
      .to(slot, { opacity: 1, duration: 0.26, ease: E.fade })
      .add(() => {
        finished = true;
        callbacks.forEach((fn) => fn());
      });
  };

  const complete = () => {
    if (finished || state.v === 100) return;
    creep?.kill();
    if (reduced) {
      state.v = 100;
      paint();
      settle();
      return;
    }
    gsap.to(state, {
      v: 100,
      duration: 0.18,
      ease: 'power2.out',
      onUpdate: paint,
      onComplete: settle,
    });
  };

  const loaded = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener('load', r, { once: true })),
  ]);
  const floor = new Promise((r) => setTimeout(r, reduced ? 0 : MIN_PRINT_MS));

  Promise.all([loaded, floor]).then(complete).catch(complete);
  setTimeout(complete, PRINT_GIVEUP_MS);

  return {
    whenDone: (fn) => (finished ? fn() : callbacks.push(fn)),
    done: () => finished,
    force: () => {
      creep?.kill();
      gsap.killTweensOf(state);
      slot.textContent = resting;
      gsap.set(slot, { opacity: 1 });
      finished = true;
      callbacks.forEach((fn) => fn());
    },
  };
}

/* --------------------------------------------------------------------------
   One gold hairline crossing the screen in 140ms: the print head finishing its
   pass. No shutter, nothing covered, nothing left behind.
   ----------------------------------------------------------------------- */
function printHead() {
  if (reduced) return;

  const bar = document.createElement('i');
  bar.className = 'printhead';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  gsap.fromTo(
    bar,
    { x: -2, opacity: 1 },
    {
      x: window.innerWidth + 2,
      duration: 0.14,
      ease: 'none',
      onComplete: () => bar.remove(),
    },
  );

  /* Belt and braces: a hairline that outlives its tween would be a gold line
     parked across the page. If the frame loop is not running (background tab
     at load, a stalled rAF), the wall clock removes it anyway. */
  setTimeout(() => bar.remove(), 600);
}
