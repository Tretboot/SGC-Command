# 📦 HANDOFF – SGC COMMAND v2

**Für:** Folge-Team / Einzelagenten
**Stand:** Durchgang 12 · One-Way-Gate · Mission-Ende (Sieg/Extraktion) · Gate-Timer raus
**ZIP:** `SGC-Command-v2-Game.zip` (111 KB)

---

## 1. Was ist das?

Indie-Spiel-Konzept + spielbarer Prototyp im Stargate-Universum.
**X-COM (UFO)-Struktur:** taktischer Grid-Kampf (Top-Down 2D) + Basis-Management
(Cheyenne-Mountain-Cutaway). Dazu: Wiki-Website, Blog mit Captain's Log nach
jedem Durchgang, ZIP-Lieferung.

**Kein Framework, kein Build-Step.** 7 JS-Dateien + HTML + CSS, alles
prozedural gerendert (Canvas-API, **keine Bilddateien, kein drawImage in art2.js**).
localStorage-Save (v:4).

---

## 2. Schnellstart

```bash
# Spiel starten (Browser):
cd game && python3 -m http.server 8080
# → http://localhost:8080

# Tests:
node test-browser.js                          # Browser-Gate (muss grün sein)
cd game && node ../incoming/rastertest.js     # Art-Raster-Test (muss grün sein)

# Art-Preview (visuell):
# incoming/preview.html im Browser öffnen
```

**Kein direkter Terminal-Zugriff?** Alles läuft über `bash_tool` (Node) und
`create_file`/`edit_file`. ZIP-Archive programmatisch bauen (Python `zipfile`),
nie `zip -r` in der Konsole.

---

## 3. Architektur

### 3.1 Dateien & Zuständigkeiten

