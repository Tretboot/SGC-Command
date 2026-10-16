# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #4 · "Der eine const, der das Spiel tötete"**
*Tag 4 der Umstellung · Geschrieben von Commander Qwen*

---

## Der Vorfall

Testfeedback des Nutzers: *„Jetzt startet das nur halb, ich sehe gar keine Basis, keines der Menüs öffnet sich. Da ist was kaputt."*

Klassisches Symptom: Seite lädt, Header ist leer, keine Tabs, nichts reagiert.

## Die Ursache

**`Identifier 'sfx' has already been declared`**

Beim letzten Durchgang habe ich in **zwei** Dateien denselben Helper deklariert:

```js
// combat.js (Zeile 11)
const sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};

// ui.js (Zeile 13) – DER BUG
const sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
```

Im Browser teilen sich alle `<script>`-Tags denselben globalen Scope. `combat.js` läuft zuerst, `ui.js` deklariert `sfx` ein zweites Mal → **SyntaxError beim Parsen** → `ui.js` wird komplett verworfen → `init()` existiert nicht → keine Tabs, kein Header, kein Frame-Loop. Das Spiel "startet halb", weil 5 von 6 Dateien geladen sind.

**Warum haben meine Smoke-Tests das nicht gefangen?** Die Tests haben `engine.js + art.js + combat.js + base.js` gebündelt – aber **nie `ui.js`**. Genau die Datei, die im Browser als Letztes lädt und dort den Crash auslöst.

## Der Fix

1. `sfx`-Deklaration aus `ui.js` entfernt (die aus `combat.js` bleibt)
2. **Kollisions-Scan** über alle 6 Dateien: `drawMap` ist in `art.js` UND `ui.js` – legal (Function-Redeclaration, die spätere gewinnt = die v2-Version), aber dokumentiert
3. **Browser-Simulation** (`test-browser.js`): simuliert jetzt den echten Start – alle 6 Skripte in Browser-Reihenfolge, `load`-Event, 5 Frame-Loop-Ticks, danach Prüfung ob `base-side`/`res`/`round` Inhalt haben

## Zweiter Bug (Beifang)

`endDay()` schrieb nur in `S.log`, aber der Tagesbericht liest aus `S.rlog` → "Ein ruhiger Tag im SGC" trotz Produktion. Fix: `endDay` push jetzt Produktions-, Passive- und Kapitel-Einträge in `S.rlog`.

## Lektion

> **Smoke-Tests müssen den Browser simulieren, nicht die Engine.**

Ein Test, der 4 von 6 Dateien lädt, kann einen Crash in der 6. nicht finden. Ab jetzt: `test-browser.js` ist der offizielle Gate-Test. Er lädt alle Skripte in `<script>`-Reihenfolge, feuert `load`, dreht den Frame-Loop und prüft die DOM-Ausgabe.

## Verifiziert (Browser-Simulation)

- ✔ Alle 6 Dateien laden ohne Fehler
- ✔ `init()` OK, Frame-Loop stabil (5 Ticks)
- ✔ Basis-Panel: 4,547 chars (Power-Budget, Bau, Räume, Forschung)
- ✔ Header: Ressourcen + Tag + Power-Budget
- ✔ Alle 4 Tabs rendern (basis/map/roster/log)
- ✔ Hilfe-Modal öffnet (1,936 chars)
- ✔ Tag beenden → rlog mit Produktionseinträgen
- ✔ Mission starten → Gate → Combat (10 Units)
- ✔ Combat-UI rendert (1,006 chars)
- ✔ Kompletter Kampf-Loop → Ergebnis → `applyCombatResult`

---

## Captain's Log (3 Zeilen)

**Status:** Crash fixt (doppelte `sfx`-Deklaration), Browser-Simulation als Gate-Test etabliert, rlog-Beifang fixt. ZIP neu gebaut (96 KB, inkl. ART-ANFORDERUNGEN.md).
**Blocker:** keiner. Warte auf Art-Lieferung (Claude) für `art2.js`.
**Nächster Sub-Agent:** Integration von `art2.js` (Rekruten-Generator, Feind-Gesichter, Waffen, Icons, Terrain) + POOL-Erweiterung auf 39 Chars.

---

*„Ein const. Ein einziges const. Und das SGC steht still." – Hammond*
