/* Foam party: on "party:foam" (every 10th popped bubble, see stage/droplets) the page dims for 5 seconds, a mirror ball drops in
   (three.js, ui/disco-ball; a CSS ball if that fails), its reflected light spots sweep across the screen and foam rises from
   the bottom, bubbling, then sinks away. The overlay never takes clicks.
   Reduced motion: the ball, the spots and the foam stay still; the overlay only fades in and out. */
import { on } from '../core/events.js';
import { reduce } from '../core/env.js';
import { sfx } from '../audio/sfx.js';
import { createDiscoBall, SPIN } from '../ui/disco-ball.js';

var DURATION = 5, FADE = .6, RISE = 1.4, SINK = .9;
var TINTS = ['#ffffff', '#ffffff', '#ffffff', '#ffd9f0', '#d6f6ff', '#fff3c4', '#e6dcff', '#ff6fb8', '#5fdcff', '#ffe066'];

export function initFoamParty() {
  var el = null;

  on('party:foam', function () {
    if (el) return;
    var node = el = build();
    document.body.appendChild(node);
    sfx.disco(DURATION);
    requestAnimationFrame(function () { node.classList.add('on'); });

    var ball = null, ended = false;
    createDiscoBall(node.querySelector('.fp-gl')).then(function (b) {
      if (ended) { b.stop(); return; }
      ball = b; node.classList.add('gl');
    }).catch(function () {});

    var stop = scene(node.querySelector('.fp-foam'), node.querySelector('.fp-globe'));
    setTimeout(function () { node.classList.remove('on'); }, (DURATION - FADE) * 1000);
    setTimeout(function () { ended = true; stop(); if (ball) ball.stop(); node.remove(); el = null; }, DURATION * 1000);
  });
}

function build() {
  var root = document.createElement('div');
  root.className = 'foam-party' + (reduce ? ' still' : '');
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="fp-dim"></div><canvas class="fp-foam"></canvas>' +
    '<div class="fp-ball"><div class="fp-string"></div><div class="fp-globe"><div class="fp-tiles"></div><canvas class="fp-gl"></canvas></div></div>';
  return root;
}

/* Soft round glow sprite in one colour, drawn once and stamped for every light spot. */
function glow(color) {
  var c = document.createElement('canvas'); c.width = c.height = 64;
  var g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, color); r.addColorStop(.28, color); r.addColorStop(.5, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return c;
}

/* Draws the reflected light spots and the foam on the canvas until the returned stop() is called. */
function scene(cv, globe) {
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  var g = cv.getContext('2d'), start = performance.now(), raf = 0;
  var top = Math.min(H * .34, 320);

  /* Light spots: directions from the ball; each one turns with the ball and is projected onto the screen as onto a wall. */
  var sprites = TINTS.map(glow), spots = [];
  for (var s = 0; s < 480; s++) {
    spots.push({ lon: Math.random() * 6.2832, lat: -1.1 + Math.random() * 1.45, r: 4 + Math.random() * 6, img: sprites[(Math.random() * sprites.length) | 0],
      tw: Math.random() * 6.28 });
  }
  function drawSpots(t) {
    var b = globe.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, F = Math.max(W, H) * .55;
    g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < spots.length; i++) {
      var p = spots[i], th = p.lon + t * SPIN, cl = Math.cos(p.lat);
      var dx = Math.sin(th) * cl, dy = Math.sin(p.lat), dz = Math.cos(th) * cl;
      if (dz < .12) continue;
      var x = cx + dx / dz * F, y = cy - dy / dz * F;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      var size = p.r * 4 * Math.min(2.2, 1 / dz), a = Math.min(1, (dz - .12) * 4) * (.8 + .2 * Math.sin(t * 9 + p.tw));
      g.globalAlpha = a;
      g.drawImage(p.img, x - size / 2, y - size / 2, size, size);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  var blobs = [], step = Math.max(26, W / 34);
  for (var x = -step; x < W + step; x += step * (.6 + Math.random() * .5)) {
    blobs.push({ x: x, r: step * (.75 + Math.random() * .7), dy: Math.random() * top * .35, ph: Math.random() * 6.28, sp: .8 + Math.random() * 1.4 });
  }
  var fizz = [];
  function spawn(level) {
    fizz.push({ x: Math.random() * W, y: H - level + 10, r: 4 + Math.random() * 14, vy: 40 + Math.random() * 90,
      ph: Math.random() * 6.28, hue: Math.random() * 360, age: 0, life: 1.6 + Math.random() * 1.8 });
  }

  function levelAt(t) {
    if (reduce) return top;
    var up = Math.min(1, t / RISE), down = Math.max(0, (t - (DURATION - SINK)) / SINK);
    up = 1 - Math.pow(1 - up, 3);
    return top * up * (1 - down * down);
  }

  var last = start;
  function frame(now) {
    var t = (now - start) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    var level = levelAt(t);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    drawSpots(t);

    var base = H - level + top * .25;
    var grad = g.createLinearGradient(0, H - level, 0, H);
    grad.addColorStop(0, 'rgba(255,255,255,.96)'); grad.addColorStop(1, 'rgba(226,238,246,.96)');
    g.fillStyle = grad;
    g.fillRect(0, base, W, H - base);
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i], wob = reduce ? 0 : Math.sin(t * b.sp + b.ph) * 6;
      var y = H - level + b.dy + wob + (1 - level / top) * b.r * 1.2;
      if (y - b.r > H) continue;
      var rg = g.createRadialGradient(b.x - b.r * .3, y - b.r * .35, b.r * .1, b.x, y, b.r);
      rg.addColorStop(0, '#ffffff'); rg.addColorStop(.75, '#f3f8fb'); rg.addColorStop(1, '#d4e3ec');
      g.fillStyle = rg;
      g.beginPath(); g.arc(b.x, y, b.r, 0, 6.2832); g.fill();
    }

    if (!reduce) {
      if (level > 20 && t < DURATION - SINK && Math.random() < .55) spawn(level);
      for (var j = fizz.length - 1; j >= 0; j--) {
        var f = fizz[j];
        f.age += dt; f.y -= f.vy * dt;
        if (f.age > f.life) { fizz.splice(j, 1); continue; }
        var fx = f.x + Math.sin(f.age * 3 + f.ph) * 12;
        g.globalAlpha = Math.min(1, (f.life - f.age) / .5) * .85;
        g.lineWidth = 1.5;
        g.strokeStyle = 'hsl(' + ((f.hue + t * 120) % 360) + ',90%,75%)';
        g.fillStyle = 'rgba(255,255,255,.18)';
        g.beginPath(); g.arc(fx, f.y, f.r, 0, 6.2832); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.9)';
        g.beginPath(); g.arc(fx - f.r * .35, f.y - f.r * .35, f.r * .22, 0, 6.2832); g.fill();
        g.globalAlpha = 1;
      }
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return function () { cancelAnimationFrame(raf); };
}
