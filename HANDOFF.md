# 📦 HANDOFF – SGC COMMAND (v0.24 – "Feldtauglich")

**Projekt:** SGC Command (`g:\AgentHome\SGC-Command`)  
**Forschungsrahmen:** Universität Osnabrück (Kognitionswissenschaft / Informatik) – KI-Pair-Programming-Studie  
**Beteiligte Modell-Schichten:**  
1. **Gemini 4 Argon:** 2:1 isometrische Voxel-Projektion, Obelisk-Mathematik, Diamond-Picking, initialer CP437/ASCII-Renderer, Lizenz-Audit.  
2. **Claude 5.5 / 3.5 Sonnet:** Obelisk/Voxel-Stabilisierung, prozedurale WebAudio-Sample-Synthese, Inventar & Werkbank-Crafting (`INVENTAR-SPEC.md`), Hammonds Klemmbrett.  
3. **Gemini 3.8 Flash (Vorherige Schicht):** Standard-MIDI-Bridge, Krumhansl-Schmuckler-Tonarterkennung, Stargate Theme × Switch Angel Hybrid-Remix-Synthesizer, prozedurale Seed-Song-Generierung (`SONGGEN`), persistenter planetarer Koloniebau, **SGC-AMP v2.80**, Strudel Live-Code Interface, ReBirth-338 Rack, 8-Bit Chiptune-Modus, C&C- und Lo-Fi-Remixes sowie das vereinheitlichte Web-Portal.
4. **Aktueller Durchgang (v0.24):** Missions-Abschluss "Weiter"-Button repariert (Strudel `note`-Kollision behoben), nahtlose Hintergrundmusik beim Wechsel auf die Sternenkarte ohne störenden Track-Wechsel, Tastatursteuerung (Enter/Space/Esc) für Missions- und Tagesbericht-Ende.
**Stand:** 22. Oktober 2026 · Alle 95 Tests grün (0 Fehler).
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

### 1.2 Keine Musikwechsel beim Aufruf der Sternenkarte
* **Problem:** Beim Klick auf den Tab **Sternenkarte** (`map`) wechselte das Spiel sofort das Musikstück. Beim Hin- und Herwechseln zwischen Basis und Karte brach die Musik ständig ab.
* **Lösung:**
  1. In `game/ui.js` (`setTab`) ruft der Wechsel auf `'map'` kein `SFX.music()` mehr auf – die aktuell laufende Hintergrundmusik spielt nahtlos weiter.
  2. In `game/sound.js` (`syncContext`) wird die Sternenkarte (`'map'`) auf den Ambient-Pool der Basis gemappt. Selbst bei automatischem Kontextabgleich bleibt derselbe Track aktiv (`currentTrack === target`), sodass es zu keinem Neustart oder Aussetzer kommt.

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
| `test-browser.js` | Headless Test-Suite mit 88 Assertions (100% bestanden ohne NPM-Abhängigkeiten) |
| `references/NASA-ASSETS.md` | Kuratierter Katalog gemeinfreier NASA-Weltraum- und Planetenbilder |

---

## 3. Testen & Qualitätssicherung

```powershell
node test-browser.js
```
Ergebnis: **88 Assertions bestanden (0 Fehler)**.
Verifiziert Kernfunktionen wie Voxel-Projektion, MIDI-Parsing, Strudel-Instrumente, Chiptune-Schaltung, Remixes, Master-Volume-Persistenz, Combat-UI/Einheiten-Auswahl, ReBirth-338 DSP, Intro-Audio-Schaltfläche und Kolonie-Berechnungen.
