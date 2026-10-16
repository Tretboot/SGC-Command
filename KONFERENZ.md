# SGC COMMAND – Konferenzprotokoll
## "Komplett über den Haufen" – Neukonzept als X-COM-Style Taktikspiel

**Datum:** Tag 1 der Neu-Konzeption  
**Teilnehmer:** Lead Developer, Lead Story Writer, Design-Referent  
**Entscheidung:** Altes Konzept (Management/Auto-Kampf) wird verworfen. Neues Konzept: **X-COM-Struktur + Fallout-Shelter-Basis + Top-Down-Grid-Kampf.**

---

## 1. Die Entscheidung

| Altes Konzept | Neues Konzept |
|---|---|
| Turn-basiertes Management | **Taktisches Grid-Kampfspiel** |
| Auto-Kampf (Player steuert nur vor) | **Player steuert jede Aktion** (AP-System) |
| Gate-Neglect als Hauptdruck | **Gate-Timer ("38 Minuten") als Hauptdruck** |
| Keine permanente Konsequenz | **Rekruten sterben permanent** (X-COM-Style) |
| Ein Panel, alles drin | **Zwei Welten: Basis (Side-View) + Schlachtfeld (Top-Down)** |

**Der eine Satz:** *Das Gate ist die Mechanik. Kein stummer Hubschrauber – es ist Deckung, Fluchtweg, Missionsziel und Ticking Clock in einem.*

---

## 2. Game-Loop (X-COM-Struktur)

```
BASE ──► MISSION_BRIEFING ──► COMBAT ──► DEBRIEF ──► BASE
 ▲                                                    │
 └────────────────────────────────────────────────────┘
```

**End of Day (automatisch bei "Next Day"):**
1. Produktion tickt (Workshop, Lab)
2. Staff tickt (MedBay heilt, Training gibt XP, Morale)
3. Passive Income: +100 Credits, +20 Metal, +5 Deuterium
4. 1–2 neue Mission Alerts spawnen
5. `day += 1`, Auto-Save

**1 Mission = 1 Tag.** Basis-Zeit ist während des Kampfs gefroren.

---

## 3. Basis-Grid (Shelter-Style, Side-View)

**Grid: 8 Spalten × 10 Etagen = 80 Zellen.** Vertikaler Schacht durch Cheyenne Mountain.

### Raum-Typen (MVP: 11 Typen)

| Raum | Größe | Max | Power | Baukosten | Output/Tag | Staff-Slots |
|---|---|---|---|---|---|---|
| Gate-Room | 2×2 | 1 | −10 | — (fest) | Missions-Launch | — |
| Generator | 1×1 | 4 | **+10** | 300c | — | 1 |
| Lab | 1×1 | 3 | −2 | 500c + 50m | +10 RP pro Staff | 2 |
| Werkstatt | 1×1 | 3 | −3 | 400c + 60m | 1 Item pro Staff | 2 |
| Kaserne | 1×1 | 4 | −1 | 300c | beherbergt 4, +Morale | 4 |
| MedBay | 1×1 | 2 | −2 | 600c + 40m | +10 HP pro Staff | 2 |
| Training | 1×2 | 2 | −2 | 800c + 80m | +2 XP pro Staff | 2 |
| Armory | 1×2 | 1 | −2 | 700c + 100m | 1 Waffe-Upgrade/Tag | 1 |
| Wasserwerk | 1×1 | 2 | −1 | 350c + 30m | Life-Support (Pflicht) | 1 |
| Lager | 1×1 | 3 | 0 | 250c | +500 Kapazität | 0 |
| Kantine | 1×1 | 2 | −1 | 400c | +Morale | 1 |

### Staffing
- Rollen: `Soldier`, `Scientist`, `Engineer`, `Medic`
- Einplanen: Click-Click (Staff in Room ziehen)
- Output-Formel: `base × staff_count × role_bonus` (1 Staff = 100%, 2 Staff = 180%)
- Rollen-Bonus: Scientist im Lab = +50% RP, Engineer in Werkstatt = +50% Speed
- Ungeplante Staff: 0 Output, −Morale/Tag

