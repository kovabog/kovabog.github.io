/* "Composition" donut: builds the SVG slices from the legend, handles hover/focus, fills in on reveal. */
import { on } from '../core/events.js';
import { reduce } from '../core/env.js';

var NS = 'http://www.w3.org/2000/svg';
var R = 80, CIRC = 2 * Math.PI * R;

export function initDonut() {
  var donut = document.getElementById('donut');
  var svg = donut.querySelector('svg');
  var legend = [].slice.call(document.querySelectorAll('.lg'));
  var slices = [], acc = 0;
  var total = legend.reduce(function (s, l) { return s + +l.dataset.v; }, 0);

  legend.forEach(function (l, i) {
    var v = +l.dataset.v, len = CIRC * v / total, c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'sl'); c.setAttribute('cx', 100); c.setAttribute('cy', 100); c.setAttribute('r', R);
    c.setAttribute('stroke', l.dataset.c);
    c.setAttribute('stroke-dashoffset', -acc);
    c.style.setProperty('--d', (i * .08) + 's');
    c.dataset.len = Math.max(0, len - 2.5); c.setAttribute('stroke-dasharray', c.dataset.len + ' ' + CIRC);
    svg.appendChild(c); slices.push(c); acc += len;

    function show() {
      donut.classList.add('hl'); c.classList.add('on'); l.classList.add('on');
      document.getElementById('midv').textContent = v + '%';
      document.getElementById('midl').textContent = l.querySelector('.nm').textContent;
    }
    function hide() {
      donut.classList.remove('hl'); c.classList.remove('on'); l.classList.remove('on');
      document.getElementById('midv').textContent = '100%';
      document.getElementById('midl').textContent = 'of me';
    }
    l.addEventListener('mouseenter', show); l.addEventListener('mouseleave', hide);
    c.addEventListener('mouseenter', show); c.addEventListener('mouseleave', hide);
    l.tabIndex = 0; l.addEventListener('focus', show); l.addEventListener('blur', hide);
  });

  function draw() {
    slices.forEach(function (c) { c.setAttribute('stroke-dasharray', c.dataset.len + ' ' + CIRC); });
  }

  // Start collapsed; the slices grow when the card enters the viewport.
  if (!reduce) slices.forEach(function (c) { c.setAttribute('stroke-dasharray', '0 ' + CIRC); });
  on('reveal', function (el) { if (el.id === 'comp') draw(); });
}
