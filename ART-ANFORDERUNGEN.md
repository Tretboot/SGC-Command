# 🎨 ART-ANFORDERUNGEN – SGC COMMAND v2

**Für:** Artist (Claude)
**Von:** Commander Qwen
**Datum:** Durchgang 4
**Ziel:** Alle fehlenden Grafiken als **reines Code-Asset** (prozedural, keine Bilddateien) in einer neuen Datei `art2.js`, die nach `art.js` geladen wird.

---

## 1. Kontext

**SGC COMMAND v2** ist ein taktisches Grid-Kampfspiel (X-COM-Style) im Stargate-Universum. Es gibt drei Grafik-Kontexte:

1. **Portraits** (32×32 Pixel) – Roster, UI-Panels, Akten
2. **Kampf-Grid** (48×48 Tiles) – Terrain, Cover, Units
3. **Basis** (Cheyenne-Mountain-Cutaway) – Raum-Icons, Deko

**Wichtig:** Das Spiel hat **keine externen Assets**. Alles wird per Canvas-API gezeichnet (`fillRect`, `arc`, `ellipse`). Das bleibt so – die ZIP-Datei muss klein bleiben und ohne Build-Step laufen.

---

## 2. Stil-Regeln (STRICT)

| Regel | Wert |
|---|---|
| Stil | Pixel-Art, hartkantig, **kein Anti-Aliasing** (`fillRect`-basiert) |
| Portrait-Grid | **32×32** (wird 2×/2.25× skaliert angezeigt) |
| Ganzkörper | ~36×40 Pixel (siehe `drawSoldier`) |
| Tile-Grid | **48×48** (Kampf-Grid, `TILE=48`) |
| Waffe-Sprite | 32×16, Seitenansicht, horizontal |
| Raum-Icon | 32×32 |
| Palette | Dunkles Blau `#070b12` / `#0f1622`, Akzent Cyan `#4fc3f7`, Gold `#e8b040`, Grün `#4ade80`, Rot `#ef4444`, Hauttöne `#e3b48e`–`#6b4529` |
| Determinismus | **Alles seeded** – gleicher Input = gleiche Grafik (für Rekruten: Name/ID als Seed) |
| Kein `drawImage` | Nur `fillRect`, `arc`, `ellipse`, `strokeRect`, `lineTo` |

### Referenz-Code (aus bestehendem `art.js`)

```js
// Basis-Helfer:
function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
// Farb-Helfer:
function shade(hex,d){/* +d zu RGB, clamped */}

// Portrait-Format (LOOKS-Eintrag):
"Jack O'Neill":{skin:'#e3b48e',hair:'#a8a8a8',style:'short'},
'Teal'c':{skin:'#6b4529',hair:null,style:'bald',mark:true},
'General Hammond':{skin:'#e8bc9a',hair:'#d8d8d8',style:'fringe',stars:true},

// Haar-Styles (existieren bereits, wiederverwenden!):
// 'short','bob','long','ponytail','curly','dreads','slick','fringe','messy','bald'
// Extras: glasses:true, goatee:true, mark:true (Teal'c-Stirn), crown:true (Apophis), glow:true (goldene Augen), stars:true (Hammond)

// Klassen-Farben (UNI):
const UNI={leader:['#5d6b3c','#8a9a5a'],fighter:['#3d4a2b','#6a7a4a'],scientist:['#4a6a90','#86a6c8'],medic:['#cfd6da','#c0392b'],engineer:['#8a6a38','#c8a050']};

// Ganzkörper-Soldat (Signatur – NICHT ändern):
function drawSoldier(c,x,y,sc,m,walk,alpha){/* x,y = Fuß-Position, sc = Scale, m = Member, walk = Sinus-Phase, alpha */}
```

**`drawFace(c,m,lk)` existiert bereits und rendert ein 32×32-Portrait aus einem `LOOKS`-Eintrag.** Neue Portraits = neue `LOOKS`-Einträge. Das ist der ganze Mechanismus.

---

## 3. P0 – Sofort benötigt (Spiel läuft ohne das nicht gut)

### 3.1 Rekruten-Generator (Cannon Fodder) ⭐ WICHTIGSTES

