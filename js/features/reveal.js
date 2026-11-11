/* Marks .reveal/.stat elements as visible once they scroll into view and announces it on the event hub. */
import { emit } from '../core/events.js';

export function initReveal() {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
      emit('reveal', el);
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal,.stat').forEach(function (el) { io.observe(el); });
}
