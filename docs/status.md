# Status

- **Milestone:** M2, step 11, **N4 Who eats whom**: spec ready, not started, on branch `n4-who-eats-whom` (from `main`
  after the N2/N3 merge). [Spec](slices/n4-who-eats-whom.md).
- **Done this session (12 Nov):** your N3 play written into `playtests/n3-the-screens.md`; the mutation panel capped at
  440 px on desktop; N2 and N3 merged to `main` and ticked; the N4 spec; the Fable maths brief
  ([fable-brief-3.md](design/fable-brief-3.md)); two ideas parked (equipment and an RPG character; zoom levels).
- **Verified:** `npm run check` passes (7.4 s). No look run for the width fix (CSS only).
- **Decided (12 Nov):** N4 gets living paint and a return replay (3 sessions); Fable runs after the N4 play test with
  brief 3.
- **Found:** the sea never runs between Lives today (only the dev skip). N4 C makes a Life run `LIFE_GENS` (12)
  generations; that's open question 1 in the spec, followed unless you change it.
- **Next:** build N4 parts A–G in order, with a breakpoint after each (who builds is your pick: Codex as in N3, or
  Claude). Then your N4 play, the N0–N4 play test and the closed test (step 12), then the Fable pass.
- **Open:** the spec's two leans (12 generations per Life; prey as big as its hunter until R5).

## N4 progress
(one line per part: "X done: what landed; next: Y")
- A done: `sim/hunt.ts` (`hunted`, `threat`), a hunt slot per habitat, survival in `fitness` naming the hunter, the sea
  removes the take; a hunting tool eats only prey (my lean: no grazing hunters, so roles stay crisp); `HUNT.saturation`
  2 (at 1 a hunter tops out at D). The sea step was rewritten allocation-free for law 6: 20 species 91 ms, N1's 27 ms.
  Next: B, wild branches.
- B done: `sim/wild.ts`: an unchosen slot with food buds (8%) from the heaviest nearby parent with a one- or two-step
  candidate at C or B (the clutch's `changes`, now shared); prey slots bud hunters too. Wild species living nowhere are
  pruned unless they parent another. `step` returns `{ buds, gone }`. N1's sea tests run with buds off. Next: C.
- C done: `step` returns a report (tallies born/died, hunts, moves, buds, gone); `ui/sea-run.ts` runs `LIFE_GENS` (12)
  on the way back to the map and keeps reports and news UI-side. `sim/news.ts`: one line per story (bud, arrival, loss,
  ±30%), merged across habitats, yours first, cause = largest term in tier talk (survival measured over the Life).
  Not shown until G. Next: D.
- D done: `boardFor(…, you)` takes the heaviest sea hunter here with `rivalAt` heads that can eat you as the board's
  predator (drawn as its build in hunter red, named in banner, forecast and log); its `beats` switch off matching guards,
  enrolment and burying (Brace still works). Rivals exclude it. Crush catches an adjacent rival you could eat:
  `PREY_FOOD` 10. Dev species: Wild hook worm. Next: E.
