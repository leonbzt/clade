# Status

- **Milestone:** M2, step 11, **N4 Who eats whom**, on branch `n4-who-eats-whom`. Parts A–E built; F and G (session
  3, "the map moves") are left. [Spec](slices/n4-who-eats-whom.md).
- **Done (12 Nov):** A–E, one commit each; see the progress list below. Look runs: D (sea hunter on the board) and E
  (Challenge, Adopt) at phone size. C has no screen until G.
- **Verified:** `npm run check` passes in 7.2 s. Law 6 with 20 species takes 77 ms inside the check, so the margin
  under 100 ms is thin.
- **Decided (12 Nov):** hunters don't graze for now; dual builds may come later (already logged).
- **Next:** F, living paint (`view/living.ts`); then G, the return replay and the notes card plus button (they read
  `seaRun` in `ui/App.svelte`: `reports`, `news`, `before`); then your four-Life N4 play.
- **Open:** (1) Brace still blocks a sea hunter whose `beats` ignore your armour. Is that right? (2) A holder at F
  still makes the slot a Challenge. (3) Adopt shows for any wild species in a habitat you can see, even one with no
  slot (a hunter with no prey). (4) The spec's two leans stand (12 generations per Life; prey as big as its hunter).

## N4 progress
- A done: `sim/hunt.ts` (`hunted`, `threat`), a hunt slot, survival naming the hunter; hunters eat only prey;
  `HUNT.saturation` 2; the sea step is allocation-free (law 6).
- B done: `sim/wild.ts` buds wild species (8%) in unchosen slots, C or B only, parent set; wild species living nowhere
  are pruned unless they parent another.
- C done: `step` returns a report (tallies, hunts, moves, buds, gone); `ui/sea-run.ts` runs `LIFE_GENS` (12) on the way
  back to the map; `sim/news.ts` writes one line per story, yours first, naming the cause in tier talk.
- D done: `boardFor(…, you)` makes a sea hunter that can eat you the board's predator (drawn as its build, named);
  its `beats` switch off matching guards, enrolment and burying. Crush catches an adjacent rival you could eat
  (`PREY_FOOD` 10). Dev species: Wild hook worm.
- E done: "Challenge X (B) · your Y A" on a held slot, "X holds it" on map targets; "Wild here" offers Adopt;
  ≥ `ADOPT_EGGS` (10) joins your line, fewer hatch wild. `bestFit` follows the diet rule. Next: F.
- Shadow off, Brace (12 Nov calls): a board has a predator only when a sea hunter that can eat you lives there
  (`BOARD.shadow` false); Brace no longer blocks a hunter that beats armour.
- F done: `view/living.ts` capsules per population (`LIVING` in `data/sea.ts`), drawn over the map, synced from
  `capsuleCounts(world)`; hunters chase, prey flee, yours carry a gold pixel. Next: G.
