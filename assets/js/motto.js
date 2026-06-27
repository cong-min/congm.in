/* Inspired by Cong Min · Recoded by Claude */
/* Typewriter carousel for the "Stay ___" motto. Stays static "Stay Passionate." while the
   wallpaper loads, then begins cycling once the image is ready ('wallpaper-ready'). */
(function () {
    var words = ['Curious', 'Inspired', 'Creative', 'Passionate', 'Grounded', 'Patient', 'Present', 'Humble'];
    var el = document.getElementById('motto-word');
    if (!el) return;

    var START = 'Passionate';
    el.textContent = START; // static while loading: "Stay Passionate."

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        var caret = document.getElementById('motto-caret');
        var caretAnim = caret && caret.querySelector('animate');
        if (caretAnim) caretAnim.remove(); // hold the caret static under reduced motion
        return;
    }

    var TYPE = 120;  // ms per character typed
    var ERASE = 75;  // ms per character erased (a touch slower = smoother)
    var HOLD = 2200; // ms a fully-typed word stays
    var GAP = 200;   // ms the empty "Stay ." state lingers before the next word

    var wi = words.indexOf(START); // begin the carousel from "Passionate"
    var ci = START.length;
    var deleting = true;           // hold it, then erase into the next word
    var paused = false;

    function schedule(ms) {
        setTimeout(function () {
            if (paused) { schedule(200); return; }
            tick();
        }, ms);
    }

    function tick() {
        var word = words[wi];
        if (!deleting) {
            ci++;
            el.textContent = word.slice(0, ci);
            syncHit();
            if (ci === word.length) { deleting = true; schedule(HOLD); return; }
            schedule(TYPE);
        } else {
            ci--;
            el.textContent = word.slice(0, ci);
            syncHit();
            if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; schedule(GAP); return; }
            schedule(ERASE);
        }
    }

    var hit = document.getElementById('motto-hit');
    if (hit) {
        hit.addEventListener('mouseenter', function () { paused = true; });
        hit.addEventListener('mouseleave', function () { paused = false; });
    }
    // keep the transparent hover target's text matched to the visible motto so its box
    // overlays the glyphs
    function syncHit() { if (hit) hit.textContent = 'Stay ' + (el.textContent || '') + '.'; }
    syncHit();

    // begin cycling only once the wallpaper image has loaded
    var started = false;
    window.addEventListener('wallpaper-ready', function () {
        if (started) return;
        started = true;
        schedule(HOLD); // hold "Passionate", then cycle
    });
})();
