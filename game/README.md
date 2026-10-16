# 📖 SGC COMMAND – Anleitung

## Was ist das?

Ein taktisches Grid-Kampfspiel im Stargate-Universum. Du leitest das SGC unter Cheyenne Mountain, baust deine Basis aus, forschst, und schickst Teams durch das Gate auf Missionen. Der Kampf ist **rundenbasiert und taktisch** (X-COM-Style) – du steuerst jede Aktion.

> **Im Spiel:** Der Button **❓** oben im Header öffnet diese Anleitung jederzeit. Im Kampf gibt es zusätzlich einen **❓ Hilfe**-Button im unteren Panel.

---

## Die zwei Welten

### 🏗 Basis (Cheyenne Mountain)
Die Basis ist ein **Berg**:
- **Oben:** Himmel, Parkplatz, Eingangsbau („SGC – Cheyenne Mountain")
- **Rechts:** Fahrstuhl-Schacht (fährt hoch/runter)
- **Mitte:** 8 Spalten × 10 Etagen = 80 Zellen für Räume
- **Unten:** der **Gateraum** (E1)

- Baue Räume (Labor, Werkstatt, MedBay, Kaserne, …): rechts Raum-Typ wählen → freies Feld anklicken
- Weise Staff zu (Roster-Tab → Dropdown)
- **Power-Budget:** Generatoren (+10) müssen alle Consumer versorgen, sonst geht alles offline
- **Produktion:** Lab → Research-Points, Werkstatt → Erz, MedBay → Heilung

### 🗺 Sternenkarte
- Ein überspringbares Stargate-Intro öffnet ein neues Spiel; anschließend führt Hammonds Einsatzbesprechung nach **Chulak**.
- Vor wichtigen Story-Missionen gibt es ein Briefing mit Auftrag und Teamstimmen; im Kampf werden kurze Dialoge an Ankunft und erstem Feindkontakt eingeblendet.
- Kampagnenmissionen werden der Reihe nach freigeschaltet.
- Wähle dein Team (max. 6; SG-1 ist in der Pilotmission vorausgewählt)
- **„Mission starten"** → Story-Briefing (falls vorhanden) → Gateroom-Animation (mit Whoosh) → Kampf

### ⚔ Kampf (Top-Down Grid)
- **20×15 Tiles**, 2 AP pro Einheit pro Runde
- **Klicke auf eine Einheit** → Bewegungsbereich (blau) + **Angriffsziele (rot ✛) erscheinen sofort**
- **Klicke auf ein blaues Feld** → bewegen (1 AP)
- **Chulak-Tutorial:** Jack wird nach dem ersten Bewegungsschritt zum Schießen freigegeben; danach erscheinen seine Angriffsziele wie gewohnt.
- **Klicke auf einen roten Gegner (✛)** → **schießen** (1 AP)
- **Klicke auf benachbarten Gegner** → Melee (Chakram etc., 1 AP)
- **⏸ Warten** → Rest-AP an nächste Einheit
- **Deckung:** Kisten (−25% Treffer), Mauern (−50%)
- **Einbahn-Gate:** Keine Runden-Uhr; extrahiere am Gate oder gewinne den Kampf.

---

## Die Jagged-Alliance-UI (unten im Kampf)

| Bereich | Inhalt |
|---|---|
| **Links** | Portrait, Name, Klasse, HP-Bar, AP (●●), Waffe, Melee |
| **Mitte** | Aktions-Buttons (⏸ Warten, 🔄 Neu wählen, ❓ Hilfe, ▶ Weiter) |
| **Rechts** | Gate-Bereitschaft und letzter Kampf-Log (4 Zeilen) |

**Hover** über eine Einheit → Info-Tooltip (Name, HP, Waffe, Reichweite).

**FX:** Schadenszahlen fliegen hoch, Treffer-Flash, Mündungsfeuer, Tracer-Linien, Screen-Shake bei starkem Schaden, Death-Partikel.

---

## Sound

Alles **prozedural** (Web-Audio, keine Dateien):
- 🔫 Schuss (Rifle/Shotgun), ⚔ Melee, 💥 Treffer/Verfehlen, 💀 Tod
- 🌀 Gate-Whoosh bei Mission-Start
- 🏗 Bau-Klick, 🎵 Sieg-/Niederlage-Fanfare
- **🔊/🔇** Button oben im Header schaltet Sound an/aus

---

## Die Regeln

### AP-System
| Aktion | Kosten |
|---|---|
| 1 Tile bewegen (8-Wege) | 1 AP |
| Schießen | 1 AP |
| Melee (Chakram, etc.) | 1 AP |
| Warten | 0 AP |

### Trefferchance
- Base: 70% (gleiche Reihe/Spalte), 50% (Diagonale)
- Ziel in Deckung: −25% (Kiste) / −50% (Mauer)
- Schütze in Deckung: +10% / +15%

### Tod
- **Rekruten:** sterben permanent. Gedenktafel in der Basis.
- **SG-1:** Duplikat-Klausel. Können downen, aber nicht sterben.
- **Pilotmission:** Teal’c wird erst nach einem Sieg auf Chulak rekrutiert. Eine Extraktion rettet SG-1, lässt den Auftrag aber offen.

### Einbahn-Gate
- Es gibt keinen Runden-Countdown. Eine Mission endet mit dem Sieg oder durch Extraktion.
- Für die Extraktion muss das gesamte Team zum Gate zurückkehren; sie bringt 50% Beute (mit G1: 60%).
- In der Pilotmission auf Chulak reicht eine Extraktion nicht: Teal’c schließt sich SG-1 erst nach dem Sieg an.

---

## Die 5 Kapitel

| Akt | Titel | Neuer Feind | Missionen |
|---|---|---|---|
| 1 | Erste Schritte | Jaffa | 5 |
| 2 | Das Netz wächst | Veteran, Elite, Goa'uld | 6 |
| 3 | Bedrohungen | System Lords | 5 |
| 4 | Replikatoren | Replikatoren + Königin | 5 |
| 5 | Das Ende | 3 Lords, Ancient Drones | 6 |

---

## Tips & Tricks

1. **Carter immer mitnehmen** – Gate-Genius erhöht Extraktionsbeute um 10%
2. **Teal'c gegen Jaffa** – +8 Schaden (Chakram)
3. **Deckung nutzen** – Kisten sind besser als Mauern (du kannst sie betreten)
4. **Medic im Team** – −15% Schaden erlitten
5. **Nicht alle 6 schicken** – 4 SG-1 + 2 Rekruten ist oft genug
6. **Power-Budget im Auge behalten** – 1 Generator = 10 Power
7. **Sandwich (Hammond)** – 1× pro Kapitel, +20 Morale für alle

---

## Steuerung

| Input | Aktion |
|---|---|
| Klick auf eigene Einheit | Auswählen (blauer Bewegungsbereich + rote Angriffsziele) |
| Klick auf blaues Feld | Bewegen (1 AP) |
| Klick auf roten Gegner (✛) | **Schießen** (1 AP) |
| Klick auf benachbarten Gegner | Melee-Angriff (1 AP) |
| ⏸ Warten (Panel) | Rest-AP an nächste Einheit |
| ❓ (Header/Panel) | Anleitung öffnen |
| 🔊 (Header) | Sound an/aus |
| Klick auf Gate (Gateroom) | Animation überspringen |

---

## Technische Infos

- **Dateien:** `index.html`, `style.css`, `sound.js`, `art.js`, `art2.js`, `engine.js`, `combat.js`, `base.js`, `ui.js`, `cinematic.js`, `../content/scenes.js`
- **Kein Build-Step** – einfach `index.html` im Browser öffnen
- **Save:** `localStorage` (auto nach jedem Tag)
- **Sound:** Web-Audio-API, prozedural, kein Download nötig
- **Grafik:** 100% prozedural (Canvas-API). `art.js` = Basis, `art2.js` = Artist-Erweiterung (Rekruten, Feinde, Waffen, Icons, Terrain, Akten)
- **Kampf-Terrain:** Biome werden zellweise aus `drawTile()` gerendert. Der Offscreen-Cache behält Weltkoordinaten für die prozeduralen Details bei; pro Karte gibt es genau ein Gate-Feld.
- **Keine Bilddateien, kein drawImage in art2.js** – nur `fillRect` (hartkantig, pixel-art)

## Art-Toolchain (für Entwickler)

- **`ART-TOOLCHAIN.md`** – wie man neue Assets generiert, testet, integriert
- **`incoming/preview.html`** – visueller Kontaktbogen (im Browser öffnen)
- **`incoming/rastertest.js`** – Headless-Test (Mock-Canvas, Grenzen, Determinismus)
- **`test-browser.js`** – Browser-Gate-Test (muss nach jedem Durchgang grün sein)
- **`HANDOFF.md`** – Übergabe-Dokument für Folge-Teams/Agenten

## Planungs-Dokumente

- **`ROADMAP.md`** – Prioritäten + Spezifikationen (4 Phasen, Zeitplan)
- **`QUEST-ENGINE-SPEC.md`** – Quest-Engine-Architektur (Schema, Trigger, Abnahme)
- **`content/`** – Lore & Quest-Texte (quests.js, intros.js, lore.md)
- **`wiki/`** – 17 verlinkte HTML-Seiten (inkl. quests.html, art-toolchain.html)

---

*„Der Kaffee ist noch schlecht." – Hammond*
