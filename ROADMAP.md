<!-- v0.35 "Die 808 drückt jetzt": siehe blog/captains-log-035.md, HANDOFF.md -->
# 🗺 ROADMAP – SGC COMMAND v0.35 ("Die 808 drückt jetzt")

**Stand:** v0.35 · "Die 808 drückt jetzt" · Multi-Slot Speicherstände · Cookie-Clicker Export/Import · Resizable SGC-AMP & TR-808 · Ebene 19 Forschungslabor · Hex-Taktik · i18n DE/EN · 238+ Prüfungen grün
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
- [x] `S.inventory` mit Waffen (`rifle`, `shotgun`, `pistol`, `zat`, `staff`, `staffLong`), Rüstungen (`light` −10%, `medium` −20%, `heavy` −30% / −1 Move) und Spezial-Items (`medkit`, `shield`, `smoke`, `emp`)
- [x] `craftItem()` in `game/engine.js` + Werkbank in der Basis-Seitenleiste
- [x] `equipItem()` im Roster & auf Hammonds Klemmbrett
- [x] `useSpecial(unit)` im Kampf (`game/combat.js`) + automatische Beute-Drops in `applyCombatResult()`

### 1.2 Mehrere SG-Teams (`SG-1` bis `SG-5`) (ERLEDIGT ✅)
- [x] 5 SG-Teams (`SG-1` Flaggschiff, `SG-2` Sturmtrupp, `SG-3` Marines, `SG-4` Medizin & Diplomatie, `SG-5` Spezialeinheit)
- [x] Team-Zuweisung im Roster & auf Hammonds Klemmbrett (`assignTeam()`)
- [x] Schnellwahl-Buttons für komplette SG-Teams vor Missionsstart auf der Sternenkarte

### 1.3 Rekruten, Verwundete & Raum-Innenansichten (ERLEDIGT ✅)
- [x] Rekruten einteilbar, Gedenktafel bei Tod, Heilung in der MedBay
- [x] 28-Level-Ansicht des Cheyenne Mountain Complex mit animierten Raum-Innenansichten in Pixel- und ASCII-Grafik
- [x] Hammonds Klemmbrett-Modal (`📋`) mit wechselbaren Kommandanten (Hammond, Weir, Landry)

---

## Phase 2: Dual-Engine: Isometrisch Voxel ⇄ 3D-ASCII (KOMPLETT ERLEDIGT ✅)

### 2.1 2:1 Pixel-Voxel Engine (`game/iso.js`) (ERLEDIGT ✅)
- [x] Echte isometrische 2:1 Projektion (`tileW: 64`, `tileH: 32`, `zStep: 14`) mit Höhenstufen (`baseZ` + `blockH`)
- [x] 4-Wege-Kameradrehung in 90°-Schritten (`Q`/`E`), Zoom und analytisches Ray-to-Diamond Mouse-Picking
- [x] Biome für Wüste/Abydos, Wald/Chulak, Asgard, Ha'tak-Schiff und mehrstöckige Städte (`city`) im Syndicate / SimCity-Look

### 2.2 3D-ASCII Modus (`asciiid` / `asciicker` Style) (ERLEDIGT ✅)
- [x] Jederzeit im Menü (`ESC`), über den Header-Button (`🖥 PIXEL` / `⌨ ASCII`) oder per Hotkey **`V`** live umschaltbar
- [x] CP437/ASCII-3D-Renderer mit Höhenkonturen (`─`), Schattierungen (`█`, `▓`, `▒`, `░`), ASCII-Stargate und mehrzelligen Sprites

### 2.3 Offworld-Basenbau im Gefecht (ERLEDIGT ✅)
- [x] Taktischer Feldbau (`OFFWORLD_BUILDINGS`): Sandsäcke, Auto-Geschütztürme, Naquadah-Generatoren, Bunker

---

## Phase 3: Persistente Planeten-Kolonien (Civ / SimCity Layer) (ERLEDIGT ✅)

### 3.1 Kolonie-Verwaltung (`S.colonies`) (ERLEDIGT ✅)
- [x] Kolonie-Gründung auf befreiten Welten (`foundColony(planetId)`)
- [x] 6×5 Sektoren-Raster mit Gebäuden: Naquadah-Mine, Naquadah-Reaktor, Forschungslabor, Schutzschild-Kuppel, UAV-Hangar
- [x] Tägliche Rohstoff- und Forschungsausbeute (`tickColonies()`)
- [x] Automatische Goa'uld-Angriffssimulation gegen Verteidigungswert

