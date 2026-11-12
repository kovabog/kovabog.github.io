/* Pointer interaction with the 3D scene: drag/flick the diamond, double-tap it, pop or drag bubbles.
   Every rotation applied to the diamond (drag or flick inertia) is reported to scene3d.onSpin(radians) for the overdrive egg.
   Bubbles: press + release without moving pops it; moving past a few pixels drags it instead (scene3d.pile, see bubble-pile.js).
   On touch a bubble drag needs a short press-and-hold first, so a normal swipe over a bubble still scrolls the page. */
import { root } from '../core/env.js';
import { emit } from '../core/events.js';
import { sfx } from '../audio/sfx.js';
import { CAMZ } from './context.js';

var DRAG_PX = 6, DRAG_PX_TOUCH = 10, TOUCH_HOLD_MS = 170;

export function createInteraction(THREE, scene3d) {
  var cam = scene3d.cam, crystal = scene3d.crystal, dragG = scene3d.dragG, drops = scene3d.drops, view = scene3d.view, popDrop = scene3d.popDrop;
  var onSpin = scene3d.onSpin || function () {}, pile = scene3d.pile;

  var dragQ = new THREE.Quaternion(), IDQ = new THREE.Quaternion(), _qa = new THREE.Quaternion(), _ax = new THREE.Vector3(), _v = new THREE.Vector3();
  var dragging = false, dvx = 0, dvy = 0, lpx = 0, lpy = 0, lpt = 0, idle = 9, lastTap = 0;
  var pressed = null, held = null; // bubble pressed but not yet popped/dragged; bubble being dragged
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function turn(dx, dy) {
    _qa.setFromAxisAngle(_ax.set(0, 1, 0), dx); dragQ.premultiply(_qa);
    _qa.setFromAxisAngle(_ax.set(1, 0, 0), dy); dragQ.premultiply(_qa);
    dragQ.normalize();
  }

  /* Pointer path length since the last event, including the moves the browser coalesced into this one (fast wiggles would cancel out otherwise). */
  function pathLength(e, fromX, fromY) {
    var list = e.getCoalescedEvents ? e.getCoalescedEvents() : null, len = 0, px = fromX, py = fromY;
    if (!list || !list.length) list = [e];
    for (var i = 0; i < list.length; i++) { len += Math.hypot(list[i].clientX - px, list[i].clientY - py); px = list[i].clientX; py = list[i].clientY; }
    return len;
  }

  /* Page UI that should keep its normal pointer behaviour. */
  function isUI(t) { return t && t.closest && t.closest('a,button,input,textarea,select,label,nav,.card,.lg,.tool,.iconrow,.links,.facts,.secret,[data-speedo]'); }

  /* Nearest thing under the pointer: the gem or a live droplet. */
  function pick(cx, cy) {
    ndc.set(cx / view.W * 2 - 1, 1 - cy / view.H * 2); ray.setFromCamera(ndc, cam);
    var R0 = ray.ray, best = null, bt = 1e9, t;
    crystal.getWorldPosition(_v); var cr = 1.4 * crystal.scale.x;
    if (R0.distanceToPoint(_v) < cr) { t = _v.sub(R0.origin).dot(R0.direction) - cr * .6; best = { k: 'gem' }; bt = t; }
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      if (!d.m.visible || (d.state && d.state !== 'live')) continue;
      if (R0.distanceToPoint(d.m.position) < d.r * 1.2 + .06) {
        t = _v.copy(d.m.position).sub(R0.origin).dot(R0.direction) - d.r;
        if (t < bt) { bt = t; best = { k: 'drop', d: d }; }
      }
    }
    return best;
  }

  window.addEventListener('pointermove', function (e) {
    if (held && e.pointerId === held.id) { pile.move(held.d, e.clientX, e.clientY); return; }
    if (pressed && e.pointerId === pressed.id) {
      var touch = pressed.type === 'touch';
      if (Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) < (touch ? DRAG_PX_TOUCH : DRAG_PX)) return;
      if (touch && performance.now() - pressed.t < TOUCH_HOLD_MS) { pressed = null; setTouchBlock(false); return; } // a swipe: let the page scroll
      startBubbleDrag(e);
      return;
    }
    if (dragging) {
      var now = performance.now(), dtt = Math.max(8, now - lpt) / 1000, dx = (e.clientX - lpx) * .0085, dy = (e.clientY - lpy) * .0085;
      turn(dx, dy); onSpin(pathLength(e, lpx, lpy) * .0085); dvx = dx / dtt; dvy = dy / dtt; lpx = e.clientX; lpy = e.clientY; lpt = now; idle = 0; return;
    }
    if (e.pointerType !== 'mouse') return;
    var h = isUI(e.target) ? null : pick(e.clientX, e.clientY);
    root.style.cursor = h ? 'grab' : '';
  }, { passive: true });

  /* While a bubble is held (or pressed long enough to become a drag) the finger moves the bubble, not the page.
     The blocking listener only exists while a bubble is pressed by touch, so normal scrolling never waits for it. */
  function blockTouchScroll(e) {
    if (held || (pressed && performance.now() - pressed.t >= TOUCH_HOLD_MS)) e.preventDefault();
  }
  function setTouchBlock(on) {
    if (on) window.addEventListener('touchmove', blockTouchScroll, { passive: false });
    else window.removeEventListener('touchmove', blockTouchScroll, { passive: false });
  }

  function startBubbleDrag(e) {
    var d = pressed.d;
    pile.grab(d, pressed.x, pressed.y, CAMZ);
    pile.move(d, e.clientX, e.clientY);
    held = { d: d, id: pressed.id };
    pressed = null;
    root.classList.add('dragging');
  }

  function endBubble(e, cancelled) {
    if (held && (!e || e.pointerId === held.id)) {
      pile.release(held.d); held = null;
      root.classList.remove('dragging'); root.style.cursor = 'grab';
    }
    if (pressed && (!e || e.pointerId === pressed.id)) {
      if (!cancelled && e) popDrop(pressed.d);
      pressed = null;
    }
    if (!held && !pressed) setTouchBlock(false);
  }

  window.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || isUI(e.target)) return;
    var h = pick(e.clientX, e.clientY); if (!h) return;
    if (h.k === 'drop') {
      if (!pile) { popDrop(h.d); return; }
      if (e.pointerType !== 'touch') e.preventDefault(); // no text selection while dragging a bubble
      pressed = { d: h.d, id: e.pointerId, type: e.pointerType, x: e.clientX, y: e.clientY, t: performance.now() };
      if (e.pointerType === 'touch') setTouchBlock(true);
      return;
    }
    if (e.pointerType === 'touch') {
      var nowT = performance.now();
      if (nowT - lastTap < 380) { emit('egg:found', 'gem'); lastTap = 0; } else lastTap = nowT;
      dvx += 7 * (e.clientX < view.W / 2 ? -1 : 1); idle = 0; return;
    }
    e.preventDefault(); sfx.click(); dragging = true; dvx = dvy = 0; lpx = e.clientX; lpy = e.clientY; lpt = performance.now(); idle = 0; root.classList.add('dragging');
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false; root.classList.remove('dragging'); root.style.cursor = 'grab';
    if (performance.now() - lpt > 90) { dvx = dvy = 0; }
  }

  window.addEventListener('dblclick', function (e) {
    if (isUI(e.target)) return;
    var h = pick(e.clientX, e.clientY);
    if (h && h.k === 'gem') emit('egg:found', 'gem');
  });
  window.addEventListener('pointerup', function (e) { endBubble(e, false); endDrag(); });
  window.addEventListener('pointercancel', function (e) { endBubble(e, true); endDrag(); });
  window.addEventListener('blur', function () { endBubble(null, true); endDrag(); });

  return {
    /* Applies drag inertia, eases back to rest when idle, and writes the rotation to the drag group. */
    update: function (dt) {
      if (!dragging) {
        if (Math.abs(dvx) + Math.abs(dvy) > .002) { turn(dvx * dt, dvy * dt); onSpin(Math.hypot(dvx, dvy) * dt); var dmp = Math.exp(-dt * 2.6); dvx *= dmp; dvy *= dmp; }
        idle += dt; if (idle > 2.5) dragQ.slerp(IDQ, 1 - Math.exp(-dt * .7));
      }
      dragG.quaternion.copy(dragQ);
    }
  };
}
