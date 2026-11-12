/* Morning mood, 05:00-11:00 local time (?time=08:00 to test): a short "Good morning" above the hero eyebrow that fades
   out after a few seconds. Off switch: MOODS.morning in data/moods.js. */
import { now, hourOf } from '../core/clock.js';
import { heroNote } from '../ui/hero-note.js';
import { MOODS, MORNING } from '../data/moods.js';

var SHOW_MS = 6000;

export function initMoodMorning() {
  if (!MOODS.morning) return;
  var h = hourOf(now());
  if (h < MORNING.from || h >= MORNING.to) return;
  setTimeout(function () { heroNote('Good morning', { lang: 'en', cls: 'morning', ms: SHOW_MS }); }, 700);
}
