# SPEC: Basis & Kolonien – Bauten und Verteidigungsmissionen (à la XCOM-Basisverteidigung)

## Prüfen (vor neuen Features)
- Kolonie-Quadratraster bleibt. Testfälle: bauen, abreißen, Kosten, Speichern/Laden (`S.colonies`), belegte Felder.

## Verteidigungsmissionen
Generator `genDefenseMission(colonyId)`: liest die gebauten Objekte und erzeugt daraus die Kampfkarte.
| Gebäude | Wirkung im Kampf |
|---|---|
| Barrikade/Mauer | Deckungsfeld an gleicher Position |
| Geschützturm | Verbündete KI-Einheit (stationär) |
| Naquadah-Reaktor | Zielobjekt (verteidigen) – Explosion bei Zerstörung |
| Kaserne | +1 Verteidiger-Einheit |
| Schildgenerator | Gegner starten weiter entfernt |
Auslöser: Bedrohungswert der Kolonie (Wohlstand + Nähe zu feindlichen Planeten), Vorwarnung 1–2 Tage.
Niederlage = Gebäude beschädigt, nicht Spielende. Auto-Resolve erlaubt (siehe DESIGN-HEX-AUTOBATTLE.md).