**Problem:** Das Spiel hat 15 bekannte Chars, aber wir brauchen **24+ namenlose Rekruten** (SG-2, SG-3, Reserve) mit individuellen Gesichtern – und später noch mehr für Quests.

**Lösung:** Ein **seeded prozeduraler Generator**, der aus einer ID deterministisch einen `LOOKS`-Eintrag baut.

```js
// Signatur:
function genRecruitLook(seed){
  // seed: Zahl (Rekrut-ID) oder String (Name)
  // Rückgabe: LOOKS-kompatibler Eintrag, z.B. {skin:'#d9a07a',hair:'#3a2a1a',style:'short',glasses:true}
}
// + Name-Generator:
function genRecruitName(seed){
  // Rückgabe: z.B. "Pvt. Marcus Webb", "Cpl. Dana Ruiz", "Sgt. Tom Okafor"
  // Vorname-Liste (24+), Nachname-Liste (24+), Ränge: Pvt./Cpl./Sgt./Lt.
}
```

**Parameter (alle seeded aus `seed`):**
- Haut: 6 Töne (`#f0c8a4`, `#e8bc98`, `#e3b48e`, `#d9a07a`, `#b8845a`, `#6b4529`)
- Haar: 1 von 9 existierenden Styles + 6 Farben (`#1a1210`, `#3a2a1a`, `#6a4a2a`, `#a8a8a8`, `#d8d8d8`, `#e8c860`)
- Bart: 40% Chance (short/goatee/none)
- Brille: 15% Chance
- Narbe: 10% Chance (neues Feld `scar:true` → `drawFace` muss das rendern: 2×3 Pixel auf Wange)
- Alter: 20–55 (beeinflusst Haarfarbe: älter = mehr Grau)

**Wichtig:** `drawFace` muss um `scar:true` erweitert werden (kleines Patch). Alles andere nutzt existierende Styles.

**Test:** `genRecruitLook(7)` liefert IMMER dasselbe Ergebnis. `genRecruitLook(7) !== genRecruitLook(8)`.

### 3.2 Feind-Gesichter (für UI + Akten)

Die Feind-**Bodies** (`drawEnemyBody`) existieren schon. Es fehlen die **Gesichter** für UI-Panels, Boss-Intro und Akten.

```js
// Signatur:
function drawEnemyFace(c,type,x,y,sc){
  // c: Context, type: String, x/y: Position, sc: Scale
  // Rendert ein 32×32-Gesicht (wie drawFace, aber für Feinde)
}
```

**Typen (7):**

| type | Look |
|---|---|
| `jaffa` | Braune Haut `#c8a060`, goldene Stirn-Markierung, dunkle Augen, Robe-Kragen |
| `veteran` | Wie jaffa, aber älter (Falten: 2 horizontale Linien), orange Akzent |
| `elite` | Violette Robe, violette Augen-Markierung, ernster |
| `goauld` | Reptil: gräulich-grüne Haut `#8a9a6a`, goldene schräge Augen, keine Nase (2 Schlitze), glatt |
| `repl` | Metall: grau `#909090`, ein großes rundes Auge (Sensor), Nähte (Linien) |
| `drone` | Wie repl, kleiner, zwei kleine Augen |
| `queen` | Wie repl, aber dunkler `#505050`, drei Augen, Kronen-Struktur oben |

### 3.3 Waffen-Sprites (für UI-Panel + Armory)

Aktuell steht im Combat-UI nur Text: "🔫 Rifle 9–13". Das soll ein **Sprite** werden.

```js
// Signatur:
function drawWeapon(c,type,x,y,sc){
  // c: Context, type: String, x/y: Position, sc: Scale
  // Rendert eine 32×16-Waffe in Seitenansicht (läuft nach rechts)
}
```

**Typen (8, decken alle `WEAPONS` aus combat.js ab):**

