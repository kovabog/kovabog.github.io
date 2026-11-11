/* Decides WHEN the dog appears: once when the "Human" section is seen, and whenever the "Dog owner" tile is activated. */
import { dog } from './dog.js';
import { reduce } from '../core/env.js';

export function initDogTriggers() {
  var human = document.getElementById('human'), seen = false;

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !seen && !reduce) {
        seen = true;
        setTimeout(function () { dog.runBy('Woof! I’m the deadline manager.'); }, 350);
      }
    });
  }, { threshold: .35 }).observe(human);

  document.querySelectorAll('[data-dog]').forEach(function (tile) {
    function go() { dog.jump('Woof! Did someone say walk?'); }
    tile.addEventListener('click', go);
    tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
}