| Datei | Größe | Zuständigkeit |
|---|---|---|
| `game/sound.js` | 3,5 KB | Prozedurale Web-Audio, 12 SFX, Mute-Toggle. Deklariert `sfx()` **global** |
| `game/art.js` | 16,9 KB | LOOKS (15 Basis), `shade()`, `drawFace`, `drawSoldier`, Gateroom (`GR`, `playGate`, `skipGate`), Sternenkarte (`STARS`, `MAP`, `drawMap`) |
| `game/art2.js` | 30,9 KB | **Artist-Erweiterung:** Rekruten-Generator, Feind-Gesichter, Waffen, Raum-Icons, Terrain-Tiles, +10 LOOKS, DOSSIERS, `registerRecruit`, `art2SelfTest` |
| `game/engine.js` | 21,7 KB | Spiellogik: POOL (39 Chars), PLANETS, MAPS, CHAPTERS (27 Missionen), TECH, ROOMS, Save/Load, `newGame`, `note` |
| `game/combat.js` | 21,9 KB | Taktischer Kampf: Grid, LOS, Bewegung, Angriff, AI, FX, Screen-Shake, Terrain-Render (Tile-Cache), `drawEnemyBody` |
| `game/base.js` | – | Prozeduraler Cheyenne-Mountain-Cutaway mit 28 Levels, Korridoren, Mini-NPCs und Lift |
| `game/ui.js` | 22,5 KB | UI: Tabs, Header, Basis-Side, Sternenkarte-Side, Mission-Flow, Combat-Panel (Jagged-Alliance-Style), Roster, Dossier-Modal, Hilfe-Modal |
| `game/index.html` | 2,3 KB | Einstieg. **Script-Reihenfolge ist kritisch** (siehe 5.1) |
| `game/style.css` | 6,3 KB | Styling (Theme: #070b12 / #4fc3f7 / #e8b040) |

### 3.2 Globale Variablen (wichtigste)

| Variable | Deklariert in | Bedeutung |
|---|---|---|
| `S` | engine.js | Spielzustand (Save v:4) |
| `C` | combat.js | Kampfzustand (`C.active`, `C.units`, `C.selected`, `C.tileCache`, `C.fx`, `C.shake`, `C.firstHint`, `C.hover`) |
| `B` | base.js | Basis-UI-Zustand (`B.buildMode`, `B.selRoom`) |
| `GR` | art.js | Gateroom-Animation (`GR.phase`, `GR.walkers`) |
| `MAP` | art.js | Sternenkarte (`MAP.nodes`, `MAP.sel`) |
| `UI` | ui.js | UI-Tab-Zustand |
| `GATE_STATE` | ui.js | Gateroom-Roster-Referenz |
| `sfx()` | **sound.js** | Sound-Trigger. **Nicht in ui.js erneut deklarieren!** (Crash-Durchgang 4) |
| `LOOKS` | art.js (+art2.js) | Portraits nach Name indiziert (49 Einträge) |
| `DOSSIERS` | art2.js | Personalakten (39 Einträge) |
| `POOL` | engine.js | 39 Charaktere (15 bekannt + 24 generiert) |

### 3.3 Game-Loop

```
Basis-Tag (S.day):
  Produktion (Räume + Staff) → Passive (Planeten) → Forschung → Event (45%)
  → endDay() schreibt in S.rlog → showReport()
Mission:
  Sternenkarte → Team wählen (max 6) → playGate() (Gateroom-Animation)
  → startCombat() → taktischer Kampf (2 AP/Unit, Grid, Gate-Timer)
  → combatEnd() → applyCombatResult() → showReport()
```

**Gate-Timer** (17–32 Runden, +5 G1, +3 Carter) = einzige Zeit-Mechanik.
Bei 0 → "stranded" (0% Beute). **Kein Neglect** (aus v2 entfernt).

---

## 4. Kern-Mechaniken (Balance-Stand)

| Mechanik | Wert |
|---|---|
| AP pro Unit/Runde | 2 |
| Bewegung | 8-Wege, 1 AP/Tile |
| Treffer Base | 70% (diagonal −20) |
| Low Cover (t=1) | −25% Treffer |
| High Cover (t=2) | −50% Treffer |
| Schütze in Cover | +10% (low) / +15% (high) |
| Rekruten-Tod | **Permanent** (Gedenktafel, −10 Morale alle) |
| SG-1-Tod | Nie (Duplikat-Klausel: −30 HP, +2 Injuries) |
| 2+ down | Auto-Extraktion (50% Beute) |
| Balance-Referenz | Assault "Willkommen" (6 Jaffa) → victory R13; Defense "Stand Orders" (12 Jaffa) → extracted R10 (naive AI) |

**Waffen:** `WEAPONS` in engine.js (rifle, shotgun, pistol, staff, staffLong,
melee, chakram, throw). Feind-Typen: `ENEMIES` (jaffa, veteran, elite, goauld,
repl, drone, queen).

**Kapitel:** 5 Kapitel, 27 Missionen, `S.done` speichert erledigte
Mission-Ids ('1-1'…'5-6'). `mission.recruit` = POOL-Index.

---

## 5. Fallstricke (aus den 5 Durchgängen gelernt)

### 5.1 Script-Reihenfolge (index.html)
```
sound.js → art.js → art2.js → engine.js → combat.js → base.js → ui.js
```
**Warum:**
- `art2.js` braucht `shade()` + `LOOKS` aus `art.js`
- `engine.js` ruft `registerRecruit()` beim Parsen (POOL-Aufbau) → `art2.js` muss vorher
- `art.js` referenziert `PLANETS`/`S` nur zur Laufzeit → keine Zirkularität
- `sfx()` kommt aus `sound.js` (global) – **niemals in ui.js erneut deklarieren**
  (Durchgang 4: `Identifier 'sfx' has already been declared` → ui.js komplett verworfen → "startet nur halb")

### 5.2 Gate-Test
`node test-browser.js` simuliert echten Browser-Start: alle 7 Skripte in
`<script>`-Reihenfolge, load-Event, Frame-Loop, DOM-Prüfung.
**Jeder Durchgang MUSS damit grün sein.** (Hat den sfx-Crash gefangen,
den der alte 4-Datei-Test nicht sah.)

### 5.3 Tile-Cache (combat.js)
`drawTile` = ~600 Hash-Aufrufe pro Boden-Tile. `C.tileCache` rendert jeden
Tile-Typ einmal in ein Offscreen-Canvas, dann `drawImage` pro Tile.
**Nicht entfernen** – Performance-Killer (180.000 Calls/Frame ohne Cache).

### 5.4 Base-Grid vertikal gespiegelt
`S.base.grid` hat 8×28 Zellen. Grid-Zeile 0 liegt unten im Rendering auf Level 28
(Gateroom); Level 1 ist oben. `baseClick` spiegelt die angeklickte Canvas-Zeile
zurück auf das Datenlayout (`y=ROWS-1-gy`). Alte 8×10-Spielstände werden beim
Laden in das neue Raster migriert.

### 5.5 Save-Version
`SAVE_KEY='sgc-command-v4'`, `load()` prüft `s.v===4`.
Bei POOL-Struktur-Änderungen: Version bumpen, alter Stand wird sauber verworfen.

### 5.6 drawMap existiert in art.js UND ui.js
Legal – die ui.js-Version gewinnt (später geladen). Nicht "fixen".

---

## 6. Art-Pipeline

**Dokumentation:** `ART-TOOLCHAIN.md` (detailliert)
**Anforderungen an Artist:** `ART-ANFORDERUNGEN.md`
**Artist-Lieferung (kanonisch):** `incoming/` (art2.js, art.js, rastertest.js, preview.html)

**Pipeline:**
1. Artist liefert `art2.js` (prozedural, seeded, keine Bilddateien)
2. Wir übernehmen nach `game/`, diffen gegen `incoming/` (Kanon)
3. Raster-Test + Browser-Gate-Test + Preview
4. Integration (POOL, Aufrufstellen, Patches)
5. ZIP neu bauen + Captain's Log

**Skaara-Patch:** Artist lieferte "long" (Vorlage), wir patchen auf "short"
(männlich, Serie-Konformität). Dokumentierter Einzeiler.

---

## 7. Offene Aufgaben (Priorität)

**Vollständige Roadmap: `ROADMAP.md` (v3, nach Nutzer-Feedback Durchgang 10)**
**Konzept: `KONZEPT-v3.md` · Inventar-Spec: `INVENTAR-SPEC.md`**

| # | Task | Priorität | Hinweis |
|---|---|---|---|
| 1 | **Inventar-System** | 🔴 Hoch | Spec: `INVENTAR-SPEC.md`. Waffen/Rüstung/Spezial pro Char, Armory, Loot. 1 Durchgang (Lead Developer) |
| 2 | **Mehrere SG-Teams** | 🔴 Hoch | SG-1 bis SG-5, Rekruten-Zuweisung, 2 Teams parallel, Verstärkung ab R5. Konzept: `KONZEPT-v3.md` §2+4 |
| 3 | **Kannonenfutter** | 🔴 Hoch | Rekruten im Einsatz, permanent sterbbar, verwundet = 3 Tage MedBay. Konzept: `KONZEPT-v3.md` §2 |
| 4 | **Progressions-Gatter** | 🔴 Hoch | Neue Teams/Räume/Mechaniken erst bei Kapitel-Freischaltung. `ROADMAP.md` §1.5.1 |
| 5 | **Hammond-Büro / Klemmbrett** | 🔴 Hoch | Staff-Übersicht, Raum-Boni, General ersetzbar. `ROADMAP.md` §1.5.2 |
| 6 | **Betretbare Räume** | 🟡 Mittel | Fallout-Shelter-/Dungeon-Keeper-Style. Stufe 1: 2D-Innenansicht. `ROADMAP.md` §1.5.3 |
| 7 | **Boss-Kämpfe** | 🟡 Mittel | Eigene Karten (Kontrollraum/Tempel), 5 Bosses, Intro mit drawEnemyFace |
| 8 | **Quests (einfach)** | 🟡 Mittel | ERST wenn Phase 1 stabil. 3-5 Simple Quests, keine Ketten |
| 9 | **Hintergrundmusik** | 🟡 Mittel | Prozedural (Web-Audio), 3 Tracks (Basis/Kampf/Gate) |
| 10 | **AI-Upgrade** | 🟢 Niedrig | Warten auf Nutzer-Feedback (will selbst testen) |
| 11 | **Fog of War / Self-Made Units** | 🟢 Niedrig | Phase 3 |

**Erledigt (Dg. 9+10):** Desert-Map (Abydos-Ruinen), Pause-Menü (Escape), Lore aufgeräumt, Konzept v3, Inventar-Spec.

## 8. Blog & Wiki & Dokumente

**Blog:** `blog/captains-log-00X.md` – nach jedem Durchgang ein neuer Eintrag.
**Wiki:** `wiki/` (17 verlinkte HTML-Seiten, Theme: --bg:#0a0a0f, --accent:#00ff88). Neue Seiten: `quests.html` (Quest-Hooks, Quest-Engine-Plan), `art-toolchain.html` (Asset-Generierung, Tests).
**Konferenz:** `KONFERENZ.md` (11,4 KB, 3 Subagenten, Konzept-Entscheidung).

**Planungs-Dokumente (für Folge-Teams):**
| Datei | Zweck |
|---|---|
| `ROADMAP.md` | Prioritäten + Spezifikationen, 4 Phasen, Zeitplan, offene Fragen |
| `QUEST-ENGINE-SPEC.md` | Quest-Engine-Architektur: Schema, Trigger, UI, Abnahme-Kriterien |
| `ART-TOOLCHAIN.md` | Asset-Generierung, Tests, Integration, bekannte Grenzen |
| `ART-ANFORDERUNGEN.md` | Anforderungsliste an den Artist (Claude) |

---

## 9. Subagenten (Team)

| Agent | ID | Einsatz |
|---|---|---|
| QwenCode | `agent_OmaYkhH12HzpI8S7kMQZt` | Coder (HTML/JS/CSS) |
| Lead Developer | `agent_dEvXdiszewxNIPeek78M0` | Code-Architektur, State Machines, Bugfixing |
| Lead Story Writer | `agent_nmX2DN0gpEF8aFCIMYLGm` | Lore, Dialoge, Handbücher, Worldbuilding |
| Qwen No Thinking | `agent_uH9bBwYpqYJc6woHHfLrf` | Schneller Allrounder (Text, Tabellen, Daten) |
| Test 1 | `agent_UbaL3hLipv8zxUg3MgXoO` | Fallback (wenn andere blockieren) |
| Commander (Selbst) | `self` | Isolierte Instanz für vertrackte Logik |

**Methode:** Specsheet-first, A/B-Testing (2 Agenten, gleicher Task),
Peer-Review-Loop (zweiter Agent liest Code/Text gegen), KI-Reader-Doktrin
(Code so dokumentieren, dass Folge-Agenten den Zweck verstehen).

---

## 10. Nächste Schritte (empfohlen)

**Details:  (v3) +  + **

1. **Inventar-System** (Lead Developer): Waffen/Rüstung/Spezial, Armory, Loot.
   Spec: . 1 Durchgang.
2. **Mehrere SG-Teams** (Lead Developer, parallel): SG-1 bis SG-5, Rekruten-Zuweisung.
   Konzept:  §2+4. 1 Durchgang.
3. **Kannonenfutter** (Lead Developer, parallel): Rekruten im Einsatz, permanent sterbbar.
4. **Boss-Kämpfe** (Lead Story Writer + Lead Developer): Eigene Karten, Intro, Stats.
5. **Quests (einfach)** (Lead Story Writer): NUR wenn Phase 1 stabil. 3-5 Simple.

**Nach jedem Durchgang:** Captain's Log + ZIP neu bauen + Gate-Test grün.
