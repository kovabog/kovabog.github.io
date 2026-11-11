/* Small, dependency-free helpers. */

export function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

export function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

export function lerp(a, b, t) { return a + (b - a) * t; }

export function smoothstep(t) { return t * t * (3 - 2 * t); }

/* Ease-out with a small overshoot. */
export function easeOutBack(u) {
  var c = 1.70158;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
}

/* Deterministic pseudo-random generator (Park-Miller). Same seed, same layout on every visit. */
export function createRng(seed) {
  return function () {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
