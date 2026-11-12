/* Easter egg "goodboy". Trigger: click/tap the dog sitting on the "Dog owner" tile (it nods on hover, see components/dog.css).
   Each pet floats a "Good boy +1" above him and bumps a counter that is kept in localStorage.
   Petting does not trigger the tile's own action (the big dog jumping in); clicking the rest of the tile still does. */
import { emit } from '../core/events.js';
import { reduce } from '../core/env.js';
import { load, save } from '../core/store.js';
import { sfx } from '../audio/sfx.js';

var KEY = 'bk-goodboy';

export function initGoodBoy() {
  var pup = document.querySelector('.dog-sit');
  if (!pup) return;
  var tile = pup.parentNode, n = +load(KEY, 0) || 0;

  var badge = document.createElement('span');
  badge.className = 'goodboy mono';
  badge.setAttribute('aria-live', 'polite');
  tile.appendChild(badge);
  function paint() { badge.textContent = 'Good boy × ' + n; badge.classList.toggle('on', n > 0); }
  paint();

  pup.addEventListener('click', function (e) {
    e.stopPropagation();
    n++; save(KEY, n); paint();
    sfx.bark();
    pup.classList.remove('nod'); void pup.offsetWidth; pup.classList.add('nod');
    if (!reduce) floatUp();
    emit('egg:found', 'goodboy');
  });
  pup.addEventListener('animationend', function (e) { if (e.animationName === 'nod-once') pup.classList.remove('nod'); });

  function floatUp() {
    var f = document.createElement('span');
    f.className = 'goodboy-float';
    f.setAttribute('aria-hidden', 'true');
    f.textContent = 'Good boy +1';
    tile.appendChild(f);
    f.addEventListener('animationend', function () { f.remove(); });
  }
}
