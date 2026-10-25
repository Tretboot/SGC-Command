/* =====================================================================
   SGC Command · fx-pad.js (v0.34) – Master-FX-Patchfeld mit XY-Pad
   Wie das XY-Feld in FL Studio / Kaoss Pad: mit der Maus ziehen →
     X = Filter-Cutoff (links dumpf, rechts offen)
     Y = Resonanz (oben = pfeifend)
   Darunter Patch-Taster (an/aus): ECHO, HALL, DRIVE, BASS-KILL, TAPE-STOP.
   Signalweg (hinter sound-styles.js):
     crush ─┬─ dry ────────────────┐
            ├─ echoSend → delay⟲fb ┼→ analyser → Lautsprecher
            └─ hallSend → convolver┘
   Der Hall nutzt eine berechnete Impulsantwort (abklingendes Rauschen),
   also keine Sample-Datei nötig.
   ===================================================================== */
(function () {
  'use strict';
  var FX = { on: { echo: false, hall: false, drive: false, bkill: false, tape: false }, xy: { x: 1, y: 0 }, n: null };
  function impulse(ctx, sec, decay) { // Hall-IR: Stereo-Rauschen, exponentiell abklingend
    var len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = b.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  FX.ensure = function () {
    if (FX.n) return FX.n;
    var base = typeof SOUND_STYLES !== 'undefined' && SOUND_STYLES.ensure(); if (!base) return null;
    var c = SFX.ctx, n = { dry: c.createGain(), echoSend: c.createGain(), delay: c.createDelay(2), fb: c.createGain(), hallSend: c.createGain(), conv: c.createConvolver() };
    n.delay.delayTime.value = 60 / 130 * 0.75; n.fb.gain.value = 0.45; n.conv.buffer = impulse(c, 2.8, 2.5);
    n.echoSend.gain.value = 0; n.hallSend.gain.value = 0;
    try { base.crush.disconnect(); } catch (e) { }
    base.crush.connect(n.dry); n.dry.connect(SFX.analyser);
    base.crush.connect(n.echoSend); n.echoSend.connect(n.delay); n.delay.connect(n.fb); n.fb.connect(n.delay); n.delay.connect(SFX.analyser);
    base.crush.connect(n.hallSend); n.hallSend.connect(n.conv); n.conv.connect(SFX.analyser);
    FX.n = n; return n;
  };
  FX.apply = function () {
    var n = FX.ensure(); if (!n) return; var t = SFX.ctx.currentTime, SS = SOUND_STYLES;
    n.echoSend.gain.setTargetAtTime(FX.on.echo ? 0.5 : 0, t, 0.05);
    n.hallSend.gain.setTargetAtTime(FX.on.hall ? 0.6 : 0, t, 0.08);
    SS.mixer.cutoff = FX.xy.x; SS.mixer.res = FX.xy.y; SS.mixer.drive = FX.on.drive ? 0.7 : 0;
    SS.apply(SS.current, false);
    if (SS.nodes) SS.nodes.hp.frequency.setTargetAtTime(FX.on.bkill ? 300 : (SS.styles[SS.current].hp || 20), t, 0.05); // Bass-Kill = DJ-EQ-Trick
  };
  FX.toggle = function (k) {
    FX.on[k] = !FX.on[k];
    if (k === 'tape' && FX.on.tape && SFX.ctx) { // Tape-Stop: Tonhöhe/Tempo fallen ab wie ein stoppendes Band (Filter + Lautstärke)
      var m = SFX.master.gain, t = SFX.ctx.currentTime, v = m.value; m.cancelScheduledValues(t); m.setValueAtTime(v, t); m.linearRampToValueAtTime(0.0001, t + 0.8); m.linearRampToValueAtTime(v, t + 1.6);
      setTimeout(function () { FX.on.tape = false; WM.refresh('fxpad'); }, 1600);
    }
    FX.apply(); WM.refresh('fxpad');
  };
  FX.html = function () {
    var pads = [['echo', '🔁 ECHO'], ['hall', '⛪ HALL'], ['drive', '🔥 DRIVE'], ['bkill', '🔇 BASS-KILL'], ['tape', '📼 TAPE-STOP']];
    return '<canvas id="fx-xy" class="fx-xy" width="300" height="180"></canvas>' +
      '<div class="fx-pads">' + pads.map(function (p) { return '<button class="fx-pad ' + (FX.on[p[0]] ? 'on' : '') + '" onclick="FX_PAD.toggle(\'' + p[0] + '\')">' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div class="sgc-muted">Ziehen: X = Filter · Y = Resonanz. Doppelklick = zurück auf neutral.</div>';
  };
  FX.drawXY = function () {
    var cv = document.getElementById('fx-xy'); if (!cv) return;
    var g = cv.getContext('2d'), w = cv.width = cv.clientWidth || 300, h = cv.height = cv.clientHeight || 180;
    g.fillStyle = '#030803'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(124,252,138,.15)';
    for (var i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); }
    var px = FX.xy.x * w, py = (1 - FX.xy.y) * h;
    g.strokeStyle = '#7CFC8a'; g.beginPath(); g.moveTo(px, 0); g.lineTo(px, h); g.moveTo(0, py); g.lineTo(w, py); g.stroke();
    g.fillStyle = '#b6ff9a'; g.beginPath(); g.arc(px, py, 7, 0, 7); g.fill();
    g.fillStyle = '#3c8c3c'; g.font = '10px monospace'; g.fillText('CUTOFF →', w - 62, h - 6); g.fillText('↑ RESO', 4, 12);
    if (!cv._bound) { cv._bound = true;
      var set = function (e) { var r = cv.getBoundingClientRect(); FX.xy.x = Math.max(0.02, Math.min(1, (e.clientX - r.left) / r.width)); FX.xy.y = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)); FX.apply(); FX.drawXY(); };
      cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); set(e); cv.onpointermove = set; });
      cv.addEventListener('pointerup', function () { cv.onpointermove = null; });
      cv.addEventListener('dblclick', function () { FX.xy = { x: 1, y: 0 }; FX.apply(); FX.drawXY(); });
    }
  };
  FX.open = function () {
    WM.open('fxpad', '🎛 MASTER FX · XY-PAD', function () { setTimeout(FX.drawXY, 0); return FX.html(); }, { x: 460, y: 400, w: 340, h: 320, onResize: function () { FX.drawXY(); } });
  };
  globalThis.FX_PAD = FX;
})();
