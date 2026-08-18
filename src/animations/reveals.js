/* ============================================================================
   REVEALS — the vocabulary used across the whole issue (MOTION.md §2).
     data-ink-reveal  ink soaking up through the stock, on the BLOCK
     data-rule-draw   the double rule drawing itself from the left
     data-type        typewriter for mono captions
     fade-up          body copy and furniture, thinly staggered
     drop cap         gold deepening under the first paragraph

   Hooks owned by another module are skipped here, never animated twice:
     #cover           -> cover.js
     .quote           -> quote.js
     .stack__name     -> channels.js
     .stat            -> odometer.js
     .toc__row        -> contents.js
     .email           -> backcover.js
   ========================================================================= */

import {
  gsap,
  ScrollTrigger,
  D,
  E,
  START,
  reduced,
  primeInk,
  inkTween,
  primeRule,
  ruleTween,
  primeFade,
  fadeTween,
  primeType,
  typeTween,
  onceInView,
} from './core.js';

const INK_OWNED = '#cover, .quote, .stack__card';
const RULE_OWNED = '#cover, .stat';
const TYPE_OWNED = '#cover, .quote';

/* Body copy and printer's furniture. Everything a module below does not own. */
const FADE = [
  '#contents .meta--wide',

  '#cover-story .kicker',
  '#cover-story .story__lede',
  '#cover-story .crosshead__title',
  '#cover-story .crosshead__note',
  '#cover-story .story__plate .plate',

  '#numbers .meta--wide',

  '#playbook .meta--wide',
  '#playbook .playbook__lead',
  '#playbook .step__body',

  '#channels .meta--wide',
  '#channels .stack__copy',
  '#channels .stack__metric',
  '#channels .stack__folio',

  '#case-files .meta--wide',
  '#case-files .case__slug',
  '#case-files .case__title',
  '#case-files .case__body:not(.case__body--split) > *',
  '#case-files .case__body--split > div',
  '#case-files .case__fig .plate',

  '#contact .back__lead p',
  '#contact .back__links > div',
].join(', ');

const unowned = (sel, owner) =>
  Array.from(document.querySelectorAll(sel)).filter((el) => !el.closest(owner));

export function initReveals() {
  initInk();
  initRules();
  initCaptions();
  initFades();
  initDropCap();
  initRomanNumerals();
}

/* --- ink reveal ----------------------------------------------------------- */
function initInk() {
  unowned('[data-ink-reveal]', INK_OWNED).forEach((el) => {
    primeInk(el);
    onceInView(el, () => inkTween(el));
  });
}

/* --- double rules --------------------------------------------------------- */
function initRules() {
  unowned('[data-rule-draw]', RULE_OWNED).forEach((rule) => {
    primeRule(rule);
    onceInView(rule, () => ruleTween(rule), { start: 'clamp(top 88%)' });
  });
}

/* --- mono captions -------------------------------------------------------- */
function initCaptions() {
  unowned('[data-type]', TYPE_OWNED).forEach((el) => {
    primeType(el);
    onceInView(el, () => typeTween(el), { start: 'clamp(top 92%)' });
  });
}

/* --- body copy ------------------------------------------------------------
   Batched so elements arriving together share one stagger instead of each
   firing its own trigger — a thin, even rhythm rather than a ripple.
   ---------------------------------------------------------------------- */

/* 0.1s between blocks is the issue's reading rhythm, but a batch is however
   many blocks cross the line at once, and that is not a number this file
   controls: Case Files holds 22 of them, Channels 13, the cover story 9. A
   reader who arrives by anchor, reloads deep in the page, or simply scrolls
   fast can put all of them across together, and at 0.1s each the last block on
   Case Files would land 2.1s after the first — long past the point where a
   stagger reads as rhythm rather than as a queue. So the rhythm is the
   intention and 0.3s is the ceiling: small batches keep the full 0.1s beat,
   large ones compress to fit. */
const FADE_STAGGER = 0.1;
const FADE_STAGGER_TOTAL = 0.3;

const staggerFor = (n) =>
  n > 1 ? Math.min(FADE_STAGGER, FADE_STAGGER_TOTAL / (n - 1)) : 0;

function initFades() {
  const els = Array.from(document.querySelectorAll(FADE));
  if (!els.length) return;

  primeFade(els);

  ScrollTrigger.batch(els, {
    start: START,
    once: true,
    onEnter: (batch) =>
      fadeTween(batch, {
        stagger: reduced ? 0 : staggerFor(batch.length),
        delay: reduced ? 0 : 0.14,
      }),
  });
}

/* --- drop cap -------------------------------------------------------------
   ::first-letter accepts colour but not transform, and the handover forbids
   animating font-size (initial-letter + the Firefox float fallback both size
   from it). So the cap deepens into gold over 0.9s and does not scale.
   ---------------------------------------------------------------------- */
function initDropCap() {
  const lede = document.querySelector('.story__lede');
  if (!lede || reduced) return;

  lede.classList.add('dropcap-pale');
  onceInView(lede, () => {
    /* Arm the transition, flush the style, then change the colour — a reflow
       read rather than a rAF, so a throttled frame loop cannot strand the cap
       at its pale value. */
    lede.classList.add('dropcap-inking');
    void lede.offsetHeight;
    lede.classList.remove('dropcap-pale');
  });
}

/* --- Playbook roman numerals (MOTION.md §5) ------------------------------- */
function initRomanNumerals() {
  const nums = Array.from(document.querySelectorAll('.step__num'));
  if (!nums.length) return;

  nums.forEach((num) => {
    primeInk(num);
    onceInView(num, () => inkTween(num, { duration: D.ink, ease: E.ink }));
  });
}

/* --- failsafe -------------------------------------------------------------
   Called if the boot throws: everything the modules may have primed is put
   back to the finished state Phase 1 renders.
   ---------------------------------------------------------------------- */
export function revealEverything() {
  const all = document.querySelectorAll(
    '[data-ink-reveal], [data-rule-draw] .rule__line, [data-type], ' +
      '.step__num, .coverline, .cover__mastno, .cover__footrow > *, ' +
      '.toc__row, .toc__dots, .toc__page, .email, .email__rule, ' +
      '.quote__mark, .stack__card, .plate, ' +
      FADE,
  );

  document.querySelectorAll('[data-type]').forEach((el) => {
    if (el.dataset.typeSource !== undefined) el.textContent = el.dataset.typeSource;
    el.classList.remove('is-typing');
    el.style.minHeight = '';
  });

  gsap.killTweensOf(all);
  gsap.set(all, { clearProps: 'all' });
  document.querySelector('.story__lede')?.classList.remove('dropcap-pale');
  document.documentElement.classList.remove('motion-pending');
}
