# Captain's Log 037 – „Ebene 28: Torraum 2×2, Foothold-Einsatzkarte & In-Mission SGC-AMP“

**Release:** SGC Command 0.37 („Die 808 drückt jetzt“)  
**Datum:** 26. Oktober 2026  
**Autorenschaft:** Gemini 3.8 Flash High (Multi-Agenten-Pair-Programming mit Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5)  
**Motto:** *„Walter, verriegeln Sie das Tor und stellen Sie den SGC-AMP auf laut – Infiltratoren auf Ebene 28!“*

---

## 1. Autoren-Korrektur & Versionsstand 0.37

Im letzten Revisions-Durchgang hatte sich in die Autorenzeile ein redaktioneller Fehler eingeschlichen: Claude 5.5 war doppelt gelistet und ein nie am Projekt beteiligtes *Claude 3.5 Sonnet* aufgeführt. Wir haben dies projektweit in allen Dokumenten, Readmes und Portal-Footern auf die reale Multi-Agenten-Staffel korrigiert:

> *Entwickelt im autonomen Multi-Agenten-Pair-Programming (Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5) · Lizenziert unter AGPL-3.0-or-later*

Gleichzeitig heben wir die Version ohne vorangestelltes `v` konsistent auf **0.37 · „Die 808 drückt jetzt“**.

---

## 2. Kanonischer Grundriss: Torraum 2×2 in der linken Ecke & Save-Migration

Nach Abgleich mit den originalen Cheyenne Mountain Blaupausen von Ebene 28 und Ebene 27 wurde die Raumaufteilung der Stargate-Kommandozentrale im Querschnitts-Canvas perfektioniert:

```
[ Ebene 27 ]  [    TORRAUM     ]  [ BESPRECHUNG (SG-1) ]  [ BÜRO GEN. HAMMOND  ]
[ Ebene 28 ]  [  STARGATE 2x2  ]  [ KONTROLLRAUM WALTER]  [ MALP & AUSRÜSTUNG  ]
              Spalten 0 .. 1      Spalten 2 .. 3          Spalten 4 .. 5
```

### 📐 Die architektonischen Highlights:
1. **2×2 Torraum (`w: 2, h: 2`, 130 × 72 px):** Der Stargate-Silo sitzt nun exakt in der unteren linken Ecke (`x: 0, y: 0`), flankiert von Betonpfeilern, einer Stahlrampe mit gelben Sicherheitsstreifen, leuchtenden Chevrons, animiertem Ereignishorizont und bewaffnetem Air-Force-Wachposten.
2. **Kontrollraum & Besprechungsraum (Spalten 2–3):**
   - **Ebene 28:** Chief Walter Harriman am dreifachen Anwahl-Monitor mit Aussichtsfenster direkt auf das Sternentor. Klick spielt Walters Funksprüche und das Gate-Aktivierungs-Audio ab.
   - **Ebene 27:** Konferenztisch von SG-1 mit Fenster-Blick hinab in den Torraum.
3. **General's Office & MALP (Spalten 4–5):**
   - **Ebene 27:** Büro von General George Hammond mit rotem Notfalltelefon und interaktivem Klemmbrett-Hotspot (`showClipboardModal()`).
   - **Ebene 28:** Staging-Bereich für MALP-Tiefensonden und Missions-Kisten.
4. **Automatische Savegame-Migration (`ensureGateLayout`):**
   - Bestehende Spielstände im `localStorage` mit alten Koordinaten werden beim Laden automatisch erkannt: Alte Zellen werden gereinigt, der Torraum auf `x:0, y:0, w:2, h:2` neu verankert und das Gitter re-initialisiert.

---

## 3. SGC Ebene 28 Taktik-Karte & Foothold-Infiltration

Auf Basis des Originalplans von Cheyenne Mountain Complex Ebene 28 wurde die taktische Gefechtskarte `MAPS.sgc` von Grund auf neu gestaltet:

* **Grundriss (20 × 15 Kacheln):** Torraum mit Rampe und Tor (`GG`) oben links, Panzertor (`H`) zum Tunnelkorridor mit Wandleuchten, Kontrollraum oben rechts mit Pulten und Konsolen (`l.l`), Laboratorien unten links und Evakuierungs-Schächte.
* **Neuer Einsatz `1-6: Ebene 28: Infiltrationsalarm` (Foothold):** Feindliche Einheiten brechen direkt durch das Erdtor ein. SG-1 muss den Torraum sichern und die Panzertore verteidigen.
* **Test-Preset `sgc_defense`:** Im Speichermenü (`SGC_SAVES.presets.sgc_defense`) lässt sich das Infiltrations-Szenario mit voll ausgerüstetem SG-1-Team sofort mit einem einzigen Klick starten und testen.

