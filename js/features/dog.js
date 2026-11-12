/* The dog mascot: a fixed-position sprite that runs across the screen, barks, jumps and talks.
   Exposes runBy(message), jump(message) and hint(message) (a jump without barking). Clicking the dog is the easter egg "dogclick". Reads #dog from the page; plays barks via the sfx engine. */
import { sfx } from '../audio/sfx.js';
import { wait } from '../core/util.js';
import { emit } from '../core/events.js';

export var dog = (function () {
  var el=document.getElementById('dog'),inn=el.querySelector('.dog-in'),bub=el.querySelector('.dog-say'),gen=0,x=0;
  function c(n,on){el.classList.toggle(n,!!on);}
  function setX(v){x=v;el.style.transform='translateX('+v+'px)';}
  function moveX(to,ms,ease){var from=x,a=null;
    try{a=el.animate([{transform:'translateX('+from+'px)'},{transform:'translateX('+to+'px)'}],{duration:ms,easing:ease||'linear'});}catch(e){}
    setX(to);return a?a.finished.catch(function(){}):wait(0);}
  /* Mouse hover over the dog or its bubble keeps the dog on screen until the cursor leaves; the normal timer still runs, so a quick hover never shortens the stay. */
  var over=0,freed=[];
  function hoverIn(e){if(e.pointerType==='mouse')over++;}
  function hoverOut(e){if(e.pointerType!=='mouse')return;over=Math.max(0,over-1);
    setTimeout(function(){if(!over)release();},60);}
  function release(){var l=freed;freed=[];l.forEach(function(f){f();});}
  function hoverHold(){return over?new Promise(function(r){freed.push(r);}):wait(0);}
  function talk(t,ms){bub.textContent=t;c('talk',1);return wait(ms).then(hoverHold).then(function(){c('talk',0);});}
  function bark(n){c('barking',1);for(var i=0;i<n;i++)setTimeout(sfx.bark,i*330);return wait(n*330+60).then(function(){c('barking',0);});}
  function reset(){gen++;over=0;release();
    try{el.getAnimations().forEach(function(a){a.cancel();});inn.getAnimations().forEach(function(a){a.cancel();});}catch(e){}
    ['running','talk','barking','air','dog-hint'].forEach(function(n){c(n,0);});return gen;}
  async function leave(g){if(g!==gen)return;c('running',1);var W=innerWidth;
    await moveX(W+40,Math.max(900,(W-x)*2.1),'cubic-bezier(.5,0,.9,.6)');if(g!==gen)return;c('running',0);el.style.visibility='hidden';}
  async function runBy(msg){var g=reset(),W=innerWidth,dw=el.offsetWidth,mid=Math.round(W*(W<700?.42:.6)-dw/2);
    setX(-dw-40);el.style.visibility='visible';c('running',1);
    await moveX(mid,Math.max(1300,(mid+dw)*2.3),'cubic-bezier(.25,.6,.35,1)');if(g!==gen)return;
    c('running',0);await Promise.all([talk(msg,3150),bark(2)]);if(g!==gen)return;await leave(g);}
  async function jump(msg,opts){opts=opts||{};var g=reset(),W=innerWidth,dw=el.offsetWidth;setX(Math.round(W/2-dw/2));el.style.visibility='visible';
    c('air',1);c('dog-hint',opts.silent);var a=null;
    try{a=inn.animate([
      {transform:'translateY(135%)',easing:'cubic-bezier(.15,.75,.35,1)'},
      {transform:'translateY(-60%) rotate(-6deg)',offset:.5,easing:'cubic-bezier(.6,0,.9,.4)'},
      {transform:'translateY(0) scale(1.08,.84)',offset:.82,easing:'ease-out'},
      {transform:'none'}],{duration:950});}catch(e){}
    setTimeout(function(){if(g===gen)c('air',0);},760);
    if(a)await a.finished.catch(function(){});else await wait(950);
    if(g!==gen)return;
    await Promise.all([talk(msg,opts.ms||4050),opts.silent?wait(0):bark(3)]);if(g!==gen)return;await leave(g);}
  /* Silent jump-in with a longer, wrapping speech bubble: used for hints. */
  function hint(msg){return jump(msg,{silent:true,ms:8400});}
  [el.querySelector('.dog-img'),bub].forEach(function(n){n.addEventListener('pointerenter',hoverIn);n.addEventListener('pointerleave',hoverOut);});
  el.querySelector('.dog-img').addEventListener('click',function(){c('barking',1);sfx.bark();talk('Woof!',900);setTimeout(function(){c('barking',0);},340);emit('egg:found','dogclick');});
  return{runBy:runBy,jump:jump,hint:hint};
})();
