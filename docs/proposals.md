# Proposals (open)

AI proposals waiting for your call or a spec. **At most three open at a time.** Each names the milestone it serves,
gives options with an AI lean, and asks at most three questions. When you decide, your call goes to
[decisions.md](decisions.md) (and [vision.md](vision.md)), and the proposal leaves this file. Anything without a
milestone goes to [ideas.md](ideas.md) as one line.

Numbers continue from P35. P1–P33 in full are archived (`_archive/2026-11-01/systems.md`, reads blocked). Only the
open parts needed for M1 are kept here; the rest is parked in ideas.md.

(P36–P40 were decided 3 Nov, except P38's garden question: see decisions.md. P41 went to the toy: see decisions.md. P42's timing is open. P43 was decided 3 Nov.)
P44 (the run's core play) opened 3 Nov after playtest 04.

## P38 left open: the garden
(From P37.) May one good line take most of a row? (a) replicator growth, newcomers earn ground in S-curves ·
(b) winner takes a patch · (c) keep score³ shares with crowding. **Lean: (a)**, and split the lava row.




## P42 left open: when to switch the stack
(a) stays for now (decided 3 Nov). Steam and phones don't need Godot: web idle games ship there as wrapped web
apps (Cookie Clicker on Steam, Melvor Idle on Steam and phones). Godot pays for stable 3D and engine tools.
Measured: `src` is about 3,200 lines today (sim 1,870, view and UI 1,050); a port means the sim rewritten in
GDScript and every view and menu rebuilt, and it grows with each milestone.
- **(a) At the end of M1**, once its done-when passes (the loop is fun, the rules settle), after a 1–2 session
  Godot spike: the look toy's scene and the island in Godot, judged on stability, look and how well AI work goes.
- **(b) Now**, before the stand: the least code to port, but the run's core is still changing.
- **(c) Never:** stay web, wrap it for Steam (Tauri or Electron) and phones (Capacitor).
- **Lean: (a).** Until then keep the sim free of the DOM and the numbers in `src/data`, so a port stays mechanical.

## P44: the run's core play (M1)
(From [playtest 04](playtests/04-stand.md), updated with your ideas the same day.) Measured: a herb sapling grows
about 1,700 parts in year 1 whether you click or not, so a click nudges one tip among hundreds; the one real choice
(the founder) comes once a year.
- **(a) Turn-based growth on the plot:** the plot's cells are the board, one plant; each turn it earns growth from
  its light and soil and you place parts next to it. Shade and hidden pockets are the puzzle.
- **(b) A patch strategy map** (settler-like, individuals visible): the line spreads over a patch against natives.
  A whole game of its own; it fits as the garden's zoom layer, and v1 had one.
- **(c) Organs, not twigs:** c1 a body builder: place organ pieces (shapes, adjacency rules) on a body grid, stats
  calculated, release it · c2 balancing: each organ makes or costs energy, water, nutrient; an unbalanced body
  wilts · c3 the live run with a few big organs and pause.
- **Lean: (a) + c1 + c2 as one toy.** Each turn you draft an organ piece from your line's genes and place it on the
  growing plant on the plot; light, shade and soil set what it makes; the balance is the score; after a season the
  body is released with its stats. Solo, with one encounter per season (a drought, a grazer, a rival vine) checked
  against the body. New genes and the tree's specials are new pieces. (b) and battles later.

Questions: 1. Toy this hybrid next? 2. Pause slice 03 part 1b until it answers? 3. The final game's layers (island
→ patch → body) drafted now, or after the toy (lean: after)?
