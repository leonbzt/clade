# Status

Updated 8 Nov 2026 (Claude). Everything is on `main` (the `codex/*` stack fast-forwarded, old branches pruned; all their
commits stay in `main`'s history). Gameplay is at `13b1ccb`. The long Codex-era status is at `git show 8b5b202:docs/status.md`.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md) with the [20A contract](design/20a-body-part-contract.md): specified, no code yet.

**Done (8 Nov):**
- [Review of the Codex stretch](design/m2-review-8-nov.md): measured state, five problems, next steps.
- TierZoo: [research](research/tier-zoo.md) (glossary; export in `docs/research/tier-zoo-data/`, `wiki.json` gitignored) and
  [concepts for Clade](design/tierzoo-concepts.md) with the term table and a note on what's free to use; open as P47.
- Slice 20 and 20A carry an "8 Nov" note on what the calls below replace; the old text isn't trimmed yet.

**Decided (8 Nov, [decisions](decisions.md#8-nov-review-of-the-codex-stretch-and-tierzoo)):**
- Reset the sea save at the body cutover (drops 20A/20C's v4 legacy layer). Dash sits outside the three-verb ceiling.
- Merge the `codex/*` stack into `main` "if everything is in order", maybe in its own thread. Gitignore the wiki.
- TierZoo: "really keep going into that direction" (the term table and comparisons). Liked: patch notes with a cause,
  a tier letter per niche, strong vs / weak vs, trade-off tooltips.

**Next:**
1. ~~Housekeeping~~ done 8 Nov: docs committed, `npm run check` 7.4 s (steps run in parallel), merged to `main`, branches
   pruned, `AGENTS.md` aligned (saves no priority before release, short docs, 1–2 sessions per slice).
2. Trim slice 20/20A by deletion (legacy layer, Dash in the ceiling); settle the critical review's two gaps.
3. Build the 20A model and fixtures, then the 20B equipment view, then the cutover with the reset. Play it.

**Open:**
- P47: start era (lean: Cambrian as the open beta); build/moves/EP as the game's words; stat bars in slice 20 or step 6.
- P46: body shape visible only, or small effects. Old share codes after the reset (lean: reject with a message).
- Slice 19 checks: unaided next-patch discovery, 3–5 Lives, a real phone. Founding-map labels; code terms in the UI.
