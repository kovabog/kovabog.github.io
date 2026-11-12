/* Shows a short message in the #toast element. With { ask: true } it stays longer and its buttons ([data-act]) are clickable. */
var timer;

export function toast(html, opts) {
  var el = document.getElementById('toast');
  var ask = !!(opts && opts.ask);
  el.innerHTML = html;
  el.classList.toggle('ask', ask);
  el.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(function () { el.classList.remove('show'); }, ask ? 9000 : 3400);
}

export function hideToast() {
  var el = document.getElementById('toast');
  clearTimeout(timer);
  el.classList.remove('show');
}
