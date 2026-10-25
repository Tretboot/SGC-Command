/* =====================================================================
   SGC Command · quotes.js (v0.33) – Situations-Funksprüche
   Kurze, bekannte Serienzeilen (Fan-Favoriten aus r/Stargate-Threads)
   als Funk-Einblendung. Nur Kurzzitate mit Sprecher, keine Skripte.
   Situationen: combat.start | combat.win | combat.wound | gate | base.day | any
   Neue Zeile = ein Objekt. Fehlt 'de', wird 'en' gezeigt.
   ===================================================================== */
(function () {
  'use strict';
  var Q = [
    { s: 'combat.wound', who: "Teal'c", en: 'I am leaving. You are about to explode.', de: 'Ich gehe. Ihr werdet gleich explodieren.' },
    { s: 'combat.start', who: "Teal'c / O'Neill", en: "“Are you considering the same tactic as I?” – “Teal'c, the cliché is ‘Are you thinking what I'm thinking?’ And the answer's yes.”", de: '„Erwägst du dieselbe Taktik wie ich?“ – „Teal’c, das Klischee heißt ‚Denkst du, was ich denke?‘ Und: ja.“' },
    { s: 'combat.win', who: "Bra'tac / Teal'c", en: "“We die well, Teal'c.” – “Better than that, old friend. We die free.”", de: '„Wir sterben gut, Teal’c.“ – „Besser noch, alter Freund. Wir sterben frei.“' },
    { s: 'any', who: "Teal'c", en: 'Indeed.', de: 'In der Tat.' },
    { s: 'combat.start', who: 'Jaffa', en: 'Jaffa, kree!', de: 'Jaffa, kree!' },
    { s: 'gate', who: 'Walter Harriman', en: 'Chevron seven locked.', de: 'Chevron sieben aktiviert.' },
    { s: 'gate', who: 'Walter Harriman', en: 'Unscheduled offworld activation!', de: 'Unplanmäßige Aktivierung von außen!' },
    { s: 'base.day', who: "Jack O'Neill", en: 'For crying out loud.', de: 'Herrgott noch mal.' }
  ];
  var QU = {
    list: Q,
    pick: function (sit) { var p = Q.filter(function (q) { return q.s === sit || q.s === 'any'; }); return p.length ? p[Math.floor(Math.random() * p.length)] : null; },
    say: function (sit, chance) {
      if (Math.random() > (chance === undefined ? 1 : chance)) return;
      var q = QU.pick(sit); if (!q) return;
      var lang = (typeof I18N !== 'undefined' && I18N.lang) || 'de';
      if (typeof toast === 'function') toast('📻 ' + q.who + ': ' + (q[lang] || q.en));
    }
  };
  globalThis.SGC_QUOTES = QU;
  if (typeof startCombat === 'function') { var sc = startCombat; globalThis.startCombat = function () { var r = sc.apply(this, arguments); setTimeout(function () { QU.say('combat.start', 0.6); }, 1500); return r; }; }
  if (typeof MUSIC_PROGRESS !== 'undefined') { var ce = MUSIC_PROGRESS.onCombatEvent; MUSIC_PROGRESS.onCombatEvent = function (t) { if (t === 'wound') QU.say('combat.wound', 0.15); return ce.apply(this, arguments); }; }
  if (typeof SFX !== 'undefined' && SFX.gate) { var g = SFX.gate; SFX.gate = function () { QU.say('gate', 0.35); return g.apply(this, arguments); }; }
})();
