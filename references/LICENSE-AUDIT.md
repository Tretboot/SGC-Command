# ⚖️ Lizenz-Audit & GitHub-Kompatibilitätsprüfung (`LICENSE-AUDIT.md`)

**Projekt-Lizenz:** `MIT License` (`Copyright (c) 2026 tretboot`, siehe [`../LICENSE`](../LICENSE))  
**Stand:** Durchgang 20 (Isometric Voxel / ASCII Overhaul & Strudel Sound Engine)

---

## 1. Zusammenfassung: Was dürfen wir unter unserer MIT-Lizenz nutzen?

Unsere Repository-Lizenz ist die **MIT-Lizenz** (permissiv). Damit das Repository weiterhin sauber unter MIT vertrieben werden kann, gilt:
- **Permissive Lizenzen (MIT, BSD-2-Clause, BSD-3-Clause, ISC, Apache-2.0, CC0 / Public Domain):** **Uneingeschränkt kompatibel.** Code, Algorithmen, Shader, Font-Atlanten und Datenstrukturen dürfen direkt übernommen, portiert und modifiziert werden, solange der ursprüngliche Copyright-Vermerk (`LICENSE`) erhalten bleibt.
- **Starke Copyleft-Lizenzen (GPLv2, GPLv3, AGPLv3):** **Nicht direkt in MIT-Kerncode einbetten**, wenn das Gesamtprojekt als reines MIT-Projekt ohne Copyleft-Pflichten bleiben soll (AGPLv3 verlangt, dass das gesamte Web-Projekt bei Einbindung unter AGPLv3 gestellt wird).

---

## 2. Geprüfte GitHub-Repositories im Detail

| Projekt / Repository | URL | Lizenz | Kompatibel mit unserem MIT-Repo? | Verwendung in SGC Command |
|---|---|---|---|---|
| **`Tretboot/asciiid`** | <https://github.com/Tretboot/asciiid> | **MIT License** (`Copyright (c) 2021 gumix`) | ✅ **JA (100% kompatibel)** | Referenz & Algorithmus-Vorlage für unseren isometrischen CP437/ASCII-Voxel-Renderer (`game/iso.js`) inkl. Höhenstufen-Schattierung, Silhouetten-Kanten (`─`, `_`), Halbblöcken (`▀▄▌▐`) und Dither-Stufen (`░▒▓`). Lizenz liegt in [`references/asciiid/LICENSE`](asciiid/LICENSE). |
| **`msokalski/asciicker`** | <https://github.com/msokalski/asciicker> | **MIT License** (`Copyright (c) 2021 gumix`) | ✅ **JA (100% kompatibel)** | Upstream-Repository von `asciiid`. Identische MIT-Lizenz. |
| **`nosir/obelisk.js`** | <https://github.com/nosir/obelisk.js> | **MIT License** (`Copyright (c) 2013 Max Huang`) | ✅ **JA (100% kompatibel)** | Referenz-Engine für 2:1 Pixel-Art Isometrie-Voxel (Cubes, Slopes, Pyramids, direktionale Seitenflächen-Schattierung). Referenzkopie in [`references/obelisk/`](obelisk/). |
| **`jdan/isomer`** | <https://github.com/jdan/isomer> | **MIT License** | ✅ **JA (100% kompatibel)** | Mathematische Referenz für isometrische 3D-Prismen und Painter's-Algorithm-Tiefensortierung auf HTML5 2D-Canvas. |
| **`s-macke/VoxelSpace`** | <https://github.com/s-macke/VoxelSpace> | **MIT License** | ✅ **JA (100% kompatibel)** | Referenz für schnelles Heightmap- + Colormap-Säulen-Rendering in JavaScript. |
| **`ondras/rot.js`** | <https://github.com/ondras/rot.js> | **BSD-3-Clause** | ✅ **JA (100% kompatibel)** | Referenz für ASCII/CP437-Canvas-Grid-Displays, Sichtfeld (FOV) und Pathfinding. |
| **`tidalcycles/strudel` (`@strudel/web`)** | <https://github.com/tidalcycles/strudel> | **AGPL-3.0-or-later** | ⚠️ **Achtung: AGPLv3 (Copyleft)** | Siehe Abschnitt 3 für unsere Dual-Engine-Lösung! |

---

## 3. Wichtiger Lizenz-Hinweis zu Strudel (`@strudel/web`)

### Befund der Lizenzprüfung
Alle offiziellen Pakete von Strudel (`@strudel/web`, `@strudel/core`, `@strudel/mini`, `@strudel/webaudio`, `superdough`) stehen unter der **GNU Affero General Public License v3.0 (`AGPL-3.0-or-later`)**.
Laut Strudel-Dokumentation (*Project Start / Licensing*) unterliegt ein Projekt, das Strudel-Pakete fest bundelt und veröffentlicht, den Bedingungen der AGPL-3.0 (Quelltext-Offenlegungspflicht unter AGPL-3.0 bei Web-Bereitstellung).

### Unsere technische & rechtssichere Lösung in SGC Command
Um deinen Wunsch (*„Als Sound Engine sollte auch Strudel gehen ... Das bitte als Core Soundengine implementieren und dafür alles was nötig ist runterladen"*) vollständig zu erfüllen **und** dir volle Lizenzfreiheit zu lassen, haben wir eine **zweistufige Strudel-Architektur** gebaut:

1. **Eigener MIT-lizenzierter Clean-Room Strudel-DSL-Core in [`game/sound.js`](../game/sound.js):**
   - Implementiert die Strudel-Pattern-Syntax (`setcps()`, `setTempo()`, `stack()`, `cat()`, `seq()`, `note()`, `n()`, `chord()`, `s()`, `sound()`, `.fast()`, `.slow()`, `.lpf()`, `.hpf()`, `.gain()`, `.attack()`, `.decay()`, `.sustain()`, `.release()`, `.delay()`, `.room()`, `.pan()`, `.crush()`, Mini-Notation `<a b c>`, `[a b]`, `a*4`, `~`, `evaluate()`, `hush()`) direkt auf der nativen Browser-`AudioContext` (Web Audio API) – **komplett ohne fremden AGPL-Code**!
   - Funktioniert sofort beim direkten Öffnen von `game/index.html` über `file://` (ohne Webserver, ohne Internet, ohne CORS-/AudioWorklet-Blockaden) und besteht alle Node-Smoke-Tests (`test-browser.js`).
2. **Heruntergeladenes Original-Bundle `@strudel/web@1.3.0`:**
   - Liegt lokal unter [`game/vendor/strudel-web.js`](../game/vendor/strudel-web.js) sowie als Referenz in [`references/strudel/strudel-web.js`](strudel/strudel-web.js).
   - Wenn `window.initStrudel` aus dem Bundle geladen ist, kann die Sound-Engine wahlweise an die externe `@strudel/web`-Runtime delegieren oder den internen latenzfreien WebAudio-Strudel-Core nutzen.
   - **Für einen strikten MIT-Release:** Wenn das Projekt später rein unter MIT (ohne AGPL-Drittanbieter-Datei) veröffentlicht werden soll, genügt es, die Datei `game/vendor/strudel-web.js` wegzulassen – sämtliche Strudel-Musik-Patterns und SFX laufen zu 100 % identisch über unseren MIT-eigenen Strudel-DSL-Core in `game/sound.js` weiter!

