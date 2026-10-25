> **Legal notice:** This is a strictly non-commercial fan project. Stargate is a registered trademark of MGM Studios / Amazon. No copyright infringement intended. This project is unofficial and is not affiliated with, endorsed by, or sponsored by MGM Studios, Amazon, or any Stargate rights holder.
>
> **License scope:** The AGPL-3.0-or-later license in this repository applies to the program code identified in [LICENSE](LICENSE). It does not grant any rights to Stargate, its universe, names, characters, settings, story elements, dialogue, trademarks, or any artwork, audio, screenshots, or other non-code material. Rights to third-party materials remain with their respective owners.

### SGC Command v0.29 ("Studien-Revision & Final Release")

An experimental, non-commercial fan-made tactical strategy game prototype. Manage a remote base, assemble a team, build offworld colonies, and take turn-based missions through the Stargate — backed by a high-octane algorithmic Strudel live-coding sound engine.

The project is a browser game built with plain HTML, CSS, and JavaScript. It has no build step and requires no package installation.

## Play

Open [`game/index.html`](game/index.html) directly in a modern browser. No server is required to play:

```text
Open game/index.html
```

The game loads its scripts and styles from neighboring project folders. If your browser restricts local files or you want more reliable save storage across sessions, an optional local server can serve the `game` folder:

```powershell
python -m http.server 8080 --directory game
```

Then open <http://localhost:8080> in a modern browser. If `python` is not available, try `py -m http.server 8080 --directory game`.

The opening cinematic plays on a fresh game and can be replayed from the pause menu. Browsers may require a user gesture before audio can start; use the **Ton aktivieren** control during the intro to enable its soundtrack without skipping it. The game saves progress in the browser's `localStorage`; file-based browser storage behavior can vary by browser. Use the in-game reset controls to start over.

## Play & Web Hub

You can open the unified Web Hub [`index.html`](index.html) (or [`hub.html`](hub.html)) or directly launch [`game/index.html`](game/index.html) in any modern browser. No build step or server is required:

```text
Open index.html (or hub.html)
```

The Web Hub provides an integrated suite combining:
1. **Interactive Game Player:** Full-featured embedded view of *SGC Command v0.29*.
2. **SGC Wiki & Lore Database:** Lore, planet telemetry, weapons, SG-teams, and colony structures.
3. **Captain's Log Archive:** Multi-agent development logs ([Log 029](blog/captains-log-029.md), [Log 028](blog/captains-log-028.md), [Log 027](blog/captains-log-027.md), [Log 026](blog/captains-log-026.md), [Log 025](blog/captains-log-025.md), [Log 024](blog/captains-log-024.md)).
4. **Über & Labor:** Integrated sub-portal combining the SGC Tactical Level Editor ([`tools/leveleditor.html`](tools/leveleditor.html)), Strudel & Winamp Sound Lab, academic research notes, and clean offline release downloads (`SGC-Command-v029.zip`).

If an optional local HTTP server is preferred:

```powershell
python -m http.server 8080
```
Then navigate to <http://localhost:8080>.

## Academic AI Study (Universität Osnabrück)

This project originated as an experimental study testing autonomous AI pair-programming and collaborative multi-model architecture at **Universität Osnabrück** (Cognitive Science & Computer Science). 

The codebase was iteratively designed, implemented, and refined across five distinct model layers:
* **Shift 1 (Gemini 4 Argon):** Initial mathematical foundation of 2:1 isometric voxel projections, ray-to-diamond picking, CP437 ASCII rasterization, and initial engine scaffolding.
* **Shift 2 (Claude 5.5 / 3.5 Sonnet):** Engine stabilization, procedural WebAudio sample bank synthesis, inventory and crafting systems, and Hammond's clipboard personal management.
* **Shift 3 (Gemini 3.8 Flash):** Standard-MIDI file parser, Krumhansl-Schmuckler key detector, Stargate Theme × Switch Angel Live-Coding Remixes, procedural campaign song generator (`SONGGEN`), persistent planetary colonies (`S.colonies`), audio-reactive battlefield dance (`ISO.beatPulse`), Gamepad API dual-rumble haptics, keyboard remapping modal, and unified web hub.
* **Shift 4 (Claude Opus 5.5 Medium, v0.25-v0.28):** Infirmary (level 21, Dr. Janet Fraiser & Carolyn Lam) with five treatment paths and a closed healing loop, tactical downed-evacuation and emergency withdrawal, SGC incident & crisis system (`SGC_INCIDENTS`), and the SGC Tactical Level Editor.
* **Shift 5 (Qwen 3.8 27b, university-hosted via virtUOS Kiwi, current, v0.29):** Final study revision in English (CogSci), authorship correction (obelisk.js to Max Huang), documentation consistency across all model layers, and final release packaging.

