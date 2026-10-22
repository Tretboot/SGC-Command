# 📦 HANDOFF – SGC COMMAND (v0.21 Winamp & Chiptune Retro Edition)

**Projekt:** SGC Command (`g:\AgentHome\SGC-Command`)  
**Forschungsrahmen:** Universität Osnabrück (Kognitionswissenschaft / Informatik) – KI-Pair-Programming-Studie  
**Beteiligte Modell-Schichten:**  
1. **Gemini 4 Argon:** 2:1 isometrische Voxel-Projektion, Obelisk-Mathematik, Diamond-Picking, initialer CP437/ASCII-Renderer, Lizenz-Audit.  
2. **Claude 5.5 / 3.5 Sonnet:** Obelisk/Voxel-Stabilisierung, prozedurale WebAudio-Sample-Synthese, Inventar & Werkbank-Crafting (`INVENTAR-SPEC.md`), Hammonds Klemmbrett.  
3. **Gemini 3.8 Flash (Aktuelle Schicht):** Standard-MIDI-Bridge, Krumhansl-Schmuckler-Tonarterkennung, Stargate Theme × Switch Angel Hybrid-Remix-Synthesizer, prozedurale Seed-Song-Generierung (`SONGGEN`), persistenter planetarer Koloniebau (Civ / SimCity / Total War Rome), audio-reaktives Spielfeld-Tanzen (`ISO.beatPulse`), Gamepad-Dual-Rumble-Haptik, interaktive Tastenbelegungs-Konfiguration, akademischer Forschungsaufsatz, einheitliches Web-Portal (`index.html` / `hub.html`), **Winamp-Style Retro-Player (`SGC-AMP v2.80`)** mit digitalem LCD & Echtzeit-Oszilloskop / Spektrumanalysator, **Strudel.cc Live-Code Interface (front-and-center)** mit Stimmen-Monitor & 16-Step Sequenzer-Lauflicht, **ReBirth RB-338 Synthesizer- & Drum-Rack** mit 1-Klick Roland Soundbanks (TR-909/808/707/Linn/303) und Analog-Drehreglern, automatischer **8-Bit Chiptune-Modus** gekoppelt an ASCII-3D, AST-Normalisierung für Switch-Angel-Tracks, Bereinigung um 50+ MB WAV-Dateien und Release-Packaging.  
**Stand:** 22. Oktober 2026 · Alle 63 automatisierten Tests in `test-browser.js` grün (0 Fehler).  
**Lizenz:** AGPL-3.0-or-later.  

---

## 1. Übersicht der aktuellen Features (v0.21)

### 1.1 Strudel.cc Live-Code Interface (Permanent geöffnet & im Zentrum)
* **Zentrale Arbeitskonsole:** Das Code-Interface ist direkt unter dem Winamp-Deck platziert und bildet das prominente Herzstück des Studios.
* **Echtzeit-Stimmen-Monitor:** Farbige Neon-Badges (`$KICK`, `$HAT`, `$SNARE`, `$BASS`, `$MELODY`) leuchten synchron auf jedem Treffer im Beat auf.
* **16-Step ReBirth Sequenzer-Lauflicht:** 16 runde LED-Lichter wandern kontinuierlich und driftfrei im Takt über das Raster.
* **Visueller Transient-Pulse:** Der Editor-Rahmen pulsiert synchron zu Kick- und Bass-Impulsen für das authentische `strudel.cc`-Gefühl.
* **Tastenkürzel & Steuerung:** `Strg+Enter` / `Cmd+Enter` wertet Änderungen sofort live aus; Buttons für Stop, Mutieren (`🧬`), Speichern (`💾`), Reset (`↺`) und Soundbank-Hot-Patching (`✍`).

### 1.2 ReBirth RB-338 Synthesizer- & Drum-Rack mit Roland Soundbanks
* **TB-303 Acid Bass Section:**
  * 1-Klick Soundbanks: `303 Saw`, `303 Sq`, `SH-101`, `Sub`, `Slap`, `8-Bit`, `Reese`.
  * Drehregler/Schieberegler mit Live-Werteanzeige: **Cutoff** (100Hz–8kHz), **Resonanz** (Q 0.5–20), **Env Mod** (0–100%), **Decay** (0.05s–1.2s), **Distortion** (WebAudio WaveShaper Soft-Clipping) und **Tune** (-12..+12 Halbtöne).
* **Roland TR Drum Machine:**
  * 1-Klick Soundbank-Wähler für **Kick**: `TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Acoustic`, `Acid`.
  * 1-Klick Soundbank-Wähler für **Hi-Hat**: `TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Noise Sweep`.
  * Regler mit Live-Anzeige: **BD Tune** (40–140 Hz), **BD Decay** (0.08–0.70s), **Hat Decay** (0.02–0.35s) und **Tempo (BPM)** (80–180 BPM, synchronisiert mit Strudel CPM).
