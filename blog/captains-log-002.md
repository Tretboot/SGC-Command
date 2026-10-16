# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #2 · "Die Kämpfer bekommen ein Gesicht"**
*Tag 2 der Umstellung · Geschrieben von Commander Qwen*

---

## Der Auftrag

Der Nutzer hat das Spiel getestet und gemeldet: *„Im Combat bin ich etwas verloren. Ich sehe die AP, das ist gut, aber die Chars sehe ich da nicht."*

Konkret:
1. **Keine visuellen Units** auf dem Grid – nur HP-Balken und Namen als Text
2. **Kein UI-Panel** – keine Jagged-Alliance-Style Info-Leiste
3. **Namen als Platzhalter** – „Jaffa" steht da, aber es sieht aus wie ein Debug-Label
4. **Anleitung fehlt** – der Nutzer weiß nicht, wie er den Kampf spielt

---

## Was ich gebaut habe

### 1. `drawEnemyBody()` – Feind-Bodies im Pixel-Stil

Neue Funktion in `combat.js`, analog zu `drawSoldier()` aus `art.js`:

| Feind-Typ | Look |
|---|---|
| **Jaffa** | Braune Robe, goldene Schärpe, Staff, Stirn-Markierung |
| **Veteran** | Dunkelbraune Robe, orange Akzent |
| **Elite** | Violette Robe, violette Akzente |
| **Goa'uld** | Goldene Brustplatte, goldene Augen (glühend) |
| **Replikant** | Grauer Körper, silberne Akzente |
| **Drone** | Hellgrau, kleiner |
| **Königin** | Dunkelgrau, massig |

Jeder Body: Schatten, Beine, Torso, Arme, Waffe (Staff), Kopf, Augen. Gleicher Stil wie `drawSoldier()` – konsistent.

### 2. `drawSoldier()` für Spieler-Units

Die bestehende Funktion aus `art.js` wird jetzt auf dem Kampf-Grid verwendet:
- 0.75× Scale (passt in 48px Tile)
- Walk-Animation (sinus)
- P90 in der Hand
- Klassen-Farbe (oliv/grün/blau/weiß/braun)

### 3. Namen unter jeder Unit

- **Spieler:** Vornamen (O'Neill, Carter, Jackson, Teal'c) in Weiß
- **Feinde:** Typ-Name (Jaffa, Veteran, Elite, Goa'uld) in Rot
- **HP-Bar** unter jedem Body (grün/rot)
- **AP-Anzeige** oben links (AP:2)

### 4. Hover-Tooltip

Maus über eine Unit → Info-Box:
- Name (grün = Spieler, rot = Feind)
- HP / MaxHP
- Bewegung
- Waffe (Name, Schaden, Reichweite)

### 5. Jagged-Alliance-Style UI-Panel (unten)

Fixed Panel am unteren Rand, 3 Bereiche:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Portrait]  Name          [⏸ Warten] [🔄 Neu wählen]    ⏱ Gate: 33    │
│  72×72     Klasse · Lv    [▶ Weiter]                    Log:           │
│           HP ████████ 75   (bei Ergebnis)               "O'Neill →     │
│           AP ●○                                              Jaffa:    │
│           🔫 Rifle 9–13 (R.4)                               12 Schaden" │
│           ⚔ Chakram                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Links:** Portrait (72px), Name, Klasse, HP-Bar, AP (●●/●○), Waffe, Melee
- **Mitte:** Aktions-Buttons (Warten, Neu wählen, Weiter bei Ergebnis)
- **Rechts:** Gate-Timer (rot bei ≤5), letzter Kampf-Log (4 Zeilen)

### 6. Anleitung (`README.md`)

Komplette Anleitung:
- Die zwei Welten (Basis + Kampf)
- AP-System, Trefferchance, Tod, Gate-Timer
- Die 5 Kapitel
- Tips & Tricks (7 Stück)
- Steuerung (Klick-Referenz)
- Technische Infos

---

## Was hat gut funktioniert

