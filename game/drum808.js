/* =====================================================================
   SGC Command · drum808.js (v0.31) – TR-808-Simulation (Web Audio)
   Ersetzt das alte "ReBirth"-Rack. Jede Stimme folgt dem Original-
   Schaltungsprinzip der Roland TR-808 (1980), vereinfacht nachgebaut:
   - KICK : Sinus mit schneller Tonhöhenhüllkurve (Pitch-Drop) + kurzer
            Klick. Das Original ist ein "angestoßener" Brückenoszillator;
            der lange Decay macht den typischen 808-Boom.
   - SNARE: zwei gestimmte Sinus-Töne (~180/330 Hz) + hochpassgefiltertes
            Rauschen ("Snappy").
   - HATS : sechs Rechteckoszillatoren mit den nicht-harmonischen 808-
            Frequenzen, Bandpass + Hochpass → metallischer Klang.
   - CLAP : mehrfach kurz hintereinander gestartetes Bandpass-Rauschen
            (simuliert mehrere Hände) + Hall-Schwanz.
   Alle Stimmen laufen in `dest` (Standard: SFX.musicGain) und damit
   automatisch durch Master → Analyser → Oszilloskop.
   ===================================================================== */
(function () {
  'use strict';
  var HAT_FREQS = [205.3, 304.4, 369.6, 522.7, 540, 800]; // klassische 808-Metall-Frequenzen
  var noiseBuf = null;
  function noise(ctx) { // 1 s weißes Rauschen, einmal erzeugt und wiederverwendet
    if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function env(g, t, peak, decay) { // exponentieller Abfall, nie exakt 0 (WebAudio-Regel)
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }
  var D = {
    params: { tune: 50, decay: 0.9, tone: 0.5, level: 1.0, drive: 0.2 },
    /* v0.33 "DIE 808 DRÜCKT": Overdrive-Modus. armed=false → Schalter gesichert.
       Erst "scharf machen" (Klappe), dann aktivieren. Dann läuft die Kick durch
       eine harte tanh-Sättigung + Limiter. Bewusst laut → Warnung im UI. */
    armed: false, overdrive: false, _shaper: null,
    _drive: function (ctx, dest) {
      if (!D.overdrive) return dest;
      if (!D._shaper || D._shaper.context !== ctx) {
        var ws = ctx.createWaveShaper(), lim = ctx.createDynamicsCompressor(), n = 2048, c = new Float32Array(n);
        for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = Math.tanh(10 * x) * 0.9; } // tanh = weiches "Röhren"-Clipping, Faktor 10 = brutal
        ws.curve = c; ws.oversample = '4x';
        lim.threshold.value = -6; lim.ratio.value = 20; // Limiter: schützt Boxen/Ohren vor Spitzen
        ws.connect(lim); lim.connect(dest); D._shaper = ws;
      }
      return D._shaper;
    },
    kick: function (ctx, dest, t, v) {
      var p = D.params, o = ctx.createOscillator(), g = ctx.createGain();
      dest = D._drive(ctx, dest); if (D.overdrive) v = Math.min(1, v * 1.6); // Overdrive: lauter + verzerrt
      o.type = 'sine';
      o.frequency.setValueAtTime(p.tune * 3, t);                 // Anschlag hoch …
      o.frequency.exponentialRampToValueAtTime(p.tune, t + 0.06); // … fällt sofort auf Grundton
      env(g, t, v * p.level, p.decay);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + p.decay + 0.05);
      var c = ctx.createOscillator(), cg = ctx.createGain(); // Klick für Durchsetzung auf kleinen Boxen
      c.type = 'square'; c.frequency.value = 1800; env(cg, t, v * 0.15, 0.008);
      c.connect(cg); cg.connect(dest); c.start(t); c.stop(t + 0.02);
    },
    snare: function (ctx, dest, t, v) {
      [180, 330].forEach(function (f) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle'; o.frequency.value = f; env(g, t, v * 0.35, 0.12);
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.15);
      });
      var n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g2 = ctx.createGain();
      n.buffer = noise(ctx); hp.type = 'highpass'; hp.frequency.value = 1200 + D.params.tone * 2000;
      env(g2, t, v * 0.5, 0.18); n.connect(hp); hp.connect(g2); g2.connect(dest); n.start(t); n.stop(t + 0.2);
    },
    hat: function (ctx, dest, t, v, open) {
      var bp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter(), g = ctx.createGain(), dec = open ? 0.35 : 0.05;
      bp.type = 'bandpass'; bp.frequency.value = 10000; hp.type = 'highpass'; hp.frequency.value = 7000;
      env(g, t, v * 0.25, dec); bp.connect(hp); hp.connect(g); g.connect(dest);
      HAT_FREQS.forEach(function (f) {
        var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f * 4; // ×4 → Hi-Hat-Lage
        o.connect(bp); o.start(t); o.stop(t + dec + 0.02);
      });
    },
    clap: function (ctx, dest, t, v) {
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.2; bp.connect(dest);
      [0, 0.011, 0.023, 0.034].forEach(function (off, i) { // 4 "Hände", die letzte mit Hallfahne
        var n = ctx.createBufferSource(), g = ctx.createGain(); n.buffer = noise(ctx);
        env(g, t + off, v * 0.6, i === 3 ? 0.2 : 0.01); n.connect(g); g.connect(bp); n.start(t + off); n.stop(t + off + 0.25);
      });
    },
    /* Name aus Strudel/Mini-Notation (bd, sd, hh, oh, cp …) → Stimme. true = gespielt */
    play: function (ctx, dest, kind, t, vol) {
      if (!ctx || !dest) return false;
      var k = String(kind || '').toLowerCase(), v = Math.max(0.05, Math.min(1, (vol || 0.3) * 2.5));
      if (/^(bd|sbd|kick|lt)/.test(k) || k.indexOf('kick') >= 0) D.kick(ctx, dest, t, v);
      else if (/^(sd|snare|rim)/.test(k)) D.snare(ctx, dest, t, v);
      else if (/^(oh)/.test(k)) D.hat(ctx, dest, t, v, true);
      else if (/^(hh|hat|ch)/.test(k)) D.hat(ctx, dest, t, v, false);
      else if (/^(cp|clap)/.test(k)) D.clap(ctx, dest, t, v);
      else return false;
      return true;
    }
  };
  /* Gefahrenschalter mit Sicherungsklappe (schwarz-gelb, CSS .hazard-*) */
  D.arm = function () { D.armed = !D.armed; if (!D.armed) D.overdrive = false; D.refreshUI(); };
  D.fire = function () {
    if (!D.armed) { if (typeof toast === 'function') toast('⚠ Erst die Sicherungsklappe öffnen (SCHARF MACHEN)'); return; }
    D.overdrive = !D.overdrive;
    if (typeof toast === 'function') toast(D.overdrive ? '💥 808 OVERDRIVE AKTIV – Replikatoren zerbröseln. Lautstärke prüfen!' : '808 Overdrive aus');
    D.refreshUI();
  };
  D.refreshUI = function () { if (typeof WM !== 'undefined') WM.refresh('dj'); };
  D.html = function () {
    return '<div class="hazard-box"><div class="hazard-warn">⚠ WARNUNG: Overdrive ist sehr laut und verzerrt. Kopfhörer runterdrehen.</div>' +
      '<button class="hazard-cover ' + (D.armed ? 'open' : '') + '" onclick="DRUM808.arm()">' + (D.armed ? '🔓 SICHERN' : '🔒 SCHARF MACHEN') + '</button> ' +
      '<button class="hazard-fire ' + (D.overdrive ? 'on' : '') + '" ' + (D.armed ? '' : 'disabled') + ' onclick="DRUM808.fire()">💥 808 DRÜCKT</button></div>';
  };
  if (typeof globalThis !== 'undefined') globalThis.DRUM808 = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})();
