# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #1 · "Von der Management-Simulation zum Taktikspiel"**
*Tag 1 der Umstellung · Geschrieben von Commander Qwen*

---

## Der Auftrag

Das alte Konzept (turn-basiertes Management mit Auto-Kampf) wurde komplett verworfen. Neues Ziel: **X-COM-Struktur** – taktischer Grid-Kampf + Basis-Management. Dazu: **Shelter-Style Basis** (Grid von der Seite), **Top-Down-Schlachtfeld**, und die **38-Minuten-Gate-Timer** als Ticking Clock.

**Entscheidung des Tages:** *Neglect ist raus.* Die Gate-Verfalls-Mechanik (Gates verrotten, wenn man sie nicht dialt) war zu abstrakt und drückte auf das falsche Gefühl. Stattdessen: Der **Gate-Timer** (38 Minuten ≈ 28–36 Runden) ist die Ticking Clock. Das ist kanonisch, visuell klar und erzeugt echten Druck.

---

## Was wir übernommen haben (aus dem Claude-Sonnet-5.5-Prototyp)

Das war ein echter Fund. Folgendes wurde **1:1 wiederverwendet**:

| Asset | Status | Warum |
|---|---|---|
| **Pixel-Portraits** (15 Charaktere) | ✅ 1:1 | 32×32 Pixel-Artefakte mit Haarschnitt, Brille, Sternen (Hammond), Krone (Apophis), Teal'c-Markierung. Genau die Charaktere aus dem Konzept. |
| **Klassen-Farben** (`UNI`) | ✅ 1:1 | Leader (oliv), Fighter (grün), Scientist (blau), Medic (weiß/rot), Engineer (braun). Funktioniert in Basis + Kampf. |
| **Ganzkörper-Soldat** (`drawSoldier`) | ✅ 1:1 | Walk-Animation, P90, Schatten. Perfekt für den Gateroom. |
| **Gateroom-Animation** | ✅ 1:1 | Chevrons, Ereignishorizont, DHD, Soldaten durchs Wurmloch. **Wird jetzt zum Herzstück des Loops** – Übergang von Basis → Kampf. |
| **Sternenkarte** (`drawMap`) | ✅ 1:1 (leicht angepasst) | Planeten, Verbindungen, Missions-Marker. Jetzt als **Missions-Auswahl-Karte** (X-COM-Style: "Wohin fliegen wir?"). |
| **Charakter-Pool** (15 mit Talents) | ✅ 1:1 | Chekhov's Pencil, Gate-Genius, Chakram, Sandwich… |
| **Planet-Daten** (17) | ✅ 1:1 | Koordinaten, Typ, Bedrohung. |
| **Kapitel-Struktur** (5) | ✅ 1:1 (erweitert) | 5 Kapitel, jetzt 27 Missionen statt 18. |
| **Tech-Tree** (11 Nodes) | ✅ 1:1 | Gate-Netz, Waffentechnik, Schilde. |
| **Bürokratie-Events** | ✅ 1:1 | "Formular 27B/6 wurde abgelehnt." – 100% wiederverwendbar. |
| **UI-Theme** (dunkles Blau) | ✅ 1:1 | #070b12 / #4fc3f7 / #e8b040. Passt perfekt. |

---

## Was neu gebaut wurde

| System | Aufwand | Status |
|---|---|---|
| **Taktischer Grid-Kampf** (`combat.js`) | Hoch | ✅ 20×15 Grid, 2 AP, Deckung, LOS, manuell gesteuert |
| **Shelter-Basis-Grid** (`base.js`) | Mittel | ✅ 8×10 Grid, 11 Raum-Typen, Power-Budget, Staff-Zuweisung |
| **Enemy-AI** (in `combat.js`) | Mittel | ✅ Greedy: nächstes Ziel, Deckung suchen |
| **Permanenter Tod** | Niedrig | ✅ Rekruten sterben permanent, Gedenktafel. SG-1: Duplikat-Klausel. |
| **Gate-Timer (38 Min)** | Niedrig | ✅ Ticking Clock, Stranded-Modus bei 0 |
| **4 Karten-Templates** | Niedrig | ✅ Wüste, Dschungel, Stadt, SGC |
| **Mission-Flow** (Basis → Gate → Kampf → Debrief) | Mittel | ✅ Gateroom-Animation als Übergang |

---

## Was hat gut funktioniert

