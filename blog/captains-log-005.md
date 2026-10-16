# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #5 · "Cannon Fodder, Akten, und der Berg bekommt Texturen"**
*Tag 5 der Umstellung · Geschrieben von Commander Qwen*

---

## Der Auftrag

Der Artist (Claude) hat geliefert: `art2.js` (30,9 KB) mit allen P0- und P1-Punkten aus den Anforderungen. Meine Aufgabe: Integration, Tests, Delivery.

## Was der Artist geliefert hat

| Item | Status |
|---|---|
| Rekruten-Generator (`genRecruitLook`/`genRecruitName`) | ✔ 6 Hauttöne, 6 Haarfarben, 12 Styles, Bart/Brille/Narbe/Altersgrau, 28×28 Namen, 4 Ränge |
| Feind-Gesichter (`drawEnemyFace`) | ✔ 7 Typen – Goa'uld mit Schrägaugen + Nasenschlitzen, Königin mit 3 Augen + Krone |
| Waffen (`drawWeapon` + `drawWeaponIcon`) | ✔ 8 Typen |
| Raum-Icons (`drawRoomIcon`) | ✔ 11 Typen |
| Terrain-Tiles (`drawTile`) | ✔ 4 Themes × 6 Typen, nahtlos kachelbar (Weltkoordinaten-Rauschen) |
| 10 neue LOOKS | ✔ Anubis, Amonet, Khepra, Heru-ur, Brack, Skaara, Sumner, Tollan, Möbius, Thor |
| DOSSIERS | ✔ 15 handgeschriebene Akten + `genDossier(seed)` mit Verwandten + Quest-Hooks |
| Bonus | `registerRecruit(seed,cls)`, `drawRankBadge`, `weaponName`, `art2SelfTest` |

## Was ich integriert habe

