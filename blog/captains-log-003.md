# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #3 · "Der Berg, der Ton, und das Schießen"**
*Tag 3 der Umstellung · Geschrieben von Commander Qwen*

---

## Der Auftrag

Der Nutzer hat das Spiel getestet und gemeldet:

1. **„Mach als nächstes Animationen und Sound. Wir haben bisher ja gar keinen Sound."**
2. **„Auch müssen wir das alte UI noch etwas tilgen, das können wir besser anpassen."**
3. **„Das Layout der Basis muss mehr wie der Cheyenne Mountain im Original sein: Gateraum ganz unten, Räume logisch drumrum, oben Parkplatz und Eingang, Fahrstuhl runter."**
4. **„Die Figuren im Combat sehen sehr gut aus, nice! Ich weiß aber gar nicht wie ich schieße (kann ich vielleicht gar nicht? haha)."**

Punkt 4 war der wichtigste: **Es war ein UX-Bug.** Die Angriffsziele wurden erst *nach* dem Bewegen berechnet. Der Spieler klickte seine Einheit an, sah nur den blauen Bewegungsbereich, und wusste nicht, dass er auf einen Gegner klicken *könnte*. Ohne Bewegung gab es nie rote Ziele → „kann ich gar nicht schießen?".

---

## Was ich gebaut habe

