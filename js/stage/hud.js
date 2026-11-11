/* Small developer-style readout in the corner (diamond rotation, scroll progress, bubbles popped). */

export function createHud() {
  var el = document.getElementById('hud'), acc = 0;

  return {
    update: function (dt, spin, y, maxScroll, popped) {
      acc += dt;
      if (acc <= .12) return;
      acc = 0;
      var deg = ((spin * 180 / Math.PI) % 360 + 360) % 360;
        el.textContent='diamond.rotation.y = '+deg.toFixed(1)+'° · scroll '+Math.round(100*y/maxScroll)+'%'+(popped?' · bubbles popped '+popped:'');
    }
  };
}
