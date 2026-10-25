# Captain's Log 031 – v0.31 "Erster Opus-Durchgang" (25.10.2026)
Modell: Claude Opus (Handoff von Qwen 3.5 122b). Kurzer erster Pass, Fokus aufs Nötigste.

## Ursache des i18n-Ausfalls (Screenshot: "game.boot.btn")
Zwei **Syntaxfehler** in `game/i18n-game.js` (vom Vor-Modell eingebaut):
1. fehlendes Komma nach `'game.menu.foot'` (Zeile 133),
2. unescaptes Apostroph in `'Tok'ra Alert'` (Zeile 181).
Dadurch lief die ganze Datei nicht → leere Tabellen → `I18N.T()` gab den Key zurück.
Fix + Prüfung: 523 DE = 523 EN Keys, alle 232 HTML-Keys auflösbar.
**Lehre:** `node --check` auf jede JS-Datei gehört vor jedes Release (die Test-Suite fing das nicht ab).

## Änderungen
- Sprachauswahl-Dropdown in Bootscreen, Pausemenü und Portal (synchronisiert über `I18N.onChange`).
- ReBirth-Rack aus dem Strudel-Fenster entfernt.
- Neu `game/drum808.js`: TR-808-Simulation (Kick mit Pitch-Drop, Snare Ton+Snappy, Hats aus 6 Rechteck-Oszillatoren, Clap mit 4 Bursts). Hat Vorrang vor dem alten Drum-Code.
- Oszilloskop: `SFX` nutzt jetzt Strudels AudioContext (`strudel.getAudioContext()`), statt einen zweiten zu bauen – sonst erreicht Strudel-Audio den Analyser nie.
- Neu `game/music-progress.js`: 4 Starter-Songs, Rest wird pro entdecktem Planet freigeschaltet; Kampf: erster Treffer → Mutation 0.45, Verwundung eigener Leute → 0.85 (8 s Drossel).
- CSS: Modals/Menü auf Viewport begrenzt + scrollbar (Vollbild-Abschneiden).
- Tests angepasst (ReBirth-Test entfernt; MIDI-Test prüfte übersetzten Text).

## Offen (v0.32)
Bewegliche Fenster, Pianoroll-Mini-Fenster, `.scope()`/`.pianoroll()` echt statt No-Op, 808-Regler-UI,
planetenspezifische Mutationen, Missions-/Zitat-Pass mit Quellen, Hex-Grid laut Roadmap.
Nicht im Browser getestet – nur Node-Tests + Syntax-Check.
