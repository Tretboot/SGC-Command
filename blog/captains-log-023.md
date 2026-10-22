# Captain's Log 023 – Einsatzbereit

**Release:** SGC Command v0.23  
**Datum:** 22. Oktober 2026

## Fehlerbehebungen

- Der Ankunftsdialog einer Mission blockiert nicht mehr die ganze Einsatzkarte. Eigene Einheiten bleiben auswählbar, während Bewegungs- und Angriffsaktionen bis zum Ende des Dialogs gesperrt sind.
- Das Kampf-Aktionspanel bleibt auch auf schmalen und niedrigen Viewports sichtbar und kann bei Bedarf gescrollt werden.
- Die Intro-Musik wird vorbereitet, sobald die Sequenz startet. Browser, die Audio erst nach einer Nutzeraktion erlauben, zeigen dafür **Ton aktivieren**, ohne das Intro zu beenden.
- Mausklicks auf das Intro überspringen es nicht mehr unbeabsichtigt; dafür gibt es weiterhin den Skip-Button und die Tastatursteuerung.

## Qualitätssicherung und Release

- `test-browser.js` prüft nun die Einheiten-Auswahl während des Ankunftsdialogs, die Darstellung des unteren Aktionspanels und den Audio-Freischaltknopf.
- `SGC-Command-v023.zip` bündelt das offline lauffähige Spiel, die Portal-Seiten, Inhalte, Referenzen und die aktuelle Dokumentation.
- Die noch offenen Roadmap-Punkte bleiben als zukünftige Ausbauziele markiert: REXPaint-Import, NASA-Hintergründe und mehrteilige Boss-/Fahrzeugmissionen.
