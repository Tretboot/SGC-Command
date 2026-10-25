# Captain's Log 030 – „i18n-Fundament & Tag-Loop“

**Release:** SGC Command v0.30  
**Datum:** 25. Oktober 2026  
**Autorenschaft:** Qwen 3.5 122b A10B-FP8 (Uni-gehostet, virtUOS Kiwi)  
**Motto:** *„Ein Tor, viele Sprachen – Chevron 7 verriegelt international.“*

---

## 1. Lagebericht: Internationalisierung als Kernanforderung

Nach der Fertigstellung des Studien-Papers (v0.29) für die Universität Osnabrück stand der nächste fundamentale Schritt an: Die vollständige Beseitigung fest codierter deutscher Strings im Spiel- und Web-Portal. Das Ziel war ein skalierbares Übersetzungssystem (`i18n`), das Deutsch (DE) und Englisch (EN) nahtlos zur Laufzeit umschaltbar macht, ohne externe Bibliotheken oder Build-Tools zu benötigen.

---

## 2. Die Neuerungen in v0.30

### 🌐 1. Zweistufige i18n-Architektur
* `game/i18n.js`: Zentrale Sprachsteuerung, Sprachwechsel-Events (`I18N.onChange`), `localStorage`-Persistenz und Übersetzungs-Resolver `I18N.T()`.
* `game/i18n-game.js`: Übersetzungstabellen für Spielmenüs, Lazarett (Ebene 21), Basis, Einheiten und Stargate-Events.
* `game/i18n-portal.js`: Vollständige Übersetzung des Web-Portals (Datenbank, Lore, Labor).
* `game/i18n-languages.js`: Sprachmatrix mit Priorisierung für zukünftige Lokalisierungen (ES, ZH, JA, RU).
* HTML-Integration über `data-i18n`, `data-i18n-html` und `data-i18n-title`.

### 🔄 2. Endloser Tages-Loop & Stargate-Events
* Implementierung von `startNextDay()` für unbegrenzte Kampagnen-Fortschritte.
* Zufällige Stargate-Lore-Ereignisse (15 % Wahrscheinlichkeit pro Tag) bringen Leben in den Cheyenne Mountain Komplex.

### 🧹 3. Repository-Bereinigung
* Entfernung temporärer Dateien (~1,2 MB) und nicht mehr benötigter Roh-MIDI-Quellen.
* Vereinheitlichung der Projektstruktur.

---

## 3. Status

* **Test-Suite:** 209 automatisierte Prüfungen grün.
* **Erkenntnis:** Erste i18n-Version zeigte im Praxistest noch Ausfälle bei dynamischen String-Keys (z. B. `game.boot.btn`), was die Übergabe an Claude Opus 5.5 für eine Tiefenbereinigung einleitete.

