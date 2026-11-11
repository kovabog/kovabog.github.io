/* Which orbit badge is highlighted (set by hovering stack icons on the page) and how strongly. */
import { on } from '../core/events.js';

export function createHighlight(order) {
  var key = null, level = 0;
  on('orbit:highlight', function (k) { key = k; });

  return {
    key: function () { return key; },
    level: function () { return level; },
    update: function (dt) {
      level += ((key && order.indexOf(key) >= 0 ? 1 : 0) - level) * (1 - Math.exp(-dt * 9));
    }
  };
}
