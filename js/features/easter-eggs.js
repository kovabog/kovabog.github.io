/* Easter-egg bookkeeping: counts the eggs found (persisted), keeps the footer counter up to date and reacts (toast, chime, dog).
   Triggers arrive as "egg:found" events; the list of eggs lives in data/eggs.js. */
import { on, emit } from '../core/events.js';
import { load, save } from '../core/store.js';
import { EGGS, REPEAT_REACT } from '../data/eggs.js';
import { sfx } from '../audio/sfx.js';
import { dog } from './dog.js';
import { toast } from '../ui/toast.js';

var KEY = 'bk-eggs';
var TOTAL = Object.keys(EGGS).length;

export function initEasterEggs() {
  var found = {};
  load(KEY, []).forEach(function (id) { if (EGGS[id]) found[id] = 1; });
  var countEl = document.getElementById('eggCount');

  function count() { return Object.keys(found).length; }
  function paint() {
    if (!countEl) return;
    var n = count();
    countEl.textContent = n ? 'Found ' + n + ' of ' + TOTAL + ' easter eggs' : TOTAL + ' easter eggs inside';
  }
  paint();

  on('egg:found', function (id) {
    if (!EGGS[id]) return;
    var fresh = !found[id];
    if (id === 'konami') emit('bubbles:popAll');
    if (!fresh && !REPEAT_REACT[id]) return;

    found[id] = 1;
    save(KEY, Object.keys(found));
    paint();
    var n = count();
    toast(fresh ? 'Easter egg found <b>' + n + '/' + TOTAL + '</b>' : 'Already found that one <b>' + n + '/' + TOTAL + '</b>');
    if (fresh) sfx.chime();
    dog.jump(fresh && n === TOTAL ? 'Woof! All ' + TOTAL + ' found. Now hire my human.' : EGGS[id]);
  });
}
