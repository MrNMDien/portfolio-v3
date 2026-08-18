/* ============================================================================
   CORE — the shared motion runtime for "The Performance Issue".
   Registers GSAP + ScrollTrigger once, publishes the issue's motion vocabulary
   (ink-reveal, rule-draw, typewriter, fade-up) and the reduced-motion switch.
   Nothing in src/animations/ may import gsap directly; it comes from here.
   ========================================================================= */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/* --- Environment ----------------------------------------------------------
   The ?reduced=1 override exists so the reduced-motion build can be exercised
   without an OS-level setting. It is behind import.meta.env.DEV, so the whole
   branch is dead code the production bundle drops.
   ---------------------------------------------------------------------- */
export const reduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  (import.meta.env.DEV && location.search.includes('reduced'));

export const finePointer = window.matchMedia('(pointer: fine)').matches;

/* --- Durations -----------------------------------------------------------
   Big blocks read slow (0.6–1s), micro-interactions stay 0.15–0.3s
   (MOTION.md preamble). The micro tier is the transitions.dev --duration-fast
   token (250ms); the reduced tier is --duration-quick (150ms).

   The reveal tier above 0.5s is deliberately off that scale and stays there:
   the transitions.dev usages stop at 500ms and describe UI chrome — modals,
   dropdowns, toasts — while these are editorial reveals with no counterpart in
   that table. Matching them to it on the strength of the nearest number would
   turn a magazine into an app.

   CSS keeps its own micro tier in --dur-fast (0.28s) because MOTION.md asks
   for 0.25s on the contents row and 0.3s on the Playbook wash, and one token
   cannot be both; 0.28s is the deliberate midpoint. Nothing animates through
   both scales at once, so the two never meet on an element.
   ---------------------------------------------------------------------- */
export const D = {
  /* 22ms/char. The masthead is 21 graphemes, so the line lands in 0.46s and the
     rule can draw under it without the boot idling; captions cap at 40 chars,
     so no typewriter on the page runs past 0.88s. */
  type: 0.022, // seconds per character
  ink: 0.8,
  inkLine: 0.9,
  rule: 0.7,
  fade: 0.6,
  count: 1.6,
  micro: 0.25,
  flat: 0.15, // the entire reduced-motion vocabulary
};

export const E = {
  ink: 'power3.out',
  rule: 'power3.inOut',
  fade: 'power2.out',
  count: 'power2.out',
  micro: 'power2.out',
  breathe: 'sine.inOut',
};

/* Reveals fire when the block's top crosses 78% of the viewport.
   clamp() is not decoration: the colophon sits 11733px down an 11926px page,
   so its raw 78% line lands 5px past the furthest the page can scroll and the
   trigger could never fire. clamp() pulls any such line back inside the
   scrollable range, which matters for everything on the last spread. */
export const START = 'clamp(top 78%)';
export const clampStart = (v) => `clamp(${v})`;

/* The ink mask. Negative side insets keep Vietnamese stacked diacritics and
   descenders outside the clip box for the whole tween, and the clip is dropped
   entirely on completion so nothing is ever left clipped. */
const CLIP_OUT = 'inset(100% 0% -8% 0%)';
const CLIP_IN = 'inset(-8% 0% -8% 0%)';

/* The blur radius is the reveal's only expensive property, and its cost scales
   with the area under it, not with the radius. A 6px blur over a 115px cover
   line is a large surface to re-filter every frame; over a 21px caption it is
   nothing. So display type takes 4px — still unmistakably ink soaking up
   through the stock at that size — and everything below 3rem keeps the 6px
   MOTION.md §2 specifies, where the softness has to be visible at all. */
const BLUR_DISPLAY_FROM = 48; /* px === 3rem */
const BLUR_DISPLAY = 4;
const BLUR_TEXT = 6;

