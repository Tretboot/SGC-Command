# Captain's Log 021 – Winamp Retro-Player, Oszilloskop, 8-Bit Chiptune & Switch Angel / MIDI Audio-Fixes

**Projekt:** SGC Command – Stargate AI Coding Study (Uni Osnabrück)  
**Datum:** 22. Oktober 2026  
**Autoren-Schichten:** Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash  

---

## 1. Übersicht & Kontext

In Durchgang 21 wurden die Rückmeldungen und offenen Punkte zur Sound-Engine und zur audiovisuellen Spielerfahrung abgeschlossen:
1. Mehrere originale Switch-Angel-Tracks (`extra_slippy`, `Lets_Talk`, `MUTEK4am`, `did_i_make_this`, `AUTOTOMATONE`) sowie die direkte MIDI-Wiedergabe starteten im Browser nicht zuverlässig.
2. Der Wunsch nach einer transparenten, klassischen Player-Oberfläche im Stil von **Winamp v2** mit digitalem LCD-Status und sichtbarer **Echtzeit-Wellenform (Oszilloskop / Spektrumanalysator)** wurde umgesetzt.
3. Ein dedizierter **8-Bit Chiptune-Modus** wurde implementiert, der sich beim Umschalten in den **ASCII-3D-Look** automatisch aktiviert und auch manuell geschaltet werden kann.
4. Das Repository wurde um ca. 50 MB an rohen WAV-Dateien bereinigt; der Ordner `references/` dient ab sofort als saubere Inbox für zukünftige Inspirationen und Feedback.

---

## 2. Der KI-Staffellauf: Gemini 4 Argon, Claude 5.5 & Gemini 3.8 Flash

Das Projekt *SGC Command* dient als fortlaufende Fallstudie zur kollaborativen Softwareentwicklung durch autonome KI-Modelle im Rahmen eines Informatik-Studiums an der Universität Osnabrück.

In dieser Iteration arbeiteten drei Modell-Generationen Hand in Hand:
- **Gemini 4 Argon:** Grundlegende Architektur-Vorbereitung für die Strudel-Superdough-Brücke und Konzeption des isometrischen Voxel-Terrain-Dualismus.
- **Claude 5.5 Sonnet:** Entwurf des mathematischen MIDI-Parsers, Ableitung der Krumhansl-Schmuckler-Tonartenerkennung und Erstintegration der Switch-Angel-Skripte.
- **Gemini 3.8 Flash (Aktuelle Schicht):** Gründliche Ursachenanalyse der verbliebenen Syntax- und Laufzeitabstürze in den Live-Coding-Tracks, Bereinigung der `postgain`-Kollision, Implementierung des Winamp-Interfaces mit Canvas-Oszilloskop, Kopplung des 8-Bit-Chiptune-Sounds an die ASCII-Engine, Bereinigung der Großdateien und Validierung der Testsuite.

---

## 3. Technische Ursachenanalyse der Audio-Abstürze

Die Fehlersuche in der WebAudio- und Strudel-Pipeline förderte vier Kernursachen zutage:

### A. Veraltetes HTML-String-Chaining in JavaScript
In Switch Angels Skripten finden sich Ausdrücke wie:
- `extra_slippy.txt`: `"-14".seg(16)`
- `AUTOTOMATONE.txt`: `"<0 <6 6 8 9> 0 2 4>*16".seg(16).rib(15,2).sub(2)`
- `MUTEK4am.txt`: `"d".sub(24)`
- `did_i_make_this.txt`: `<template-string>.sub(24)`
- `Lets_Talk.txt`: `"<0 3 9 4 7>*16".add(-3)`

**Problem:** In Standard-JavaScript ist `String.prototype.sub()` eine veraltete HTML-Hilfsfunktion aus dem Jahr 1995, die `<sub>...</sub>` zurückgibt. Strudels Mini-Notation kann mit `<sub>` nichts anfangen und scheitert. Methoden wie `.seg()` und `.add()` existierten auf `String.prototype` überhaupt nicht und führten zu sofortigen `TypeError`-Abbrüchen.

