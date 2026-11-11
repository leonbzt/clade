# Status

11 Nov 2026 · **M2, step 9 N2 (the Life): Session 1 A–D built, reviewed and fixed on `n2-the-life`. Next: Session 2 (E–G).**
- `npm run check` passed in 6.1 s. Claude's review: the parts that are on, food reach, Enforce, shadow strikes and
  founding match the spec. Two fixes: the rival cutoff counts heads, not grams (`1135fd0`). Boards are now generated
  from the habitat, not the three templates (`ee5c021`), because sand and rock slopes and deeps showed 6–12 food
  while the sea rated a bulb worm B or A there.
- Session 2 (E–G): the screen and the Colonise loop, registering dev picks before `found`, the sheet, and the
  three-habitat play test. The sheet should include 6–8 generated boards (rock deep, sand slope, mud shallows, a flat)
  so the user can judge them by eye. Seed 1 has no flat, so the "mat flat" play test needs another seed.

**Done (Claude, 11 Nov):**
- The board generator (`sim/board.ts`, numbers in `data/boards.ts`, spec part D rewritten):
  - Ground from the bottom type: smoothed noise at the templates' mud and wall shares. Walls never cut the board,
    and the start's four neighbours stay clear.
  - Food from the stocks: `round(14 × density)` nodes per food, at most 21, scattered. A node brings its own ground,
    so a buried node on sand is a mud pocket.
  - Direction: deeper neighbours pull and shallower ones push, by shared border, with map north up. The start is one
    cell in from the shore edge, and the shadow enters on the deep edge.
  - The event: low tide on the flats (shore band); below them a mudslide on mud, a vent surge on rock and an
    upwelling on sand (deep band; new). `BoardEvent` gained `cols`.
- At full stock the board now follows the tier: a rock deep holds 11 buried nodes, a sand deep 14, a mud deep 21.

**Numbers that felt arbitrary:** `BOARD.nodes` 14 (the templates held 10–21); the upwelling's turns 10–13. A vent
surge hits every rock board below the flats (8 of 13 habitats in seed 1). Habitats named "vent" get no vent event of
their own until R7.

**Decided (user, 11 Nov; decisions.md):** boards are generated from the habitat (ground from the bottom type, food
from the stocks, direction from the neighbours, the event from depth and bottom type); a build that doesn't fit a
habitat may starve there, as long as the board agrees with the sea's tier. Earlier: the shadow behind a data flag;
2 heads per egg; Enforce 3, 5, 7, 9, 11, capped at 1 + line rank; parts switch on in family order.

**Open:**
- Putting the current `game/` build on itch now for early feedback (Claude's advice given; no call yet).
