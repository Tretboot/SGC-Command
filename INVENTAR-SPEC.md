# 📋 INVENTAR-SPEC – SGC COMMAND v2

**Status:** Spezifikation (nicht implementiert)
**Priorität:** 🔴 Hoch (nächster großer Schritt nach Karten-Redesign)
**Zweck:** Ausrüstung pro Char, beeinflusst Kampf. Von der Serie inspiriert.

---

## 1. Das Problem

Aktuell: Jeder Char hat eine feste Waffe (`weapon`) und optional Melee (`melee`).
Keine Rüstung, keine Spezial-Items, keine Ausrüstungswahl.

Ziel: Spieler wählt VOR der Mission, was mitgenommen wird. Ausrüstung beeinflusst den Kampf.

---

## 2. Slots pro Char

```js
// In S.roster[id]:
{
  // ... bestehende Felder ...
  weapon: 'rifle',      // primäre Waffe (immer vorhanden)
  melee: null,          // Nahkampf (Chakram, Hammer, etc.)
  armor: null,          // Rüstung: null | 'light' | 'medium' | 'heavy'
  special: null,        // Spezial-Item: null | 'medkit' | 'shield' | 'smoke' | 'emp'
}
```

**Regel:** Max 1 Rüstung + 1 Spezial-Item pro Char. Waffe ist immer da.

---

## 3. Waffen (aus art2.js, bereits vorhanden)

| Typ | Name | Schaden | Reichweite | Spezial |
|---|---|---|---|---|
| rifle | P90 | 10–14 | 5 | – |
| shotgun | Schrotflinte | 15–19 | 2 | – |
| pistol | Pistole | 8–11 | 4 | – |
| zat | Zat'nik'tel | 12–16 | 4 | +25% vs. Goa'uld/Repl |
| staff | Stabwaffe | 8–12 | 5 | – |
| staffLong | Langer Stab | 13–17 | 6 | – |
| chakram | Chakram | 10–14 | 3 | Melee: +8 vs. Jaffa |
| hammer | Hammer | 14–18 | 1 | Melee: +25% Schaden |

**Waffen-Beschaffung:**
- Mission-Beute: Feinde fallen zufällig Waffen (10% Chance)
- Werkstatt: Erz + Tech → Waffe craften
- Forschung: Neue Waffentypen freischalten (Zat ab Kap. 2, Stab ab Kap. 3)

---

## 4. Rüstung

| Typ | Name | Schaden-Reduktion | Bewegung | Kosten |
|---|---|---|---|---|
| light | Leicht (Leather) | −10% | 0 | 10 Erz |
| medium | Mittel (Composite) | −20% | 0 | 25 Erz + 5 Tech |
| heavy | Schwer (Plated) | −30% | −1 | 40 Erz + 10 Tech |

**Im Kampf:**
- `dmgTaken = Math.round(dmgTaken * (1 - armorReduction))`
- Heavy: `move = Math.max(1, baseMove - 1)`
- Rüstung hält 3 Missionen (verschleißt), dann null

**Beschaffung:**
- Werkstatt: Erz + Tech → Rüstung craften
- Mission-Beute: Elite-Feinde fallen Rüstung (15% Chance)

---

## 5. Spezial-Items

| Typ | Name | Effekt | Nutzung | Kosten |
|---|---|---|---|---|
| medkit | Medkit | +15 HP (1×/Mission) | Aktiv (Button) | 5 Medizin |
| shield | Schild | +1 Deckung (2 Runden) | Aktiv | 15 Tech |
| smoke | Rauch | Feind −20% Treffer (1 Runde) | Aktiv | 10 Erz |
| emp | EMP | Feind −1 AP (1 Runde) | Aktiv | 20 Tech |

**Im Kampf:**
- `specialUsed` Flag: true nach Nutzung
- UI: Button im Combat-Panel (wenn Char selektiert + special vorhanden)
- Effekt wird in `C.fx[]` eingetragen (visuell)

**Beschaffung:**
- Werkstatt: Medizin/Tech → Spezial craften
- Mission-Beute: Zufall (5% Chance)

---

## 6. Ausrüstung im Basis-Tab (Armory)

**Neuer Raum: Armory** (in base.js, neben Werkstatt)

UI:
```
🔫 Armory
[Char-Auswahl-Dropdown]
Waffe: [P90 ▼]  (aus Inventory)
Rüstung: [Mittel ▼]  (aus Inventory)
Spezial: [Medkit ▼]  (aus Inventory)
[Craften] (Erz/Tech/Medizin → Item)
```

