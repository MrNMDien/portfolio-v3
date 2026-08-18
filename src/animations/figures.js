/* ============================================================================
   CASE FILES — corner marks, Fig. 01–03 draw-on, plate parallax
   (MOTION.md §7).
   The figures are drawn, not faded: a plate registers its corner marks first,
   then the ink lays the chart down in the order a hand would — ground first,
   then the shape, then the labels.
   ========================================================================= */

import { gsap, E, reduced, onceInView } from './core.js';

const PLATE_START = 'clamp(top 75%)';

export function initFigures() {
  initCornerMarks();
  initFig01();
  initFig02();
  initFig03();
  initParallax();
}

/* --------------------------------------------------------------------------
   Stroke drawing.
   .fig-draw carries vector-effect: non-scaling-stroke, which makes the dash
   pattern resolve in rendered pixels while getTotalLength() answers in viewBox
   units. The path length is scaled by the plate's own scale factor, measured
   at the moment of drawing so a resize before the reveal cannot leave a
   pre-drawn sliver on screen.
   ----------------------------------------------------------------------- */
function dashLength(el) {
  let len = 0;
  try {
    len = el.getTotalLength();
  } catch {
    return 0;
  }
  const svg = el.ownerSVGElement;
  const vb = svg?.viewBox?.baseVal?.width || 0;
  const w = svg?.getBoundingClientRect().width || 0;
  const scale = vb && w ? w / vb : 1;
  return Math.ceil(len * scale) + 1;
}

function primeDraw(els) {
  list(els).forEach((el) => {
    const len = dashLength(el);
    if (!len) {
      gsap.set(el, { opacity: 0 });
      return;
    }
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
  });
}

function drawTween(els, vars = {}) {
  const l = list(els);
  if (!l.length) return null;

  /* Re-measured here, not at prime time: the plate may have been resized
     between load and the reveal. */
  l.forEach((el) => {
    const len = dashLength(el);
    if (len) gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  });

  return gsap.to(l, {
    strokeDashoffset: 0,
    opacity: 1,
    duration: 0.9,
    ease: 'power2.inOut',
    ...vars,
    onComplete: () => {
      gsap.set(l, { strokeDasharray: 'none', strokeDashoffset: 0 });
      vars.onComplete?.();
    },
  });
}

const list = (els) => gsap.utils.toArray(els).filter(Boolean);

function primeHidden(els) {
  const l = list(els);
  if (l.length) gsap.set(l, { opacity: 0 });
  return l;
}

function show(els, vars = {}) {
  const l = list(els);
  if (!l.length) return null;
  return gsap.to(l, { opacity: 1, duration: 0.4, ease: E.fade, ...vars });
}

/* Timelines here are assembled from pieces that may be absent; adding a null
   to a timeline throws, so every insertion goes through this. */
function at(tl, tween, pos) {
  if (tween) tl.add(tween, pos);
  return tl;
}

/* Build a figure timeline that only runs once the plate is 75% up the
   viewport, with the corner marks registering first. */
function figScore(svg, build) {
  if (!svg) return;
  const plate = svg.closest('.plate') ?? svg;

  onceInView(
    plate,
    () => {
      const tl = gsap.timeline();
      if (!reduced) build(tl);
    },
    { start: PLATE_START },
  );
}

/* --- corner marks (drawn outward from each corner, 0.3s) ------------------ */
function initCornerMarks() {
  document.querySelectorAll('.plate .marks').forEach((marks) => {
    const corners = Array.from(marks.querySelectorAll('.marks__c'));
    if (!corners.length) return;

    const origins = ['top left', 'top right', 'bottom left', 'bottom right'];
    corners.forEach((c, i) => {
      gsap.set(c, {
        transformOrigin: origins[i % 4],
        scale: reduced ? 1 : 0,
        opacity: reduced ? 0 : 1,
      });
    });

    onceInView(
      marks.closest('.plate'),
      () => {
        if (reduced) {
          gsap.to(corners, { opacity: 1, duration: 0.15 });
          return;
        }
        gsap.to(corners, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.05,
          onComplete: () => gsap.set(corners, { clearProps: 'transform' }),
        });
      },
      { start: PLATE_START },
    );
  });
}

/* --- Fig. 01 — SPEND area wipes, ROAS line draws ------------------------- */
function initFig01() {
  const svg = document.querySelector('[data-fig="01"]');
  if (!svg) return;

  const ground = svg.querySelectorAll('.fig-axis, .fig-hair');
  const fill = svg.querySelector('.fig-fill');
  const draws = svg.querySelectorAll('.fig-draw');
  const spend = draws[0];
  const roas = draws[1];
  const dots = svg.querySelectorAll('.fig-dot circle');
  const labels = svg.querySelectorAll('.fig-label, .fig-arrow, .fig-tick text');

  if (!reduced) {
    primeHidden(ground);
    primeHidden(labels);
    primeHidden(dots);
    gsap.set(fill, { scaleX: 0 });
    primeDraw([spend, roas].filter(Boolean));
  }

  /* 1.59s to the last label. The band MOTION.md §7 gives every figure is
     1.2–1.6s, and the ten labels are what used to blow it: at 0.05 stagger the
     tenth one started 0.45s after the first and the figure ran 2.30s. */
  figScore(svg, (tl) => {
    at(tl, show(ground, { duration: 0.38 }), 0.2);
    at(tl, drawTween(spend, { duration: 0.72 }), 0.32);
    if (fill) tl.to(fill, { scaleX: 1, duration: 0.68, ease: E.fade }, 0.44);
    at(tl, drawTween(roas, { duration: 0.58 }), 0.78);
    at(tl, show(dots, { duration: 0.26, stagger: 0.035 }), 0.98);
    at(tl, show(labels, { duration: 0.32, stagger: 0.03 }), 1.0);
  });
}

