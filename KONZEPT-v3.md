# SGC COMMAND v3 – Konzept

## 1. Was sich ändert (vs. v2)

Vom v2-Gerüst bleibt, was das Rückgrat trägt:
- Grid-basierte taktische Kämpfe (X-COM-Struktur)
- Gate-Timer als Tickende Uhr (38-Minuten-Fenster)
- Basis-Management im Hintergrund (Cheyenne Mountain)
- Lineare Erzählung in 5 Kapiteln

Weg:
- **Neglect-Mechanik** aus v1 — versteckte Zustandsstrafen, die niemand mehr nachvollziehen kann — ist komplett draußen.
- **Quest-Anzahl.** Kapitel werden durch Missionen vorangetrieben, nicht durch ein Quest-Labyrinth.

Neu:
- **Inventar-/Ausrüstungssystem** (Waffen, Rüstung, Spezial-Items)
- **Mehrere SG-Teams** als eigenständige Einsatzgruppierungen (SG-2 bis SG-5)
- **Kannonenfutter**: generierte, sterbliche Rekruten als eigentliche X-COM-Kerntruppe
- **Ausrüstung wirkt im Kampf** — vorgeplant vor jeder Mission

## 2. Die Leute (Charakter-System)

Das dramaturgische Kernstück: unsterbliche Helden der Serie auf der einen Seite, sterbliches Kannonenfutter auf der anderen — erst die zweite Seite macht den X-COM-Faktor aus.

**SG-1 (4 fix):** O'Neill, Carter, Jackson, Teal'c sind permanent verfügbar und die narrativen Helden. Sie sterben nie (Duplikat-Klausel): ein tödlicher Treffer reißt die Handlung nicht ab, der Charakter wird regeneriert.

**Einsatzteams (4):**
- **SG-2:** Major Mitchell + 2 Rekruten
- **SG-3:** Captain Sheppard + 2 Rekruten
- **SG-4:** Teyla + 2 Rekruten
- **SG-5:** Ronon + 2 Rekruten

**Named Chars (15 gesamt):** die bekannten Figuren aus der Serie. Verwundbar — und damit vorübergehend aus dem Einsatz — aber nie endgültig verloren.

**Generierte Rekruten (24+):** deterministisch erzeugt über `registerRecruit` (fester Seed, stabiles Ergebnis). Sie sind das eigentliche Kannonenfutter: können **permanent sterben** oder verwundet werden. Genau hier sitzt der X-COM-Druck.

**Team-Zusammenstellung:** vor jeder Mission wählt der Spieler Team + Rekruten. Max. 6 Units pro Mission — z. B. 4 SG + 2 Rekruten oder 2 SG + 4 Rekruten.

## 3. Inventar-System

Vier Ausrüstungs-Slots pro Char: **Primärwaffe, Sekundärwaffe, Rüstung, Spezial.**

