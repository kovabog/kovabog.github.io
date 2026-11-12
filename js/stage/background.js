/* Full-screen backdrop: a pale surface with slow caustic ripples that drifts with the scroll.
   With html.night (night mood, features/mood-night.js) the same ripples are drawn in a deep teal night palette. */
import { root } from '../core/env.js';

export function createBackground(THREE, scene) {
  var bgMat=new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0},uScroll:{value:0},uRes:{value:new THREE.Vector2(1,1)},uNight:{value:root.classList.contains('night')?1:0}},
    vertexShader:'void main(){gl_Position=vec4(position.xy,.9999,1.);}',
    fragmentShader:[
    'uniform float uTime;uniform float uScroll;uniform vec2 uRes;uniform float uNight;',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes.y; uv.y-=uScroll*.00032;',
    ' vec2 p=uv*2.3; float t=uTime*.07;',
    ' for(int i=0;i<4;i++){float fi=float(i);',
    '  p+=.42*vec2(sin(p.y*1.6+t*(1.+fi*.3)+fi*1.7),cos(p.x*1.4-t*(1.2+fi*.2)+fi*2.3));}',
    ' float tone=.5+.5*sin(p.x*1.1+p.y*.7);',
    ' float tone2=.5+.5*sin(p.x*.6-p.y*1.3+1.7);',
    ' vec3 c1=vec3(.953,.969,.973); vec3 c2=vec3(.843,.882,.894);',
    ' vec3 col=mix(c1,c2,tone*.55+tone2*.25);',
    ' float r1=pow(1.-abs(sin(p.x*2.2+p.y*1.1)),7.);',
    ' float r2=pow(1.-abs(sin(p.y*2.7-p.x*.8+2.)),11.);',
    ' col+=r1*.2+r2*.14;',
    ' col-=.04*pow(1.-abs(sin(p.x*2.2+p.y*1.1+.38)),6.)*tone;',
    ' col=clamp(col,0.,1.);',
    ' col=mix(col,col*vec3(.12,.17,.19)+vec3(.01,.02,.025),uNight);',
    ' gl_FragColor=vec4(pow(col,vec3(2.2)),1.);',
    ' #include <colorspace_fragment>',
    '}'].join('\n'),
    depthTest:false,depthWrite:false
  });
  var bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat);bg.frustumCulled=false;bg.renderOrder=-100;scene.add(bg);

  return {
    setResolution: function (w, h) { bgMat.uniforms.uRes.value.set(w, h); },
    update: function (time, scrollY) { bgMat.uniforms.uTime.value = time; bgMat.uniforms.uScroll.value = scrollY; }
  };
}
