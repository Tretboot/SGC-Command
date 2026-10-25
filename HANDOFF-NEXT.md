# HANDOFF v0.34 → nächstes Modell
**Stand:** v0.34 „Hexfeld & Master-FX“ · Node-Tests grün (Mutations-Test flaky) · **nicht im Browser getestet**.

## Pflicht vor jedem Release
1. `for f in game/*.js; do node --check $f; done`
2. Key-Check: alle `I18N.T('…')` im Code müssen in DE+EN existieren (Skript in docs/CAPTAINS-LOG-034.md beschrieben)
3. `node test-browser.js`

## Architektur
Neue Features = eigene Module, die vorhandene Funktionen umhüllen (Wrapper). Ladereihenfolge: `game/index.html`.
Module: drum808, music-progress, sliders, hex, sound-styles, window-manager, music-events, midi-out,
quotes, title-screen, hex-render, fx-pad, i18n-game-extra.

## Prioritäten
1. **Browser-Abnahme** v0.31–0.34 (Vollbild im Portal, Hex-Klicks, FX-Pad, 808-Overdrive, Slider).
2. Hex: Sichtlinie per `HEX.line`, Deckung richtungsabhängig, Flankieren; Iso-Pixel-Hex (echte Isometrie) als nächste Stufe.
3. UI-Overhaul (`docs/SPEC-UI-OVERHAUL.md`, Stil A 90er-Terminal), Intro-Kamera (`SPEC-INTRO-CAMERA.md`).
4. Basis-/Kolonieverteidigung (`SPEC-BASE-DEFENSE.md`), bessere Basis-/Kolonie-Grafik (Quadratraster bleibt).
5. Missionen/Zitate (`SPEC-QUOTES-MISSIONS.md`), Wormhole Extreme. MIDI-Clock (`SPEC-MIDI-OUT.md`).
6. Mutations-Test mit festem Seed; alte ReBirth-/909-Reste entfernen.

## Nutzerwünsche, die gelten
Keine Notenkopien geschützter Songs · Strudel-Code sichtbar = Einladung zum Selbercoden ·
lehrreich kommentieren · jeder Durchgang liefert eine komplette Zip.