* **Hot-Injection in den Code:** Button `[ ✍ SOUNDBANKS ANWENDEN ]` transformiert Drum- und Synth-Namen im Code-Text passend zur gewählten Soundbank.

### 1.3 Winamp-Style Retro-Player (`SGC-AMP v2.80`) & Visualizer
* **Retro-Chassis:** Titan-Bevel-Rahmen im Stil von Winamp v2 mit klassischer Titelleiste und Schließen/Minimieren-Buttons.
* **Grünes Phosphor-LCD:** Digitaler Marquee-Lauftext für Titel & Artist, exakte Spielzeit (`00:00 / 02:45`), BPM- und CPS-Anzeige sowie Bitrate.
* **Eindeutige Status-Badges:** Visuelle Klarheit über den Wiedergabestatus mit leuchtenden LED-Badges: `[ ▶ PLAYING ]` (grün pulsierend), `[ ⏸ PAUSED ]` (bernstein) und `[ ⏹ STOPPED ]` (rot).
* **Echtzeit-Oszilloskop & Spektrumanalysator (`#winamp-vis`):** 60 FPS HTML5-Canvas direkt an den WebAudio `AnalyserNode` angebunden. Umschaltbar zwischen grüner Phosphor-Wellenform und 28-Band-Frequenzspektrum mit Peak-Hold.
* **Transport-Steuerung:** `|<<`, `PLAY`, `PAUSE`, `STOP`, `>>|`, stufenloser Lautstärkeregler und Live-Suchfilter für die Trackliste.

### 1.4 Automatischer 8-Bit Chiptune Sound-Modus
* **Grafik-Akustik-Kopplung:** Beim Wechsel in den 3D-ASCII-Modus (Taste `V`) schaltet die Soundengine automatisch in den 8-Bit Chiptune-Modus (`STRUDEL.setChiptune(true)`).
* **Klangsynthese:** Reine Rechteckwellen (`square`), offene Filtereckfrequenzen und 40-Hz-Arpeggio-Flutter bei gehaltenen Akkorden für authentischen C64/NES-Charakter.
* **Manuelle Umschaltung:** Über den Button `[ 👾 8-Bit: AN/AUS ]` im Winamp-Player jederzeit auch im Pixel-Modus aktivierbar.

### 1.5 Stargate MIDI Direct & Dedizierte Strudel-Instrumente
* **Standard-MIDI-Parser (`game/midi.js`):** Zerlegt die Stargate-Theme-MIDI-Datei in synchrone 16-Step-Takte `<[bar0] [bar1] ...>`.
* **Dedizierte Strudel-Instrumente:**
  * **$MELODY (Waldhorn/Trompete):** `s("sawtooth").attack(0.04).lpf(3000)`
  * **$BASS (E-Bass):** `note(...).sub(12).s("sawtooth").acidenv(0.35)`
  * **$HARMONY (Power-Brass):** `note(...).lpf(2400)`
  * **$DRUMS (Orchester-Pauken & Kit):** Gemappte GM-Drum-Events inklusive Paukenwirbel
* **Remixe:** 4 hybride Stargate × Switch Angel Remixes mit Acid-Bässen und Trancegates.

### 1.6 Switch Angel Laufzeit-Reparaturen & DSL-Stabilisierung
* **AST/Regex-Normalisierung (`preprocessSwitchAngelCode`):** Wandelt veraltete HTML-String-Methoden (`String.sub`) um in Pattern-Wrapping (`n("...").seg(16)` und `note("...").sub(24)`).
* **Defensive Prototyp-Patches:** `String.prototype` und `Number.prototype` (`sub`, `add`, `seg`, `rib`, `mul`, `div`) gepatcht, sodass Live-Coding und String-Chaining niemals abstürzen.
* **Beseitigung der `postgain`-Kollision:** `postgain(v)` im Strudel-Scope bereinigt, wodurch `all(x => x.mul(postgain(volume)))` auf allen 5 betroffenen Tracks (`extra_slippy`, `Lets_Talk`, `MUTEK4am`, `did_i_make_this`, `AUTOTOMATONE`) sofort läuft.
* **Alle 20 Tracks spielbar:** Vollständig integriert in die Winamp-Playlist.

