/* =====================================================================
   SGC Command · sound-styles.js (v0.32) – "DJ"-Klangstile
   Idee: Jeder Grafikmodus hat einen eigenen Klangcharakter. Beim Umschalten
   macht der Master-Filter einen kurzen DJ-Sweep (Filter zu → neuer Stil auf).
   Technik: Zwischen SFX.master und SFX.analyser hängt eine kleine Kette
      master → hp (Hochpass) → lp (Tiefpass) → crush (WaveShaper) → analyser
   Alles in Web Audio, keine Samples. Die Kette sitzt VOR dem Analyser,
   damit das Oszilloskop den Stil auch zeigt.
   ===================================================================== */
(function () {
  'use strict';
  var STYLES = {
    clean:     { name: '✨ Clean',         hp: 20,  lp: 20000, q: 0.7, crush: 0 },
    chiptune:  { name: '👾 8-Bit',          hp: 120, lp: 7000,  q: 1.0, crush: 0.5 },
    tape:      { name: '📼 VHS-Tape 1997', hp: 40,  lp: 4200,  q: 0.9, crush: 0.15 },
    radio:     { name: '📻 Funk (Radio)',   hp: 500, lp: 3200,  q: 2.5, crush: 0.25 },
    underwater:{ name: '🌊 Unterwasser',    hp: 20,  lp: 650,   q: 4.0, crush: 0 },
    wormhole:  { name: '🌀 Wurmloch',       hp: 60,  lp: 2500,  q: 9.0, crush: 0.1, lfo: true },
    club:      { name: '🔊 Club (Bass+)',   hp: 25,  lp: 16000, q: 0.7, crush: 0.05, bass: 6 }
  };
  var GFX_DEFAULT = { pixel: 'clean', ascii: 'chiptune', topdown: 'tape' }; // Grafik → Stil
  function curve(amount) { // weiche Sättigung; amount 0 = linear (aus)
    var n = 1024, c = new Float32Array(n), k = amount * 60;
    for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = k ? (1 + k) * x / (1 + k * Math.abs(x)) : x; }
    return c;
  }
  var SS = {
    styles: STYLES, gfxMap: GFX_DEFAULT, current: 'clean', nodes: null,
    mixer: { cutoff: 1, res: 0, drive: 0, width: 1 }, // DJ-Regler 0..1 (multiplizieren den Stil)
    ensure: function () {
      if (SS.nodes || typeof SFX === 'undefined' || !SFX.ctx || !SFX.master || !SFX.analyser) return SS.nodes;
      var c = SFX.ctx, n = { hp: c.createBiquadFilter(), lp: c.createBiquadFilter(), bass: c.createBiquadFilter(), crush: c.createWaveShaper(), lfo: c.createOscillator(), lfoGain: c.createGain() };
      n.hp.type = 'highpass'; n.lp.type = 'lowpass'; n.bass.type = 'lowshelf'; n.bass.frequency.value = 90;
      n.lfo.frequency.value = 0.15; n.lfoGain.gain.value = 0; n.lfo.connect(n.lfoGain); n.lfoGain.connect(n.lp.frequency); n.lfo.start();
      try { SFX.master.disconnect(SFX.analyser); } catch (e) { try { SFX.master.disconnect(); } catch (e2) { } }
      SFX.master.connect(n.hp); n.hp.connect(n.bass); n.bass.connect(n.lp); n.lp.connect(n.crush); n.crush.connect(SFX.analyser);
      SS.nodes = n; return n;
    },
    /* Stil anwenden; sweep=true → hörbarer DJ-Übergang (0,6 s) */
    apply: function (key, sweep) {
      var s = STYLES[key]; if (!s) return; SS.current = key;
      try { localStorage.setItem('sgc_sound_style', key); } catch (e) { }
      var n = SS.ensure(); if (!n) return;
      var t = SFX.ctx.currentTime, lp = Math.max(200, s.lp * (0.05 + 0.95 * SS.mixer.cutoff));
      if (sweep) { n.lp.frequency.cancelScheduledValues(t); n.lp.frequency.setValueAtTime(n.lp.frequency.value, t);
        n.lp.frequency.exponentialRampToValueAtTime(300, t + 0.25); n.lp.frequency.exponentialRampToValueAtTime(lp, t + 0.6); }
      else n.lp.frequency.setTargetAtTime(lp, t, 0.05);
      n.lp.Q.setTargetAtTime(s.q + SS.mixer.res * 14, t, 0.05);
      n.hp.frequency.setTargetAtTime(s.hp, t, 0.05);
      n.bass.gain.setTargetAtTime(s.bass || 0, t, 0.05);
      n.crush.curve = curve(Math.min(1, s.crush + SS.mixer.drive));
      n.lfoGain.gain.setTargetAtTime(s.lfo ? lp * 0.6 : 0, t, 0.1);
      var sel = document.getElementById('sgc-style-sel'); if (sel) sel.value = key;
    },
    setMixer: function (k, v) { SS.mixer[k] = Number(v); SS.apply(SS.current, false); },
    html: function () {
      var opts = Object.keys(STYLES).map(function (k) { return '<option value="' + k + '"' + (k === SS.current ? ' selected' : '') + '>' + STYLES[k].name + '</option>'; }).join('');
      function knob(k, label) { return '<div class="sgc-slrow"><label>' + label + '</label><input type="range" min="0" max="1" step="0.01" value="' + SS.mixer[k] + '" oninput="SOUND_STYLES.setMixer(\'' + k + '\',this.value)"><button class="small" onclick="SGC_MIDI&&SGC_MIDI.startLearn(\'dj:' + k + '\',\'' + label + '\',0,1,\'\')">🎛 Learn</button></div>'; }
      return (typeof DRUM808 !== 'undefined' && DRUM808.html ? DRUM808.html() : '') + '<div class="sgc-slrow"><label>Stil</label><select id="sgc-style-sel" onchange="SOUND_STYLES.apply(this.value,true)">' + opts + '</select></div>' +
        knob('cutoff', 'DJ-Filter') + knob('res', 'Resonanz') + knob('drive', 'Drive') +
        '<div class="sgc-muted">Grafikmodus wechselt automatisch: Pixel → Clean, ASCII → 8-Bit, 2D → VHS-Tape.</div>';
    }
  };
  globalThis.SOUND_STYLES = SS;
  try { var saved = localStorage.getItem('sgc_sound_style'); if (saved && STYLES[saved]) SS.current = saved; } catch (e) { }
  /* Grafikmodus-Wechsel → passender Klangstil mit Sweep */
  if (typeof setGfxMode === 'function') {
    var orig = setGfxMode;
    globalThis.setGfxMode = function (mode) { var r = orig.apply(this, arguments); SS.apply(GFX_DEFAULT[mode] || 'clean', true); return r; };
  }
})();