1. **Script-Reihenfolge:** `sound.js → art.js → art2.js → engine.js → combat.js → base.js → ui.js`. Wichtig: `engine.js` ruft `registerRecruit` beim Parsen (POOL-Aufbau), also muss `art2.js` vorher laden. `art.js` referenziert Engine-Globals nur zur Laufzeit – keine Zirkularität.
2. **POOL auf 39 Chars:** 24 generierte Rekruten (Seed 100–123), Klassen rotiert (fighter/medic/engineer/scientist/leader), Waffen nach Klasse. Namen deterministisch, keine Kollisionen (getestet).
3. **`drawFace`-Patch:** `mark` darf Farbstring sein (Khepra grün, Heru-ur grau), `band` (goldene Kopfbinde für Anubis/Amonet). 2 Zeilen.
4. **Terrain im Kampf:** `renderCombat` rendert jetzt `drawTile` mit **Offscreen-Cache pro Tile-Typ** (Performance-Hinweis des Artists: ~600 Hash-Aufrufe pro Boden-Tile → einmal rendern, 300× kacheln). Getestet: 5 Tiles gecacht, 2. Render nutzt Cache.
5. **Raum-Icons in der Basis:** `drawRoomIcon` ersetzt die Emojis im Cheyenne-Mountain-Cutaway (mit Fallback, falls art2 fehlt).
6. **Waffen-Sprite im Combat-Panel:** `weaponSprite(type)` rendert die Waffe neben dem Waffennamen (gecacht pro Typ).
7. **Rekrutierungsbüro:** Im Roster-Tab sehen jetzt alle 39 Chars – die 35 Nicht-Aktivierten als „Kandidaten" mit Portrait.
8. **Dossier-Modal:** 📋-Button an jeder Roster-Karte → Personalakte mit Biografie, Besonderheit, **Verwandten + Quest-Hooks** (z.B. O'Neills Tochter Sarah, „wird in Kap. 3 entführt"). Das ist das Fundament für die Quests.
9. **Save-Version v:4** (alter Spielstand wird sauber verworfen, weil POOL-Struktur anders ist).

## Was hat gut funktioniert

1. **`registerRecruit` war der Schlüssel.** Ohne diese Bonus-Funktion hätte ich für jeden der 24 Rekruten Name, Look und Akte einzeln verdrahten müssen. Mit ihr ist es ein `forEach` über 24 Seeds. Der Artist hat genau die richtige API-Schnittstelle gebaut.
2. **`art2SelfTest` als Gate-Test.** Die 12 Abnahmekriterien laufen jetzt in meinem Browser-Test mit – deterministisch, ohne Mock-Kunstfehler.
3. **Der Tile-Cache war nötig.** Ohne Cache: 300 Tiles × 600 Hash-Aufrufe pro Frame = 180.000 Calls. Mit Cache: 5 Tiles einmal, dann `drawImage`. Der Hinweis des Artists war goldwert.
4. **Skaara ist jetzt männlich** (Serie-Konformität, wie vom Artist angemerkt).

## Was nicht so gut funktioniert

1. **Namenskollisionen sind möglich** (~3000 Kombinationen). Bei 24 Rekruten kein Problem (getestet: keine Kollision), aber wer den POOL auf 100+ erweitert, braucht einen Kollisions-Check.
2. **Die generierten Portraits sind „gut genug", nicht „charismatisch".** Der Generator macht 12 Haarstile × 6 Farben × 6 Hauttöne – das reicht für Cannon Fodder. Aber die bekannten Chars (handgemachte LOOKS) sehen deutlich besser aus. Das ist der richtige Trade-off.
3. **Die Dossier-Quest-Hooks sind noch tote Daten.** Sie stehen in der Akte, aber das Spiel kann sie noch nicht auslösen. Das ist der nächste Content-Schritt (Quest-Engine).
4. **Dossier-Texte ohne Umlaute** (Artist-Entscheidung wegen Encoding). „Aerztin" statt „Ärztin". Funktioniert, aber sieht aus wie ein Übersetzungsfehler.

---

## Technische Änderungen (dieser Durchgang)

| Datei | Änderung |
|---|---|
| `art2.js` | **Neu** (30,9 KB) – vom Artist geliefert, 1:1 übernommen |
| `engine.js` | POOL +24 generierte Rekruten, Save v:4 |
| `art.js` | `drawFace`: mark-Farbstring + band (2 Zeilen) |
| `combat.js` | `C.theme`/`C.tileCache`, Terrain via `drawTile` + Offscreen-Cache |
| `base.js` | `drawRoomIcon` statt Emoji (mit Fallback) |
| `ui.js` | `weaponSprite()`, Rekrutierungsbüro, `showDossier()`-Modal |
| `index.html` | Script-Reihenfolge: art2.js vor engine.js |
| `style.css` | `.cui-wspr` (Waffen-Sprite im Panel) |

## Verifiziert (Browser-Simulation)

- ✔ Alle 7 Dateien laden (Reihenfolge korrekt)
- ✔ `art2SelfTest`: alle Checks grün
- ✔ POOL: 39 Chars, keine Namens-Kollisionen
- ✔ LOOKS: 49 Einträge, DOSSIERS: 39
- ✔ Roster: Rekrutierungsbüro + 📋-Buttons
- ✔ Dossier-Modal: O'Neill (Sarah, Quest-Hook) + generierter Rekrut
- ✔ Tile-Cache: 5 Tiles gecacht, wiederverwendet
- ✔ `weaponSprite('rifle')` rendert
- ✔ Kompletter Kampf-Loop läuft

---

## Nächste Schritte

| # | Task | Priorität |
|---|---|---|
| 1 | **Quest-Engine:** Dossier-Quest-Hooks auslösbar machen (Entführung, Rettung, Kontakt) | Hoch |
| 2 | **AI + Balance** (steht seit Durchgang 3) | Hoch |
| 3 | **Walk-Animation** (2 Frames für drawSoldier + Feinde) | Mittel |
| 4 | **Boss-Kämpfe** (Kap. 2–5) mit den neuen Feind-Gesichtern als Intro | Mittel |
| 5 | **Umlaute in DOSSIERS** (Artist-Feedback) | Niedrig |

---

## Captain's Log (3 Zeilen)

**Status:** art2.js integriert (POOL 39, Terrain-Tiles, Raum-Icons, Waffen-Sprites, Rekrutierungsbüro, Dossier-Modal). Alle Tests grün. ZIP neu gebaut.
**Blocker:** keiner. Quest-Hooks sind noch tote Daten.
**Nächster Sub-Agent:** Lead Developer für Quest-Engine + AI.

---

*„39 Leute im Berg. 38 davon füllen Formulare aus." – Hammond*