### 1.5 Dual-Graphics: Pixel-Voxel ⇄ 3D-ASCII
* **Isometrische 2:1 Voxel-Projektion (`iso.js`):** Echte Höhenstufen (`baseZ` + `blockH`), 3D-Stargate mit rotierendem Wirbel, gerichtete Beleuchtung (Top-Diamond, linkes und rechtes Schatten-Face nach `obelisk.js`), 4-Wege-Kameradrehung (`Q`/`E`), freier Zoom (`+`/`-`).
* **3D-ASCII Modus (CP437, `asciiid` / `asciicker` inspiriert):** Höhenkonturen (`─`, `_`), Voxel-Schattierung (`█▓▒░`), multi-zellige Agenten-Sprites (`[☗]` Heavy, `(◎)` Sniper, `[⚙]` Carter, `[^]` Jack, `[👑]` Goa'uld, `><` Replikator) sowie Terminal-Views für Cheyenne Mountain und die planetaren Kolonien.
* **Live umschaltbar:** Zu jedem Zeitpunkt im Spiel über Taste **`V`**, Menü (`ESC`) oder Header-Button – beide Modi sind zu 100 % spielbar.

### 1.6 Persistenter Offworld-Koloniebau (Civ / SimCity / Total War Rome Layer)
* **Status in `S.colonies`:** Kolonien auf erforschten Planeten (Alpha-Basis, Abydos, Chulak etc.) mit 6×5 Sektoren-Gitter.
* **Strukturen (`COLONY_BUILDINGS`):** Stargate-Ring, Gate-Befestigung (`gate_defense`), Naquadah-Tiefbohrung (`mine`), Antiker-Forschungslabor (`lab`), UAV/Jumper-Hangar (`hangar`), Naquadah-Reaktor (`reactor`), Kraftfeld-Schutzkuppel (`dome`), Feldlazarett (`hospital`), SG-Garnison (`barracks`).
* **Täglicher Ertrag & Verteidigung:** Tägliche Ressourcen-Generierung in `endDay()`, Energiebilanz und automatische Abwehrchecks gegen Jaffa-Raids.

### 1.7 Einheitliches Web-Portal & Akademischer Aufsatz
* **`index.html` & `hub.html`:** Modernes Stargate-Command-Portal mit Tabs für Spiel, Aufsatz, SGC-Lore, Sound-Lab, Captain's Log (Log 021 & 020) und Downloads.
* **`blog/captains-log-021.md`:** Detaillierte Dokumentation des Winamp-Players, Oszilloskops, 8-Bit-Chiptunes und der Audio-Fixes.
* **`blog/uni-osnabrueck-ai-study.md`:** Wissenschaftlicher Forschungsaufsatz für die Universität Osnabrück.

---

## 2. Test-Verifikation

Alle Tests laufen ohne externe Abhängigkeiten über Node.js:

```powershell
node test-browser.js
```

Ergebnis: **63 Assertions, 0 Fehler**. Prüft:
- Strudel-Bundle & Fallback-Compiler
- MIDI-Parser, Krumhansl Tonart-Analyse & Theme-Remix
- Dedizierte Strudel-Instrumente ($MELODY, $BASS, $HARMONY, $DRUMS)
- Switch Angel Track-Kompilierung (alle 5 zuvor problematischen Stücke validiert)
- Winamp Transport (playTrack, pause, stop)
- ReBirth RB-338 Synthesizer- & Drum-Rack (Soundbanks & DSP-Parameter)
- Strudel.cc Live-Code Interface & Stimmen-Monitor
- Soundbank Hot-Patching via applySoundbanksToCode()
- 8-Bit Chiptune Sound Engine Toggle (automatisch bei ASCII, manuell)
- SONGGEN deterministische Skalen & Combat-Soundtracks
- Isometrische 2:1 Projektion & Ray-to-Diamond Picking
- Dual-Mode Rendering (Pixel-Voxel & CP437 ASCII-3D)
- Koloniegründung, Bau, Upgrade und Ertragsberechnung
- Inventar, Armory-Crafting & Spezial-Items
- SG-Team Cycling & Tastenbelegungs-Modal
- Gameloop (Frame-Ticks)

---

## 3. Script-Ladereihenfolge (`game/index.html`)

```html
<script src="vendor/strudel-web.js"></script>
<script src="switch-angel.js"></script>
<script src="midi-data.js"></script>
<script src="sound.js"></script>
<script src="midi.js"></script>
<script src="art.js"></script>
<script src="art2.js"></script>
<script src="../content/quests.js"></script>
<script src="../content/intros.js"></script>
<script src="../content/scenes.js"></script>
<script src="engine.js"></script>
<script src="iso.js"></script>
<script src="combat.js"></script>
<script src="base.js"></script>
<script src="cinematic.js"></script>
<script src="ui.js"></script>
```

---

## 4. Lizenz & Danksagung

* **AGPL-3.0-or-later:** Das Programmpaket ist unter der GNU Affero General Public License v3 lizenziert.
* **Switch Angel:** Besonderer Dank für die herausragenden Live-Coding-Tracks in `Switch-Angel/`, die in diesem universitären Forschungskontext als funktionale Platzhalter und Demonstrator für algorithmische Musik dienen.
* **Obelisk.js & asciiid/asciicker:** Dank an Max Kleucker, Tretboot und Michal Sokalski für die isometrischen und ASCII-Rendering-Grundlagen (MIT).
* **References-Inbox:** Der Ordner `references/` dient ab sofort als saubere Inbox für künftige Notizen, Feedback und Referenzmaterial.