**Lösung:**
1. Der Code-Präprozessor `preprocessSwitchAngelCode(code)` normalisiert gekettete String-Literale via regulärer Ausdrücke in saubere Pattern-Aufrufe (`n("...").seg(16)` bzw. `note("...").sub(24)`).
2. Zusätzlich wurden `String.prototype` und `Number.prototype` in `game/sound.js` defensiv erweitert, sodass auch dynamisch erzeugte oder manuell im Live-Editor eingetippte Strings stets sichere Pattern-Objekte zurückliefern.

### B. `postgain`-Kollision im REPL Scope
In den fünf betroffenen Stücken stand die Zeile:
```javascript
const volume = slider(0.9);
all(x => x.mul(postgain(volume)));
```
Im vorherigen Setup war `postgain` im Strudel-Scope fälschlicherweise als einfaches JavaScript-Objekt `{postgain: v}` registriert worden. Beim Ausführen von `x.mul(...)` versuchte Strudel, ein Pattern mit einem reinen JS-Objekt zu multiplizieren, was die Auswertung aller Stimmen blockierte. Die Bereinigung stellt sicher, dass Strudels interne `postgain`-Methode uneingeschränkt greift.

### C. Fehlende Hilfsfunktionen (`delaysync`, `pk`)
`extra_slippy` verwendete ein experimentelles `.delaysync(3/8)`. Dies wurde sowohl auf Strudels `Pattern.prototype` registriert als auch im Präprozessor transparent auf `.delay(3/8)` abgebildet. Ebenso wurde `window.pk(...)` für die Akkord-Voicing-Generierung in `Lets_Talk` stabilisiert.

### D. Störungsfreies Fallback-Routing
Falls bei fehlerhafter Benutzereingabe die Auswertung im Web-Worker fehlschlägt, fängt `STRUDEL.evaluate()` den Fehler ab und schaltet automatisch auf den internen WebAudio-Synthesizer um. Das Spiel bleibt dadurch niemals stumm.

---

## 4. Winamp-Style Retro-Audio-Player (`SGC-AMP v2.80`) & ReBirth-338 Live Studio

Um dem Spieler volle Kontrolle, Transparenz und kreative Live-Coding-Möglichkeiten über den Soundtrack zu geben, wurde das Sound-Interface grundlegend erweitert:
- **LCD-Matrix-Display & Oszilloskop:**
  - Marquee-Laufzeile mit Titel, Interpret (`Switch Angel`, `SGC Core`, `MIDI Bridge`) und Musikstil.
  - Laufende Zeitanzeige (`00:00 / 02:45`), BPM- und CPS-Zähler.
  - Eindeutige, leuchtende LED-Status-Plaketten: `[ ▶ PLAYING ]` (Neongrün pulsierend), `[ ⏸ PAUSED ]` (Bernstein), `[ ⏹ STOPPED ]` (Rot).
  - Echtzeit-Oszilloskop & 28-Band-Spektrumanalysator (`#winamp-vis`) am WebAudio `AnalyserNode`.
- **ReBirth RB-338 Synthesizer- & Drum-Rack:**
  - **TB-303 Acid Bass Rack:** Soundbank-Umschalter für `303 Saw`, `303 Sq`, `SH-101`, `Sub`, `Slap`, `8-Bit` und `Reese`. Drehregler/Schieberegler mit Echtzeit-Parameteranzeige für **CUTOFF** (100Hz–8kHz), **RESONANCE** (Q 0.5–20), **ENV MOD** (0–100%), **DECAY** (0.05s–1.2s), **DISTORTION** (WaveShaper Soft-Clipping) und **TUNE** (-12..+12 Halbtöne).
  - **Roland TR Drum Machine:** Soundbank-Wähler für Kick (`TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Acoustic`, `Acid`) und Hi-Hat (`TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Noise Sweep`). Regler für **BD TUNE**, **BD DECAY**, **HAT DECAY** und **TEMPO (BPM)**.
  - **Soundbank Hot-Injection:** Mit dem Button `[ ✍ SOUNDBANKS ANWENDEN ]` werden die gewählten Instrumente direkt in den Code übertragen.
