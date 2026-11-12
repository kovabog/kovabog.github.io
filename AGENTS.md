# AGENTS.md

Guide for AI coding agents (Claude, Copilot, Cursor, Codex, Gemini…) working in this repository.
Human-facing overview: `README.md`. Same content for Copilot: `.github/copilot-instructions.md`.

## What this project is

The personal business-card site of **Bohdan Kovalenko**, Senior .NET Fullstack Developer (Łódź, Poland).
Live at **https://kovabog.github.io**, served by GitHub Pages straight from `main`.

Purpose: a recruiter or hiring manager opens it from a CV or LinkedIn and, in under a minute, learns
who Bohdan is (stack, career path, numbers, personality) and how to contact him. It doubles as a
showcase of front-end craft: a WebGL diamond built from his tech stack, poppable glass bubbles,
a live TDD demo, a pixel-art bull terrier and three easter eggs.

Audience and tone: English, concise, confident, a little playful. Facts must match the CV
(ELEKS 2021–present, Gentlecode 2018–2021, Biencode 2017–2018; .NET 8, Azure, Angular/React, SQL Server).
Never invent experience, employers, numbers or contact details.

## Hard constraints

- **Static site, no build step, no package.json, no bundler, no framework.** Plain HTML + CSS + native ES modules.
  Do not add tooling unless the owner asks.
- **Only external runtime dependencies:** three.js `0.170.0` from jsDelivr (`js/stage/three-loader.js`)
  and Google Fonts (`index.html`). Do not add more CDNs or libraries.
- The page must still work, look fine and be fully readable **without WebGL** (`html.no-gl`)
  and with **`prefers-reduced-motion: reduce`** (`reduce` in `js/core/env.js`). Every new animation needs a reduced-motion path.
- ES modules need HTTP. Run locally with `python3 -m http.server` and open `http://localhost:8000`;
  `file://` will not work.
- Deploy = push to `main`. There is no CI and no tests. Verify in a browser before pushing.

## Structure

```
index.html            markup only: nav, 7 sections, #stage canvas, #dog, #hud, #toast. No inline CSS/JS.
img/
  icons.svg           SVG sprite; used as <use href="img/icons.svg#i-NAME"> (and #l-NAME for logos)
  dog-run.png         walk-cycle sprite sheet: 3 frames side by side, 621x467 each
  dog-sit.png         dog sitting on the "Dog owner" tile
  dog-walk.png        old single-frame dog, currently unused
css/                  loaded in this order by <link> tags in index.html
  base/               tokens.css (colors, fonts – the only place for :root vars), reset, typography,
                      motion (.reveal states + reduced-motion)
  layout/             page.css (sections, wraps, panels, footer), nav.css
  components/         button, card, icon, sound-toggle, toast, terminal (TDD demo), dog
  sections/           one file per section: hero, stack, path, numbers, craft, human, contact
  stage/stage.css     WebGL canvas layer, HUD, no-gl fallback, drag cursor
js/
  boot/js-flag.js     classic <head> script: adds class "js" before first paint
  main.js             entry module: calls every init*() – nothing else
  core/
    env.js            root element, `reduce` flag
    util.js           wait, clamp01, lerp, smoothstep, easeOutBack, createRng (deterministic)
    events.js         on(name, fn) / emit(name, payload) – the only channel between modules
  data/               static data only: cv-pdf.js (base64 PDF), orbit-icons.js (badge SVGs + order),
                      tdd-source.js (C# typed by the demo)
  audio/sfx.js        Web Audio sounds + vibration; mute flag in localStorage
  ui/toast.js         toast(html)
  features/           one page behaviour per file, each exports initX():
                      reveal, counters, donut, nav, contact, sound-ui, dog (sprite controller:
                      dog.runBy(msg), dog.jump(msg)), dog-triggers (when the dog appears),
                      easter-eggs (counting + reactions), konami, orbit-links, tdd-demo
  stage/              the three.js scene; index.js assembles parts and runs the frame loop
                      context (renderer/scene/camera), layout (viewport + scroll→pose from data-c*/data-m*),
                      motion (eased scroll/pointer), background (caustics shader), studio-environment,
                      diamond + gem-geometry + gem-material (ray-traced refraction), badge-textures +
                      orbit-ring, intro + intro-flash + intro-shards, highlight, droplets, particles,
                      textures, interaction (drag/flick/pick/pop), hud
```

### Page sections (index.html, in order)

`#top` hero · `#stack` composition donut + toolbox · `#path` career timeline, languages, education ·
`#numbers` four stats · `#craft` how he works + live TDD terminal (`#tdd`) · `#human` hobby tiles
(`[data-dog]` "Dog owner") · `#contact`.

Each `<section>` carries `data-cx/cy/cs/tilt` (desktop) and `data-mx/my/ms` (mobile, < 900px):
where the diamond sits while that section is on screen, in fractions of half the viewport.
`js/stage/layout.js` reads them; change them to move the diamond, not JS.

### Event hub (`js/core/events.js`)

| event             | payload    | emitted by                                          | handled by               |
| ----------------- | ---------- | --------------------------------------------------- | ------------------------ |
| `reveal`          | element    | features/reveal                                     | counters, donut          |
| `orbit:highlight` | key / null | features/orbit-links                                | stage/highlight          |
| `egg:found`       | id         | features/konami, stage/droplets, stage/interaction  | features/easter-eggs     |
| `bubbles:popAll`  | –          | features/easter-eggs                                | stage/droplets           |

Easter egg ids: `konami`, `bubbles` (10 popped), `gem` (double-click/tap the diamond). `TOTAL = 3` in easter-eggs.js.

## Conventions

- **Single responsibility per file.** New behaviour → new file in the right folder plus one `init` call in `main.js`.
  New section → its own `css/sections/*.css` + `<link>` in `index.html`.
- Modules never reach into each other's internals; cross-module communication goes through `events.js`.
  Shared helpers go to `core/`, constants and content to `data/`.
- Style matches existing code: ES5-style `var`/`function` inside ES modules, named exports only,
  short header comment `/* What this file does. */` at the top of every file.
- Colors, fonts and radii come from `css/base/tokens.css`. Responsive rules live next to the rules they
  change, inside the same file (`@media (max-width:900px)` and `(max-width:560px)`).
- Icons: add a `<symbol id="i-name">` to `img/icons.svg`; to link an icon to an orbit badge, map it in
  `ORBIT_KEY` in `features/orbit-links.js`.
- Paths in CSS are relative to the CSS file (`../../img/...`), in HTML/JS relative to the site root.
- Pixel art: keep `image-rendering: pixelated`. The dog walk is a CSS `steps(3)` animation over
  `dog-run.png`; when changing frame count update `background-size`, `steps(N)` and the keyframe end
  (`background-position: N/(N-1)*100%`) in `css/components/dog.css`.
- Accessibility: keep `aria-*` labels, focusable controls, alt text (decorative images use `alt=""`).

## Checking changes

1. `python3 -m http.server` in the repo root, open the page, watch the console: no errors, no 404s.
2. Check desktop (~1280px) and mobile (~390px); scroll through every section.
3. Check the interactive bits you touched: nav scroll, donut hover, counters, TDD demo, bubbles,
   Konami code, dog run-by in `#human` and the jump on the "Dog owner" tile, sound toggle, copy email.
4. Emulate reduced motion and, for stage changes, a browser without WebGL (no-gl fallback).

## Git

- `main` is production. Small, focused commits with a descriptive message.
- Do not commit generated screenshots, local servers' files or tooling artifacts.
