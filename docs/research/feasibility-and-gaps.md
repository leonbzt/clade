# Feasibility and logic gaps (17 Nov)

A fast review (about five minutes) of `status.md`, `direction.md`, `ROADMAP.md`, the B0 round-two spec, the B0
playtest and a skim of `clade/src`, on branch `b0-the-build-toy`. Not verified by running anything. Every fix
below is a *proposal*; none changes the plan. Ordered by what blocks the road soonest.

## P1: blocks a near step

1. **The build has three shapes and no bridge between them.** The genome is dials and mutations (§4), the seventh
   round says "a tree's branches are the clade's dials", and the eighth round's kit is places, parts, rungs and
   traits (`data/kit.ts`). B1 needs "the clutch is a variant one step along the branch you spent most in", but a kit
   has places, not branches. The branch-to-dial table is listed as not decided. *Fix:* each part and trait names one
   dial it leans (a field in `data/kit.ts`); "spent most" is the dial with the most rungs. Decide before W2, since
   W2 puts the Life on the kit.
2. **What lasts between Lives contradicts itself.** §7's map says "points never leave a Life" and the build resets;
   the eighth round keeps a planned kit between Lives, and `ui/toy/kit-progress.ts` stores levels. Line XP is
   "eggs × the letter" in §7 but plain eggs (12/40/90) in the toy. *Fix:* one new row in the §7 table for the kit
   (bought by line levels, lasts for good) and one XP formula.
3. **"Solved" comes back fast.** The playtest: "I already know the best build for each map, so there isn't really
   any decision left." Fixed boards, a planned kit that carries over, and all-or-nothing defence (spec Q2) all push
   toward one answer per board. "Solved is a chapter" names it but does not stop it. *Fix:* the board varies per
   Life (seeded food and threat mix from the cell's patch), and offers are drawn from a pool weighted by that mix,
   so the best plan changes with where you hatch.
4. **A dial step may not show anywhere.** 43 of 54 dials are flat, and one step moves a value 4 to 5%. B1 (the
   clutch as a variant) and N5 (the compare card) both sell dial steps, but the laws' cut (LC) comes after them. If
   dials stay flat, B1's bridge is invisible when played. *Fix:* move LC before B1, or fold the playable lines'
   dials (6 for the closed test) into B1.

## P2: logic gaps that will surface in play

5. **Dead ends with no way out.**
   - A new line can find no cell (lugworms beside ragworms, status open item 5). Nothing guarantees a new line a home.
   - The land opens only by a key-adaptation mutation "where it would pay, at the edge". If no line of yours sits at
     the tide line, the land never opens. Needs a guaranteed path (a goal that sends you there, or a pity timer).
   - Becoming a real species needs a population to walk to its point. With 3 dials and 100–150 species, some clades
     will crowd many species into a small space (two may match one point) and others will have points no cell ever
     pays for. The match tolerance is undefined.
6. **Abandoning a Life is undefined.** The playtest wants to restart after a bad start. Does a quit Life lay
   anything, pay XP, keep points? *Fix:* a quit Life ends as a death (eggs already laid count, nothing else), stated
   once in the spec.
7. **Offline is undefined for the new sea.** Wild species challenge held cells on a bar, with a Hold goal. Can you
   lose a cell while away? Do variants pile up without limit? Idle games need a rule here (cap the queue; a
   challenge that resolves offline should be shown in "what changed").
8. **Budgets disagree across docs.** `CLAUDE.md` rule 6 and `ROADMAP.md` budgets say 9 nodes a clade; the eighth
   round says 6 places, 12 parts, 3 rungs, 2 traits for what a Life uses. Twelve effect kinds and eight verbs are
   still proposals. One line in each doc on the user's call.
9. **The roadmap list is stale.** Steps 3–6 point at archived slices 18–22 and tick "Join the bodies" though that
   work was replaced; step 14 still describes round one ("each moult is a point"); round two is in direction §8 but
   not in the roadmap's list. Readers (including other Claudes) get the wrong current step.

## P3: feasibility and engineering

10. **There is no save for the new game.** Only the kit toy writes `localStorage`, with no schema version or
    migration (`kit-progress.ts` parses whatever is there). Saving lands in step A, the last before the alpha, but
    W2 fixes the state shape now. *Fix:* a versioned save contract (seed plus the player's records, and a
    `version` field with a test that loads the previous one) as a part of W2, not A.
11. **The catch-up budget is not measured for the new model.** "8 h in about 5 s, a step about 30 ms" was set for
    the old garden. `fitness(build, job, site)` over 150 species × jobs × habitats per step is unmeasured. *Fix:* one
    model test that times a step at the alpha's roster size with generated rows.
12. **The check is 14–16 s against a 10 s budget**; W2 owns the fix. Fine as planned, but every builder pays it
    until then.
13. **Two organism models live side by side** (`sim/records.ts` and `model/`), and `sim/` still holds clade names,
    against "no names in rules". W2 deletes the old one; until then a builder can wire into the wrong one. A test
    that `sim/` imports no record from `records.ts` after W2 would keep it gone.
14. **Small:** kit mode still shows the planned part's verb in the verb bar (status, "seen in passing").

## What looks sound
The slot board, the quiet sea, `eats` derived and not authored, one Life engine, data rows over code, and the
beat (335 ms of playback inside a 600 ms beat) are all buildable at this size. The risk is not the code; it is that
the build's three shapes (P1.1, P1.2) are settled before W2 hardens them.
