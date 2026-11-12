/* Wires the sound engine to the page: unlock on first input, the mute button, click and hover sounds. */
import { sfx } from '../audio/sfx.js';

export function initSoundUi() {
  document.addEventListener('pointerdown', function () { sfx.unlock(); }, { capture: true });
  document.addEventListener('keydown', function () { sfx.unlock(); }, { capture: true });

  var sndBtn = document.getElementById('snd');
  function paint() {
    var m = sfx.muted();
    sndBtn.setAttribute('aria-pressed', m ? 'true' : 'false');
    sndBtn.setAttribute('aria-label', m ? 'Turn sounds on' : 'Mute sounds');
  }
  sndBtn.addEventListener('click', function () {
    sfx.setMuted(!sfx.muted());
    paint();
    if (!sfx.muted()) sfx.click();
  });
  paint();

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('a,button,.lg,.tool,.tile');
    if (t && t !== sndBtn && !t.closest('#snd')) sfx.click();
  });

  var lastHovered = null;
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var t = e.target.closest && e.target.closest('.tool,.iconrow>span,.techrow>span,.lg,.badge,.dom,.chip,.tile');
    if (t !== lastHovered) {
      lastHovered = t;
      if (t) sfx.tick();
    }
  });
}
