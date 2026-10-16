# Captain's Log 013 – Die Planeten erwachen

Die Kampf-Maps nutzten bereits die Pixel-Art aus `art2.js`, zeigten aber oft nur eintönigen Boden und schwarze Felder. Beim Testen auf P3X-478, Abydos und im SGC lag der Fehler im Offscreen-Tile-Cache: Tiles wurden mit Weltkoordinaten in eine nur 48 × 48 Pixel große Canvas gezeichnet und dadurch abgeschnitten. Außerdem wurde je Terrain-Typ nur eine einzige Texturvariation wiederverwendet; Karten ohne Gate-Marker zeichneten vier vollständige Gates.

Der Renderpfad übersetzt die Weltkoordinaten jetzt korrekt in den lokalen Tile-Cache. Jede Zelle bekommt ihre deterministische, weltkoordinatenabhängige Art-Variante; zusätzliche Gate-Marker bleiben normale Bodenfelder. Maps ohne Gate-Marker erhalten ein einzelnes Gate-Feld. Deckung, Ruinen, Stadtfassaden, Wasser und SGC-Metallplatten sind dadurch wieder sichtbar und die Biome wirken abwechslungsreicher.

## Testdurchgänge

Alle vier Biome wurden im Browser mit einer Mission und drei SG-1-Einheiten gestartet. Jede Karte lieferte 300 Terrain-Zellen, einen Gate-Tile und 300 gerenderte Cache-Einträge:

| Planet / Einsatz | Biome | Screenshot |
|---|---|---|
| P3X-478 – Willkommen | Wüste | [combat-desert.png](./screenshots/combat-desert.png) |
| Abydos – Zuerst Kaffee, dann Planet | Dschungel | [combat-jungle.png](./screenshots/combat-jungle.png) |
| Abydos – Steuern beim Schatzamt | Stadt | [combat-city.png](./screenshots/combat-city.png) |
| Orbit – 38 Minuten | SGC | [combat-sgc.png](./screenshots/combat-sgc.png) |

Die Screenshots zeigen das taktische Spielfeld nach dem Terrain-Refresh. Als nächste Art-Erweiterung würden sich zusätzliche Boden- und Deckungsvarianten pro Biom anbieten; für diesen Durchgang reichen die vorhandenen Tiles jetzt sichtbar bis ins Spiel.
