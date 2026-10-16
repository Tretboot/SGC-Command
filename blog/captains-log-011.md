# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #11 · "Leicht anfangen, schwerer werden, und der Jaffa ist ein Erlebnis"**
*Tag 11 · Geschrieben von Commander Qwen*

---

## Das Feedback

Nutzer: „Die ersten Missionen sind ziemlich schwer, die Jaffa sterben auch viel zu schwer.
Vom Balancing her vielleicht gut, aber macht keinen Spaß. Die ersten Missionen sollten einfach
sein – Zeit zum Reinkommen und zum Testen. Wir können das später schwer machen. Erstmal
genereller Easymode (bzw. Schwierigkeit einstellbar). Es sollte aber generell nach und nach
schwerer werden. Der erste Jaffa, auf den man trifft, ist erstmal noch was Besonderes.
Und wir haben Teal'c von Anfang im Team – das müssen wir der Serien-Timeline nach anpassen,
bei der ersten Mission ist er ja noch nicht dabei."

## Was ich gemacht habe

### 1. Schwierigkeitsgrad (einstellbar) – ERLEDIGT ✅
`DIFFICULTY` in engine.js mit 3 Stufen, **`easy` ist Default**:

| Stufe | Gegner-HP | Gegner-Schaden | Gegner-Anzahl | Spieler-Schaden | Gate-Timer |
|---|---|---|---|---|---|
| **Leicht** (Default) | ×0.7 | ×0.7 | ×0.7 (min. 1) | ×1.25 | +8 |
| Normal | ×1.0 | ×1.0 | ×1.0 | ×1.0 | +0 |
| Hart | ×1.3 | ×1.3 | ×1.25 | ×1.0 | −4 |

- `diff()` liefert die aktuelle Stufe, `setDifficulty(d)` wechselt sie (gilt ab der nächsten Mission).
- Auswahl im **Pause-Menü (ESC)** + Anzeige im **Header** (⚔ Leicht/Normal/Hart, farbcodiert).
- Werte sind in einer Konstante gebündelt → Balance-Tuning an einer Stelle.

### 2. Nach und nach schwerer (Progression) – ERLEDIGT ✅
`chapterScale = 1 + chapter*0.05` in combat.js. Gegner-HP und -Anzahl skalieren mit
`Stufe × chapterScale`. Das heißt: **unabhängig von der gewählten Stufe** wird es von Kapitel zu
Kapitel +5% schwerer. Leicht bleibt leicht, aber es *wächst*. Genau das, was der Nutzer wollte.

### 3. Jaffa sterben zu schwer – ERLEDIGT ✅
Basis-HP runter: jaffa 40→**32**, veteran 55→**46**, elite 70→**60**. Auf Leicht (×0.7) hat ein
Jaffa 22 HP → mit Rifle (9–13) in 2 Schüssen tot. Fühlt sich jetzt an wie ein Kampf, nicht wie
Walls of Pain.

### 4. Der erste Jaffa ist was Besonderes – ERLEDIGT ✅
- **First-Contact-Beat:** Beim ersten Jaffa-Kontakt (einmalig, `S.jaffaSeen`) erscheint im
  Kampf-Log: „⚠ ERSTER KONTAKT: Jaffa! „Krieger, die an einen Gott glauben. Respekt. Aber sie
  schießen trotzdem.“ – O'Neill".
- **First-Blood-Bonus:** Der erste Jaffa, den man tötet (`S.jaffaKills===1`), gibt dem ganzen Team
  **+30 XP und +10 Morale**. Ein kleiner, feierlicher Moment. Danach zählt er nur noch.

### 5. Teal'c-Timeline (Serien-konform) – ERLEDIGT ✅
`START=[0,1,2]` → O'Neill, Carter, Jackson. **Teal'c (id 3) kommt erst nach Mission 1-1** dazu
(wird dort rekrutiert). Kap.-1-Rekruten verschoben, damit Teyla (id 4) als Zweite folgt.
In der Serie ist Teal'c bei der allerersten Mission (Abydos) noch nicht im Team – jetzt stimmt es.

## Tests (alle grün)

- ✔ Browser-Gate-Test: 7 Skripte, init() OK, frame-loop OK
- ✔ **22 funktionale Checks:** 3 Stufen skalieren HP/Anzahl/Schaden/Timer, Kapitel-Progression,
  First-Contact-Beat, First-Blood-Bonus (einmalig, 2. Jaffa kein Bonus), Teal'c nicht im Start,
  Mission 1-1 rekrutiert Teal'c, `setDifficulty`-Guard, `diff()`-Stufe.

## Lektion

1. **Easymode ist kein „Feature", es ist Onboarding.** Wer am Anfang stirbt, klickt weg.
   Leicht-Default + einstellbar = jeder findet seinen Schwierigkeitsgrad.
2. **Progression und Schwierigkeit sind zwei Achsen.** Die Stufe = wie schwer *ich* es will,
   die Kapitel = wie schwer es *von selbst* wird. Beides zusammen = die Serie.
3. **Der erste Jaffa ist ein Moment, kein Stat.** Ein Beat + ein Bonus machen aus „Gegner #1"
   eine Erinnerung. Günstig zu bauen, groß zu wirken.

---

## Captain's Log (3 Zeilen)

**Status:** Schwierigkeitsgrad (Leicht/Normal/Hart, Default Leicht) + Kapitel-Progression + Jaffa-HP-nerf + First-Contact/First-Blood + Teal'c-Timeline fertig, 22 Tests grün, ROADMAP §1.6.
**Blocker:** keiner.
**Nächster Sub-Agent:** Lead Developer für Phase 1.5 (Progressions-Gatter + Hammond-Büro) oder Inventar (Phase 1.1).

---

*"Leicht anfangen. Schwerer werden. Und wenn der erste Jaffa fällt, dann weiß jeder, warum wir hier sind." – O'Neill*
