# Status

- **Milestone:** M2. Step 13, **W1 the wide toy** ([spec](slices/w1-the-wide-toy.md)): parts A and B built 16 Nov;
  your play is next. Step 12 (the N4 fix) is still built and not played. Branch `n4-who-eats-whom`; commits
  `a245a57` (the contract), `bdec94c` (part A), `7316a2d` (part B).
- **Done (16 Nov, part B):** `toys/wide.html` and four files `toys/wide*.ts` (397 lines in all), one entry in
  `toys/index.html`. Nothing under `clade/` changed. The goal sentence at the top (tap it to do it), your heir in words,
  a Board tab (land, shore, sea by depth; gold chips are yours, grey wild, dashed open, dim out of reach; red text is the
  missing adaptation; a pink ✦ is a variant), a card as a bottom sheet (holder or comer, stat bars, reasons, eats and
  eaten by here, your heir's letter and Take/Beat/Improve or why not; a variant shows both builds side by side and
  Adopt), news, a Roster tab (rows, realm filter, full card over the roster, the coverage table) and a folded dev panel.
- **Where the brief was silent, the builder chose** (change any in a line):
  - Tapping a "Wait" goal steps one Life's generations (12); it does not count as a Life.
  - Mainning another clade starts from its first named species in the roster.
  - "Force a variant" sets every held cell's variant bar one short, then steps one generation.
- **Verified:** `npm run check` passes, 10.2 s (the budget is 10). Types are clean. One look run at 390 px: a fresh board,
  then following the goal alone reached a shore cell at generation 852, 25 Lives. Cards and the roster render. One
  404 in the console, most likely the favicon (no toy has one). Not verified: how it feels.
- **What a look run showed** (for your play): following the goal, generations 264 to 756 were almost all "Wait a
  Life": nothing in reach was open. The air key came from a mutation variant on the Mud slope, not on the flats.
- **For the architect** (none blocks play):
  1. **`reach` is not exported** from `board.ts`, and the page needs it to dim cells. `toys/wide-board.ts` mirrors rule
     3 in four lines (`reachOf`). Lean: export it in the contract and drop the copy.
  2. Following the goal makes the heir churn and can **drop the air key** (from part A). Adopt comes first, and each
     variant was made from the heir at the time. Options: make variants from the cell's holder, have adopt keep the
     heir's mutations, or adopt only when the letter changes.
- **Next:**
  1. You: play `/toys/wide.html` ten minutes (`npm run dev`) and put your notes in
     `docs/playtests/w1-the-wide-toy.md`. Still owed: the N4 fix play and the merge (step 12).
  2. Then `/architect W1` with the notes and the two questions above.
- **Open:** the spec's three questions (hunting reads light; gaps in the roster; `nextGoal` puts Adopt first), the two
  above, direction §11.