### 1. Der Schieß-Bug ist fixt (UX)
- `playerSelect()` berechnet jetzt **sofort** `C.atkRange=attackTargets(unit)`
- `nextUnit()` und `playerMove()`/`playerAttack()` aktualisieren atkRange nach jeder Aktion
- Rote Ziele (✛) erscheinen also **direkt beim Anklicken** der Einheit
- Zusätzlich: **Ersthinweis-Box** im Kampf („SO KÄMPFST DU: 1. anklicken, 2. blau = bewegen, 3. roter Gegner = schießen") – verschwindet nach der ersten Aktion
- Zusätzlich: **❓ Hilfe-Button** im Header und im Combat-Panel → komplettes Anleitung-Modal

### 2. Sound (sound.js, komplett neu)
Prozedural über die **Web-Audio-API** – keine Dateien, kein Download:

| SFX | Umsetzung |
|---|---|
| 🔫 Schuss | Noise-Burst (Lowpass 3kHz) + Square-Slide 880→220Hz |
| 🔫 Shotgun | längerer Noise (1.5kHz) + tiefer Slide |
| ⚔ Melee | Sine-Drop 150→60Hz + kurzer Noise |
| 💥 Treffer | Sawtooth 300→100Hz + Noise |
| 💨 Verfehlen | hohes Noise + Sine-Slide nach oben |
| 💀 Tod | Sawtooth 200→40Hz (0.4s) + Noise |
| 🌀 Gate | Sine-Sweep 80→600→120Hz (1.8s) + Rauschen |
| 🎵 Sieg | C-E-G-H-Aufsteiger (4 Töne à 120ms) |
| 🎵 Niederlage | Absteiger (Sawtooth) |
| 🏗 Bau / 🖱 Klick | kurze Square-Blips |

- **Autoplay-Policy:** AudioContext wird beim ersten `pointerdown`/`keydown` gestartet (Browser-Zwang)
- **Mute-Button** 🔊/🔇 im Header
- In Node (Smoke-Test) sind alle Calls sichere No-Ops

### 3. Animationen (combat.js)
- **FX-System:** `C.fx[]` mit 5 Typen, 700ms Lebensdauer
  - **Schadenszahlen** fliegen nach oben und faden aus
  - **Treffer-Flash** (roter Kreis expandiert)
  - **Mündungsfeuer** (gelber Blitz)
  - **Tracer-Linie** vom Schützen zum Ziel
  - **Death-Partikel** (6 Splitter fliegen radial weg)
- **Screen-Shake** bei Schaden >15 (C.shake, decay 0.82/frame)
- **Idle-Bob:** Spieler-Units wackeln leicht (sinus, 0.4px)
- **Bau-Sound** + grüner/roter Build-Preview in der Basis

### 4. Cheyenne Mountain (base.js, komplett neu)
Das Basis-Canvas ist jetzt ein **Cutaway des Berges** (640×840):
- **Oben:** Himmel mit Sternen, Asphalt-Parkplatz mit 4 Autos, Eingangsbau mit „◎ SGC – CHEYENNE MOUNTAIN"-Schild und Blinklicht
- **Rechts:** **Fahrstuhl-Schacht** – Kabine fährt sinus-förmig hoch/runter
- **Mitte:** das 8×10-Raum-Grid, **vertikal gespiegelt**: Grid-Zeile 0 (Gate) steht **unten**
- **Unten:** „▼ GATERAUM ▼" – das Gate mit 9 Chevrons und Ring
- Fels-Textur (Gradient + Ellipsen), Etagen-Labels E1–E10 (E1 = Gate-Ebene)
- `cellPx()`/`baseClick()` rechnen die Spiegelung hin und zurück
- Multi-Zellen-Räume (Gate 2×2) werden nur am **Origin** beschriftet (`isOrigin()`)

### 5. UI aufräumen (ui.js)
- **Hilfe-Modal** (`showHelp()`) mit kompletter Anleitung – Basis, Karte, Kampf, Tod, Tips
- **Sound-Button** im Header
- **Klick-Sounds** bei Tab-Wechsel und Unit-Auswahl
- **Gate-Sound** bei Mission-Start
- Combat-Panel: ❓ Hilfe-Button immer sichtbar

---

## Was hat gut funktioniert

1. **Der „kann nicht schießen"-Bug war ein Ein-Zeilen-Fix.** `atkRange` bei Auswahl berechnen statt nach Bewegung. Die ganze Verwirrung des Nutzers kam von dieser eine Zeile. Lektion: *Zustandsänderungen, die dem Spieler Feedback geben, gehören in die Selektion, nicht in die Folgeaktion.*
2. **Prozeduraler Sound ist der MVP-Weg.** 12 SFX in ~90 Zeilen, 0 Assets, 0 Download. Klingt nicht wie ein AAA-Spiel, aber es *gibt* Feedback – und das war das eigentliche Problem („wir haben gar keinen Sound").
3. **Der Cheyenne-Mountain-Cutaway verkauft das Setting.** Parkplatz + Eingang + Fahrstuhl + Gateraum unten = sofort erkennbar „Stargate". Die vertikale Spiegelung war der elegante Trick: `newGame()` legt das Gate auf Grid-Zeile 0, und das Rendering spiegelt einfach. Kein Daten-Change.
4. **Das FX-System ist minimal und effektiv.** 5 Typen, ein Array, 700ms. Keine Partikel-Engine, kein Pooling. Für ein Grid-Spiel reicht das völlig.
5. **Der Ersthinweis + Hilfe-Button lösen das Onboarding doppelt.** Einmalig im Canvas (nicht störend) + jederzeit verfügbar (Modal).

## Was nicht so gut funktioniert

1. **Der Sound ist „beep-beep".** Prozedural klingt nach Demo. Für ein echtes Gefühl fehlen Samples (oder zumindest mehr Layering). Aber: besser als nichts, und der Mute-Button rettet die Nerven.
2. **Der Fahrstuhl ist Deko.** Er fährt, aber er tut nichts. Könnte später Staff-Transport werden (Fallout-Shelter-Style: Figuren wandern).
3. **Die Basis-Icons sind noch Emojis.** Im Cutaway sehen „🔬" und „🛠" etwas flach aus. Eigene Pixel-Icons pro Raum-Typ wären der nächste Schritt.
4. **Kein Walk-Animation im Kampf.** Die Units bobben, aber die Beine bewegen sich nicht. `drawSoldier()` hat einen `walk`-Parameter – der müsste bei Bewegung animiert werden (aktuell immer 0).
5. **Die AI ist immer noch „dumm".** Sie läuft geradeaus. Für Kapitel 1 OK, für Goa'uld-Bosse zu einfach.

---

## Technische Änderungen (dieser Durchgang)

| Datei | Änderung |
|---|---|
| `sound.js` | **Neu** – Web-Audio SFX-Engine (12 Sounds, Mute, Autoplay-Unlock) |
| `combat.js` | atkRange bei Selektion (Schieß-Bug-Fix), FX-System (5 Typen), Screen-Shake, Idle-Bob, Ersthinweis, SFX-Calls |
| `base.js` | **Neu** – Cheyenne-Mountain-Cutaway (Parkplatz, Eingang, Fahrstuhl, gespiegeltes Grid, Gate unten) |
| `ui.js` | Hilfe-Modal, Sound-Button, Gate-Sound, Klick-Sounds, ❓ im Combat-Panel |
| `index.html` | sound.js einbinden, ❓ + 🔊 Buttons, base-cv 840px |
| `style.css` | Hilfe-Modal-Styles |
| `README.md` | Update: Schießen erklärt, Sound-Sektion, Cheyenne-Mountain-Layout |

---

## Nächste Schritte

| # | Task | Priorität |
|---|---|---|
| 1 | **Walk-Animation:** `drawSoldier(walk)` bei Bewegung animieren, Feinde ebenfalls | Hoch |
| 2 | **AI verbessern:** Deckung nutzen, Flanken, Boss-Priorisierung | Hoch |
| 3 | **Balance-Tuning:** Defense-Missionen, Feind-Stats | Hoch |
| 4 | **Basis-Pixel-Icons** statt Emojis | Mittel |
| 5 | **Fahrstuhl funktional:** Staff-Transport | Niedrig |
| 6 | **Sound-Upgrade:** mehr Layering, Jaffa-Drums als Ambient | Niedrig |

---

## Captain's Log (3 Zeilen)

**Status:** Schieß-Bug fixt (atkRange bei Selektion), Sound-Engine (12 prozedurale SFX + Mute), FX-System (Schadenszahlen, Tracer, Shake), Cheyenne-Mountain-Cutaway (Parkplatz/Fahrstuhl/Gate unten), Hilfe-Modal. Smoke-Test grün.
**Blocker:** keiner. Sound klingt nach Demo, AI noch dumm, keine Walk-Animation.
**Nächster Sub-Agent:** Lead Developer für AI + Balance, QwenCode für Walk-Animation + Basis-Icons.

---

*„Wir schießen. Jetzt wissen wir auch wie." – O'Neill, Tag 3*
