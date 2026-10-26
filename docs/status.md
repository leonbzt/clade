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

## Decided
- Nothing new in the brief. You chose to build toys first and to reset the docs.

## Next
1. Play the toys: `npm run dev` → `/toys/`. About 10 minutes each, notes in `docs/playtests/02-toys.md`.
2. Check the brief's Pillars / Current bets split; move items and delete the AI note.
3. From the toy notes, pick the colony's play (Q11), then plan the rebuild slice or the art spike.

## Open
- Q11: what's the colony's hands-on play? (the toys)
- P2: one grid, four verbs across kingdoms?
- Still open from before: Q5–Q10 in the brief. Svelte for menus and "no saving yet" are unconfirmed. The second
  fact-check of the [M] lines in `research/moss-facts.md`.
