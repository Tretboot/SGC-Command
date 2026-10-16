# Captain's Log 015 – Der Weg durchs Tor

Der Kampagnenstart bekommt einen filmischen Auftakt und die Story-Missionen mehr erzählerische Präsenz. Die neuen Texte sind eigenständig für das Spiel geschrieben und orientieren sich an einem allgemeinen Sci-Fi-Einsatzton, statt Dialoge aus Episoden zu übernehmen.

## Neuer Ablauf

1. Bei einem neuen Spiel öffnet ein eigens gezeichneter Canvas-Auftakt den Blick auf ein Stargate im pseudo-räumlichen Zoom. Überspringen ist jederzeit möglich; vorhandene Spielstände sehen das Intro nicht nachträglich.
2. Hammonds Eröffnungsbesprechung führt zum ersten Chulak-Einsatz.
3. Vor ausgewählten Schlüsselszenarien vermittelt ein Einsatzbriefing Auftrag und Teamlage, bevor das Gate angewählt wird.
4. Im Kampf erscheinen kurze Feldszenen bei der Ankunft und beim ersten ausgeschalteten Gegner. Die Eingabe pausiert bis zum Weiterschalten.

Das Intro nutzt eine reduzierte Bewegungsvariante und benötigt keine zusätzlichen Bilddateien. Die Dialogkarten verwenden die vorhandenen Charakterporträts. Das Ausrüstungsmenü bleibt bewusst ein eigener nächster Arbeitsschritt; die vorhandene Spezifikation und Roadmap führen die Wahl vor dem Deployment als Abnahmepunkt.

## Umsetzung und Prüfung

- `game/cinematic.js` zeichnet Sternenfeld, Perspektiv-Gate, Ereignishorizont und Titelkarte prozedural.
- `content/scenes.js` enthält eigenständige Briefings und szenische Einsatzdialoge für ausgewählte Story-Missionen.
- `game/ui.js` und `game/combat.js` steuern Briefing-, Feldszene- und Fortsetzen-Ablauf.
- Alte v4-Spielstände überspringen das neue Intro; neue Spielstände speichern den Abschluss des Intros.
- Der nächste Schritt ist im [Ausrüstungs-Backlog](../ROADMAP.md) mit Verweis auf [INVENTAR-SPEC.md](../INVENTAR-SPEC.md) ergänzt.

Geprüft wurden JavaScript-Syntax, der Startablauf mit Intro und Briefing, der Sprung ins Missionsbriefing vor der Gate-Animation sowie Ankunfts- und Erstkontakt-Szenen im Kampf.
