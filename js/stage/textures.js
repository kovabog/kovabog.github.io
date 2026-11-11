/* Small procedurally drawn textures shared by sprites (particles, intro flash). */

export function createTextures(THREE) {
  function texOf(draw,size){var c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
  var dotTex=texOf(function(g,s){var r=g.createRadialGradient(s*.42,s*.4,1,s/2,s/2,s/2);
    r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.45,'rgba(225,243,241,.95)');r.addColorStop(.8,'rgba(70,140,134,.55)');r.addColorStop(1,'rgba(29,109,104,0)');
    g.fillStyle=r;g.fillRect(0,0,s,s);},64);
  var ringTex=texOf(function(g,s){g.lineWidth=5;g.strokeStyle='rgba(29,109,104,.5)';g.beginPath();g.arc(s/2,s/2,s/2-6,0,6.2832);g.stroke();
    g.lineWidth=2.5;g.strokeStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(s/2,s/2,s/2-10,0,6.2832);g.stroke();},128);
  var glowTex=texOf(function(g,s){var r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(240,250,249,.7)');r.addColorStop(1,'rgba(220,240,238,0)');g.fillStyle=r;g.fillRect(0,0,s,s);},128);

  return { dot: dotTex, ring: ringTex, glow: glowTex };
}