---

## Phase 4: High-Octane Sound-Engine & Winamp Player (KOMPLETT ERLEDIGT ✅)

### 4.1 SGC-AMP v2.80 (Winamp Retro Player) (ERLEDIGT ✅)
- [x] Titan-Chassis mit grünem Phosphor-LCD (Marquee, Spielzeit, BPM/CPS)
- [x] Status-Badges: `[ ▶ PLAYING ]`, `[ ⏸ PAUSED ]`, `[ ⏹ STOPPED ]`
- [x] Live-Oszilloskop & 28-Band-Spektrumanalysator (HTML5-Canvas an `AnalyserNode`)
- [x] Reparierter Master-Lautstärkeregler mit linear-to-exponential Scaling & `localStorage`-Persistenz

### 4.2 ReBirth-338 Synthesizer-Rack & Roland Soundbanks (ERLEDIGT ✅)
- [x] TB-303 Acid Bass Rack mit 7 Soundbanks (`303 Saw`, `303 Sq`, `SH-101`, `Sub`, `Slap`, `8-Bit`, `Reese`) und Drehreglern
- [x] Roland TR Drum Machine (`TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Acoustic`, `Acid`)
- [x] Hot-Patching in den Code (`[ ✍ SOUNDBANKS ANWENDEN ]`)

### 4.3 Stargate Theme Remixes & MIDI Bridge (ERLEDIGT ✅)
- [x] Standard-MIDI-Parser für Stargate Main Theme (165 BPM, G-Dur, 1.380 Events)
- [x] **🪖 Stargate × C&C Hell March Industrial Remix (`theme_remix_cnc`):** 132 BPM, 909-Kick, verzerrter Bass-Chug, Fanfare
- [x] **☕ Stargate × Midnight Lo-Fi Chillhop Remix (`theme_remix_lofi`):** 84 BPM, Rhodes E-Piano, warme Subs, Vinyl-Dust
- [x] 4x Theme × Switch Angel Remixes + dedicated Strudel Voices ($MELODY, $BASS, $HARMONY, $DRUMS)

### 4.4 Switch Angel Live-Coding Bibliothek & Audio-Fixes (ERLEDIGT ✅)
- [x] AST-Normalisierung für alle 20 Switch-Angel-Tracks (HTML `String.sub` Fix, `postgain` Entflechtung)
- [x] Automatischer 8-Bit Chiptune-Modus gekoppelt an ASCII-3D (Taste `V`)
- [x] Audio-reaktives Spielfeld-Tanzen (`ISO.beatPulse`) & Gamepad Dual-Rumble Feedback

---

## Phase 5: Polishing, Entschlackung & Portal-Restrukturierung (ERLEDIGT ✅)

### 5.1 Combat-UI Layout-Fix (ERLEDIGT ✅)
- [x] `#combat-ui` direkt im `#combat-overlay` per Flexbox verankert; kein Abschneiden in Iframes oder niedrigen Auflösungen mehr
- [x] Dynamische Viewport-Berechnung in `resizeCombatViewport()`
- [x] Einheiten bleiben während Ankunftsdialogen auswählbar; Angriffs- und Bewegungsaktionen setzen erst nach dem Dialog ein
- [x] Responsives, scrollbar gehaltenes Aktionspanel für niedrige Viewports
- [x] Intro-Soundtrack vorbereitet und in autoplay-gesperrten Browsern per eigenem Button ohne Skip aktivierbar

### 5.2 Hub-Navigation aufgeräumt (ERLEDIGT ✅)
- [x] Aufdringliche Uni-Badges im Header entfernt; 4 aufgeräumte Hauptreiter: `[ 🎮 Spiel ]`, `[ 📚 Datenbank & Lore ]`, `[ 📜 Captain's Log ]`, `[ ℹ️ Über & Labor ]`
- [x] Dezent integriertes Untermenü für Strudel & Winamp Lab, Forschungsnotizen, Downloads und Lizenzen
- [x] Manuelle Kommandantenauswahl aus dem Pause-Menü entfernt (bleibt rein im Quest-System)

