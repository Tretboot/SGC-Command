/* =====================================================================
   SGC Command · title-screen.js (v0.33) – Titel im Stil einer TV-Ident
   Eigenes Wappen (SVG, kein fremdes Logo). Ein Klick ist technisch nötig
   (Browser geben Audio erst nach einer Nutzergeste frei). Der Klick blendet
   den Titel aus; das vorhandene Intro übernimmt unverändert.
   Dazu globale 90er-Terminal-UI-Sounds (Hover-Tick, Klick-Chirp).
   ===================================================================== */
(function () {
  'use strict';
  function chevrons() { // 9 Chevrons auf einem Kreis (Trigonometrie: x=sin, y=-cos)
    var out = '';
    for (var i = 0; i < 9; i++) { var a = i * 40 * Math.PI / 180, p = function (r, d) { return (100 + r * Math.sin(a + d)).toFixed(1) + ',' + (100 - r * Math.cos(a + d)).toFixed(1); };
      out += '<polygon points="' + p(88, 0) + ' ' + p(76, -0.09) + ' ' + p(76, 0.09) + '" fill="#b6ff9a"/>'; }
    return out;
  }
  var LOGO = '<svg class="sgc-emblem" viewBox="0 0 200 200" aria-label="SGC Command Emblem">' +
    '<circle cx="100" cy="100" r="94" fill="none" stroke="#7CFC8a" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="70" fill="none" stroke="#3c8c3c" stroke-width="10" stroke-dasharray="5 7"/>' + chevrons() +
    '<polygon points="100,50 142,128 58,128" fill="none" stroke="#b6ff9a" stroke-width="3"/><circle cx="100" cy="106" r="9" fill="#b6ff9a"/></svg>';
  function chirp(f, d, v) { try { if (typeof SFX !== 'undefined' && SFX.ctx && !SFX.muted) SFX.tone(f, d, 'square', v); } catch (e) { } }
  function install() {
    var bs = document.getElementById('boot-screen'); if (!bs) return;
    bs.classList.add('sgc-title');
    var box = bs.firstElementChild; if (box && !box.querySelector('.sgc-emblem')) box.insertAdjacentHTML('afterbegin', LOGO);
    bs.addEventListener('pointerdown', function (e) {
      if (e.target.closest('select')) return; // Sprachwahl darf nicht starten
      bs.classList.add('fade'); setTimeout(function () { chirp(660, .08, .12); }, 30); setTimeout(function () { chirp(990, .12, .1); }, 120);
    });
  }
  var last = 0;
  document.addEventListener('pointerover', function (e) { var b = e.target.closest && e.target.closest('button,.menu-btn'); if (!b || performance.now() - last < 60) return; last = performance.now(); chirp(2400, .015, .03); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button,.menu-btn')) chirp(1200, .03, .06); }, true);
  if (document.readyState !== 'loading') install(); else document.addEventListener('DOMContentLoaded', install);
})();
