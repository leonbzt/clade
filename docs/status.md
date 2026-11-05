# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv` on GitHub (`leonbzt/clade`). The plan: [planning/plan.md](planning/plan.md).

**Milestone:** M1, the first playable sea ([ROADMAP](../ROADMAP.md)). Step 1 (the stack test) is done: **PixiJS**.
Next: steps 2–8 in one long session, [the M1 run](planning/m1-run.md).

## Done (5 Nov)
- **Stack test** (slice 08): both halves built; logs and load numbers in [playtests/09-stack-test.md](playtests/09-stack-test.md).
- **`game/` set up** from the PixiJS half ([game/README.md](../game/README.md)): the mud flats Life, the low-poly look,
  the five feel values in a dev panel, 9 rule tests. `npm run check` covers only `game/` now (4.4 s); the plant code is
  the archive. `npm run look` lets a session see the game and play it with real taps; `npm run build:game` makes the
  one-file itch page (647 KB).
- **The run plan:** [planning/m1-run.md](planning/m1-run.md): slices 09–15 in order, spec first, self-check, push after
  every slice, AI choices listed instead of asked.

## Decided (5 Nov, your words)
- "pixi is good enough stay with this for itch."
- "set up everything so i can start a session that implements as much as possible to hit the free credit limit."
- Earlier today: the Pixi half's look as a free interpretation; Godot "a lot smoother… but the look… rough".

## Next
1. A fresh session, with this prompt:
```
/kickoff the M1 run: follow docs/planning/m1-run.md from slice 09 and build as far as you get. Don't stop to ask.
```
2. Afterwards you play what it built and note it in `docs/playtests/`.

## Open
- The Pixi half's five feel values aren't tuned yet (the Feel button; they carry over into `game/`).
- "More freedom for AI": the run reads it as freedom in the look and the details, inside your decided calls.
- The board turned a quarter (8 × 11) for phones is an AI choice you haven't judged. R2's [K] biology lines still need a check.

## Built, not played
- **09 The Life, for real** ([spec](slices/09-life-for-real.md)): sand shallows (low tide) and volcanic rock (vents, vent
  surge) beside the mud flats; the arthropod drawn; a pick screen; textured ground; a stone-and-brass UI. *Judge:* the
  boards and events, the new palette and textures, the OSRS-like frame.
- **10 Verb slots** ([spec](slices/10-verb-slots.md)): six verbs from parts (Graze, Dash, Dig, Sense, Brace, Crush); pick
  1–3 before a Life (presets Sweeper, Digger, Tank); verb buttons with recharge pips; keys 1–3. *Judge:* verbs cost upkeep
  via their parts; your verbs are your starting body; start food 6; mats regrow after 4 turns (the new boards starved).
- **11 The predator Life** ([spec](slices/11-predator-life.md)): the swimmer (you hunt; no hunter on your board); worms burrow,
  trilobites run, Wiwaxia hunkers; lurk = ambush ×2, frenzy +1 speed per catch in a row; compound eyes preview the prey's next
  step (tap to aim, tap again). *Judge:* prey notice you only when you moved; Wiwaxia cuts only if it saw you; respawn in 3.
- **13 The garden and the island** ([spec](slices/13-garden-island.md)): the island map (ported generator), a card per habitat
  with niche rows (open and contested first, ranks to beat, bars, news); a niche gives its body (grazer → arthropod,
  burrower → worm, hunter → swimmer); the garden (ported) with a 60% self-limit; the garden writes the board; eggs count in
  the niche you ate like; a generation every 3 min, Skip +10, 8 h offline, a browser save. *Judge:* the mapping, the
  self-limit, one tier scale (S 40, A 28, B 18, C 10, D 4), the natives. Built before 12, as plan.md allows.
