# Status

Updated 9 Nov 2026 (Claude). Branch `slice-20a-model`: 20A `b34e9cc`, 20B `3229e3d`, 20C `39ca951`, 20C fixes; 20D uncommitted.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md): 20A–20C played; **[20D slots](slices/20d-slots.md) built 9 Nov, to play.**

**Done (9 Nov):** 20D spec and build.
- 27 part icons, 6×6 pixels: the toy's 19 plus rake, arms, spikes, lenses, flap, fan, tentacles, bulb, and a lock
  (`game/src/data/part-icons.ts`, `ui/PartIcon.svelte`; a two-part row shows its base as a corner icon).
- `ui/Slots.svelte`: six icon slots around the large creature (one row under it below 720 px); held, empty, locked,
  unsupported (hatched), carried (green corner), selected (gold), legal (green), moult old → new.
- Launcher (`ui/Equip.svelte`): place tags and leader lines gone; icon cards with one trade line; an info line
  shows the hovered or current card's effect. `view/equip-stage.ts` lost the unused `points()`.
- Moult view (`ui/LifeBody.svelte`): the same slots; tapping a slot names its part and picks the offer that changes it.
- Test `tests/part-icons.test.ts` (every part, distinct). `npm run check` passes (9.3 s; the garden timing test
  flaked once of four); build 784 KB; `scripts/sea-smoke.mjs` passes. Screenshots checked at 1200×900 and 390×844.

**Decided:** 20D leans (slots around the creature, phone row, no leader lines, 6×6 icons now, 8×8 in step 9).

**Next:**
1. Play 20D (launcher and a moult, desktop and phone); notes in `playtests/20-join-the-bodies.md`.
2. Commit 20D, then tick roadmap step 5.

**Open:**
- The board-size tile covers much of the phone stage (from 20B); the 8 new icons are first drafts.
- AI readings of the 20A contract, for your OK (`git show 7f2f356:docs/status.md`).
- Flaky `garden.test.ts` timing; `npm run look` needs Playwright (a scratch CDP script from `scripts/sea-smoke.mjs`
  works). P47, P46. Slice 19 human checks.
