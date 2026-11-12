/* Time-based moods (visitor's local time; test with ?time=23:30 and ?date=2026-12-25).
   To switch a mood off, set its flag to false. Each mood is self-contained in js/features/mood-*.js + css/moods/*.css. */
export var MOODS = {
  night: true,      // 22:00-06:00: darker palette, moon, twinkling stars
  morning: true,    // 05:00-11:00: "Good morning" in the hero for a few seconds
  christmas: true   // Dec 24-26: falling snow, lights on the header, "Merry Christmas!"
};

export var NIGHT = { from: 22, to: 6 };
export var MORNING = { from: 5, to: 11 };
export var CHRISTMAS = { month: 12, from: 24, to: 26 };