### Power-Budget
Summe aller Consumer ≤ Summe der Generatoren, sonst gehen Räume offline.

### Start-Basis (Tag 1)
Gate-Room, 2 Generatoren, 1 Lab, 1 Werkstatt, 1 Kaserne, 1 Wasserwerk.  
Power-Bilanz: +20 −17 = +3. 3 Staff (2 Soldier, 1 Scientist).

### Visuell
- Schacht mit 10 Etagen, pro Etage 8 Zellen (je 80px)
- Room = farbiger Block mit Icon + Name + Fortschrittsbalken
- Staff = kleine Avatar-Punkte im Room
- Top-Bar: Power, Ressourcen, Tag-Counter, Mission-Alerts

---

## 4. Kampf-Grid (Top-Down)

**Grid: 20 × 15 Tiles = 300 Tiles. Tile = 48px → Canvas 960×720px.**

### Terrain

| Terrain | Begehbar | Blockt LOS | Deckung |
|---|---|---|---|
| Open (Gras/Fels) | ja | nein | keine |
| Low Cover (Kiste, Felsbrocken) | ja | nein | −25% Treffer |
| High Cover (Mauer, Fels, Wrack) | nein/ja | ja | −50% Treffer |
| Wasser | nein | ja | — |
| Gate (2×2 Tiles) | nein | ja | — |

### AP-System (pro Unit pro Kampfrunde: 2 AP)

| Aktion | Kosten |
|---|---|
| 1 Tile bewegen | 1 AP |
| Schießen | 1 AP |
| Nachladen | 1 AP |
| Dash (2 Tiles) | 2 AP |
| Granate werfen | 2 AP |
| Turn skip | 0 |

**Bewegung:** 8-Wege. Diagonale = 1 AP.

**Rundenstruktur:** Player-Phase (alle Einheiten, Reihenfolge frei) → Enemy-Phase (AI) → Round +1.

### Line of Sight
Bresenham-Raycast Schütze→Ziel. Blockiert durch: Mauern, High Cover. Low Cover blockt **nicht**.

### Trefferchance
- Base: 70% (gleiche Reihe/Spalte), 50% (Diagonale)
- Ziel in Low Cover: −25%, in High Cover: −50%
- Schütze in Cover: +10%
- Reichweite 1–8 Tiles

### Waffen (MVP)

| Waffe | Dmg | Range | Mag | Treffer |
|---|---|---|---|---|
| P90 | 25 | 6 | 30 | 70% |
| Shotgun | 40 | 2 | 6 | 90% |
| Granate | 50 (AoE 3×3) | 5 | 1 | 100% |

### Das Gate ist immer auf dem Feld

Zwei Mission-Archetypen:
- **A — Defense:** Gate ist das Ziel. Feind spawn von Kartenrändern. Überlebe 10 Runden → Sieg. Gate-HP (200) = 0 → Niederlage.
- **B — Assault:** Spieler spawn am Gate. Ziel am anderen Ende: Artefakt zerstören / Wissenschaftler eskortieren.

### Gate-Timer ("38 Minuten") – DER BISS

- Timer = Züge (Standard 28–36)
- Timer → 0: **Stranded-Modus** (Nicht-Wipe, aber: Feind-Wellen, Belohnung 0%)
- Gate schließt in 3 Züge (jeder im Gate = safe)
- Boss-Flucht: Goa'uld flieht bei Timer ≤ 4 oder HP ≤ 20%

---

## 5. Feind-Typen

