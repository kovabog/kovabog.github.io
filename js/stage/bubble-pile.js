/* Bubble drag-and-drop with a tiny physics loop (easter egg "pile": 3 dropped bubbles resting in the pile).
   interaction.js grabs a bubble once the pointer moves past a small threshold after pressing it (a plain click still pops it).
   A grabbed bubble follows the pointer; released, it falls with gravity, bumps into the other dropped bubbles and the bottom
   and sides of the viewport (bubbles live in the fixed WebGL layer, so the viewport is their container) and settles in a pile.

   Physics runs in world units on the z = 0 plane, where view.halfW / view.halfH are the visible half extents.
   Each dropped bubble gets d.phys = { x, y, z, vx, vy, held, ... }; droplets.js draws it from there instead of its drifting path.
   Popping a bubble ends its physics (droplets.js clears d.phys when it grows back). */
import { emit } from '../core/events.js';

var GRAVITY = 15, BOUNCE = .28, AIR = .5, CONTACT_FRICTION = 5, MAX_SPEED = 18, SUBSTEPS = 3, ITERATIONS = 3;
var PILE_EGG = 3, REST_SPEED = .35, REST_TIME = .6;

export function createBubblePile(drops, view) {
  var eggDone = false;

  function toWorld(cx, cy) { return { x: (cx / view.W * 2 - 1) * view.halfW, y: (1 - cy / view.H * 2) * view.halfH }; }

  /* Starts dragging d from the pointer position (cx, cy) in viewport pixels. */
  function grab(d, cx, cy, camZ) {
    var p = toWorld(cx, cy), pos = d.m.position;
    if (!d.phys) {
      // Same spot on screen, expressed on the z = 0 plane; z then eases to 0 so all dropped bubbles share one plane.
      var k = camZ / (camZ - pos.z);
      d.phys = { x: pos.x * k, y: pos.y * k, z: pos.z, vx: 0, vy: 0, rest: 0 };
    }
    var ph = d.phys;
    ph.held = true; ph.ox = ph.x - p.x; ph.oy = ph.y - p.y; ph.tx = ph.x; ph.ty = ph.y; ph.rest = 0;
  }

  function move(d, cx, cy) {
    if (!d.phys) return;
    var p = toWorld(cx, cy);
    d.phys.tx = p.x + d.phys.ox; d.phys.ty = p.y + d.phys.oy;
  }

  function release(d) {
    if (!d.phys) return;
    var ph = d.phys, sp = Math.hypot(ph.vx, ph.vy);
    if (sp > MAX_SPEED) { ph.vx *= MAX_SPEED / sp; ph.vy *= MAX_SPEED / sp; }
    ph.held = false; ph.rest = 0;
  }

  function step(dt) {
    var list = [];
    for (var i = 0; i < drops.length; i++) if (drops[i].phys && (!drops[i].state || drops[i].state === 'live')) list.push(drops[i]);
    if (!list.length) return;
    var h = dt / SUBSTEPS, n = list.length, a, b, pa, pb, s;

    for (s = 0; s < SUBSTEPS; s++) {
      for (i = 0; i < n; i++) {
        pa = list[i].phys;
        pa.z += (0 - pa.z) * (1 - Math.exp(-h * 8));
        if (pa.held) {
          var nx = pa.x + (pa.tx - pa.x) * (1 - Math.exp(-h * 28)), ny = pa.y + (pa.ty - pa.y) * (1 - Math.exp(-h * 28));
          pa.vx = (nx - pa.x) / h; pa.vy = (ny - pa.y) / h; pa.x = nx; pa.y = ny;
        } else {
          pa.vy -= GRAVITY * h;
          var air = Math.exp(-h * AIR); pa.vx *= air; pa.vy *= air;
          pa.x += pa.vx * h; pa.y += pa.vy * h;
        }
      }
      for (var it = 0; it < ITERATIONS; it++) {
        for (i = 0; i < n; i++) {
          a = list[i]; pa = a.phys;
          for (var j = i + 1; j < n; j++) {
            b = list[j]; pb = b.phys;
            var dx = pb.x - pa.x, dy = pb.y - pa.y, dist = Math.hypot(dx, dy), minD = a.r + b.r;
            if (dist >= minD || dist < 1e-6) continue;
            var wa = pa.held ? 0 : 1 / (a.r * a.r), wb = pb.held ? 0 : 1 / (b.r * b.r), w = wa + wb;
            if (!w) continue;
            var ux = dx / dist, uy = dy / dist, overlap = minD - dist;
            pa.x -= ux * overlap * wa / w; pa.y -= uy * overlap * wa / w;
            pb.x += ux * overlap * wb / w; pb.y += uy * overlap * wb / w;
            var vn = (pb.vx - pa.vx) * ux + (pb.vy - pa.vy) * uy;
            if (vn < 0) {
              var jn = -(1 + BOUNCE) * vn / w;
              pa.vx -= jn * wa * ux; pa.vy -= jn * wa * uy; pb.vx += jn * wb * ux; pb.vy += jn * wb * uy;
            }
            // Rolling friction between touching bubbles, so they stack instead of sliding apart forever.
            var f = Math.exp(-h * CONTACT_FRICTION);
            if (!pa.held) pa.vx *= f;
            if (!pb.held) pb.vx *= f;
          }
          bounds(a);
        }
      }
    }

    var resting = 0;
    for (i = 0; i < n; i++) {
      pa = list[i].phys;
      if (pa.held) continue;
      pa.rest = Math.hypot(pa.vx, pa.vy) < REST_SPEED ? pa.rest + dt : 0;
      if (pa.rest > REST_TIME) resting++;
    }
    if (!eggDone && resting >= PILE_EGG) { eggDone = true; emit('egg:found', 'pile'); }
  }

  /* Floor and side walls of the viewport. */
  function bounds(d) {
    var ph = d.phys, r = d.r, floor = -view.halfH + r, wall = view.halfW - r;
    if (ph.y < floor) { ph.y = floor; if (ph.vy < 0) ph.vy = -ph.vy * BOUNCE; ph.vx *= .96; }
    if (ph.x < -wall) { ph.x = -wall; if (ph.vx < 0) ph.vx = -ph.vx * BOUNCE; }
    if (ph.x > wall) { ph.x = wall; if (ph.vx > 0) ph.vx = -ph.vx * BOUNCE; }
  }

  return { grab: grab, move: move, release: release, step: step };
}
