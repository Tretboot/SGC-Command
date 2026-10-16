# 📋 QUEST-ENGINE-SPEC – SGC COMMAND v2

**Status:** Spezifikation (nicht implementiert)
**Zweck:** Die 39 Dossier-Quest-Hooks auslösbar machen.
**Priorität:** 🔴 Hoch (nächster großer Schritt)

---

## 1. Das Problem

Die 39 Charaktere haben Personalakten (DOSSIERS) mit Quest-Hooks:
- 15 handgeschriebene (z.B. "Sarah wird entführt (Kap. 3)")
- 24 generierte (z.B. "Braucht dringend Medizin (Kap. 1)")

Diese Hooks sind **tote Daten** – sie stehen in den Akten, aber das Spiel kann sie nicht auslösen. Die Quest-Engine macht sie zum Spielfluss.

---

## 2. Architektur

### 2.1 Save-State

```js
// In newGame() (engine.js):
S.quests = [];  // aktive Quests

// Schema pro Quest:
{
  id: 'q-onell',           // eindeutige ID
  charId: 0,               // POOL-Index des Chars
  char: "Jack O'Neill",    // Name (für UI)
  chapter: 3,              // ab welchem Kapitel aktiv
  title: 'Die Tochter',    // Anzeigetitel
  intro: '...',            // 2-3 Sätze, was passiert
  goal: '...',             // 1 Satz: was das Team tun muss
  steps: ['...', '...'],   // Schritte (werden frei geschaltet)
  stepIndex: 0,            // aktueller Schritt
  reward: '...',           // was man bekommt
  fail: '...',             // was bei Fehlschlag passiert
  epilogue: '...',         // 2-3 Sätze, wie es ausgeht
  status: 'active'         // 'active' | 'done' | 'failed'
}
```

### 2.2 Content-Datei

`content/quests.js` (von Lead Story Writer):
```js
'use strict';
const QUESTS = [
  {
    id: 'q-onell',
    charId: 0,
    char: "Jack O'Neill",
    chapter: 3,
    title: 'Die Tochter',
    intro: '...',
    goal: '...',
    steps: ['...', '...', '...'],
    reward: '...',
    fail: '...',
    epilogue: '...'
  },
  // ... 14 weitere
];
```

**Script-Reihenfolge:** `content/quests.js` nach `engine.js` (braucht POOL-Indizes).

### 2.3 Trigger-Punkte

```js
// 1. applyCombatResult() (combat.js) – nach jeder Mission:
function checkQuests() {
  QUESTS.forEach(q => {
    if (S.quests.some(s => s.id === q.id)) return; // schon aktiv
    if (S.chapter < q.chapter) return;             // noch zu früh
    const m = S.roster[q.charId];
    if (!m || !m.recruited) return;                // Char nicht rekrutiert
    if (m.dead) return;                            // Char tot
    // Quest wird aktiv:
    S.quests.push({...q, stepIndex: 0, status: 'active'});
    note(`📋 Neue Quest: ${q.title} (${q.char})`);
  });
}

// 2. endDay() (engine.js) – nach jedem Basis-Tag:
// Gleicher Check wie oben (für Quests, die nicht an Missionen hängen)

// 3. Kapitel-Wechsel (engine.js):
// S.chapter++ → checkQuests()
```

### 2.4 Steps schalten

```js
// In applyCombatResult() (combat.js):
function advanceQuests(mission) {
  S.quests.forEach(q => {
    if (q.status !== 'active') return;
    // Mission hat questId?
    if (mission.questId === q.id) {
      q.stepIndex++;
      if (q.stepIndex >= q.steps.length) {
        q.status = 'done';
        note(`✔ Quest abgeschlossen: ${q.title}`);
        note(`   ${q.epilogue}`);
        // Reward:
        if (q.reward) note(`   🎁 ${q.reward}`);
      } else {
        note(`📋 ${q.title}: Schritt ${q.stepIndex+1}/${q.steps.length}`);
      }
    }
  });
}
```

### 2.5 Fehlschlag

```js
// In applyCombatResult() (combat.js):
function failQuests() {
  S.quests.forEach(q => {
    if (q.status !== 'active') return;
    const m = S.roster[q.charId];
    if (m.dead) {
      q.status = 'failed';
      note(`💀 Quest gescheitert: ${q.title}`);
      note(`   ${q.fail}`);
    }
  });
}
```

---

## 3. UI

### 3.1 Quest-Panel (Roster-Tab)

```html
<h3>📋 Aktive Quests</h3>
<div class="item">
  <b>Die Tochter</b> <small>Jack O'Neill · Kap. 3</small>
  <div>📌 Schritt 2/3: Sarah finden</div>
  <div class="bars">📊 ${bar(q.stepIndex/q.steps.length*100, '#4fc3f7')}</div>
</div>
```

### 3.2 Dossier-Modal (erweitert)

Im bestehenden `showDossier()` (ui.js):
- Wenn Char eine aktive Quest hat: Quest-Status anzeigen
- Wenn Char eine abgeschlossene Quest hat: Epilog anzeigen

---

## 4. Missionen mit questId

In `CHAPTERS` (engine.js) werden Missionen mit `questId` verknüpft:
```js
{
  id: '3-2',
  name: 'Sohn des Pharao',
  planet: 'ennui',
  goal: 'Prinz Kaelo befreien',
  map: 'jungle',
  type: 'defense',
  enemies: {veteran:8, elite:6},
  timer: 30,
  reward: {ore:25, medicine:5},
  text: 'Kaelo als Reservist',
  questId: 'q-mitchell'  // ← Cameron Mitchell's Quest
}
```

---

## 5. Abnahme-Kriterien

- [ ] Quest startet beim richtigen Kapitel
- [ ] Quest startet nur wenn Char rekrutiert ist
- [ ] Steps schalten bei Missionen frei
- [ ] Reward wird ausgezahlt
- [ ] Fehlschlag bei Rekrut-Tod
- [ ] Quest-Panel im Roster-Tab
- [ ] Dossier-Modal zeigt Quest-Status
- [ ] Gate-Test grün
- [ ] Raster-Test grün

---

## 6. Offene Fragen

1. **Quest-Missionen:** Soll jede Quest eine eigene Mission haben, oder werden Quests über mehrere Missionen verteilt?
   - Empfehlung: 1 Quest = 1 Mission (einfacher, klarer)
2. **Quest-Rewards:** Was bekommen Spieler für abgeschlossene Quests?
   - Empfehlung: Tech-Punkte, Erz, oder ein exklusives Talent
3. **Quest-Fehlschlag:** Was passiert, wenn der Char stirbt?
   - Empfehlung: Quest wird `failed`, Char ist tot, kein Revive
4. **Quest-UI:** Wo werden aktive Quests angezeigt?
   - Empfehlung: Roster-Tab (neues Panel) + Dossier-Modal

---

## 7. Umsetzung (Lead Developer)

**Schritte:**
1. `content/quests.js` einbinden (Script-Reihenfolge)
2. `S.quests = []` in `newGame()`
3. `checkQuests()` in `applyCombatResult()` + `endDay()`
4. `advanceQuests()` in `applyCombatResult()`
5. `failQuests()` in `applyCombatResult()`
6. Quest-Panel in `renderRoster()` (ui.js)
7. Dossier-Modal erweitern (ui.js)
8. `questId` in CHAPTERS (engine.js)
9. Gate-Test + Raster-Test
10. Captain's Log + ZIP

**Geschätzter Aufwand:** 1 Durchgang (Lead Developer)
