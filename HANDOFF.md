# 📦 HANDOFF – SGC COMMAND (v0.29 – "Studien-Revision & Final Release")

**Projekt:** SGC Command (`g:\AgentHome\SGC-Command`)  
**Forschungsrahmen:** Universität Osnabrück (Kognitionswissenschaft / Informatik) – KI-Pair-Programming-Studie  
**Beteiligte Modell-Schichten:**  
1. **Gemini 4 Argon:** 2:1 isometrische Voxel-Projektion, Obelisk-Mathematik, Diamond-Picking, initialer CP437/ASCII-Renderer, Lizenz-Audit.  
2. **Claude 5.5 / 3.5 Sonnet:** Obelisk/Voxel-Stabilisierung, prozedurale WebAudio-Sample-Synthese, Inventar & Werkbank-Crafting (`INVENTAR-SPEC.md`), Hammonds Klemmbrett.  
3. **Gemini 3.8 Flash:** Standard-MIDI-Bridge, Krumhansl-Schmuckler-Tonarterkennung, Stargate Theme × Switch Angel Hybrid-Remix-Synthesizer, prozedurale Seed-Song-Generierung (`SONGGEN`), persistenter planetarer Koloniebau, **SGC-AMP v2.80**, Strudel Live-Code Interface, ReBirth-338 Rack, 8-Bit Chiptune-Modus, C&C- und Lo-Fi-Remixes sowie das vereinheitlichte Web-Portal.
4. **Claude Opus 5.5 Medium (v0.25 – v0.28):** 
   - **Krankenstation (Ebene 21 / Dr. Janet Fraiser & Carolyn Lam – v0.28):**
     * Neuer Navigations-Reiter `🏥 Krankenstation` mit direkter Anbindung an Ebene 21 des Cheyenne Mountain Complex.
     * Chefärztin Dr. Janet Fraiser mit prozeduralem Pixel-Porträt, diagnostischen Lageberichten und Bio-Telemetrie-Monitor (EKG).
     * 5 Behandlungsmethoden: Stationäre Bettruhe (+35 bis +50 HP/Tag), Erstversorgung mit Medizin (+35 HP, -1 Wunde), Antikes Heilgerät (100% Vollregeneration), Tretonin (+50 HP, +5 MaxHP, Moralboost) und Dr. Fraisers Not-Operation für kritische Traumata.
     * Geschlossener Tages-Loop (`endDay`): Patienten regenerieren spürbar, Heilung wird im Tagesbericht (`S.rlog`) transparent aufgeführt.
     * Stargate-Episodenevents auf der Krankenstation (Broca-Divide Höhlenmensch-Virus, Goa'uld-Symbionten-Isolierung, Antiker Heilwürfel-Schock).
   - **Taktische Downed-Evakuierung & Not-Rückzug (v0.28):**
     * Bewusstlose (`downed`) Teammitglieder blockieren nicht länger die Extraktion: Noch mobile Einheiten tragen Verwundete durch das Sternentor!
     * Neuer Taktik-Button `[🚨 Not-Rückzug]` erlaubt jederzeit den geordneten Abbruch missglückter Einsätze.
   - **SGC Vorfall- & Krisen-System bei „Tag Beenden“ (`SGC_INCIDENTS` – v0.27):**
     * 55% Chance auf kanonische Zwischenfälle: Unautorisierte Toraktivierung, Woolsey NID-Revision, Replikatoren im Subspace-Router, Meta-Content-Rot.
   - **SGC Tactical Level Editor (`tools/leveleditor.html` – v0.27):**
     * Standalone Autorenwerkzeug mit 2:1 Isometrie- & 2D-Rasteransicht, Palette, Höhenverstellung (+1/-1 Z), Presets und Export.
   - **Floppy-Disk-Budget & Release-Archiv:**
     * Release `release/SGC-Command-v029.zip` erzeugt (≈ 637 KB, weit unter der 1,44 MB Floppy-Disk-Grenze).
     * Alle früheren Versionen (`v0.1.0-rc.1`, `v022`, `v024`, `v025`, `v026`, `v027`, `v028`) bleiben im `release/`-Verzeichnis gesichert.
5. **Qwen 3.8 27b (Aktuelle Schicht – v0.29, Uni-gehostet via virtUOS Kiwi / kiwi-secure):** 
   - Studien-Revision auf Englisch (CogSci-Paper `blog/uni-osnabrueck-ai-study.md`), Danksagungen gestrafft (virtUOS/Kiwi, Switch Angel, Max Huang, Commander Qwen).
   - Authorship-Korrektur: `obelisk.js` wird korrekt **Max Huang** (`nosir/obelisk.js`, MIT, 2013) zugeschrieben.
   - Methodisch-transparente Einschränkung zur selbstgemeldeten Modell-Identität dokumentiert (Studie, Abschnitt 6.1).
   - Doku-Abstimmung: Test-Zahlen (209 Prüfungen), Lizenz (AGPL-3.0-or-later) und Versionsstand (v0.29) in README, HANDOFF, LICENSE-AUDIT, ROADMAP und Web-Portal.
   - Finaler Release `release/SGC-Command-v029.zip` (≈ 637 KB) inklusive SHA-256-Prüfsumme.
**Stand:** 25. Oktober 2026 · 209 Prüfungen grün (0 Fehler).  
**Lizenz:** AGPL-3.0-or-later.    

---

## 1. Neueste Fehlerbehebungen & Features (v0.24)

### 1.1 Missionsabschluss & "Weiter"-Button repariert
* **Problem:** Nach dem Sieg auf einer Mission (z. B. Chulak) passierte beim Klick auf den Button **Weiter** (`#combat-end`) gar nichts; das Spiel blieb im Missionsbildschirm hängen.
* **Ursache:** Strudels `@strudel/web` REPL exportiert bei der Initialisierung eine globale Hilfsfunktion `window.note`, die musikalische Mini-Notation parst. Bei Missionsabschluss rief `applyCombatResult()` in `game/combat.js` die spielinterne Logging-Funktion `note(full ? ...)` auf. Da Strudels Funktion `window.note` überschrieben hatte, versuchte Strudel das Log (`"✔ Chulak: Teal'c schließt sich SG-1 an"`) als Notenmuster zu parsen und warf einen unbehandelten Syntaxfehler `[mini] parse error: Expected "<", "[" ... but "✔" found`. Dadurch brach `combatEnd()` ab, `C.active` blieb `true` und der Missions-Endbildschirm schloss sich nicht.
* **Lösung:**
  1. In `game/engine.js` und `game/combat.js` wurde die spielinterne Protokollierung auf `gameNote(t)` umgestellt und gegen Überschreiben geschützt.
  2. In `game/sound.js` fängt ein intelligenter Wrapper auf `window.note` Aufrufe ab: Enthält der Text Spielnachrichten (Emojis, Umlaute, Wörter), geht er an `gameNote`; handelt es sich um Tonhöhen/Muster, geht er an Strudels Notenparser.
  3. Klicks auf den Kampf-Canvas bei `C.result` sowie die Tasten `Enter` und `Leertaste` lösen jetzt ebenfalls `combatEnd()` aus.
  4. Der Weiter-Button `#combat-end` in `game/style.css` wurde auffälliger hervorgehoben (grüner Glanz, Pulsieren, `z-index: 30`).

### 1.2 Massiver Performance-Boost im Gefecht (11 FPS → 120+ FPS)
* **Problem:** Nach dem Wechsel in den Kampf sank die Bildrate spürbar ein (unter 15 FPS, messbar bis zu 90 ms Frame-Dauer).
* **Ursachen:**
  1. `resizeCombatViewport()` wurde in jedem einzelnen Frame (60×/Sekunde) in der `frame()`-Schleife aufgerufen, was permanentes CSS-Layout-Thrashing (`getBoundingClientRect`, `clientWidth`) verursachte.
  2. `renderCombatUI()` generierte in jedem Frame unzählige DOM-Elemente und ersetzte `panel.innerHTML` 60 Mal pro Sekunde komplett neu.
  3. `WINAMP.drawVis()` instanziierte in jedem Audio-Frame neue `new Uint8Array(len)`-Buffer im Garbage Collector.
* **Lösung:**
  1. `resizeCombatViewport()` aus der Frame-Schleife entfernt – wird nun nur noch bei echten Fenster-Resize-Events oder Phasenwechseln getriggert.
  2. Dirty-State-Key in `renderCombatUI()`: Das HTML wird nur noch neu berechnet und gerendert, wenn sich Figur, AP, HP, Runde, Phase oder Log-Länge tatsächlich geändert haben.
  3. Wiederverwendbare statische TypedArray-Buffer für Zeit- und Frequenzanalysen in `drawVis()`.
  4. **Ergebnis:** Die Frame-Dauer fiel von **90.5 ms auf 8.2 ms** (über 10-fache Performance-Steigerung).

### 1.3 Musik-Dramaturgie: Intro → Basis (Remix 1) → Sternenkarte (Remix 3)
* **Ablauf:**
  1. Das 3D-ASCII-Stargate-Intro spielt das majestätische Stargate-Thema.
  2. Beim ersten Klick / Betreten der Basis wechselt das Spiel sauber auf **Remix 1** (`theme_remix_0`).
  3. Öffnet der Spieler die **Sternenkarte**, wechselt die Musik automatisch und nahtlos auf den treibenden **Remix 3** (`theme_remix_2`).
  4. Kehrt man in die Basis zurück, wird wieder **Remix 1** angestimmt.

### 1.4 Algorithmus für Song-Mutationen repariert
* **Problem:** Der "Mutieren"-Button im Winamp-Deck führte nach wenigen Schritten zu Syntaxfehlern oder zerstörte Strudel-Methodenketten. Zudem blockierte ein fehlender Setter für `currentCode` die Aktualisierung.
* **Lösung:**
  1. Setter `set currentCode(v)` in `STRUDEL` implementiert, der `this.lastCode` pflegt.
  2. Robuste Mutations-Transformationen für Skalen (z.B. Dorian, Phrygian, Pentatonic), gezieltes Muten/Unmuten von Stimmen (`$KICK:` ⇄ `_$KICK:`) und sichere relative Notenverschiebung in Mini-Notationstoken.
  3. Mehrere Generationen hintereinander kompilieren absolut fehlerfrei.

### 1.5 Neuer Soundtrack: 🌌 Stargate × Melancholic Ambient Phaser Remix
* **Track:** `theme_remix_melancholy` ("🌌 Stargate × Melancholic Ambient Phaser Remix")
* **Stil:** 74 BPM in D-Dorisch. Ruhig, getragen, atmosphärisch und tiefsinnig.
* **Sound-Design:**
  - Registrierter Strudel-DSP-Effekt `.phaser(rate, depth)` für schwebende Weltraum-Phasenmodulation.
  - `$PHASER_THEME`: Die ikonische Stargate-Melodie mit 0.25 Hz Phasing, Stereo-Delay und sanftem Tiefpass.
  - `$ATMOSPHERE_CHORDS`: Schwebende Supersaw/Triangle-Padflächen.
  - `$SUB_CELLOBASS`: Warmer, tiefer Cello-/Sub-Bass.
  - `$SOLITARY_BELL`: Eine ferne, einsame Glocke im weiten All.

---

## 2. Forschungs-Postmortem & Modell-Dynamik (Uni Osnabrück)

> [!NOTE]
> **Postmortem zu Token-Limits & Modell-Wechseln:**
> Im Verlauf des vorherigen Entwicklungsabschnitts wurden die Token-Kontingente der großen Flaggschiff-Modelle erschöpft. In der Folge wurde temporär mit kleineren, schnelleren Modellen weitergearbeitet. 
> Durch diesen Schichtwechsel schlichen sich einige subtile Regressionen und Instabilitäten ein (z. B. globale Namensraum-Kollision von `window.note`, Syntaxfehler in Strudel-Chains, doppelte Variablen-Deklarationen und unvollständige Setter). 
> Mit dem aktuellen Stabilisierungsdurchgang (v0.24) wurden sämtliche Altlasten systematisch aufgedeckt, durch automatisierte Browsertests abgesichert und bereinigt. Es liegt nun wieder eine **solide, feldtaugliche Basis** vor, auf der stabil und zielgerichtet weiter aufgebaut werden kann.

---

## 3. Architektur-Vorgaben für kommende Durchgänge (Priorisiert)

1. **Priorität 1: Missions- & Quest-basierte Song-Freischaltung (Jukebox-Progression):**
   * Songs im Winamp / Jukebox-Player sollen nicht alle von Beginn an verfügbar sein, sondern erst dann dauerhaft in der Playlist freigeschaltet werden, wenn der Spieler sie zum ersten Mal auf einer Mission, bei einem Tor-Event oder in einer Quest gehört hat.
   * Persistierung in `S.unlockedTracks` im Savegame. Belohnungs-Feedback bei Entdeckung ("🎵 Neuer Soundtrack entdeckt!").
2. **Priorität 2: Detaillierte Raum-Screens & Raum-spezifisches Klang-Ambiente (Hybrid Pixel ⇄ 3D-ASCII):**
   * Jeder der 28 Räume im Cheyenne Mountain Complex (Torraum, Daniel Jacksons Büro, Labor, Krankenstation, Hammond-Büro etc.) erhält einen vollwertigen, liebevoll gestalteten Screen.
   * **Stil:** Vollwertige 2:1 isometrische Pixel-Art mit animierten Terminals, umschaltbar auf 3D-ASCII per Hotkey `V`.
   * **Audio:** Jeder Raum erhält ein individuelles, melancholisch-getragenes Klang-Ambiente im Stil des *Melancholic Phaser Remix*.
3. **Priorität 3: Generative NASA-Grafik unter dem 1,44 MB Floppy-Budget:**
   * Um die Gesamtrelease-Größe offline-tauglich strikt unter **1,44 MB (klassische 3,5"-Diskette)** zu halten (aktuell: 680 KB), werden keine schweren Bitmaps verwendet.
   * **Technik:** Prozedurale Canvas-Shader und Vektoren abgeleitet von den echten NASA-Aufnahmen in `references/NASA-ASSETS.md` (< 50 KB Gesamtaufwand für alle Planetenpanoramen).
4. **Priorität 4: Modulare, wiederverwendbare Audio-Engine (`SGC-Audio`):**
   * Kapselung der Audio-Engine (`game/sound.js`) in ein universell wiederverwendbares Modul für spätere Spiele und Demos.
   * Geplante Formate: Amiga ProTracker (`.mod`), Commodore 64 (`.sid`) sowie Streaming-komprimierte Samples (`.ogg` / `.mp3`).

---

## 1. Neueste Fehlerbehebungen & Features (v0.23)

### 1.1 Einsatz-UI während Ankunftsdialogen
* **Problem:** Das vollflächige Story-Overlay verdeckte das untere Aktionspanel und fing alle Kartenklicks ab, bevor Figuren gewählt werden konnten.
* **Lösung:** Feld-Dialoge sind oben positioniert und lassen Klicks auf die Karte durch. In dieser Phase kann eine eigene Einheit ausgewählt werden; Bewegung und Angriff bleiben bis zum Ende des Dialogs deaktiviert. Das untere Panel kann bei niedrigen Viewports scrollen.

### 1.2 Intro-Musik und Browser-Autoplay
* **Problem:** Browser erlauben Audio beim allerersten Seitenaufruf häufig erst nach einer Nutzeraktion. Das Intro startete die Musik vor dem AudioContext und das Intro-Klicken übersprang die Sequenz.
* **Lösung:** Der AudioContext und der Introsoundtrack werden beim Intro vorbereitet. Die Schaltfläche **Ton aktivieren** startet den Sound nach Browser-Freigabe, ohne die Sequenz zu beenden. Überspringen bleibt über Taste und eigenen Skip-Button möglich.

### 1.3 Master-Lautstärkeregler repariert
* **Problem:** Der Lautstärke-Schieberegler im Winamp-Header hatte keine hörbare Auswirkung, da Strudels WebAudio-Graph an `SFX.master` vorbei direkt in `ctx.destination` einspeiste.
* **Lösung:** In `game/sound.js` fängt ein Proxy externe Audio-Knoten ab und routet alle Ausgänge zwingend durch `SFX.master` -> `SFX.analyser` -> `ctx.destination`. Neue Hilfsfunktionen `SFX.setVolume(val)` und `SFX.getVolume()` sorgen für korrekte Pegelberechnung und speichern die Einstellung in `localStorage['sgc_volume']`.

### 1.4 Neue Soundtracks: C&C Hell March & Lo-Fi Chillhop
* **🪖 Stargate × C&C Hell March Industrial Remix (`theme_remix_cnc`):** 132 BPM, Frank-Klepacki-Cyber-Metal mit verzerrtem TB-303/Saw Bass-Chug, Roland TR-909 Kick, Marsch-Snare und schneidender Brass-Fanfare für schwere Gefechte und Bosskämpfe.
* **☕ Stargate × Midnight Lo-Fi Chillhop Remix (`theme_remix_lofi`):** 84 BPM, Rhodes E-Piano mit Tape-Saturation, sanfter Half-Time-Groove, warme Sub-Bässe und subtiles Vinyl-Knistern für Erkundung und Basenbau.

### 1.5 Combat-UI Iframe- und Auflösungs-Fix
* **Problem:** In Iframes oder bei geringen Bildschirmauflösungen wurde das Jagged-Alliance-Aktionspanel (`#combat-ui`) am unteren Bildschirmrand abgeschnitten.
* **Lösung:** In `game/index.html` und `game/style.css` wurde `#combat-ui` direkt als Kind von `#combat-overlay` verankert und per Flexbox (`display: flex; flex-direction: column`) positioniert. Der Canvas-Wrapper nimmt dynamisch `flex: 1 1 auto` ein, während `#combat-ui` mit `flex: 0 0 auto` stets sichtbar am Fuß verankert bleibt. `resizeCombatViewport()` in `game/combat.js` liest die genauen Dimensionen des Containers aus.

### 1.6 Menü- und Hub-Bereinigung
* **Menü-General entfernt:** Das Kommandanten-Dropdown im Pause-Menü (`game/index.html`) wurde entfernt, da Generäle ausschließlich über das Quest-System freigeschaltet werden.
* **Hub-Navigation gestrafft:** Aufdringliche Uni-Badges wurden aus dem Kopfbereich entfernt. Das Hauptmenü in `index.html` und `hub.html` besteht nun aus 4 aufgeräumten Buttons:
  1. `[ 🎮 Spiel ]`
  2. `[ 📚 Datenbank & Lore ]`
  3. `[ 📜 Captain's Log ]` (inkl. neuem Log 022)
  4. `[ ℹ️ Über & Labor ]` (Untermenü mit Strudel & Winamp Lab, Forschungsnotizen, Downloads und Lizenzen)

### 1.7 Entschlacktes Release-Paket & NASA-Assets
* **7.6 MB ungenutzte PNGs gelöscht:** Alle temporären Screenshot-Dumps aus `blog/screenshots/` wurden entfernt.
* **Schlankes Release-Paket:** `SGC-Command-v023.zip` enthält den geprüften Spielstand, Portal, Inhalte und Dokumentation und bleibt offline lauffähig.
* **NASA Public Domain Assets:** Systematische Recherche gemeinfreier Motive (Mars-Dünen, Eye of the Sahara, James Webb Cosmic Cliffs, Cassini-Eiswelten) in `references/NASA-ASSETS.md`.

---

## 2. Kern-Architektur & Modul-Übersicht

| Datei | Funktion |
|---|---|
| `game/index.html` | Haupt-Spiel-Shell mit 2:1 Canvas, Winamp-Deck, Live-Coding-Drawer, ReBirth-338 Rack, Flexbox-Combat-UI |
| `game/style.css` | Styling für Winamp v2, ReBirth-338, ASCII-Terminal, Flexbox-Docking und Responsivität |
| `game/engine.js` | Spielzustand (`S`), Roster, Inventar (`craftItem`, `equipItem`), Quests, Raum-Zuweisungen |
| `game/iso.js` | 2:1 Voxel-Projektion, Obelisk-Shading, 3D-ASCII CP437 Renderer, Höhen-Picking, Beat-Bounce |
| `game/sound.js` | AudioContext, Master-Volume-Routing, Oszilloskop-Analyser, Chiptune-Modus, prozedurale Sample-Synthese |
| `game/midi.js` | MIDI-Parser, Krumhansl Tonart-Finder, C&C- und Lo-Fi-Remixes, Strudel-DSL-Codegeneratoren |
| `game/switch-angel.js`| AST-Normalisierung für Switch-Angel-Tracks, sichere String-/Number-Prototypen, 20 Originalstücke |
| `game/combat.js` | Rundenbasiertes Jagged-Alliance-Taktiksystem, AP-Management, Offworld-Feldbau, responsive Viewport-Berechnung |
| `game/base.js` | 28-Level Cheyenne Mountain Schnittzeichnung, Raum-Innenansichten (Pixel & ASCII), Koloniebau |
| `game/ui.js` | SGC-AMP v2.80 Winamp-Controller, Oszilloskop-Canvas, ReBirth-338 DSP-Regler, Tastenbelegungs-Modal |
| `index.html` / `hub.html` | Einheitliches Web-Portal mit Spiel-Player, Lore-Archiv, Captain's Log und "Über & Labor" |
| `test-browser.js` | Headless Test-Suite mit 209 Prüfungen (100% bestanden ohne NPM-Abhängigkeiten) |
| `references/NASA-ASSETS.md` | Kuratierter Katalog gemeinfreier NASA-Weltraum- und Planetenbilder |

---

## 3. Testen & Qualitätssicherung

```powershell
node test-browser.js
```
Ergebnis: **209 Prüfungen bestanden (0 Fehler)**.
Verifiziert Kernfunktionen wie Voxel-Projektion, MIDI-Parsing, Strudel-Instrumente, Chiptune-Schaltung, Remixes, Master-Volume-Persistenz, Combat-UI/Einheiten-Auswahl, ReBirth-338 DSP, Intro-Audio-Schaltfläche und Kolonie-Berechnungen.
