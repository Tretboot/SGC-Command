# 🗺 ROADMAP – SGC COMMAND v3

**Stand:** Durchgang 12 · One-Way-Gate · Mission-Ende (Sieg/Extraktion) · Gate-Timer raus
**Zweck:** Klare Prioritäten. Für Folge-Teams/Agenten (einzeler Agent in VS Code + Cline).

---

## Legende

| Priorität | Bedeutung |
|---|---|
| 🔴 Hoch | Blockiert den Spielfluss oder ist der nächste logische Schritt |
| 🟡 Mittel | Wichtige Verbesserung, aber kein Blocker |
| 🟢 Niedrig | Nice-to-have, kann warten |

**Regel:** Nach jedem Durchgang → Captain's Log + ZIP neu bauen + Gate-Test grün.

---

## Phase 1: Gerüst stabilisieren (JETZT)

### 1.1 Inventar-System 🔴
**Warum:** Spieler will Ausrüstung. Ohne Inventar ist der Kampf zu statisch.
**Spec:** `INVENTAR-SPEC.md` (vollständig)

**Umsetzung (Lead Developer, 1 Durchgang):**
1. `S.inventory` in `newGame()` (engine.js)
2. `armor` + `special` Feld in POOL (engine.js)
3. ARMORS + SPECIALS Konstanten (engine.js)
4. `craftItem(type, subtype)` Funktion (engine.js)
5. Kampf-Integration: armor reduction, `useSpecial()` (combat.js)
6. Armory-UI (base.js: neuer Raum)
7. Roster-UI: Ausrüstung anzeigen (ui.js)
8. Einsatzvorbereitung: Ausrüstung pro Teammitglied vor der Gate-Animation wählen
9. Loot in `applyCombatResult` (combat.js)
10. Gate-Test + Raster-Test

**Abnahme:**
- [ ] Rüstung reduziert Schaden (10/20/30%)
- [ ] Heavy: −1 Bewegung
- [ ] Spezial-Item nutzbar (1×/Mission)
- [ ] Armory craftet Items
- [ ] Loot füllt Inventory
- [ ] Team-Ausrüstung ist vor jedem Deployment auswählbar und wird korrekt verbraucht
- [ ] Gate-Test grün

### 1.2 Mehrere SG-Teams 🔴
**Warum:** Spieler will "mehr Leute einstellen", "mehrere SG Units".
**Konzept:** `KONZEPT-v3.md` Sektion 2+4

**Umsetzung (Lead Developer, 1 Durchgang):**
1. `S.teams` erweitern: SG-1 (fix), SG-2 (Mitchell), SG-3 (Sheppard), SG-4 (Teyla), SG-5 (Ronon)
2. Jedes Team: 1 Named + 2 Rekruten (auto-zugewiesen)
3. Team-Tab: Team-Auswahl + Rekruten-Zuweisung
4. Max 2 Teams gleichzeitig auf Mission
5. Verstärkung: ab Runde 5, 2 Units vom 2. Team (wenn am selben Planet)

**Abnahme:**
- [ ] 5 Teams im Roster sichtbar
- [ ] Rekruten können Teams zugewiesen werden
- [ ] 2 Teams parallel auf Mission
- [ ] Verstärkung ab Runde 5
- [ ] Gate-Test grün

### 1.3 Kannonenfutter (Rekruten im Einsatz) 🔴
**Warum:** "Bisschen Kannonenfutter auf Einsatz, das sterben/verwundet sein darf."
**Konzept:** `KONZEPT-v3.md` Sektion 2

**Umsetzung (Lead Developer, parallel zu 1.2):**
1. Rekruten (POOL-Index 15–38) können in Teams eingeteilt werden
2. Im Kampf: Rekruten sterben permanent (wie bisher)
3. Verwundet: −10 HP, 3 Tage in MedBay (nicht im Einsatz)
4. Gedenktafel + Morale-Schlag (wie bisher)

**Abnahme:**
- [ ] Rekrut in SG-2 einteilen → geht mit
- [ ] Rekrut stirbt → Gedenktafel, −10 Morale
- [ ] Rekrut verwundet → 3 Tage MedBay
- [ ] Gate-Test grün

