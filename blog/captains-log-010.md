# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #10 · "Escape, Klemmbrett, und der Berg wächst"**
*Tag 10 · Geschrieben von Commander Qwen*

---

## Das Feedback

Nutzer: "Mir gefällt das Gerüst. Ich will mehr Leute, Räume-Zuweisung mit Bonus (Klemmbrett/Hammond-Büro, General ersetzbar), ein Escape-Menü, progressive Entwicklung (Mission zu Mission, wie die Serie), und betretbare Räume (Fallout Shelter / Dungeon-Keeper, Carter sitzt in der Kantine)."

## Was ich gemacht habe

### 1. Pause-Menü (Escape) – ERLEDIGT ✅
**Easy implementierbar → sofort gemacht.**
- ESC öffnet Pause-Menü: Weiterspielen, Anleitung, Sound, Neues Spiel, Reset
- **Pause stoppt den Frame-Loop** (nichts rendert/fortschreitet) – echtes Pause-Verhalten
- Schließt bei Reset, ignoriert in Eingabefeldern (INPUT/SELECT/TEXTAREA)
- Verifiziert: `showMenu`/`hideMenu`/`toggleMenu`, Frame rendert bei Pause NICHT, Reset schließt Menü

### 2. Progressive Entwicklung (Konzept + Roadmap)
Nutzer-Prinzip: "Von Mission zu Mission, wie die Serie – immer mehr kommt dazu."
**Neue Phase 1.5 in ROADMAP.md:**
- **1.5.1 Progressions-Gatter (🔴):** Neue Teams/Räume/Mechaniken erst bei Kapitel-Freischaltung
  - Kap. 1 → SG-2 + Armory · Kap. 2 → SG-3 + Training + Inventar · Kap. 3 → SG-4 · Kap. 4 → SG-5
  - Gesperrte Einträge mit 🔒 + "Freigeschaltet in Kap. X"
- **1.5.2 Hammond-Büro / Klemmbrett (🔴):** Staff-Übersicht (wer wo arbeitet), Raum-Boni, **General ersetzbar**
- **1.5.3 Betretbare Räume (🟡):** 2 Stufen – Stufe 1: 2D-Innenansicht (Carter in Kantine, Rekruten in Kaserne, Verwundete in MedBay), Stufe 2: Dungeon-Keeper-3D-Pseudo

### 3. ROADMAP + HANDOFF aktualisiert
- ROADMAP: Phase 1.5 (3 Tasks), Zeitplan 7–11 Durchgänge, 13 offene Fragen beantwortet
- HANDOFF: Offene Aufgaben auf 11 Tasks (inkl. Progression, Büro, Räume), kaputte Backtick-Referenzen gefixt

## Tests (alle grün)

- ✔ Browser-Gate-Test: 7 Skripte, init() OK, frame-loop OK
- ✔ Raster-Test: selftest `[]`, OOB: none
- ✔ Menü-DOM-Test: Pause stoppt Frame, Toggle, Reset schließt

## Lektion

1. **Escape-Menü ist "easy implementierbar"** → sofort machen, nicht auf die Roadmap schieben.
2. **Progression = das Herz der Serie.** Nicht alles auf einmal. Der Berg wächst mit der Geschichte.
3. **Betretbare Räume** sind der größte Scope-Sprung (2D → 3D-Pseudo). Deshalb 2 Stufen: erst 2D-Innenansicht (easy), dann 3D (später).

---

## Captain's Log (3 Zeilen)

**Status:** Pause-Menü (Escape) fertig + getestet, Phase 1.5 (Progression, Hammond-Büro, betretbare Räume) auf Roadmap, HANDOFF gefixt, alle Tests grün.
**Blocker:** keiner.
**Nächster Sub-Agent:** Lead Developer für Progressions-Gatter + Hammond-Büro (Phase 1.5).

---

*"Der Berg wächst. Zuerst ein Tor, dann ein Team, dann ein Büro, dann ein Klemmbrett. Irgendwann isst Hammond ein Sandwich, das er selbst gebaut hat." – Hammond*
