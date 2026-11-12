/* Small notes shown just above the hero eyebrow (greetings from the time-based moods).
   The row is absolutely positioned, so adding or removing a note never moves the page. */
var row = null;

/* Adds a note; with ms > 0 it fades out and is removed after that many milliseconds. Returns the element. */
export function heroNote(text, opts) {
  opts = opts || {};
  if (!row) {
    var panel = document.querySelector('.hero .panel');
    if (!panel) return null;
    row = document.createElement('div');
    row.className = 'hero-notes';
    panel.insertBefore(row, panel.firstChild);
  }
  var n = document.createElement('span');
  n.className = 'hero-note mono' + (opts.cls ? ' ' + opts.cls : '');
  if (opts.lang) n.lang = opts.lang;
  n.textContent = text;
  row.appendChild(n);
  requestAnimationFrame(function () { requestAnimationFrame(function () { n.classList.add('on'); }); });
  if (opts.ms > 0) {
    setTimeout(function () {
      n.classList.remove('on');
      setTimeout(function () { n.remove(); }, 1000);
    }, opts.ms);
  }
  return n;
}
