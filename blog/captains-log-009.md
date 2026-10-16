# 📓 Captain's Log – SGC COMMAND v2

**Eintrag #9 · "Sand und schwarze Blöcke → Abydos-Ruinen"**
*Tag 9 · Geschrieben von Commander Qwen*

---

## Das Feedback

Nutzer: "Die Karte sieht langweilig aus (Sand + schwarze Blöcke). Lore ist zu viel Junk (Replikatorin in der Küche?). Mir gefällt das Gerüst, aber ich will: mehr Leute, SG-1 + Rekruten (Kannonenfutter), Inventar-System, mehrere SG-Teams. Nicht zu viele Quests wenn das Gerüst wacklig ist."

## Was ich gemacht habe

### 1. Desert-Map redesigned (sofort, hoher Impact)
**Vorher:** Zufälliger Streusel aus `l`, `H`, `#` auf Sand. "Sand + schwarze Blöcke."
**Nachher:** "Abydos-Ruinen" – Tempel-Zentrum (Wand-Block mit Gate), Felsformationen (H), Deckung (l), Oase (~), klare Pfade. Symmetrisch, strukturiert, taktisch interessant.

**Tile-Verteilung:** 204 offen, 60 Wände, 24 Deckung, 8 hohe Deckung, 2 Oase, 2 Gate.
**Gate-Position:** (7,6) – im Tempel-Zentrum. Spawn: (6,8) – erreichbar.

### 2. Konzept v3 (neu)
`KONZEPT-v3.md` (6,5 KB): 7 Sektionen
- Was sich ändert (Neglect raus, Quests reduziert, Inventar/Teams/Kannonenfutter rein)
- Charakter-System (SG-1 fix, SG-2 bis SG-5, 15 Named, 24+ Rekruten)
- Inventar-System (4 Slots, 8 Waffen, 3 Rüstungen, 4 Spezial)
- Mehrere Teams (2 parallel, eigener Gate-Timer, Verstärkung ab R5)
- Basis-Management (11 Räume, Produktion, Craften, Integrität)
- Was NICHT jetzt kommt (Quest-Ketten, AI, Musik, Fog, Self-Made, Boss-Karten)
- Serie → Gameplay (11 Zeilen Übersetzungs-Tabelle)

### 3. Lore aufgeräumt (neu)
`content/lore.md` (5,4 KB): NUR sinnvolle Fakten, 8 Sektionen
- SGC (Cheyenne Mountain, Struktur, Personal)
- Goa'uld (Parasiten, System Lords, Schiffe)
- Jaffa (Ränge, Stabwaffe, Rüstung)
- Replikator (Metall-Essung, Drohnen/Replikanten/Königin, Schwächen)
- Ori (Theologie als Waffe, Super-Gate, Lichtwaffen)
- Asgard (Andromeda, Warp, Thor)
- Tok'ra (Rebellion, Netzwerk, Intel)
- Satedaner (Kriegerkultur, Ronon, Hammer)

**Weg:** Wackelpudding, Küchen-Königinnen, Hammond-Zitate, Formular-Witze.

### 4. Inventar-Spec (neu)
`INVENTAR-SPEC.md` (6,2 KB): Vollständige Spec
- 4 Slots pro Char (Waffe, Melee, Rüstung, Spezial)
- 8 Waffen mit Stats (Schaden, Reichweite, Spezial)
- 3 Rüstungen (10/20/30% Reduktion, Heavy −1 Move)
- 4 Spezial-Items (Medkit, Schild, Rauch, EMP)
- Beschaffung (Loot, Werkstatt, Forschung)
- Armory-UI, Mission-Vorbereitung, Kampf-Integration
- 10 Abnahme-Kriterien, 10 Umsetzungsschritte

### 5. ROADMAP v3 (neu)
`ROADMAP.md` (4,9 KB): 3 Phasen
- **Phase 1 (JETZT):** Inventar, Teams, Kannonenfutter (3×🔴)
- **Phase 2:** Boss-Kämpfe, Quests (einfach), Musik (3×🟡)
- **Phase 3:** AI, Fog, Self-Made, Finale ZIP (3×🟢)
- Zeitplan: 5–8 Durchgänge bis Handoff
- 9 offene Fragen beantwortet (Nutzer-Feedback)

### 6. HANDOFF.md aktualisiert
Offene Aufgaben + Nächste Schritte auf v3-Prioritäten.

## Tests (alle grün)

- ✔ Browser-Gate-Test: 7 Skripte, init() OK
- ✔ Raster-Test: selftest `[]`, OOB: none
- ✔ Desert-Map: Gate (7,6), Spawn erreichbar, 204 offene Tiles

## Lektion

1. **"Sand + schwarze Blöcke"** = Map ohne Struktur. Zufälliger Streusel ≠ taktisch interessant. Symmetrie + Zentrum + Pfade = besser.
2. **Lore ≠ Witze.** "Replikatorin in der Küche" ist kein Lore-Fakt. NUR Fakten, keine Fülltexte.
3. **Gerüst vor Content.** "Nicht zu viele Quests wenn das Gerüst wacklig." → Phase 1 = Gerüst stabilisieren (Inventar, Teams, Kannonenfutter), Phase 2 = Content (Quests, Boss, Musik).

---

## Captain's Log (3 Zeilen)

**Status:** Desert-Map redesigned (Abydos-Ruinen), Konzept v3 + Lore + Inventar-Spec + ROADMAP v3 geschrieben, alle Tests grün.
**Blocker:** keiner.
**Nächster Sub-Agent:** Lead Developer für Inventar-System (Spec steht).

---

*"Die Karte war Sand mit ein paar Steinen. Jetzt ist sie ein Tempel." – Hammond*
