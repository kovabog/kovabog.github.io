/* Viewport metrics and the scroll -> pose mapping: where the diamond should be for a given scroll position.
   Each [data-cx] section declares its pose; the diamond eases between neighbouring sections. */
import { FOV, CAMZ } from './context.js';
import { lerp, smoothstep } from '../core/util.js';

export function createLayout(renderer, cam) {
  var view = { W: 1, H: 1, halfW: 1, halfH: 1, mobile: false, maxScroll: 1 };
  var secs = [];
  var listeners = [];

  function measure() {
    view.W = window.innerWidth; view.H = window.innerHeight; view.mobile = view.W < 900;
    renderer.setSize(view.W, view.H, false); cam.aspect = view.W / view.H; cam.updateProjectionMatrix();
    view.halfH = Math.tan(FOV * Math.PI / 360) * CAMZ; view.halfW = view.halfH * cam.aspect;
    var sy = window.scrollY;
      secs = [].map.call(document.querySelectorAll('[data-cx]'),function(el){
        var rc=el.getBoundingClientRect(),d=el.dataset;
        return{c:rc.top+sy+rc.height/2,
          x:+(view.mobile&&d.mx!==undefined?d.mx:d.cx),y:+(view.mobile&&d.my!==undefined?d.my:d.cy),
          s:+(view.mobile&&d.ms!==undefined?d.ms:d.cs)*(view.mobile?1:Math.min(1,view.W/1300+.25)),tilt:+d.tilt};
      });
    view.maxScroll = Math.max(1, document.documentElement.scrollHeight - view.H);
    listeners.forEach(function (fn) { fn(view); });
  }

  function pose(y){
    var c=y+view.H*.5,i=0;
    while(i<secs.length-1&&c>secs[i+1].c)i++;
    var a=secs[i],b=secs[Math.min(i+1,secs.length-1)];
    var t=b.c===a.c?0:(c-a.c)/(b.c-a.c);t=Math.max(0,Math.min(1,t));
    t=smoothstep(Math.max(0,Math.min(1,(t-.22)/.56)));
    return{x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),s:lerp(a.s,b.s,t),tilt:lerp(a.tilt,b.tilt,t)};
  }

  return {
    view: view,
    pose: pose,
    firstSection: function () { return secs[0]; },
    /* Called after every measure(), e.g. to re-anchor things to the new page height. */
    onMeasure: function (fn) { listeners.push(fn); },
    /* Measures now and keeps measuring on resize, content size changes and load. */
    start: function () {
      measure();
      window.addEventListener('resize', measure);
      if (window.ResizeObserver) { new ResizeObserver(function () { measure(); }).observe(document.body); }
      window.addEventListener('load', measure);
    }
  };
}
