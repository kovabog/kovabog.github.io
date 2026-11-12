/* Technology badges orbiting the diamond. Each badge pops in during the intro and the hovered one swings to the front. */
import { clamp01, easeOutBack } from '../core/util.js';

export function createOrbitRing(THREE, ringG, crystal, textures, order, reduce) {
  var sprites = [];
  var front = new THREE.Vector3();

  textures.forEach(function (t, i) {
    if (!t) return;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
    sp.scale.setScalar(0); ringG.add(sp);
    sprites.push({ sp: sp, a: i * Math.PI * 2 / order.length, key: order[i], h: 0 });
  });

  /* s: { T, dt, IT, scrollSm, highlightKey, highlightLevel, spread (0..1, badges fly outward on gem double-click) } */
  function update(s) {
    var ra = (reduce ? 0 : s.T * .32) + s.scrollSm * .0028;
    crystal.updateMatrixWorld(true);
    front.set(0, 1.3, 2.2); crystal.localToWorld(front); ringG.worldToLocal(front);
    for (var q = 0; q < sprites.length; q++) {
      var o = sprites[q], a = o.a + ra, oe = s.IT >= 50 ? 1 : Math.max(0, easeOutBack(clamp01((s.IT - 1.55 - q * .08) / .7)));
      o.h += ((s.highlightKey === o.key ? 1 : 0) - o.h) * (1 - Math.exp(-s.dt * 9)); var hh = o.h * o.h * (3 - 2 * o.h);
      var rad = 2.05 * Math.min(1.15, oe) * (1 + 1.6 * (s.spread || 0));
      o.sp.position.set(Math.cos(a) * rad, Math.sin(s.T * 1.1 + q) * .06, Math.sin(a) * rad).lerp(front, hh);
      o.sp.scale.setScalar(.55 * oe * (1 + .8 * hh));
      o.sp.material.opacity = 1 - .7 * s.highlightLevel * (1 - o.h);
      o.sp.renderOrder = hh > .05 ? 10 : 0;
    }
  }

  return { update: update };
}
