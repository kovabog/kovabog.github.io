/* Night mood, 22:00-06:00 local time (?time=23:30 to test): adds html.night (dark palette in css/moods/night.css,
   read once by the WebGL background), a moon and a few twinkling stars in the hero. The site has no light/dark switch
   of its own, so the night palette is the only dark variant. Off switch: MOODS.night in data/moods.js. */
import { root } from '../core/env.js';
import { now, hourOf } from '../core/clock.js';
import { createRng } from '../core/util.js';
import { MOODS, NIGHT } from '../data/moods.js';

var STARS = 14;
var MOON = '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="moonGlow"><stop offset="0" stop-color="#fdf3d8"/><stop offset="1" stop-color="#e9d7a8"/></radialGradient></defs>' +
  '<path d="M27 6a15 15 0 1 0 7 22A12 12 0 0 1 27 6z" fill="url(#moonGlow)"/>' +
  '<circle cx="16" cy="18" r="2.2" fill="#d9c58f" opacity=".55"/><circle cx="21" cy="27" r="1.4" fill="#d9c58f" opacity=".5"/></svg>';

function isNight(d) {
  var h = hourOf(d || now());
  return h >= NIGHT.from || h < NIGHT.to;
}

export function initMoodNight() {
  if (!MOODS.night || !isNight()) return;
  root.classList.add('night');
  var hero = document.getElementById('top');
  if (!hero) return;

  var sky = document.createElement('div');
  sky.className = 'night-sky';
  sky.setAttribute('aria-hidden', 'true');
  var html = '<span class="moon">' + MOON + '</span>', rnd = createRng(42);
  for (var i = 0; i < STARS; i++) {
    html += '<i class="star" style="left:' + (4 + rnd() * 92).toFixed(1) + '%;top:' + (6 + rnd() * 70).toFixed(1) + '%;--s:' + (1 + rnd() * 2).toFixed(1) +
      'px;--d:' + (rnd() * 3).toFixed(2) + 's"></i>';
  }
  sky.innerHTML = html;
  hero.insertBefore(sky, hero.firstChild);
}
