/* Glass droplets floating over the page: creation, drifting with the scroll, popping and re-growing.
   A droplet that was dragged and dropped has d.phys (see bubble-pile.js) and is drawn from there instead of its drifting path. */
import { on, emit } from '../core/events.js';
import { reduce } from '../core/env.js';
import { easeOutBack } from '../core/util.js';
import { sfx } from '../audio/sfx.js';
import { CAMZ } from './context.js';

var COUNT = 30;
var EGG_POP_TARGET = 10;

export function createDroplets(THREE, scene, rnd, particles) {
  var dropMat=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:0,transmission:1,thickness:2.2,ior:1.4,
    attenuationColor:new THREE.Color(0xb9d3d5),attenuationDistance:3,envMapIntensity:2.2,clearcoat:1,clearcoatRoughness:0});
  var shTex=(function(){var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d'),r=g.createRadialGradient(64,64,6,64,64,62);
    r.addColorStop(0,'rgba(20,48,47,.30)');r.addColorStop(.55,'rgba(20,48,47,.12)');r.addColorStop(1,'rgba(20,48,47,0)');g.fillStyle=r;g.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);})();
  var shMat=new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,toneMapped:false});
  var shGeo=new THREE.PlaneGeometry(2.6,2.6),dropGeo=new THREE.SphereGeometry(1,48,32);
  var drops = [];
  var ND = COUNT;
  for(var i=0;i<ND;i++){
    var m=new THREE.Mesh(dropGeo,dropMat),r=.2+Math.pow(rnd(),1.3)*.5;
    m.scale.setScalar(r);scene.add(m);
    var sh=new THREE.Mesh(shGeo,shMat);sh.scale.setScalar(r*.9);sh.renderOrder=-50;scene.add(sh);
    drops.push({m:m,sh:sh,r:r,x:(rnd()*2-1)*.96,py:.08+rnd()*.84,s0:Math.min(1,(i+rnd()*.7)/ND),f:.8+rnd()*.55,ph:rnd()*6.28,z:-.8+rnd()*2.6,
      sp:.7+rnd()*.9,ax:.14+rnd()*.26,ay:.12+rnd()*.24});
  }
  var popped = 0;

  function dropScale(d,dt){
    if(!d.state||d.state==='live')return 1;
    d.t+=dt;
    if(d.state==='pop'){if(d.t<.07)return 1+d.t/.07*.2;particles.burst(d.m.position,d.r);d.state='gone';d.t=0;return 0;}
    if(d.state==='gone'){if(d.t>2.6){d.state='grow';d.t=0;d.phys=null;d.x=(rnd()*2-1)*.92;d.py=.12+rnd()*.76;d.s0px=window.scrollY;d.moved=true;d.ph=rnd()*6.28;}return 0;}
    var u=Math.min(1,d.t/.9);if(u>=1){d.state='live';return 1;}
    return easeOutBack(u);
  }

  function popDrop(d) {
    if (d.state && d.state !== 'live') return;
    d.state = 'pop'; d.t = 0; popped++;
    sfx.pop();
    if (popped === EGG_POP_TARGET) emit('egg:found', 'bubbles');
  }

  function popAll() {
    var list = drops.filter(function (d) { return d.m.visible && (!d.state || d.state === 'live'); })
      .sort(function (a, b) { return a.m.position.x - b.m.position.x; });
    list.forEach(function (d, i) { setTimeout(function () { popDrop(d); }, 120 + i * 70); });
  }
  on('bubbles:popAll', popAll);

  /* s: { T, dt, y (scrollY), vel (scroll velocity), mx (pointer x, -1..1) }, v: viewport metrics from layout */
  function update(s, v) {
    var pv=Math.max(-1.2,Math.min(1.2,s.vel*.0009));
    for(var i=0;i<drops.length;i++){
      var d=drops[i],ph=d.ph,sp=d.sp,tt=reduce?0:s.T;
      var yy=(.5-d.py)*2*v.halfH+((s.y-d.s0px)*d.f)*(2*v.halfH/v.H)+Math.sin(tt*.55*sp+ph)*d.ay+Math.sin(tt*1.1*sp+ph*2)*.04-pv*d.f*.5;
      var xx=d.x*v.halfW+Math.sin(tt*.38*sp+ph)*d.ax+Math.cos(tt*.23*sp+ph*1.7)*.12+s.mx*.08*d.f;
      var zz=d.z,q=d.phys;
      if(q){var k=(CAMZ-q.z)/CAMZ;xx=q.x*k;yy=q.y*k;zz=q.z;}
      d.m.position.set(xx,yy,zz);
      var ks=dropScale(d,s.dt);
      d.m.scale.setScalar(d.r*ks*(1+Math.sin(tt*.9*sp+ph)*.035));
      d.sh.scale.setScalar(d.r*.9*ks);
      d.m.visible=d.sh.visible=ks>.01&&Math.abs(yy)<v.halfH+1.8;
      d.sh.position.set(xx+d.r*.3,yy-d.r*.42,zz-.4);
    }
  }

  /* Keeps each droplet's scroll anchor proportional to the page height (droplets that were popped and re-grown keep theirs). */
  function anchor(maxScroll) {
    for (var i = 0; i < drops.length; i++) { if (!drops[i].moved) drops[i].s0px = drops[i].s0 * maxScroll; }
  }

  return { drops: drops, popDrop: popDrop, update: update, anchor: anchor, poppedCount: function () { return popped; } };
}
