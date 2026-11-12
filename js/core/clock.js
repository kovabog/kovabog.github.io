/* The visitor's local date and time, with URL overrides so time-based features can be tested any day:
     ?time=23:30          pretend it is 23:30 today
     ?date=2026-12-25     pretend it is that day (keeps the current time unless ?time is given too) */

export function now() {
  var d = new Date();
  try {
    var q = new URLSearchParams(location.search), date = q.get('date'), time = q.get('time'), m;
    if (date && (m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date))) d.setFullYear(+m[1], +m[2] - 1, +m[3]);
    if (time && (m = /^(\d{1,2}):(\d{2})$/.exec(time))) d.setHours(+m[1], +m[2], 0, 0);
  } catch (e) {}
  return d;
}

/* Hours as a fraction, e.g. 22.5 for 22:30. */
export function hourOf(d) { return d.getHours() + d.getMinutes() / 60; }
