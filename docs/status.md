# Status

Updated 2026-10-26 (design session: notes and direction, docs reset).

## Done
- **Git:** initialised, with a snapshot commit of slice 01 before the reset. `_old/` is git-ignored.
- **Docs reset:** old S0–S26, the first-30-minutes beat sheet and the review moved to `_archive/2026-10-26/` (reads
  blocked). `systems.md` now holds only live proposals P1–P7. The brief is regrouped into Pillars / Current bets
  (an AI draft for you to check; no decisions were changed).
- **Brainstorm:** `docs/minigames.md` covers the honest frame for math toys, one grid with four verbs (Grow, Gather,
  Guard, Bet) across kingdoms, classic sim methods and game mechanics, and a toy backlog.
- **Research:** VirtualPlantLab can't run in the browser, but its ideas port: `docs/research/virtual-plant-lab.md`.
- **Slice 02, built:** three toys in `toys/` (Patch, Specimen, Rules). Spec: `docs/slices/02-toys.md`.
  `npm run check` passes (toys are typechecked). All three load in headless Chrome; the rates are rough.
- Tech-art now has your look (pixel menus; Stardew 2D or OSRS low-res low-poly) and revised art spikes.
- **Round 2:** your toy notes are in `docs/playtests/02-toys.md`. Toy 4 "Colony" is built in `toys/colony*.ts`:
  limited drops, hidden ground with hints, lichen to surround, a gene draft with combos, slide to collect, a skill.
  A headless greedy-bot run reaches all three goals in under 3 minutes, so the goals are too easy (rough on purpose).
- **Fresh-eyes review:** `docs/review-fresh-eyes.md`. Core: placement is the decision and growth is the reward. Cut
  slots and zoom levels until after the first release; build in milestones M0–M5; go 2D.

## Decided
- Nothing new in the brief. You chose to build toys first and to reset the docs.

## Next
1. Play toy 4 (`npm run dev` → `/toys/colony.html`) and add notes to `docs/playtests/02-toys.md`.
2. Read the review. Decide which Current bets to drop, and Q7 (2D?).
3. If toy 4's choices feel strong, write the next slice: the review's M0/M1 (place, spread, evolve, place again).

## Open
- Q11: what's the colony's hands-on play? (the toys)
- P2: one grid, four verbs across kingdoms?
- Still open from before: Q5–Q10 in the brief. Svelte for menus and "no saving yet" are unconfirmed. The second
  fact-check of the [M] lines in `research/moss-facts.md`.