### 1.4 Desert-Map (ERLEDIGT ✅)
**Status:** Fertig. Abydos-Ruinen: Tempel-Zentrum, Felsformationen, Oase, klare Pfade.
**Tile-Verteilung:** 204 offen, 60 Wände, 24 Deckung, 8 hohe Deckung, 2 Oase, 2 Gate.

### 1.5 Pause-Menü (Escape) (ERLEDIGT ✅)
**Status:** Fertig. ESC öffnet Pause-Menü (Weiterspielen, Anleitung, Sound, Neues Spiel, Reset).
Pause stoppt den Frame-Loop (nichts rendert/fortschreitet). Schließt bei Reset. Ignoriert in Eingabefeldern.

### 1.6 Schwierigkeitsgrad + Progression + Teal'c-Timeline (ERLEDIGT ✅)
**Status:** Fertig (Nutzer-Feedback Dg. 11: „Die ersten Missionen sind zu schwer, Jaffa sterben zu schwer.
Easymode einstellbar, nach und nach schwerer, erster Jaffa etwas Besonderes, Teal'c nicht von Anfang an
da (Serien-Timeline).“)

**Umsetzung:**
1. **`DIFFICULTY`** (engine.js): 3 Stufen – `easy` (Default), `normal`, `hard`. Skaliert Gegner-HP/-Schaden/-Anzahl, Spieler-Schaden, Gate-Timer. `diff()` + `setDifficulty(d)` (gilt ab nächster Mission).
2. **Progression:** `chapterScale = 1 + chapter*0.05` in combat.js – wird von Kapitel zu Kapitel +5% schwerer, unabhängig von der Stufe.
3. **Jaffa-Balance:** Basis-HP runter (jaffa 40→32, veteran 55→46, elite 70→60) – sterben jetzt schneller.
4. **Erster Jaffa = etwas Besonderes:** einmaliger „First-Contact“-Beat (`S.jaffaSeen`) + „First Blood“-Bonus (+30 XP, +10 Morale) beim ersten Jaffa-Tot (`S.jaffaKills`).
5. **Teal'c-Timeline:** `START=[0,1,2]` (O'Neill/Carter/Jackson). Teal'c (id 3) wird nach Mission 1-1 rekrutiert. Kap.-1-Rekruten verschoben (Teyla folgt).
6. **UI:** Schwierigkeits-Auswahl im Pause-Menü (ESC) + Anzeige im Header (⚔ Leicht/Normal/Hart). Hilfe-Text aktualisiert.

**Abnahme (alle grün):**
- [x] 3 Stufen skalieren Gegner-HP/-Anzahl/-Schaden + Spieler-Schaden + Gate-Timer
- [x] Kapitel-Progression (+5%/Kapitel) wirkt zusätzlich
- [x] Jaffa sterben schneller (HP nerf)
- [x] Erster Jaffa: First-Contact-Beat + First-Blood-Bonus (einmalig)
- [x] Teal'c erst nach Mission 1-1
- [x] Auswahl im Pause-Menü + Header-Anzeige
- [x] Gate-Test + funktionale Tests grün (22 Checks)

### 1.7 One-Way-Gate + Mission-Ende (ERLEDIGT ✅)
**Status:** Fertig (Nutzer-Feedback Dg. 12: „38 Min. ist nur Referenz, nicht für die Mission.
Runden laufen, bis Mission fertig ODER man zurück zum Tor kommt. One-Way-Gate (Lore): man muss
wieder rauswählen. Ich hab auf den Planeten kein Tor gesehen, wo ich gespawnt bin – man muss
erstmal aus einem Tor kommen.“)

