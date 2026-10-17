# Captain's Log 016 – Alltag im Berg

Der Startablauf und die Basisansicht wurden anhand des aktuellen lokalen Builds noch einmal überprüft.

## Intro und Start

Der Startfehler betraf bestehende v4-Spielstände: Bei ihrer Migration wurde ein noch nicht gespeicherter Intro-Status als bereits gesehen gesetzt. Solche Spielstände überspringen das Intro nun nicht mehr; nach dem einmaligen Abspielen wird der Status gespeichert. Das Intro kann außerdem jederzeit im Pausemenü wiederholt werden.

`game/index.html` funktioniert direkt als lokale Datei. Ein lokaler Webserver ist optional und vor allem bei Browsern sinnvoll, die Dateizugriff oder `localStorage` einschränken.

## SGC-Basis

- Der Aufzug bleibt jetzt zwischen Fahrten auf einer Ebene stehen, statt fortlaufend im Schacht auf und ab zu pendeln.
- In größeren Abständen erscheint ein kleines Teammitglied, läuft zur Kabine, fährt mit und verlässt sie wieder auf einer anderen Ebene.
- Die freie Fläche und die Gebäudebeschriftung sind klarer gegliedert; Ebenen sind als L01–L28 markiert.
- Ein „Mountain Network“-Nachrichtenpanel bringt den gewünschten trockenen SGC-Alltagston in die Basisansicht.

Als räumliche Referenz diente die [Cheyenne-Mountain-Übersicht auf rdanderson.com](https://www.rdanderson.com/stargate/cheyenne/index.htm), insbesondere die Darstellung des Komplexes über mehrere Ebenen. Die Seite wird als Inspiration verlinkt; ihre Abbildungen und Texte wurden nicht übernommen.