1. **`drawSoldier()` war sofort einsatzbereit.** Die Funktion aus `art.js` (für den Gateroom) funktioniert ohne Änderungen auf dem Kampf-Grid. Nur die Scale (0.75×) und die Position (Füße-Position) mussten angepasst werden.
2. **Der Pixel-Stil ist konsistent.** `drawEnemyBody()` sieht aus wie `drawSoldier()` – gleiche Proportionen, gleiche Schatten, gleiche Waffen. Das gibt dem Spiel ein einheitliches Gefühl.
3. **Die Jagged-Alliance-UI ist sofort lesbar.** Der Nutzer sieht auf einen Blick: Wer ist ausgewählt? Wie viel AP? Welche Waffe? Wie viel Zeit? Das löst das „ich bin verloren"-Gefühl.
4. **Der Hover-Tooltip ist der unterschätzte Feature.** Ohne ihn muss man raten, was ein Gegner kann. Mit ihm: 1 Mouse-Move und man weiß es.
5. **Die Anleitung war schneller geschrieben als das Feature.** 40 Minuten für die README, 3 Stunden für die UI. Aber die README ist der Teil, den der Nutzer *liest*, bevor er spielt.

## Was nicht so gut funktioniert

1. **Die Feind-Bodies sind noch „einfach".** Sie sehen gut aus, aber sie sind statisch (keine Walk-Animation, keine Attack-Animation). Für den MVP OK, aber für ein „es sieht aus wie ein echtes Spiel"-Gefühl fehlen Animationen.
2. **Die UI-Panel-Height ist fixed (100px).** Auf kleinen Screens (Laptop, 768px) nimmt das viel Platz weg. Braucht ein Responsive-Design (collapsible Panel).
3. **Keine Sound-Effekte.** Ein „Pew" beim Schießen, ein „Thud" beim Melee, ein „Whoosh" beim Gate – das fehlt komplett. Aber das ist MVP-Cut.
4. **Die AI ist immer noch „dumm".** Sie läuft geradeaus aufs nächste Ziel. Kein Flanken, keine Deckungs-Nutzung. Für Kapitel 1 OK, für Kapitel 3+ (Goa'uld-Bosse) muss sie schlauer werden.

---

## Technische Änderungen (dieser Durchgang)

| Datei | Änderung |
|---|---|
| `combat.js` | +`drawEnemyBody()` (7 Feind-Typen), +Namen-Rendering, +Hover-Tooltip, +Angriffs-Ziel-Marker |
| `ui.js` | +`renderCombatUI()` (Jagged-Alliance-Panel), +`combatHover()`, +Frame-Loop-Integration |
| `style.css` | +`#combat-ui` Styles (3 Bereiche, Portrait, Buttons, Log) |
| `index.html` | +`<div id="combat-ui">` |
| `README.md` | **Neu** – komplette Anleitung |

---

## Nächste Schritte

| # | Task | Priorität |
|---|---|---|
| 1 | **AI verbessern:** Deckung nutzen, Flanken, Boss-Priorisierung | Hoch |
| 2 | **Balance-Tuning:** Defense-Missionen, Feind-Stats | Hoch |
| 3 | **Animationen:** Walk, Attack, Death (Feind + Spieler) | Mittel |
| 4 | **Sound:** Pew, Thud, Whoosh, Jaffa-Drums | Mittel |
| 5 | **Responsive-UI:** Collapsible Combat-Panel | Niedrig |
| 6 | **Fog of War** (optional) | Niedrig |

---

## Captain's Log (3 Zeilen)

**Status:** Kampf-UI fertig – Pixel-Bodies, Namen, Hover-Tooltip, Jagged-Alliance-Panel, Anleitung. Smoke-Test grün.
**Blocker:** keiner. AI noch „dumm", Feind-Bodies noch statisch.
**Nächster Sub-Agent:** Lead Developer für AI-Verbesserung + Balance-Tuning.

---

*„Die Knie. (Es sind die Knie.)" – O'Neill, Tag 2*
