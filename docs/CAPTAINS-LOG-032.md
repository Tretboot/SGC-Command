# Captain's Log 032 – v0.32 "Sound & Fenster" (25.10.2026, Claude Opus)

## Neu
| Datei | Zweck |
|---|---|
| `game/sliders.js` | `slider()` in Songs ist jetzt **live** (Strudel `ref`), Panel 🎚 mit **MIDI Learn pro Slider** + Auto-Map auf Akai-Knobs 1–8 |
| `game/sound-styles.js` | 7 Klangstile (Clean, 8-Bit, VHS-Tape, Funk, Unterwasser, Wurmloch, Club) + DJ-Filter/Resonanz/Drive (MIDI-lernbar). Grafikwechsel → Stilwechsel mit Filter-Sweep |
| `game/window-manager.js` | Verschiebbare/skalierbare Fenster (Pointer Events, Touch ok, Position gemerkt, im Viewport geklemmt); großes Modal am oberen Rand verschiebbar; **Pianoroll-Fenster** |
| `game/music-events.js` | Tabelle Ereignis → Song (Gate, Mission, Kampf, Boss, Planet). 4 neue Tracks im Stil von Synth-Pop 83 / Electro / Trance 99 / Big Beat 04 |
| `game/hex.js` | Hex-Mathe (axial q,r): Nachbarn, Distanz, Sichtlinie, Pixel↔Hex, Reichweite (BFS) |

**In The Beginning:** alter Key bleibt als „Aufzug-Ping“-Hintergrundloop; neu `sa_in_the_beginning_full` mit Sample-Nachladen (dirt-samples + tidal-drum-machines). **Braucht Internet**, Pfad der Drum-Machine-Bank ungetestet.

## Bewusste Entscheidung: New Order
„Blue Monday“/„Confusion“ sind geschützt. Statt Noten-Kopien: Stil-Hommagen mit eigenen Noten
(`evt_monday_gate`, `evt_confusion_protocol`). Gilt auch für weitere SG1/Atlantis-Ära-Songs.

## Status
Syntax-Check aller JS ok, Node-Suite grün, Hex-Selbsttest ok. **Nicht im Browser getestet.**
Neue Module werden von `test-browser.js` noch nicht geladen → nächster Schritt: Tests ergänzen.
