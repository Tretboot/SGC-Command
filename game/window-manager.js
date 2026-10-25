/* =====================================================================
   SGC Command · window-manager.js (v0.32)
   - WM.open(id, title, htmlFn): schwebendes Fenster, an der Titelleiste
     verschiebbar, unten rechts in der Größe veränderbar (CSS resize).
     Position/Größe werden in localStorage gemerkt.
   - Pointer Events statt Maus-Events → funktioniert auch auf Touch.
   - Fenster werden in den Viewport "geklemmt": nichts verschwindet im Vollbild.
   - Außerdem: das große #modal-Fenster wird an seinem Rand verschiebbar.
   ===================================================================== */
(function () {
  'use strict';
  var WM = { wins: {}, z: 400 };
  function clamp(el) {
    var r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    el.style.left = Math.max(0, Math.min(vw - 80, r.left)) + 'px';
    el.style.top = Math.max(0, Math.min(vh - 40, r.top)) + 'px';
  }
  function store(id, el) { try { localStorage.setItem('sgc_win_' + id, JSON.stringify({ l: el.style.left, t: el.style.top, w: el.style.width, h: el.style.height })); } catch (e) { } }
  function drag(handle, el, onEnd) {
    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button,input,select,textarea')) return;
      var sx = e.clientX, sy = e.clientY, r = el.getBoundingClientRect();
      handle.setPointerCapture(e.pointerId); el.style.zIndex = ++WM.z;
      function mv(ev) { el.style.left = (r.left + ev.clientX - sx) + 'px'; el.style.top = (r.top + ev.clientY - sy) + 'px'; }
      function up() { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); clamp(el); onEnd && onEnd(); }
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up);
    });
  }
  WM.open = function (id, title, htmlFn, opt) {
    opt = opt || {};
    if (WM.wins[id]) { WM.wins[id].el.style.display = 'flex'; WM.refresh(id); return WM.wins[id]; }
    var el = document.createElement('div'); el.className = 'sgc-win'; el.style.zIndex = ++WM.z;
    el.innerHTML = '<div class="sgc-win-head"><span>' + title + '</span><button class="small" title="Schließen">✕</button></div><div class="sgc-win-body"></div>';
    var saved = null; try { saved = JSON.parse(localStorage.getItem('sgc_win_' + id)); } catch (e) { }
    el.style.left = (saved && saved.l) || (opt.x || 60) + 'px'; el.style.top = (saved && saved.t) || (opt.y || 80) + 'px';
    el.style.width = (saved && saved.w) || (opt.w || 340) + 'px'; el.style.height = (saved && saved.h) || (opt.h || 240) + 'px';
    document.body.appendChild(el);
    el.querySelector('button').onclick = function () { el.style.display = 'none'; if (opt.onClose) opt.onClose(); };
    drag(el.querySelector('.sgc-win-head'), el, function () { store(id, el); });
    new ResizeObserver(function () { store(id, el); if (opt.onResize) opt.onResize(el); }).observe(el);
    WM.wins[id] = { el: el, htmlFn: htmlFn }; WM.refresh(id); clamp(el);
    return WM.wins[id];
  };
  WM.refresh = function (id) { var w = WM.wins[id]; if (w && w.htmlFn && w.el.style.display !== 'none') w.el.querySelector('.sgc-win-body').innerHTML = w.htmlFn(); };
  window.addEventListener('resize', function () { for (var k in WM.wins) clamp(WM.wins[k].el); });

  /* --- #modal verschiebbar: Ziehen am oberen 24-px-Rand der Box --- */
  var off = { x: 0, y: 0 };
  document.addEventListener('pointerdown', function (e) {
    var box = e.target.closest && e.target.closest('#modal > *'); if (!box) return;
    var r = box.getBoundingClientRect(); if (e.clientY - r.top > 24 || e.target.closest('button,input,select,textarea')) return;
    var sx = e.clientX - off.x, sy = e.clientY - off.y;
    function mv(ev) { off.x = ev.clientX - sx; off.y = ev.clientY - sy; box.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)'; }
    function up() { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); }
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
  });
  /* Wenn das Modal neu gerendert wird, Verschiebung beibehalten & Resize merken */
  if (typeof MutationObserver !== 'undefined') new MutationObserver(function () {
    var b = document.querySelector('#modal > *'); if (b && (off.x || off.y)) b.style.transform = 'translate(' + off.x + 'px,' + off.y + 'px)';
    if (b && b.classList.contains('winamp-chassis') && typeof ResizeObserver !== 'undefined' && !b._observed) {
      b._observed = true;
      new ResizeObserver(function () {
        if (b.style.width || b.style.height) {
          try { localStorage.setItem('sgc_winamp_size', JSON.stringify({ w: b.style.width, h: b.style.height })); } catch (e) { }
        }
      }).observe(b);
    }
  }).observe(document.getElementById('modal') || document.body, { childList: true });

  /* ===================== PIANOROLL (Mini-Fenster) =====================
     Zeichnet jede gespielte Note als Balken: x = Zeit (läuft nach links),
     y = Tonhöhe (MIDI). Daten kommen aus STRUDEL.onVoiceTrigger, das
     sowohl der Web-Strudel-Trigger als auch der Fallback-Synth aufruft. */
  var PR = { notes: [], span: 4000, raf: 0 };
  PR.push = function (voice, midi) { PR.notes.push({ t: performance.now(), m: Number(midi) || 60, v: voice }); if (PR.notes.length > 600) PR.notes.splice(0, 200); };
  PR.draw = function () {
    var cv = document.getElementById('sgc-pianoroll'); if (!cv) { PR.raf = 0; return; }
    var w = cv.width = cv.clientWidth, h = cv.height = cv.clientHeight, g = cv.getContext('2d'), now = performance.now();
    g.fillStyle = '#05070d'; g.fillRect(0, 0, w, h);
    for (var m = 24; m <= 96; m++) if ([1, 3, 6, 8, 10].indexOf(m % 12) >= 0) { g.fillStyle = '#0b1220'; g.fillRect(0, h - (m - 24) / 72 * h, w, h / 72); } // schwarze Tasten
    var col = { kick: '#f97316', snare: '#facc15', hat: '#94a3b8', bass: '#22d3ee', melody: '#a78bfa' };
    PR.notes.forEach(function (n) {
      var x = w - (now - n.t) / PR.span * w; if (x < -10) return;
      g.fillStyle = col[n.v] || '#4ade80'; g.fillRect(x, h - (Math.max(24, Math.min(96, n.m)) - 24) / 72 * h, Math.max(3, w / 80), Math.max(3, h / 72));
    });
    g.fillStyle = '#38bdf8'; g.fillRect(w - 2, 0, 2, h); // Abspielkopf
    PR.raf = requestAnimationFrame(PR.draw);
  };
  PR.open = function () {
    WM.open('pianoroll', '🎹 Pianoroll', function () { return '<canvas id="sgc-pianoroll" style="width:100%;height:100%;display:block"></canvas>'; }, { x: innerWidth - 380, y: 90, w: 360, h: 200 });
    if (!PR.raf) PR.raf = requestAnimationFrame(PR.draw);
  };
  if (typeof STRUDEL !== 'undefined') { var o = STRUDEL.onVoiceTrigger; STRUDEL.onVoiceTrigger = function (v, m) { PR.push(v, m); return o.apply(this, arguments); }; }

  /* Kurzbefehle für das Spiel / die Konsole */
  WM.openSliders = function () { WM.open('sliders', '🎚 Song-Slider · MIDI', function () { return (typeof SGC_SLIDERS !== 'undefined' ? SGC_SLIDERS.html() : '') + '<button class="small" onclick="SGC_SLIDERS.autoMap()">🎛 Auto-Map auf Knobs 1–8</button>'; }, { x: 40, y: 90, w: 380, h: 260 }); };
  WM.openDJ = function () { WM.open('dj', '🎚 DJ · Klangstil', function () { return SOUND_STYLES.html(); }, { x: 40, y: 370, w: 380, h: 210 }); };
  WM.openResearch = function () { if (typeof showResearchModal === 'function') showResearchModal(); };
  globalThis.WM = WM; globalThis.PIANOROLL = PR;
})();