| Typ | HP | Bewegung | Schaden | Spezial | Schwäche |
|---|---|---|---|---|---|
| **Jaffa (Rekrut)** | 40 | 5 | Beam 7–11 (R.3) · Melee 5–9 | "Eifer": +2 Schaden wenn Verbündeter stirbt | Energie-Schaden +25%, Fassen |
| **Jaffa Veteran** | 55 | 5 | Beam 9–13 (R.4) · Melee 6–10 | "Schild-Blitz": erste Attacke abgefangen | Kopfschuss ×1.5 nach Blühen |
| **Elite Jaffa** | 70 | 6 | Beam 12–16 (R.4) · Melee 8–12 | "Langer Staff": +1 Range, "Befehlston": -1 Moral Rekrut | AP-Runde ×1.5, Kopfschuss ×1.5 |
| **Goa'uld (System Lord)** | 200–240 | 3 | Wurf 15–22 (R.7, ignoriert Deckung) | "Aura der Angst", "Flug" bei Timer ≤ 4 | Physical ×1.5, Schwachpunkt Kehle ×1.75 |
| **Replikant** | 50 | 7 | Beam 6–9 (R.3) ×2/Zug | "Sich teilen" bei HP < 35 | Replikanten-Kanone |
| **Replikat-Drone** | 25 | 7 | Beam 4–6 (R.2) | Schwarze Gruppe | Jeder-Burst, Kanone 100% |
| **Replikat-Königin** | 320 | 4 | Beam 10–14 (R.5) | "Stockraum": +2 Drones alle 2 Züge | Kanone +100%, unverwundbar mit Knoten |
| **Ancient Drone** | 50+6 Shield | 4 | Beam 9–13 (R.5) | "Gate-Kopp": halbiert Gate-Fenster | Piercing 100% + Shield -5 |

---

## 6. Helden & Rekruten

### SG-1 (feste 4, "kein Team, sondern ein Vertrag")

| Name | Rolle | HP | Bewegung | Waffe | Spezial |
|---|---|---|---|---|---|
| **O'Neill** | Veteran-Ansturm | 80 | 5 | Rifle 9–13 (R.4) | "Todesfalte" (1×/Feind: 100% Treffer, ignoriert Deckung) |
| **Teal'c** | Melee | 95 | 6 | Rifle 8–12 · Melee 16–22 (+8 vs Jaffa) | "Wut" (alle 2 Züge: doppel Melee), "Ra'hh" |
| **Daniel** | Wissenschaft | 60 | 5 | Pistol 7–10 (R.3) | "Schwachpunkt" (4/Mission: +25% Schaden), "Lesung" (Lord: 1-Pause) |
| **Carter** | Tech/Support | 75 | 5 | Rifle 9–12 (R.4) | "Werkzeug" (Gate-Timer +3, Kanone), "Schnelle-Putz" (25% HP) |

### Rekruten (der "echte" X-COM-Kern)
- Pool: 12 (4 fixe Namen + generiert)
- **Biscuit** Alvarez: Moral +1 (bringt Brötchen)
- **Wand** Kowalski: +1 Melee (Boxbeutel)
- **Chen** (Sanität): "Schnelle-Putz" (1×/M)
- **Stump** Miller: "Der Plan" (5%/Zug: +1 Moral)
- Rest: generiert (35–50 HP, zufällige Namen)

### Tod

| Wer | Tod? | Konsequenz |
|---|---|---|
| **Rekrut** | **Ja, permanent** | Gedenktafel, -1 Moral (7 Tage), +5% XP für Team |
| **SG-1** | **Duplikat-Klausel** | Kann downen. ≥3 Downs in 1 Akt → "Kopie" kommt rein (identisch, 5% schlechter Humor, 3 Missionen) |

---

## 7. Kapitel-Aufbau (5 Akte, 27 Missionen)

| Akt | Titel | Neuer Feind | Gate-Status |
|---|---|---|---|
| 1 | **Erste Schritte** (5 Missionen) | Jaffa Rekrut | 1 Gate (SGC) |
| 2 | **Das Netz** (6 Missionen) | Veteran, Elite, SatP | +Alpha Site (Chain-Dial) |
| 3 | **Goa'uld** (5 Missionen) | System Lord (Boss) | Gate-Fenster als Boss-Mechanik |
| 4 | **Replikatoren** (5 Missionen) | Replikatoren + Königin | Infections-Meter |
| 5 | **Das Ende** (6 Missionen) | Ancient Drones, 3 Lords | Gates feinden an |

### Kapitel 1 – "Erste Schritte" (Tutorial)

