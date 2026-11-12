/* Double-click on the diamond (egg "gem"): the gem swells a little and the tech badges fly outward,
   then after 2 s everything settles back. Exposes a 0..1 level that the diamond (size) and the orbit ring (radius) read each frame.
   Reduced motion: no movement at all. */
import { clamp01, smoothstep } from '../core/util.js';

var DURATION = 2, OUT = .35, BACK_FROM = 1.15;

export function createGemBurst(reduce) {
  var t = DURATION, k = 0;

  return {
    trigger: function () { if (!reduce && t >= DURATION) t = 0; },
    update: function (dt) {
      if (t >= DURATION) { k = 0; return; }
      t += dt;
      k = t < OUT ? smoothstep(clamp01(t / OUT)) : 1 - smoothstep(clamp01((t - BACK_FROM) / (DURATION - BACK_FROM)));
    },
    /* 0 at rest, 1 at the peak of the burst. */
    level: function () { return k; }
  };
}
