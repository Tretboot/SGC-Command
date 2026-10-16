# 🎨 ART-TOOLCHAIN – Nutzung & Dokumentation

**Stand:** Durchgang 5 · art2.js (Artist-Lieferung, kanonisch in `incoming/art2.js`)
**Zweck:** Dieses Dokument erklärt die Art-Toolchain, damit ein Folge-Team/Agent
neue Assets generieren, testen und integrieren kann, ohne den Artist zu fragen.

---

## 1. Die drei Werkzeuge

### 1.1 `preview.html` (Browser – Visuell)
**Wo:** `incoming/preview.html` (braucht `art.js` + `art2.js` im selben Ordner)
**Aufruf:** Im Browser öffnen (lokaler Server oder direkt).

**Was man sieht:**
| Sektion | Inhalt |
|---|---|
| Feind-Gesichter | Alle 7 Typen (jaffa…queen) |
| Waffen | 8 Typen, 32×16 + Icons 16×16 |
| Raum-Icons | Alle 11 Typen |
| Benannte Charaktere | Die 10 neuen LOOKS (Anubis…Thor) |
| Rekruten | 12 pro Seed-Reihe, **Seed-Eingabefeld** zum Durchblättern |
| Terrain | Kachel-Test 4 Themes × 6 Typen mit Weltkoordinaten (Nahtstellen prüfen!) |

**Wichtig:** Der Rekruten-Seed-Input zeigt, wie die generierten Gesichter bei
verschiedenen Seeds aussehen. Das ist der visuelle Feinschliff-Hebel:
Haarstil-Kombinationen und Wand-Tiles sind laut Artist die Stellen,
bei denen am ehesten Nacharbeit nötig ist.

### 1.2 `rastertest.js` (Node – Headless)
**Wo:** `incoming/rastertest.js`
**Aufruf:** `cd game && node ../incoming/rastertest.js`
(lädt `art.js` + `art2.js` aus dem aktuellen Verzeichnis)

**Was es prüft:**
- **Out-of-Bounds:** Zeichnet eine Funktion außerhalb ihres Sprite-Bereichs?
  (z.B. ein 32×32-Gesicht, das auf Pixel 33 malt → kaputtes UI-Layout)
- **Negative Rechtecke:** `fillRect` mit w<0 oder h<0 (Canvas-Irrtum)
- **Determinismus:** Seed 7 ergibt immer dasselbe, Seed 8 anderes
- **Self-Test:** Ruft `art2SelfTest()` mit Mock-Context auf

**Output:**
```
selftest bad: []                    ← leer = alles grün
out-of-bounds/neg issues: none      ← "none" = alles grün
look7 {...}                          ← Beispiel-Output (Determinismus-Beweis)
names ... | ...                      ← 16 generierte Namen
dossier42 {...}                      ← Beispiel-Akte
rows end y= 574                      ← Raster-Ende (Debug)
```

**Mock-Canvas:** Der Test ersetzt `fillRect` durch ein Pixelarray-Raster
(1000×860, RGB). Das bedeutet: **alles, was `fillRect` macht, wird gemessen.**
`strokeRect` wird als 4×`fillRect` emuliert. `drawImage`, `arc`, `ellipse`
werden NICHT gemessen (die nutzt art2.js bewusst nicht – nur fillRect).

### 1.3 `art2SelfTest(c)` (in art2.js eingebaut)
**Aufruf:** `const bad = art2SelfTest(ctx);` (beliebiger 2D-Context)
**Rückgabe:** Array der fehlgeschlagenen Checks (leer = grün).

**Checks:**
- Look/Name/Dossier deterministisch (Seed 7 = Seed 7, Seed 7 ≠ Seed 8)
- LOOKS ≥ 25 Einträge
- DOSSIERS["Jack O'Neill"] hat Verwandte
- Alle 7 Feind-Gesichter rendern ohne Exception
- Alle 8 Waffen rendern (Sprite + Icon)
- Alle 11 Raum-Icons rendern
- Alle 4 Themes × 6 Tile-Typen rendern

**Integration:** In `test-browser.js` (Browser-Gate-Test) eingebaut.
Jeder Durchgang MUSS damit grün sein.

---

## 2. Neue Assets generieren

