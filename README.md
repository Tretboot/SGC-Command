<!-- 0.36 "Die 808 drückt jetzt": siehe blog/captains-log-036.md und HANDOFF.md -->
> **Legal notice:** This is a strictly non-commercial fan project. Stargate is a registered trademark of MGM Studios / Amazon. No copyright infringement intended. This project is unofficial and is not affiliated with, endorsed by, or sponsored by MGM Studios, Amazon, or any Stargate rights holder.
>
> **License scope:** The AGPL-3.0-or-later license in this repository applies to the program code identified in [LICENSE](LICENSE). It does not grant any rights to Stargate, its universe, names, characters, settings, story elements, dialogue, trademarks, or any artwork, audio, screenshots, or other non-code material. Rights to third-party materials remain with their respective owners.

### SGC Command 0.36 ("Die 808 drückt jetzt")

An experimental, non-commercial fan-made tactical strategy game prototype. Manage the 28 subterranean levels of the Cheyenne Mountain Complex, lead SG teams through the Stargate, establish offworld colonies, research alien technology, and fight turn-based tactical battles — powered by a high-octane algorithmic Strudel live-coding audio engine and Roland TR-808 drum synthesizers.

The project is built entirely with vanilla HTML5, CSS3, and modern JavaScript. It has **zero build steps** and requires **zero package installations** (`node_modules`), maintaining 100% offline portability within a single floppy disk footprint (< 1.44 MB).

---

## 🎵 Live-Coding & The "Low Entry Barrier" Philosophy

At the heart of *SGC Command* is the belief that game audio should not be an inaccessible, pre-rendered black box. In this release, the Strudel live-coding sound engine is placed front and center:

* **Transparent & Visible Code:** The actual algorithmic code generating the drum grooves, acid basslines, and orchestral themes is displayed directly in the retro Winamp/SGC-AMP workstation.
* **Low Entry Barrier (*Niedrige Einstiegshürde*):** You do not need to be an expert audio engineer or a seasoned programmer to make music. By exposing readable mini-notation and providing real-time sliders, anyone can tweak sound parameters on the fly.
* **Algorithmic Mutation (`🧬`):** With a single click on the Mutation button, the underlying Strudel pattern mutates its rhythm and pitch vectors while preserving musical structure. It invites players to be creative, play with code as a creative medium, and build custom remixes tailored to their mission.
* **Hardware WebMIDI Learn:** Plug in any physical MIDI controller (such as an Akai MPK Mini or Novation Launchkey) and turn hardware knobs to tweak resonance, filter cutoff, or tempo live as your squad dials through the gate.

---

## Quick Start / Play

Open [`index.html`](index.html) or [`game/index.html`](game/index.html) directly in any modern web browser. No server, node environment, or build tool is required:

```text
Double-click index.html (or game/index.html)
```

If your browser restricts local file operations or you prefer a local HTTP server:

```powershell
python -m http.server 8080 --directory game
```

Then navigate to <http://localhost:8080> in your browser.

The opening cinematic starts upon first launch and can be replayed anytime via the menu (`ESC`). All campaign progress, customized keybindings, language settings, and window positions are saved locally in the browser's `localStorage`.

---

## Features & Subsystems

### 1. Retro Winamp SGC-AMP & Roland TR-808 Live Studio (`game/sound.js`, `game/ui.js`)
* **SGC-AMP v2.80 Chassis:** Authentic 90s titanium-bevel audio deck with green phosphor LCD display, live WebAudio oscilloscope waveform, and 28-band spectrum visualizer.
* **Compact & Resizable Window:** Starts at a tidy, ergonomic width and features smooth CSS resize handles (`resize: both`) with automatic persistence in `localStorage`.
* **Roland TR-808 Engine:** Dedicated deep kick drum, crisp snare, and snappy hi-hats integrated with a Roland TB-303 acid bassline synthesizer.
* **16-Step Sequencer LEDs & Voice Badges:** Real-time visual feedback with sweeping step lights and neon indicator badges (`$KICK`, `$HAT`, `$SNARE`, `$BASS`, `$MELODY`).
* **DJ Sound Styles & Master FX Pad:** 1-click sound style presets (*Lo-Fi, Industrial Hard, Ambient Chill, Acid 303, Psytrance*) and interactive X/Y filter-delay pad.

### 2. SGC Laboratory & Research Tech Tree (Sub-Level 19)
* **Dedicated Research Window:** Accessible via the top header (`🔬`) or from the Level 19 Laboratory in base view.
* **Four Specialized Branches:**
  * 🌀 **Tor-Technologie (Gate):** Dial buffer optimizations, gate stabilization, and extraction speed.
  * ⚡ **Waffen & Taktik (Weapons):** Stunners, Zat'nik'tel, armor-piercing trinium munitions.
  * 🛡 **Schutzschilde & Panzerung (Shields):** Personal energy shields, squad shields, and Naquadah alloy reinforcements.
  * 🏛 **Antiker & Alien-Wissen (Ancient/Alien):** Crystal databases, healing matrix interfaces, and ZPM power conduits.
