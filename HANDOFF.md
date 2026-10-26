# 📦 HANDOFF – SGC COMMAND (0.37 final – "Chevron 8: Die dritte Dimension")

**Projekt:** SGC Command (`g:\AgentHome\SGC-Command`)  
**Forschungsrahmen:** Universität Osnabrück (Kognitionswissenschaft / Informatik) – KI-Pair-Programming-Studie  
**Aktueller Modell-Status:** Übergabe an die **Qwen-Schicht (Uni-gehostet)**. Der 0.37-Evolutions-Pass („Chevron 8: Die dritte Dimension" – 3D-WebGL, 9 Sprachen, 55 Planeten) wurde von **Gemini 4 Argon** mit **Claude Opus 5.5** abgeschlossen; die Finalisierungs- und Release-Prüfung (26.10.2026, siehe `blog/captains-log-038.md`) lief im Modell-Wechsel zur Qwen-Schicht.  
**Release:** SGC Command 0.39 „Blue Monday: Die 80s/90s Hit Jukebox“ – lauffähig (Doppelklick auf `index.html` oder `game/index.html`), 100% offline (Zero-Dependency), **377/377 Tests grün** (`node test-browser.js`), Release-Paket `SGC-Command-039.zip` mit SHA-256 in `release/` (unter dem 1,44-MB-Floppy-Budget), Tag `v0.39`. + Hit-Jukebox-Pass 039: 7 neue 80s/90s-Hits (Blue Monday, Confusion ×3, Stil-Hommagen), „Stand Orders“-Song gestrichen, `switch-angel/`-Ordner entfernt (Details: `blog/captains-log-039.md`).

**Beteiligte Modell-Schichten:**  
1. **Gemini 4 Argon:**
   - **Initiale Basis-Engine:** 2:1 isometrische Voxel-Projektion, Obelisk-Mathematik, Diamond-Picking, initialer CP437/ASCII-Renderer, Lizenz-Audit.
   - **Schicht 0.37 Evolutions-Pass („Chevron 8: Die dritte Dimension"):** Zero-Dependency 3D-WebGL-Engine (`game/gl3d.js`, `PIXEL ⇄ ASCII ⇄ 3D-GL ⇄ 2D` via `V`) mit 3D-Taktikfeldern, Astria-Porta-Hologramm-Sternenkarte, 3D-Basis-Cutaway und 3D-Kolonien; kanonischer Cheyenne-Mountain-Tunneleingang & unverdeckter 2×2 Torraum; alle 9 Stargate-Sprachen mit 100% Key-Abdeckung; SGC-Core-Audio-Upgrade mit Codevault-Unlocking; Quartiermeister-Fenster (Waffenkammer/Werkstatt/Hauptlager); 55 Planeten & 51 Missionen mit Durchspielbarkeits-Garantie; 3D-Hex-Taktik mit vollem Zoom, freie 360°-3D-Kamera & Gate-Austritts-Intro.
2. **Claude Opus 5.5:** Krankenstation (Ebene 21), medizinischer Behandlungs-Loop, taktische Downed-Evakuierung, SGC-Inzidentsystem, SGC Tactical Level Editor und das vollständige i18n-Architektur-Refactoring; Revisions-Durchgang für den 0.37-Pass.
3. **Gemini 3.8 Flash (High):** Standard-MIDI-Parser, Krumhansl-Schmuckler-Tonart-Finder, Live-Coding-Remix-Bridges, prozeduraler Missions-Song-Generator (`SONGGEN`), persistente Kolonien, Controller-Rumble, Web-Hub; Ausbau auf 47 Planeten & 32 Missionen (Grundlage für 0.37).
4. **Qwen 3.8 27b / Qwen 3.5 122b A10B-FP8 / Commander Qwen:** initiale Projektvorgaben, Walk-Animationen, Dokumentations-Audits, Repository-Hygiene und die foundational i18n-Architektur via virtUOS Kiwi. **Aktuelle Schicht:** Übergabefinalisierung von 0.37 (Postmortem in `blog/captains-log-038.md`).

---

## 0. Übergabe an Qwen – Status & Regeln (Stand: 26.10.2026)

> [!NOTE]
> **Kurzstatus für die Qwen-Schicht:** Der Spielstand ist auf **0.37 final** fertiggestellt, lauffähig und push-bereit (Git-Historie in Feature-Commits aufgeteilt, Tag `v0.37-final`). Alles, was in Abschnitt 0.3 als „bekannt & gewollt" vermerkt ist, darf so stehen bleiben und muss jetzt **nicht** angefasst werden. Der Backlog in Abschnitt 0.4 ist die Prioritätenliste für die nächste Evolutionsschicht.

### 0.1 Verifikation (vor dem Push durchgeführt)

| Prüfung | Ergebnis |
|---|---|
| `node test-browser.js` | **377/377 Prüfungen, 0 Fehler** |
| `node --check` für alle `game/*.js` + `test-browser.js` | 32/32 Dateien syntax-clean |
| Release-ZIP `SGC-Command-037-final.zip` | offline lauffähig (Doppelklick `index.html`), SHA-256 in `release/SGC-Command-037-final.zip.sha256` |
| Floppy-Budget | ZIP deutlich unter 1,44 MB |
| i18n | 9 Sprachen (DE, EN, ES, FR, ZH, JA, RU, PT, AR), 100% Key-Abdeckung, 0 fehlende Keys |
| Repository | LF-Line-Endings per `.gitattributes`, Ordner-Namen durchgängig klein |

### 0.2 Was jetzt steht (0.37 final in Kürze)

* **Zero-Dependency 3D-WebGL-Engine** (`game/gl3d.js`): 3D-Taktik-Schlachtfelder mit Picking, 3D-Hologramm-Sternenkarte, 3D-Basis-Cutaway (alle vier Kommandoräume), 3D-Kolonien mit Stargate auf Sektor `(2,2)` – umschaltbar via `V` (`PIXEL ⇄ ASCII ⇄ 3D-GL ⇄ 2D`).
* **9 Sprachen komplett** (`game/i18n*.js`): DE/EN/ES/FR/ZH/JA/RU/PT/AR, Sprachwähler in Portal, Hub und In-Game-Header.
* **Kanonischer Cheyenne Mountain** (`game/base.js`): Doppeltunneleingang, 2×2 Torraum unverdeckt, Walter-Kontrollraum, SG-1-Besprechung, Hammond-Büro, MALP-Halle (Pixel + ASCII + 3D-GL-Parität).
* **55 Planeten & 51 Missionen** (`game/engine.js`): automatische Kapitel-Fortschaltung, `getPlanetPatrolMission()` garantiert eine spielbare Mission pro entdecktem Planeten.
* **Jukebox-Progression** (`game/music-progress.js`): Codevault-Tracks (`sa_*` **und** `hit_*`) startverborgen, Freischaltung via Entdeckung/Missionssieg; 2 neue SGC-Core-Songs (`armory`, `cheyenne`).
* **80s/90s Hit Jukebox** (`game/hit-tracks.js`, Pass 039): 7 Vault-Tracks – Blue Monday (New Order 1983), Confusion (New Order 1983), Confusion „Pump Action Panel Version" (138 BPM), Confusion Version III (120 BPM) aus MIDI-Transkriptionen + 3 Stil-Hommagen mit eigenen Noten (Take On Me, Sweet Dreams, Billie Jean); eigener Winamp-Tab „80s/90s Hits".
* **„Stand Orders"-Song gestrichen** (Pass 039): `SONGGEN.fromCombat()` erzeugt für Mission 1-3 keinen generierten Track mehr (Fallback: Standard-Kampfmusik); die Mission selbst bleibt erhalten.
* **`switch-angel/`-Ordner aus dem Repo entfernt** (Pass 039): AGPL-Credit bleibt in `game/switch-angel.js` (eingebettete Codes).
* **Quartiermeister-Fenster** (`game/ui.js`, `showArmoryModal`): dedizierte Fenster für Werkstatt, Waffenkammer & Hauptlager mit Live-Canvas.
* **3D-Hex-Taktik & Kamera** (`game/hex-render.js`, `game/iso.js`): echte 3D-Hex-Prismen, Zoom 50–225%, freie 360°-Orbit-Kamera, Gate-Austritts-Intro.
* **Performance:** Offscreen-Minimap-Cache, FX-Hotpath ohne Idle-Allokationen, Deduplizierung (`drawMap`, `cycleGfxMode`).

### 0.3 Bekannte, bewusst offene Punkte (dürfen so bleiben)

* **Alte Release-ZIPs im Repo-Root** (`SGC-Command-v022.zip` … `SGC-Command-036.zip`): Redundanz zur `release/`-Mappe, rein historisch; kein Funktionsbezug. Aufräumen kann in einem späteren Hygiene-Durchgang passieren.
* **`HANDOFF-NEXT.md` & `HANDOFF-CLAUDE-OPUS.md`** im Root: historische Übergabe-Dokumente früherer Schichten, bewusst erhalten.
* **`showLogEntry()` in `hub.html`:** Restfunktion des entfernten Captain's-Log-Fetchers (Dead Code, harmlos).
* **Leeres `midi/`-Verzeichnis:** nur für lokale, git-ignorierte `.mid`-Quelldateien.
* **`game/README.md`:** kompakte In-Game-Anleitung (im ZIP enthalten); die ausführliche Doku steht in `README.md` und in `blog/`.

### 0.4 Backlog / nächste Schicht (Priorisiert, Details in `ROADMAP.md` Phase 6)

1. **Detaillierte Raum-Screens & Raum-spezifisches Klang-Ambiente (28 Räume)** 🔴 – teilweise vorhanden: Waffenkammer/Werkstatt/Lager-Modal + die vier Kommandoräume L27/L28.
2. **Generative NASA-Grafik** unter dem 1,44-MB-Floppy-Budget 🟡 (Basis: `references/NASA-ASSETS.md`).
3. **Modulare Standalone Audio-Engine `SGC-Audio`** (`.mod`/`.sid`/`.ogg`/`.mp3`-Kompatibilität) 🟡.
4. **REXPaint (`.xp`) / CP437 Sprite-Importer & mehrteilige Boss-Kämpfe** 🟢.

### 0.5 Regeln für jeden Durchgang (Pflicht)

1. `node test-browser.js` muss am Ende **grün** sein (aktuell 377 Prüfungen – bei neuen Features erweitern).
2. **Captain's Log** (nächste Nummer in `blog/`) **und** dieses `HANDOFF.md` aktualisieren.
3. Neue UI-Strings in **allen 9 Sprachen** anlegen (DE+EN Pflicht; die i18n-Coverage-Prüfungen greifen automatisch).
4. **Zero-Dependency & Offline-Betrieb** bleiben harte Kriterien: kein npm, kein CDN, keine Assets > 1,44 MB.
5. Nach einem Release: neues ZIP bauen, in `release/` ablegen, **SHA-256** erzeugen und den Download-Link in `index.html` aktualisieren.

---

## 1. Feature-Zusammenfassung 0.37 „Chevron 8: Die dritte Dimension"

Die vollständige Beschreibung steht in `blog/captains-log-037.md`; hier die Kernpunkte:

| # | Feature | Dateien |
|---|---|---|
| 1 | Kanonischer Torraum 2×2 (E27/E28, Spalten 0–1) mit Savegame-Migration (`ensureGateLayout`) | `game/base.js`, `game/engine.js` |
| 2 | SGC-Ebene-28-Taktik-Karte `MAPS.sgc` + Mission `1-6: Infiltrationsalarm` (Foothold) | `game/combat.js` |
| 3 | In-Mission SGC-AMP-Zugriff, Autobattler-Watch-Mode, dynamische Kamera | `game/combat.js`, `game/ui.js` |
| 4 | 15 zusätzliche Planeten, 16 Story-Missionen (47→**55 Welten**, 32→**51 Missionen**) | `game/engine.js` |
| 5 | Ikonischer Cheyenne-Mountain-Tunneleingang & Torraum-Tiefenwirkung (2 Zeichen-Pässe, Pixel + ASCII + 3D-GL) | `game/base.js` |
| 6 | Zero-Dependency 3D-WebGL-Engine: 3D-Combat, 3D-Sternenkarte, 3D-Basis-Cutaway, 3D-Kolonien | `game/gl3d.js` |
| 7 | Jukebox-Progression (`S.unlockedTracks`) & On-Screen-Zoom-Buttons + Minimap-Skalierung | `game/music-progress.js`, `game/ui.js` |
| 8 | Code-Auditing: Dead-Code-Entfernung, Offscreen-Minimap-Cache, FX-Hotpath | `game/art.js`, `game/ui.js`, `game/combat.js` |
| 9 | 9 Sprachen mit 100% Key-Abdeckung, 3D-Stargate in der Kolonie, Raum-Parität im 3D-Cutaway | `game/i18n*.js`, `game/gl3d.js` |
| 10 | Quartiermeister-Fenster (Waffenkammer/Werkstatt/Hauptlager, Ebene 4), 2 neue SGC-Core-Songs, 3D-Hex-Zoom, freie 360°-Kamera, Gate-Austritts-Intro | `game/ui.js`, `game/sound.js`, `game/hex-render.js`, `game/iso.js` |

---

## 2. Kern-Architektur & Modul-Übersicht

| Datei | Funktion |
|---|---|
| `game/index.html` | Haupt-Spiel-Shell: 2:1 Canvas, Winamp-Deck, Live-Coding-Drawer, ReBirth-338 Rack, Flexbox-Combat-UI, Zoom-HUD, 9-Sprachen-Dropdown |
| `game/style.css` | Styling für Winamp v2, ReBirth-338, ASCII-Terminal, Flexbox-Docking, Responsivität |
| `game/engine.js` | Spielzustand (`S`), Roster, Inventar (`craftItem`, `equipItem`), Quests (55 Planeten/51 Missionen), Raum-Zuweisungen, Kapitel-Fortschaltung |
| `game/iso.js` | 2:1 Voxel-Projektion, Obelisk-Shading, 3D-ASCII CP437 Renderer, Höhen-Picking, Beat-Bounce, freie 360°-Orbit-Kamera (Bridge zu GL3D) |
| `game/gl3d.js` | **Zero-Dependency 3D-WebGL-Engine:** Float32Array-Matrix-Kernel, WebGL-1.0-Shader-Pipeline + Software-Projection-Fallback, `GL3D.renderCombat/renderStarMap/renderBase/renderColony` |
| `game/hex-render.js` | 3D-Hex-Prismen-Renderer (schattierte Seitenflächen, Hex-Stargate, Zoom 50–225% inkl. Picking) |
| `game/sound.js` | AudioContext, Master-Volume-Routing, Oszilloskop-Analyser, Chiptune-Modus, prozedurale Sample-Synthese, SGC-Core-Lautstärken, Rollen-Pools mit Vault-Filter |
| `game/music-progress.js` | Jukebox-Progression: `S.unlockedTracks`, `MUSIC_PROGRESS.unlockForPlanet()` (sa_+hit_), Sammlungs-Banner |
| `game/hit-tracks.js` | 80s/90s Hit Jukebox (Pass 039): 7 Vault-Tracks aus MIDI-Transkriptionen (Blue Monday, Confusion ×3) + 3 Stil-Hommagen (eigene Noten) |
| `game/midi.js` | MIDI-Parser, Krumhansl Tonart-Finder, C&C-/Lo-Fi-Remixes, Strudel-DSL-Codegeneratoren |
| `game/switch-angel.js` | AST-Normalisierung für Switch-Angel-Tracks, sichere Prototypen, 20 Originalstücke (Codevault) – Quell-Ordner `switch-angel/` wurde aus dem Repo entfernt (Pass 039, Credit bleibt) |
| `game/combat.js` | Rundenbasiertes Taktiksystem, AP-Management, Offworld-Feldbau, Offscreen-Minimap-Cache, Gate-Austritts-Intro |
| `game/base.js` | 28-Level Cheyenne Mountain Cutaway, Tunneleingang, Raum-Innenansichten (Pixel/ASCII/3D-GL), Koloniebau |
| `game/ui.js` | SGC-AMP v2.80 Winamp-Controller, Quartiermeister-Fenster (`showArmoryModal`), Oszilloskop, ReBirth-338, Tastenbelegungs-Modal |
| `index.html` / `hub.html` | Einheitliches Web-Portal mit Spiel-Player, Lore-Wiki, Studien-Doku und Downloads |
| `test-browser.js` | Headless Test-Suite mit **377 Prüfungen** (100% bestanden, ohne NPM-Abhängigkeiten) |
| `references/NASA-ASSETS.md` | Kuratierter Katalog gemeinfreier NASA-Weltraum- und Planetenbilder |

---

## 3. Testen & Qualitätssicherung

```powershell
node test-browser.js
```

Ergebnis: **377 Prüfungen bestanden (0 Fehler).**  
Verifiziert u. a.: Voxel-Projektion, 3D-Hex-Zoom & Picking, GL3D-Basis-/Kolonie-Rendering, Orbit-Kamera & Gate-Intro, MIDI-Parsing, Strudel-Instrumente, Jukebox-Lock/Unlock (Codevault `sa_*` + `hit_*` inkl. 80s/90s-Hit-Compilation), SONGGEN-Exklusion für „Stand Orders", SGC-Core-Playlists, 9-Sprachen-Key-Coverage, lokalisierte Krankenstation, 55-Planeten-Katalog, Patrol-Mission-Fallback, Single-Click-`doDay`, Combat-UI, ReBirth-338 DSP, Intro-Audio und Kolonie-Berechnungen.

---

## 4. Historisch: Forschungs-Postmortem & Modell-Dynamik (Uni Osnabrück)

> [!NOTE]
> **Postmortem zu Token-Limits & Modell-Wechseln (v0.24):** Im Verlauf des vorherigen Entwicklungsabschnitts wurden die Token-Kontingente der großen Flaggschiff-Modelle erschöpft. In der Folge wurde temporär mit kleineren, schnelleren Modellen weitergearbeitet. Durch diesen Schichtwechsel schlichen sich subtile Regressionen und Instabilitäten ein (z. B. globale Namensraum-Kollision von `window.note`, Syntaxfehler in Strudel-Chains, doppelte Variablen-Deklarationen, unvollständige Setter). Mit dem damaligen Stabilisierungsdurchgang (v0.24) wurden sämtliche Altlasten systematisch aufgedeckt, durch automatisierte Browsertests abgesichert und bereinigt.
>
> **Aktueller Wechsel (0.37 → Qwen, 26.10.2026):** Der 0.37-Pass lief mit erschöpften Flaggschiff-Kontingenten in die Übergabe zur Qwen-Schicht. Der Finalisierungs-Audit (siehe `blog/captains-log-038.md`) deckte die dann offenen Punkte auf (untracked `gl3d.js`, veraltetes ZIP, CRLF-Warnungen, veraltete Test-Zahlen, Ordner-Naming) und hat sie vor dem Push bereinigt.