### 5.3 Entschlackung des Release-Pakets (ERLEDIGT ✅)
- [x] 7.6 MB ungenutzte PNG-Screenshots gelöscht
- [x] Release-Paket auf `SGC-Command-v023.zip` aktualisiert; Tests und aktuelle Dokumentation enthalten
- [x] Danksagung an Switch Angel und Dokumentation der Tracks als Bildungs-/Entwicklungs-Platzhalter in `README.md` und `LICENSE`
- [x] Gemeinfreie NASA-Assets (Mars-Dünen, Eye of the Sahara, Webb Cosmic Cliffs, Cassini-Eiswelten) in `references/NASA-ASSETS.md` katalogisiert

### 5.4 Kampffluss, Performance-Tuning & Musik-Dramaturgie (v0.24 – ERLEDIGT ✅)
- [x] **"Weiter"-Button am Missionsende**: Konflikt mit Strudels globaler `window.note`-Parserfunktion durch isoliertes `gameNote()` und intelligenten Proxy gelöst; zusätzliche Tastatur-Hotkeys (Enter/Space/Esc).
- [x] **10-facher Performance-Boost im Kampf**: Beseitigung von Layout-Thrashing (`resizeCombatViewport` aus der 60-FPS-Schleife verbannt), Dirty-State-Caching für die Combat-DOM-Elemente und wiederverwendbare TypedArrays für die Audio-Visualisierung.
- [x] **Musik-Ablauf**: Intro (Stargate Thema) → Basis (Remix 1, `theme_remix_0`) → Sternenkarte (Remix 3, `theme_remix_2`) → Basis (Remix 1).
- [x] **Mutieren-Engine repariert**: Setter für `STRUDEL.currentCode` ergänzt; sichere Algorithmus-Transformationen für Noten- und Skalenmodulation ohne Syntaxfehler.

---

## Phase 6: Hex-Feld-Kampfsystem & Taktik (v0.31 – KOMPLETT ERLEDIGT ✅)

### 6.1 Hex-Grid Engine & Bewegung (ERLEDIGT ✅)
- [x] **Hex-Grid-Datenstruktur**: Umstellung von quadratischem zu hexagonalem Raster mit Odd-R Offset-Koordinaten (`combatDistance`, 6 hexagonale Nachbarn)
- [x] **Hex-Renderer**: Isometrische 2:1-Projektion und 3D-ASCII-Rasterdarstellung
- [x] **Taktische Beute-Caches & Feldbau**: Beute-Kisten auf dem Schlachtfeld mit Naquadah- und Trinium-Loot, Offworld-Geschütztürme und Sandsäcke

---

## Phase 7: SGC Krankenstation (Ebene 21), Vorfälle & Tages-Loop (v0.28-v0.30 – ERLEDIGT ✅)

### 7.1 Krankenstation (Sub-Level 21) & Fraiser-Behandlungen (ERLEDIGT ✅)
- [x] Eigene Navigationsansicht `🏥 Krankenstation` mit Leitender Chefärztin Dr. Janet Fraiser
- [x] 5 Behandlungspfade: Bettruhe, Feldmedizin, Tretonin, Fraiser-Chirurgie, Antikes Heilgerät
- [x] Taktische Verwundeten-Bergung (`extract()` mit Downed-Comrades durchs Tor, Not-Rückzug)
- [x] SGC-Krisen & Zwischenfälle beim Tagesabschluss (`SGC_INCIDENTS`, Woolsey-Inspektion, Replikatoren-Subspace-Bug)

---

## Phase 8: Internationalisierung (i18n) & Forschungs-Labor (v0.30-v0.34 – ERLEDIGT ✅)

### 8.1 100% Dual-Language System DE / EN (ERLEDIGT ✅)
- [x] Modulare i18n-Architektur (`game/i18n.js`, `game/i18n-game.js`, `game/i18n-portal.js`) mit 528+ Keys
- [x] 1-Klick-Sprachwechsler im Header (`🌐 EN / DE`), automatische DOM-Übersetzung und `localStorage`-Persistenz
- [x] Vollständige Key-Parität DE ⇄ EN ohne Lücken, automatisierter DOM-Coverage-Gate im Testsuite

