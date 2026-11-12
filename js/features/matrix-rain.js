/* Easter egg "matrix". Trigger: triple-click (or triple-tap) any ".NET" / "C#" word marked [data-matrix].
   Effect: ~5 s of falling green glyphs on a full-screen canvas plus a caption, then a fade-out and full cleanup.
   Reduced motion: no rain, only the caption. */
import { emit } from '../core/events.js';
import { reduce } from '../core/env.js';

var DURATION = 5000, FADE = 800, CLICK_GAP = 450;
var GLYPHS = ('ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789').split('').concat(['{', '}', ';', '=>', '<>']);

export function initMatrixRain() {
  var clicks = 0, lastClick = 0, running = false;

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-matrix]');
    if (!t) return;
    var now = performance.now();
    clicks = now - lastClick < CLICK_GAP ? clicks + 1 : 1;
    lastClick = now;
    if (clicks >= 3) { clicks = 0; play(); }
  });
  // A triple-click would also select the whole paragraph; keep the selection out of the joke.
  document.addEventListener('mousedown', function (e) {
    if (e.detail > 1 && e.target.closest && e.target.closest('[data-matrix]')) e.preventDefault();
  });

  function play() {
    if (running) return;
    running = true;
    emit('egg:found', 'matrix');

    var layer = document.createElement('div');
    layer.className = 'matrix';
    layer.setAttribute('aria-hidden', 'true');
    var caption = document.createElement('div');
    caption.className = 'matrix-cap';
    caption.setAttribute('role', 'status');
    caption.textContent = 'Wake up, Neo… the build is green.';
    var stop = reduce ? function () {} : rain(layer);
    document.body.appendChild(layer);
    document.body.appendChild(caption);
    requestAnimationFrame(function () { layer.classList.add('on'); caption.classList.add('on'); });

    setTimeout(function () {
      layer.classList.remove('on'); caption.classList.remove('on');
      setTimeout(function () { stop(); layer.remove(); caption.remove(); running = false; }, FADE);
    }, reduce ? 3000 : DURATION);
  }
}

/* Draws the rain into a new canvas inside `layer`; returns a function that stops the animation frame. */
function rain(layer) {
  var cv = document.createElement('canvas'), g = cv.getContext('2d');
  layer.appendChild(cv);
  var W = cv.width = innerWidth, H = cv.height = innerHeight, size = W < 600 ? 14 : 18;
  var cols = Math.ceil(W / size), drops = [], speed = [], raf = 0, last = 0;
  for (var i = 0; i < cols; i++) { drops[i] = -Math.random() * H / size * .4; speed[i] = .8 + Math.random() * .9; }
  g.font = '600 ' + size + 'px "Geist Mono", ui-monospace, monospace';
  g.textAlign = 'center';

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; // ~30 updates/s is enough for the effect and cheap on laptops
    last = now;
    g.fillStyle = 'rgba(6,20,19,.14)';
    g.fillRect(0, 0, W, H);
    for (var c = 0; c < cols; c++) {
      var y = drops[c] * size;
      var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      g.fillStyle = Math.random() < .04 ? '#e9fff4' : '#35c46a';
      if (ch.length > 1) g.font = '600 ' + (size * .72) + 'px "Geist Mono", ui-monospace, monospace';
      g.fillText(ch, c * size + size / 2, y);
      if (ch.length > 1) g.font = '600 ' + size + 'px "Geist Mono", ui-monospace, monospace';
      drops[c] += speed[c];
      if (y > H && Math.random() > .975) drops[c] = 0;
    }
  }
  raf = requestAnimationFrame(frame);
  return function () { cancelAnimationFrame(raf); cv.width = cv.height = 0; };
}
