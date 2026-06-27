# Cong Min

Personal homepage of Cong Min — [congm.in](https://congm.in), a minimal full-screen landing page.

> Inspired by Cong Min · Recoded by Claude.

## Tech

A no-build static site: hand-written HTML, CSS, and a touch of JS; self-hosted Ubuntu font.

```
index.html            page (hero with cursor lens + info screen)
assets/css/style.css  styles (reset + font + layout)
assets/js/lens.js     cursor lens: reveal / switch the watermark layer
assets/js/motto.js    rotating "Stay ___" motto (typewriter)
assets/fonts/         Ubuntu.woff2
favicon.ico
og.png                social share preview image
```

The daily wallpaper is served by `/bing` (a Cloudflare Worker proxying Bing's daily
image); it is not part of this repo's build.

## Deploy (Cloudflare Pages)

This repo is fully static — no build step. Cloudflare Pages project settings:

- **Build command**: leave empty
- **Output directory**: `/` (repo root)

Push to the default branch to deploy automatically.

## License

[CC BY-SA 4.0](LICENSE)
