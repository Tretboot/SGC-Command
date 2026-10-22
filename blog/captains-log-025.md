# Captain's Log 025 – Stargate-Kanon & Stabilisierungs-Pass

**Release:** SGC Command v0.25  
**Datum:** 22. Oktober 2026  
**Autorenschaft:** Claude Opus 5.5 Medium

---

## 1. Lagebericht & Problembehebung

Während der Spieltestläufe von aufeinanderfolgenden Missionen (Mission 1-1, 1-2, 1-3) wurden zwei kritische Probleme, ein Steuerungs-Hänger und ein massives Balancing-Defizit gemeldet:

### A. Schwarzer Bildschirm bei Missionsübergang (Mission 2 & 3)
* **Fehlerursache 1:** `#gate-overlay` (`z-index: 15; background: #000; position: fixed`) wurde beim Überspringen (`skipGate()`) oder vorzeitigen Klicks nicht bedingungslos ausgeblendet, falls die Animationsphase bereits gewechselt hatte oder der Callback noch nicht feuerte.
* **Fehlerursache 2:** In `startCombat()` war für friedliche Erstkontakt-Aufträge (Mission 1-2 Abydos) eine harte Exception (`throw new Error(...)`) hinterlegt, falls die Zielkoordinaten der Siedlungssprecher kollidierten oder außerhalb der Pfade lagen. Beim Werfen dieser Exception blieb `#combat-overlay` als komplett schwarzer Vollbild-Kasten im Vordergrund stehen, ohne dass der Kampf jemals initialisiert wurde – der Spieler war in einem unklickbaren schwarzen Bildschirm gefangen.
* **Fehlerursache 3:** In der Hauptanimationsschleife `frame(now)` führte jeder unerwartete Renderfehler zum dauerhaften Abbruch von `requestAnimationFrame()`, wodurch das Spiel einfror.
* **Lösung:**
  - `skipGate()` und `gateTick()` blenden `#gate-overlay` nun garantiert und bedingungslos aus.
  - Der Spawn von Zivilisten und Kontakten sucht bei ungültigen Startkoordinaten nun automatisch in einem spiralförmigen Radius nach dem nächsten begehbaren Feld und stürzt niemals mit einer Exception ab.
  - Die `activateMission()`-Fehlerbehandlung schließt bei Fehlern alle Overlays, setzt den Zustand sauber auf `idle` zurück und informiert den Kommandanten per Toast-Meldung.
  - `frame(now)` ist durch einen `try/catch`-Sicherheitsblock geschützt, sodass die Frame-Schleife immer weiterläuft.

### B. „Tag Beenden“ (`#go`) blockiert
* **Fehlerursache:** Der Button `#go` war durch unbereinigte `C.active`- oder `GR.phase`-Zustände nach Gefechten permanent deaktiviert (`disabled = true`), oder das schwarze Combat-Overlay verdeckte den Header physisch.
* **Lösung:**
  - Saubere State-Bereinigung in `combatEnd()` und `showReport()`.
  - Tooltip auf `#go` zeigt den aktuellen Bereitschaftsstatus transparent an.

### C. Performance & Memory-Leak in Kolonien
* In der 60-FPS-Schleife `frame(now)` wurde bisher fälschlicherweise `renderColoniesView()` aufgerufen, was bei jedem Frame das komplette DOM des Kolonie-Sidebars per `innerHTML` neu erzeugte. Dies führte zu enormem Layout-Thrashing und Müllbergen im Speicher.
* **Lösung:** Im Frame-Loop wird nur noch das reine Canvas-Rendering `renderColonyCanvas()` aufgerufen.

### D. Gefechts-Steuerung & Rundenabschluss (0 AP & Runden-Ende)
* **Problem:** Sobald Einheiten ihre AP aufgebraucht hatten oder nach einem Angriff, war das Auswählen von Einheiten mit 0 AP gesperrt. Klicks auf leere Felder deselektierten die Figur, und ohne sichtbaren Button zum Beenden des Zuges konnte sich der Spieler "stuck" fühlen.
* **Lösung:**
  - `playerSelect(unit)` erlaubt nun auch das Anklicken und Inspizieren von Einheiten mit 0 AP (Profil, HP, Waffe und Ausrüstung bleiben sichtbar).
  - Ein prominenter Button **`⏭ Runde beenden [Enter]`** ist während der Spielerphase im unteren Aktionspanel stets präsent.
  - Tastatur-Shortcut: Drücken von `Enter` beendet den Spielerzug sofort und leitet die Jaffa-Phase ein.

