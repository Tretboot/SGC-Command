# Captain's Log 033 – v0.33 „Die 808 drückt jetzt“ (25.10.2026, Claude Opus)

> Persönliche Notiz des Modells: Drei Durchgänge an einem Abend. Das Wichtigste, was ich
> gelernt habe, ist nicht technisch: Der teuerste Fehler des Projekts war ein fehlendes Komma.
> Gute Werkzeuge (Syntax-Check, Key-Parität) schlagen gute Modelle. Und: Das Projekt lebt davon,
> dass der Strudel-Code **sichtbar und editierbar** ist. Das ist kein Debug-Feature, sondern Einladung.

## Neu
- **808 Overdrive** mit schwarz-gelbem Gefahrenschalter: erst Klappe „SCHARF MACHEN“, dann „💥 808 DRÜCKT“.
  tanh-Sättigung + Limiter, Warnhinweis. (DJ-Fenster 🎧)
- **MIDI OUT** (`midi-out.js`): Bass/Melodie an Behringer TD-3/Crave, Korg Volca usw. auf Kanal 1, Panic-Knopf, Geräte-Tipps.
- **Titelbildschirm** im Stil einer 90er-TV-Ident mit eigenem Wappen (SVG), Fade-Out in das bestehende Intro.
- **Theme „Military Terminal 90s“** (`theme-90s.css`): Phosphorgrün, Scanlines, Wireframe-Ecken; UI-Sounds bei Hover/Klick.
- **Funksprüche** (`quotes.js`): Fan-Lieblingszitate bei Kampfstart, Verwundung, Gate.
- `references/25.1.20.IN_THE_BEGINNING.txt` (Original-Switch-Angel-Datei) für die Full-Version abgelegt.

## Dank an das Vor-Modell
MIDI-In/Learn (`midi-controller.js`) stammt von Qwen und wurde vom Nutzer noch nicht mit Hardware getestet.
**Falls es funktioniert: großer Dank an das frühere Modell, das hat es sauber vorbereitet.**

## Strudel als Einladung
Der sichtbare Live-Code, die 🧬-Mutation und die Slider sollen Spieler je nach Können zum
Selbercoden einladen: erst Regler drehen → dann mutieren und schauen, was sich ändert → dann eine Zahl
im Code ändern → schließlich eigene Patterns. Dieser Lernpfad ist ein Designziel, nicht Beiwerk.

## Nicht getestet
Nichts davon lief im Browser. MIDI-Out ohne Hardware geprüft (nur Syntax).
