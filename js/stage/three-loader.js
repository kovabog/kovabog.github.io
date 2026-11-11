/* Loads three.js on demand (the page works without it; see the no-gl fallback). */

var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

export function loadThree() { return import(THREE_URL); }
