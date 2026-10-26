# Captain's Log 039 – „80s/90s Hit Jukebox: Blue Monday, Confusion & Abschied vom Switch-Angel-Ordner"

**Release:** SGC Command 0.37 final + Jukebox-Pass (Post-Release-Erweiterung, kein neuer Versions-Stand)
**Datum:** 26. Oktober 2026
**Autorenschaft:** Cline (Claude Opus 4.8) · Multi-Agenten-Staffel: Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5 · Cline
**Motto:** *„Seven new hits in the vault, one annoying song is gone – and the Gate is pushed."*

---

## 1. Auftrag (Nutzer)

Vier Wünsche in einem Durchgang:

1. **Den Song „Stand Orders" komplett streichen** – der deterministische `SONGGEN`-Track mit dem Titel `//@title Stand Orders @by SGC SongGen (Switch Angel Style)` (erzeugt bei jedem Start der Halte-Mission 1-3) nervte „immer wenn er kommt".
2. **Den `switch-angel/`-Ordner aus dem Repo entfernen** – ein eigener Ordner mit Switch Angels Songs (16 Dateien) aproprierte den Namen „viel zu sehr"; die Spiele brauchen die Ordner-Quelle nicht (der Code steckt bereits in `game/switch-angel.js`).
3. **Neue Strudel-Versionen**: Blue Monday (New Order) sowie Confusion, „Pump Action Panel" Version und andere Versionen.
4. **Ein paar 80er- und 90er-Hits zum Unlocken.**
5. **Git-Push** des Gesamtpakets.

---

## 2. Umsetzung

### 2.1 „Stand Orders" gestrichen (nur der Song, nicht die Mission)

* `game/midi.js` – `SONGGEN.fromCombat()`: Missionen namens „Stand Orders" liefern jetzt `null`; der Missions-Flow in `game/ui.js` fällt automatisch auf die Standard-Kampfmusik (`SFX.music('combat')`) zurück. Alle anderen Missionen erzeugen weiterhin ihren Seed-Song.
* `game/ui.js` – bei Missionsstart wird ein evtl. aus der aktuellen Session übrig gebliebenes `STRUDEL_TRACKS.generated_mission` mit dem Namen „Stand Orders" aus Katalog und Pattern-Map entfernt.
* Die **Mission 1-3 „Stand Orders"** selbst bleibt natürlich im Kampagnenverlauf.

### 2.2 `switch-angel/`-Ordner entfernt

