/* Inspired by Cong Min · Recoded by Claude */
/* Cursor lens reveals screen 2 (light + watermark) through screen 1; grows to full on scroll.
   The watermark is warped by a black-hole feDisplacementMap that follows the cursor.
   The lens follows the cursor; its diameter is scroll-driven (0 at the top, the page
   diagonal at the bottom). */
(function () {
    try { history.scrollRestoration = 'manual'; } catch (e) {} // always (re)load at the top
    var cover = document.querySelector('.cover');
    var screen1 = document.querySelector('.screen1');
    var screen2 = document.getElementById('screen2');
    var wm = document.getElementById('watermark');
    var mapEl = document.getElementById('bh-map');
    if (!screen2 || !wm) return;

    var MAP = 320, MAP_R = MAP / 2; // black-hole warp diameter (px): size of the distorted region

    // build the black-hole displacement normal map (R = horizontal ramp, G = vertical ramp,
    // inside a soft-edged circle so the warp fades out gently)
    if (mapEl) {
        var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + MAP + "' height='" + MAP + "'>"
            + "<defs>"
            + "<linearGradient id='rx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='rgb(0,0,0)'/><stop offset='1' stop-color='rgb(255,0,0)'/></linearGradient>"
            + "<linearGradient id='gy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='rgb(0,0,0)'/><stop offset='1' stop-color='rgb(0,255,0)'/></linearGradient>"
            + "<radialGradient id='fade' cx='50%' cy='50%' r='50%'><stop offset='55%' stop-color='#fff' stop-opacity='1'/><stop offset='100%' stop-color='#fff' stop-opacity='0'/></radialGradient>"
            + "<mask id='m'><circle cx='" + MAP_R + "' cy='" + MAP_R + "' r='" + MAP_R + "' fill='url(#fade)'/></mask>"
            + "</defs>"
            + "<g mask='url(#m)'>"
            + "<rect width='" + MAP + "' height='" + MAP + "' fill='url(#rx)'/>"
            + "<rect width='" + MAP + "' height='" + MAP + "' fill='url(#gy)' style='mix-blend-mode:screen'/>"
            + "</g></svg>";
        var href = 'data:image/svg+xml,' + encodeURIComponent(svg);
        mapEl.setAttribute('width', MAP);
        mapEl.setAttribute('height', MAP);
        mapEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
        mapEl.setAttribute('href', href);
    }

    // Tile "CONGMIN" across the grid, offsetting each row (ROW_OFFSET) and shifting the whole
    // phase (SHIFT) so the letters read as continuous running text across and down.
    var SEQ = 'CONGMIN';
    var ROW_OFFSET = [0, 1, 4]; // per-row letter offset, cycled every 3 rows
    var CELL = 52;  // watermark grid cell (px) — spacing of the tiled letters
    var SHIFT = 2;  // horizontal phase: shift the tiled letters left by this many
    var NAME_ROWS = 3; // rows the name clears vertically (centred); 3 = tighter, 4 = looser margins
    function fillWatermark() {
        var w = window.innerWidth || 1280;
        var h = window.innerHeight || 800;
        var cols = Math.ceil(w / CELL) + 2;
        var rows = Math.ceil(h / CELL) + 2;
        if ((rows % 2) !== (NAME_ROWS % 2)) rows++; // match parity so the centred NAME_ROWS band lands
                                                    // symmetrically on the viewport centre (no half-cell drift)
        var cMid = (cols - 1) / 2, rMid = (rows - 1) / 2;
        var cMidI = Math.round(cMid); // integer centre column, so the phase is viewport-stable
        // cleared WIDTH tracks the responsive name size (so the watermark always wraps it, never
        // clearing whole rows on small screens); cleared HEIGHT is a fixed, centred NAME_ROWS band
        var nameW = Math.min(0.9 * w, 640);
        var padX = CELL * 0.25;
        var nr0 = Math.round(rMid - NAME_ROWS / 2), nr1 = nr0 + NAME_ROWS - 1;
        // motto: snapped to a real watermark row near the bottom and centred on it
        var mottoRow = Math.min(rows - 1, Math.round(rMid + (0.35 * h) / CELL));
        var mY = (mottoRow - rMid) * CELL;
        if (motto) motto.style.top = (h / 2 + mY) + 'px';
        if (wm.dataset.cols == cols && wm.dataset.rows == rows && wm.dataset.namew == Math.round(nameW)) return;
        wm.dataset.cols = cols; wm.dataset.rows = rows; wm.dataset.namew = Math.round(nameW);
        var html = '';
        for (var r = 0; r < rows; r++) {
            var off = ROW_OFFSET[r % 3];
            for (var c = 0; c < cols; c++) {
                var dx = (c - cMid) * CELL;
                var inName = (r >= nr0 && r <= nr1) && Math.abs(dx) < nameW / 2 + padX;
                var inMotto = (r === mottoRow) && Math.abs(dx) < 95;
                var idx = ((c - cMidI + off + SHIFT) % 7 + 7) % 7; // centre-anchored + left shift
                html += (inName || inMotto) ? '<span></span>' : '<span>' + SEQ.charAt(idx) + '</span>';
            }
        }
        wm.style.gridTemplateColumns = 'repeat(' + cols + ', ' + CELL + 'px)';
        wm.innerHTML = html;
    }

    var scrollHint = document.querySelector('.scroll-hint');
    var motto = document.querySelector('.motto');
    var EASE = 0.15; // lens follows the cursor with a slight trailing lag (lower = more lag)
    var targetX = (window.innerWidth || 1280) / 2;
    var targetY = (window.innerHeight || 800) / 2;
    var curX = targetX, curY = targetY;
    var pointerMoved = false; // until the pointer moves, keep the lens centred (incl. after resize)
    var coarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); // touch
    var introReady = false;
    var HINT_MAX = 0.55; // scroll-hint icon stays subtle (lower peak opacity)
    var iconOp = 0, lastIconOp = -1;
    var lastClip = '', lastMapX = null, lastMapY = null;

    // rAF loop: ease the lens centre toward the cursor; radius is scroll-driven
    // (0 at the top, the page diagonal at the bottom)
    function render() {
        requestAnimationFrame(render);
        if (!introReady) return; // during the intro screen 2 stays full as the loading backdrop
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        if (scrollHint) { // scroll hint stays visible until the bottom is reached, then fades out
            iconOp += ((p < 0.99 ? HINT_MAX : 0) - iconOp) * 0.12;
            if (Math.abs(iconOp - lastIconOp) > 0.002) { scrollHint.style.opacity = iconOp; lastIconOp = iconOp; }
        }
        curX += (targetX - curX) * EASE;
        curY += (targetY - curY) * EASE;
        if (Math.abs(targetX - curX) < 0.5) curX = targetX;
        if (Math.abs(targetY - curY) < 0.5) curY = targetY;
        var r = p * Math.hypot(window.innerWidth, window.innerHeight); // radius = page diagonal at the bottom
        var clip = 'circle(' + r + 'px at ' + curX + 'px ' + curY + 'px)';
        if (clip !== lastClip) { lastClip = clip; screen2.style.clipPath = clip; }
        // only re-position the black-hole map when the cursor actually moves; re-setting it every
        // frame (e.g. during a scroll, when the cursor is still) re-renders the SVG filter and janks
        if (curX !== lastMapX || curY !== lastMapY) {
            if (mapEl) {
                mapEl.setAttribute('x', curX - MAP_R);
                mapEl.setAttribute('y', curY - MAP_R);
            }
            // move the watermark's radial darkening to the black hole (only on cursor move)
            wm.style.setProperty('--hot-x', curX + 'px');
            wm.style.setProperty('--hot-y', curY + 'px');
            lastMapX = curX;
            lastMapY = curY;
        }
    }

    fillWatermark();

    // intro: screen 2 (the watermark) is the loading backdrop; once the wallpaper image is
    // ready, the cover — temporarily raised above screen 2 — blooms in from the centre, then
    // the normal lens model resumes.
    function endIntro() {
        if (introReady) return;
        introReady = true;
        screen2.classList.remove('loading'); // screen 2's name + motto come back
        if (screen1) screen1.style.zIndex = ''; // cover drops back beneath screen 2
        document.documentElement.style.overflow = ''; // re-enable scrolling
    }
    var introStarted = false;
    function startIntro() {
        if (introStarted) return;
        introStarted = true;
        window.scrollTo(0, 0);                          // reset to the top each time the image loads
        cover.classList.add('revealed');                 // run the bloom (always from the page centre)
        window.dispatchEvent(new Event('wallpaper-ready')); // let the motto begin its carousel
        setTimeout(endIntro, 700);                       // hand back after the bloom finishes
    }
    if (cover && screen1) {
        window.scrollTo(0, 0);                              // start at the top
        document.documentElement.style.overflow = 'hidden'; // no scrolling until the image loads
        screen2.classList.add('loading');                   // screen 2 = watermark only while loading
        screen2.style.clipPath = 'circle(150% at 50% 50%)'; // show screen 2 fully while loading
        screen1.style.zIndex = '4';                         // cover above screen 2 for the bloom
        var bg = new Image();
        // bloom only once the wallpaper is DECODED (paint-ready), not merely downloaded, so the
        // reveal shows the photo itself instead of the #aaa fallback flashing to the image. The CSS
        // background (.wallpaper / .wallpaper-fill) shares this URL, so its bytes are already cached
        // and it paints in step with the bloom.
        bg.onload = function () {
            if (bg.decode) bg.decode().then(startIntro, startIntro); // decode failure still blooms
            else startIntro();
        };
        bg.onerror = startIntro;                            // still bloom on the #aaa fallback
        bg.src = 'https://congm.in/bing';
        setTimeout(startIntro, 4000);                       // safety net if neither event fires
    } else {
        introReady = true;
        setTimeout(function () { window.dispatchEvent(new Event('wallpaper-ready')); }, 0);
    }

    window.addEventListener('mousemove', function (e) {
        if (coarsePointer) return; // touch: ignore synthetic tap mousemoves, keep the lens centred
        pointerMoved = true;
        targetX = e.clientX;
        targetY = e.clientY;
    });
    window.addEventListener('resize', function () {
        fillWatermark();
        // keep the lens centred after a resize/orientation change until the pointer moves
        // (on touch devices the pointer never moves, so it stays centred)
        if (!pointerMoved) {
            targetX = curX = window.innerWidth / 2;
            targetY = curY = window.innerHeight / 2;
        }
    });

    // smooth scroll helper — rAF/vsync-aligned, easeOutQuad; a fresh call retargets (cancels the
    // previous animation) so rapid clicks accumulate smoothly
    var scrollRAF = null;
    function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
    function smoothScrollTo(destY, dur) {
        if (scrollRAF) cancelAnimationFrame(scrollRAF);
        destY = Math.max(0, Math.min(maxScroll(), destY));
        // honour reduced-motion: jump instead of animating (consistent with the CSS / motto opt-outs)
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, destY); scrollRAF = null; return;
        }
        var startY = window.scrollY, dist = destY - startY;
        if (Math.abs(dist) < 1) { scrollRAF = null; return; }
        var t0 = null;
        function frame(ts) {
            if (t0 === null) t0 = ts;
            var t = Math.min(1, (ts - t0) / dur);
            var e = 1 - (1 - t) * (1 - t); // easeOutQuad — matches the cover bloom's ease-out
            window.scrollTo(0, startY + dist * e);
            scrollRAF = t < 1 ? requestAnimationFrame(frame) : null;
        }
        scrollRAF = requestAnimationFrame(frame);
    }

    // clicking the mouse icon jumps straight to the bottom (0.6s, matches the cover bloom)
    if (scrollHint) {
        scrollHint.addEventListener('click', function (e) {
            e.stopPropagation(); // don't also trigger the page's step-scroll
            if (introReady) smoothScrollTo(maxScroll(), 600);
        });
    }
    // single click anywhere advances one short step (~10%); fast double-click jumps to the bottom
    // (the two step-clicks just get superseded by the double-click's bottom target). Clicking the
    // mouse icon also jumps straight down.
    var STEP_FRAC = 0.10;
    document.addEventListener('click', function () {
        if (!introReady) return; // ignore clicks while the cover is still loading
        var maxY = maxScroll();
        if (window.scrollY < maxY - 2) smoothScrollTo(window.scrollY + STEP_FRAC * maxY, 420);
    });
    document.addEventListener('dblclick', function () {
        if (introReady) smoothScrollTo(maxScroll(), 600); // double-click → straight to the bottom
    });

    requestAnimationFrame(render);
})();