* **Mission RP Integration:** Completing tactical missions awards Research Points (+RP) directly to your scientific team.

### 3. SGC Infirmary & Medical Recovery Loop (Sub-Level 21)
* **Dr. Janet Fraiser's Sickbay:** Complete hospital screen on canonical Level 21 managing wounded squad members.
* **Five Distinct Treatment Pathways:** Bed Rest, Standard Medicine, Tretonin, Trauma Surgery, and Goa'uld/Ancient Cellular Regeneration.
* **Tactical Evacuation:** Downed teammates can be physically carried through the open Stargate (`extract()`) or saved via emergency withdrawal.
* **Hospital Crisis Events:** Canonical medical emergencies (viral outbreaks, nanite infections) requiring immediate triage decisions.

### 4. Internationalization & Dual-Language Architecture (DE / EN)
* **Instant 1-Click Toggle:** Switch smoothly between German and English via the header button (`🌐 EN/DE`).
* **100% Comprehensive Coverage:** Every UI label, weapon tooltip, mission brief, tech description, dialogue, and daily debriefing log is localized with zero missing keys.

### 5. Triple-Mode Rendering Engine (`game/iso.js`)
* **Pixel-Voxel Mode:** 2:1 isometric projection with 3D voxel terrain columns, multi-tier city blocks, and 4-way camera rotation (`Q`/`E`).
* **ASCII-3D Mode:** Retro terminal rasterizer inspired by `asciiid` / `asciicker` with automatic 8-Bit chiptune sound mode.
* **Classic 2D Top-Down Mode:** High-contrast tactical overhead view.
* **Cycle Instantly:** Press hotkey **`V`** or click the header button at any time.

### 6. Narrative Integrity & Roster Management
* **Spoiler-Free Roster:** Unrecruited candidate dossiers are hidden from the personnel roster, allowing characters to be discovered organically as NPCs during storyline missions.
* **SG Teams (SG-1 to SG-5):** Assign personnel to specialized exploration and combat teams.
* **Commanders:** Switch between General George Hammond, Dr. Elizabeth Weir, and General Hank Landry, each providing unique base-wide strategic bonuses.

### 7. Rich Canonical Music & Stargate Fanfares
* **Stargate SG-1 Main Theme:** Authentic 165 BPM orchestral arrangement compiled into lightweight Strudel voices.
* **C&C Hell March Industrial Remix:** High-tempo cyber-metal combat track.
* **Midnight Lo-Fi Chillhop Remix:** Warm Rhodes piano and vinyl dust groove for peaceful base building.
* **Stargate Atlantis Theme & Asgard Theme:** Heroic Pegasus galaxy fanfare and ancient mystical flute harmonies.
* **Funeral Memorial & Promotion Fanfares:** Melancholic bugle for fallen heroes and celebratory fanfare for medal recipients.

### 8. Multi-Slot Savegame System & Cookie-Clicker I/O (`game/engine.js`, `game/ui.js`)
* **3 Persistent Slots:** Manage multiple campaigns across Slots 1, 2, and 3 with timestamp, day counter, and commander inspection.
* **Cookie-Clicker Style Base64 Export/Import:** Copy/paste your entire save state as a compact Base64 text string with 1-click clipboard integration.
* **JSON File Backups:** Download and restore `.json` state archives for easy offline backup.
* **Instant Test Presets:** Jump straight into key scenarios without grinding:
  * `fresh`: Day 1 campaign kickoff with General Hammond.
  * `research_lab`: Samantha Carter with Level 19 Lab, 180 RP, and Gate tech unlocked.
  * `medbay_crisis`: Dr. Janet Fraiser triage scenario with wounded soldiers and stocked medicines.
  * `endgame`: General Landry with 9 advanced technologies and colonies on Abydos and Planet Alpha.

### 9. 4×2 Gateroom & Cheyenne Mountain Cutaway (`game/base.js`, `game/engine.js`)
* **Two-Story Gateroom Silo:** Expands to an imposing 4×2 chamber across Level 28 & 27 with concrete blast walls, Naquadah ring, 9 glowing orange chevrons, animated cerulean water event horizon shimmer, and armed SF guards. Clicking opens the Star Map directly.
* **Level 28 Kontrollraum:** Dialing computer with 3 CRT status monitors and Chief Master Sergeant Walter Harriman. Clicking triggers the canonical radio quote (*"Chevron 7 locked!"*).
* **Level 27 Briefing Room:** 8-seat conference table overlooking the gate silo with tactical map projection.
* **Level 28 MALP Staging:** Treaded MALP exploration probes and supply crates.

