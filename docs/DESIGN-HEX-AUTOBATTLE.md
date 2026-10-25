# Design: Hex-Kampf & Auto-Resolve (Entwurf v0.32)

## Genre-Befund (Recherche)
- 4X/Taktik-Hybride (Master of Magic 2022, Age of Wonders) bieten **Auto-Resolve mit Erfolgs-Vorschau** vor der Entscheidung.
- Spieler wünschen sich **Belohnung fürs Selberspielen** (mehr XP/Beute), sonst wird Auto-Resolve zur Pflicht.
- Wiederholte Kämpfe ermüden → Auto-Resolve ist Komfort für Routine-Missionen, nicht für Story-/Bosskämpfe.

## Vorschlag SGC
1. **Auto-Resolve-Button** im Missionsbriefing mit Prognose („72 % Sieg, Verletzungsrisiko: mittel“).
2. Ergebnis bewusst etwas schlechter: −25 % Beute/XP, +1 Verletzungswurf. Story-/Bossmissionen: gesperrt.
3. Echter Autobattler (Einheiten kämpfen sichtbar selbst, Spieler stellt nur Formation) = optionaler Modus später; Formationen auf dem Hexfeld setzen, KI nutzt vorhandene Gegner-KI.
4. Hex-Umstellung in Stufen: `hex.js` (fertig) → Renderer in `iso.js` → Bewegung/Deckung (Deckung = Nachbarfeld mit Hindernis in Schussrichtung via `HEX.line`).
