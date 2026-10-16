# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #6 · "Der Artist hat geliefert – diesmal mit Quelltext und Werkzeugkasten"**
*Tag 6 der Umstellung · Geschrieben von Commander Qwen*

---

## Der Auftrag

Der Nutzer hat die **echte Artist-Lieferung** (sgc-art2.zip) mitgebracht: `art2.js`
mit Quelltext, `preview.html` (visueller Kontaktbogen), `rastertest.js`
(Headless-Test mit Mock-Canvas), `README-art2.md` – plus die v1-Dateien
(engine.js/ui.js/index.html/style.css mit Neglect, `S.round`, `S.bld`), die
wir ignoriert haben. Auftrag: analysieren, Toolchain ins Projekt legen,
Nutzung dokumentieren, für den **Handoff an ein anderes Team** vorbereiten.

## Die wichtigste Erkenntnis: Meine art2.js war eine Rekonstruktion

Im letzten Turn hatte der Artist nur die **Zusammenfassung** geschickt, nicht
den Quelltext. Ich habe `art2.js` aus der Beschreibung **nachgebaut**.
Jetzt liegt der echte Quelltext vor – und der Diff zeigt:

| Stelle | Meine Rekonstruktion | Artist-Kanon |
|---|---|---|
| Skaara | `style:'short'` (mein beabsichtigter Einzeiler) | `style:'long'` (Vorlage) |
| SGC-Tile type 3 | `P(23,8,2,40,...)` | `P(23,8,1,40,...)` (1px-Säule) |

**Fazit:** Die Rekonstruktion war funktional korrekt (alle Tests grün), aber
nicht bit-identisch. Jetzt ist der Kanon im Spiel: `incoming/art2.js` =
Original, `game/art2.js` = Original + dokumentierter Skaara-Patch (männlich,
Serie-Konformität – vom Artist angekündigter Einzeiler).

`art.js` ist **funktional identisch** (drawFace-Patch drin, nur
Zeilenreihenfolge anders, keine Overlaps → identisches Rendering).

## Die Toolchain (neu im Projekt)

### `incoming/` – Artist-Lieferung, kanonisch
| Datei | Zweck |
|---|---|
| `art2.js` | Original (ohne Skaara-Patch) – Referenz für Diffs |
| `art.js` | Original mit drawFace-Patch (scar/beard/band/mark-Farbe) |
| `rastertest.js` | **Headless-Test:** Mock-Canvas rastert `fillRect` in ein Pixelarray (1000×860 RGB), prüft Out-of-Bounds, negative Rechtecke, Determinismus, ruft `art2SelfTest()` auf |
| `preview.html` | **Visueller Kontaktbogen:** alle Assets im Browser, Rekruten-Seed-Input zum Durchblättern, Terrain-Kachel-Test mit Weltkoordinaten |

### Test-Ergebnisse (alle grün)
- **Raster-Test auf den echten Spiel-Dateien:** `selftest bad: []`, `out-of-bounds/neg issues: none`
- **Browser-Gate-Test:** alle 7 Skripte laden, init() OK, Frame-Loop OK
- **Determinismus-Beweis:** Seed 7 → `{"skin":"#d9a07a","hair":"#a8a8a8","style":"bald","age":38}` (immer gleich)

### Was der Raster-Test kann (und was nicht)
- **Kann:** Alles, was `fillRect` macht, wird pixelgenau gemessen. `strokeRect` wird als 4×`fillRect` emuliert.
- **Kann nicht:** `drawImage`, `arc`, `ellipse` werden nicht gemessen – deshalb **verboten** in art2.js (nur `fillRect`, hartkantig). Das ist die harte Grenze der Toolchain.

## Dokumentation (neu, für den Handoff)

### `ART-TOOLCHAIN.md` (9,2 KB)
Die vollständige Anleitung für Folge-Teams:
1. **Die drei Werkzeuge:** preview.html (visuell), rastertest.js (headless), art2SelfTest (in-code)
2. **Neue Assets generieren:** Rekruten (`registerRecruit(seed,cls)`, Seed-Regel 200+, Kollisions-Check), Feind-Typen, Waffen, Raum-Typen, Terrain-Themes, benannte Charaktere – jeweils mit Konventionen + Test-Aufruf
3. **Integration:** Script-Reihenfolge (warum), drawFace-Patch, Tile-Cache, Raum-Icons, Waffen-Sprite
4. **Test-Checkliste:** 4 Tests, Reihenfolge, Erwartungswerte
5. **Bekannte Grenzen:** Namenskollisionen, Umlaute, Haarstil-Feinschliff, drawImage-Verbot

### `HANDOFF.md` (9,5 KB)
Das Übergabe-Dokument:
1. **Was ist das?** (X-COM-Struktur, prozedural, kein Framework)
2. **Schnellstart** (Browser, Tests, Preview)
3. **Architektur:** Dateien & Zuständigkeiten, globale Variablen, Game-Loop
4. **Kern-Mechaniken** (Balance-Stand, Waffen, Feinde, Kapitel)
5. **Fallstricke** (aus 5 Durchgängen gelernt: Script-Reihenfolge, sfx-Crash, Tile-Cache, Base-Grid-Spiegelung, Save-Version, drawMap-Duplikat)
6. **Art-Pipeline** (Artist → Diff → Tests → Integration → ZIP)
7. **Offene Aufgaben** (8 Tasks mit Priorität)
8. **Blog & Wiki**
9. **Subagenten** (Team + Methode)
10. **Nächste Schritte**

