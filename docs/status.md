# Status

Updated 8 Nov 2026 (Claude). Everything is on `main`; work starts on a task branch. Gameplay is at `13b1ccb`. The long Codex-era status is at `git show 8b5b202:docs/status.md`.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md) with the [20A contract](design/20a-body-part-contract.md): specified, no code yet.

**Done (8 Nov):**
- [Review of the Codex stretch](design/m2-review-8-nov.md); TierZoo [research](research/tier-zoo.md) and
  [concepts](design/tierzoo-concepts.md) (open as P47). Slice 20/20A carry an "8 Nov" note; old text not trimmed yet.
- Housekeeping: `npm run check` 7.4 s (steps in parallel, `scripts/check.mjs`); `AGENTS.md` aligned (saves no priority
  before release, short docs, 1–2 sessions per slice); `main` merged, pushed, all other branches deleted.
- Handoff runs unasked after a large task (`CLAUDE.md`, `docs/workflow.md`).

**Decided (8 Nov, [decisions](decisions.md#8-nov-review-of-the-codex-stretch-and-tierzoo)):**
- Reset the sea save at the body cutover (drops the v4 legacy layer). Dash sits outside the three-verb ceiling.
- TierZoo: "really keep going into that direction". Liked: patch notes with a cause, a tier letter per niche,
  strong vs / weak vs, trade-off tooltips. Merge to `main` and prune: "go ahead". Automatic handoff after large tasks.

**Next:**
1. Trim [slice 20](slices/20-join-the-bodies.md)/[20A](design/20a-body-part-contract.md) by deletion: drop the v4 legacy
   layer, legacy representatives and old-build conversion; move Dash outside the ceiling. Settle the two gaps: starter
   eligibility for share codes, and lay snapshots that keep their size ([review](design/m2-review-8-nov.md) §2).
2. Build the 20A pure model and fixtures, then the 20B equipment view, then the cutover with the reset. Play it.

**Open:**
- P47: start era (lean: Cambrian as the open beta); build/moves/EP as the game's words; stat bars in slice 20 or step 6.
- P46: body shape visible only, or small effects. Old share codes after the reset (lean: reject with a message).
- Slice 19 checks: unaided next-patch discovery, 3–5 Lives, a real phone. Founding-map labels; code terms in the UI.
