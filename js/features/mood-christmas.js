/* Christmas mood, Dec 24-26 (?date=2026-12-25 to test): adds html.xmas, falling snow behind the content, a string of
   lights on the navigation and a "З Різдвом!" note in the hero. It is a themed state of the same page.
   Off switch: MOODS.christmas in data/moods.js (or delete this file, its init line and css/moods/christmas.css).
   Reduced motion: no snow and the lights do not twinkle. */
import { root, reduce } from '../core/env.js';
import { now } from '../core/clock.js';
import { heroNote } from '../ui/hero-note.js';
import { MOODS, CHRISTMAS } from '../data/moods.js';

var BULBS = 16;

export function initMoodChristmas() {
  if (!MOODS.christmas) return;
  var d = now();
  if (d.getMonth() + 1 !== CHRISTMAS.month || d.getDate() < CHRISTMAS.from || d.getDate() > CHRISTMAS.to) return;

  root.classList.add('xmas');
  lights();
  heroNote('З Різдвом!', { lang: 'uk', cls: 'xmas' });
  if (!reduce) snow();
}

function lights() {
  var nav = document.querySelector('nav');
  if (!nav) return;
  var g = document.createElement('span');
  g.className = 'garland';
  g.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < BULBS; i++) g.appendChild(document.createElement('i'));
  nav.appendChild(g);
}

/* Lightweight canvas snow behind the page content (pointer-events: none). */
function snow() {
  var cv = document.createElement('canvas'), g = cv.getContext('2d');
  cv.className = 'snow';
  cv.setAttribute('aria-hidden', 'true');
  var stage = document.getElementById('stage');
  document.body.insertBefore(cv, stage ? stage.nextSibling : document.body.firstChild);

  var W, H, flakes = [], last = performance.now();
  function size() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    var want = W < 600 ? 45 : 90;
    while (flakes.length < want) flakes.push(flake(Math.random() * H));
    flakes.length = want;
  }
  function flake(y) {
    return { x: Math.random() * W, y: y, r: .8 + Math.random() * 2.4, v: 18 + Math.random() * 38, ph: Math.random() * 6.28, sw: .4 + Math.random() * 1.2 };
  }
  size();
  window.addEventListener('resize', size);

  (function frame(t) {
    var dt = Math.min(.05, (t - last) / 1000); last = t;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.92)';
    g.strokeStyle = 'rgba(20,48,47,.16)';
    g.lineWidth = .8;
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.v * dt; f.ph += dt * f.sw; f.x += Math.sin(f.ph) * 12 * dt;
      if (f.y > H + 4) { flakes[i] = flake(-4); continue; }
      g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.2832); g.fill(); g.stroke();
    }
    requestAnimationFrame(frame);
  })(last);
}
