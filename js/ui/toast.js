/* Shows a short message in the #toast element. */
var timer;

export function toast(html) {
  var el = document.getElementById('toast');
  el.innerHTML = html;
  el.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(function () { el.classList.remove('show'); }, 3400);
}
