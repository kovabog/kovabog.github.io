/* A realistic mirror ball rendered with three.js on its own small transparent canvas (used by features/foam-party).
   ~600 slightly misaligned mirror tiles reflect a dark "club" environment with bright coloured panels, so tiles flash
   as the ball turns; star glints appear on the tiles that bounce the key light straight at the viewer.
   createDiscoBall(canvas) resolves to { stop() } or rejects when three.js / WebGL is unavailable (the CSS ball stays then).
   SPIN is the turn rate in rad/s, shared with the reflected light spots drawn by the party. */
import { loadThree } from '../stage/three-loader.js';
import { reduce } from '../core/env.js';

export var SPIN = .7;
var ROWS = 22, TILT = .18;

export function createDiscoBall(canvas) {
  return loadThree().then(function (THREE) { return build(THREE, canvas); });
}

function build(THREE, canvas) {
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);
  var w = canvas.clientWidth || 200, h = canvas.clientHeight || 200;
  renderer.setSize(w, h, false);

  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(30, w / h, .1, 50);
  cam.position.set(0, 0, 6);
  scene.environment = clubEnvironment(THREE, renderer);

  var ball = new THREE.Group();
  ball.rotation.x = TILT;
  scene.add(ball);
  ball.add(new THREE.Mesh(new THREE.SphereGeometry(.985, 48, 32), new THREE.MeshStandardMaterial({ color: 0x15161a, metalness: .6, roughness: .55 })));

  /* Mirror tiles, row by row from pole to pole; every row has as many tiles as fit around it. */
  var a = Math.PI / ROWS, size = a * .9, rows = [], total = 0;
  for (var i = 0; i < ROWS; i++) {
    var lat = -Math.PI / 2 + (i + .5) * a, n = Math.max(4, Math.round(2 * Math.PI * Math.cos(lat) / a));
    rows.push({ lat: lat, n: n, ph: Math.random() * 6.28 }); total += n;
  }
  var tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .08, envMapIntensity: 1.7 });
  var tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size, .03), tileMat, total);
  var dummy = new THREE.Object3D(), normals = [], k = 0, tint = new THREE.Color();
  rows.forEach(function (r) {
    for (var j = 0; j < r.n; j++) {
      var lon = r.ph + j / r.n * Math.PI * 2;
      var nx = Math.cos(r.lat) * Math.sin(lon), ny = Math.sin(r.lat), nz = Math.cos(r.lat) * Math.cos(lon);
      dummy.position.set(nx, ny, nz);
      dummy.lookAt(nx * 2, ny * 2, nz * 2);
      dummy.rotateX((Math.random() - .5) * .07); dummy.rotateY((Math.random() - .5) * .07);
      dummy.updateMatrix();
      tiles.setMatrixAt(k, dummy.matrix);
      tiles.setColorAt(k, tint.setScalar(.82 + Math.random() * .18));
      normals.push(new THREE.Vector3(0, 0, 1).applyQuaternion(dummy.quaternion));
      k++;
    }
  });
  ball.add(tiles);

  /* Cap and ring the ball hangs from. */
  var chrome = new THREE.MeshStandardMaterial({ color: 0xd8dbe0, metalness: 1, roughness: .2 });
  var cap = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, .12, 24), chrome);
  cap.position.y = 1.02; scene.add(cap);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(.07, .018, 10, 24), chrome);
  ring.position.y = 1.15; scene.add(ring);

  /* Glints: a small pool of star sprites put on the tiles that mirror the key light into the camera. */
  var star = new THREE.SpriteMaterial({ map: starTexture(THREE), blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
  var glints = [];
  for (var g = 0; g < 9; g++) { var s = new THREE.Sprite(star); s.visible = false; scene.add(s); glints.push(s); }
  var half = new THREE.Vector3(.35, .75, .55).normalize().add(new THREE.Vector3(0, 0, 1)).normalize();
  var tmp = new THREE.Vector3(), q = new THREE.Quaternion(), best = [];

  function placeGlints(t) {
    q.setFromEuler(ball.rotation);
    best.length = 0;
    for (var i = 0; i < normals.length; i++) {
      var d = tmp.copy(normals[i]).applyQuaternion(q).dot(half);
      if (d > .985) best.push({ i: i, d: d });
    }
    best.sort(function (x, y) { return y.d - x.d; });
    for (var g = 0; g < glints.length; g++) {
      var b = best[g], s = glints[g];
      if (!b) { s.visible = false; continue; }
      var p = tmp.copy(normals[b.i]).applyQuaternion(q);
      var e = Math.pow((b.d - .985) / .015, 2) * (.75 + .25 * Math.sin(t * 23 + b.i));
      s.position.copy(p).multiplyScalar(1.03);
      s.scale.setScalar(.15 + e * .6);
      s.material.rotation = t * .6;
      s.visible = true;
    }
  }

  var raf = 0, start = performance.now();
  function frame(now) {
    var t = (now - start) / 1000;
    ball.rotation.y = t * SPIN;
    placeGlints(t);
    renderer.render(scene, cam);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    stop: function () {
      cancelAnimationFrame(raf);
      scene.environment && scene.environment.dispose();
      renderer.dispose();
      try { renderer.forceContextLoss(); } catch (e) {}
    }
  };
}

/* A dark room with a white key light up front and coloured party panels around, baked into a PMREM environment. */
function clubEnvironment(THREE, renderer) {
  var pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: 0x4a4d58, side: THREE.BackSide })));
  function panel(w, h, x, y, z, c, k) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  }
  panel(5, 5, 6, 13, 10, 0xffffff, 6);
  panel(4, 9, -13, 2, 4, 0xff3fa0, 3);
  panel(4, 9, 13, -1, 3, 0x3fd8ff, 3);
  panel(9, 3, 0, -12, 6, 0xffd34f, 2.4);
  panel(3, 7, -6, 8, -12, 0x9b6bff, 3);
  panel(3, 7, 8, 5, -12, 0x5fff9a, 2.4);
  panel(14, 2, 0, 3, 15, 0xffffff, 1.4);
  panel(20, 8, 0, 14, -2, 0xdfe3ec, 1.3);
  panel(3, 3, -9, -6, 10, 0xffffff, 4);
  panel(3, 3, 10, 9, -6, 0xffffff, 4);
  panel(16, 6, 0, -14, -4, 0x1a1a22, 1);
  var tex = pm.fromScene(env, .01).texture;
  pm.dispose();
  return tex;
}

/* Four-ray star with a soft core, for the glints. */
function starTexture(THREE) {
  var c = document.createElement('canvas'); c.width = c.height = 128;
  var g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 30);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  g.globalCompositeOperation = 'lighter';
  [[128, 3], [3, 128]].forEach(function (s) {
    var l = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    l.addColorStop(0, 'rgba(255,255,255,.95)'); l.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = l; g.fillRect(64 - s[0] / 2, 64 - s[1] / 2, s[0], s[1]);
  });
  var tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