| type | Look |
|---|---|
| `rifle` | P90: dunkelgrau, kompakt, Magazine unten, kurzer Lauf |
| `shotgun` | Lang, holzener Griff `#8a6a38`, dicker Lauf |
| `pistol` | Klein, dunkel, kurzer Lauf |
| `zat` | Blau leuchtend `#4fc3f7`, T-förmig, Energie-Kern |
| `staff` | Jaffa-Staff: lang, braun `#4a3a20`, goldene Spitze (leuchtend `#e8c040`) |
| `staffLong` | Wie staff, länger, violette Spitze |
| `chakram` | Goldener Ring (Kreis, 12px Durchmesser), mit Gravuren |
| `hammer` | Ronons Hammer: großer Kopf `#6a6a6a`, kurzer Griff |

**Bonus (P1):** `drawWeaponIcon(c,type,x,y)` → 16×16 Version für die Armory-Liste.

### 3.4 Raum-Icons (Basis, 11 Typen)

Aktuell: Emoji (🔬🛠⚕). Das sieht im Cheyenne-Mountain-Cutaway flach aus.

```js
// Signatur:
function drawRoomIcon(c,type,x,y,sc){
  // c: Context, type: String, x/y: Position, sc: Scale
  // Rendert ein 32×32-Icon
}
```

**Typen (11):**

| type | Icon-Idee |
|---|---|
| `gate` | Cyan-Ring mit 9 Chevrons (wie im Gateroom, vereinfacht) |
| `generator` | Grauer Block mit gelbem Blitz `#e8c040` |
| `lab` | Reagenzglas (grün `#4ade80`) + Mikroskop |
| `workshop` | Hammer + Zahnrad |
| `barracks` | Bett (Rechteck) + Klapprack |
| `medbay` | Weißes Kreuz auf rotem Grund `#c0392b` |
| `training` | Zielscheibe (Kreis + Punkte) |
| `armory` | Waffe (P90-Silhouette) + Kiste |
| `water` | Tropfen (blau `#4fc3f7`) + Pipe |
| `storage` | Drei Kisten (braun) gestapelt |
| `canteen` | Teller + Gabel |

### 3.5 Terrain-Tiles (Kampf-Grid, 48×48)

Aktuell: Flat-Color + einfache Formen. Das soll **Textur** bekommen.

```js
// Signatur:
function drawTile(c,theme,type,x,y){
  // c: Context, theme: 'desert'|'jungle'|'city'|'sgc', type: 0-5, x/y: Pixel-Position
  // Rendert ein 48×48-Tile
}
```

**Themes (4) × Typen (6) = 24 Varianten:**

| type | Bedeutung | desert | jungle | city | sgc |
|---|---|---|---|---|---|
| 0 | Boden | Sand `#c8a060` + Körnung | Gras `#2a4a2a` + Blätter | Asphalt `#3a3a3a` + Risse | Metallboden `#2a3040` + Platten |
| 1 | Low Cover (Kiste) | Sandkiste | Baumstumpf | Betonblock | Kiste |
| 2 | High Cover (Mauer) | Steinmauer | Dickes Gebüsch | Ziegelmauer | Metallwand |
| 3 | Gebäude | Ruine (Wüste) | Dschungel-Tempel | Hochhaus-Fassade | SGC-Wand (mit Tür) |
| 4 | Wasser | Oase (blau) | Fluss | Pfütze | Kühlwasser-Becken |
| 5 | Gate | (alle gleich) Gate-Ring auf Boden |

**Wichtig:** Tiles müssen **kachelbar** sein (Rand-Pixel passen zusammen). Kein Anti-Aliasing.

---

## 4. P1 – Nächster Durchgang (Quests + Bossen)

### 4.1 Neue benannte Charaktere (LOOKS-Einträge)

Diese Chars brauchen **einzelne, handgemachte** Portraits (nicht generiert):

**Goa'uld-Lords (4 neu):**

| Name | Look-Hinweis |
|---|---|
| `Anubis` | Ägyptisch: goldene Kopfbinde, dunkle Haut, schwarzes Haar (slick), goldene Augen (glow) |
| `Amonet` | Weiblich: langes Haar (long), blauer Schmuck, goldene Augen |
| `Khepra` | Skarabäus-Motiv: grüne Markierung auf Stirn, kurzes Haar, goldene Augen |
| `Heru-ur` | Falke-Motiv: graue Markierung, kurzes graues Haar, goldene Augen |

**Zivilisten (5 neu, für Quests):**

