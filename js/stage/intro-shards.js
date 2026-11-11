/* Intro effect: badge-shaped shards fly in from all sides and merge into the diamond. */
import { clamp01 } from '../core/util.js';

var SHARD_COUNT = 30;

export function createIntroShards(THREE, crystal, textures, rnd) {
  var shards = [];
  var good = textures.filter(Boolean);

  for (var k = 0; k < SHARD_COUNT && good.length; k++) {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: good[k % good.length], transparent: true, depthWrite: false, toneMapped: false }));
    var th = rnd() * 6.2832, dir = new THREE.Vector3(Math.cos(th), Math.sin(th) * .85, -.5 + rnd() * .7).normalize();
    s.visible = false; crystal.add(s);
    shards.push({ sp: s, dir: dir, dist: 4.2 + rnd() * 3.2, d: k * .02 + rnd() * .12, dur: .75 + rnd() * .25, rot: (rnd() - .5) * 7, sz: .55 + rnd() * .3 });
  }

  /* IT: intro seconds; started: whether the intro clock is running */
  function update(IT, started) {
    for (var si = 0; si < shards.length; si++) {
      var S = shards[si], su = clamp01((IT - S.d) / S.dur);
      if (!started || su >= 1) { S.sp.visible = false; continue; }
      var se = su < .5 ? 2 * su * su : 1 - 2 * (1 - su) * (1 - su);
      S.sp.visible = true; S.sp.position.copy(S.dir).multiplyScalar(S.dist * (1 - se));
      S.sp.scale.setScalar(S.sz * (1 - .85 * se * se)); S.sp.material.rotation = S.rot * (1 - se); S.sp.material.opacity = Math.min(1, su * 5);
    }
  }

  return { update: update };
}
