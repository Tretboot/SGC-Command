# Captain's Log 022 – "...aber der Soundtrack ist jetzt Fett!"

**Projekt:** SGC Command – Stargate AI Coding Study  
**Datum:** 22. Oktober 2026  
**Autoren-Schichten:** Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash (Polishing & Stabilisierung)  
**Release:** SGC Command v0.22  

---

## 1. Übersicht & Motivation

Nach der erfolgreichen Einführung des Winamp-Retro-Players, der Roland-Drum-Banks und des Strudel Live-Coding-Interfaces in Version 0.21 meldete das Community- und Playtest-Feedback mehrere kritische Usability- und Layout-Bugs sowie Wünsche nach mehr musikalischem Druck und einer aufgeräumten Präsentation:

1. **Lautstärkeregler reparieren:** Der Lautstärke-Fader in der Winamp-Kopfzeile hatte keine hörbare Wirkung auf den WebAudio-Ausgang.
2. **Neue Stargate-Remixe (C&C Hell March & Lo-Fi Chillhop):** Ergänzung des Soundtracks um einen treibenden, industriellen Cyber-Metal-Remix im Stile von Frank Klepackis *Hell March* sowie eine entspannte, nächtliche Lo-Fi Chillhop-Variante.
3. **Combat-UI abgeschnitten:** Im Vollbild- und Iframe-Modus war das Jagged-Alliance-Aktionspanel am unteren Bildschirmrand unvollständig oder verdeckt.
4. **Hub-Menü entschlacken:** Entfernen aufdringlicher Badges ("Universität Osnabrück") und Verschieben von Forschungsaufsatz, Winamp-Labor und Downloads in ein dezentes Untermenü ("ℹ️ Über & Labor").
5. **Menü-Bereinigung:** Entfernung der manuellen Kommandantenauswahl im Pause-Menü (die Freischaltung erfolgt stattdessen organisch über die Kampagnen-Quests).
6. **Entschlackung des Release-Pakets:** Löschung überflüssiger, großvolumiger Screenshot-PNGs zur Minimierung der ZIP-Downloadgröße.
7. **Gemeinfreie NASA-Assets:** Zusammenstellung hochauflösender Public Domain (PD-USGov) Referenzbilder für Abydos-Wüsten, Exoplaneten und Deep-Space-Nebel.

---

## 2. Detaillierte Fehleranalyse & Architektur-Lösungen

### A. Reparatur des Master-Lautstärkereglers
* **Fehlerbild:** Das Verschieben des Volume-Sliders im Winamp-Header sendete zwar UI-Events, die Audiosignale von Strudel und den generativen Synthesizern blieben jedoch unverändert laut.
* **Ursachenanalyse:** Strudels interne Superdough-Knoten initialisierten teilweise eigene Gain-Nodes und verbanden sich direkt mit `AudioContext.destination` oder bogen den Signalweg am zentralen `SFX.master`-Knoten vorbei.
* **Lösung:**
  - Neugestaltung der Routing-Logik in `game/sound.js`: Alle externen und Strudel-internen Audio-Knoten werden über einen Proxy abgefangen und zwingend durch `SFX.master` geleitet (`SFX.master -> SFX.analyser -> ctx.destination`).
  - Implementierung von `SFX.setVolume(val)` mit exponentieller Pegelanpassung und persistenter Speicherung in `localStorage('sgc_volume')`.
  - Direkte Verdrahtung des Sliders `#winamp-vol-slider` in `game/ui.js` mit `SFX.setVolume()`.

### B. Reparatur des abgeschnittenen Combat-UI
* **Fehlerbild:** Bei Gefechtsbeginn ragte das `#combat-ui` (Agenten-Porträts, AP, Aktions-Buttons "Warten", Inventar) aus dem Viewport heraus oder war unsichtbar, wenn das Spiel in einem Iframe oder bei niedrigeren Bildschirmauflösungen gerendert wurde.
* **Ursachenanalyse:** `#combat-ui` war als separates Geschwisterelement außerhalb von `#combat-overlay` mit `position: fixed; bottom: 0` deklariert. In Iframe-Umgebungen differieren Iframe-Höhe und Viewport-Höhe, wodurch feste Pixel-Abstände das Element unter die Kante schoben. Zusätzlich berechnete `resizeCombatViewport()` die Canvas-Größe über fehleranfällige statische Pixel-Abzüge (`window.innerHeight - 240`).
* **Lösung:**
  - `#combat-ui` wurde direkt in das `#combat-overlay` verschoben und per CSS-Flexbox (`display: flex; flex-direction: column`) als relatives Fußleisten-Element (`flex: 0 0 auto; z-index: 10`) eingebunden.
  - Das Canvas-Wrapper-Element nimmt nun dynamisch `flex: 1 1 auto` ein.
  - `resizeCombatViewport()` in `game/combat.js` liest jetzt direkt die `clientWidth` und `clientHeight` des übergeordneten Wrappers aus. Das Combat-UI bleibt damit in jeder Auflösung und jedem Iframe-Maßstab perfekt verankert.

