# Captain's Log 037 – „Chevron 8: Die dritte Dimension“

**Release:** SGC Command 0.37 („Chevron 8: Die dritte Dimension“)  
**Datum:** 26. Oktober 2026  
**Autorenschaft:** Gemini 4 Argon & Gemini 3.8 Flash High (Multi-Agenten-Pair-Programming mit Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5)  
**Motto:** *„Chevron 8 ist eingerastet – das Stargate öffnet sich in die dritte Dimension und spricht neun Weltsprachen!“*

---

## 1. Neuer Release-Name & Versionsstand 0.37

Mit dem Einbau einer vollwertigen, abhängigkeitsfreien **3D-WebGL-Grafikschicht** (`PIXEL ⇄ ASCII ⇄ 3D-GL ⇄ 2D`), der Überarbeitung des Cheyenne-Mountain-Tunneleingangs und der Freischaltung aller **9 geplanten Weltsprachen** erhält Version **0.37** ihren eigenen, kanonischen Release-Namen:

> **SGC Command 0.37 · „Chevron 8: Die dritte Dimension“**

Gleichzeitig wurde die Autorenzeile projektweit in allen Dokumenten, Readmes und Portal-Footern auf die reale Multi-Agenten-Staffel korrigiert:

> *Entwickelt im autonomen Multi-Agenten-Pair-Programming (Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5) · Lizenziert unter AGPL-3.0-or-later*

---

## 2. Kanonischer Grundriss: Torraum 2×2 in der linken Ecke & Save-Migration

Nach Abgleich mit den originalen Cheyenne Mountain Blaupausen von Ebene 28 und Ebene 27 wurde die Raumaufteilung der Stargate-Kommandozentrale im Querschnitts-Canvas perfektioniert:

```
[ Ebene 27 ]  [    TORRAUM     ]  [ BESPRECHUNG (SG-1) ]  [ BÜRO GEN. HAMMOND  ]
[ Ebene 28 ]  [  STARGATE 2x2  ]  [ KONTROLLRAUM WALTER]  [ MALP & AUSRÜSTUNG  ]
              Spalten 0 .. 1      Spalten 2 .. 3          Spalten 4 .. 5
```

### 📐 Die architektonischen Highlights:
1. **2×2 Torraum (`w: 2, h: 2`, 130 × 72 px):** Der Stargate-Silo sitzt nun exakt in der unteren linken Ecke (`x: 0, y: 0`), flankiert von Betonpfeilern, einer Stahlrampe mit gelben Sicherheitsstreifen, leuchtenden Chevrons, animiertem Ereignishorizont und bewaffnetem Air-Force-Wachposten.
2. **Kontrollraum & Besprechungsraum (Spalten 2–3):**
   - **Ebene 28:** Chief Walter Harriman am dreifachen Anwahl-Monitor mit Aussichtsfenster direkt auf das Sternentor. Klick spielt Walters Funksprüche und das Gate-Aktivierungs-Audio ab.
   - **Ebene 27:** Konferenztisch von SG-1 mit Fenster-Blick hinab in den Torraum.
3. **General's Office & MALP (Spalten 4–5):**
   - **Ebene 27:** Büro von General George Hammond mit rotem Notfalltelefon und interaktivem Klemmbrett-Hotspot (`showClipboardModal()`).
   - **Ebene 28:** Staging-Bereich für MALP-Tiefensonden und Missions-Kisten.
4. **Automatische Savegame-Migration (`ensureGateLayout`):**
   - Bestehende Spielstände im `localStorage` mit alten Koordinaten werden beim Laden automatisch erkannt: Alte Zellen werden gereinigt, der Torraum auf `x:0, y:0, w:2, h:2` neu verankert und das Gitter re-initialisiert.

---

## 3. SGC Ebene 28 Taktik-Karte & Foothold-Infiltration

Auf Basis des Originalplans von Cheyenne Mountain Complex Ebene 28 wurde die taktische Gefechtskarte `MAPS.sgc` von Grund auf neu gestaltet:

* **Grundriss (20 × 15 Kacheln):** Torraum mit Rampe und Tor (`GG`) oben links, Panzertor (`H`) zum Tunnelkorridor mit Wandleuchten, Kontrollraum oben rechts mit Pulten und Konsolen (`l.l`), Laboratorien unten links und Evakuierungs-Schächte.
* **Neuer Einsatz `1-6: Ebene 28: Infiltrationsalarm` (Foothold):** Feindliche Einheiten brechen direkt durch das Erdtor ein. SG-1 muss den Torraum sichern und die Panzertore verteidigen.
* **Test-Preset `sgc_defense`:** Im Speichermenü (`SGC_SAVES.presets.sgc_defense`) lässt sich das Infiltrations-Szenario mit voll ausgerüstetem SG-1-Team sofort mit einem einzigen Klick starten und testen.

---

## 4. In-Mission Audio & Sound-Steuerung

Bisher überdeckte das Kampf-Overlay während eines Einsatzes das gesamte Interface, sodass Spieler weder die Lautstärke anpassen noch Tracks umschalten konnten.

1. **Audio-Schnellzugriff:** Im unteren Aktionspanel (`#combat-ui`) und in der schwebenden Leiste oben rechts im Gefecht (`#combat-audio-bar`) stehen ab sofort zur Verfügung:
   - `[ 🔊 / 🔇 ]`: Sofortiges Stummschalten bzw. Reaktivieren des Gesamtsounds (`toggleCombatAudio()`).
   - `[ 📻 SGC-AMP ]`: Öffnet die voll interaktive Retro-Winamp-Workstation mitten im Gefecht als modales Fenster – inklusive Oszilloskop, Track-Wahl und Live-Coding.
