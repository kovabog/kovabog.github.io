/* Smooth-scrolls to a section when a [data-go] link is clicked. */
import { reduce } from '../core/env.js';

export function initNav() {
  document.querySelectorAll('[data-go]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var t = document.getElementById(a.dataset.go);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });
}
