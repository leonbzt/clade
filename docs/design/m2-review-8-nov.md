# Review: the Codex stretch of M2 (8 Nov)

Claude, 8 Nov 2026, at `8b5b202` (after Codex's [slice 20 critical review](20-critical-review.md)). Measured from tests,
the build, the smoke run and its screenshots; Claude didn't play. Your calls are in
[decisions](../decisions.md#8-nov-review-of-the-codex-stretch-and-tierzoo).

## State (measured)
- **Gameplay** is at `13b1ccb`, slice 19 Part D. Since 7 Nov, Codex delivered Parts A–D: the sea model and v3 save, patch boards
  from real residents, part-based feeding, the living map and the Play next list. You played it on desktop: fun, habitats differ.
- **Checks:** 102/102 tests and the typecheck pass; the build is 756 KB; `sea-smoke` passes at 390×844 and 1200×900
  (controlled fixtures).
- **Budget miss:** `npm run check` takes 11.1 s, over the 10 s budget. The slowest test is "map labels stay inside the map on
  200 seeds" (2.9 s).
- **Code:** no file over 400 lines, and the sim/view split holds. But `main.ts` (19 KB) and `Meta.svelte` (16.6 KB, lines up to
  394 characters) only pass the line rule by density.
- **Git:** 81 commits sit on stacked `codex/*` branches; `main` still points at the plant game (`def3aab`).

## Problems
1. **Docs instead of code.** After the last code commit (02:46, 8 Nov) came 5 docs-only commits over about 12 h:
   a 443-line contract, a review, a revision, an approval and a 214-line critical review. `status.md` is 284 lines (it was
   cut to 30 on 5 Nov) and `decisions.md` 529. Every section repeats disclaimers. It's the 1 Nov drift in a careful voice.
2. **Save compatibility against your call.** "Saves are no priority" (7 Nov), yet `AGENTS.md` makes save compatibility a
   priority. 20A/20C planned a v4 save that keeps the old v3 part rules beside the new places, and legacy residents that
   keep their old stacking. Decided 8 Nov: reset the sea instead.
3. **Six places can offer few real choices** (from Codex's review):
   - Default Dash used one of three verbs, so only 10 of 20 sets fit. Decided 8 Nov: it no longer counts, which also lets
     the Tank take a compound eye.
   - Still open: the worm has no Limbs part, swimmer Eyes has one part, and about 8% of swimmer common-card pairs are both
     parts it already has. Duplicate cards are empty rewards.
4. **The map:**
   - Before founding, about 75 patch numbers overlap in a ring at phone width.
   - The island takes about 70% of the map.
   - After founding, labels sit clipped at the top edge.
   - Code terms show in the UI: "line:worm:burrower", "aggregate body/diet populations", "continuation".
5. **Open human checks** (slice 19): unaided next-patch discovery, 3–5 ordinary Lives, a real phone.

## Next steps, in order
1. **Housekeeping thread:**
   - verify, merge the stack into `main` ("yes, if everything is in order and the continued build makes sense") and prune
     branches;
   - cut `status.md` to about 30 lines;
   - align `AGENTS.md` with `CLAUDE.md`: saves are no priority before release, the sea resets at the body cutover, docs stay
     short, a slice takes 1–2 sessions;
   - get `npm run check` under 10 s.
2. **Slice 20 docs:** apply the two calls by deleting text. Drop the v4 legacy layer, the legacy representatives and the
   old-build conversion; move Dash outside the ceiling. Two gaps from the critical review remain, smaller now: starter
   eligibility for codes, and lay snapshots that keep their size. Resident builds are carried for drawing only.
3. **Build:** the 20A pure model and fixtures, then the 20B equipment view (large creature, six places, part cards with
   trade-off tooltips) in the existing launch flow, then the cutover with the reset. Play it; tune rule A's costs and locks
   from play.
4. **UI quick wins:** founding-map labels (number only the selection and neighbours, or cluster them); remove code terms.
5. **Slice 19 human checks** whenever you play.
6. **TierZoo:** [concepts](tierzoo-concepts.md), open as P47; most of it lands in steps 5–6.
