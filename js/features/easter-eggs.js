/* Easter-egg bookkeeping: counts the eggs found and reacts (toast, chime, dog). Triggers arrive as "egg:found" events. */
import { on, emit } from '../core/events.js';
import { sfx } from '../audio/sfx.js';
import { dog } from './dog.js';
import { toast } from '../ui/toast.js';

var TOTAL = 3;
var MESSAGES = {
  konami: 'Woof! The Konami code? Respect.',
  bubbles: 'Woof! 10 bubbles. I’d have popped 11.',
  gem: 'Woof! Careful, that diamond is real.'
};

export function initEasterEggs() {
  var found = {};

  on('egg:found', function (id) {
    var fresh = !found[id];
    found[id] = 1;
    var n = Object.keys(found).length;

    if (id === 'konami') emit('bubbles:popAll');
    toast(fresh ? 'Easter egg found <b>' + n + '/' + TOTAL + '</b>' : 'Already found that one <b>' + n + '/' + TOTAL + '</b>');
    if (fresh) sfx.chime();
    dog.jump(fresh && n === TOTAL ? 'Woof! All 3 found. Now hire my human.' : MESSAGES[id]);
  });
}
