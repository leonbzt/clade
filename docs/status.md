# Status

- **Milestone:** M2. Step 14, **B0 round two, the kit toy** ([spec](slices/b0r2-the-kit-toy.md)): all four parts
  built, **waiting for your play**. Round one was played 17 Nov (`playtests/b0-playtest.md`). Branch
  `b0-the-build-toy`, local, not pushed, all committed (`be8cb92` contract, `ac3c8ad` A, `fba579f` B, `c8e1ca6` C,
  `0d9983d` D).
- **Done (17 Nov, builders: Codex gpt-6.1-sol at high, each part reviewed against the spec):**
  - A, the kit in the sim: plan, start, node states, spend, offers, points, branch, levels.
  - B, the Life reads stats: body numbers from `kitStats`, gates, defence, work on food, upkeep every
    `KIT.upkeepEvery` turns, the 60-turn season, tasks. One reading: the kit's hit drops today's "a back shield
    counts as front" (it reads a part's name).
  - C, the page `/clade/?toy=kit`: level bar, body plan, boards, result card, saved progress (`clade.kit.v1`).
  - D, the Life's side: the build list, tap a tile to set a task, the beat, the Clock switch, work and rung playback.
- **Look runs (390 px, nothing scrolls sideways):** C: `.shots/kitc-start.png`, `kitc-planned.png`,
  `kitc-life.png` (plan kept at 1 at level 1, the Life starts in kit mode, an offer of three). D:
  `.shots/kitd-grown.png`, `kitd-walking.png`, `kitd-eaten.png`, `kitd-clock.png` (grew tentacles, a task three tiles
  off walked and worked "2/3" then "+5 food", the task dropped; the clock ran 4 turns in 2.5 s). **One step's
  playback: about 335 ms against the 600 ms beat**, so the beat sets the pace.
- **Decided (17 Nov, yours):** the mix (a small planned kit that carries, offers for the rest, a rare one
  sometimes); turns with work on a steady beat and a clock switch; the kit toy before W2; the budget is for what a
  Life uses (6 places, 12 parts, 3 rungs, 2 traits a clade); solved as a chapter; visible progress first.
- **Not decided** (*proposal*): every node, name and number of the kit; defence as all or nothing; small stat
  numbers; the branch-to-dial table for B1; 12 effect kinds and 8 verbs; the doors table; the pitch.
- **Checks:** `npm run check` passes in 14.4 to 15.7 s (13.6 before round two's code; the machine swings about 1 s;
  budget 10 s, the fix is W2's). Both kit test files: 34 pass. Not run: `check:game`.
- **Not verified:** no number was played (goals 24/18/14 and levels 12/40/90 eggs may be far off); the hunted
  board and a strike during a task were not seen in a look run; the kit's names are from memory.
- **Play:** `npm run dev`, then `/clade/?toy=kit`. Plan a part, pick a board, tap tiles to work them, try the
  Clock. Five things to look for are in the spec's "Done when"; notes go in `docs/playtests/`.
- **Seen in passing:** kit mode still shows the planned part's verb (e.g. Graze) in the verb bar; the spec did
  not change verbs.
- **Not done:** the draft of a second clade's kit (one line in `ideas.md`, for a researcher batch after round two).
- **Next:** your play of round two, then `/architect` with the notes.
- **Open:** rivals and Hold in the wide toy (you did not say whether they read; N5's spec). The verb bar's cap of
  three waits for B1 or W5 (`ideas.md`). Round one's page `?toy=build` stays until W2.

## For the architect
- Nothing open.
