/* 3D stage entry point: loads three.js, assembles the scene from its parts and runs the frame loop.
   If three.js or WebGL is unavailable the page falls back to its static look (class "no-gl"). */
import { root, reduce } from '../core/env.js';
import { createRng } from '../core/util.js';
import { ORBIT_ORDER } from '../data/orbit-icons.js';
import { loadThree } from './three-loader.js';
import { createContext } from './context.js';
import { applySoftStudio } from './studio-environment.js';
import { createBackground } from './background.js';
import { createDiamond } from './diamond.js';
import { createTextures } from './textures.js';
import { createParticles } from './particles.js';
import { createDroplets } from './droplets.js';
import { createLayout } from './layout.js';
import { createMotion } from './motion.js';
import { createIntro } from './intro.js';
import { createIntroFlash } from './intro-flash.js';
import { createIntroShards } from './intro-shards.js';
import { createHighlight } from './highlight.js';
import { loadBadgeTextures } from './badge-textures.js';
import { createOrbitRing } from './orbit-ring.js';
import { createInteraction } from './interaction.js';
import { createHud } from './hud.js';
import { createOverdrive } from './overdrive.js';
import { createBubblePile } from './bubble-pile.js';

function markNoGL() { root.classList.add('no-gl'); }

export function initStage() {
  loadThree().then(start).catch(function (e) {
    markNoGL();
    if (window.console) console.error(e);
  });
}

function start(THREE) {
  var ctx;
  try { ctx = createContext(THREE, document.getElementById('stage')); } catch (e) { markNoGL(); return; }
  var renderer = ctx.renderer, scene = ctx.scene, cam = ctx.cam;

  /* scene content */
  applySoftStudio(THREE, renderer, scene);
  var background = createBackground(THREE, scene);
  var diamond = createDiamond(THREE, renderer, scene, reduce);

  var rnd = createRng(7);
  var textures = createTextures(THREE);
  var particles = createParticles(THREE, scene, rnd, textures);
  var droplets = createDroplets(THREE, scene, rnd, particles);

  /* viewport + scroll mapping */
  var layout = createLayout(renderer, cam);
  layout.onMeasure(function () { background.setResolution(renderer.domElement.width, renderer.domElement.height); });
  layout.onMeasure(function (v) { droplets.anchor(v.maxScroll); });
  layout.start();
  var view = layout.view;

  /* intro + orbit badges */
  var intro = createIntro(reduce);
  var highlight = createHighlight(ORBIT_ORDER);
  var flash = createIntroFlash(THREE, diamond.crystal, textures);
  var ring = null, shards = null;
  loadBadgeTextures(THREE, ORBIT_ORDER).then(function (texs) {
    ring = createOrbitRing(THREE, diamond.ringG, diamond.crystal, texs, ORBIT_ORDER, reduce);
    if (!reduce) shards = createIntroShards(THREE, diamond.crystal, texs, rnd);
    intro.begin();
  });

  /* input + readout (overdrive: easter egg fed by the drag rotation) */
  var overdrive = createOverdrive(THREE, diamond.crystal, cam, view, textures, particles, reduce);
  var pile = createBubblePile(droplets.drops, view);
  var motion = createMotion(layout, reduce);
  var interaction = createInteraction(THREE, {
    cam: cam, crystal: diamond.crystal, dragG: diamond.dragG,
    drops: droplets.drops, view: view, popDrop: droplets.popDrop, onSpin: overdrive.addSpin, pile: pile
  });
  var hud = createHud();

  /* frame loop */
  var t0 = performance.now(), last = t0;
  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now; var T = (now - t0) / 1000;
    var y = window.scrollY;

    motion.update(dt, y);
    var IT = intro.elapsed(now);
    highlight.update(dt);
    overdrive.update(dt);

    diamond.update({
      cur: motion.cur, T: T, IT: IT, highlightLevel: highlight.level(),
      mx: motion.mx, my: motion.my, vel: motion.vel, scrollSm: motion.scrollSm,
      boostSpin: overdrive.spin(), boostScale: overdrive.scale()
    }, view);
    if (shards) shards.update(IT, intro.started());
    flash.update(IT);
    interaction.update(dt);
    if (ring) ring.update({ T: T, dt: dt, IT: IT, scrollSm: motion.scrollSm, highlightKey: highlight.key(), highlightLevel: highlight.level() });

    pile.step(dt);
    droplets.update({ T: T, dt: dt, y: y, vel: motion.vel, mx: motion.mx }, view);
    particles.step(dt);
    background.update(reduce ? 0 : T, y);

    renderer.render(scene, cam);
    hud.update(dt, diamond.spin, y, view.maxScroll, droplets.poppedCount(), overdrive.rpm());
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
