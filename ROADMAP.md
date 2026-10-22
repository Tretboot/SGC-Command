# 🗺 ROADMAP – SGC COMMAND v3 (Isometric Voxel & ASCII-3D Edition)

**Stand:** v0.20 · Isometrisches Voxel-Spielfeld (Pixel-Art) · Live-Umschaltung auf 3D-ASCII (`asciiid`/`asciicker`-Style) · Offworld-Basenbau (C&C / SimCity) · Strudel Core Sound-Engine · Inventar & Hammonds Klemmbrett
**Zweck:** Klare Prioritäten und technischer Fahrplan für die Weiterentwicklung von SGC Command.

---

## Legende

| Priorität | Bedeutung |
|---|---|
| ✅ Erledigt | Implementiert, im Browser & `node test-browser.js` verifiziert |
| 🔴 Hoch | Nächster logischer Meilenstein |
| 🟡 Mittel | Wichtige Erweiterung / Skalierung |
| 🟢 Niedrig | Nice-to-have / Feinschliff |

**Regel:** Nach jedem Durchgang → `Captain's Log` + `HANDOFF.md` + `node test-browser.js` grün.

---

## Phase 1: Gerüst & Taktik-Kern (KOMPLETT ERLEDIGT ✅)

### 1.1 Inventar-, Waffenkammer- & Crafting-System (ERLEDIGT ✅)
**Spec:** [`INVENTAR-SPEC.md`](file:///g:/AgentHome/SGC-Command/INVENTAR-SPEC.md)
- [x] `S.inventory` mit Waffen (`rifle`, `shotgun`, `pistol`, `zat`, `staff`, `staffLong`), Rüstungen (`light` −10%, `medium` −20%, `heavy` −30% / −1 Move) und Spezial-Items (`medkit`, `shield`, `smoke`, `emp`)
- [x] `craftItem()` in [`game/engine.js`](file:///g:/AgentHome/SGC-Command/game/engine.js) + Werkbank in der Basis-Seitenleiste
- [x] `equipItem()` im Roster & auf Hammonds Klemmbrett
- [x] `useSpecial(unit)` im Kampf ([`game/combat.js`](file:///g:/AgentHome/SGC-Command/game/combat.js)) + automatische Beute-Drops in `applyCombatResult()`

### 1.2 Mehrere SG-Teams (`SG-1` bis `SG-5`) (ERLEDIGT ✅)
- [x] 5 SG-Teams (`SG-1` Flaggschiff, `SG-2` Sturmtrupp, `SG-3` Marines, `SG-4` Medizin & Diplomatie, `SG-5` Spezialeinheit)
- [x] Team-Zuweisung im Roster & auf Hammonds Klemmbrett (`assignTeam()`)
- [x] Schnellwahl-Buttons für komplette SG-Teams vor Missionsstart auf der Sternenkarte

### 1.3 Rekruten & Verwundeten-System (ERLEDIGT ✅)
- [x] Rekruten einteilbar, Gedenktafel bei Tod, Heilung in der MedBay

### 1.4–1.7 Desert-Map, Pause-Menü, Schwierigkeitsgrad & One-Way-Gate (ERLEDIGT ✅)
- [x] 3 Schwierigkeitsstufen (`easy`, `normal`, `hard`) + Kapitel-Skalierung
- [x] One-Way-Gate mit 3D-Voxel- & 3D-ASCII-Portal-Ring am Spawn-Punkt

---

## Phase 1.5: Basis-Immersion & Kommando (ERLEDIGT ✅)

### 1.5.1 Progressions-Gatter (ERLEDIGT ✅)
- [x] Kapitelweise Freischaltung von SG-Teams (`unlockChap`) und High-Tech-Crafting (`req: 'W2' / 'S1'`)

### 1.5.2 Hammonds Büro & Klemmbrett + Kommandanten-Wechsel (ERLEDIGT ✅)
- [x] **Klemmbrett-Modal (`showClipboardModal()`)** über Header-Button `📋`, Pause-Menü oder Klick auf das Büro auf Level 27
- [x] Vollständige Personal-Tabelle (Name, Klasse, SG-Team, Raum-Zuweisung, HP/Erschöpfung, Ausrüstung)
- [x] **Kommandant wechselbar (`setCommander()`):**
  - **Gen. George Hammond** (+10% Moral-Regeneration & Sandwich-Aktion)
  - **Dr. Elizabeth Weir** (+25% Forschungspunkte & +15% Kontakt-Beute)
  - **Gen. Hank Landry** (+10 Basis-Power & +10% Waffenschaden)

### 1.5.3 Einsehbare Räume (Fallout-Shelter- / Dungeon-Keeper-Style) (ERLEDIGT ✅)
- [x] Klick auf jeden gebauten Raum öffnet die live animierte **Raum-Innenansicht (`drawRoomInteriorCanvas`)** in der Seitenleiste (inkl. blauem Wackelpudding in der Kantine, Naquadah-Analysator im Labor, Krankenbetten in der MedBay, Waffenregalen in der Armory und Stargate im Gateraum)
- [x] Unterstützt sowohl **Pixel-Art** als auch **ASCII-Terminal-Grafik**!

---

## Phase 2: Audio & Animation (ERLEDIGT ✅)

### 2.1 Strudel Core Sound-Engine (ERLEDIGT ✅)
**Referenz:** `https://urswilke.github.io/strudel/learn/getting-started/`
- [x] Lokales `@strudel/web@1.3.0` Bundle heruntergeladen nach [`game/vendor/strudel-web.js`](file:///g:/AgentHome/SGC-Command/game/vendor/strudel-web.js) (655 KB) + Referenzkopie in [`references/strudel/strudel-web.js`](file:///g:/AgentHome/SGC-Command/references/strudel/strudel-web.js)
- [x] Nativer, MIT-sauberer **Strudel-DSL Pattern-Compiler & WebAudio-Synthesizer (`STRUDEL` in [`game/sound.js`](file:///g:/AgentHome/SGC-Command/game/sound.js))**
  - Unterstützt `setcps()`, `setTempo()`, `stack()`, `cat()`, `seq()`, `note()`, `n()`, `chord()`, `s()`/`sound()`, Mini-Notation (`<a b>`, `[c d]`, `white*8`, `~`) und Synth-Filterketten (`.lpf()`, `.hpf()`, `.gain()`, `.attack()`, `.decay()`, `.sustain()`, `.release()`, `.delay()`, `.room()`, `.pan()`, `.fast()`, `.slow()`)
- [x] **6 kontextsensitive Live-Soundtracks:** `base` (Cheyenne Mountain Telemetry), `map` (Deep Space Cartography), `gate` (Wormhole Horizon), `combat` (Jaffa Assault), `peaceful` (First Contact), `boss` (Ha'tak Command)
- [x] **In-Game Strudel Live-Coding Konsole (`🎵`)** zum Editieren und Live-Evaluieren eigener Strudel-Patterns im laufenden Spiel

### 2.2 Walk-Animation (ERLEDIGT ✅)
- [x] Flüssige Positions-Interpolation (`_animFrom`, `_animT0`) und Bein-Animation beim Laufen auf dem isometrischen Feld

---

## Phase 4: Fundamentale Spielfeld-Überarbeitung – Isometric Voxel & ASCII-3D Dual-Engine (NEU)

### 4.1 Lizenz-Audit & Referenz-Archiv (ERLEDIGT ✅)
- [x] [`references/README.md`](file:///g:/AgentHome/SGC-Command/references/README.md) & [`references/LICENSE-AUDIT.md`](file:///g:/AgentHome/SGC-Command/references/LICENSE-AUDIT.md) angelegt (auch gespiegelt nach `G:\AgentHome\Referenz\sgc-iso-ascii-strudel`)
- [x] Referenzcode gesichert aus:
  - [`Tretboot/asciiid`](https://github.com/Tretboot/asciiid) & [`msokalski/asciicker`](https://github.com/msokalski/asciicker) (**MIT-Lizenz** — kompatibel!)
  - [`nosir/obelisk.js`](https://github.com/nosir/obelisk.js) (**MIT-Lizenz** — 2:1 Pixel-Isometrie & Voxel-Shading)
  - `@strudel/web` (**AGPL-3.0** — dokumentiert in `LICENSE-AUDIT.md`, daher dual gelöst: Vendor-Bundle + eigener MIT-Clean-Room-Interpreter)

### 4.2 Isometrische 2:1 Pixel-Voxel-Engine ([`game/iso.js`](file:///g:/AgentHome/SGC-Command/game/iso.js)) (ERLEDIGT ✅)
- [x] Echte isometrische `2:1`-Projektion (`tileW: 64`, `tileH: 32`, `zStep: 14`) mit Höhenstufen (`baseZ` + `blockH`)
- [x] 4-Wege-Kameradrehung in 90°-Schritten (`Q` / `E` oder UI-Buttons `↶ Q` / `↷ E`) + Zoom
- [x] Exaktes isometrisches Mouse-Picking (`isoScreenToTile`) inkl. Höhen-Hitboxen und analytischem Boden-Fallback
- [x] Voxel-Biome für Wüste/Abydos, Wald/Chulak, Asgard, Ha'tak-Schiff und **mehrstöckige Städte (`city`)** im Syndicate / SimCity 2000 Look

### 4.3 Live umschaltbarer 3D-ASCII-Modus (`asciiid` / `asciicker` Style) (ERLEDIGT ✅)
- [x] Jederzeit im Menü (`ESC`), über den Header-Button (`🖥 PIXEL` / `⌨ ASCII`), im Kampf-HUD oder per Hotkey **`V`** live umschaltbar
- [x] Vollständig spielbarer 3D-isometrischer CP437/ASCII-Renderer (`renderCombatIsoAscii` & `renderBaseAscii`):
  - Höhen-Konturkanten (`─`, `_`), schattierte Voxel-Säulen (`█`, `▓`, `▒`, `░`, `▀`, `▄`), Terrain-Dithering, 3D-ASCII-Stargate und mehrzellige Agenten-Sprites (`[@]` / `/|═`, `{+}` für Feinde)

### 4.4 Offworld-Basenbau im Kampf (Command & Conquer / SimCity Style) (ERLEDIGT ✅)
- [x] Direkt im Einsatz baubare Offworld-Strukturen (`OFFWORLD_BUILDINGS`):
  - `🧱 Sandsack-Stellung` (Leichte Deckung, begehbar)
  - `🗼 Auto-Geschützturm` (Feuert am Rundenende automatisch auf sichtbare Feinde in Reichweite 5)
  - `⚡ Naquadah-Generator` (Heilt/schützt eigene Einheiten im Umkreis von 3 Feldern)
  - `🏢 Kommando-Bunker` (Schwere Voxel-Deckung)

---

## Phase 5: Nächste Ausbaustufen (OFFEN / GEPLANT)

### 5.1 Persistente Offworld-Kolonien & Städtebau (SimCity / C&C Layer) 🔴
- **Idee:** Auf befreiten Planeten bleibt die gebaute Offworld-Basis (Naquadah-Minen, Straßennetz, Geschütztürme, Habitate) dauerhaft gespeichert und liefert täglich Ressourcen ans SGC, muss aber gelegentlich gegen Goa'uld-Gegenangriffe verteidigt werden.

### 5.2 REXPaint (`.xp`) / CP437 Sprite-Importer aus `asciiid` 🟡
- **Idee:** Direktes Laden von `.xp`-ASCII-Sprites (wie in `Tretboot/asciiid`) für noch detailliertere mehrfarbige ASCII-Gebäude, Gleiter (Death Glider) und Goa'uld-Mutterschiffe.

### 5.3 Mehrteilige Boss-Kämpfe & Fahrzeug-/Gleiter-Unterstützung 🟡
- **Idee:** Eigene Voxel-Karten für Ha'tak-Brücken, Replikatoren-Königin und MALP-/UAV-Drohnen im Feldeinsatz.
