/* Sound and haptics engine (Web Audio + vibration). Pure effects: no DOM access except localStorage for the mute flag. */
export var sfx = (function () {
  var ctx=null,muted=false;
  try{muted=localStorage.getItem('bk-mute')==='1';}catch(e){}
  function ac(create){
    if(muted)return null;
    try{if(!ctx){if(!create)return null;ctx=new (window.AudioContext||window.webkitAudioContext)();}
      if(ctx.state==='suspended'&&create)ctx.resume();return ctx.state==='running'||create?ctx:null;}catch(e){return null;}
  }
  function tone(c,f1,f2,dur,type,vol,delay){
    var t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';
    o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.03);
  }
  function play(fn,create){var c=ac(create!==false);if(!c)return;try{fn(c);}catch(e){}}
  /* Chrome blocks (and logs an error for) vibrate() before the first tap, so wait for a user activation. */
  function buzz(p){if(muted)return;try{var ua=navigator.userActivation;if(ua&&!ua.hasBeenActive)return;if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
  function barkOne(c,delay){
    var t=c.currentTime+(delay||0),o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(380,t);o.frequency.linearRampToValueAtTime(560,t+.035);o.frequency.exponentialRampToValueAtTime(210,t+.17);
    f.type='bandpass';f.frequency.setValueAtTime(1300,t);f.frequency.exponentialRampToValueAtTime(650,t+.17);f.Q.value=2.2;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.36,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.19);
    o.connect(f);f.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.21);
    var len=Math.floor(c.sampleRate*.09),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    var n=c.createBufferSource(),nf=c.createBiquadFilter(),ng=c.createGain();n.buffer=buf;nf.type='bandpass';nf.frequency.value=1800;nf.Q.value=.9;
    ng.gain.setValueAtTime(.12,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.09);
    n.connect(nf);nf.connect(ng);ng.connect(c.destination);n.start(t);n.stop(t+.1);
  }
  return{
    unlock:function(){ac(true);},
    muted:function(){return muted;},
    setMuted:function(m){muted=!!m;try{localStorage.setItem('bk-mute',muted?'1':'0');}catch(e){}if(muted&&ctx){try{ctx.suspend();}catch(e){}}else if(ctx){try{ctx.resume();}catch(e){}}},
    tick:function(){play(function(c){tone(c,2100,1500,.025,'triangle',.018);},false);},
    click:function(){play(function(c){tone(c,880,480,.06,'sine',.05);});buzz(6);},
    pop:function(){play(function(c){tone(c,620+Math.random()*380,130,.11,'sine',.11);});buzz(12);},
    fail:function(){play(function(c){tone(c,240,190,.09,'square',.012);},false);},
    pass:function(i){play(function(c){var f=660*Math.pow(1.1225,i);tone(c,f,f*1.01,.1,'sine',.045);},false);},
    chime:function(){play(function(c){[784,988,1319].forEach(function(f,i){tone(c,f,f,.3,'sine',.05,i*.09);});});buzz([10,40,10]);},
    disco:function(sec){play(function(c){for(var b=0;b<sec*2.2;b++){var t=b/2.2;tone(c,150,42,.2,'sine',.22,t);tone(c,7400,6800,.03,'square',.006,t+.227);
      if(b%2)tone(c,220,110,.08,'triangle',.05,t);if(b%4===0)[523,659,784].forEach(function(f,i){tone(c,f,f,.16,'sine',.025,t+i*.06);});}});buzz([20,60,20,60,20]);},
    bark:function(){play(function(c){barkOne(c,0);},false);buzz(25);}
  };
})();
