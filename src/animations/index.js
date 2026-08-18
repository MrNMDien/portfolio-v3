/* ============================================================================
   MOTION — Phase 2 entry point.
   Boot order follows MOTION.md: Lenis first, then the cover, then the rest of
   the issue. Every module below primes its own initial state the moment it is
   registered, and only then is the .motion-pending gate released — so a reader
   who scrolls during the 1.88s boot never catches an element mid-prime.

   If anything in here throws, revealEverything() puts the issue back to the
   finished, fully readable state Phase 1 renders. Motion is never the reason a
   sentence cannot be read.
   ========================================================================= */

import '../styles/motion.css';

import { gsap, ScrollTrigger, reduced } from './core.js';
import { initLenis, getLenis } from './lenis.js';
import { initCover } from './cover.js';
import { initReveals, revealEverything } from './reveals.js';
import { initContents } from './contents.js';
import { initOdometer } from './odometer.js';
import { initChannels } from './channels.js';
import { initFigures } from './figures.js';
import { initQuote } from './quote.js';
import { initBackCover } from './backcover.js';
import { initFoil } from './foil.js';
import { initCursor } from './cursor.js';
import { initGlow } from './glow.js';

let coverTimeline = null;
let channelsMedia = null;

export function initMotion() {
  /* The pre-paint gate in index.html arms a 3.2s failsafe. We are alive, so
     the gate is ours to close. */
  clearTimeout(window.__motionFailsafe);

  try {
    initLenis();

    /* The cover boot runs on its own clock and hands back when the press has
       finished its pass. */
    coverTimeline = initCover(() => ScrollTrigger.refresh());

    initReveals();
    initContents();
    initOdometer();
    channelsMedia = initChannels();
    initFigures();
    initQuote();
    initBackCover();
    initFoil();
    initCursor();
    initGlow();

    document.documentElement.classList.remove('motion-pending');

    /* Fraunces and Be Vietnam Pro change every measurement on the page. */
    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => ScrollTrigger.refresh(), {
      once: true,
    });
  } catch (error) {
    console.error('[motion] boot failed, falling back to the printed page', error);
    revealEverything();
  }

  if (import.meta.env.DEV) {
    window.__motion = {
      gsap,
      ScrollTrigger,
      reduced,
      lenis: getLenis(),
      cover: coverTimeline,
      channels: channelsMedia,
    };
  }
}
