# Bohdan Kovalenko — personal site

Senior .NET Fullstack Developer. Live at **https://kovabog.github.io**

A static page, no build step:

- a diamond rendered in WebGL (three.js) that assembles from the tech stack, follows the scroll and can be dragged;
- glass bubbles you can pop;
- a live TDD demo: tests fail, an agent writes the code, tests go green;
- a pixel-art bull terrier (running sprite + one sitting on the "Dog owner" tile) and 11 easter eggs (listed in `js/data/eggs.js`, counted in the footer, with a hint button in the nav; 4 of them need WebGL and are left out of the count when it is unavailable);
- time-based moods: night theme (22–06), a morning greeting (05–11) and Christmas (Dec 24–26); test any of them with `?time=23:30` or `?date=2026-12-25`;
- subtle sounds and haptics with a mute toggle.

three.js and Google Fonts load from CDNs. The page uses native ES modules, so serve the folder over HTTP to run it locally (for example `python3 -m http.server`, then open http://localhost:8000); opening `index.html` straight from disk will not work.

## Project structure

Each file has a single responsibility.

```
index.html              markup only (sections, nav, canvas, dog)
img/
  icons.svg             SVG sprite (<symbol>s referenced by <use>)
  dog-run.png           3-frame walk-cycle sprite sheet
  dog-sit.png           dog sitting on the "Dog owner" tile
css/
  base/                 tokens (colors, fonts), reset, typography, reveal/reduced-motion
  layout/               page skeleton (sections, panels, footer), top navigation
  components/           button, card, icon, sound toggle, hint button, toast, TDD terminal, dog
  sections/             one file per page section (hero, stack, path, numbers, craft, human, contact)
  stage/                WebGL canvas layer, HUD readout, no-WebGL fallback
  moods/                night and Christmas themes
js/
  main.js               entry point: starts every feature
  boot/js-flag.js       adds the "js" class before first paint (classic script in <head>)
  core/                 env (reduced motion), util (math, rng, wait), events (pub/sub hub),
                        store (safe localStorage), clock (local time + ?time/?date overrides)
  data/                 static data: CV (base64 PDF), orbit badge SVGs, TDD demo source, easter eggs, mood flags
  audio/sfx.js          sound + haptics engine
  ui/                   toast (transient notification), hero-note (greetings above the hero), disco-ball (3D mirror ball for the foam party)
  features/             one module per page behaviour
                        reveal, counters, donut, nav, contact, sound-ui, dog, dog-triggers,
                        easter-eggs, egg-hint, orbit-links, tdd-demo, matrix-rain, good-boy,
                        dev-mode, speedometer, confetti, foam-party, rubber-band, mood-night, mood-morning, mood-christmas
  stage/                3D scene, split by concern
                        index (assembly + frame loop), context (renderer/camera), layout (viewport + scroll poses),
                        motion (smoothed scroll/pointer state), background, studio-environment,
                        diamond + gem-geometry + gem-material, orbit-ring + badge-textures,
                        intro + intro-flash + intro-shards, highlight, droplets, particles, textures,
                        interaction (drag/pick/pop), hud, overdrive, bubble-pile
```

Modules do not call each other's internals. They communicate through `js/core/events.js`:

| event             | emitted by                         | handled by                |
| ----------------- | ---------------------------------- | ------------------------- |
| `reveal`          | features/reveal                    | features/counters, donut  |
| `orbit:highlight` | features/orbit-links               | stage/highlight           |
| `egg:found`       | every easter-egg trigger           | features/easter-eggs      |
| `stage:nogl`      | stage/index (no WebGL)             | features/easter-eggs      |
| `confetti:burst`  | stage/overdrive                    | features/confetti         |
| `party:foam`      | stage/droplets                     | features/foam-party       |
