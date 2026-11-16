# Slice 08: the stack test

**Milestone:** the fresh start's first step (no new `ROADMAP.md` yet; it comes out of the planning session)
**Question:** which stack lets us make a Life that feels well made, on a phone and in the browser, with a smooth workflow
between you and the AI: Godot 4 or web with PixiJS?
**Builds on:** decisions.md, 5 Nov: a fresh start, rethinking the stack; "a properly well done game thats playable on phones
lateron", no "prototype like style and limitations"; "lean godot, but pixi as alternative"; "i dont trust ai to get the feel
right without help. want smooth workflow."

## In
The same small Life, built twice: `spikes/godot-life/` (Godot 4, GDScript) and `spikes/pixi-life/` (TypeScript, Vite, PixiJS).
Both throwaway; nothing goes into `src/`. One session each.
- **One board:** the mud flats from `toys/life2-habitats.ts`, its nodes and its predator, ported from `toys/life2-sim.ts`
  (move, eat, moult, lay, the predator's hunt, mark, strike and rest). No garden, no parts screen: one fixed starter body.
- **Feel, the point of the test:** the creature glides between tiles with a small squash; eating pops a few particles and the
  stock bar ticks; the predator's mark pulses; the strike shakes the camera; the board pans and pinch-zooms. Pixelify font,
  calm menus.
- **Phone first:** portrait layout, tap to move, buttons big enough for a thumb. It runs in a phone browser; the Godot half
  also gets an Android build if the session can make one.
- **Your hands on the feel:** five feel values (glide time, squash, particle count, shake, zoom speed) that you tune yourself.
  Godot: exported variables in the inspector. Pixi: a small dev panel with sliders. You tweak them and say how it went.
- **Workflow log:** each session notes what was easy, what fought it, and what you had to do by hand
  (`docs/playtests/09-stack-test.md` gets both).

## Out
- Parts, verb slots, the clutch, other habitats, the garden: later slices of the first milestone.
- Art beyond simple shapes and the body doll: the look topic.
- A final save system, app store builds.

## Done when
- [x] Both halves open on your phone (a link) and on desktop; you can play the mud flats to the end in each.
- [x] You picked a stack, logged in `decisions.md`: PixiJS (5 Nov). The Pixi half's values aren't tuned yet.
- [x] Each half has a few tests of the ported rules (Godot: headless with GUT or a plain script; Pixi: vitest).
- [ ] Your notes are in `docs/playtests/09-stack-test.md`.

## Size check
- New systems: none; it ports the Life's rules and adds feel.
- Touches sim structure? No, `src/` is untouched.
- Two sessions, one per half. Godot first, since it's the lean. The Godot session needs the Godot 4 binary in the cloud
  environment (headless export); if it can't get one, it says so and you run the export locally.

## Setup notes for the session
- **Godot in the cloud:** checked 5 Nov that GitHub releases are reachable. Download `Godot_v4.5.1-stable_linux.x86_64.zip` (or the
  latest 4.x stable) from `github.com/godotengine/godot/releases`, unzip into `~/.local/bin`, run with `--headless` for tests and
  `--export-release` for builds. Web and Android exports need the matching export templates (`*_export_templates.tpz`, large);
  install them into `~/.local/share/godot/export_templates/<version>/`. If disk or time runs short, ship the web build only and
  say so.
- **Phone link:** the web build has to be served somewhere you can open on your phone. Simplest: commit the build to the branch
  and say how to run it locally, or publish it as a preview the session can host. Godot's web build needs cross-origin isolation
  headers unless exported single-threaded; export single-threaded.
- **Fresh start:** new folders `spikes/godot-life/` and `spikes/pixi-life/`. Port rules from `toys/life2-sim.ts`, data from
  `toys/life2-data.ts` and `life2-habitats.ts` with R2's corrections (`docs/research/cambrian-world.md`).

## Open questions (three at most)
1. If both feel fine, which wins: the editor (Godot) or the AI's smoother hand (Pixi)? *AI lean:* the one you tuned faster.
2. Does Godot's web build load fast enough on your phone for itch? (The session measures it.)
