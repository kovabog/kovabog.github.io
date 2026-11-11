/* Live TDD demo card: tests fail, an "agent" types the code, tests go green. Starts when the card is half visible. */
import { sfx } from '../audio/sfx.js';
import { wait } from '../core/util.js';
import { TDD_SOURCE } from '../data/tdd-source.js';

export function initTddDemo() {
  var term=document.getElementById('term');if(!term)return;
  var btn=document.getElementById('runTests'),foot=document.getElementById('termFoot'),bar=document.getElementById('termBar');
  var cmd=term.querySelector('.cmd'),agent=term.querySelector('.agent'),code=term.querySelector('.code');
  var rows=[].slice.call(term.querySelectorAll('.tl')),busy=false;
  var GLYPH={pend:'\u00b7',run:'\u25cc',fail:'\u2717',pass:'\u2713'};
  function st(r,s){r.className='tl '+s;r.querySelector('.st').textContent=GLYPH[s];}
  function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function hl(t){return esc(t).replace(/\b(public|async|await|return|throw|new|var|if)\b/g,'<span class="k">$1</span>').replace(/\b(Task|Order|Cart|EmptyCartException)\b/g,'<span class="t">$1</span>');}
  async function run(){
    if(busy)return;busy=true;btn.disabled=true;
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
    for(var j=0;j<rows.length;j++){st(rows[j],'run');await wait(170);st(rows[j],'pass');sfx.pass(j);bar.style.width=((j+1)/rows.length*100)+'%';await wait(80);}
    foot.innerHTML='<span class="ok">5 passed</span> \u00b7 0 failed \u00b7 0.84 s';
    agent.textContent='human \u203a reviewed and merged \u2713';
    sfx.chime();busy=false;btn.disabled=false;btn.textContent='Run again';
  }
  btn.addEventListener('click',run);
  var seenT=false;
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!seenT){seenT=true;setTimeout(run,300);}});},{threshold:.5}).observe(document.getElementById('tdd'));
}
