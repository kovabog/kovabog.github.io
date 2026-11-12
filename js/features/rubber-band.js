/* Easter egg "rubber". Trigger: at the very bottom of the page, keep scrolling (mouse wheel / trackpad, or drag up on touch).
   The page content (main + footer) stretches up elastically: translateY with growing resistance, capped at 80px. Past a
   threshold "You've reached the end of the stack." appears; on release it springs back with a damped bounce.
   Only transforms are used, so the scroll position and the scroll % readout never change.
   On touch, the scroll-blocking touchmove listener exists only while a touch that started at the bottom is in progress.
   Reduced motion: nothing moves; the note just shows for a moment. */
import { emit } from '../core/events.js';
import { reduce } from '../core/env.js';

var CAP = 80, SOFTNESS = 150, SHOW_AT = 44, WHEEL_IDLE_MS = 160;

export function initRubberBand() {
  var parts = [document.querySelector('main'), document.querySelector('footer')].filter(Boolean);
  if (!parts.length) return;

  var note = document.createElement('div');
  note.className = 'end-note mono';
  note.setAttribute('role', 'status');
  document.body.appendChild(note);

  var raw = 0, shown = 0, wheelTimer = 0, springRaf = 0, noteTimer = 0;

  function atBottom() { return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2; }
  function stretchOf(r) { return CAP * (1 - Math.exp(-r / SOFTNESS)); }
  function rawOf(s) { return -SOFTNESS * Math.log(1 - Math.min(s, CAP - .01) / CAP); }

  function paint(s) {
    shown = s;
    var t = Math.abs(s) < .3 ? '' : 'translate3d(0,' + (-s).toFixed(2) + 'px,0)';
    for (var i = 0; i < parts.length; i++) parts[i].style.transform = t;
    showNote(s >= SHOW_AT);
  }

  function showNote(on) {
    if (on && !note.classList.contains('on')) {
      note.textContent = 'You’ve reached the end of the stack.';
      note.classList.add('on');
      emit('egg:found', 'rubber');
    } else if (!on && note.classList.contains('on')) note.classList.remove('on');
  }

  /* Adds pull distance (px of scroll intent past the bottom). */
  function pull(px) {
    cancelAnimationFrame(springRaf);
    raw = Math.max(0, raw + px);
    if (reduce) {
      if (raw > SOFTNESS) { showNote(true); clearTimeout(noteTimer); noteTimer = setTimeout(function () { showNote(false); raw = 0; }, 2200); }
      return;
    }
    paint(stretchOf(raw));
  }

  /* Damped spring back to rest. */
  function release() {
    clearTimeout(wheelTimer);
    if (reduce) { raw = 0; return; }
    if (shown < .3) { raw = 0; paint(0); return; }
    var from = shown, t0 = performance.now();
    raw = 0;
    cancelAnimationFrame(springRaf);
    (function step(now) {
      var t = (now - t0) / 1000, s = from * Math.exp(-t * 7.5) * Math.cos(t * 13);
      if (t > 1.1) { paint(0); return; }
      paint(s);
      springRaf = requestAnimationFrame(step);
    })(t0);
  }

  /* Desktop: wheel / trackpad. Passive, never blocks scrolling. */
  window.addEventListener('wheel', function (e) {
    var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
    if (dy > 0 && atBottom()) {
      if (raw === 0 && shown > .3) raw = rawOf(shown); // caught mid-spring
      pull(dy * .6);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(release, WHEEL_IDLE_MS);
    } else if (dy < 0 && (raw > 0 || shown > .3)) release();
  }, { passive: true });

  /* Touch: drag up past the bottom. */
  var lastY = 0, pulling = false;
  function onMove(e) {
    var y = e.touches[0].clientY, dy = lastY - y; lastY = y;
    if (!pulling) {
      if (dy > 0 && atBottom()) pulling = true; else return;
    }
    if (dy < 0 && raw + dy <= 0) { pulling = false; raw = 0; paint(0); return; } // back at rest: let the page scroll up again
    e.preventDefault(); // the page cannot scroll further anyway; this keeps the native overscroll from fighting the stretch
    pull(dy);
  }
  function onEnd() {
    window.removeEventListener('touchmove', onMove, { passive: false });
    window.removeEventListener('touchend', onEnd); window.removeEventListener('touchcancel', onEnd);
    if (pulling) { pulling = false; release(); }
  }
  window.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || !atBottom()) return;
    lastY = e.touches[0].clientY; pulling = false;
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd); window.addEventListener('touchcancel', onEnd);
  }, { passive: true });
}