### 2.1 Neue Rekruten (Cannon Fodder)
**Kein neuer Code nötig.** `registerRecruit(seed, cls)` ist die API:
```js
const reg = registerRecruit(200, 'fighter');
// reg = {seed, name, cls, look, dossier, age}
// LOOKS[reg.name] und DOSSIERS[reg.name] sind jetzt gefüllt
// portrait({name: reg.name, cls: reg.cls}) funktioniert sofort
```
**Seed-Regel:** Projekt nutzt Seed 100–123 (24 Rekruten).
Neue Rekruten: ab Seed 200 aufwärts, nicht mit 100–123 kollidieren.
**Namenskollisionen:** ~3000 Kombinationen. Bei >50 Rekruten Kollisions-Check:
```js
const names = new Set();
for (let s = 200; s < 250; s++) {
  const n = genRecruitName(s);
  if (names.has(n)) console.log('KOLLISION bei Seed', s, n);
  names.add(n);
}
```

### 2.2 Neue Feind-Typen
In `drawEnemyFace` (art2.js) einen neuen `case` ergänzen.
**Konvention:** 32×32, Hintergrund `#14202e`/`#1b2b3d` (wie die anderen).
**Test:** `drawEnemyFace(c, 'neuerTyp', 0, 0, 1)` in rastertest.js eintragen.

### 2.3 Neue Waffen
In `drawWeapon` (art2.js) einen neuen `case` ergänzen.
**Konvention:** 32×16, Seitenansicht nach rechts, `sc`-Skalierung.
**Test:** `drawWeapon(c, 'neueWaffe', 0, 0, 1)` in rastertest.js eintragen.
**Anzeigename:** In `_A2WNAME` eintragen (sonst `weaponName()` gibt den Key zurück).

### 2.4 Neue Raum-Typen
In `drawRoomIcon` (art2.js) einen neuen `case` ergänzen.
**Konvention:** 32×32, Hintergrund `#0f1622` + Rahmen `#243248`.
**Test:** `drawRoomIcon(c, 'neuerRaum', 0, 0, 1)` in rastertest.js eintragen.

### 2.5 Neue Terrain-Themes
In `_A2TH` (art2.js) ein neues Theme ergänzen + in `drawTile` die
Theme-Branches (`if(t==='desert')` etc.) erweitern.
**Konvention:** 48×48, nahtlos kachelbar (Rauschen an Weltkoordinaten,
Muster-Perioden 8/12/16/24 teilen 48).
**Test:** `drawTile(c, 'neuesTheme', t, 0, 0)` für t=0..5 in rastertest.js.

### 2.6 Neue benannte Charaktere (LOOKS)
In `Object.assign(LOOKS, {...})` (art2.js, Sektion 4.1) eintragen.
**Felder:** `skin`, `hair`, `style`, optional: `glasses`, `beard`, `goatee`,
`scar`, `band`, `mark` (bool oder Farbstring), `crown`, `glow`, `stars`.
**Test:** In `preview.html` Sektion "Benannte Charaktere" eintragen.

---

## 3. Integration ins Spiel

### 3.1 Script-Reihenfolge (index.html)
```html
<script src="sound.js"></script>
<script src="art.js"></script>      ← LOOKS, shade(), drawFace, drawSoldier
<script src="art2.js"></script>     ← NACH art.js (nutzt shade(), LOOKS)
<script src="engine.js"></script>   ← NACH art2.js (ruft registerRecruit beim Parsen)
<script src="combat.js"></script>
<script src="base.js"></script>
<script src="ui.js"></script>
```
**Warum:** `engine.js` baut den POOL beim Parsen auf (24×`registerRecruit`),
also muss `art2.js` schon geladen sein. `art.js` referenziert Engine-Globals
nur zur Laufzeit (PLANETS, S) → keine Zirkularität.

