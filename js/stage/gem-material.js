/* Diamond shading: a sharp "sparkle" studio environment and the ray-traced refraction shader. */

/* Bright softboxes, black flags and a few coloured lights rendered into a cube map. */
export function createSparkleEnvironment(THREE, renderer) {
  var envRT=new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType});
  (function(){
    var s=new THREE.Scene(),seed=11;function r(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
    s.add(new THREE.Mesh(new THREE.BoxGeometry(80,80,80),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(.86,.9,.91),side:THREE.BackSide})));
    for(var k=0;k<140;k++){
      var v=new THREE.Vector3(r()*2-1,r()*2-.6,r()*2-1).normalize().multiplyScalar(16);
      var big=r()<.18,w=big?3+r()*5:.6+r()*2.4,h=big?3+r()*5:.6+r()*2.4,q=r(),col=new THREE.Color();
      if(q<.6)col.setRGB(1,1,1).multiplyScalar(big?1.6+r()*1.4:2.5+r()*4);
      else if(q<.8)col.setRGB(.36,.42,.43);
      else col.setHSL(r(),.4,.78).multiplyScalar(1.3+r()*1.2);
      var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));
      m.position.copy(v);m.lookAt(0,0,0);m.rotateZ(r()*6.28);s.add(m);
    }
    var cc=new THREE.CubeCamera(.1,100,envRT);cc.update(renderer,s);
  })();
  return envRT;
}

export function createGemMaterial(THREE, planes, envTexture) {
  var NP=planes.length;
  var gemMat=new THREE.ShaderMaterial({
    uniforms:{uPl:{value:planes},uEnv:{value:envTexture},uRot:{value:new THREE.Matrix3()},uIor:{value:2.42},uDisp:{value:.035},uGain:{value:1.0}},
    vertexShader:[
    'varying vec3 vPos;varying vec3 vNrm;varying vec3 vCam;',
    'void main(){vPos=position;vNrm=normal;vCam=(inverse(modelMatrix)*vec4(cameraPosition,1.)).xyz;',
    ' gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'].join('\n'),
    fragmentShader:[
    '#define NP '+NP,
    'uniform vec4 uPl[NP];uniform samplerCube uEnv;uniform mat3 uRot;uniform float uIor;uniform float uDisp;uniform float uGain;',
    'varying vec3 vPos;varying vec3 vNrm;varying vec3 vCam;',
    'vec3 envAt(vec3 d){return textureCube(uEnv,normalize(uRot*d)).rgb;}',
    'float hitOut(vec3 p,vec3 d,out vec3 n){float tm=1e5;n=vec3(0.,1.,0.);',
    ' for(int i=0;i<NP;i++){vec3 pn=uPl[i].xyz;float dn=dot(d,pn);',
    '  if(dn>1e-4){float t=(uPl[i].w-dot(p,pn))/dn;if(t<tm){tm=t;n=pn;}}}',
    ' return max(tm,0.);}',
    'void main(){',
    ' vec3 I=normalize(vPos-vCam);vec3 N=normalize(vNrm);',
    ' float f0=pow((uIor-1.)/(uIor+1.),2.);',
    ' vec3 rd=refract(I,N,1./uIor);vec3 p=vPos;vec3 col=vec3(0.);float att=1.-(f0+(1.-f0)*pow(1.-clamp(dot(-I,N),0.,1.),5.));',
    ' for(int b=0;b<5;b++){',
    '  vec3 n;float t=hitOut(p+rd*1e-4,rd,n);p+=rd*(t+1e-4);',
    '  vec3 eg=refract(rd,-n,uIor);',
    '  float c=clamp(dot(rd,n),0.,1.);',
    '  float F=dot(eg,eg)<1e-4?1.:f0+(1.-f0)*pow(1.-c,5.);',
    '  if(F<1.){',
    '   vec3 er=refract(rd,-n,uIor-uDisp),eb=refract(rd,-n,uIor+uDisp);',
    '   vec3 e=vec3(dot(er,er)>1e-4?envAt(er).r:envAt(eg).r,envAt(eg).g,dot(eb,eb)>1e-4?envAt(eb).b:envAt(eg).b);',
    '   col+=e*(1.-F)*att;}',
    '  att*=F;rd=reflect(rd,n);',
    ' }',
    ' col+=envAt(rd)*att*.5;',
    ' float Fs=f0+(1.-f0)*pow(1.-clamp(dot(-I,N),0.,1.),5.);',
    ' col+=envAt(reflect(I,N))*Fs;',
    ' col*=uGain;',
    ' gl_FragColor=vec4(col,1.);',
    ' #include <colorspace_fragment>',
    '}'].join('\n')
  });
  return gemMat;
}
