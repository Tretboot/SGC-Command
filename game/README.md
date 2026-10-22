# 📖 SGC COMMAND – Anleitung (v0.23 Combat UI & Intro-Audio Edition)

## Starten

`index.html` kann direkt aus dem Ordner `game` im Browser geöffnet werden; ein lokaler Server ist zum Spielen nicht nötig.

## Was ist das?

Ein taktisches Sci-Fi-Strategiespiel im Stargate-Universum. Du leitest das SGC unter Cheyenne Mountain, baust deine Basis aus, fertigst Ausrüstung in der Waffenkammer, koordinierst **SG-1 bis SG-5** auf **Hammonds Klemmbrett** und führst deine Agenten durch das Stargate auf isometrische Voxel-Missionen (im Stil von *Syndicate*, *X-COM*, *Jagged Alliance*, *Command & Conquer* und *SimCity*).

> **Highlight (Dual-Engine):** Du kannst jederzeit live im Menü (`ESC`), über den Header-Button **🖥 PIXEL / ⌨ ASCII** oder mit der Taste **`V`** zwischen **Isometrischer Pixel-Voxel-Grafik** und **3D-ASCII-Grafik** (`asciiid` / `asciicker` Style) umschalten – **beide Modi sind zu 100 % spielbar!**

---

## Steuerung & Hotkeys

| Input | Aktion |
|---|---|
| **`V`** oder **🖥 PIXEL / ⌨ ASCII** | Live zwischen **Isometrisch Voxel (Pixel-Art)** und **3D-ASCII (`asciiid`)** umschalten |
| **`Q` / `E`** oder **↶ Q / ↷ E** | Isometrische Kamera im Kampf um 90° drehen (4 Blickwinkel) |
| **Klick auf eigene Einheit** | Auswählen (blaue Bewegungs-Rauten + rote Angriffsziele) |
| **Klick auf blaues Feld** | Bewegen (1 AP, mit Laufanimation) |
| **Klick auf roten Gegner (✛)** | **Schießen** (1 AP) |
| **💊 / 🛡 / 💨 / ⚡ Button** | Ausgerüstetes Spezial-Item einsetzen (Medkit, Schild, Rauch, EMP) |
| **🧱 / 🗼 / ⚡ / 🏢 Feld-Bau** | Offworld-Struktur (Barrikade, Geschützturm, Naquadah-Generator, Bunker) nahe Team/Gate errichten |
| **📋 (Header / Level 27)** | **Hammonds Büro & Klemmbrett** öffnen (Personal, SG-Teams & Kommandanten-Wechsel) |
| **🎵 (Header / Menü)** | **Strudel Core Sound-Engine & Live-Coding-Konsole** öffnen |
| **Pfeiltasten / WASD / Ziehen** | Einsatzkarte verschieben |
| **ESC** | Pause-Menü (Grafik-Engine, Kommandant, Schwierigkeit, Strudel-Sound) |

Beim ersten Start kann der Browser die Musik zunächst blockieren. Während des Intros lässt sie sich über **🔊 Ton aktivieren** freischalten; das Intro läuft dabei weiter. Feld-Dialoge lassen die Einsatzkarte und das Aktionspanel sichtbar und erlauben die Auswahl eigener Einheiten.

---

## Die Features im Überblick

### 1. 🏗 Basis (Cheyenne Mountain) & Einsehbare Räume
- **28 Ebenen:** Querschnitt durch Cheyenne Mountain mit animiertem Aufzug und Personal.
- **Einsehbare Raum-Innenansicht:** Klicke auf einen gebauten Raum (Kantine, Labor, MedBay, Waffenkammer, Gateraum), um rechts oben live in den Raum hineinzuschauen (inkl. blauem Wackelpudding in der Kantine!) – funktioniert sowohl in Pixel-Art als auch im ASCII-Terminal-Modus.
- **🔧 Arsenal & Werkbank:** Fertige Sturmgewehre, Shotguns, Zat'nik'tel, Stabwaffen, Komposit-/Naquadah-Rüstungen sowie Medkits, Schilde, Rauchgranaten und EMP-Impulse.
- **📋 Hammonds Büro & Klemmbrett:** Verwalte alle Rekruten tabellarisch auf einen Blick und wechsle bei Bedarf den SGC-Kommandanten (**Gen. George Hammond**, **Dr. Elizabeth Weir**, **Gen. Hank Landry**).

### 2. ⚔ Isometrischer Voxel-Kampf & Offworld-Basenbau
- **2:1 Pixel-Voxel & 3D-ASCII:** Höhenstufen für Klippen, Flüsse, Brücken, Tempel und mehrstöckige Hochhäuser (`city`).
- **Offworld-Basenbau (C&C / SimCity Style):** Baue im Feld Sandsack-Barrikaden, automatisch feuernde Geschütztürme (`8–12` Schaden am Rundenende) und heilende Naquadah-Generatoren (`+4 HP` im Radius 3).

### 3. 🎵 Strudel Core Sound-Engine
- Integrierter **Strudel-DSL Pattern-Compiler & WebAudio-Synthesizer** (`game/sound.js` + `game/vendor/strudel-web.js` nach <https://urswilke.github.io/strudel/learn/getting-started/>).
- 6 dynamische Soundtracks (`base`, `map`, `gate`, `combat`, `peaceful`, `boss`), die im Spiel über den **🎵**-Button im Live-Code-Editor angepasst und sofort evaluiert werden können.
