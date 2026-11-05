# Slice 16: quick wins

**Milestone:** M2, step 1 (from `ROADMAP.md`)
**Question:** With the stocks, the next board and a font you like on screen, does a habitat card read as a place, not a list?
**Builds on:** [playtest 10](../playtests/10-m1-run.md) ("the status bars for the local habitat", "i don't like the font still");
[review](../design/world-and-body-review.md) §2 and §7, step 0; "the order sounds good" (decisions.md, 5 Nov).

## In
- **Resource bars on the habitat card:** Mats (grazers), Buried (burrowers), Prey (hunters), Oxygen (everyone), each with a white
  "normal here" mark. Built with your question in mind (5 Nov): one bar for what each role eats. *Proposal, yours to change.* Prey is
  counted from grazers and burrowers, so it's no new stock; Buried is the `rot` stock under the board's own word.
- **"Next board" line on the card:** "11 mats · 15 buried · 2 carcasses · Anomalocaris on turn 7 · rivals: Wiwaxia". Port
  `boardFacts` from `toys/garden-board.ts:98` to `sim/door.ts`; it reads `boardFor`, so the line can't disagree with the board you get.
- **The new font,** replacing Pixelify in its three places: `main.ts:3-4`, `style.css:13`, `view/islandmap.ts:53`.
  - Default **Jersey 15** (*proposal*), yours to change. It has no bold, as most options don't (Handjet, Bitcount Single and Doto do). So
    `font-synthesis: none`, and headings stand out by size, colour and the outline they already have.
  - One pass over the sizes (13–28 px today), checked on all the screens at phone width. The file stays inlined in the one-HTML build.
  - `toys/fonts.html` swaps its old plant text for this game's lines, so you judge it on real words.
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

## Open questions
1. Which font? Jersey 15 is in as a placeholder: in the whole Jersey family V reads like U ("Uolcanic"). `toys/fonts.html` now has 18
   fonts. A swap is `main.ts:3` and `--font` in `style.css`. Our own font is an option (*proposal*): see `ideas.md`.
2. Is the bar set right: Mats, Buried, Prey, Oxygen?