### C. Entfernung des Kommandanten-Dropdowns im Pause-Menü
* **Hintergrund:** General Hammond und weitere Offiziere sind Kernbestandteil des narrativen Quest-Systems. Die Möglichkeit, im Pause-Menü jederzeit den General zu wechseln, stand im Widerspruch zum Freischalt-Design.
* **Lösung:** Entfernung des Kommandanten-Blocks aus `#menu` in `game/index.html`. Die Zuweisung und Beförderung von Offizieren verbleibt exklusiv im Quest- und Missionsfortschritt.

---

## 3. Neue Soundtracks: Command & Conquer / Hell March & Lo-Fi Chillhop

Der Soundtrack von SGC Command wurde um zwei kontrastreiche, handgefertigte Stargate-Themen-Interpretationen erweitert:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SGC-AMP v2.80 SOUNDTRACK                        │
├─────────────────────────────────────┬──────────────────────────────────┤
│ 🪖 Stargate × C&C Hell March Remix  │ ☕ Stargate × Midnight Lo-Fi     │
│ • Tempo: 132 BPM (Industrial 4/4)   │ • Tempo: 84 BPM (Half-Time D&B)  │
│ • Roland TR-909 Kick & Marsch-Snare │ • Rhodes E-Piano & Flöte         │
│ • Verzerrter TB-303 / Saw-Gitarren  │ • Warmer Sub-Bass & Chords       │
│ • Treibende Blechbläser-Fanfare     │ • Vinyl-Knistern & Tape-Wärme    │
└─────────────────────────────────────┴──────────────────────────────────┘
```

1. **`theme_remix_cnc` ("🪖 Stargate × C&C Hell March Industrial Remix"):**
   - Erbaut auf 132 BPM im Stil von Frank Klepacki.
   - Brutaler 4-to-the-floor Beat mit industrieller Distortion, Marsch-Snare-Synkopen und einem aggressiven E-Bass-Riff.
   - Das heroische Stargate-Trompeten-Thema schneidet mit schneidendem Synth-Brass durch das Industrial-Gewitter.
   - Automatisch im Soundtrack-Pool für Bosskämpfe und schwere Bodengefechte verankert.

2. **`theme_remix_lofi` ("☕ Stargate × Midnight Lo-Fi Chillhop Remix"):**
   - Entspannter 84-BPM Groove für friedliche Erkundungen und den Basenbau.
   - Sanfte Rhodes-Piano-Akkorde mit Tape-Saturation, gedämpfte Flötenmelodie und weiche, federnde 808-Kicks.
   - Perfekt zum Tüfteln im Kolonie-Raster oder Lesen in der Datenbank.

---

## 4. UI- & Portal-Restrukturierung (Über & Labor)

Gemäß Benutzerwunsch wurde die Navigation des Hauptportals gestrafft:

- **Header bereinigt:** Die aufdringliche Universitäts-Plakette im Kopfbereich wurde entfernt; die Versionsanzeige lautet nun stolz:  
  `SGC COMMAND v0.22 · "...aber der Soundtrack ist jetzt Fett!"`
- **Hauptnavigation auf 4 Kernbereiche reduziert:**
  1. `[ 🎮 Spiel ]` – Sofortiger Zugriff auf das Vollbild-Spiel mit Dual-Graphics (Pixel ⇄ ASCII).
  2. `[ 📚 Datenbank & Lore ]` – Glossar zu Goa'uld, Jaffa, Einheiten, Waffen und Gebäuden.
  3. `[ 📜 Captain's Log ]` – Chronologisches Entwicklungsarchiv (Logs 022, 021, 020).
  4. `[ ℹ️ Über & Labor ]` – Zusammenfassung aller experimentellen Module:
     - *Strudel & Winamp Lab:* ReBirth RB-338 Rack, Roland Drum Machine, AST-Live-Editor.
     - *Forschungsnotizen:* Dokumentation der Multi-Agenten-Pair-Programming-Studie.
     - *Downloads & Setup:* Schneller, werbefreier Download des schlanken Offline-ZIPs.
     - *Lizenzen & Credits:* Würdigung von Switch Angel, Roland, NASA und Open-Source-Projekten.

---

## 5. Bereinigung & Entschlackung (Entschlacken)

Zur Reduktion des Archivvolumens wurden unbenutzte, bis zu 7 MB schwere Screenshot-PNGs aus dem Paket entfernt. Das Spiel und alle zugehörigen Komponenten verbleiben strikt **100% offline-fähig ohne Node-Dependencies oder Build-Schritte**, laufen direkt über `file://` im Browser und bringen nun dennoch ein noch feineres Klangerlebnis mit.

---

## 6. Test-Suite & Qualitätssicherung

Die Test-Suite `test-browser.js` wurde um Assertions für die neuen C&C- und Lo-Fi-Remixe sowie die `SFX.setVolume()` Master-Gain-Funktionalität erweitert:

- **74 automatisierte Assertions** (100% bestanden, 0 Fehler).
- Verifikation des Iframe-Dockings von `#combat-ui`.
- Verifikation aller 22 Strudel-Tracks, Drum-Machine-Kits und 303-Filter.
- Lauffähig unter Node.js in unter 2 Sekunden.

