/* Intro effect: a soft glow and ring flash when the diamond forms. */

export function createIntroFlash(THREE, crystal, textures) {
  var flash = null;

  function update(IT) {
    var fu = (IT - 1.45) / .75;
    if (fu > 0 && fu < 1 && IT < 50) {
      if (!flash) {
        flash = {
          g: new THREE.Sprite(new THREE.SpriteMaterial({ map: textures.glow, transparent: true, depthWrite: false, toneMapped: false })),
          r: new THREE.Sprite(new THREE.SpriteMaterial({ map: textures.ring, transparent: true, depthWrite: false, toneMapped: false }))
        };
        crystal.add(flash.g, flash.r);
      }
      flash.g.visible = flash.r.visible = true;
      var fe = 1 - Math.pow(1 - fu, 3);
      flash.g.scale.setScalar(1.6 + 3.2 * fe); flash.g.material.opacity = (1 - fu) * .85;
      flash.r.scale.setScalar(1.8 + 3.4 * fe); flash.r.material.opacity = (1 - fu) * .7;
    } else if (flash) {
      flash.g.visible = flash.r.visible = false;
    }
  }

  return { update: update };
}
