/* Small developer-style readout in the corner (diamond rotation, spin speed while it is fast, scroll progress, bubbles popped, easter eggs found).
   The egg count is read from the persisted list (same source as the footer counter) and refreshed on "egg:found". */
import { on } from '../core/events.js';
import { load } from '../core/store.js';
import { EGGS, EGG_KEY, availableEggs } from '../data/eggs.js';

export function createHud() {
  var el = document.getElementById('hud'), acc = 0, eggs = '';

  function readEggs() {
    var ids = availableEggs(false), saved = load(EGG_KEY, []);
    var n = ids.filter(function (id) { return EGGS[id] && saved.indexOf(id) !== -1; }).length;
    eggs = ' · eggs ' + n + '/' + ids.length;
  }
  readEggs();
  on('egg:found', readEggs);

  return {
    update: function (dt, spin, y, maxScroll, popped, rpm) {
      acc += dt;
      if (acc <= .12) return;
      acc = 0;
      if (window.innerWidth <= 900) { // narrow screens: only the counters
        el.textContent = (popped ? 'bubbles popped ' + popped : '') + eggs.replace(popped ? '' : ' · ', '');
        return;
      }
      var deg =((spin * 180 / Math.PI) % 360 + 360) % 360;
      el.textContent = 'diamond.rotation.y = ' + deg.toFixed(1) + '°' + (rpm >= 20 ? ' · ' + rpm + ' rpm' : '') +
        ' · scroll ' + Math.round(100 * y / maxScroll) + '%' + (popped ? ' · bubbles popped ' + popped : '') + eggs;
    }
  };
}
