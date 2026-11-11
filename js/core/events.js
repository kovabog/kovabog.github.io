/* Tiny publish/subscribe hub so features can talk without importing each other.

   Events used on the page:
     reveal           (element)  a .reveal/.stat element entered the viewport
     orbit:highlight  (key|null) a stack icon is hovered; the 3D orbit should light up that badge
     egg:found        (id)       the visitor triggered an easter egg
     bubbles:popAll   ()         pop every visible bubble in the 3D scene
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