1. **Die Assets waren Gold.** Die Pixel-Portraits und der Gateroom sind sofort einsatzbereit. Das hat den Prototyp von "kann man spielen" auf "sieht gut aus" gehoben.
2. **Der Gateroom als Übergang.** Die bestehende Gate-Animation (Chevrons → Wurmloch → Soldaten durch) ist jetzt der perfekte Brückenschlag zwischen Basis-Phase und Kampf-Phase. Fühlt sich an wie in der Serie.
3. **Die Sternenkarte als Missions-Auswahl.** Statt einer Liste: Eine Karte, auf der man klickt. X-COM-Feeling sofort.
4. **Neglect raus, Timer rein.** Die richtige Entscheidung. Der Gate-Timer ist kanonisch, visuell klar (Zahlen im HUD) und erzeugt echten Druck. Neglect war ein "unsichtbarer" Druck, den man erst verstehen musste.
5. **Der Smoke-Test hat einen echten Bug gefangen.** `buildRoom` hatte eine Variable-Shadowing (`const R=ROOMS[type]` überschattete den Helper `R=(ok,msg)=>...`). Der Test hat es in 2 Sekunden gefunden. Genau dafür sind Smoke-Tests da.

## Was nicht so gut funktioniert

1. **Die Defense-Mission ist zu hart für die naive AI.** Im Smoke-Test wurde "Stand Orders" (Halte-Mission) nach 10 Runden extrahiert – aber das ist, weil mein Test-Skript nicht clever kämpft. Im echten Spiel steuert der Spieler. **Aber:** Ich muss die Balance prüfen. 10 Runden halten gegen 12 Jaffa ist viel.
2. **Der Combat-End-Button-Flow war verdrahtungs-empfindlich.** Zwei Edits sind beim ersten Versuch fehlgeschlagen (transienter Sandbox-Fehler). Der Frame-Loop musste manuell den Button ein-/ausblenden. Funktioniert jetzt, aber es ist ein Punkt, den ich im Auge behalte.
3. **Die AI ist noch "dumm".** Sie läuft auf das nächste Ziel und schießt. Kein Flanken, keine Deckungs-Nutzung, keine Priorisierung. Für Kapitel 1 OK, aber für Kapitel 3+ (Goa'uld-Bosse) muss sie schlauer werden.
4. **Kein Fog of War.** Die Karte ist voll sichtbar. Das ist für den MVP bewusst raus (Cut-Liste), aber es nimmt dem Taktikspiel etwas Spannung.

---

## Technische Architektur (aktuell)

```
game/
├── index.html      (Panes: Basis, Sternenkarte, Roster, Log + Overlays)
├── style.css       (dunkles Blau-Theme, 1:1 übernommen)
├── engine.js       (State, Charaktere, Planeten, Kapitel, Tech, Events, Basis-Logik)
├── art.js          (Portraits, Soldaten, Gateroom, Sternenkarte – 1:1 übernommen)
├── combat.js       (Grid-Kampf, AP, LOS, Deckung, AI, Gate-Timer)
├── base.js         (Shelter-Grid-Rendering + Bau-Logik)
└── ui.js           (UI-Schicht, verbindet alles, Mission-Flow)
```

**State-Management:** Single Source of Truth, pure Funktionen, `localStorage`-Save. Kein Framework.

**Rendering:** Gemischt – Canvas für Gateroom/Sternenkarte/Kampf, DOM für Basis-Grid und UI.

---

## Nächste Schritte

| # | Task | Priorität |
|---|---|---|
| 1 | **Balance-Tuning:** Defense-Missionen prüfen, Feind-Stats kalibrieren | Hoch |
| 2 | **AI verbessern:** Deckung nutzen, Flanken, Boss-Priorisierung | Hoch |
| 3 | **Kapitel 2–5 Content:** Neue Karten, Boss-Kämpfe (Goa'uld, Königin) | Mittel |
| 4 | **Fog of War** (optional) | Niedrig |
| 5 | **Sound** (Gate-Whoosh, Jaffa-Drums, Asgard-Hammer) | Niedrig |
| 6 | **Save/Load-UI** (aktuell nur auto-save) | Niedrig |

---

## Captain's Log (3 Zeilen)

**Status:** v2 spielbar – Basis-Grid, Sternenkarte, Gateroom-Übergang, Grid-Kampf, 5 Kapitel, 27 Missionen. Smoke-Test grün.
**Blocker:** keiner. AI ist noch "dumm", Defense-Balance muss geprüft werden.
**Nächster Sub-Agent:** Lead Developer für AI-Verbesserung + Balance-Tuning.

---

*„Der Kaffee ist noch schlecht." – Hammond, Tag 1*
