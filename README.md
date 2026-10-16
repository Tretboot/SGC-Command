> **Legal notice:** This is a strictly non-commercial fan project. Stargate is a registered trademark of MGM Studios / Amazon. No copyright infringement intended. This project is unofficial and is not affiliated with, endorsed by, or sponsored by MGM Studios, Amazon, or any Stargate rights holder.
>
> **License scope:** The MIT License in this repository applies only to the original program code identified in [LICENSE](LICENSE). It does not grant any rights to Stargate, its universe, names, characters, settings, story elements, dialogue, trademarks, or any artwork, audio, screenshots, or other non-code material. Rights to third-party materials remain with their respective owners.

# SGC Command

An experimental, non-commercial fan-made tactical strategy game prototype. Manage a remote base, assemble a team, and take turn-based missions through the Stargate.

The project is a browser game built with plain HTML, CSS, and JavaScript. It has no build step and requires no package installation.

## Play

Use a local web server to serve the `game` folder:

```powershell
python -m http.server 8080 --directory game
```

Then open <http://localhost:8080> in a modern browser. If `python` is not available, try `py -m http.server 8080 --directory game`.

The game saves progress in the browser's `localStorage`. Use the in-game reset controls to start over.

## Features

- Base management, staffing, research, and campaign progression
- Turn-based tactical combat with terrain, cover, action points, and extraction
- Story briefings, field dialogue, and a skippable procedural Stargate opening
- Procedurally rendered maps, characters, terrain, and sound effects
- German-language interface and campaign content

## Project layout

| Path | Purpose |
|---|---|
| [`game/`](game/) | Playable browser game |
| [`game/README.md`](game/README.md) | Game instructions and mechanics |
| [`content/`](content/) | Campaign flavor, quests, and mission scenes |
| [`blog/`](blog/) | Development logs and selected screenshots |
| [`wiki/`](wiki/) | In-project reference pages |
| [`ROADMAP.md`](ROADMAP.md) | Development priorities |
| [`INVENTAR-SPEC.md`](INVENTAR-SPEC.md) | Equipment-system design |

## Contributing

Bug reports and code contributions are welcome. Keep changes focused, test the game in a browser, and document any new third-party dependencies or assets with their source and license.

Before redistributing or publicly hosting the project, review all non-code content and confirm that its use is permitted. The code license below is not a substitute for permissions from the owners of Stargate or other third-party material.

## License

The original program code is licensed under the MIT License; see [LICENSE](LICENSE). This license is limited to that code and does not grant rights to any Stargate intellectual property or to artwork, audio, story text, dialogue, screenshots, or other non-code material included in or associated with the project. Third-party material is not relicensed by this repository.
