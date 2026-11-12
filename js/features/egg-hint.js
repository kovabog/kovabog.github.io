/* Hint button in the navigation: every press nudges toward an easter egg that is not found yet, one egg per press, said by the dog (silently, no barking),
   cycling through the remaining ones. The hints live in data/eggs.js; the found list is the one easter-eggs.js persists. */
import { on, emit } from '../core/events.js';
import { toast, hideToast } from '../ui/toast.js';
import { load } from '../core/store.js';
import { root } from '../core/env.js';
import { HINTS, EGG_KEY, availableEggs } from '../data/eggs.js';
import { dog } from './dog.js';

export function initEggHint() {
  var btn = document.getElementById('hint');
  if (!btn) return;
  var found = {}, last = -1, order = Object.keys(HINTS);
  load(EGG_KEY, []).forEach(function (id) { found[id] = 1; });
  on('egg:found', function (id) { found[id] = 1; }); // also covers browsers where localStorage is blocked

  on('egg:reset', function () { found = {}; last = -1; });
  document.getElementById('toast').addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (!act) return;
    hideToast();
    if (act === 'reset') { emit('egg:reset'); toast('Counter reset. <b>' + availableEggs(root.classList.contains('no-gl')).length + '</b> eggs to find again'); }
  });

  btn.addEventListener('click', function () {
    var ids = availableEggs(root.classList.contains('no-gl')).sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    var left = ids.filter(function (id) { return !found[id]; });
    if (!left.length) {
      dog.hint('You found all ' + ids.length + '. Want to start the hunt over?');
      toast('All <b>' + ids.length + '</b> found. Reset the counter and hunt again?' +
        '<button type="button" data-act="reset">Reset</button><button type="button" data-act="keep">Keep</button>', { ask: true });
      return;
    }
    for (var i = 1; i <= order.length; i++) {
      var k = (last + i) % order.length;
      if (found[order[k]] || ids.indexOf(order[k]) < 0) continue;
      last = k;
      dog.hint(left.length + ' left. ' + HINTS[order[k]]);
      return;
    }
  });
}