| # | Name | Typ | Feinde | Besonderheit |
|---|---|---|---|---|
| 1.1 | "Willkommen" | Erkundung | 6× Jaffa Rekrut | Tutorial, 2 Scanpunkte + Exfil |
| 1.2 | "Zuerst Kaffee, dann Planet" | Rettung | 10× Rekrut | Erste Zivilisten, Moralwert |
| 1.3 | "Stand Orders" | Verteidigung | 12× Rekrut (Welle) | Halte-Mission 15 Züge |
| 1.4 | "Steuern beim Pharaonen-Schatzamt" | Fassung | 8× Rekrut + Trelak | Stun-Rund, Fassen nicht Töten |
| 1.5 | "38 Minuten" | Assault | 14× Rekrut + 2 Veteran + 1 Elite | Timer 17, Wüste, erster Gedenktafel-Moment |

---

## 8. Was macht UNSER Spiel besonders?

1. **Das Gate ist die Mechanik:** Kein stummer Hubschrauber – es ist Deckung, Fluchtweg, Missionsziel und Ticking Clock in einem.
2. **Rundenbasiert + taktisch + management-tief:** X-COM-Struktur, aber mit Shelters zugänglicherer Basis-Loop (Side-View, sofort lesbar).
3. **Karten-Diversität als Identität:** Jeder Planet spielt sich anders (Wüste, Dschungel, Tempel, Stadt, Eis, Lava, Nacht, Ufer).
4. **Narrative Bindung:** Goa'uld-Kulte geben dem "Ticking Clock"-Druck ein Gesicht – keine abstrakte Alienwelle.
5. **Tonfall:** Ernst im Taktikteil, leicht im Basis-/Dialogteil – wie die Serie selbst. Hammond isst ein Sandwich. Es wird nie benannt.

---

## 9. Technische Architektur (MVP)

### Rendering – gemischt, bewusst

| Teil | Tech | Warum |
|---|---|---|
| Base (Side-View) | **DOM** (CSS Grid) | Drag & Drop, Tooltips, Animationen trivial |
| Combat (Top-Down) | **Canvas 2D** (960×720) | Tile-Rendering, LOS, Unit-Sprites, Hit-Indikatoren |
| HUD, Menüs, Briefing | **DOM** | Standard-UI |

### State-Management
- Single Source of Truth, Reducer-Pattern, **kein Framework**
- Alle Spiellogik = pure Funktionen: `(state, action) → newState`
- Kein DOM-Zugriff in der Logik → testbar + serialisierbar

### Save-System
- `JSON.stringify(state)` → `localStorage['sgc_save_v1']`
- Save-Points: End of Day, nach Debrief, manuell (inkl. Mission-State)
- `meta.seed` für reproduzierbare procedural Maps

### Dateistruktur (MVP, 9 Dateien)

```
index.html
css/style.css
js/core/state.js      # State, Reducer, Save/Load
js/core/rng.js        # seeded RNG (mulberry32)
js/base/rooms.js      # Room-Definitionen
js/base/base.js       # Basis-Logik + DOM-Render
js/combat/combat.js   # Kampf-Logik (AP, LOS, Schaden)
js/combat/ai.js       # Enemy-AI
js/combat/render.js   # Canvas-Render
js/main.js            # Bootstrap, Phase-Router
```

### MVP-Cut-Liste (explizit raus)
Fog of War, Fahrzeuge, Weapon-Mods, Multi-Player, Sound.

---

## 10. Nächste Schritte

| # | Task | Priorität |
|---|---|---|
| 1 | Wiki-Website (dieses Dokument als verlinkte Seiten) | Sofort |
| 2 | Playable Prototyp: Basis-Grid (DOM, 8×10) | Hoch |
| 3 | Playable Prototyp: Kampf-Grid (Canvas, 20×15, 1 Mission) | Hoch |
| 4 | Game-Loop verbinden (Basis → Mission → Debrief) | Hoch |
| 5 | 3 hand-crafted Maps (Wüste, Dschungel, Tempel) | Mittel |
| 6 | Enemy-AI (Greedy: nächstes Ziel, Deckung suchen) | Mittel |
| 7 | Tech-Tree (10 Nodes) | Mittel |
| 8 | Kapitel 2–5 Content | Niedrig (nach MVP) |
