/* =====================================================================
   SGC Command · music-events.js (v0.32) – Songs an Spielereignisse binden
   Tabelle EVENT_MUSIC: Ereignis → Track (+ optional Mutationsstärke).
   Neue Bindungen = eine Zeile in der Tabelle. Planeten können eigene
   Tracks haben (planet:<id>), sonst gilt planet:*.

   NEUE TRACKS (alle Eigenkompositionen!):
   Die New-Order-Wünsche ("Blue Monday", "Confusion") sind urheberrechtlich
   geschützt; Melodien/Basslinien 1:1 nachzubauen wäre eine Kopie. Darum:
   Tracks IM STIL (Tempo, Instrumentierung, Groove-Prinzip), aber mit
   eigenen Noten. So bleibt das Projekt AGPL-sauber.
   ===================================================================== */
(function () {
  'use strict';
  var NEW_TRACKS = {
    evt_monday_gate: { name: 'Monday Gate (Synth-Pop 1983 Style)', artist: 'SGC Core', role: 'gate',
      code: `// Monday Gate – Stil-Hommage: 130 BPM, stotternde 16tel-Kick, Oktav-Bass, kalte Pads (eigene Noten)
setCpm(130/4)
const drive = slider(0.6)
const cut = slider(1800, 300, 6000)
$KICK: s("bd*4, [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ bd bd bd bd]/4").bank('tr808').gain(.9)
$SNARE: s("~ sd ~ sd").bank('tr808').gain(.6)
$HAT: s("hh*8").bank('tr808').gain(.25)
$BASS: note("<e2 e3 e2 e3>*4 <c2 c3>*2 <d2 d3>*2").s("sawtooth").lpf(cut).lpq(6).decay(.15).sustain(0).gain(drive)
$PAD: note("<[e3,g3,b3] [c3,e3,g3] [d3,f#3,a3] [b2,d3,f#3]>").s("square").lpf(1200).attack(.4).release(1).room(.5).gain(.15)` },
    evt_confusion_protocol: { name: 'Confusion Protocol (Electro-Freestyle Style)', artist: 'SGC Core', role: 'combat',
      code: `// Confusion Protocol – Electro/Freestyle-Hommage (808, Orchesterhits-Ersatz, eigene Noten)
setCpm(118/4)
const energy = slider(0.7)
$KICK: s("bd ~ ~ bd ~ ~ bd ~").bank('tr808')
$CLAP: s("~ cp ~ cp").bank('tr808').room(.3)
$HAT: s("hh*16").bank('tr808').gain(perlin.range(.1,.35))
$BASS: note("a1 ~ a1 a2 ~ g1 ~ c2").s("sawtooth").lpf(energy.mul(3000).add(300)).decay(.12).sustain(0)
$STAB: note("<[a3,c4,e4] ~ ~ [g3,b3,d4]>").s("supersaw").decay(.2).sustain(0).gain(energy.mul(.4))` },
    evt_kawoosh_trance: { name: 'Kawoosh (Trance 1999 Style)', artist: 'SGC Core', role: 'map',
      code: `// Kawoosh – Ende-90er-Trance: Offbeat-Bass, Supersaw-Gate (eigene Noten)
setCpm(138/4)
const open = slider(0.5)
$KICK: s("sbd*4").duck("3:4").duckdepth(.7)
$BASS: note("~ f2 ~ f2 ~ f2 ~ f2").s("sawtooth").lpf(800).decay(.1).sustain(0).o(3)
$LEAD: note("<f4 a4 c5 a4>*4").s("supersaw").lpf(open.mul(5000).add(500)).trancegate(1.5,45,1).room(.6).o(4).gain(.4)
$OH: s("~ oh ~ oh ~ oh ~ oh").bank('tr909').gain(.3)` },
    evt_pegasus_bigbeat: { name: 'Pegasus Breaks (Big Beat 2004 Style)', artist: 'SGC Core', role: 'boss',
      code: `// Pegasus Breaks – Big-Beat-Hommage (Atlantis-Ära): Breakbeat + verzerrter Bass (eigene Noten)
setCpm(132/4)
const dirt = slider(0.4)
$BREAK: s("bd ~ sd ~ ~ bd sd ~, hh*8").bank('tr909').gain(.8)
$BASS: note("<d2 [d2 f2] g1 [a1 c2]>*2").s("sawtooth").distort(dirt.mul(4)).lpf(1400).decay(.2).sustain(.3).gain(.5)
$SIREN: note("<d5 c5>/2").s("sine").vib("4:.5").gain(.08).room(.4)` }
  };
  /* Vollversion von "In The Beginning": gleicher Switch-Angel-Code, aber
     mit Sample-Nachladen + Zwang zur echten Strudel-Engine (der interne
     Fallback-Synth erzeugt daraus nur den bekannten "Aufzug-Ping"-Loop,
     der als Hintergrund-Loop unter dem alten Key erhalten bleibt). */
  var SAMPLE_PRELUDE = "samples('github:tidalcycles/dirt-samples')\nsamples('github:ritchse/tidal-drum-machines/main/machines')\n";
  if (typeof STRUDEL_TRACKS !== 'undefined') {
    Object.keys(NEW_TRACKS).forEach(function (k) { STRUDEL_TRACKS[k] = NEW_TRACKS[k]; if (STRUDEL.patterns) STRUDEL.patterns[k] = NEW_TRACKS[k].code; });
    var itb = STRUDEL_TRACKS.sa_in_the_beginning;
    if (itb) STRUDEL_TRACKS.sa_in_the_beginning_full = { name: 'In The Beginning (Full · Switch Angel)', artist: 'Switch Angel', role: 'gate', requireWeb: true, code: SAMPLE_PRELUDE + itb.code };
  }

  var EVENT_MUSIC = {
    'gate.dial':       { track: 'evt_kawoosh_trance' },
    'mission.start':   { track: 'evt_monday_gate' },
    'combat.start':    { track: 'evt_confusion_protocol' },
    'combat.boss':     { track: 'evt_pegasus_bigbeat', mutate: 0.3 },
    'planet:abydos':   { track: 'sa_in_the_beginning_full' },
    'planet:chulak':   { track: 'evt_confusion_protocol', mutate: 0.5 },
    'planet:*':        { track: 'evt_kawoosh_trance', mutate: 0.25 }
  };
  var ME = {
    table: EVENT_MUSIC, tracks: NEW_TRACKS,
    /* Ereignis auslösen. Respektiert manuelle Songwahl (nur im Auto-Modus). */
    trigger: function (ev) {
      var e = EVENT_MUSIC[ev] || (ev.indexOf('planet:') === 0 ? EVENT_MUSIC['planet:*'] : null);
      if (!e || typeof STRUDEL === 'undefined' || STRUDEL.mode !== 'auto' || !STRUDEL_TRACKS[e.track]) return false;
      if (STRUDEL.currentTrack === e.track) return false;
      STRUDEL.currentTrack = e.track;
      var code = STRUDEL_TRACKS[e.track].code; if (e.mutate) code = STRUDEL.mutateCode(code, e.mutate);
      try { STRUDEL.evaluate(code, typeof SFX !== 'undefined' && !SFX.muted && SFX.musicEnabled); } catch (x) { }
      return true;
    }
  };
  globalThis.MUSIC_EVENTS = ME;
  /* Einhängen in vorhandene Spielfunktionen (Wrapper, keine Umbauten) */
  if (typeof discover === 'function') { var d = discover; globalThis.discover = function (id) { var r = d.apply(this, arguments); ME.trigger('planet:' + id); return r; }; }
  if (typeof SFX !== 'undefined' && SFX.gate) { var g = SFX.gate; SFX.gate = function () { ME.trigger('gate.dial'); return g.apply(this, arguments); }; }
})();
