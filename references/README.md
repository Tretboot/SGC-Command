# 📚 Referenzen, Feedback & Inspiration (`references/`)

Dieser Ordner dient als schlanker **Eingangsordner (Inbox)** für zukünftiges Feedback, Inspirationen, Code-Schnipsel, Skizzen oder Referenznotizen des Nutzers.

Große Roh-Audiodateien (WAVs) und temporäre PNG-Dateien wurden entfernt, um das Repository minimal und schlank zu halten. Alle Synthesizer-Klänge und Samples werden prozedural und gemeinfrei erzeugt.

---

## 📂 Struktur
- [`LICENSE-AUDIT.md`](LICENSE-AUDIT.md) — Detaillierte Lizenzprüfung (AGPLv3, MIT-Kompatibilität, Switch Angel Credits, Obelisk & asciiid).
- *(Hier können in Zukunft neue Inspirationen, Code-Beispiele oder Feedback-Dateien abgelegt werden.)*

---

## 🎮 Design-Referenzen für die Überarbeitung

### 1. Taktisches Spielfeld & Weltskalierung
- **Syndicate (1993) / Syndicate Wars:** Isometrische Straßenblöcke, mehrstöckige Gebäude mit Tiefe, Agenten-Squad bewegt sich zwischen Häuserschluchten, Fahrzeugen und Zivilisten.
- **X-COM: UFO Defense (1994) & Jagged Alliance 2 (1999):** Rundenbasierte Aktionspunkte (AP), Höhenstufen (Voxel-Elevation `z=0..5`), Richtungs-Deckung, zerstörbare Umgebung, Söldner-Persönlichkeiten + Dossiers + Inventar-Slots.
- **Command & Conquer (1995) & SimCity 2000 (1993):** Isometrischer Offworld-Basenbau (Naquadah-Reaktor, Geschütztürme, Kommando-Bunker, Sandsack-Barrikaden, Straßennetz, Energie-Grid) und Skalierbarkeit von kleinen Außenposten bis zu kompletten Kolonie-Städten.

### 2. Isometrische Voxel- & ASCII-Dual-Pipeline (`game/iso.js`)
Unser neuer Renderer in [`game/iso.js`](../game/iso.js) vereint beide Welten auf demselben 3D-Höhenfeld (`x, y, z`):
1. **Pixel-Voxel-Modus (`S.gfxMode = 'pixel'`):**
   - Klassische `2:1`-Pixel-Isometrie (`ISO_W=64`, `ISO_H=32`, `ISO_Z=14` Pixel pro Höhenstufe) nach dem Vorbild von `obelisk.js`, *SimCity 2000* und *X-COM*.
   - Jede Kachel wird als 3D-Voxel-Säule mit Top-Diamond, linkem Halbschatten-Face (`shade -18`) und rechtem Schatten-Face (`shade -38`), Höhenlinien, Wasser-Reflexionen, mehrstöckigen Gebäuden und 3D-Stargate auf Stufenpodest gezeichnet.
   - 4-Wege-Kamerarotation (`Q` / `E` oder UI-Buttons `↶` / `↷` in 90°-Schritten) + Zoom + Minimap.
2. **ASCII-3D-Modus (`S.gfxMode = 'ascii'`, inspiriert von `Tretboot/asciiid` & `msokalski/asciicker`):**
   - Portiert die Kernideen aus `asciiid/render.cpp` nach JavaScript:
     - **CP437 / ANSI-Zellenpuffer (`AnsiCell: {fg, bg, gl, z}`)** mit 2×2-Subsampling-Logik.
     - **Höhenkanten- & Silhouetten-Erkennung:** Wenn `z_lo - z_hi > 0` (Klippe/Gebäudekante), werden automatisch Kontur-Glyphen (`─`, `_`, `│`, `/`, `\`) und schattierte Voxel-Wände (`█`, `▓`, `▒`, `░`, `▀`, `▄`, `▌`, `▐`) gesetzt.
     - **Dithering & Material-Shading:** Terrain-Oberflächen nutzen ` ..::%`, `~≈∽` (animiertes Wasser) und `#╬═║` (Architektur/Straßen).
     - **Multi-Cell ASCII-Sprites:** Einheiten (`@`/`☺` Kopf, `╬`/`█` Torso in Klassenfarbe, Waffe `/`, HP-Balken) und ein 3D-ASCII-Stargate mit pulsierendem Ereignishorizont (`≋≈*`).
   - **100% spielbar & jederzeit umschaltbar:** Da Maus-Picking (`screenToIso`) exakt dieselbe isometrische Projektionsmatrix nutzt, kann mitten im Zug im Pause-Menü (`ESC`), oben im Header (`🖥 PIXEL / ASCII`) oder per Taste **`V`** zwischen Pixel-Voxel und ASCII umgeschaltet werden!