### 3.2 drawFace-Patch (art.js)
Der Artist hat `drawFace` um 4 Zeilen erweitert (bereits in `game/art.js`):
- `scar`: Narbe (1px-Linie + 3px-Blut)
- `beard`: Vollbart
- `band`: Goldene Kopfbinde (Goa'uld-Lords)
- `mark`: Darf jetzt Farbstring sein (Khepra grün, Heru-ur grau)

**Niemals rückgängig machen** – art2.js-Charaktere hängen daran.

### 3.3 Tile-Cache (combat.js)
`drawTile` braucht ~600 Hash-Aufrufe pro Boden-Tile. Ohne Cache: 300 Tiles ×
600 = 180.000 Calls pro Frame. Mit Cache: 5 Tiles einmal, dann `drawImage`.
**Code:** In `renderCombat` (combat.js), `C.tileCache` pro Mission-Start.
**Nicht entfernen** – Performance-Killer.

### 3.4 Raum-Icons (base.js)
`drawRoomIcon` ersetzt die Emojis im Cheyenne-Mountain-Cutaway.
**Fallback:** `typeof drawRoomIcon==='function'` – falls art2.js fehlt,
werden die alten Emojis gerendert.

### 3.5 Waffen-Sprite (ui.js)
`weaponSprite(type)` rendert die Waffe in ein 48×24-Canvas und cached es
als Data-URL. Wird im Combat-Panel neben dem Waffennamen angezeigt.
**Nur im Browser** (braucht `document.createElement('canvas')` + `toDataURL`).

---

## 4. Test-Checkliste (jeder Durchgang)

| # | Test | Befehl | Erwartet |
|---|---|---|---|
| 1 | Raster-Test | `cd game && node ../incoming/rastertest.js` | `selftest bad: []`, `none` |
| 2 | Browser-Gate | `node test-browser.js` | Alle ✔, init() OK |
| 3 | Preview | `incoming/preview.html` im Browser | Alle Sektionen sichtbar, keine schwarzen Löcher |
| 4 | Kollisions-Check | (siehe 2.1) | Keine Kollisionen bei neuen Seeds |

**Reihenfolge:** 1 → 2 → 3. Wenn 1 oder 2 rot, nicht weiter.

---

## 5. Bekannte Grenzen

| Thema | Status |
|---|---|
| Namenskollisionen | ~3000 Kombinationen, bei >50 Rekruten prüfen |
| Umlaute in DOSSIERS | Artist-Entscheidung (ae/oe/ue statt ä/ö/ü), Encoding-Sicherheit |
| Haarstil-Kombinationen | Laut Artist: Feinschliff nötig (visuell in preview.html prüfen) |
| Wand-Tiles (city type 2) | Laut Artist: Feinschliff nötig (Ziegel-Muster) |
| drawImage in art2.js | **Verboten** (nur fillRect) – sonst bricht der Raster-Test |
| arc/ellipse in art2.js | **Verboten** (nur fillRect) – sonst bricht der Raster-Test |

---

## 6. Dateistruktur

```
sgc-command-v2/
├── game/
│   ├── art.js          ← Basis-Grafik (LOOKS, drawFace, drawSoldier, Gateroom, Sternenkarte)
│   ├── art2.js         ← Artist-Erweiterung (Rekruten, Feinde, Waffen, Icons, Tiles, DOSSIERS)
│   ├── engine.js       ← Spiellogik (POOL, Missionen, Basis, Save)
│   ├── combat.js       ← Taktischer Kampf (Grid, AI, FX, Terrain-Render)
│   ├── base.js         ← Cheyenne-Mountain-Cutaway (Basis-Render)
│   ├── ui.js           ← UI (Tabs, Roster, Combat-Panel, Dossier-Modal)
│   ├── sound.js        ← Prozedurale Web-Audio (12 SFX)
│   ├── index.html      ← Einstieg (Script-Reihenfolge!)
│   └── style.css       ← Styling
├── incoming/           ← Artist-Lieferung (kanonisch)
│   ├── art2.js         ← Original (ohne Skaara-Patch)
│   ├── art.js          ← Original (mit drawFace-Patch)
│   ├── rastertest.js   ← Headless-Test (Mock-Canvas)
│   └── preview.html    ← Visueller Kontaktbogen
├── test-browser.js     ← Browser-Gate-Test (alle 7 Skripte, DOM-Prüfung)
├── ART-ANFORDERUNGEN.md ← Anforderungsliste an den Artist
├── ART-TOOLCHAIN.md    ← Dieses Dokument
└── HANDOFF.md          ← Übergabe-Dokument
```