### E. Tagesabschluss: SGC-Outro-Theme, Statistiken & Geschichten
* **Feature:** Beim Klick auf „Tag beenden“ (`doDay()`) erklingt automatisch das epische Stargate-Outro-Thema (`theme_outro`).
* **SGC-Tagesbericht:** Das Abschlussfenster präsentiert nun eine umfassende Statistik-Übersicht (Missionen, besiegte Jaffa/Goa'uld, entdeckte Welten, Personal, Kolonien) zusammen mit authentischen SGC-Logbuch-Einträgen und Begebenheiten aus dem Stargate-Universum.

---

## 2. Großes Wirtschafts- & Basisbau-Balancing

Bisher startete der Kommandant mit lediglich 100 Erz und 20 Tech, während der günstigste Raum (Lager) bereits 250 Erz kostete. Ein Bau war an Tag 1 unmöglich.

* **Startressourcen:** Angehoben auf `800 Erz`, `140 Tech`, `50 Medizin`, `80 Nahrung` (und 100 SGC-Integrität).
* **Raumkosten angepasst:**
  - Generator: von 300 auf 220 Erz
  - Kaserne: von 300 auf 220 Erz
  - Lager: von 250 auf 180 Erz
  - Kantine: von 400 auf 250 Erz
  - Wasserwerk: von 350 Erz / 30 Tech auf 260 Erz / 20 Tech
  - Werkstatt: von 400 Erz / 60 Tech auf 300 Erz / 30 Tech
  - Labor: von 500 Erz / 50 Tech auf 350 Erz / 30 Tech
  - MedBay: von 600 Erz / 40 Tech auf 380 Erz / 25 Tech
  - Armory: von 700 Erz / 100 Tech auf 450 Erz / 50 Tech
  - Training: von 800 Erz / 80 Tech auf 500 Erz / 50 Tech
* **Missionsbelohnungen Kapitel 1:** Verdoppelt bis verdreifacht (50–80 Erz, 15–30 Tech pro Mission).
* **Tägliche Basis-Versorgung:** Erhöht auf `+50 Erz, +15 Tech, +10 Medizin, +15 Nahrung` pro Tag.
* **Alte Spielstände:** In `load()` erhalten bestehende Spielstände mit geringen Ressourcen automatisch einen Basis-Aufbau-Zuschuss, um ohne Neustart direkt bauen zu können.

---

## 3. Erweiterung der SG-1 Kanon-Planeten

Die Planetendatenbank in `PLANETS` wurde massiv um kanonische Welten aus Stargate SG-1 erweitert, jeweils mit Koordinaten, Kapitel-Freischaltung, Tor-Adressen und Lore:
- **Cimmeria (P3X-974):** Thors Hammer & Asgard-Schutzwelt
- **P4X-639:** Antiker-Zeitschleifenstation („Kein Ende in Sicht“)
- **Tollana (P4X-377):** Ionenkanonen & Phasenverschiebung der Tollaner
- **Vorash:** Tok'ra-Wüstenhauptquartier mit Kristalltunneln
- **Langara (P3S-452):** Jonas Quinns Heimatwelt, reich an Naquadria
- **Hadante:** Unterirdische Gefängniswelt ohne DHD (Linea)
- **P3X-888:** Ursprungswelt der Goa'uld-Symbionten und Unas
- **Delmak:** Sokars Totenwelt und spätere Ba'al-Festung
- **Tartarus:** Anubis' Kull-Krieger-Labore mit Sensorfeld
- **Kheb (P9C-882):** Mythischer Tempel von Oma Desala und der Aufstieg
- **Othala (Ida-Galaxie):** Heimatwelt der Asgard und Flottenwerft von Thor
- **Dakara:** Heilige Wiege der Jaffa-Kultur und Antiker-Superwaffe
- **Camelot (PX1-591):** Merlins Bibliothek, das Sangreal und Artus-Mythen
- **Proclarush Taonas:** Lavawelt mit Antiker-Kuppel und ZPM-Kammer

---

## 4. Testsuite & Floppy-Budget

* **Automatisierte Browser- & Engine-Tests:** Alle 159 Unittests in `test-browser.js` sind grün (0 Fehler).
* **Release-Archiv:** `release/SGC-Command-v025.zip` erzeugt (603 KB / 41,5% der 1,44 MB Floppy-Disk-Grenze). Alle früheren Versionen (`v0.1.0-rc.1`, `v022`, `v024`) bleiben unverändert im `release/`-Ordner gesichert.
