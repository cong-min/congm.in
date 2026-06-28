# CLAUDE.md

Guidance for working in this repository.

## Project

congm.in — the personal homepage of Cong Min. A minimal, no-build static site
deployed on Cloudflare Pages.

## Conventions

- **No build step.** Hand-written HTML + CSS + vanilla JS only. Do not introduce
  bundlers, frameworks, `package.json`, or any build pipeline.
- **All repository content is in English** — code, comments, README, commit
  messages. (Chat with the owner may be in another language; the committed files
  are not.)
- **Comments, README, and commit messages describe only the objective logic and
  intent of the code** — no development/planning narrative, no process storytelling.
- Attribution line used across files: `Inspired by Cong Min · Recoded by Claude`.

## Layout

```
index.html            page markup + the black-hole SVG filter (#bhf)
assets/css/style.css  reset + font + all styles
assets/js/lens.js     cursor lens, scroll-driven reveal, intro bloom, black-hole map, scroll UX
assets/js/motto.js    "Stay ___" typewriter motto
assets/fonts/         self-hosted Ubuntu.woff2
favicon.ico  og.png
```

## How it works

- Two fixed full-screen layers: `screen1` (`.cover` = dark Bing wallpaper + filter
  + white SVG name) sits under `screen2` (light; `CONGMIN` watermark grid +
  photo-filled name + motto).
- A cursor **lens**: `screen2` is revealed through `screen1` via
  `clip-path: circle()`. The circle centre eases toward the cursor (rAF loop) and
  its radius is scroll-driven — 0 at the top, the page diagonal at the bottom.
- A **black-hole** SVG filter (`#bhf` `feDisplacementMap`) warps the watermark
  around the cursor; `lens.js` builds/moves it (and a CSS radial darkening mask)
  only when the cursor actually moves — a deliberate perf guard, so scrolling does
  not re-render the full-screen filter.
- The name is SVG `<text>` on both screens (matched font-size/weight/stroke keep them
  aligned). On `screen2` the name + motto are photo-filled by a full-viewport SVG
  `<image>` (the same aligned cover as `screen1`) masked to the glyph shapes
  (`#photo-mask`) and composited source-over — no blend reads the watermark/black-hole
  backdrop, so the per-frame filter re-render cannot disturb the fill. The mask name is a
  flat `<text>`, not a nested `<svg>` (mobile engines, notably iOS Safari, drop a nested
  `<svg>` inside a `<mask>` and render the whole thing blank); `lens.js` sets its
  font-size + stroke-width to track screen 1's responsive box, and drives the motto
  position with the same numbers `screen1` derives. A grey `#4a515d` rect behind the
  `<image>` shows through the glyphs while the wallpaper loads or if it fails
  (`.loading`/`.no-photo`).
- **Touch (`pointer: coarse`)**: there is no cursor, so the lens stays centred and
  simply expands from the centre on scroll, and the black hole is disabled.

## External dependency

- The daily wallpaper is served by `/bing`, an external Cloudflare Worker that
  redirects to Bing's daily image. It is not part of this repo.

## Local preview

No build — serve the repo root statically and open `index.html`, e.g.:

```
python3 -m http.server
```

## Deploy (Cloudflare Pages)

Fully static, no build step. Project settings: build command empty, output
directory `/` (repo root). Push to the default branch to deploy.