**Umsetzung:**
1. **Gate-Timer als Fail raus:** `C.gateTimer` + `stranded`-Ergebnis komplett entfernt. Runden laufen, bis Sieg oder Extraktion. Keine Zeit-Begrenzung mehr.
2. **One-Way-Gate (Lore):** Extraktion = das Gate **neu wählen**. `extract()` funktioniert nur, wenn das ganze (überlebende) Team in Gate-Nähe (Chebyshev ≤2) steht. Button „🌀 Extrahieren (50%)“ im Combat-Panel, nur wenn `gateReady()` grün.
3. **Gate sichtbar:** pulsierender Portal-Ring + „GATE“-Label am Spawn-Punkt. HUD zeigt „🌀 Gate: n/m bereit“ (grün wenn alle da).
4. **Spawn am Gate:** Team spawnt in den freien Tiles direkt am Gate (Radius 2, ohne Kollision) – kommt sichtbar aus dem Tor.
5. **Mission-Ende:** Sieg (alle Gegner tot, 100% Beute + volle XP) ODER Extraktion (50% Beute, +10% mit G1, halbe XP). Beides schließt die Mission ab (`S.done`).
6. **G1-Tech repurposed:** „Gate-Stabilisierer“ = jetzt „Extraktion-Beute +10%“ (war „Gate-Timer +5"). Carter-Talent angepasst.

**Abnahme (alle grün):**
- [x] Kein `gateTimer`/`stranded` mehr (14 funktionale Checks)
- [x] Team spawnt am Gate, alle bereit
- [x] `extract()` nur wenn ganzes Team am Gate
- [x] Sieg = 100% Beute, Extraktion = 50% (G1: 60%)
- [x] Beides schließt Mission ab
- [x] Gate-Marker + HUD-Anzeige
- [x] Gate-Test grün

---

## Phase 1.5: Progressive Entwicklung (NEU, Nutzer-Feedback Dg. 10)

**Prinzip (Nutzer):** "Wir entwickeln das von Mission zu Mission, wie in der Serie – immer mehr kommt dazu: neue Teams, Räume, Mechaniken."

### 1.5.1 Progressions-Gatter 🔴
**Warum:** Nicht alles auf einmal. Neue Teams/Räume/Mechaniken werden erst frei, wenn die Serie es hergibt.
**Umsetzung (Lead Developer):**
1. `S.unlocked = {teams:1, rooms:[...], tech:[...]}` in `newGame()`
2. Freischalt-Trigger an Kapitel-/Missions-Grenzen:
   - Kap. 1 → SG-2 (Mitchell) + Armory-Raum
   - Kap. 2 → SG-3 (Sheppard) + Training-Raum + Inventar
   - Kap. 3 → SG-4 (Teyla) + MedBay-Ausbau
   - Kap. 4 → SG-5 (Ronon) + Werkstatt-Ausbau
   - Kap. 5 → Finale
3. UI: gesperrte Teams/Räume mit 🔒 + "Freigeschaltet in Kap. X"
4. Log-Eintrag bei Freischaltung: "🔓 SG-2 verfügbar"

**Abnahme:**
- [ ] Start: nur SG-1 + Basis-Räume
- [ ] Kap. 1 → SG-2 + Armory frei
- [ ] Gesperrte Einträge mit 🔒 + Hinweis
- [ ] Gate-Test grün

### 1.5.2 Hammond-Büro / Klemmbrett 🔴
**Warum:** Nutzer: "Klemmbrett-Übersicht wer wo arbeitet, in Hammonds Büro. Oder da auch den General ersetzen."
**Konzept:**
1. Neuer Tab/Overlay: **Hammonds Büro** (Klemmbrett-Ansicht)
2. Übersicht: Wer arbeitet in welchem Raum (alle Staff-Zuweisungen auf einen Blick)
3. Bonus-Anzeige: Raum-Boni (z.B. "2 Sanitäter in MedBay = +50% Heilung")
4. **General-System:** Hammond kann ersetzt werden (neuer Kommandant → andere Boni)
5. Zugriff: Button im Basis-Tab + Klemmbrett-Icon

**Abnahme:**
- [ ] Büro-Overlay zeigt alle Staff-Zuweisungen
- [ ] Raum-Boni sichtbar
- [ ] General ersetzbar (mind. 2 Optionen)
- [ ] Gate-Test grün

### 1.5.3 Betretbare Räume (Fallout Shelter / Dungeon-Keeper) 🟡
**Warum:** Nutzer: "Räume betreten können, wie in Fallout Shelter, oder Dungeon-Keeper-3D. Carter sitzt in der Kantine."
**Konzept (2 Stufen):**
- **Stufe 1 (2D, easy):** Raum-Klick → Innenansicht (Canvas). Staff als Figuren im Raum (drawSoldier). Kantine: Carter sitzt am Tisch. Kaserne: Rekruten in Betten. MedBay: Verwundete auf Bahren.
- **Stufe 2 (3D-Pseudo, später):** Dungeon-Keeper-Isometrie. Perspektivische Raum-Ansicht, Figuren mit Tiefe.
**Umsetzung Stufe 1 (Lead Developer + QwenCode):**
1. `renderRoomInterior(roomId)` in base.js
2. Raum-Typ → Layout (Tische, Betten, Maschinen)
3. Staff-Positionen deterministisch (Seed)
4. Overlay: Klick auf Raum → Innenansicht, ESC/Klick → zurück

**Abnahme:**
- [ ] Kantine: Carter + 1-2 andere sitzen
- [ ] Kaserne: Rekruten in Betten
- [ ] MedBay: Verwundete auf Bahren
- [ ] Rückkehr funktioniert
- [ ] Gate-Test grün

---

## Phase 2: Content & Tiefe (nach Phase 1)

### 2.1 Boss-Kämpfe 🟡
**Warum:** 5 Boss-Missionen brauchen eigene Karten (Nutzer: "eigene Karte, Kontrollraum").
**Umsetzung:** Neue MAPS-Einträge (bossKhepra, bossApophis, bossQueen, bossLords, bossAmonet) + Boss-Stats + Intro.

### 2.2 Quest-Engine (einfach) 🟡
**Warum:** Nutzer: "Sowohl als auch" (Simple + Ketten). ABER: "Nicht direkt ganz viele Quests wenn Gerüst wacklig."
**Regel:** Erst wenn Phase 1 stabil ist. Dann: 3-5 Simple Quests (1 Mission = 1 Quest), keine Ketten.

### 2.3 Hintergrundmusik 🟡
**Warum:** Nutzer: "Hintergrundmusik wäre toll." Prozedural (Web-Audio).
**Umsetzung:** 3 Tracks (Basis, Kampf, Gate) + Mute-Button.

### 2.4 Walk-Animation 🟢
**Warum:** `drawSoldier(walk)` existiert, aber Bewegung animiert nur Idle-Bob.

---

## Phase 3: Polish & Handoff (nach Phase 2)

### 3.1 AI-Upgrade 🟢
**Warum:** Nutzer: "Hinten anstellen. Muss ich noch mehr selber testen und Ideen liefern."
**Regel:** Warten auf Nutzer-Feedback.

### 3.2 Fog of War 🟢
### 3.3 Self-Made Units 🟢
### 3.4 Finale ZIP + Handoff 🟡

---

## Zeitplan (geschätzt)

| Phase | Durchgänge | Inhalt |
|---|---|---|
| 1 | 2–3 | Inventar, Teams, Kannonenfutter |
| 1.5 | 2–3 | Progressions-Gatter, Hammond-Büro, betretbare Räume |
| 2 | 2–3 | Boss-Kämpfe, Quests (einfach), Musik |
| 3 | 1–2 | AI, Fog, Finale ZIP |

**Gesamt:** 7–11 Durchgänge bis zum finalen Handoff.

---

## Offene Fragen – BEANTWORTET (Nutzer, Durchgang 8+10)

1. **Quest-Engine:** Sowohl als auch (Simple + Ketten). ABER: erst wenn Gerüst stabil.
2. **Boss-Kämpfe:** Ja, eigene Karte (Kontrollraum/Tempel).
3. **AI lernfähig:** Hinten anstellen. Nutzer will selbst testen.
4. **Sound:** Hintergrundmusik wäre toll. Prozedural.
5. **Handoff:** Einzeler Agent in VS Code mit Cline.
6. **Lore:** NUR sinnvolle Fakten. Kein Junk, keine Witze.
7. **Karten:** Desert war "langweilig" → redesigned (Abydos-Ruinen).
8. **Leute:** Mehr einstellen, SG-1 + Rekruten, Kannonenfutter.
9. **Inventar:** Ja, Ausrüstung pro Char, mehrere Teams, Serie → Gameplay.
10. **Räume-Zuweisung:** Bleibt (gibt Bonus) + Klemmbrett-Übersicht + Hammond-Büro (General ersetzbar).
11. **Menü:** Ja, Escape-Menü (ERLEDIGT ✅).
12. **Progression:** Von Mission zu Mission, wie die Serie (neue Teams/Räume/Mechaniken).
13. **Räume betreten:** Ja, Fallout-Shelter-/Dungeon-Keeper-Style (Stufe 1: 2D-Innenansicht, Stufe 2: 3D-Pseudo).