* `git rm -r switch-angel/` – 21 Dateien (18 Song-Quellen + 3 Prebake/Generative-Dateien) verlassen das Repo.
* Der **AGPL-Credit bleibt** in `game/switch-angel.js` (Katalog-Einträge „⚡ Titel (Switch Angel)"), weil die eingebetteten Strudel-Codes dort herkommen.
* Keine Laufzeit-Abhängigkeit betroffen: Das Spiel hat die Ordner-Dateien nie per `fetch()` geladen (die Codes sind in `SWITCH_ANGEL_TRACKS` eingebettet).
* `game/sound.js`-Header-Kommentar aktualisiert.

### 2.3 80s/90s Hit Jukebox (`game/hit-tracks.js`, neu)

Die Quellen für die vier MIDI-Versionen liegen als Transkriptionen im `Downloads`-Ordner (MuseScore-Work 2025) und wurden **offline mit der eigenen Project-Pipeline** (`parseMidi` → `analyzeMidi` → `midiTrackToSteps` → `stepsToMini` aus `game/midi.js`, identisch zum Stargate-Theme-Flow) in Strudel-Code umgewandelt. Build-Skript: `scratch/build-hit-tracks.js` (deterministisch wiederholbar).

| Key | Titel | Quelle | BPM | Rollen-Pool |
|---|---|---|---|---|
| `hit_blue_monday` | Blue Monday (New Order 1983) | `bluemonday.mid`, Takte 49–80 (Oktav-Bass, 808-Drums, „Blue Monday"-Strings ab Takt 67, Sequenzen-Arpeggio ab Takt 73) | 130 | Gate |
| `hit_confusion` | Confusion (New Order 1983) | `confusion.mid`, Takte 17–48 | 127 | Combat |
| `hit_confusion_pump` | Confusion (**Pump Action Panel Version**) | `confusion2.mid`, Takte 17–48, 138-BPM-Treatment (harte 808-Pumpe, Diode-Drive, Clip) | 138 | Boss |
| `hit_confusion_v3` | Confusion (Version III · 120 BPM) | `confusion3.mid`, Takte 17–48 (Glocken-Flirren + Piano-Chord-Bass) | 120 | Planet |

Dazu **drei Stil-Hommagen mit eigenen Noten** (Regel aus `captains-log-032`: keine 1:1-Notenkopien geschützter Werke, AGPL-/rechtssicher):

| Key | Titel | Stil | BPM | Rollen-Pool |
|---|---|---|---|---|
| `hit_take_on_me` | Take On Me (Synth-Pop 1985 Style) | a-ha-Ära: 16tel-Arpeggio, Acid-Bass | 165 | Combat |
| `hit_sweet_dreams` | Sweet Dreams (Cold Wave 1983 Style) | Eurythmics-Ära: fallender Oktav-Bass, Ooh-Pads | 121 | Map |
| `hit_billie_jean` | Billie Jean (Disco-Funk 1982 Style) | MJ-Ära: gedämpfte 808-Pumpe, Oktav-Bass, Stabs | 118 | Planet |

**Technische Anmerkungen:**

* Stimmen-Architektur je Song: `$KICK`/`$SNARE`/`$HAT` (Drum-Noten in drei getrennte 16tel-Schichten gesplittet, GM-Pitch-Mapping inkl. Transkriptions-Pitches 27/70/82), `$BASS` (tiefste Note pro Step, `sawtooth`+`acidenv`), `$SEQ`/`$LEAD` (Mono-Melodie, `supersaw`), `$CHORDS` (poly, `trancegate`).
* Die MIDI-Dateien selbst werden **nicht** ins Repo übernommen (Zero-Dependency, Floppy-Budget) – nur der generierte Strudel-Code (32 KB für 7 Tracks).
* Alle 7 Tracks **kompilieren sauber** im Test-Harness (4–7 Stimmen je Track, geprüft per `STRUDEL.compile`).

### 2.4 Freischaltung („zum Unlocken")

* `game/music-progress.js` – `planetMap()` mappt jetzt `sa_*` **und** `hit_*` auf Planeten: jeder entdeckte Planet schaltet deterministisch den nächsten Vault-Track frei (27 Vault-Tracks insgesamt).
* `game/engine.js` – `isTrackUnlocked()` behandelt `hit_*` wie `sa_*` (über `S.unlockedTracks`).
* `game/sound.js` – Rollen-Pools (`gate/combat/boss/planet/map`) beinhalten die Hits; der Auto-Pool spielt Vault-Tracks nur, wenn sie freigeschaltet sind (wie bei `sa_*`).
* `game/ui.js` – neuer Winamp-Tab **„🎧 80s/90s Hits"** (geöffnet/gesamt-Zähler, z. B. `2/7`), Playlist zeigt freigeschaltete Tracks.

---

## 3. Verifikation

| Prüfung | Ergebnis |
|---|---|
| `node test-browser.js` | **377/377 Prüfungen, 0 Fehler** (357 + 20 neue: LOAD hit-tracks.js, 7× Compilation, Vault-Map, Lock-Status, 2× SONGGEN „Stand Orders"-Exklusion, Katalog-Check, Ordner-Check) |
| `node --check` alle geänderten `game/*.js` + `test-browser.js` | 7/7 syntax-clean |
| `git status --porcelain` | sauber nach Commit |
| Floppy-Budget | Release 0.39: `SGC-Command-039.zip` ≈ 0.8 MB – unter dem 1,44-MB-Floppy-Budget |

---

## 4. Git

Getrennte Feature-Commits (Conventional Commits) auf `main`, danach **Push inklusive der noch nicht gepushten Tags `v0.37`/`v0.37-final`** und des neuen Stands. Als Abschluss des Passes wurde **Release 0.39 „Blue Monday“** geschnitten: Portal/Footers/i18n auf 0.39 angehoben, `release/SGC-Command-039.zip` + `.sha256` gebaut, annotiertes Tag `v0.39`.

## 5. Bekannte Restpunkte (bekannt & gewollt)

* **Interpretation „Pump Action Panel":** kein lokales File/Song mit diesem Namen gefunden (Downloads, G:\AgentHome, FL-Studio-Verzeichnisse durchsucht); es existiert die pump-ge-uppte Confusion-Variante. Falls eine eigene „Pump Action Panel"-Komposition gemeint war: einfach die MIDI/Strudel-Quelle liefern – `scratch/build-hit-tracks.js` macht den Rest in 30 Sekunden.
* `showLogEntry()` Dead Code in `hub.html` (seit Log 038 bekannt).
* Ältere `v022`–`v036`-ZIPs im Repo-Root (historisch, Log 038).
* **Release 0.39 gebaut**: `release/SGC-Command-039.zip` + `.sha256` (Build-Skript: `scratch/build-release-039.ps1`), annotiertes Tag `v0.39`, Portal/Footers/i18n in alle 9 Sprachen auf 0.39 „Blue Monday“ angehoben (ZIP = 037-final-Layout + `game/hit-tracks.js` + Log 039).