For full methodology, metrics, and findings, see [`blog/uni-osnabrueck-ai-study.md`](blog/uni-osnabrueck-ai-study.md).

## Reference and inspiration

The base cutaway takes broad organizational inspiration from the [Cheyenne Mountain Complex reference](https://www.rdanderson.com/stargate/cheyenne/index.htm): a layered view of the facility and its levels.
The isometric voxel & 3D-ASCII dual renderer (`game/iso.js`) takes technical inspiration from [`nosir/obelisk.js`](https://github.com/nosir/obelisk.js) (MIT) and [`Tretboot/asciiid`](https://github.com/Tretboot/asciiid) / [`msokalski/asciicker`](https://github.com/msokalski/asciicker) (MIT); see [`references/LICENSE-AUDIT.md`](references/LICENSE-AUDIT.md).
Live coding and procedural audio synthesis are powered by [`@strudel/web`](https://codeberg.org/uzu/strudel) (AGPL-3.0-or-later) and inspired by [Switch Angel](https://github.com/switchangel) live-coding arrangements.

## Features

- **Dual-Mode Isometric Voxel & 3D-ASCII Engine (`game/iso.js`):**
  - **Pixel-Voxel Mode (`2:1` Isometric Projection):** 3D voxel terrain columns, cliffs, bridges, 3D Stargate, and multi-story Syndicate / SimCity-style city blocks with 4-way camera rotation (`Q`/`E`).
  - **ASCII-3D Mode (`asciiid` / `asciicker` inspired):** Live-switchable at any time via menu (`ESC`), header button (`🖥 PIXEL` / `⌨ ASCII`), or hotkey **`V`** — both modes are 100% playable!
- **Winamp-Style Retro Audio Player (`SGC-AMP v2.80`) & ReBirth-338 Live Studio (`game/ui.js`, `game/sound.js`):**
  - Nostalgic dark-titanium bevel chassis with glowing green phosphor LCD matrix (marquee title, elapsed time, BPM/CPS).
  - Unambiguous glowing LED status badges: `[ ▶ PLAYING ]` (pulsing green), `[ ⏸ PAUSED ]` (amber), `[ ⏹ STOPPED ]` (red).
  - Real-time HTML5 canvas oscilloscope waveform & 28-band spectrum visualizer powered directly by WebAudio `AnalyserNode`.
  - Classic transport controls (`|<<`, `PLAY`, `PAUSE`, `STOP`, `>>|`), volume slider, track search filter, and tabbed playlist.
- **Strudel.cc Live Code Interface (Front and Center):**
  - Prominently positioned directly under the Winamp deck as the central creative workstation.
  - Real-time **Voice Activity Monitor**: glowing neon badges (`$KICK`, `$HAT`, `$SNARE`, `$BASS`, `$MELODY`) that flash synchronously with note triggers.
  - **16-Step ReBirth Sequencer Running Light**: LED indicators sweeping in lockstep across the 16-step grid.
  - Visual transient pulse: editor border and background glow on heavy transients and beats.
  - Live execution via **`Ctrl+Enter`** / **`Cmd+Enter`**, Stop, algorithmic Mutation (`🧬`), and persistent save (`💾`).
- **ReBirth RB-338 Synthesizer & Drum Rack with Roland Soundbanks:**
  - **TB-303 Acid Bass Section:** 1-click soundbank selectors (`303 Saw`, `303 Sq`, `SH-101`, `Sub`, `Slap`, `8-Bit`, `Reese`) and analog-style sliders with real-time readouts for **Cutoff**, **Resonance**, **Env Mod**, **Decay**, **Distortion** (WaveShaper overdrive), and **Tune**.
  - **Roland TR Drum Section:** 1-click soundbank selectors for **Kick** (`TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Acoustic`, `Acid`) and **Hi-Hat** (`TR-909`, `TR-808`, `TR-707`, `LinnDrum`, `8-Bit`, `Noise Sweep`). Continuous sliders for **BD Tune**, **BD Decay**, **Hat Decay**, and **Tempo (BPM)**.
  - **Hot-Patch to Code (`[ ✍ SOUNDBANKS ANWENDEN ]`):** Immediately transforms drum and synth patterns in the editor text to match selected soundbanks.
- **Automatic 8-Bit Chiptune Sound Engine:**
  - Automatically activates whenever switching to ASCII-3D mode (`S.gfxMode === 'ascii'`).
  - Pure square-wave synthesis, lifted filter frequencies, and 40Hz NES-style arpeggio flutter for sustained notes.
  - Manual toggle button `[ 👾 8-Bit: AN/AUS ]` in the SGC-AMP player for playing chiptunes in any graphics mode.
- **Stargate MIDI Direct & Hybrid Strudel Instruments (`game/midi.js`):**
  - Standard MIDI bridge decoding the iconic Stargate Main Theme (165 BPM, G Major) into 16-step measures.
  - Dedicated lightweight Strudel voices: French Horn / Trumpet fanfare (`$MELODY`), driving electric bass (`$BASS`), power brass harmony (`$HARMONY`), and orchestral timpani/kit (`$DRUMS`).
  - **🪖 Stargate × C&C Hell March Industrial Remix (`theme_remix_cnc`):** 132 BPM, Frank-Klepacki-style industrial cyber-metal with distorted TB-303/saw guitar chug, driving Roland TR-909 kick, and cutting brass fanfares for combat and boss battles.
  - **☕ Stargate × Midnight Lo-Fi Chillhop Remix (`theme_remix_lofi`):** 84 BPM, mellow tape-saturated Rhodes electric piano, warm sub-bass, vinyl dust crackle, and lazy swing groove for base management and offworld colony construction.
  - **🌊 Stargate Atlantis Main Theme (`theme_atlantis`):** 112 BPM, heroic French Horn fanfare, 12/8 rolling orchestral strings, noble double-bass, and ethereal Pegasus choir.
  - **🛸 Asgard & Thor Theme (`theme_asgard`):** 72 BPM in D minor, ancient mystical flute motif, shimmering crystal teleport beam harmonics, and deep hypnotic drone.
  - **🕊 Fallen Heroes Memorial Theme (`theme_funeral`):** 58 BPM in A minor, mournful solo horn, chamber strings, muffled military snare, and solitary cemetery bell.
  - **🎖 Medal of Valor Promotion Fanfare (`theme_promotion`):** 128 BPM in C major, triumphant brass clarion call, military parade snare rolls, and regal orchestra hits.
  - **🎖 Stargate SG-1 Outro & End Credits Fanfare (`theme_outro` & `theme_outro_ambient`):** 134 BPM Joel Goldsmith / David Arnold credits fanfare with 16th-note string ostinato, brass lead, and marching timpani.
  - 4 additional hybrid blends combining Stargate fanfares with live-coding techniques (Patreon Codevault Blends 1–4).
- **Live-Coding Codevault Collection (`game/switch-angel.js`):**
  - 20 integrated experimental live-coding patterns adapted from Switch Angel's public Patreon codevault (including `extra_slippy`, `Lets_Talk`, `MUTEK4am`, `did_i_make_this`, and `AUTOTOMATONE`) fully stabilized via AST/regex normalization and defensive prototype patching.
  - *Clarification:* These are community live-coding patterns adapted from the Patreon codevault for research and benchmarking purposes, not official commissioned remixes.
- **Public Domain NASA Space Imagery (`references/NASA-ASSETS.md`):**
  - Curated collection of high-resolution, public domain (PD-USGov / CC0) imagery from NASA, JPL, Hubble, and James Webb for Abydos sand dunes, exoplanet vistas, Carina Nebula deep fields, and icy moons.
- **Procedural Mission Song Generator (`SONGGEN`):**
  - Dynamically synthesizes unique soundtracks based on campaign day, planet scale, team members, weapons, and enemy compositions.
- **Persistent Offworld Colonies (Civ / SimCity / Total War Rome Layer):**
  - Establish outposts on discovered planets (`S.colonies`) with upgradable sectors: Naquadah Mines, Ancient Research Labs, Power Reactors, Forcefield Domes, and UAV Hangars.
  - Generates daily resource yields and automated defense checks against hostile Jaffa raids.
- **Audio-Reactive Battlefield Dance & Controller Rumble:**
  - Subtle terrain bounce and CP437 equalizer pulse linked to kick/bass triggers (`ISO.beatPulse`).
  - W3C Gamepad API dual-rumble haptic feedback on weapon shots, explosions, and heavy bass hits.
- **Ergonomics & Controls:**
  - Dedicated **`⏭ Nächstes SG-Mitglied [TAB]`** button and hotkey (`Tab`/`N`) to seamlessly cycle through squad members with camera auto-centering.
  - Interactive **Keybinding Configuration Modal** allowing full custom key remapping with live browser persistence.
- **Base Management & Room Interiors:** 28-level Cheyenne Mountain facility with clickable walk-in room interior views, Armory crafting (`INVENTAR-SPEC.md`), SG-1..SG-5 team assignments, and **Hammond's Clipboard (`📋`)** with switchable SGC Commanders (Hammond, Weir, Landry).

## Project layout

| Path | Purpose |
|---|---|
| [`index.html`](index.html) / [`hub.html`](hub.html) | Unified Web Hub & Portal (Game launcher, Lore Wiki, Captain's Log, Über & Labor) |
| [`game/`](game/) | Playable browser game (`index.html`, `iso.js`, `sound.js`, `midi.js`, `switch-angel.js`, `combat.js`, `engine.js`, `base.js`, `ui.js`) |
| [`game/vendor/strudel-web.js`](game/vendor/strudel-web.js) | Local `@strudel/web@1.3.0` bundle |
| [`blog/captains-log-022.md`](blog/captains-log-022.md) | Development log for v0.22 ("...aber der Soundtrack ist jetzt Fett!", C&C/Lo-Fi remixes, combat UI fix, volume slider fix) |
| [`blog/captains-log-023.md`](blog/captains-log-023.md) | Development log for v0.23 (combat selection during dialogue, intro audio unlock, release cleanup) |
| [`blog/captains-log-029.md`](blog/captains-log-029.md) | Development log for v0.29 (English study revision, authorship correction, final release) |
| [`blog/captains-log-021.md`](blog/captains-log-021.md) | Development log for v0.21 (Winamp Player, Oscilloscope, 8-Bit Chiptune, Switch Angel fixes) |
| [`blog/captains-log-020.md`](blog/captains-log-020.md) | Development log for v0.20 (Voxel Dual-Gfx, Civ Colonies, Strudel Core) |
| [`references/NASA-ASSETS.md`](references/NASA-ASSETS.md) | Catalog of public domain NASA space and planet imagery |
| [`references/`](references/) | Inbox for user feedback and inspiration drops, and [`LICENSE-AUDIT.md`](references/LICENSE-AUDIT.md) |
| [`content/`](content/) | Campaign flavor, quests, and mission scenes |
| [`wiki/`](wiki/) | In-project reference pages and database |
| [`ROADMAP.md`](ROADMAP.md) | Development roadmap & completed phases |
| [`HANDOFF.md`](HANDOFF.md) | Multi-model agent handover documentation |

## Testing

Run the automated headless test suite:

```powershell
node test-browser.js
```

Verifies all components (DOM mocks, 2:1 isometric projection, MIDI parsing, Tonart analysis, dedicated Strudel instruments, Winamp transport & state, ReBirth-338 DSP rack, soundbank hot-patching, 8-Bit chiptune mode, C&C and Lo-Fi remixes, volume gain routing, Switch Angel track compilation, colony state, crafting, special items, and dual-mode rendering) across 209 checks with 0 external dependencies.

## License

The program code in this repository is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**; see [LICENSE](LICENSE). This ensures full license alignment with `@strudel/web` and Switch Angel live-coding prebake components. Integrated third-party components (`obelisk.js`, `asciiid`, `asciicker`) remain subject to their respective MIT licenses. Special thanks to Switch Angel for the pioneering live-coding patterns and tracks.
