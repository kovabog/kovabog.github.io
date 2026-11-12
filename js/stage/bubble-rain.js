/* Bubble rain (reward for the "pile" easter egg): for 3 seconds many glass bubbles fall from above the viewport and, under the
   physics in bubble-pile.js, pile up until the visible area is full. They bounce off the diamond and can be popped or dragged like
   any other bubble; popped ones are gone for good. Skipped with reduced motion. */
var DURATION = 3, MIN_R = .25, MAX_R = .55, MAX_COUNT = 220;

export function createBubbleRain(spawn, view, crystal, rnd, reduce) {
  var left = 0, rate = 0, acc = 0;

  /* Enough bubbles to fill the viewport minus the diamond's disc (mean bubble area ~ pi * 0.168, packed ~80%). */
  function start() {
    if (reduce || left > 0) return;
    var area = 4 * view.halfW * view.halfH - Math.PI * Math.pow(1.5 * crystal.scale.x, 2);
    left = Math.min(MAX_COUNT, Math.max(20, Math.ceil(Math.max(0, area) / (Math.PI * .168) * .9)));
    rate = left / DURATION; acc = 0;
  }

  function update(dt) {
    if (left <= 0) return;
    acc += rate * dt;
    while (acc >= 1 && left > 0) {
      acc -= 1; left--;
      var r = MIN_R + rnd() * (MAX_R - MIN_R), wall = view.halfW - r;
      spawn(r, (rnd() * 2 - 1) * wall, view.halfH + r + rnd() * 1.5, (rnd() - .5) * 1.2, -(1 + rnd() * 3));
    }
  }

  return { start: start, update: update };
}
