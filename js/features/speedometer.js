/* Easter egg "speedo". Trigger: click (or Enter/Space on) the big "9" of "9 years" in the Numbers section.
   The number revs from 0 to 9 like a speedometer needle: eases out, overshoots a little, settles on 9.
   Clicks during the animation are ignored. Reduced motion: no animation, the egg still counts. */
import { emit } from '../core/events.js';
import { reduce } from '../core/env.js';
import { easeOutBack } from '../core/util.js';

var DURATION = 1600;

export function initSpeedometer() {
  var el = document.querySelector('[data-speedo]');
  if (!el) return;
  var to = +el.dataset.to || 9, busy = false;

  function rev() {
    emit('egg:found', 'speedo');
    if (reduce || busy) return;
    busy = true;
    el.classList.add('revving');
    var t0 = performance.now();
    (function step(now) {
      var u = Math.min(1, (now - t0) / DURATION);
      el.textContent = Math.max(0, Math.round(to * easeOutBack(u)));
      if (u < 1) requestAnimationFrame(step);
      else { el.textContent = to; el.classList.remove('revving'); busy = false; }
    })(t0);
  }

  el.addEventListener('click', function () { if (!busy) rev(); });
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!busy) rev(); }
  });
}