const blurFor = (el) => {
  const fs = parseFloat(getComputedStyle(el).fontSize);
  return (fs || 16) >= BLUR_DISPLAY_FROM ? BLUR_DISPLAY : BLUR_TEXT;
};

const toArray = (t) => gsap.utils.toArray(t);

/* --- Ink reveal -----------------------------------------------------------
   Applied to the BLOCK, never to split words: splitting would break Vietnamese
   combining marks and is the previous issue's vocabulary anyway.
   ---------------------------------------------------------------------- */
export function primeInk(targets) {
  const els = toArray(targets);
  if (!els.length) return els;

  if (reduced) {
    gsap.set(els, { opacity: 0 });
    return els;
  }

  gsap.set(els, {
    clipPath: CLIP_OUT,
    webkitClipPath: CLIP_OUT,
    filter: (i, target) => `blur(${blurFor(target)}px)`,
    y: 24,
    willChange: 'clip-path, filter, transform',
  });
  return els;
}

/* Every reveal lands on identity, so the inline transform is dropped: CSS
   hover states (.toc__row, .step__num) set transform themselves and an inline
   translate(0,0) left behind by GSAP would outrank them. */
/* clearProps, not `filter: none`: the blur must not outlive the reveal even as
   a dormant inline declaration, because that is exactly the state that keeps a
   compositing hint alive on a headline for the rest of the session. Nothing
   here has a CSS-declared clip-path, filter or transform to fall back to, so
   removing the inline values returns the element to plain paint. */
function clearInk(els) {
  gsap.set(els, { clearProps: 'clipPath,filter,willChange,transform' });
  els.forEach((el) => el.style.removeProperty('-webkit-clip-path'));
}

export function inkTween(targets, vars = {}) {
  const els = toArray(targets);
  if (!els.length) return null;

  if (reduced) {
    return gsap.to(els, {
      opacity: 1,
      duration: D.flat,
      ease: 'none',
      stagger: 0,
      ...stripMotionVars(vars),
    });
  }

  return gsap.to(els, {
    clipPath: CLIP_IN,
    webkitClipPath: CLIP_IN,
    filter: 'blur(0px)',
    y: 0,
    duration: D.ink,
    ease: E.ink,
    ...vars,
    onComplete: () => {
      clearInk(els);
      vars.onComplete?.();
    },
  });
}

/* Reduced motion collapses everything to a 150ms fade, so the ink-specific
   vars (stagger aside) must not leak into the flat tween. */
function stripMotionVars(vars) {
  const { duration, ease, y, filter, clipPath, ...rest } = vars;
  return rest;
}

/* --- Rule draw ------------------------------------------------------------
   A double rule is two hairlines; each draws from the left, 60ms apart.
   ---------------------------------------------------------------------- */
export function primeRule(rules) {
  const lines = toArray(rules).flatMap((r) =>
    Array.from(r.querySelectorAll('.rule__line')),
  );
  if (!lines.length) return lines;
  gsap.set(lines, reduced ? { opacity: 0 } : { scaleX: 0, transformOrigin: 'left center' });
  return lines;
}

export function ruleTween(rules, vars = {}) {
  const lines = toArray(rules).flatMap((r) =>
    Array.from(r.querySelectorAll('.rule__line')),
  );
  if (!lines.length) return null;

  if (reduced) {
    return gsap.to(lines, { opacity: 1, duration: D.flat, ease: 'none', ...stripMotionVars(vars) });
  }

  return gsap.to(lines, {
    scaleX: 1,
    duration: D.rule,
    ease: E.rule,
    stagger: 0.06,
    ...vars,
  });
}

/* --- Fade up --------------------------------------------------------------
   Body copy and furniture. Quiet, and thinly staggered.
   ---------------------------------------------------------------------- */
export function primeFade(targets, y = 16) {
  const els = toArray(targets);
  if (!els.length) return els;
  gsap.set(els, reduced ? { opacity: 0 } : { opacity: 0, y });
  return els;
}

