/* Live TDD demo card: tests fail, an "agent" types the code, tests go green. Starts when the card is half visible.
   Easter egg "machine": the first run started with the button ("Run again") ends with one test failing as
   "Expected: pass, Actual: pass (It works on my machine)" plus a "Works on my machine" stamp.
   The automatic first run and every later run pass, so a visitor sees the real story first. */
import { emit } from '../core/events.js';
import { sfx } from '../audio/sfx.js';
import { wait } from '../core/util.js';
import { TDD_SOURCE } from '../data/tdd-source.js';

export function initTddDemo() {
  var term=document.getElementById('term');if(!term)return;
  var btn=document.getElementById('runTests'),foot=document.getElementById('termFoot'),bar=document.getElementById('termBar');
  var cmd=term.querySelector('.cmd'),agent=term.querySelector('.agent'),code=term.querySelector('.code');
  var rows=[].slice.call(term.querySelectorAll('.tl')),busy=false,card=document.getElementById('tdd'),stamp=null,userRuns=0;
  var GLYPH={pend:'\u00b7',run:'\u25cc',fail:'\u2717',pass:'\u2713'};
  function st(r,s){r.className='tl '+s;r.querySelector('.st').textContent=GLYPH[s];}
  function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function hl(t){return esc(t).replace(/\b(public|async|await|return|throw|new|var|if)\b/g,'<span class="k">$1</span>').replace(/\b(Task|Order|Cart|EmptyCartException)\b/g,'<span class="t">$1</span>');}
  async function run(byUser){
    if(busy)return;busy=true;btn.disabled=true;
    if(byUser===true)userRuns++;
    var jinx=byUser===true&&userRuns===1,bad=jinx?1+(Math.random()*(rows.length-1)|0):-1;
    if(stamp){stamp.remove();stamp=null;}
    rows.forEach(function(r){st(r,'pend');});bar.style.width='0';
    code.innerHTML='<span class="dim">// No code yet. Tests first.</span>';agent.textContent='agent \u203a waiting for failing tests';
    cmd.innerHTML='$ <b>dotnet test</b>';foot.textContent='Running 5 tests\u2026';
    await wait(450);
    for(var i=0;i<rows.length;i++){st(rows[i],'run');await wait(130);st(rows[i],'fail');sfx.fail();}
    foot.innerHTML='<span class="bad">0 passed \u00b7 5 failed</span>. Good, now we know what to build.';
    await wait(800);
    agent.textContent='agent \u203a writing code until the tests pass';
    var done=[];
    for(var l=0;l<TDD_SOURCE.length;l++){
      var line=TDD_SOURCE[l];
      for(var ch=0;ch<=line.length;ch+=3){code.innerHTML=done.map(hl).join('\n')+(done.length?'\n':'')+esc(line.slice(0,ch))+'<span class="caret"></span>';await wait(14);}
      done.push(line);
    }
    code.innerHTML=done.map(hl).join('\n');
    await wait(350);
    cmd.innerHTML='$ <b>dotnet test</b> <span class="dim">again</span>';foot.textContent='Running 5 tests\u2026';
    for(var j=0;j<rows.length;j++){st(rows[j],'run');await wait(170);if(j===bad){st(rows[j],'fail');sfx.fail();}else{st(rows[j],'pass');sfx.pass(j);}bar.style.width=((j+1)/rows.length*100)+'%';await wait(80);}
    if(jinx){
      foot.innerHTML='<span class="bad">4 passed \u00b7 1 failed</span> \u00b7 Expected: pass, Actual: pass (It works on my machine)';
      agent.textContent='human \u203a cannot reproduce. Merged \u2713';
      stamp=document.createElement('div');stamp.className='wfm-stamp';stamp.setAttribute('role','img');
      stamp.setAttribute('aria-label','Works on my machine. Certified.');
      stamp.innerHTML='<b>Works on my machine</b><span>\u2713 Certified</span>';
      card.appendChild(stamp);
      emit('egg:found','machine');
    }else{
      foot.innerHTML='<span class="ok">5 passed</span> \u00b7 0 failed \u00b7 0.84 s';
      agent.textContent='human \u203a reviewed and merged \u2713';
      sfx.chime();
    }
    busy=false;btn.disabled=false;btn.textContent='Run again';
  }
  btn.addEventListener('click',function(){run(true);});
  var seenT=false;
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!seenT){seenT=true;setTimeout(run,300);}});},{threshold:.5}).observe(card);
}
