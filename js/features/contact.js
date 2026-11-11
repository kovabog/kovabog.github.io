/* Contact block: copy-to-clipboard for the email and the optional CV download. */
import { CV_B64 } from '../data/cv-pdf.js';

var EMAIL = 'textbohdan@gmail.com';

export function initContact() {
  var statusEl = document.getElementById('status'), statusTimer, downloads = null;

  function say(m) {
    statusEl.textContent = m;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { statusEl.textContent = ''; }, 4200);
  }

  document.getElementById('copy').addEventListener('click', function () {
    try {
      navigator.clipboard.writeText(EMAIL).then(
        function () { say('Email copied.'); },
        function () { say('Select the address above to copy it.'); });
    } catch (e) { say('Select the address above to copy it.'); }
  });

  // The downloads capability only exists when the page is hosted inside Claude; elsewhere the link just opens LinkedIn.
  try {
    if (window.claude && window.claude.use) {
      window.claude.use('downloads').then(function (d) { downloads = d; }, function () {});
    }
  } catch (e) {}

  document.querySelectorAll('[data-cv]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      if (!downloads) return;
      ev.preventDefault();
      try {
        var bin = atob(CV_B64), u = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        downloads.save({ filename: 'Bohdan_Kovalenko_CV.pdf', data: u }).then(
          function () { say('CV saved.'); },
          function (err) { say(err && err.code === 'declined' ? 'No problem. The CV stays here.' : 'Download is not available here. Try LinkedIn.'); });
      } catch (e) { say('Download is not available here. Try LinkedIn.'); }
    });
  });
}