| Name | Look-Hinweis |
|---|---|
| `Brack` (Alpha) | Älter, graues kurzes Haar, Bart, ernster |
| `Skaara` (Abydos) | Junge Frau, dunkles langes Haar, braune Haut |
| `Col. Sumner` (Abydos) | Militär, kurzes graues Haar, strenge |
| `Tollan` (New Ground) | Älter, langes weißes Haar, freundlich |
| `Möbius-Prinzipal` | Wissenschaftler, Brille, kurzes braunes Haar |

**Asgard (1):**

| Name | Look-Hinweis |
|---|---|
| `Thor` | Blaugraue Haut `#7a8a9a`, silbernes Haar, goldene Augen, kahl |

**Format:** Genau wie bestehende `LOOKS`-Einträge. `drawFace` muss **nicht** geändert werden (außer `scar`).

### 4.2 DOSSIERS – Akten-System (Daten, kein Art)

Für Quests und Lore. **Reine Datenstruktur** in `art2.js`:

```js
const DOSSIERS={
  "Jack O'Neill":{
    file:"SGC-001",
    relatives:[
      {name:"Sarah O'Neill",rel:"Tochter",trait:"Ärztin in Colorado",quest:"Sarah wird entführt (Kap. 3)"}
    ],
    trait:"Chekhov's Pencil",
    bio:"Major, Air Force (ret.). Hat den Berg gebaut. Trinkt zu viel Kaffee."
  },
  "Samantha Carter":{
    file:"SGC-002",
    relatives:[
      {name:"Dr. Richard Carter",rel:"Vater",trait:"Physiker, verstorben",quest:"Seine Forschung wird in Kap. 2 gefunden"}
    ],
    trait:"Gate-Genius",
    bio:"Colonel, Astrophysikerin. Kann Gates reparieren, während sie schießt."
  },
  // ... für alle 15 bekannten + 24 Rekruten (generiert)
};
```

**Für Rekruten (generiert):**
```js
function genDossier(seed){
  // Rückgabe: {file:"SGC-1xx", relatives:[...], trait:"...", bio:"..."}
  // Verwandte: Mutter/Vater/Bruder/Schwester/Partner, mit Namen + Ort
  // Quest-Hooks: "Wird in Kap. X entführt", "Hat einen Bruder in der Armee", "Will nach Hause"
}
```

**Ziel:** Jeder Rekrut hat eine Akte mit 1–2 Verwandten und 1 Quest-Hook. Das wird später für "Verwandten-Rettungs-Quests" genutzt.

---

## 5. P2 – Später (wenn Zeit)

| Item | Beschreibung |
|---|---|
| Walk-Animation (2 Frames) | `drawSoldier` hat einen `walk`-Parameter – 2 Beinstellungen (links/rechts) statt nur Sinus-Bob |
| Feind-Body-Varianten | Jaffa mit Schild, Goa'uld mit Thron, Königin (größer) |
| UI-Deko | Header-Logo (SGC-Symbol), Tab-Icons, Button-Texturen |
| Gateroom-Upgrade | Mehr Details im Kontrollraum (Blinkende Lamps, Screens) |
| Sound | (Bereits prozedural in `sound.js` – kein Art nötig) |

---

## 6. Deliverable-Format

**Eine Datei:** `art2.js`

```js
'use strict';
// ===================== SGC COMMAND v2 – Art Extension =====================
// Prozedurale Grafiken: Rekruten, Feind-Gesichter, Waffen, Raum-Icons, Terrain.
// Lädt NACH art.js. Nutzt px(), shade(), drawFace() aus art.js.

// --- 3.1 Rekruten-Generator ---
function genRecruitLook(seed){...}
function genRecruitName(seed){...}

// --- 3.2 Feind-Gesichter ---
function drawEnemyFace(c,type,x,y,sc){...}

// --- 3.3 Waffen ---
function drawWeapon(c,type,x,y,sc){...}

// --- 3.4 Raum-Icons ---
function drawRoomIcon(c,type,x,y,sc){...}

// --- 3.5 Terrain-Tiles ---
function drawTile(c,theme,type,x,y){...}

// --- 4.1 Neue LOOKS-Einträge ---
Object.assign(LOOKS,{
  "Anubis":{...},
  "Amonet":{...},
  // ...
});

// --- 4.2 DOSSIERS ---
const DOSSIERS={...};
function genDossier(seed){...}
```