**Waffen** (Basis-Daten aus `art2.js`), jede mit Schaden, Reichweite, Munition, Spezial:
- **Pistole** – 10 Dmg, 6 Kacheln, Munition, taktisches Abfeuern (Bewegung erlaubt)
- **Schrotflinte** – 18 Dmg, 2 Kacheln, Schrot, 180°-Bogen trifft alle dahinter
- **P90** – 3×5 Dmg, 4 Kacheln, 50r-Mag, Sturmfeuer (3 Salven)
- **Stabwaffe** – 20 Dmg, 10, Plasma, versengt Ziel (−1 AP)
- **Langer Stab** – 28 Dmg, 14, Plasma, durchschlägt leichte Deckung
- **Zat** – 35 Dmg, 8, Zat-Energie, ignoriert Rüstung (wirkt auf Goa'uld/Jaffa-Markierung)
- **Chakram** – 22 Dmg, 5, Energie, Doppelschlag (fliegt hin & zurück), Nah-/Fern-Hybrid
- **Hammer** – 30 Dmg, Nahkampf, keine, +25 % Schaden, bricht schwere Rüstung

**Rüstung:** Leicht (−10 % Schaden) · Mittel (−20 %) · Schwer (−30 %, −1 Bewegung/Runde)

**Spezial:** Medkit (+10 HP, 1×/Mission) · Schild (+1 Deckung) · Rauch (1 Runde Versteckt) · EMP (Feind −1 AP)

**Beschaffung:** Mission-Beute (fallen von Feinden) · Werkstatt (Erz + Tech → Ausrüstung) · Forschung (schaltet neue Waffentypen frei). Im Kampf greift Ausrüstung automatisch; der Spieler plant vorher, max. **2 Spezial-Items pro Team**.

## 4. Mehrere SG-Teams im Einsatz

Max. **2 SG-Teams** gleichzeitig auf Mission (v2-Code: `S.teams`). Sie operieren unabhängig — auch auf verschiedenen Planeten zugleich, jedes mit eigener Ausrüstung und eigenem Personal.

Jedes Team führt einen **eigenen Gate-Timer**: zwei getrennte 38-Minuten-Fenster. Die Rückkehr eines Teams verlängert nicht die Zeit des anderen. Parallel-Einsätze erfordern disziplinierte Aufteilung von Personal, Munition und Power.

**Unterstützung im Kampf:** liegen beide Teams auf demselben Planeten und ist Team A im Kampf, kann ab **Runde 5** Team B eintreffen — exakt **2 Units** in einer Safe-Zone, verbleibend bis Mission-Ende. Das System belohnt so die Führung zweier gleichwertiger Truppen: wer beide voll ausgerüstet schickt, baut im Moment des Treffens Überzahl auf.

## 5. Basis-Management (Tiefen-Plan)

Cheyenne Mountain als **Cutaway**, jedes Zimmer mit eigener Funktion.

**Räume:** Gateroom (Eb. −3) · Labore (−2) · Kaserne (−1) · oberirdisch: Eingang, Kantine, Parkplatz. Dazu: Werkstatt, Armory, MedBay, Lager, Generator, Training, Wasser.

**Produktion pro Tag:**
- Lab → RP (Forschungspunkte)
- Werkstatt → veredelt Erz
- Kantine → Nahrung (Moral/Verpflegung)
- Generator → Power (erlaubt längere Gate-Fenster)
- Wasser → versorgt die Kantine

**Craften:** Werkstatt (Erz) + Armory (Bestand) → neue Waffen, Rüstung, Spezial. Mehr Personal in der Werkstatt = schnellerer Takt.

**Training:** Kaserne + Training-Raum → Rekruten-Level-Up (HP, Treffer, Fähigkeiten).

**MedBay:** heilt verwundete Units, kuriert Verletzungs-Statuses.

**Personal:** wer im Feld bleibt, steht nicht auf der Basis — der Spieler weist Personal ein. Verteidigung vs. Versorgung, eine Dauer-Spannung.

**Integrität:** Struktur-Index (0–100), sinkt durch Gate-Verfall und feindliche Angriffe. Bei 0 fallen Gateroom & Generator offline. Reparierbar (Werkstatt + Erz + Zeit).

## 6. Was NICHT jetzt kommt (Roadmap Phase 2+)

Erscheint, **wenn das v3-Gerüst stabil läuft**:
- **Quest-Ketten** — narrative Fäden über Kapitel hinweg (erst wenn Missionen & Basis sauber stehen)
- **KI-Upgrade** — Feindintelligenz, taktische Verbünde; erste Iteration testet der Nutzer selbst
- **Hintergrundmusik** — pro Gebiet (SGC, Goa'uld-System, Replikator-Planet)
- **Fog of War** — taktische Unsicherheit, Sichtfelder auf dem Grid
- **Self-Made Units** — eigene Charaktere erstellen und ausbilden
- **Boss-Karten** — eigene Arenen für System-Lord-Konfrontationen

## 7. Serie → Gameplay (Übersetzungs-Tabelle)

| Stargate-Element | Gameplay-Mechanik |
|---|---|
| Gate | Ticking Clock (38 Min) + Deckungssektoren + definierter Fluchtweg |
| Chevrons | Mission-Phasen: jedes einrastende Chevron = 1 Phase |
| Goa'uld | Boss-Kämpfe mit „Götter-Charisma" (Bonus für Jaffa beim Herrscher) |
| Replikator | Vermehrung: alle 3 Runden +1 Feind |
| Ori | Theologie-Events: Zufalls-Event mit Moral-Choice |
| Asgard | Extraktion: Rettung per Warp bei Niederlage |
| Tok'ra | Netzwerk: Gate-Verbesserungen, gezieltes Intel |
| Jaffa | Standard-Feind mit Rängen (Rekrut/Veteran/Elite) |
| Sateda | Ronons Hammer (Melee-Spezial, +25 % Schaden) |
| Athos | Teylas Heilung (Medic-Bonus fürs Team) |
| Kullu | Teal'cs Chakram (Ranged-Melee-Hybrid) |
