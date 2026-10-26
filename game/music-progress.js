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
  var STARTER = [];
  var MP = {
    starter: STARTER,
    /* Liefert {trackKey: planetId} für alle Codevault-Songs */
    planetMap: function () {
      var map = {}, tracks = Object.keys(typeof STRUDEL_TRACKS !== 'undefined' ? STRUDEL_TRACKS : {})
        .filter(function (k) { return k.indexOf('sa_') === 0; });
      var planets = Object.keys(typeof PLANETS !== 'undefined' ? PLANETS : {}).filter(function (id) { return !PLANETS[id].sgc; });
      tracks.forEach(function (t, i) { if (planets.length) map[t] = planets[i % planets.length]; });
      return map;
    },
    isUnlocked: function (key) {
      if (typeof S !== 'undefined' && S && Array.isArray(S.unlockedTracks) && S.unlockedTracks.indexOf(key) >= 0) return true;
      return false;
    },
    unlockForPlanet: function (planetId, silent) {
      var map = MP.planetMap();
      var unlockedAny = false;
      Object.keys(map).forEach(function (tKey) {
        if (map[tKey] === planetId && !MP.isUnlocked(tKey) && typeof unlockTrack === 'function') {
          if (unlockTrack(tKey, !!silent)) unlockedAny = true;
        }
      });
      if (!unlockedAny) {
        var nextKey = Object.keys(map).find(function (tKey) { return !MP.isUnlocked(tKey); });
        if (nextKey && typeof unlockTrack === 'function') unlockTrack(nextKey, !!silent);
      }
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
