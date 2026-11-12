/* Easter egg "devmode". Trigger: click the "BK" logo 5 times within 3 seconds (the same gesture switches it off).
   Dev mode shows an FPS counter in the corner and a faint 8px layout grid over the page. */
import { emit } from '../core/events.js';
import { toast } from '../ui/toast.js';

var CLICKS = 5, WINDOW = 3000;

export function initDevMode() {
  var mark = document.querySelector('nav .mark');
  if (!mark) return;
  var times = [], on = false, grid = null, fps = null, raf = 0;

  mark.addEventListener('click', function () {
    var now = performance.now();
    times.push(now);
    while (times.length && now - times[0] > WINDOW) times.shift();
    if (times.length < CLICKS) return;
    times = [];
    on ? stop() : start();
    toast('dev mode: <b>' + (on ? 'on' : 'off') + '</b>');
    // Let the dev-mode toast be read first; the egg's own toast follows it.
    if (on) setTimeout(function () { emit('egg:found', 'devmode'); }, 1600);
  });

  function start() {
    on = true;
    grid = document.createElement('div'); grid.className = 'devgrid'; grid.setAttribute('aria-hidden', 'true');
    fps = document.createElement('div'); fps.className = 'devfps mono'; fps.setAttribute('aria-hidden', 'true'); fps.textContent = '-- fps';
    document.body.appendChild(grid); document.body.appendChild(fps);
    var frames = 0, since = performance.now();
    (function tick(now) {
      frames++;
      if (now - since >= 250) {
        fps.textContent = Math.round(frames * 1000 / (now - since)) + ' fps';
        frames = 0; since = now;
      }
      raf = requestAnimationFrame(tick);
    })(since);
  }

  function stop() {
    on = false;
    cancelAnimationFrame(raf);
    grid.remove(); fps.remove(); grid = fps = null;
  }
}
