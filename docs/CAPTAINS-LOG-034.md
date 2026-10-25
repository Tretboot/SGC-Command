# Captain's Log 034 – v0.34 „Hexfeld & Master-FX“ (25.10.2026, Claude Opus)

## 1. Vollbild-Bug – Ursache gefunden
Der Portal-Knopf „⛶ Vollbild“ schaltet den **Container** (`#game-container`) in den Fullscreen,
das `<iframe>` darin hatte aber eine **feste Höhe von 800 px**. Ergebnis: Spiel endet mitten im Bild,
darunter schwarz (Screenshot des Nutzers). Im eigenen Tab gibt es kein iframe → dort lief es.
Fix: Container im Fullscreen als Flex-Spalte, iframe `flex:1`; `allowfullscreen`, `allow="midi"`;
nach dem Umschalten bekommt das Spiel ein `resize`-Event. Zusätzlich ⛶ im Pausemenü (Spiel selbst).

## 2. Rohe Keys im Strudel-Fenster
`game.dyn.str.tab_core` usw.: **163 Keys** wurden im Code benutzt, aber nie angelegt (Vor-Modell).
Neue Datei `game/i18n-game-extra.js`, per Python/`json.dumps` erzeugt (kein Quoting-Risiko).
Prüfung: alle `I18N.T('…')`-Aufrufe im Code gegen die Tabelle → 0 fehlend, DE/EN-Parität 0.

## 3. Hex-Taktik (Standard, Taste H schaltet um)
- Logik: Kampfgitter bleibt Array, wird als **odd-r offset** gelesen. `stepDirs()` liefert 6 Nachbarn,
  `C.distance` rechnet Hex-Distanz. Bewegung, Gegner-KI (bestStep/pathStep) und Reichweiten nutzen das automatisch.
  Karten, Spawns, Speicherstände unverändert.
- Darstellung `game/hex-render.js`, **ein Renderer, drei Stile**: Pixel (Hex-Prismen mit Höhe, Lichtkante,
  deterministische Bodentextur, Themen-Paletten), ASCII (Glyphen + Scanlines), 2D (flache Brettspiel-Hexes).
- Selbsttest: alle Nachbarn Distanz 1, Pixel↔Hex-Roundtrip fehlerfrei (100 Felder).
- Bekannt: Sichtlinie (`los`) rechnet noch quadratisch; Basis/Kolonien bleiben bewusst Quadratraster.

## 4. Master-FX-Pad (`game/fx-pad.js`, Knopf 🎛 FX)
XY-Feld wie FL Studio / Kaoss Pad (X = Cutoff, Y = Resonanz, Doppelklick = neutral) +
Patch-Taster ECHO, HALL (berechnete Impulsantwort), DRIVE, BASS-KILL, TAPE-STOP.

## Tests
Distanz-Test für beide Modi umgeschrieben. Der Mutations-Test ist **zufallsabhängig (flaky)** –
gelegentlich rot, ohne dass Code kaputt ist → Seed fixieren (TODO).
**Nicht im Browser getestet.**
