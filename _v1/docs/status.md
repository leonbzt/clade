# Status

Updated 2026-11-02. **Milestone: M1, the first playable · step 1 (11e, now with part D) and step 2 (12a parts A and
B) built, both waiting on your playtest** (`ROADMAP.md`). Branch `slice-11e`; the 11e playtest fixes are committed,
the 12a work, part D and the doc edits are uncommitted on it.

## Done
- **The evolution plan:** `docs/design/evolution.md` (today's genes, variants and tree; real evolution; game vs real;
  route B, runs make species; authored vs free; route C with genome v2; work and risks).
- **11e part D** (`src/data/genes.ts`, spec `docs/slices/11e-close-out-the-sim.md`): stem doors (Leafy and Upright
  only from early land plants); Dry trades shade tolerance (−0.08/−0.15), Wet widens it. Check passes; sim 5/5,
  Mosses + Vascular 5/5; Upright now from early land plants, ~2 min later.
- **12a A and B** (other session; build notes in the spec): runs, seasons, broods, heirs, keys on runs, founders from
  any living line species. Tests `tests/islands.test.ts`, `tests/runs.test.ts`. Dev: `?bot=600&run=0`.

## Decided (1 Nov)
- Route B now, into C with genome v2 (M4); merge back if not diverged enough; stem doors; new clades through runs;
  "discovering life yourself". P35: part D now; "author the laws, not the history"; recipes hinted step by step.

## Next
1. Your 11e playtest → `docs/playtests/11e-close-out.md`; then commit and merge `slice-11e` (only on your word).
2. Your 12a playtest → `docs/playtests/12a-the-first-run.md`.
3. The 12b spec with route B: merge-back threshold (AI: Rare+ from its parent, or a key), birthplace tag, the home
   split goes, the lineage's family tree. Then part C's spec and the M2 scope call.

## Open
- Moss stays 96–100% Dry at home (born Dry); the wet sister comes from runs. Watch: early land plants thin to
  80–414 tiles by 60 min (runs start from them); bot-made home species alive 10 min later 1/5 (part D or 12a?).
- 12a's AI fill-ins; a small dry island is about as wet as home; part C vs M2. 11e tuning to watch (beetles, snails).
- `.claude/agents/researcher.md` has an uncommitted edit that isn't AI's (yours?). Roadmap call 1: M1's goal.
