/* =====================================================================
   SGC Command · midi-out.js (v0.33) – Bass/Melodie an externe Synths
   Web MIDI API (Chrome/Edge; Firefox mit Freigabe; Safari: nein).
   Spiegelt die Noten, die Strudel spielt (STRUDEL.onVoiceTrigger), an
   einen MIDI-Ausgang. Standard Kanal 1 – darauf hören fast alle
   Kleinsynths ab Werk (Behringer TD-3/Crave/Model D, Korg Volca).
   Timing: Events kommen kurz vor dem Erklingen; zum Jammen reicht das.
   Später: MIDI-Clock (0xF8) für exakte Sync (siehe SPEC-MIDI-OUT.md).
   ===================================================================== */
(function () {
  'use strict';
  var MO = { access: null, out: null, channel: 0, voices: { bass: true, melody: false }, enabled: false };
  MO.init = function () {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) { if (typeof toast === 'function') toast('Dieser Browser kann kein Web MIDI (Chrome/Edge nutzen).'); return Promise.resolve(null); }
    return navigator.requestMIDIAccess({ sysex: false }).then(function (a) {
      MO.access = a; MO.out = Array.from(a.outputs.values())[0] || null;
      a.onstatechange = MO.refresh; MO.refresh(); return a;
    });
  };
  MO.select = function (id) { if (MO.access) MO.out = MO.access.outputs.get(id) || null; };
  MO.note = function (midi, ms) {
    if (!MO.enabled || !MO.out) return;
    var n = Math.max(0, Math.min(127, Math.round(midi))), ch = MO.channel & 15;
    MO.out.send([0x90 | ch, n, 100]);                                  // Note On (Velocity 100)
    MO.out.send([0x80 | ch, n, 0], performance.now() + (ms || 140));   // Note Off, vom Browser zeitversetzt
  };
  MO.panic = function () { if (MO.out) for (var c = 0; c < 16; c++) MO.out.send([0xB0 | c, 123, 0]); }; // CC123 = All Notes Off
  MO.html = function () {
    var outs = MO.access ? Array.from(MO.access.outputs.values()) : [];
    var sel = outs.map(function (o) { return '<option value="' + o.id + '"' + (MO.out && MO.out.id === o.id ? ' selected' : '') + '>' + o.name + '</option>'; }).join('');
    return (MO.access ? '' : '<button class="small" onclick="MIDI_OUT.init()">🔌 MIDI-Geräte suchen</button>') +
      (outs.length ? '<div class="sgc-slrow"><label>Ausgang</label><select onchange="MIDI_OUT.select(this.value)">' + sel + '</select></div>' : (MO.access ? '<div class="sgc-muted">Kein MIDI-Ausgang gefunden. Gerät per USB anschließen.</div>' : '')) +
      '<div class="sgc-slrow"><label>Kanal</label><input type="number" min="1" max="16" value="' + (MO.channel + 1) + '" onchange="MIDI_OUT.channel=this.value-1"></div>' +
      '<label><input type="checkbox" ' + (MO.enabled ? 'checked' : '') + ' onchange="MIDI_OUT.enabled=this.checked"> Senden</label> ' +
      '<label><input type="checkbox" ' + (MO.voices.bass ? 'checked' : '') + ' onchange="MIDI_OUT.voices.bass=this.checked"> Bass</label> ' +
      '<label><input type="checkbox" ' + (MO.voices.melody ? 'checked' : '') + ' onchange="MIDI_OUT.voices.melody=this.checked"> Melodie</label> ' +
      '<button class="small" onclick="MIDI_OUT.panic()">⛔ Panic</button>' +
      '<details class="sgc-muted"><summary>💡 Geräte-Tipps</summary><ul>' +
      '<li><b>Behringer TD-3 / Crave / Model D:</b> USB anschließen, ab Werk Kanal 1 → sofort spielbar. Pattern dauerhaft im Gerät speichern: am Gerät „Pattern Write“-Modus (Handbuch).</li>' +
      '<li><b>Korg Volca Keys/Bass:</b> kein USB-MIDI → USB-MIDI-Kabel an MIDI IN, ab Werk Kanal 1. Aufnehmen: REC drücken, während das Spiel Noten sendet; dann per MEMORY speichern.</li>' +
      '<li>Hängende Töne → ⛔ Panic.</li></ul></details>';
  };
  MO.refresh = function () { if (typeof WM !== 'undefined') WM.refresh('midiout'); };
  MO.open = function () { WM.open('midiout', '🔌 MIDI OUT · Externe Synths', MO.html, { x: 440, y: 90, w: 380, h: 300 }); };
  if (typeof STRUDEL !== 'undefined') {
    var o = STRUDEL.onVoiceTrigger;
    STRUDEL.onVoiceTrigger = function (voice, midi) { if (MO.voices[voice]) MO.note(midi); return o.apply(this, arguments); };
  }
  globalThis.MIDI_OUT = MO;
})();