**Regeln:**
- **Keine neuen globalen Variablen** außer `DOSSIERS` (und ggf. interne Listen für Namen)
- **Keine Änderungen** an `art.js` (außer: `drawFace` um `scar:true` erweitern – das ist die einzige Ausnahme)
- **Deterministisch:** Gleicher Seed = gleiche Grafik
- **Keine Bilddateien**, kein `drawImage`, kein `fetch`
- **Kompatibel mit Node** (Smoke-Test): Alle Funktionen müssen ohne DOM aufrufbar sein (nur `c`-Methoden nutzen)

---

## 7. Abnahmekriterien

| # | Test | Erwartung |
|---|---|---|
| 1 | `genRecruitLook(7)` × 2 | Identisches Ergebnis |
| 2 | `genRecruitLook(7)` vs `genRecruitLook(8)` | Unterschiedlich |
| 3 | `drawEnemyFace(c,'goauld',0,0,1)` | Rendert ohne Fehler, goldene Augen sichtbar |
| 4 | `drawWeapon(c,'staff',0,0,1)` | Rendert ohne Fehler, goldene Spitze |
| 5 | `drawRoomIcon(c,'gate',0,0,1)` | Rendert ohne Fehler, cyan Ring |
| 6 | `drawTile(c,'desert',0,0,0)` | Rendert ohne Fehler, sandfarben |
| 7 | `drawTile(c,'jungle',1,48,0)` | Rendert ohne Fehler, kachelbar mit Nachbar |
| 8 | `Object.keys(LOOKS).length` nach `art2.js` | ≥ 25 (15 alt + 10 neu) |
| 9 | `DOSSIERS["Jack O'Neill"].relatives.length` | ≥ 1 |
| 10 | `genDossier(42).relatives[0].name` | Immer derselbe Name |
| 11 | `node --check art2.js` | Keine Syntax-Fehler |
| 12 | Alle Funktionen in Node aufrufbar (mit Mock-Context) | Keine Fehler |

---

## 8. Priorisierung & Aufwand

| Prio | Item | Aufwand | Blockiert? |
|---|---|---|---|
| **P0** | Rekruten-Generator (3.1) | Mittel | Nein, aber wichtig für Roster |
| **P0** | Feind-Gesichter (3.2) | Mittel | Nein, Bodies existieren |
| **P0** | Waffen-Sprites (3.3) | Klein | Nein, Text-Fallback existiert |
| **P0** | Raum-Icons (3.4) | Klein | Nein, Emoji-Fallback existiert |
| **P0** | Terrain-Tiles (3.5) | Groß | Nein, Flat-Color existiert |
| **P1** | Neue LOOKS (4.1) | Klein | Nein |
| **P1** | DOSSIERS (4.2) | Mittel | Nein, aber wichtig für Quests |
| **P2** | Animationen, Deko | Groß | Nein |

**Empfehlung:** P0 komplett in einem Durchgang, P1 im nächsten. P2 erst wenn das Spiel "spasst".

---

## 9. Was wir SELBST machen (kein Art nötig)

| Item | Wer | Warum |
|---|---|---|
| `drawFace` um `scar:true` erweitern | Commander (1 Zeile) | Trivial |
| `combat.js`: `drawTile` aufrufen statt Flat-Color | Commander | Integration |
| `base.js`: `drawRoomIcon` aufrufen statt Emoji | Commander | Integration |
| `ui.js`: `drawWeapon` im Combat-Panel rendern | Commander | Integration |
| `engine.js`: POOL um 24 Rekruten erweitern (mit `genRecruitName`) | Commander | Daten |
| `engine.js`: DOSSIERS in Save-State einbinden | Commander | Daten |
| Smoke-Test für alle neuen Funktionen | Commander | QA |

**Der Artist liefert nur `art2.js`. Die Integration machen wir.**

---

*„Die Knie. (Es sind die Knie.)" – O'Neill*
