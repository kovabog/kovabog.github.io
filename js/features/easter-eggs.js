/* Easter-egg bookkeeping: counts the eggs found (persisted), keeps the footer counter up to date and reacts (toast, chime; the dog only for a few eggs, see DOG_REACT).
   Triggers arrive as "egg:found" events; the list of eggs lives in data/eggs.js.
   Without WebGL ("stage:nogl") the eggs that live in the 3D scene are left out of the count and the total. */
import { on } from '../core/events.js';
import { load, save } from '../core/store.js';
import { root } from '../core/env.js';
import { EGGS, REPEAT_REACT, DOG_REACT, EGG_KEY, availableEggs } from '../data/eggs.js';
import { sfx } from '../audio/sfx.js';
import { dog } from './dog.js';
import { toast } from '../ui/toast.js';

var KEY = EGG_KEY;

export function initEasterEggs() {
  var found = {};
  load(KEY, []).forEach(function (id) { if (EGGS[id]) found[id] = 1; });
  var countEl = document.getElementById('eggCount');

  /* Eggs that can be found on this page (fewer without WebGL) and how many of them are found. */
  function reachable() { return availableEggs(root.classList.contains('no-gl')); }
  function count() { return reachable().filter(function (id) { return found[id]; }).length; }
  function paint() {
    if (!countEl) return;
    var n = count(), total = reachable().length;
    countEl.textContent = n ? 'Found ' + n + ' of ' + total + ' easter eggs' : total + ' easter eggs inside';
  }
  paint();
  on('stage:nogl', paint);
  on('egg:reset', function () { found = {}; save(KEY, []); paint(); });

  on('egg:found', function (id) {
    if (!EGGS[id]) return;
    var fresh = !found[id];
    if (!fresh && !REPEAT_REACT[id]) return;

    found[id] = 1;
    save(KEY, Object.keys(found));
    paint();
    var n = count(), total = reachable().length, left = total - n;
    var tally = 'found <b>' + n + '/' + total + '</b> · ' + (left ? '<b>' + left + '</b> to go' : 'that’s all of them!');
    toast((fresh ? 'Easter egg ' : 'Already ') + tally);
    if (fresh) sfx.chime();
    if (fresh && n === total) dog.jump('Woof! All ' + total + ' found. Now hire my human.');
    else if (DOG_REACT[id]) dog.jump(EGGS[id]);
  });
}
