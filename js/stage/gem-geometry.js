/* Geometry of the diamond: faceted mesh plus the planes of its convex hull (used for exact inner ray tracing). */

export function buildGemGeometry(THREE) {
  var yT=.46,yG=0,yGb=-.07,yL=-.56,yC=-1.02,rt=.56,rl=.5,i,j,a;
  var T=[],G=[],Gb=[],L=[],C=[0,yC,0];
  for(i=0;i<8;i++){a=i*Math.PI/4;T.push([Math.sin(a)*rt,yT,Math.cos(a)*rt]);}
  for(j=0;j<16;j++){a=j*Math.PI/8;G.push([Math.sin(a),yG,Math.cos(a)]);Gb.push([Math.sin(a),yGb,Math.cos(a)]);}
  for(i=0;i<8;i++){a=(i+.5)*Math.PI/4;L.push([Math.sin(a)*rl,yL,Math.cos(a)*rl]);}
  var n8=function(k){return (k+8)%8;},n16=function(k){return (k+16)%16;},tris=[];
  for(i=1;i<7;i++)tris.push([T[0],T[i],T[i+1]]);
  for(i=0;i<8;i++){
    tris.push([T[i],T[n8(i+1)],G[n16(2*i+1)]]);
    tris.push([T[i],G[n16(2*i-1)],G[n16(2*i)]]);
    tris.push([T[i],G[n16(2*i)],G[n16(2*i+1)]]);
  }
  for(j=0;j<16;j++){var k=n16(j+1);tris.push([G[j],G[k],Gb[k]]);tris.push([G[j],Gb[k],Gb[j]]);}
  for(i=0;i<8;i++){
    tris.push([L[i],Gb[n16(2*i)],Gb[n16(2*i+1)]]);
    tris.push([L[i],Gb[n16(2*i+1)],Gb[n16(2*i+2)]]);
    tris.push([L[i],Gb[n16(2*i+2)],L[n8(i+1)]]);
    tris.push([C,L[i],L[n8(i+1)]]);
  }
  var pos=[],nor=[],cy=-.28;
  tris.forEach(function(t){
    var A=t[0],B=t[1],Cc=t[2];
    var ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=Cc[0]-A[0],vy=Cc[1]-A[1],vz=Cc[2]-A[2];
    var nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    var cx=(A[0]+B[0]+Cc[0])/3,cyy=(A[1]+B[1]+Cc[1])/3-cy,cz=(A[2]+B[2]+Cc[2])/3;
    if(nx*cx+ny*cyy+nz*cz<0){var tmp=B;B=Cc;Cc=tmp;nx=-nx;ny=-ny;nz=-nz;}
    var l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    [A,B,Cc].forEach(function(p){pos.push(p[0],p[1]-cy,p[2]);nor.push(nx,ny,nz);});
  });
  var g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  return g;
}

export function computeHullPlanes(THREE, gemGeo) {
  var planes=[];(function(){
    var p=gemGeo.attributes.position.array,n=gemGeo.attributes.normal.array;
    for(var i=0;i<p.length;i+=9){
      var nx=n[i],ny=n[i+1],nz=n[i+2],d=nx*p[i]+ny*p[i+1]+nz*p[i+2],dup=false;
      for(var j=0;j<planes.length;j++){var q=planes[j];if(Math.abs(q.x-nx)<1e-3&&Math.abs(q.y-ny)<1e-3&&Math.abs(q.z-nz)<1e-3&&Math.abs(q.w-d)<1e-3){dup=true;break;}}
      if(!dup)planes.push(new THREE.Vector4(nx,ny,nz,d));
    }
  })();
  return planes;
}
