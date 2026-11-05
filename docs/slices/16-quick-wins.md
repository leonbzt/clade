# Slice 16: quick wins

**Milestone:** M2, step 1 (from `ROADMAP.md`)
**Question:** With the stocks, the next board and a font you like on screen, does a habitat card read as a place, not a list?
**Builds on:** [playtest 10](../playtests/10-m1-run.md) ("the status bars for the local habitat", "i don't like the font still");
[review](../design/world-and-body-review.md) §2 and §7, step 0; "the order sounds good" (decisions.md, 5 Nov).

## In
- **Resource bars on the habitat card:** Surface (grazers), Buried (burrowers), Prey (hunters), Oxygen (everyone), each with a white
  "normal here" mark and this habitat's real foods beside it. *Decided 5 Nov.* Prey is counted from grazers and burrowers, so it's no
  new stock; Surface is the `mats` stock and Buried the `rot` stock.
- **"Next board" line on the card:** "11 mats · 15 buried · 2 carcasses · Anomalocaris on turn 7 · rivals: Wiwaxia". Port
  `boardFacts` from `toys/garden-board.ts:98` to `sim/door.ts`; it reads `boardFor`, so the line can't disagree with the board you get.
- **The new font:** Plain 12 and Bold 12 from [RuneStar](https://github.com/RuneStar/fonts), your first choice (5 Nov), replacing Pixelify, in
  `ui/fonts/CladeText-*`. It has a real bold. Crisp at 16 and 32 px, so all text uses only those sizes. `scripts/build-font.py` makes the woff2 files. `toys/fonts.html`
  compares 21 fonts on this game's panel. Licence question before release: see `decisions.md`.
- **Map labels stay inside the map.** Today they run past the canvas edge on about 176 of 200 seeds (computed from an estimated text
  width). Clamp the label in `drawIsland`, using the measured width; if there's no room below the disc, it goes above. Any other clipped
  text found in the font pass gets fixed too.

## Out
- "Since you last lived here": step 4, with the named rules.
- Creatures on the overview, and map views: step 3.
- An original bitmap font: stays in `ideas.md`.
- Other look work: step 7.

## Done when
- [ ] In play: open a habitat and see its four bars with normal marks; Skip +10 moves them.
- [ ] The next-board line matches the board you then walk on (a test compares it with `boardFor`).
- [ ] The font is in, with nothing overflowing at phone width or on desktop, and the itch build is still one file.
- [ ] A test: label positions stay inside the canvas on 200 seeds.
- [ ] `npm run check` passes.
- [ ] Your notes are in `docs/playtests/16-quick-wins.md`, and a player-facing line in `docs/patch-notes.md`.

## Size check
- New systems: none. No new stock, stat or gene.
- Touches sim structure? No: read-only functions in `door.ts` and `garden.ts`.
- Fits one session.

## Answered (5 Nov)
1. The font: the RuneScape font, renamed Clade Text; GNF as fallback ([research](../research/font-licences.md)).
2. The bars: Surface, Buried, Prey, Oxygen, with this habitat's real foods beside them.
