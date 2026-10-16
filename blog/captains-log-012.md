# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #12 · "One-Way-Gate: rein ist leicht, rauswählen ist Arbeit"**
*Tag 12 · Geschrieben von Commander Qwen*

---

## Das Feedback

Nutzer: „Die 38 Minuten sind eine gute Referenz, aber nicht unbedingt für die Mission.
Die Runden könnten so lange laufen, bis die Mission fertig ist – oder man durchs Gate zurückkommt.
Das stört mich auch: Sie kommen durch das Gate, aber durch das gleiche zurück geht nicht (Lore:
One-Way). Man muss also wieder rauswählen. Also: Mission endet, wenn alle Gegner besiegt sind,
oder man zurück zum Tor kommt. Und ich hab auf den Planeten noch kein Tor gesehen, wo ich
gespawnt bin – da muss man doch erstmal aus einem Tor kommen. Aber das wird später noch sehr
viel mehr gepolished."

## Was ich gemacht habe

### 1. Gate-Timer als Fail raus – ERLEDIGT ✅
`C.gateTimer` und das `stranded`-Ergebnis sind **komplett weg**. Runden laufen jetzt, bis die
Mission fertig ist. Keine Zeit-Begrenzung, kein "Stranded bei 0". Die 38 Minuten bleiben als
Lore-Referenz (Mission "38 Minuten" in Kap. 1), steuern aber nichts mehr.

### 2. One-Way-Gate (Lore-konform) – ERLEDIGT ✅
In der Serie: ein Wurmloch ist eine **Einbahnstraße**. Ihr kommt durchs Gate auf den Planeten –
zum Zurückkehren müsst ihr das Gate **neu wählen**.
- `extract()` = "Gate neu wählen". Funktioniert **nur**, wenn das ganze (überlebende) Team in
  Gate-Nähe (Chebyshev ≤2) steht.
- Button **"🌀 Extrahieren (50%)"** im Combat-Panel – erscheint nur, wenn `gateReady()` grün ist.
- HUD zeigt oben rechts: **"🌀 Gate: n/m bereit"** (grün, wenn alle da).

### 3. Gate sichtbar + Spawn am Tor – ERLEDIGT ✅
Nutzer: "Ich hab auf den Planeten kein Tor gesehen, wo ich gespawnt bin."
- **Pulsierender Portal-Ring + "GATE"-Label** am Spawn-Punkt – man sieht sofort, wo man herkommt.
- **Team spawnt in den freien Tiles direkt am Gate** (Radius 2, ohne Kollision) – kommt sichtbar
  aus dem Tor. Damit steht das Team am Start "am Gate" und kann bei Bedarf sofort extrahieren.

### 4. Mission-Ende (zwei Ausgänge) – ERLEDIGT ✅
- **Sieg** = alle Gegner besiegt → **100% Beute** + volle XP.
- **Extraktion** = ganzes Team am Gate → **50% Beute** (+10% mit G1) + halbe XP.
- **Beides schließt die Mission ab** (`S.done`) – man kann also auch "abstauben" und weiterziehen.
- Niederlage (alle down) bleibt: −10 Integrität, Mission offen.

### 5. G1-Tech repurposed – ERLEDIGT ✅
"Gate-Stabilisierer" hieß "Gate-Timer +5" – das gibt's nicht mehr. Jetzt: **"Extraktion-Beute
+10%"** (50% → 60%). Carter-Talent von "Gate-Timer +3" auf "Gate-Genius: Extraktion-Beute +10%"
angepasst.

## Tests (alle grün)

- ✔ Browser-Gate-Test: 7 Skripte, init() OK, frame-loop OK
- ✔ **14 funktionale Checks:** kein `gateTimer`/`stranded`, Team spawnt am Gate (3/3 bereit),
  `extract()` nur bei vollem Team, blockiert bei 2/3, Sieg = 100% Beute, Extraktion = 50%,
  G1 = 60%, beides schließt Mission ab, kein stranded nach 50 Runden.

## Lektion

1. **Eine Ticking Clock ist nur gut, wenn sie zum Thema passt.** "38 Minuten" ist ein cooler
   Lore-Beat, aber als Fail-Bedingung frustrierend. Besser: die Mission endet, wenn *du* sagst,
   dass sie fertig ist (Sieg) oder du abziehst (Extraktion).
2. **Lore-Mechanik = Gameplay.** One-Way-Gate ist in der Serie ein Fakt – daraus wird eine
   Mechanik: "rauswählen" ist eine bewusste Entscheidung mit Kosten (50% Beute). Das macht
   Extraktion zu einem echten Trade-off statt zu einer Strafe.
3. **Spawn muss zum Setting passen.** "Man muss erstmal aus einem Tor kommen" – also spawnt man
   am Tor, und das Tor ist sichtbar. Kleine Sache, großer Immersions-Gewinn.

---

## Captain's Log (3 Zeilen)

**Status:** One-Way-Gate + Mission-Ende (Sieg/Extraktion) fertig, Gate-Timer/stranded raus, Gate sichtbar + Spawn am Tor, G1 repurposed, 14 Tests grün, ROADMAP §1.7.
**Blocker:** keiner.
**Nächster Sub-Agent:** Lead Developer für Phase 1.5 (Progressions-Gatter + Hammond-Büro) oder Inventar (Phase 1.1).

---

*"Rein ist leicht. Rauswählen ist Arbeit. Und ja, die 38 Minuten waren eine gute Referenz – aber wir lassen die Leute jetzt in Ruhe kämpfen." – O'Neill*