### 10. Tactical Guard Stance, Auto-Battler & Auto-Resolve (`game/combat.js`, `game/ui.js`)
* **Wache & Reaktionsfeuer (Guard Stance):** SG units can spend remaining AP to assume guard stance (`Key O`), reserving reaction fire for moving enemies and gaining a **+15% defensive evasion bonus** when attacked.
* **In-Combat Auto-Battler:** Toggle `[ 🤖 Auto-Kampf ]` to watch squad members heal with medkits, prioritize enemy targets, flank through cover, or establish overwatch positions autonomously.
* **Mission Auto-Resolve (Schnellkampf mit Prognose):** One-click simulated resolution with squad-vs-enemy win chance forecast (e.g. `78%`) and injury risk display. Includes a -25% loot/XP penalty to reward manual play, with story and boss missions locked out.

---

## Academic AI Study (Universität Osnabrück)

This repository originated as an empirical research case study exploring iterative pair-programming and autonomous multi-agent software engineering at **Universität Osnabrück** (Cognitive Science & Computer Science). 

The codebase was iteratively developed, architected, and debugged across multiple distinct model generations:
1. **Phase 1 (Gemini 4 Argon):** Mathematical foundations of 2:1 isometric projection, ray-to-diamond tile picking, CP437 ASCII rasterization, and core loop.
2. **Phase 2 (Claude 3.5 / 5.5 Sonnet):** Engine stabilization, procedural WebAudio sample bank synthesis, inventory and crafting systems, and Hammond's clipboard personal management.
3. **Phase 3 (Gemini 3.8 Flash):** Standard MIDI parser, Krumhansl-Schmuckler key detector, live-coding remix bridges, procedural mission song generator (`SONGGEN`), persistent colonies, controller rumble, and web hub.
4. **Phase 4 (Qwen 3.8 27b / Qwen 3.5 122b A10B-FP8 / Commander Qwen):** Early project directives, walk animations, documentation audits, repository hygiene, and foundational i18n architectures via virtUOS Kiwi.
5. **Phase 5 (Claude Opus 5.5):** Infirmary (Ebene 21), medical treatment loop, tactical downed-evacuation, SGC incidents, leveleditor, and complete i18n architecture refactoring.
6. **Phase 6 (Gemini 3.8 Flash High - Current):** Window manager refinements, resizable Winamp chassis, research tech tree overhaul with dedicated laboratory modal, 4×2 Gateroom cutaway, Walter Harriman control room, guard stance (+15% evasion), in-combat autobattler, and mission auto-resolve.

For full research notes and documentation, see [`blog/uni-osnabrueck-ai-study.md`](blog/uni-osnabrueck-ai-study.md) and the comprehensive [Captain's Log Series](blog/).

---

## Project Structure

| Directory / File | Description |
|---|---|
| [`index.html`](index.html) / [`hub.html`](hub.html) | Unified Web Hub & Portal (Game launcher, Lore Wiki, Captain's Log archive) |
| [`game/`](game/) | Playable game engine (`index.html`, `engine.js`, `combat.js`, `base.js`, `iso.js`, `sound.js`, `midi.js`, `ui.js`, `window-manager.js`) |
| [`game/i18n.js`](game/i18n.js) & [`game/i18n-game.js`](game/i18n-game.js) | Dual-language internationalization system and string tables (DE / EN) |
| [`game/vendor/strudel-web.js`](game/vendor/strudel-web.js) | Local, standalone `@strudel/web@1.3.0` live-coding audio bundle |
| [`blog/`](blog/) | Complete Captain's Log development archives (001–036) and university study documentation |
| [`tools/leveleditor.html`](tools/leveleditor.html) | Standalone tactical isometric mission and level editor |
| [`wiki/`](wiki/) | SGC lore database, planet telemetry, weapons, and colony specs |
| [`test-browser.js`](test-browser.js) | Comprehensive automated headless browser test suite |

---

## Automated Testing

Run the full automated test suite using Node.js:

```powershell
node test-browser.js
```

All 250+ automated tests run in a headless mock DOM environment without any third-party dependencies, verifying math projections, audio synthesis, MIDI analysis, combat state transitions, hospital recovery, research tree mechanics, autobattler AI, auto-resolve simulations, and bilingual string parity.

---

## License

The code in this repository is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**; see [LICENSE](LICENSE). Integrated third-party components (`obelisk.js`, `asciiid`, `asciicker`) remain subject to their respective MIT licenses. Special thanks to the Strudel live-coding community and Switch Angel for inspiring the algorithmic sound engine.
