# CLAUDE.md

All project instructions for AI agents live in [AGENTS.md](AGENTS.md). Read it before changing anything.

@AGENTS.md

Short version:

- Static personal site of Bohdan Kovalenko (Senior .NET Fullstack Developer), deployed by GitHub Pages from `main`.
- No build step: HTML + CSS files + native ES modules. three.js 0.170.0 and Google Fonts from CDN only.
- One responsibility per file; modules talk only via `js/core/events.js`; `js/main.js` only calls `init*()`.
- Keep the no-WebGL and reduced-motion paths working.
- Test locally with `python3 -m http.server`, check the console and both desktop and mobile widths, then push.
