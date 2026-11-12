/* Tiny publish/subscribe hub so features can talk without importing each other.

   Events used on the page:
     reveal           (element)  a .reveal/.stat element entered the viewport
     orbit:highlight  (key|null) a stack icon is hovered; the 3D orbit should light up that badge
     egg:found        (id)       the visitor triggered an easter egg
     egg:reset        ()         the visitor chose to start the egg hunt over (features/egg-hint); found list is cleared
     stage:nogl      ()         the 3D scene is unavailable (no WebGL / three.js failed to load); the page runs in its static look
     confetti:burst   ({x, y})   throw confetti from that viewport point (the diamond's overdrive burst)
     party:foam       ()         every 10th popped bubble: a 5-second foam party with a disco ball (features/foam-party)
*/

var handlers = {};

export function on(name, fn) {
  (handlers[name] || (handlers[name] = [])).push(fn);
}

export function emit(name, payload) {
  var list = handlers[name];
  if (!list) return;
  for (var i = 0; i < list.length; i++) list[i](payload);
}
