# SPEC: MIDI-Out (Stand v0.33 + Ausbau)
Fertig: Noten-Spiegelung (bass/melody), Kanalwahl, Panic, Tipps für TD-3/Volca.
Ausbau: (1) MIDI-Clock 0xF8 (24 ppqn) + Start/Stop (0xFA/0xFC), damit externe Sequencer synchron laufen.
(2) Präzises Timing: `send(msg, timestamp)` mit aus `ctx.currentTime` umgerechnetem `performance.now()`-Zeitpunkt.
(3) MIDI-In → Strudel: eingehende Noten als Live-Melodie aufnehmen und als Pattern-Code ausgeben.
(4) Geräte-Profile (TD-3: Slide/Accent über Velocity/Legato).
