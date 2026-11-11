/* Smoothed camera-side state: eased diamond pose, eased scroll, scroll velocity and pointer position. */

export function createMotion(layout, reduce) {
  var first = layout.firstSection();
  var cur = { x: first.x, y: first.y, s: first.s, tilt: first.tilt };
  var scrollSm = window.scrollY, vel = 0, lastY = window.scrollY, mx = 0, my = 0, tmx = 0, tmy = 0;

  window.addEventListener('pointermove', function (e) {
    tmx = (e.clientX / layout.view.W - .5) * 2;
    tmy = (e.clientY / layout.view.H - .5) * 2;
  }, { passive: true });

  var state = { cur: cur, scrollSm: 0, vel: 0, mx: 0, my: 0 };

  state.update = function (dt, y) {
    var k = 1 - Math.exp(-dt * (reduce ? 30 : 4.2));
    var tg = layout.pose(y);
    cur.x += (tg.x - cur.x) * k; cur.y += (tg.y - cur.y) * k; cur.s += (tg.s - cur.s) * k; cur.tilt += (tg.tilt - cur.tilt) * k;
    scrollSm += (y - scrollSm) * (1 - Math.exp(-dt * (reduce ? 30 : 5)));
    vel += (((y - lastY) / Math.max(dt, .001)) - vel) * (1 - Math.exp(-dt * 6)); lastY = y;
    mx += (tmx - mx) * k; my += (tmy - my) * k;
    state.scrollSm = scrollSm; state.vel = vel; state.mx = mx; state.my = my;
  };

  return state;
}