- **Strudel.cc Live-Code Interface (Permanent geöffnet & im Zentrum):**
  - Das Code-Fenster ist nicht mehr versteckt, sondern bildet das Herzstück des Studios.
  - **Echtzeit-Stimmen-Monitor:** Leuchtende Neonschilder (`$KICK`, `$HAT`, `$SNARE`, `$BASS`, `$MELODY`) pulsieren im Takt jedes Ereignisses.
  - **16-Step Sequenzer-Lauflicht:** 16 runde LED-Lichter wandern synchron zum Beat über das Taktraster.
  - **Strudel.cc Visual-Pulse:** Der Editor-Rahmen pulsiert synchron zu den Transienten der Musik.
  - Tastenkürzel **`Strg+Enter`** / **`Cmd+Enter`** wertet Änderungen sofort live aus.

---

## 5. Stargate Theme & MIDI-Direktwiedergabe

Statt einfacher Synthesizer-Klone analysiert die neue MIDI-Bridge die 10 Spuren der Originaldatei (`STARGATE_THEME_MIDI_B64`) und teilt sie in synchrone 16-Step-Takte ein (`<[bar0] [bar1] ...>`):
- **Heroische Bläser-Fanfare ($MELODY, Spur 2):** Spezifisch modellierte Waldhörner und Trompeten (`sawtooth`, gezielter Filter-Attack, warmer Nachhall).
- **Elektrischer Bass ($BASS, Spur 6):** Treibende Achtel-Basslinie mit leichter Resonanz.
- **Harmonie-Blechbläser ($HARMONY, Spur 0):** Epische Quint-Akkorde zur Unterstützung der Fanfare.
- **Orchester-Schlagwerk & Pauken ($DRUMS, Spur 9):** General-MIDI-Noten (Bassdrum, Snare, Hi-Hats, Crash-Becken und der dramatische Paukenwirbel vor Takt 12) werden direkt auf prozedurale WebAudio-Drums gemappt.

Neben dem Hauptthema (`theme_midi`) und der Eröffnungsfanfare (`theme_fanfare`) stehen vier hybride **Switch Angel Remixes** zur Verfügung.

---

## 6. Automatischer 8-Bit Chiptune Modus

Das Spiel koppelt Grafik und Akustik:
- Sobald das Spielfeld in den **ASCII-3D-Modus** (`S.gfxMode = 'ascii'`) wechselt, schaltet die Soundengine auf **8-Bit Chiptune** um.
- Alle Stimmen wechseln auf reine Rechteckwellen (`square`), die Filtereckfrequenzen werden angehoben und gehaltene Töne erhalten ein klassisches **40-Hz-Arpeggio-Flutter** im Stil von C64- und NES-Klassikern.
- Über den Button `[ 👾 8-Bit: AN/AUS ]` im Winamp-Player kann dieser Modus auch im Pixel-Voxel-Modus manuell aktiviert werden.

---

## 7. Bereinigung & Test-Ergebnisse

- **Schlankes Repository:** 6 große WAV-Dateien (ca. 50 MB) und `samples.zip` wurden aus `Switch-Angel/` entfernt. Alle Drums und Synthesizer-Sounds werden offline generiert.
- **Inbox `references/`:** Aufgeräumt und mit einer klaren `README.md` versehen; bereit für künftige Notizen und Skizzen.
- **Vollständige Test-Abdeckung:** `node test-browser.js` führt 63 automatisierte Prüfungen aus – alle Tests laufen mit **0 Fehlern** fehlerfrei durch.

