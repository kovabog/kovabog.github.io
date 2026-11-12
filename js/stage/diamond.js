/* The diamond: group hierarchy (position -> drag -> tilt -> spin), the gem mesh, and how its pose follows the scroll.

   crystal (page position/scale)
     dragG (user drag rotation, owned by interaction.js)
       tiltG (tilt towards pointer/scroll velocity)
         spinG (continuous spin) -> gem mesh
       ringG (orbit plane for the badges)
*/
import { clamp01, easeOutBack } from '../core/util.js';
import { buildGemGeometry, computeHullPlanes } from './gem-geometry.js';
import { createSparkleEnvironment, createGemMaterial } from './gem-material.js';

export function createDiamond(THREE, renderer, scene, reduce) {
  var crystal = new THREE.Group(), tiltG = new THREE.Group(), spinG = new THREE.Group(), ringG = new THREE.Group();
  var dragG = new THREE.Group();
  scene.add(crystal); crystal.add(dragG); dragG.add(tiltG); tiltG.add(spinG); dragG.add(ringG);

  var gemGeo = buildGemGeometry(THREE);
  var planes = computeHullPlanes(THREE, gemGeo);
  var gemMat = createGemMaterial(THREE, planes, createSparkleEnvironment(THREE, renderer).texture);
  var gem = new THREE.Mesh(gemGeo, gemMat); gem.scale.setScalar(1.55); gem.frustumCulled = false;
  gem.onBeforeRender = function () { gemMat.uniforms.uRot.value.setFromMatrix4(this.matrixWorld); };
  spinG.add(gem);

  ringG.rotation.set(1.18, 0, .22);

  var diamond = { crystal: crystal, dragG: dragG, ringG: ringG, spin: 0 };

  /* s: { cur, T, IT, highlightLevel, mx, my, vel, scrollSm, boostSpin, boostScale }, v: viewport metrics
     boostSpin/boostScale come from the overdrive easter egg (extra spin angle, size multiplier). */
  diamond.update = function (s, v) {
    var ie = 1 - Math.pow(1 - clamp01(s.IT / 2.6), 3), gs = easeOutBack(clamp01((s.IT - .8) / .85));
    crystal.position.set(s.cur.x * v.halfW, s.cur.y * v.halfH + (reduce ? 0 : Math.sin(s.T * .8) * .08), 0);
    crystal.scale.setScalar(s.cur.s);
    gem.scale.setScalar(1.55 * gs * (1 + .05 * s.highlightLevel) * (s.boostScale == null ? 1 : s.boostScale));
    gem.visible = !(s.boostScale < .001);
    tiltG.rotation.z = s.cur.tilt + s.mx * .06;
    tiltG.rotation.x = .42 + (reduce ? 0 : Math.sin(s.T * .5) * .07) + s.my * .06 + Math.max(-.35, Math.min(.35, s.vel * .00022));
    diamond.spin = s.scrollSm * .0042 + (reduce ? 0 : s.T * .24) + (1 - ie) * Math.PI * 3 + s.mx * .15 + (s.boostSpin || 0);
    spinG.rotation.y = diamond.spin;
  };

  return diamond;
}