**Inventory (global):**
```js
S.inventory = {
  weapons: {rifle: 3, shotgun: 1, pistol: 2, zat: 0, staff: 0, ...},
  armor: {light: 2, medium: 1, heavy: 0},
  special: {medkit: 3, shield: 1, smoke: 0, emp: 0}
}
```

**Craften (Werkstatt + Armory):**
- P90: 15 Erz
- Schrotflinte: 20 Erz
- Zat: 30 Erz + 10 Tech (ab Kap. 2)
- Stabwaffe: 25 Erz + 5 Tech (ab Kap. 3)
- Leicht: 10 Erz
- Mittel: 25 Erz + 5 Tech
- Schwer: 40 Erz + 10 Tech
- Medkit: 5 Medizin
- Schild: 15 Tech
- Rauch: 10 Erz
- EMP: 20 Tech

---

## 7. Mission-Vorbereitung (Team-Tab)

Vor der Mission:
1. Team wählen (SG-1, SG-2, etc.)
2. Rekruten wählen (max 6 Units)
3. **Ausrüstung zuweisen:** Jeder Char bekommt Waffe + Rüstung + Spezial
4. Launch

**Regel:** Ausrüstung wird aus `S.inventory` genommen. Wenn nicht genug → kann nicht mit.

---

## 8. Kampf-Integration

In `combat.js`:

```js
// Bei startCombat:
C.units[uid] = {
  // ... bestehend ...
  armor: m.armor,        // null | 'light' | 'medium' | 'heavy'
  special: m.special,    // null | 'medkit' | 'shield' | 'smoke' | 'emp'
  specialUsed: false,
  armorDmg: 0,           // kumulierter Rüstungsschaden
};

// Bei doAttack (Schadensberechnung):
const armorRed = {light:0.10, medium:0.20, heavy:0.30}[target.armor] || 0;
dmg = Math.round(dmg * (1 - armorRed));

// Bei Spezial-Nutzung (neue Funktion):
function useSpecial(unit) {
  if(unit.specialUsed || !unit.special) return;
  unit.specialUsed = true;
  switch(unit.special) {
    case 'medkit': unit.hp = Math.min(unit.maxHp, unit.hp + 15); break;
    case 'shield': C.fx.push({type:'shield', x:unit.x, y:unit.y, t:0}); break;
    case 'smoke': C.fx.push({type:'smoke', x:unit.x, y:unit.y, t:0}); break;
    case 'emp': C.fx.push({type:'emp', x:unit.x, y:unit.y, t:0}); break;
  }
  sfx('special');
}
```

---

## 9. Beute (Loot)

Nach jeder Mission (in `applyCombatResult`):

```js
// Feind-Beute:
const lootCount = Math.floor(enemiesDefeated * 0.3); // 30% der Feinde fallen Loot
for(let i=0; i<lootCount; i++) {
  const r = Math.random();
  if(r < 0.10) S.inventory.weapons[randomWeapon()]++;
  else if(r < 0.25 && enemiesDefeated > 3) S.inventory.armor[randomArmor()]++;
  else if(r < 0.30) S.inventory.special[randomSpecial()]++;
}
```

---

## 10. Abnahme-Kriterien

- [ ] Char hat armor + special Feld
- [ ] Rüstung reduziert Schaden im Kampf
- [ ] Heavy Rüstung reduziert Bewegung
- [ ] Spezial-Item nutzbar im Kampf (1×/Mission)
- [ ] Armory-Raum in Basis (Craften + Zuweisen)
- [ ] Inventory-System (S.inventory)
- [ ] Mission-Beute füllt Inventory
- [ ] UI: Ausrüstung in Roster sichtbar
- [ ] Gate-Test grün
- [ ] Raster-Test grün

---

## 11. Umsetzung (Lead Developer)

**Schritte:**
1. `S.inventory` in `newGame()` (engine.js)
2. `armor` + `special` Feld in POOL (engine.js)
3. ARMORS + SPECIALS Konstanten (engine.js)
4. Craft-Funktion (engine.js: `craftItem(type, subtype)`)
5. Kampf-Integration (combat.js: armor reduction, useSpecial)
6. Armory-UI (base.js: neuer Raum)
7. Roster-UI (ui.js: Ausrüstung anzeigen)
8. Loot in applyCombatResult (combat.js)
9. Gate-Test + Raster-Test
10. Captain's Log + ZIP

**Geschätzter Aufwand:** 1 Durchgang (Lead Developer)
