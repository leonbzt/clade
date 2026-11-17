# Status

- **Milestone:** M2. Step 14, **B0 round two, the kit toy** ([spec](slices/b0r2-the-kit-toy.md)): parts A and B built.
  Round one (the build toy) was played 17 Nov (`playtests/b0-playtest.md`). Branch `b0-the-build-toy`, local, not
  pushed. All committed (`be8cb92` the spec and contract, `ac3c8ad` part A, `fba579f` part B).
- **Done (17 Nov, part A, built by Codex gpt-6.1-sol at high, reviewed):** `sim/kit.ts` (plan, start, states,
  spend, offers, points, branch, levels), `sim/kit-stats.ts`, `activePlaces` in kit mode, `grow` adds moult points
  and rolls an offer, `enforceCost` and `offerMutation` off in kit mode.
- **Done (17 Nov, part B, Codex again):** in kit mode the body reads `kitStats` (upkeep, range, tunnel, sense,
  oxygen, food, clutch, no grab, no progenesis); `lockOf` by `GATES`; defence turns a strike; `eat` takes work;
  upkeep every `KIT.upkeepEvery` turns; the 60-turn season; `work`, `setTask`, `stepTask`. One reading: the kit's
  hit drops today's "a back shield counts as front" (it reads a part's name).
- **Decided (17 Nov, yours):** the mix (a small planned kit that carries, offers for the rest, a rare one
  sometimes); turns with work on a steady beat and a clock switch; the kit toy before W2; the budget is for what a
  Life uses (6 places, 12 parts, 3 rungs, 2 traits a clade); solved as a chapter; visible progress first.
- **Not decided** (*proposal*): every node, name and number of the kit; defence as all or nothing; small stat
  numbers; the branch-to-dial table for B1; 12 effect kinds and 8 verbs; the doors table; the pitch.
- **Checks:** `npm run check` passes in 14.4 to 14.8 s (13.6 before A, 13.9 after A; Codex measured 13.2, so the
  machine swings about 1 s; budget 10 s, the fix is W2's). Both kit test files: 34 pass, none skipped. Not run:
  `check:game`.
- **Not verified:** no number was played (goals and levels may be far off); whether one step's playback fits the
  600 ms beat (part D reports it); the kit's names are from memory, not researched.
- **Nothing to play yet:** parts A and B are sim only; the page comes in part C.
- **Not done:** the draft of a second clade's kit (one line in `ideas.md`, for a researcher batch after round two).
- **Next:** `/build b0r2 C`, then D. Then your play; five things to look for are in the spec's "Done when".
- **Open:** rivals and Hold in the wide toy (you did not say whether they read; N5's spec). The verb bar's cap of
  three waits for B1 or W5 (`ideas.md`). Round one's page `?toy=build` stays until W2.

## For the architect
- Nothing open.
