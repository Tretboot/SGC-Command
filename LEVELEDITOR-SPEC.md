# SGC COMMAND · LEVELEDITOR TOOLCHAIN SPECIFICATION
**Dokumenten-Version:** 1.0.0 (v0.24)  
**Autor:** Antigravity Engineering & Claude Opus 5.5 Medium  
**Status:** Genehmigt für Umsetzung  
**System-Referenzen:** `iso.js`, `combat.js`, `art.js`, `content/scenes.js`, `content/quests.js`

---

## 1. Vision & Zielsetzung

Der **SGC Command Level Editor** (`tools/leveleditor.html`) ist ein leichtgewichtiges, browser-basiertes Autorenwerkzeug zur Erstellung, visuellen Prüfung und dynamischen Skriptierung taktischer Gefechtskarten für das Stargate-Kommando.

Das Tool verbindet das 2:1 Isometrie-Rendering (`iso.js`) nahtlos mit dem ASCII-3D Voxel-System (`art.js`/`art2.js`), ermöglicht pixelgenaues Terrain-Sculpting, Platzierung von taktischer Deckung (Halb-/Voll-Deckung), Goa'uld-Geschütztürmen und Missions-Triggern – bei strikter Einhaltung unseres **1,44 MB Floppy-Disk-Budgets**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SGC TACTICAL MAP EDITOR v1.0                          │
├──────────────────────┬──────────────────────────────────────────────────────┤
│ WERKZEUG-PALETTE     │ 2:1 ISOMETRIC VIEWPORT (Pixel-Voxel / ASCII-3D)     │
│ -------------------- │                                                      │
│ [🖌 Malen] [⛰ Heben]│                 /\                                   │
│ [🌊 Senken] [💧 Füll]│                /  \                                  │
│ [🎯 Spawns] [⚡ Trig]│               /    \  [SG-1 Spawn]                  │
│                      │              /\    /\                                │
│ TERRAIN-PALETTE      │             /  \  /  \                               │
│ • Sand/Wüste (Abydos)│            /    \/    \  [DHD]   [Deckung: Kiste]    │
│ • Tempelstein (Chulak│           /\    /\    /\                             │
│ • Basalt / Lava      │          /  \  /  \  /  \                            │
│ • Metallgitter (SGC) │         /    \/    \/    \  [Jaffa Patrouille]       │
│ • Naquadah-Ader      │        /      \    /      \                          │
│                      │                                                      │
├──────────────────────┴──────────────────────────────────────────────────────┤
│ STATUS: X: 14 Y: 8 Z: 2 · Tile: Tempelstein · Deckung: VOLL · Trigger: TRG-1 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Koordinatensystem & Projektion

Die taktische Gefechtskarte basiert auf einem diskreten 3D-Voxel-Raster $(X, Y, Z)$:
- **Rastergröße:** Standard $24 \times 24$ Kacheln (erweiterbar bis $36 \times 36$).
- **Isometrische Projektion:** 2:1 Diamant-Projektion (`tileW = 64px`, `tileH = 32px`).
- **Höhenebenen ($Z$):** Jede Höheneinheit entspricht $-16\text{px}$ vertikalem Versatz auf dem Bildschirm:
  $$\text{screenX} = (x - y) \cdot \frac{\text{tileW}}{2} + \text{camX}$$
  $$\text{screenY} = (x + y) \cdot \frac{\text{tileH}}{2} - (z \cdot \text{stepZ}) + \text{camY}$$
- **Kollisions- & Sichtstrahlen:** Deckung blockiert Sichtlinien (`raycastLos(x0,y0,x1,y1)`). Höhenunterschiede $Z_1 - Z_0 \ge 2$ gewähren Trefferchancen-Boni (+15% High Ground) bzw. blockieren Überquerung ohne Leiter/Rampe.

---

## 3. Pinsel- & Paletten-System

### 3.1 Terrain-Katalog
| ID | Name | Textur / Farbe | Geh-Kosten | Eigenschaft |
|---|---|---|---|---|
| `sand` | Wüstensand (Abydos) | `#c4a56a` / Sand-Düne | 1.0 AP | Standard-Boden |
| `stone_slab` | Goa'uld Tempelstein | `#71717a` / Hieroglyphen | 1.0 AP | Fester Untergrund |
| `metal_grate`| SGC Gitterrost | `#334155` / Rauten-Mesh | 0.8 AP | +20% Bewegungsrate |
| `naquadah_vein`| Naquadah-Ader | `#0284c7` / Glanzpartikel | 1.2 AP | Rohstoffquelle |
| `lava_crust` | Basalt / Magma | `#7c2d12` / Glutlinien | 2.5 AP | Feuerschaden pro Runde |
| `water_shallow`| Sumpf / Flachwasser | `#0891b2` / Wasserwellen | 1.8 AP | -10% Bewegung |

### 3.2 Taktische Deckungs- und Deko-Objekte (Props)
- **Halbdeckung (`cover: 0.5`, +25% Ausweichen):** Munitionskisten, niedrige Steinmauern, DHD-Sockel, Felsbrocken.
- **Vollendung (`cover: 1.0`, +50% Ausweichen, blockiert Sicht):** Goa'uld Obelisken, Naquadah-Generatoren, Pylonen, Säulen, Hangartore.
- **Interaktive Objekte:**
  - `stargate_ring`: Primärer Einwahl- und Evakuierungspunkt.
  - `dhd_console`: Manuelle Wurmlochsteuerung / Schließsequenz.
  - `energy_barrier`: Kraftfeld, deaktivierbar über Konsole oder Zat-Schuss.
  - `turret_pod`: Automatisiertes Verteidigungsgeschütz (hackbar).

---

## 4. Spawn- & Zonen-Skriptierung

Der Editor erlaubt das intuitive Platzieren von Missions-Parametern:
1. **SG-Team Startzone (`spawn_sg`):** 4 Kacheln mit Ankunfts-Blickrichtung (N, O, S, W).
2. **Gegner-Spawns & Patrouillen (`spawn_enemy`):**
   - Jaffa-Garde (Stabwaffe)
   - Jaffa-Elite (Zat'nik'tel)
   - Kull-Krieger (Subraum-Panzerung)
   - Goa'uld Systemlord / Kommandant
   - Definition von Wegepunkten (`patrol: [[x1,y1], [x2,y2]]`).
3. **Missions-Trigger (`trigger_zones`):**
   - `onEnter`: Löst Story-Dialog (`content/scenes.js`) oder Alarmstufe aus.
   - `onExtract`: Missionsziel erreicht; leitet Wurmloch-Transit und Debriefing ein.
   - `onAmbush`: Spawnt Verstärkungswellen bei Betreten des Radius.

---

## 5. Datenformat & Floppy-Disk Optimierung

Um Tausende Karten unter dem 1,44 MB Limit zu halten, verwendet der Editor ein kompaktes RLE-codiertes (Run-Length-Encoded) JSON-Schema:

```json
{
  "id": "chulak_temple_courtyard",
  "name": "Chulak: Tempel-Vorhof",
  "dim": [24, 24],
  "palette": ["sand", "stone_slab", "metal_grate", "naquadah_vein"],
  "terrain_rle": "0x45,1x120,2x30,0x80",
  "height_rle": "0x45,1x120,2x10,0x100",
  "props": [
    {"type": "gate", "x": 12, "y": 4, "z": 1},
    {"type": "dhd", "x": 9, "y": 6, "z": 1},
    {"type": "obelisk", "x": 4, "y": 14, "z": 0, "cover": 1.0}
  ],
  "spawns": {
    "sg": [{"x": 12, "y": 6}, {"x": 11, "y": 6}, {"x": 13, "y": 6}, {"x": 12, "y": 7}],
    "enemies": [
      {"type": "jaffa", "x": 6, "y": 18, "patrol": [[6,18],[12,18]]},
      {"type": "elite", "x": 18, "y": 18}
    ]
  },
  "triggers": [
    {"id": "ambush_1", "type": "onEnter", "x": 12, "y": 14, "w": 4, "h": 2, "scene": "chulak_ambush_dialogue"}
  ]
}
```

---

## 6. Realisierungsphasen (Roadmap §3.8)

1. **Phase 1: Standalone Canvas Editor (`tools/leveleditor.html`)**
   - Einbindung der bestehenden Module `iso.js`, `art.js`, `sound.js`.
   - Grid-Rendering mit Kachel-Auswahl und Heben/Senken per Mausrad.
   - Undo/Redo Stack (50 Aktionen).
2. **Phase 2: Entity- & Deckungs-Layer**
   - Platzierung von Deckungsobjekten mit visueller Anzeige von LoS-Schatten.
   - Drag-and-Drop Platzierung von SG-1 und Jaffa-Einheiten.
3. **Phase 3: Export & Hot-Reload ins Spiel**
   - "Im Spiel testen" Button: Startet direkt in den taktischen Kampf mit der neu gebauten Karte (`combat.js`).
   - Ein-Klick JSON-Export zur Integration in `content/quests.js`.

