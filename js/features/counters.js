/* Counts numbers up (0 -> data-to) when the block that holds them is revealed. */
import { on } from '../core/events.js';
import { reduce } from '../core/env.js';

function count(n) {
  var to = +n.dataset.to, suf = n.dataset.suffix || '', t0 = performance.now(), dur = 1400;
  (function step(t) {
    var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    n.innerHTML = Math.round(to * e) + suf;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

export function initCounters() {
  on('reveal', function (el) {
    var n = el.querySelector && el.querySelector('.n[data-to]');
    if (n && !reduce) count(n);
  });
}
