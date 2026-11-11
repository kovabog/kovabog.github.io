/* Renderer, scene and camera. */

export var FOV = 35;
export var CAMZ = 11;

/* Throws when WebGL is unavailable; the caller falls back to the static page. */
export function createContext(THREE, canvas) {
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(FOV, 1, .1, 80);
  cam.position.set(0, 0, CAMZ);
  return { renderer: renderer, scene: scene, cam: cam };
}
