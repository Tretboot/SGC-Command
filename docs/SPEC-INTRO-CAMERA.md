# SPEC: Intro-Kamera (Gate-Vorbeiflug)
Das Intro (`cinematic.js`) bleibt im Stil. Erweiterung: Kamerapfad aus Keyframes
`{t, x, y, zoom, rot}` mit Ease-in-out-Interpolation (z. B. smoothstep).
Sequenz-Vorschlag: Totale → Schwenk über den Ring → Zoom auf ein Chevron (Details: Glyphen, Gravur) →
Kawoosh von nah → Rückzug zur Totale. Rendering bei Zoom > 2 in höherer Detailstufe (mehr Glyphen-Linien),
damit kein Pixelbrei entsteht. ESC/Klick überspringt weiterhin.
