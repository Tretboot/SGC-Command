/* =====================================================================
   SGC Command · sliders.js (v0.32) – Live-Slider für Strudel-Songs
   Problem vorher: window.slider(v) gab nur pure(v) zurück → ein fester
   Wert, nicht veränderbar, nicht MIDI-fähig.
   Lösung: Jeder slider()-Aufruf im Songcode bekommt eine laufende ID
   (Reihenfolge im Code). Zurückgegeben wird Strudels ref(() => wert):
   Strudel liest den Wert bei JEDEM Event neu → Änderungen am Regler
   (Maus oder MIDI) wirken sofort, ohne den Song neu zu evaluieren.
   Zusätzlich gibt es 4 globale "SGC-Mixer"-Slider (Master-Filter usw.),
   die bei JEDEM Song funktionieren, auch wenn der Song keine hat.
   ===================================================================== */
(function () {
  'use strict';
  var SL = {
    list: [],      // [{id, label, value, min, max}] – vom aktuellen Song
    _idx: 0,
    /* Vor jeder Evaluierung aufrufen: IDs von vorn zählen, alte Werte behalten,
       falls derselbe Song erneut läuft (sonst springen Regler zurück). */
    beginEval: function (code) {
      var sameSong = SL._lastCode && SL._lastCode.slice(0, 200) === String(code).slice(0, 200);
      if (!sameSong) SL.list = [];
      SL._lastCode = String(code); SL._idx = 0;
      // Labels aus "const name = slider(...)" ziehen → lesbare Reglernamen
      SL._labels = []; var re = /(?:const|let|var)\s+(\w+)\s*=\s*slider\(/g, m;
      while ((m = re.exec(code))) SL._labels.push(m[1]);
    },
    /* Ersatz für Strudels slider(value, min=0, max=1) */
    make: function (v, min, max) {
      var id = SL._idx++;
      if (!SL.list[id]) SL.list[id] = { id: id, label: (SL._labels && SL._labels[id]) || ('slider ' + (id + 1)),
        value: v === undefined ? 0.5 : Number(v), min: min === undefined ? 0 : min, max: max === undefined ? Math.max(1, v || 0) : max };
      var st = typeof window !== 'undefined' && window.strudel;
      if (st && typeof st.ref === 'function') return st.ref(function () { return SL.list[id].value; });
      return SL.list[id].value; // Fallback-Synth / Node-Test: fester Wert
    },
    set: function (id, v) {
      var s = SL.list[id]; if (!s) return;
      s.value = Math.max(s.min, Math.min(s.max, Number(v)));
      var el = document.getElementById('sgc-sl-' + id); if (el && Number(el.value) !== s.value) el.value = s.value;
      var o = document.getElementById('sgc-slv-' + id); if (o) o.textContent = s.value.toFixed(2);
    },
    /* Panel-HTML: eigene Song-Slider + MIDI-Learn-Knopf pro Regler */
    html: function () {
      if (!SL.list.length) return '<div class="sgc-muted">Dieser Song hat keine eigenen Slider. Die Mixer-Regler (🎚 DJ) funktionieren immer.</div>';
      return SL.list.map(function (s) {
        return '<div class="sgc-slrow"><label>' + s.label + '</label>' +
          '<input type="range" id="sgc-sl-' + s.id + '" min="' + s.min + '" max="' + s.max + '" step="' + ((s.max - s.min) / 200) + '" value="' + s.value + '" oninput="SGC_SLIDERS.set(' + s.id + ',this.value)">' +
          '<span id="sgc-slv-' + s.id + '">' + s.value.toFixed(2) + '</span>' +
          '<button class="small" title="MIDI Learn: Knopf klicken, dann Drehregler bewegen" onclick="SGC_SLIDERS.learn(' + s.id + ')">🎛 Learn</button></div>';
      }).join('');
    },
    learn: function (id) {
      var s = SL.list[id]; if (!s || typeof SGC_MIDI === 'undefined') return;
      SGC_MIDI.startLearn('slider:' + id, s.label, s.min, s.max, '');
      if (typeof toast === 'function') toast('🎛 MIDI Learn: jetzt einen Regler am Controller bewegen → ' + s.label);
    },
    /* Ohne Learn: die ersten 8 Song-Slider automatisch auf Akai-Knobs 1–8 legen,
       wenn der Nutzer das will (Knopf "Auto-Map" im Panel). */
    autoMap: function () {
      if (typeof SGC_MIDI === 'undefined') return;
      SL.list.slice(0, 8).forEach(function (s, i) {
        [70 + i, 1 + i].forEach(function (cc) { SGC_MIDI.bindings[cc] = { param: 'slider:' + s.id, label: s.label, min: s.min, max: s.max, unit: '' }; });
      });
      try { localStorage.setItem('sgc_midi_bindings', JSON.stringify(SGC_MIDI.bindings)); } catch (e) { }
      if (typeof toast === 'function') toast('🎛 ' + Math.min(8, SL.list.length) + ' Song-Slider auf Knobs 1–8 gelegt');
    }
  };
  globalThis.SGC_SLIDERS = SL;

  /* --- Einhängen, ohne sound.js umzuschreiben (Wrapper-Muster) --- */
  function hook() {
    if (typeof STRUDEL === 'undefined') return;
    var origEval = STRUDEL.evaluate;
    STRUDEL.evaluate = function (code, autoplay) { SL.beginEval(code || ''); if (typeof WM !== 'undefined') WM.refresh('sliders'); return origEval.call(this, code, autoplay); };
    var origInit = STRUDEL.ensureWebRepl;
    STRUDEL.ensureWebRepl = function () {
      return origInit.apply(this, arguments).then(function (repl) {
        // sound.js setzt slider = pure(v); hier ersetzen wir es durch die Live-Variante
        if (typeof window !== 'undefined') {
          window.slider = SL.make; window.sliderWithID = function (_id, v, a, b) { return SL.make(v, a, b); };
          try { window.strudel.evalScope({ slider: SL.make, sliderWithID: window.sliderWithID }); } catch (e) { }
        }
        return repl;
      });
    };
    if (typeof SGC_MIDI !== 'undefined') {
      var origApply = SGC_MIDI.applyParameter;
      SGC_MIDI.applyParameter = function (param, val, norm) {
        if (String(param).indexOf('slider:') === 0) return SL.set(Number(param.slice(7)), val);
        if (String(param).indexOf('dj:') === 0 && typeof SOUND_STYLES !== 'undefined') return SOUND_STYLES.setMixer(param.slice(3), val);
        return origApply.call(this, param, val, norm);
      };
    }
  }
  hook();
})();
