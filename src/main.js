import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { initMotion } from './animations/index.js';

/* ============================================================================
   The page's own behaviour is the masthead clock plus two lines of keyboard
   courtesy for the <details> menu. Everything that moves lives in
   src/animations/ and is started by initMotion() at the bottom of this file.
   ========================================================================= */

/* --- Realtime clock, HCMC (GMT+7) ---------------------------------------- */
const clock = document.getElementById('clock');

if (clock) {
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const tick = () => {
    const now = format.format(new Date());
    clock.textContent = now;
    clock.setAttribute('datetime', now);
  };

  tick();
  setInterval(tick, 1000);
}

/* --- Menu: <details> does the work; this only adds Escape and auto-close --- */
const menu = document.getElementById('menu');

if (menu) {
  menu.addEventListener('click', (event) => {
    if (event.target.closest('.menu__panel a')) menu.open = false;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
}

/* --- Phase 2: the issue starts printing ---------------------------------- */
initMotion();
