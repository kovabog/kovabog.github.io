/* Soft studio reflections (PMREM) that the glass droplets pick up. */

export function applySoftStudio(THREE, renderer, scene) {
  var pm=new THREE.PMREMGenerator(renderer);
  var env=new THREE.Scene();
  (function(){
    env.add(new THREE.Mesh(new THREE.BoxGeometry(40,40,40),new THREE.MeshBasicMaterial({color:0xe3eaec,side:THREE.BackSide})));
    function panel(w,h,x,y,z,c,k){var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(k),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m);}
    panel(16,7,0,13,2,0xffffff,2.4);panel(3,16,-12,2,3,0xffffff,3.4);panel(3,14,12,0,2,0xd5f2ee,2.6);panel(10,6,2,3,14,0xffffff,2);
    panel(1.4,16,-6,0,-11,0x1f3a3b,1);panel(1.8,14,7,0,-10,0x1f3a3b,1);panel(18,2,0,-10,4,0x8aa3a6,1);
    panel(1.2,14,-10,0,-6,0x16302f,1);panel(1.2,12,3,6,-12,0x16302f,1);panel(12,1.2,0,8,-8,0x16302f,1);
  })();
  scene.environment=pm.fromScene(env,.03).texture;
}
