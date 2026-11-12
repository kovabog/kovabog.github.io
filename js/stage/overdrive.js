/* Diamond overdrive (easter egg "overdrive").
   Trigger: spin the diamond fast, about 3 full turns of drag/flick rotation within 2 seconds
   (interaction.js reports every bit of rotation it applies through addSpin).
   Then: the diamond glows and spins up on its own for ~1 s, bursts into confetti ("confetti:burst" event)
   and a ring of sparks, stays gone ~1.5 s and re-forms. Reduced motion: a short glow only. */
import { emit } from '../core/events.js';
import { easeOutBack } from '../core/util.js';
import { sfx } from '../audio/sfx.js';

var WINDOW = 2, TURNS = 3, SPINUP = 1, GONE = 1.5, REFORM = .8, GLOW_ONLY = 1.4;
var TAU = Math.PI * 2;

export function createOverdrive(THREE, crystal, cam, view, textures, particles, reduce) {
  var samples = [], sum = 0, state = 'idle', t = 0, extra = 0, omega = 0, scale = 1, glowLevel = 0;
  var _v = new THREE.Vector3();

  var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures.glow, color: 0xffb27a, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }));
  glow.scale.setScalar(7); glow.visible = false;
  crystal.add(glow);

  function prune(now) {
    while (samples.length && now - samples[0][0] > WINDOW) sum -= samples.shift()[1];
    if (!samples.length) sum = 0;
  }

  /* Called with the absolute rotation (radians) the user just applied to the diamond. */
  function addSpin(a) {
    if (state !== 'idle' || !(a > 0)) return;
    var now = performance.now() / 1000;
    samples.push([now, a]); sum += a; prune(now);
    if (sum >= TURNS * TAU) start();
  }

  function start() {
    samples = []; sum = 0; t = 0; omega = 0;
    state = reduce ? 'glow' : 'spinup';
    if (reduce) emit('egg:found', 'overdrive');
  }

  function burst() {
    crystal.getWorldPosition(_v);
    particles.burst(_v, 1.4 * crystal.scale.x);
    _v.project(cam);
    emit('confetti:burst', { x: (_v.x + 1) / 2 * view.W, y: (1 - _v.y) / 2 * view.H });
    sfx.pop();
    emit('egg:found', 'overdrive');
  }

  function update(dt) {
    prune(performance.now() / 1000);
    if (state === 'idle') { glowLevel = 0; scale = 1; }
    else if (state === 'glow') {
      t += dt; glowLevel = Math.sin(Math.min(1, t / GLOW_ONLY) * Math.PI);
      if (t >= GLOW_ONLY) state = 'idle';
    } else if (state === 'spinup') {
      t += dt; var u = Math.min(1, t / SPINUP);
      omega = 3 + 42 * u * u; extra += omega * dt;
      glowLevel = Math.min(1, t / .3); scale = 1 + .08 * u + .03 * Math.sin(t * 60) * u;
      if (u >= 1) { burst(); state = 'gone'; t = 0; scale = 0; }
    } else if (state === 'gone') {
      t += dt; omega *= Math.exp(-dt * 3); extra += omega * dt; scale = 0; glowLevel = Math.max(0, 1 - t / .25);
      if (t >= GONE) { state = 'reform'; t = 0; omega = 0; }
    } else if (state === 'reform') {
      t += dt; var r = Math.min(1, t / REFORM); scale = easeOutBack(r); glowLevel = 0;
      if (r >= 1) { state = 'idle'; scale = 1; }
    }
    glow.visible = glowLevel > .01;
    glow.material.opacity = .85 * glowLevel;
  }

  return {
    addSpin: addSpin,
    update: update,
    /* Extra spin angle (radians) to add to the diamond's own spin. */
    spin: function () { return extra; },
    /* Multiplier for the gem's size (0 while it is "gone"). */
    scale: function () { return scale; },
    /* Current spin speed for the readout: the user's recent spinning, or the overdrive itself. */
    rpm: function () {
      var w = state === 'idle' ? sum / WINDOW : omega;
      return Math.round(w * 60 / TAU);
    }
  };
}