### 8.2 Ebene 19 Forschungs-Labor & Tech-Tree (ERLEDIGT ✅)
- [x] Eigenständiges Labor-Modal (`🔬`) mit Stargate-Wissenschaftsraum (Sub-Level 19)
- [x] 4 Forschungszweige (Tor-Netzwerk, Goa'uld-Waffen & Taktik, Schutzschilde, Antiker/Alien-Wissen)
- [x] Taktische Missions-Forschungspunkte (+12 bis +40 RP) und automatische Fertigstellung bei Tagesabschluss

---

## Phase 9: Multi-Slot Savegames & Cookie-Clicker I/O (v0.35 – ERLEDIGT ✅)

### 9.1 Multi-Slot Speicherstände & Schnelltaste (ERLEDIGT ✅)
- [x] Mehrere unabhängige Speicherslots (`slot1`, `slot2`, `slot3`) mit Zeitstempel, Tageszähler, Kommandant und Credits
- [x] Direkter Zugriff über Header-Button (`💾`) und Pause-Menü (`ESC`)

### 9.2 Cookie-Clicker-Style Base64 Import/Export (ERLEDIGT ✅)
- [x] 1-Klick Text-Export & Import im Cookie-Clicker-Stil via Base64-String (Clipboard-Support)
- [x] JSON-Download und Datei-Upload für Offline-Backups

### 9.3 Entwickler- & Test-Presets (ERLEDIGT ✅)
- [x] 4 vorkonfigurierte Spielstände zum direkten Testen ohne Grinding:
  * `fresh`: Frischer Kampagnenstart (Tag 1, General Hammond, 500 Credits)
  * `research_lab`: Samantha Carter als Kommandantin, Ebene 19 Labor aktiv, 180 RP, G1 erforscht
  * `medbay_crisis`: Dr. Janet Fraiser auf Ebene 21, 2 verwundete Soldaten, Vorräte an Tretonin & Medkits
  * `endgame`: General Hank Landry, Kolonien auf Abydos & Alpha, 9 erforschte Spitzentechnologien

### 9.4 Portal-Modernisierung & Minecraft-Slogans (ERLEDIGT ✅)
- [x] Zufällige, rotierende Minecraft-artige Slogans im Portal-Header beim Laden und Klick
- [x] Vollständiger Captain's Log Viewer mit Markdown-Integration und akademischem Multi-Agenten-Disclaimer
- [x] Wiki-Verknüpfung und Aktualisierung aller Spielsysteme (Hex, 3 Renderstile, Labor, Krankenstation)

---

## Version Release Plan

| Version | Fokus | Status |
|---------|-------|--------|
| v0.29 | Studien-Revision (EN), Lizenz-Audit | 25. Okt 2026 ✅ |
| v0.30 | i18n Fundament DE/EN, Tag-Loop Fix | 25. Okt 2026 ✅ |
| v0.31 | Hex-Grid Taktik & Roland TR-808 Engine | 25. Okt 2026 ✅ |
| v0.32 | SGC Krisen-System & Level Editor | 25. Okt 2026 ✅ |
| v0.33 | Krankenstation Ebene 21 & Fraiser Recovery | 25. Okt 2026 ✅ |
| v0.34 | Ebene 19 Forschungs-Labor & Tech-Tree Modal | 25. Okt 2026 ✅ |
| v0.35 | Multi-Slot Saves, Cookie-Clicker I/O, Splash Slogans | 26. Okt 2026 ✅ |
| v0.36 | Spanisch (es) i18n & Jukebox-Progression | Geplant (Backlog) 🔴 |
| v0.37 | Vollständige Planetenkarte & alle SG-1 Welten | Geplant (Backlog) 🟡 |

---

**Regel:** Nach jedem Durchgang → `Captain's Log` + `HANDOFF.md` + `node test-browser.js` grün.
- [x] **Neuer Track: 🌌 Melancholic Ambient Phaser Remix**: 74 BPM D-Dorisch mit nativem `.phaser()` DSP-Filter, Supersaw-Pads, Cello-Subbass und einsamer Glocke.

### 5.5 Outro-Fanfare, Web MIDI, Boot-Screen & Wurmloch-Transit (v0.24 – ERLEDIGT ✅)
- [x] **Stargate Outro / Abspann-Thema (`theme_outro` & `theme_outro_ambient`)**: Joel Goldsmith / David Arnold Abspannmelodie (134 BPM, C-Moll/Dur) mit treibendem 16tel-Ostinato, Blechbläser-Fanfare und Pauken-Marsch; ertönt automatisch beim Missions-Debriefing (`showReport()`).
- [x] **Web MIDI API Hardware-Controller & Akai MPK Support (`midi-controller.js`)**: Standard-Presets für Akai MPK mini Plus (CC 70..77) und MPK mini mk2 (CC 1..8), 8 Drum-Pads (Notes 36..43), 25 Live-Keyboard-Tasten, dynamisches MIDI-Learn und Winamp-Dashboard.
- [x] **Cheyenne Mountain Terminal Boot-Screen (`#boot-screen`)**: Garantiert sofortige WebAudio-Aktivierung ab Frame 0 im Intro in allen modernen Browsern.
- [x] **3D Hyperspace-Wurmloch-Tunnelsequenz**: Dynamisch geschwungener 3D-ASCII-Subraumtunnel mit perspektivischen Ringen, Chrono-Partikeln und Rausch-Audio (`SFX.wormhole()`).
- [x] **Level-Editor Toolchain-Spezifikation (`LEVELEDITOR-SPEC.md`)**: Umfassende Spezifikation für 2:1 Isometrie-Voxel-Editor mit RLE-Kompression (< 1,44 MB Floppy-Budget).

---

## Phase 6: Künftige Ausbaustufen (GEPLANT / BACKLOG)

### 6.1 Mission- & Quest-basierte Song-Freischaltung (Jukebox-Progression) 🔴 (NÄCHSTER FOKUS)
- Songs im SGC-AMP v2.80 / Winamp-Player werden erst freigeschaltet und in die Playlist aufgenommen, wenn das SG-Team sie zum ersten Mal bei einer Mission, einem Tor-Event oder Abschluss einer Quest entdeckt hat.
- Erschafft ein motivierendes Entdecker- und Sammelgefühl ("🎵 Neuer Soundtrack entdeckt!").
- Zustand wird persistent in `S.unlockedTracks` gespeichert.

### 6.2 Detaillierte Raum-Screens & Raum-spezifisches Klang-Ambiente (Hybrid Pixel ⇄ 3D-ASCII) 🔴
- Jeder der 28 Räume im Cheyenne Mountain Complex (Torraum, Daniel Jacksons Archiv, Hammond-Büro, Labor, Krankenstation etc.) erhält einen vollwertigen Großbildschirm-Screen.
- **Grafik-Stil:** Hybrid-Ansicht – vollwertige 2:1 isometrische Pixel-Art mit animierten Terminals, nahtlos umschaltbar auf den retro 3D-ASCII-Modus per Hotkey **`V`**.
- **Klang-Ambiente:** Passend zum beliebten *Melancholic Phaser Remix* bekommt jeder Raum ein eigenes, getragenes Klang-Ambiente mit subtilen modularen Synthesizer-Flächen.

### 6.3 Generative NASA-Grafik unter 1,44 MB Floppy-Budget 🟡
- Projektziel: Gesamtrelease offline-lauffähig strikt unter **1,44 MB (klassische 3,5"-Diskette)** halten (aktuell: ~680 KB).
- **Technische Umsetzung:** Prozedurale Canvas-Shader und Vektoren abgeleitet von den echten NASA-Aufnahmen in `references/NASA-ASSETS.md` (< 50 KB Gesamtaufwand, kein einziges schweres Bitmap-Bild).

### 6.4 Modulare Standalone Audio-Engine (`SGC-Audio`) 🟡
- Kapselung der Audio-Engine (`game/sound.js`) in ein universell wiederverwendbares Modul für spätere Spiele und Demos.
- Geplante Kompatibilität:
  - Chiptune- und Trackerformate: Amiga ProTracker (`.mod`), Commodore 64 (`.sid`)
  - Streaming- & komprimierte Samples: `.ogg`, `.mp3`
  - ReBirth-338 Synthesizer-Rack & Live-Coding DSL

### 6.5 REXPaint (`.xp`) / CP437 Sprite-Importer & Mehrteilige Boss-Kämpfe 🟢
- Direktes Laden von `.xp`-ASCII-Dateien für noch detailliertere mehrfarbige Goa'uld-Mutterschiffe (Ha'tak) und Death Glider.
- Spezielle Voxel-Karten für Ha'tak-Brücken, Replikatoren-Mutterschiffe und MALP-/UAV-Drohnensteuerung im Feldeinsatz.
---
