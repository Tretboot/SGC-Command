# Captain's Log 036 – „Torraum 4×2, Walter im Kontrollraum & der Taktische Autobattler“

**Release:** SGC Command 0.36 („Die 808 drückt jetzt“)  
**Datum:** 26. Oktober 2026  
**Autorenschaft:** Gemini 3.8 Flash High (Multi-Agenten-Pair-Programming mit Gemini 4 Argon · Claude 5.5 / 3.5 Sonnet · Claude Opus 5.5 · Qwen 3.8 / 3.5)  
**Motto:** *„Chevron 7 verriegelt! Die Iris bleibt offen, der Torraum ist zweistöckig und die P90 gibt Feuerschutz.“*

---

## 1. Lagebericht: Multi-Agenten-Würdigung & Versionskonvention

In der vorangegangenen Iteration fehlte in der Autoren-Fußzeile eine wesentliche Fraktion unserer Entwicklungs-Historie: die Modelle der **Qwen-Familie** (insbesondere *Qwen 3.8 27b*, *Qwen 3.5 122b A10B-FP8* und *Commander Qwen*), die in den Anfangstagen und während der Sanierungsphasen der Universität Osnabrück (via virtUOS Kiwi) die architektonischen Grundlagen legten.

Die offizielle Autorenzeile lautet ab sofort im gesamten Projekt:
> *Entwickelt im autonomen Multi-Agenten-Pair-Programming (Gemini 4 Argon · Claude 5.5 / 3.5 Sonnet · Gemini 3.8 Flash · Claude Opus 5.5 · Qwen 3.8 / 3.5) · Lizenziert unter AGPL-3.0-or-later*

Zusätzlich wurde auf vielfachen Wunsch der Entwicklungs-Crew die Versionskonvention bereinigt: Das vorangestellte `v` wird in allen Titeln, Headern, Splash-Slogans und Footern fallengelassen. Wir stehen nun stolz bei **0.36 · „Die 808 drückt jetzt“**.

---

## 2. Der zweistöckige Gateroom (4×2) im Cheyenne Mountain Cutaway

Der Stargate-Torraum war bisher auf der Basis-Querschnittskarte ein kleines, unscheinbares 2×1-Rechteck. Nach kanonischer Rekonstruktion (und Serien-Lore von *Stargate SG-1*) ist der Torraum jedoch ein gewaltiges, zweistöckiges Silo, das die Ebenen 28 und 27 durchbricht.

### 📐 Architektur & Rendering
1. **Dimensionen:** Der Torraum belegt nun ein 4×2-Raster (`w: 4, h: 2`, $260 \times 72$ Pixel) in der unteren linken Ecke der Anlage (Spalten 0 bis 3 auf Level 28 und 27).
2. **Kanonische Details:**
   - Verstärkte Betonpfeiler und Bunkerträger mit gelben Warnstreifen.
   - Der Naquadah-Ring mit $r=26$ px, dunkler innerer Führungsnut und **9 radial angeordneten Chevrons** im leuchtenden Orange-Gelb.
   - Ein animierter **Ereignishorizont** (Wurmloch-Wasserspiegelung) mit radialem Himmelsblau-Gradienten und dynamischem Sinus-Schimmer (`Math.sin(now / 280)`).
   - Eine geneigte Stahlrampe mit Geländern und zwei bewaffneten Air-Force-Wachposten (SF) im P90-Anschlag.
3. **Interaktivität:** Ein Klick auf den Torraum öffnet sofort die Sternenkarte (`setTab('map')`) zur Toranwahl.

---

## 3. Ebene 28 Kontrollraum & Ebene 27 Besprechungsraum

Direkt rechts neben dem Torraum-Silo wurden die ikonischen Räume der Serie rekonstruiert:

