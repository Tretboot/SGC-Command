# SPEC: UI-Overhaul „Military Terminal 90s“ (Stil A, Nutzerentscheid)
Referenzgefühl: Ende-90er-SciFi-Interfaces – Phosphorgrün/Amber, Wireframe-Grafiken, Eckmarken,
Scanlines, Tippgeräusche, eingeblendete Datenzeilen.

## Stand v0.33
`theme-90s.css` (additiv), Titelbild + UI-Sounds (`title-screen.js`), Fenster-Manager (`window-manager.js`).

## Nächste Schritte (in dieser Reihenfolge)
1. **Design-Tokens** vereinheitlichen: alle Farben in `style.css` durch `var(--t-*)` ersetzen.
2. **Layout**: Hauptbildschirm als CSS-Grid (Topbar | Seitenleiste | Spielfläche | Log), `clamp()` für Schriftgrößen,
   Breakpoints 700/1100/1600 px. Nichts mit festen px-Breiten > 100vw.
3. **Alle Modals → WM-Fenster** (verschiebbar, skalierbar), Strudel/Winamp zuerst. Modal-Inhalt bleibt, nur Hülle wechselt.
4. **Wireframe-Grafiken**: rotierendes Gate/Planet als Canvas-Linien (Vektor-Look) im Briefing und auf der Sternenkarte.
5. **Menü-Effekte**: Texte „tippen“ sich ein (30 ms/Zeichen), Bootsequenz-Zeilen beim Öffnen von Panels, Sounds aus `title-screen.js`.
6. **Barrierefreiheit**: `prefers-reduced-motion` schaltet Scanline-Flackern/Blinken ab; Kontrast ≥ 4.5:1.
Abnahme: Screenshots 1280×720, 1920×1080, 390×844 (Handy) ohne abgeschnittene Elemente.
