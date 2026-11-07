# Slice 18c: looks on a real board (spike)

**Milestone:** M2, the general body (step 3 of the full-version plan); a throwaway spike, no game code changes.
**Question:** on a real board, built fresh for each style, is it low-res low poly, all pixels, or a mix?
**Builds on:** your calls, 6 Nov: "low res (low) poly is i think the way to go, but everything should be really efficent and maybe could get swapped with pixel arts"; "i like the pixel style a little more"; future minigames with shadows; "not a lot of cute"; approach each style fresh.

## In
- One page, `spikes/body-render/board.html`: the same real board and the same animals walking, in six ways: today, improved low poly at two pixel sizes, pixels at two sizes, low-poly world with pixel animals.
- A native pixel painter: animals and ground from heights and sun on a pixel grid, not triangles run through a filter.
- A second view: more animals from data alone, including non-bugs, as pixels, low poly and a fresh field-guide plate.
- Whole-frame cost of each way at 8 and 50 animals.
- Round 2, after your first look: today's floor under steadier and baked animals, and a sizes page from 8 to 48 px.

## Out
- Game code, HUD, marks and effects (a chosen look comes back as its own spec).
- v1's pixel painting: not read; a later spec can carry it over.
- Cute as a direction: kept mild, as you asked.

## Done when
- [x] The six boards and the animal sheet run, and the costs are measured.
- [x] `npm run check` passes.
- [x] Your notes are in `docs/playtests/18c-board-looks.md`.

## Size check
- New systems: none in the game. The spike's files stay under ~400 lines each.
- Touches sim structure? No.
- One session.

## Open questions
See `docs/proposals.md`, P46.