| Ebene / Spalten | Raum | Details & Funktion |
|---|---|---|
| **Ebene 28 (Spalten 4–5)** | **Kontrollraum (Control Room)** | Panzerglas-Aussichtsfenster in den Torraum, Anwahl-Computer mit 3 CRT-Monitoren (grün, bernstein, blau für Chevron-Status) und **Chief Master Sergeant Walter Harriman**. Klick löst das Gate-Audio aus: *„Chevron 7 verriegelt! Wurmloch etabliert, Iris bleibt offen.“* |
| **Ebene 27 (Spalten 4–5)** | **Besprechungsraum (Briefing Room)** | Großer Konferenztisch mit 8 Stühlen mit Blick hinab in den Torraum, taktischer Projektionsschirm an der Wand. Klick öffnet die Einsatzbesprechung. |
| **Ebene 27 (Spalten 6–7)** | **Büro des Kommandeurs** | General Hammonds / Dr. Weirs Büro mit rotem Notfalltelefon, Schreibtisch und Klemmbrett-Hotspot (`showClipboardModal()`). |
| **Ebene 28 (Spalten 6–7)** | **MALP & Ausrüstung** | Kettenbetriebene MALP-Tiefensonde, Naquadah-Frachtkisten und Expeditions-Equipment. |

---

## 4. Taktik: Wache & Reaktionsfeuer (Guard Stance)

Das mit v0.35 eingeführte Reaktionsfeuer wurde um die **Wachstellung (Guard Stance)** vertieft:
* Einheiten, die Aktionspunkte übrig haben, können über die Taste `[O]` oder den Button `[ 🎯 Wache & Reaktionsfeuer ]` Wachposten beziehen.
* **Defensiver Bonus:** Einheiten in Wachstellung erhalten bei gegnerischen Angriffen einen **+15 % Ausweich-/Deckungsbonus** (`if (target.overwatch) hit -= 15;`).
* Sobald ein Gegner in Waffenreichweite und Sichtlinie (LOS) agiert, entlädt sich das Reaktionsfeuer automatisch.

---

## 5. Autobattler & Auto-Resolve (Specs aus DESIGN-HEX-AUTOBATTLE.md)

Aus den Entwurfsspezifikationen wurden zwei zusammengehörige Komfort-Features umgesetzt:

### 🤖 1. Im Gefecht: Der In-Combat Auto-Battler
* Über den Button `[ 🤖 Auto-Kampf ]` im Action-Panel (`#combat-ui`) kann der Rundenzug vollständig an die KI übergeben werden.
* `runAutoBattleTurn()` steuert das SG-Team autonom:
  1. Verwundete Teammitglieder heilen, falls Medkit vorhanden und HP < 65 %.
  2. Gegner in Reichweite und Sichtlinie nach Priorität (geringste Rest-HP) beschießen.
  3. Zum nächsten Gegner heranrücken (bevorzugt Deckungsfelder).
  4. Bei verbleibenden AP Wachstellung / Reaktionsfeuer beziehen.
* Der Spieler kann jederzeit zuschauen oder mit einem Klick wieder auf manuelle Kontrolle umschalten.

### ⚡ 2. Im Missionsbriefing: Auto-Resolve (Schnellkampf mit Prognose)
* In der Sternenkarte wird neben dem Start-Button eine Erfolgs-Vorschau berechnet:
  - Formel: Squad-Kampfkraft (Schaden, Max-HP, Level, Restgesundheit) im Verhältnis zur Feindstärke.
  - Anzeige: z. B. `⚡ Schnellkampf (78%)` mit farblicher Risikoeinstufung (*Verletzungsrisiko: niedrig / mittel / hoch*).
* **Game-Design-Balance:** Zur Belohnung des manuellen Spielens bringt der Schnellkampf **-25 % Beute und XP**, plus einen automatischen Verwundungswurf auf die Truppe.
* **Story-/Boss-Sperre:** Wichtige Story- und Goa'uld-Bosskämpfe bleiben für Auto-Resolve gesperrt (*„Story- und Bossmissionen erfordern manuelle Einsatzleitung“*).

---

## 6. Test-Verifikation

* **Test Section 36** in `test-browser.js` hinzugefügt.
* 548 i18n-Schlüssel in Deutsch und Englisch mit 100 % Parität.
* Alle **250+ automatisierten Prüfungen** (Gateroom-Maße, Klick-Trigger, Autobattler-Züge, Prognose-Berechnung, Ausweich-Bonus) laufen lokal in unter 1 Sekunde mit **0 Fehlern** durch.

