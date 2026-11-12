/* Confetti burst on a temporary full-screen canvas, in the site's palette. Triggered by the "confetti:burst" event ({ x, y } in
   viewport pixels), e.g. when the diamond bursts in overdrive. The canvas is removed when the last piece has faded.
   Skipped entirely for reduced motion. */
import { on } from '../core/events.js';
import { reduce } from '../core/env.js';

var COLORS = ['#14302f', '#1d6d68', '#2f9a92', '#63c0b8', '#9edbd5', '#e59a5a', '#f3c189', '#8fe0d8'];
var COUNT = 140, LIFE = 2.4, GRAVITY = 900;

export function initConfetti() {
  var cv = null, g = null, parts = [], raf = 0, last = 0, dpr = 1;

  on('confetti:burst', function (p) {
    if (reduce || !p) return;
    if (!cv) open();
    for (var i = 0; i < COUNT; i++) {
      var a = Math.random() * Math.PI * 2, v = 250 + Math.random() * 650;
      parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 260, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 14,
        w: 6 + Math.random() * 6, h: 3 + Math.random() * 4, flip: Math.random() * 6.28, c: COLORS[(Math.random() * COLORS.length) | 0], age: 0 });
    }
  });

  function open() {
    cv = document.createElement('canvas');
    cv.className = 'confetti';
    cv.setAttribute('aria-hidden', 'true');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    g = cv.getContext('2d');
    document.body.appendChild(cv);
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function close() {
    cancelAnimationFrame(raf);
    cv.remove(); cv = g = null; parts = [];
  }

  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cv.width, cv.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var q = parts[i];
      q.age += dt;
      if (q.age > LIFE || q.y > innerHeight + 40) { parts.splice(i, 1); continue; }
      q.vy += GRAVITY * dt; q.vx *= Math.exp(-dt * 1.6); q.vy *= Math.exp(-dt * .9);
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt; q.flip += dt * 9;
      g.save();
      g.globalAlpha = Math.min(1, (LIFE - q.age) / .5);
      g.translate(q.x, q.y); g.rotate(q.rot); g.scale(1, Math.cos(q.flip));
      g.fillStyle = q.c; g.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
      g.restore();
    }
    if (parts.length) raf = requestAnimationFrame(frame); else close();
  }
}
