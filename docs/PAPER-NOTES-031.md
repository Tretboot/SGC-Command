# Paper-Notiz: Modellwechsel Qwen → Claude Opus (v0.30 → v0.31)
- Befund: Das Vor-Modell meldete "204/209 Tests grün", lieferte aber ein Release, in dem die zentrale Übersetzungsdatei nicht parsebar war. Die Tests luden die Datei offenbar nicht im selben Pfad wie der Browser.
- Diagnosezeit des Nachfolgemodells: wenige Minuten mit `node --check` – billige statische Prüfungen schlagen teure Modelle.
- Zusätzlich: Handoff-SHA-256 weicht in einer Stelle vom tatsächlichen Hash ab (`3ffdf…` vs. `3FFD4…`) – Handoffs von LLMs sollten maschinell verifiziert werden.
- Empfehlung: CI-Schritt "Syntax-Check aller JS + Key-Parität + DOM-Key-Auflösung" vor jedem Handoff.

## v0.32
- Erweiterungen konsequent als **Wrapper-Module** (neue Dateien, die bestehende Funktionen umhüllen) statt Eingriffe in 3000-Zeilen-Dateien → geringes Regressionsrisiko, leicht für Folgemodelle nachvollziehbar.
- Urheberrecht als Design-Randbedingung: Modell lehnt Notenkopien geschützter Songs ab und baut Stil-Hommagen.

## v0.33 – Beobachtungen für das Paper
1. **Werkzeug > Modellgröße:** Der schwerste Fehler (leere Übersetzung) wurde in Sekunden von `node --check` gefunden; die Test-Suite des Vor-Modells meldete Erfolg.
2. **Session-Fragilität:** Zwischenstände im Sandbox-Speicher gingen zwischen Turns verloren; nur die ausgelieferten Zips überlebten. Empfehlung: jeder Turn liefert ein vollständiges Artefakt.
3. **Wrapper-Architektur** ermöglicht schnelles, risikoarmes Erweitern durch wechselnde Modelle.
4. **Grenze der Selbstprüfung:** Kein Browser/kein MIDI-Gerät in der Umgebung → UI/Audio unverifiziert. Menschliche Abnahme bleibt nötig.
5. Vorschlag: Headless-Browser-Test (Playwright) + Screenshot-Vergleich als nächster CI-Schritt.

## v0.34
- **Fehlerklasse „Phantom-Keys“:** Das Vor-Modell schrieb 163 `I18N.T()`-Aufrufe ohne zugehörige Einträge – plausibel aussehender Code, der nie geprüft wurde. Ein 5-Zeilen-Abgleich Code↔Tabelle fand alle.
- **Kontext schlägt Code-Lesen:** Der Vollbild-Bug war nur mit dem Hinweis des Nutzers („im neuen Tab geht es“) schnell lokalisierbar → iframe. Menschliche Beobachtung + Modell-Suche ergänzen sich.
- **Datenmodell erhalten:** Hex als *Lesart* des bestehenden Arrays (odd-r offset) statt neuer Datenstruktur → Speicherstände/Karten bleiben gültig. Gutes Muster für inkrementelle KI-Refactorings.
