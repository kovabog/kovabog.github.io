/* Listens for the Konami code and reports it as an easter egg. */
import { emit } from '../core/events.js';

var SEQUENCE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

export function initKonami() {
  var progress = 0;
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    progress = k === SEQUENCE[progress] ? progress + 1 : (k === SEQUENCE[0] ? (progress === 2 && SEQUENCE[1] === k ? 2 : 1) : 0);
    if (progress === SEQUENCE.length) { progress = 0; emit('egg:found', 'konami'); }
  });
}
