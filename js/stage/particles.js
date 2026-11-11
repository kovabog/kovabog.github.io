/* Pop effect: a ring and a spray of dots, pooled and simulated each frame. */

export function createParticles(THREE, scene, rnd, textures) {
  var dotTex = textures.dot, ringTex = textures.ring;
  var pool=[],parts=[];
  function sprite(tex){var s=pool.pop();if(!s){s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false,toneMapped:false}));s.renderOrder=5;scene.add(s);}
    s.material.map=tex;s.material.opacity=1;s.visible=true;return s;}
  function burst(p,r){
    var n=12,i,a,v,s;
    for(i=0;i<n;i++){s=sprite(dotTex);a=i/n*6.2832+rnd()*.5;v=(1.8+rnd()*1.8)*(.5+r);
      s.position.set(p.x+Math.cos(a)*r*.7,p.y+Math.sin(a)*r*.7,p.z+.3);
      parts.push({s:s,vx:Math.cos(a)*v,vy:Math.sin(a)*v+.6,life:0,max:.45+rnd()*.3,sz:r*(.16+rnd()*.16)});}
    s=sprite(ringTex);s.position.set(p.x,p.y,p.z+.3);parts.push({s:s,ring:true,life:0,max:.38,sz:r});
  }
  function stepParts(dt){
    for(var j=parts.length-1;j>=0;j--){var q=parts[j];q.life+=dt;var u=q.life/q.max;
      if(u>=1){q.s.visible=false;pool.push(q.s);parts.splice(j,1);continue;}
      if(q.ring){q.s.scale.setScalar(q.sz*(2+u*2.4));q.s.material.opacity=(1-u)*.95;}
      else{q.s.position.x+=q.vx*dt;q.s.position.y+=q.vy*dt;q.vy-=4.5*dt;q.vx*=Math.exp(-dt*2);
        q.s.scale.setScalar(q.sz*2*(1-u*.5));q.s.material.opacity=1-u*u;}
    }
  }

  return { burst: burst, step: stepParts };
}