2. **Drei neue Strudel-Remixes (`game/midi.js`):**
   - 🚨 **SGC Ebene 28: Foothold Alien Infiltration** (140 BPM, Dark Electro Synthwave mit Alarm-Lead, Acid-303-Bass & TR-808 Beat).
   - 🐍 **Apophis' Ha'tak Flotte (Dark Pharaoh Electro)** (130 BPM, bedrohliche Goa'uld-Blechbläser & mächtiger Sub-Bass).
   - 🌊 **Stargate Atlantis × Liquid Drum & Bass** (168 BPM, schwebender Pegasus-Chor, rollender Amen/D&B-Breakbeat & warmer 808-Sub).
   Damit wächst die Sammlung auf **18 Stargate-Themes** und insgesamt **38 spielbare Tracks**!

---

## 5. Autobattler im Zuschauermodus (Watch Mode)

Für Spieler, die das Gefecht entspannt verfolgen möchten, wurde der Autobattler substanziell erweitert:

1. **Dynamische Kameraverfolgung (`panCombatCamera`):** Während des Auto-Kampfs zentriert die Kamera automatisch auf den jeweils handelnden Soldaten oder attackierenden Feind.
2. **Status-Banner:** Ein pulsierendes HUD-Banner signalisiert `[ 🤖 AUTOBATTLER AKTIV · ZUSCHAUERMODUS ]` mit Ein-Klick-Möglichkeit zur manuellen Übernahme.
3. **Missions-Startbutton:** In der Sternenkarte kann ein Einsatz neben dem taktischen Modus nun direkt via `[ 🤖 Auto-Mission ]` gestartet werden.

---

## 6. Bereinigung & Base-Sidebar Polish

* **Keine lokalen Fetch-Abbrüche mehr:** Der fehleranfällige `tab-logs`-Tab (der unter `file://` an Browser-CORS scheiterte) wurde aus `index.html` und `hub.html` vollständig entfernt.
* **SGC-Forschungsübersicht im Seitenbereich:** Der bisherige, redundante 12-Button-Tech-Tree in `#base-side` wurde durch eine kompakte Statuskarte mit Fortschrittsbalken und Direktlink zum Astrophysik-Labor ersetzt.
* **Klebende Seitenleiste:** `#base-side` bleibt beim vertikalen Scrollen der 28 Bunker-Ebenen am oberen Bildschirmrand verankert (`sticky`) und besitzt elegante dunkle Scrollbalken.

---

## 7. Kanonische Welten & Einsätze

Das Stargate-Universum wurde um 15 legendäre Welten der Serie erweitert (von Urgos Kunstwelt über Pangar, Cassandra's Heimat Hanka, P3X-666 bis zu den schwebenden Städten der Nox).

* **Planeten:** 47 kanonische Sternensysteme mit echten Toradressen und Beschreibungen.
* **Missionsbaum:** 32 Einsätze über 5 Kapitel verteilt.

---

## 8. Cheyenne Mountain Complex: Ikonischer Tunneleingang & 2×2 Torraum-Tiefe (`game/base.js`)

Auf Grundlage der originalen Filmaufnahmen des Cheyenne Mountain Complex in Colorado Springs wurde der äußere Zugang (`drawSurface`) sowie der 2×2 Torraum (`drawBuiltRoom`) komplett überarbeitet:

1. **Kanonischer Tunneleingang (`drawSurface`):**
   - **Doppelte Wellblech-Schutzröhren:** Die charakteristische halbkreisförmige Wellblech-Stahlröhre ragt plastisch aus dem Granitmassiv heraus, flankiert von einer zweiten, höher versetzten Röhre und den zwei ockerfarbenen Belüftungsrohren auf der linken Seite.
   - **Bogen-Inschrift & Zufahrt:** Der braune Stahlbogen trägt den Schriftzug `CHEYENNE MOUNTAIN COMPLEX`. Darunter führt die perspektivische Asphaltstraße mit doppelter gelber Mittellinie, weißem Zebrastreifen, Flutlichtmasten, M35-Militärtruck und patrouillierenden SF-Wachen in den abgedunkelten Bergstollen.
   - **Nato-Draht & Wachposten:** Entlang der Zufahrt und der Felsböschung verlaufen Maschendrahtzäune mit glänzenden Nato-Draht-Spiralrollen (`_drawRazorWireFence`) sowie das Wachgebäude mit seinem markanten blauen Trapezblech-Dachrand.
2. **Tiefenwirkung im 2×2 Torraum (`drawBuiltRoom` & `renderBaseAscii`):**
   - Perspektivische Beton-Schotten, Decken-Kranseile, pulsierende gelbe Warnleuchten an den Seitenpfeilern, seitliche Beobachtungsfenster zum Besprechungs- (L27) und Kontrollraum (L28) sowie ein rotierender innerer Glyphenring mit 39 Segmenten, 9 leuchtenden Chevrons, mehrschichtigem Ereignishorizont und 3D-Gitterrampe mit Handläufen.

---

## 9. Zero-Dependency 3D-Grafikschicht (`game/gl3d.js` – WebGL & 3D-Perspektive)

Um trotz der strikten **1,44 MB Floppy-Disk-Grenze** und **100% Offline / Zero-Dependency-Regel** (kein 600KB+ `three.js`) eine echte 3D-Grafikschicht anzubieten, wurde mit `game/gl3d.js` (~13 KB) eine eigenständige 3D-Engine in purem JavaScript entwickelt:

* **Architektur:** Eigener `Float32Array(16)` Matrix-Kernel (`mat4Perspective`, `mat4LookAt`, `mat4Multiply`, `project`) kombiniert mit einer nativen **WebGL 1.0 Hardware-Shader-Pipeline** (Offscreen-WebGL-Canvas mit GLSL-Direktlicht- & Hologramm-Scanline-Shadern, der verlustfrei auf die 2D-Canvases komponiert wird) sowie einem identischen 3D-Software-Projektions-Fallback für Headless-Umgebungen (`test-browser.js`).
* **Überall verfügbar (`PIXEL ⇄ ASCII ⇄ 3D-GL ⇄ 2D` via Taste `V`):**
  1. **Taktisches 3D-Gefecht (`GL3D.renderCombat`):** Echte 3D-Perspektivansicht des Schlachtfelds mit extrudierten 3D-Terrainblöcken, drehbarem 3D-Stargate-Torus samt 9 Chevrons, 3D-Einheiten-Sockeln, Laser-Tracern und präzisem 3D-Raycasting/Mouse-Picking (`ISO.lastHitMap`).
  2. **Astria Porta 3D-Hologramm-Sternenkarte (`GL3D.renderStarMap`):** Direkt in der Sternenkarte per Button `[ 🌐 3D-Hologramm-Projektion ]` (oder im `3D-GL`-Modus) aktivierbar – mit rotierender 3D-Galaxie-Sphäre, gekrümmten 3D-Wurmloch-Bahnen, Orbit-Ringen und vollem Planeten-Picking (`MAP.nodes`).
  3. **3D-Basis- & Kolonie-Ansicht (`GL3D.renderBase`, `GL3D.renderColony`, `GL3D.renderStargateCard`).**

---

## 10. Jukebox-Progression im SGC-AMP & Kamera-Zoom-HUD

1. **Missions- & Entdeckungs-basierte Track-Freischaltung (`S.unlockedTracks`):**
   - Noch nicht entdeckte Soundtracks werden in der Winamp-Playlist (`renderWinampPlaylistHTML`) komplett ausgeblendet, bis der Spieler sie im Spielverlauf (durch Missionen, Tor-Anwahlen, Planeten-Entdeckungen oder Quests) zum ersten Mal hört bzw. freischaltet.
   - Ein Sammlungs-Banner (`🎵 JUKEBOX-SAMMLUNG: X / Y FREIGESCHALTET`) zeigt den Fortschritt je Kategorie; bei Neuentdeckung erscheint ein Toast- und Log-Feedback (`🎵 Neuer Soundtrack entdeckt: ...`).
2. **On-Screen Zoom-Buttons & Dynamische Minimap:**
   - Im Gefechts-HUD (`#combat-audio-bar` und `#combat-ui`) erlauben dezente Buttons (`[ 🔍− ]`, `[ 100% ]`, `[ 🔍+ ]`) das direkte Skalieren der Kamera auch ohne Mausrad.
   - Das weiße Sichtfeld-Rechteck auf der Minimap (`drawCombatMinimap`, `C.minimapViewRect`) skaliert nun proportional zum aktuellen `ISO.zoom`-Faktor.

---

## 11. Code-Auditing, Deduplizierung & Performance-Tuning

* **Redundanzen beseitigt:** Die veraltete, doppelt definierte `drawMap()`-Funktion in `game/art.js` (~45 Zeilen Dead Code) sowie die doppelt deklarierte `cycleGfxMode()`-Funktion in `game/ui.js` wurden entfernt und in `game/iso.js` zusammengeführt.
* **Minimap- & FX-Hotpath-Optimierung (`game/combat.js`):** Das statische Minimap-Terrain (`GW × GH` Kacheln) wird nun in einem Offscreen-Canvas (`C._minimapCache`) gecacht statt 60× pro Sekunde neu gezeichnet zu werden; `updateFx()` vermeidet unnötige Array-Allokationen im Leerlauf.

---

## 12. 9-Sprachen-Lokalisierung, 3D-Kolonie-Tor & 3D-Basis-Kommandoräume

1. **Alle 9 Stargate-Sprachen aktiv (`game/i18n.js` & `game/i18n-languages.js`):**
   - Neben **Deutsch (`de`)** und **English (`en`)** sind nun auch alle 7 geplanten Weltsprachen (**Español (`es`), Français (`fr`), 中文 (`zh`), 日本語 (`ja`), Русский (`ru`), Português (`pt`), العربية (`ar`)**) mit 100% Key-Abdeckung (`0` fehlende Keys) und direktem Sprachwähler im Portal, Hub und In-Game-Header verfügbar.
2. **3D-Stargate in der Planeten-Kolonie (`GL3D.renderColony` & `renderColonyPixel`):**
   - Sektor `(2,2)` rendert nun sowohl im Pixel-Voxel-Modus als auch im `3D-GL`-Modus ein vollständiges Stargate mit mehrstufigem Naquadah-Podest, Zugangsrampe, DHD-Konsole, 9 leuchtenden Chevrons und pulsierendem Ereignishorizont exakt auf der Sektor-Kachel `(2,2)` (auch auf noch unbewohnten Welten vor Gründung eines Außenpostens).
3. **Vollständige Raum-Parität im `3D-GL` Basis-Cutaway (`drawSgcCommandRooms`):**
   - Die vier kanonischen Kommandoräume auf Ebene 27 & 28 (`BESPRECHUNG (SG-1)`, `BÜRO: GEN. GEORGE HAMMOND`, `KONTROLLRAUM (WALTER)`, `MALP & AUSRÜSTUNG`) sowie alle Korridor-Buchten (`drawLevelArchitecture`) werden nun im `3D-GL`-Modus identisch zum Pixel-Modus mit zusätzlicher 3D-Tiefenextrusion gezeichnet.

---

## 13. Finaler Release-Pass 0.37: Waffenkammer/Werkstatt/Lager-Fenster, 55 Welten, 3D-Hex-Zoom, Freie 360°-3D-Kamera & Gate-Austritts-Intro

1. **Durchgängige Lokalisierung (Krankenstation, Kolonien, Forschung & Berichte):**
   - Alle bisher noch auf Deutsch verbliebenen Ansichten – insbesondere Dr. Janet Fraisers Krankenstation (`renderMedbayView` auf Ebene 21), die Kolonie-Verwaltung (`renderColoniesView`), das Forschungslabor (`showResearchModal`), die Personalakten (`showDossier`) und der Tagesbericht (`showReport`) – passen sich nun nahtlos an den Sprachwähler (`DE`, `EN`, `ES`, `FR`, `ZH`, `JA`, `RU`, `PT`, `AR`) an.
2. **SGC-AMP Audio-Balancing, Codevault-Entdeckung & 2 neue SGC Core Songs:**
   - Alle 20 Switch-Angel-Tracks im **Codevault** (`sa_*`) starten nun gesperrt (`0 / 20`) und werden erst dynamisch beim Erkunden neuer Planeten (`discover()`) und bei Missionssiegen (`MUSIC_PROGRESS.unlockForPlanet()`) freigeschaltet.
   - Die Lautstärke aller **SGC Core** Songs wurde kräftig angehoben (`.gain(0.50..0.88)` + `StrudelVoice.prototype.gain` Normalisierung) und um zwei neue Kompositionen erweitert: `armory` (*„Ebene 16 – Naquadah-Schmiede & Arsenal“*) und `cheyenne` (*„Cheyenne Mountain – Deep Bunker Groove“*).
3. **Dediziertes Fenster & Raumgrafiken für Waffenkammer, Werkstatt & Hauptlager (`showArmoryModal`):**
   - Das Basis-Seitenmenü (`renderBaseSide`) wurde entschlackt: Statt der langen Inline-Rezeptliste öffnet ein Klick auf `[ 🛠 Werkstatt & Bau ]`, `[ 📦 Lager & Arsenal ]`, den Header-Button `🛠` oder die Räume im Cutaway das neue Quartiermeister-Fenster (`showArmoryModal`) mit animierter Raumgrafik (`#armory-modal-cv`), Rezept-Schmiede, Lagerbestand und Truppen-Direktausrüstung. Zudem startet das SGC mit einem eigenen **Hauptlager (`storage`)** auf Ebene 4.
4. **55 Planeten, 51 Missionen & 100% Durchspielbarkeits-Garantie:**
   - 8 weitere kanonische Welten (`edora`, `onas`, `velona`, `revanna`, `erebus`, `pegasus_relay`, `sodan`, `orilla`) und 16 neue Einsätze erweitern die Kampagne auf **55 Welten** und **51 Missionen**.
   - `openMissions()` zeigt alle offenen Einsätze bis zum aktuellen Kapitel an, `checkChapterAdvance()` schaltet Kapitel automatisch weiter, und `getPlanetPatrolMission(planetId)` garantiert, dass jeder entdeckte Planet jederzeit eine spielbare Mission bereithält.
5. **Single-Click „Tag beenden“ (`doDay`) Fix:**
   - `#story-dialogue` blockiert keine Klicks mehr auf `<header>`/`<nav>` (`pointer-events: none` auf dem Backdrop), und ein einzelner Klick auf `▶ Tag beenden` schließt offene Dialoge/Berichte zuverlässig und schaltet sofort in den nächsten Tag.
6. **3D-Hex-Taktik mit vollem Zoom (`game/hex-render.js`), Freie 360°-3D-Kamera & Gate-Austritts-Intro:**
   - Der Hex-Renderer zeichnet nun echte 3D-Hex-Prismen mit schattierten Seitenflächen, ein detailliertes Hex-Stargate mit 9 Chevrons & Ereignishorizont sowie SG-1-Charaktersprites und skaliert inklusive Maus-Picking stufenlos mit `ISO.zoom` (`50%`–`225%`).
   - Im `3D-GL`-Modus lässt sich die Kamera per Maus-Drag oder `Q`/`E` frei um 360° drehen (`GL3D.orbit`). Zu Beginn jedes Einsatzes startet zudem das **Gate-Austritts-Kamera-Intro (`C.gateIntroStart`)**, das aus dem Stargate-Ereignishorizont herauszoomt und sich drehend auf das taktische Spielfeld zentriert.
7. **Testsuite:** Alle **357 automatisierten Prüfungen** in `node test-browser.js` laufen mit **0 Fehlern** durch.