---

## 4. In-Mission Audio & Sound-Steuerung

Bisher überdeckte das Kampf-Overlay während eines Einsatzes das gesamte Interface, sodass Spieler weder die Lautstärke anpassen noch Tracks umschalten konnten.

1. **Audio-Schnellzugriff:** Im unteren Aktionspanel (`#combat-ui`) und in der schwebenden Leiste oben rechts im Gefecht (`#combat-audio-bar`) stehen ab sofort zur Verfügung:
   - `[ 🔊 / 🔇 ]`: Sofortiges Stummschalten bzw. Reaktivieren des Gesamtsounds (`toggleCombatAudio()`).
   - `[ 📻 SGC-AMP ]`: Öffnet die voll interaktive Retro-Winamp-Workstation mitten im Gefecht als modales Fenster – inklusive Oszilloskop, Track-Wahl und Live-Coding.
2. **Drei neue Strudel-Remixes (`game/midi.js`):**
   - 🚨 **SGC Ebene 28: Foothold Alien Infiltration** (140 BPM, Dark Electro Synthwave mit Alarm-Lead, Acid-303-Bass & TR-808 Beat).
   - 🐍 **Apophis' Ha'tak Flotte (Dark Pharaoh Electro)** (130 BPM, bedrohliche Goa'uld-Blechbläser & mächtiger Sub-Bass).
   - 🌊 **Stargate Atlantis × Liquid Drum & Bass** (168 BPM, schwebender Pegasus-Chor, rollender Amen/D&B-Breakbeat & warmer 808-Sub).
   Damit wächst die Sammlung auf **18 Stargate-Themes** und insgesamt **38 spielbare Tracks**!

---

## 5. Autobattler im Zuschauermodus (Watch Mode)

Für Spieler, die das Gefecht entspannt verfolgen möchten, wurde der Autobattler substanziell erweitert:

1. **Dynamische Kameraverfolgung (`panCombatCamera`):** Während des Auto-Kampfs zentriert die Kamera automatisch auf den jeweils handelnden Soldaten oder attackierenden Feind.
2. **Status-Banner:** Ein pulsierendes HUD-Banner signalisiert `[ 🤖 AUTOBATTLER AKTIV · ZUSCHAUERMODUS ]` mit Ein-Klick-Möglichkeit zur manuellen Übernahme.
3. **Missions-Startbutton:** In der Sternenkarte kann ein Einsatz neben dem taktischen Modus nun direkt via `[ 🤖 Auto-Mission ]` gestartet werden.

---

## 6. Bereinigung & Base-Sidebar Polish

* **Keine lokalen Fetch-Abbrüche mehr:** Der fehleranfällige `tab-logs`-Tab (der unter `file://` an Browser-CORS scheiterte) wurde aus `index.html` und `hub.html` vollständig entfernt.
* **SGC-Forschungsübersicht im Seitenbereich:** Der bisherige, redundante 12-Button-Tech-Tree in `#base-side` wurde durch eine kompakte Statuskarte mit Fortschrittsbalken und Direktlink zum Astrophysik-Labor ersetzt.
* **Klebende Seitenleiste:** `#base-side` bleibt beim vertikalen Scrollen der 28 Bunker-Ebenen am oberen Bildschirmrand verankert (`sticky`) und besitzt elegante dunkle Scrollbalken.

---

## 7. Kanonische Welten & Einsätze

Das Stargate-Universum wurde um 15 legendäre Welten der Serie erweitert (von Urgos Kunstwelt über Pangar, Cassandra's Heimat Hanka, P3X-666 bis zu den schwebenden Städten der Nox).

* **Planeten:** 47 kanonische Sternensysteme mit echten Toradressen und Beschreibungen.
* **Missionsbaum:** 32 Einsätze über 5 Kapitel verteilt.
* **Testsuite:** Alle **265+ automatisierten Prüfungen** in `test-browser.js` laufen mit **0 Fehlern** lokal durch.
