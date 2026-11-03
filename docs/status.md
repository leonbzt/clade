# Status

Updated 2026-11-03. **v2, the rebuild. Milestone: M0 (the toy, then the spec) · step 2, the spec.** Step 1 (the
toy) is done. Branch `v2` on GitHub (`leonbzt/clade`, public); v1 is on `slice-11e` and in `_v1/`.

## Done
- Slice 00b built and played (`docs/slices/00b-tree-and-herb.md`): pick Herb or Tree; the tree keeps one body for
  8 seasons (winter wood, spring leaves on the crown's outer twigs, cuts re-sprout, cutting in winter); gene plus
  and minus; every verb preview shows its stat and score change; seeds explained against your genes without verbs;
  buds alternate along their stem. New: `toys/grow-tree.ts`, `grow-explain.ts`, `grow-hud.ts`.
- Playtest 3 notes: `docs/playtests/00-grow-toy.md`. `npm run check` passes in ~4.5 s.
- Nothing committed this session (also last session's doc edits).

## Decided (3 Nov, details in decisions.md)
- The toy is done: "I want to go on to the next phase now to see the vision" → step 2, the spec.
- You liked the tree's look, the spring leaves and cutting in winter; herb and tree play differently.

## Next
1. Commit the toy and the docs (on your word).
2. Write `docs/spec.md` (≤150 lines, from design/rebuild.md, tastes.md, the playtests and the 2–3 Nov calls:
   zoom frame, area goal, skills, moss in M1, growth forms). Options first for the big calls.
3. Set M1's scope in the spec.

## Open
- Playtest 3: "still not a good feeling game"; maybe less autogrowth, you decide each grow step (ideas.md). The spec
  should take a stand on the side view's core verb: a likely first proposal.
- The tree grew too little (`T.tree` in toys/grow-data.ts), if the toy is touched again.
- AI calls in the build, not yours: the herb's 4th seed (season 1: beat your genes alone, then beat last season),
  wood upkeep at 30%, node cap 2600, "Tall herb" renamed "Tall".
- M1's draft scope says "one plant lineage"; moss in M1 means growth forms go into the spec's M1 scope.
- `main` is still v1's older state; `v2` isn't merged (on your word).