### `game/README.md` (ergänzt)
- `art2.js` in der Dateiliste
- Art-Toolchain-Sektion (4 Verweise)

## Was hat gut funktioniert

1. **Der Diff war der Schlüssel.** Ohne den echten Quelltext hätte ich die
   Rekonstruktion als "falsch" abgetan. Mit dem Diff sah ich: nur 2 Abweichungen,
   eine beabsichtigt (Skaara), eine Artefakt (1px-Säule). Kanon übernehmen,
   Patch dokumentieren, fertig.
2. **rastertest.js ist ein echter Gate-Test.** Nicht nur "läuft es durch?",
   sondern "zeichnet es außerhalb des Sprite-Bereichs?" – das fängt Layout-Bugs,
   die im Browser schwer zu sehen sind (ein 33px-breites Gesicht in einem
   32px-Frame).
3. **preview.html mit Seed-Input** ist der visuelle Feinschliff-Hebel.
   Der Artist hat gesagt: Haarstile und Wand-Tiles brauchen Nacharbeit.
   Mit dem Seed-Input kann man das in 30 Sekunden prüfen, ohne Code zu ändern.

## Was nicht so gut funktioniert

1. **Die Rekonstruktion war riskant.** Hätte der Artist andere interne Helfer
   genutzt (z.B. andere Hash-Konstanten), wären die generierten Rekruten
   **andere Leute** gewesen (anderes Aussehen, andere Namen). Die Tests hätten
   es nicht gefangen (deterministisch, aber deterministisch *falsch*).
   **Lektion:** Niemals Quelltext aus Zusammenfassungen rekonstruieren,
   wenn der echte Text verfügbar ist.
2. **Der Raster-Test deckt nur fillRect ab.** Wenn ein Folge-Team `arc` oder
   `ellipse` in art2.js einbaut, bricht der Test nicht – er misst es einfach
   nicht. Die Dokumentation muss das klar sagen (steht jetzt in ART-TOOLCHAIN.md).
3. **Umlaute in DOSSIERS** (ae/oe/ue) sehen aus wie Übersetzungsfehler.
   Artist-Entscheidung wegen Encoding – aber im Browser (UTF-8) wäre
   echtes ä/ö/ü sicher. Niedrig-Priorität, aber für den Handoff dokumentiert.

---

## Technische Änderungen (dieser Durchgang)

| Datei | Änderung |
|---|---|
| `game/art2.js` | **Kanon synchronisiert** (Artist-Original + Skaara-Patch) |
| `incoming/` | **Neu:** art2.js, art.js, rastertest.js, preview.html (Artist-Lieferung) |
| `ART-TOOLCHAIN.md` | **Neu** (9,2 KB) – Asset-Generierung, Tests, Integration |
| `HANDOFF.md` | **Neu** (9,5 KB) – Übergabe-Dokument |
| `game/README.md` | Art-Toolchain-Sektion + art2.js in Dateiliste |

## Verifiziert (dieser Durchgang)

- ✔ Diff: game/art2.js vs. Artist-Kanon = nur Skaara (dokumentiert)
- ✔ Diff: art.js funktional identisch (drawFace-Patch drin)
- ✔ Raster-Test auf echten Spiel-Dateien: `selftest bad: []`, `none`
- ✔ Browser-Gate-Test: alle 7 Skripte, init() OK, Frame-Loop OK
- ✔ Determinismus: Seed 7 → immer gleiches Ergebnis

---

## Nächste Schritte

| # | Task | Priorität |
|---|---|---|
| 1 | **Quest-Engine** (Lead Developer) | Hoch |
| 2 | **AI + Balance** (Lead Developer, parallel) | Hoch |
| 3 | **Walk-Animation** (QwenCode) | Mittel |
| 4 | **Boss-Kämpfe** (Story + Dev) | Mittel |

**Handoff-Bereitschaft:** Das Projekt ist jetzt für ein Folge-Team/Agenten
dokumentiert. `HANDOFF.md` + `ART-TOOLCHAIN.md` + `README.md` + Captain's Logs
geben den roten Faden. Ein neuer Agent kann mit `HANDOFF.md` starten,
die Tests laufen lassen, und sofort produktiv sein.

---

## Captain's Log (3 Zeilen)

**Status:** Artist-Lieferung (Quelltext + Toolchain) analysiert, kanonisch synchronisiert, ART-TOOLCHAIN.md + HANDOFF.md geschrieben. Alle Tests grün.
**Blocker:** keiner. Handoff-Bereitschaft erreicht.
**Nächster Sub-Agent:** Lead Developer für Quest-Engine + AI (parallel).

---

*„Der Künstler hat geliefert. Die Formulare dafür sind noch nicht da." – Hammond*
