/* Intro timeline clock: starts once (after a delay, or as soon as the badge textures are ready). */

export function createIntro(reduce) {
  var startedAt = 0;
  function begin() { if (!startedAt) startedAt = performance.now(); }
  setTimeout(begin, 1600);

  return {
    begin: begin,
    started: function () { return !!startedAt; },
    /* Seconds since the intro began (99 = "finished" when motion is reduced). */
    elapsed: function (now) { return reduce ? 99 : (startedAt ? (now - startedAt) / 1000 : 0); }
  };
}