export function fadeTween(targets, vars = {}) {
  const els = toArray(targets);
  if (!els.length) return null;

  if (reduced) {
    return gsap.to(els, { opacity: 1, duration: D.flat, ease: 'none', ...stripMotionVars(vars) });
  }

  return gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: D.fade,
    ease: E.fade,
    overwrite: 'auto',
    ...vars,
    onComplete: () => {
      gsap.set(els, { clearProps: 'transform' });
      vars.onComplete?.();
    },
  });
}

/* --- Typewriter -----------------------------------------------------------
   The finished string already lives in the DOM. We read it, empty the node and
   type it back grapheme by grapheme, so "Điền" and "đang in…" never split a
   base letter from its marks. NFC first, Intl.Segmenter where available.
   ---------------------------------------------------------------------- */
export function graphemes(text) {
  const nfc = text.normalize('NFC');
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('vi', { granularity: 'grapheme' });
    return Array.from(seg.segment(nfc), (s) => s.segment);
  }
  return Array.from(nfc);
}

export function primeType(targets) {
  const els = toArray(targets);
  els.forEach((el) => {
    if (el.dataset.typeSource === undefined) {
      /* Captions are indented in the source, so textContent arrives wrapped in
         newlines the browser collapses on screen but a typewriter would sit
         and tap out. Collapsing them is invisible in the rendered line and
         keeps every typed string inside the 40-character budget. */
      el.dataset.typeSource = el.textContent.replace(/\s+/g, ' ').trim();
    }
    if (reduced) return;
    /* Emptying a caption would collapse its line box and shove the figure
       above it. Hold the height it already has, and release it once the line
       is typed back. */
    if (getComputedStyle(el).display !== 'inline') {
      const h = el.getBoundingClientRect().height;
      if (h > 0) el.style.minHeight = `${h}px`;
    }
    el.textContent = '';
  });
  if (reduced) gsap.set(els, { opacity: 0 });
  return els;
}

export function typeTween(el, vars = {}) {
  const full = el.dataset.typeSource ?? el.textContent;

  if (reduced) {
    el.textContent = full;
    return gsap.to(el, { opacity: 1, duration: D.flat, ease: 'none', ...stripMotionVars(vars) });
  }

  const chars = graphemes(full);
  const state = { i: 0 };
  el.classList.add('is-typing');

  return gsap.to(state, {
    i: chars.length,
    duration: chars.length * D.type,
    ease: 'none',
    ...vars,
    onUpdate() {
      const n = Math.round(state.i);
      el.textContent = chars.slice(0, n).join('');
      vars.onUpdate?.();
    },
    onComplete() {
      el.textContent = full;
      el.classList.remove('is-typing');
      el.style.minHeight = '';
      vars.onComplete?.();
    },
  });
}

/* --- Trigger helper -------------------------------------------------------
   Every reveal on this page runs once and never re-runs on scroll-back
   (MOTION.md §12). Scrubbed motion opts out explicitly.
   ---------------------------------------------------------------------- */
export function onceInView(trigger, build, opts = {}) {
  return ScrollTrigger.create({
    trigger,
    start: START,
    once: true,
    invalidateOnRefresh: true,
    ...opts,
    onEnter: (self) => build(self),
  });
}

/* --- Colour helper --------------------------------------------------------
   The foil highlight is derived from the element's own colour mixed toward
   paper — no new colour is introduced into the palette.
   ---------------------------------------------------------------------- */
export function mixToward(cssColor, targetRGB, amount) {
  const m = cssColor.match(/[\d.]+/g);
  if (!m) return cssColor;
  const [r, g, b] = m.map(Number);
  const mix = (a, t) => Math.round(a + (t - a) * amount);
  return `rgb(${mix(r, targetRGB[0])}, ${mix(g, targetRGB[1])}, ${mix(b, targetRGB[2])})`;
}

export const PAPER_RGB = [247, 243, 234];
