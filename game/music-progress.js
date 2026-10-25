/* =====================================================================
   SGC Command · music-progress.js (v0.31)
   1) Freischaltung der Switch-Angel-Songs über entdeckte Planeten.
      Zum Start sind nur STARTER frei; jeder entdeckte Planet schaltet
      deterministisch einen weiteren Song frei (Reihenfolge = PLANETS).
   2) Dynamische Kampfmusik: erster Schuss → leichte Mutation, Verwundung
      eines eigenen Mitglieds → starke Mutation (mehr Dichte/Drums).
      Gedrosselt (min. 8 s), damit die Musik nicht "flattert".
   ===================================================================== */
(function () {
  'use strict';
  var STARTER = ['sa_lets_talk', 'sa_curiosity_piano', 'sa_in_the_beginning', 'sa_909workout'];
  var MP = {
    starter: STARTER,
    /* Liefert {trackKey: planetId} für alle nicht-Starter-Songs */
    planetMap: function () {
      var map = {}, tracks = Object.keys(typeof STRUDEL_TRACKS !== 'undefined' ? STRUDEL_TRACKS : {})
        .filter(function (k) { return k.indexOf('sa_') === 0 && STARTER.indexOf(k) < 0; });
      var planets = Object.keys(typeof PLANETS !== 'undefined' ? PLANETS : {}).filter(function (id) { return !PLANETS[id].sgc; });
      tracks.forEach(function (t, i) { if (planets.length) map[t] = planets[i % planets.length]; });
      return map;
    },
    isUnlocked: function (key) {
      if (STARTER.indexOf(key) >= 0) return true;
      var pid = MP.planetMap()[key];
      try { return !!(pid && S && S.planets && S.planets[pid] && S.planets[pid].disc); } catch (e) { return true; }
    },
    filter: function (list) { return list.filter(MP.isUnlocked); },
    /* ---- Kampf-Dynamik ---- */
    _last: 0, _stage: 0,
    resetCombat: function () { MP._stage = 0; MP._last = 0; },
    onCombatEvent: function (type) {
      if (typeof STRUDEL === 'undefined' || !STRUDEL.dynamicEnabled || STRUDEL.mode !== 'auto') return;
      var stage = type === 'wound' ? 2 : 1, now = Date.now();
      if (stage <= MP._stage && now - MP._last < 8000) return; // keine Eskalation → drosseln
      MP._stage = Math.max(MP._stage, stage); MP._last = now;
      var tr = STRUDEL_TRACKS[STRUDEL.currentTrack]; if (!tr) return;
      var code = STRUDEL.mutateCode(tr.code, stage === 2 ? 0.85 : 0.45);
      try { STRUDEL.evaluate(code, typeof SFX !== 'undefined' && !SFX.muted && SFX.musicEnabled); } catch (e) { }
    }
  };
  if (typeof globalThis !== 'undefined') globalThis.MUSIC_PROGRESS = MP;
})();