/* --- Fig. 02 — bars grow, share line draws ------------------------------- */
function initFig02() {
  const svg = document.querySelector('[data-fig="02"]');
  if (!svg) return;

  const bars = svg.querySelectorAll('.fig-bar');
  const line = svg.querySelector('.fig-draw');
  const dots = svg.querySelectorAll('.fig-dot circle');
  const axis = svg.querySelectorAll('.fig-axis');
  const zero = svg.querySelectorAll('.fig-tick--zero');
  const labels = svg.querySelectorAll('.fig-label, .fig-arrow, g.fig-tick text');

  if (!reduced) {
    primeHidden(axis);
    primeHidden(zero);
    primeHidden(labels);
    primeHidden(dots);
    gsap.set(bars, { scaleY: 0 });
    primeDraw(line);
  }

  /* 1.59s to the last label — same band as Fig 01 and Fig 03. The six bars
     keep their readable stagger; the compression comes out of the idle time
     between phases, not out of the growing. */
  figScore(svg, (tl) => {
    at(tl, show(axis, { duration: 0.34 }), 0.2);
    at(tl, show(zero, { duration: 0.34 }), 0.25);
    if (bars.length) {
      tl.to(
        bars,
        { scaleY: 1, duration: 0.48, ease: 'power2.out', stagger: 0.055 },
        0.3,
      );
    }
    at(tl, drawTween(line, { duration: 0.62 }), 0.66);
    at(tl, show(dots, { duration: 0.26, stagger: 0.04 }), 0.86);
    at(tl, show(labels, { duration: 0.32, stagger: 0.035 }), 1.02);
  });
}

/* --- Fig. 03 — the dashboard draws itself -------------------------------- */
function initFig03() {
  const svg = document.querySelector('[data-fig="03"]');
  if (!svg) return;

  const frame = svg.querySelector('.fig-frame');
  const topHair = svg.querySelector('.fig-hair');
  const live = svg.querySelector('.fig-live');
  const liveLabel = svg.querySelector('.fig-label');
  const cells = svg.querySelectorAll('.fig-cell');
  const stubs = svg.querySelectorAll('.fig-panel .fig-hair');
  const sparks = svg.querySelectorAll('.fig-spark');
  const ring = svg.querySelector('.fig-ring');
  const arc = svg.querySelector('.fig-arc');

  if (!reduced) {
    primeHidden([live, liveLabel, ring]);
    primeHidden(cells);
    primeHidden(stubs);
    primeDraw([frame, topHair].filter(Boolean));
    primeDraw(sparks);
    primeDraw(arc);
  }

  /* 1.58s to the LIVE pulse, inside the 1.2–1.6s band. The old score cued the
     pulse at 1.9s and ran the arc out to 2.10s — a dashboard that took two
     seconds to admit it was live. The wireframe and the four number blocks
     give up the time: the frame draws 0.52s instead of 0.70s and the cells
     ripple at 0.06s instead of 0.08s. The sparkline stagger is untouched at
     0.12s — that one is the reading, not the padding. */
  figScore(svg, (tl) => {
    at(tl, drawTween(frame, { duration: 0.52, ease: 'power2.inOut' }), 0.2);
    at(tl, drawTween(topHair, { duration: 0.32 }), 0.36);
    at(tl, show([live, liveLabel], { duration: 0.3 }), 0.46);
    at(tl, show(cells, { duration: 0.32, stagger: 0.06 }), 0.48);
    at(tl, show(stubs, { duration: 0.28, stagger: 0.06 }), 0.56);
    at(tl, drawTween(sparks, { duration: 0.56, stagger: 0.12 }), 0.72);
    at(tl, show(ring, { duration: 0.3 }), 1.0);
    at(tl, drawTween(arc, { duration: 0.54, ease: 'power2.inOut' }), 1.04);
    tl.add(() => startLivePulse(live), 1.58);
  });
}

/* The one loop in the issue: a realtime dot has to keep breathing or it is
   not realtime. 2.4s sine, and it stops when the tab is not being looked at. */
function startLivePulse(live) {
  if (!live || reduced) return;

  gsap.set(live, { transformOrigin: 'center', opacity: 1 });
  const pulse = gsap.to(live, {
    opacity: 0.35,
    scale: 0.72,
    duration: 1.2,
    ease: E.breathe,
    repeat: -1,
    yoyo: true,
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pulse.pause();
    else pulse.resume();
  });
}

/* --- plate parallax (desktop only) --------------------------------------- */
function initParallax() {
  const inners = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!inners.length || reduced) return;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    inners.forEach((inner) => {
      gsap.fromTo(
        inner,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: inner.closest('.plate') ?? inner,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
    return () => gsap.set(inners, { clearProps: 'transform' });
  });
}
