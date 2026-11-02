# Status

Updated 2026-11-02. **v2, the rebuild. Milestone: M0 (the toy, then the spec) · step 1, the toy** (`ROADMAP.md`,
an AI draft for your approval). Branch `v2`; v1 is committed on `slice-11e` (`ecaff4f`) and moved to `_v1/`.

## Done
- The v1 review and the v2 plan: `docs/design/rebuild.md` (critique; the loop; genome → body → stats → niche; tiles
  for the land, patches for life, with a grid vs patch benchmark; the rebuild; Mycelarium and Hatched).
- Research: `docs/research/mycelarium.md`, `hatched.md`; `real-evolution.md` kept from v1's evolution doc.
- The move: `_v1/` holds v1's code, tests, roadmap and docs. New: `docs/tastes.md` (your tastes, wishes, lessons),
  `docs/ideas.md` (every idea reviewed against v2; the verdicts are AI's), `docs/decisions.md` (v2 log), the roadmap
  draft. CLAUDE.md, the workflow, the commands and the researcher agent point at the new layout. `npm run sim` is
  gone; `npm run check` passes in ~4 s.

## Decided (2 Nov)
- Rebuild; patch model; genome → body → stats; the side-view grow run; niches × tiers with a light ladder.
- Toy first, then the spec; the spec replaces the vision; tastes kept in `tastes.md`.

## Next
1. The toy (`toys/`, built on `toys/specimen.ts`): genes → side-view body → live stats; aimed shoots with a cost
   preview; a brood of 3 → pick the heir; 4–6 seasons. Question: enough decisions, do heirs feel different?
2. Your playtest → `docs/playtests/`. Then the one-page spec (`docs/spec.md`).

## Open
- Your approval of the roadmap draft and of the ideas review (drops wait for your word).
- `main` is still at v1's older state; `slice-11e` and `v2` aren't merged (on your word).
- The root `index.html` points at `src/main.ts`, which is gone until M1; the toys work at `/toys/`.
