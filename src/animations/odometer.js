/* ============================================================================
   NUMBERS — the odometer (MOTION.md §4).
   Per row: the double rule draws, the numeral counts up on whole numbers,
   the gold unit follows a quarter second later, and the Vietnamese note lands
   last. Rows arriving together share a 0.15s cascade.

   Only the visual digits are touched. Each row already carries a plain
   sentence in .sr-only with the real figure, so nothing a screen reader reads
   ever counts, flickers, or shows a wrong number.
   ========================================================================= */

import {
  gsap,
  ScrollTrigger,
  D,
  E,
  reduced,
  primeFade,
  fadeTween,
  primeRule,
  ruleTween,
} from './core.js';
import { foilSweep } from './foil.js';

const ROW_STAGGER = 0.15;

export function initOdometer() {
  const stats = Array.from(document.querySelectorAll('.stat'));
  if (!stats.length) return;

  stats.forEach((stat) => {
    primeRule(stat.querySelector('[data-rule-draw]'));
    primeFade(stat.querySelector('[data-odometer]'), 18);
    primeFade(stat.querySelector('.stat__unit'), 10);
    primeFade(stat.querySelector('.stat__note'), 10);
  });

  ScrollTrigger.batch(stats, {
    start: 'clamp(top 82%)',
    once: true,
    onEnter: (batch) =>
      batch.forEach((stat, i) => runRow(stat, i * (reduced ? 0 : ROW_STAGGER))),
  });
}

function runRow(stat, offset) {
  const rule = stat.querySelector('[data-rule-draw]');
  const num = stat.querySelector('[data-odometer]');
  const digits = stat.querySelector('[data-odometer-digits]');
  const unit = stat.querySelector('.stat__unit');
  const note = stat.querySelector('.stat__note');

  const tl = gsap.timeline({ delay: offset });
  const at = (tween, pos) => {
    if (tween) tl.add(tween, pos);
  };

  at(ruleTween(rule), 0);
  at(fadeTween(num, { duration: 0.45 }), reduced ? 0 : 0.18);
  at(countTween(digits), reduced ? 0 : 0.18);
  at(fadeTween(unit), reduced ? 0 : 0.43);
  at(fadeTween(note), reduced ? 0 : 1.35);

  /* §10: the unit takes one pass of foil as the number lands. */
  if (unit && !reduced) tl.add(() => foilSweep(unit), 0.18 + D.count);

  return tl;
}

function countTween(digits) {
  if (!digits) return null;
  const target = parseInt(digits.textContent.trim(), 10);
  if (!Number.isFinite(target)) return null;

  const pad = Number(digits.closest('[data-odometer]')?.dataset.odometerPad ?? 0);
  const print = (v) => {
    digits.textContent = String(Math.round(v)).padStart(pad, '0');
  };

  if (reduced) {
    print(target);
    return null;
  }

  const state = { v: 0 };

  return gsap.to(state, {
    v: target,
    duration: D.count,
    ease: E.count,
    snap: { v: 1 },
    onStart: () => {
      /* "180" is three digits wide and "0" is one: hold the finished width
         before the first digit changes, or the unit beside it walks left and
         back for the whole 1.6s. */
      const w = digits.getBoundingClientRect().width;
      if (w > 0) {
        digits.style.display = 'inline-block';
        digits.style.minWidth = `${w}px`;
      }
      print(0);
    },
    onUpdate: () => print(state.v),
    onComplete: () => {
      print(target);
      digits.style.minWidth = '';
      digits.style.display = '';
    },
  });
}
