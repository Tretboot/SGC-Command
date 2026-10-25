# Captain's Log 029 – „Studien-Revision (EN) & Final Release“

**Release:** SGC Command v0.29  
**Datum:** 25. Oktober 2026  
**Autorenschaft:** Qwen 3.8 27b (Uni-gehostet, virtUOS Kiwi / kiwi-secure)  
**Motto:** *„CogSci will's schriftlich – am besten auf Englisch.“ – Commander Qwen*

---

## 1. Lagebericht: Das Paper muss nach Osnabrück

Die wissenschaftliche Fallstudie `blog/uni-osnabrueck-ai-study.md` wurde für die Einreichung im Rahmen des Studiums (Kognitionswissenschaft / Informatik, Universität Osnabrück) final überarbeitet. Dafür waren drei Dinge zwingend: **das Paper auf Englisch**, **straffe, auf das Wesentliche beschränkte Danksagungen** und die **Korrektur von Faktenfehlern** in allen Projekt-Dokumenten.

---

## 2. Die Änderungen im Überblick

### 📄 1. Studien-Paper vollständig auf Englisch
* Übersetzung und Neuschreibung des gesamten Papers (Abstract, Architekturen, Phasen-Tabelle, Limitations, Conclusion).
* Neu eingeführter Abschnitt **6.1 (Limitation: Self-Reported Model Identity and Code Authorship)**: dokumentiert methodisch transparent, dass die Code-Authorship je Modell nur heuristisch zuordenbar ist – die Agenten verwechselten bei Token-Limit-Wechseln wiederholt ihre eigene Identität.

### ✍️ 2. Authorship-Korrektur
* `obelisk.js` wird in allen Dokumenten korrekt **Max Huang** (`nosir/obelisk.js`, MIT, 2013) zugeschrieben – die mathematische Referenz für die 2:1-Isometrie.

### 🙏 3. Danksagungen gestrafft
* Behalten: **virtUOS / Kiwi** (Universität Osnabrück – LLM-Zugang, u. a. Qwen 3.8 27b via kiwi-secure), **Switch Angel**, **Max Huang**, **Commander Qwen**.
* Entfernt: alle nicht zwingend erforderlichen Namen (die Drittanbieter-Lizenzen bleiben in `references/LICENSE-AUDIT.md` vollständig dokumentiert).

### ⚖️ 4. Lizenz-Abstimmung (AGPL-3.0-or-later)
* `references/LICENSE-AUDIT.md` durchgängig auf die faktisch geltende **AGPL-3.0-or-later**-Projektlizenz umgestellt (bisher teils „MIT“).
* README-Lizenz-Notiz korrigiert; der v029-Release-ZIP enthält nun die `LICENSE`-Datei.

### 🔢 5. Test- & Versionszahlen abgestimmt
* Test-Suite: **209 Prüfungen, 100 % grün, 0 Fehler** (bisher 74/81/88/122/194 – in den verschiedenen Dokumenten verstreut).
* Versionsstand **v0.29** in Portal, README, HANDOFF und ROADMAP vereinheitlicht.
* Modell-Tabelle im Web-Portal um **Schicht 4 (Claude Opus 5.5 Medium)** und **Schicht 5 (Qwen 3.8 27b, Uni-gehostet)** erweitert.

---

## 3. Verifikation & Floppy-Größe

* **Test-Suite:** 209 automatisierte Prüfungen laufen zu **100 % grün** in `test-browser.js` (0 Fehler).
* **Release:** `release/SGC-Command-v029.zip` (≈ 637 KB – weit unter der 1,44-MB-Floppy-Disk-Grenze).
* **SHA-256:** Prüfsumme liegt in der Begleitdatei `release/SGC-Command-v029.zip.sha256` (Download-Kopie des ZIPs liegt direkt im Projekt-Root als `SGC-Command-v029.zip`).
* **Inhalt:** Spiel, Portal (index/hub), Logs, Toolchain, Doku und `LICENSE` – vollständig offline lauffähig.

---

## 4. Fazit

v0.29 ist der finale Release der Studien-Phase: Das Paper steht auf Englisch, die Danksagungen sind auf das Wesentliche beschränkt, die Authorship ist korrekt zugeordnet, und alle Doku-Oberflächen stimmen in Test-Zahlen und Lizenz überein. Das Projekt bleibt dabei, was es von Anfang an war: Zero-Dependency, Open Source (AGPL-3.0-or-later) und zu 100 % lokal ausführbar.

---
*Log 029 – Ende. Der SGC-Komplex geht in den Standby-Modus, bis die Universität das Paper annimmt.*
