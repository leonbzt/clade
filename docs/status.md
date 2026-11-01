# Status

Updated 2026-11-01. **Milestone: M1, the first playable · step 1, close out the sim** (`ROADMAP.md`).

## Done
- **Docs cleanup (this session):** new `ROADMAP.md` (draft), `docs/vision.md` (the old brief condensed to what
  holds now), `docs/decisions.md` (the dated log, plus your calls on P19, P21, P24, P31, P32), `docs/proposals.md`
  (open only: P32, P33 a, P33 c), `docs/ideas.md` (the parking lot), `docs/slices/_template.md`, a `/spec`
  command, and new `CLAUDE.md`, `workflow.md`, `/kickoff`, `/handoff`. Plans moved to `docs/design/`. Archived to
  `_archive/2026-11-01/`: systems.md (P1–P33), brief.md, outline, minigames, species models, the layer-sim review,
  the fresh-eyes session brief.
- **P30 a–e rebalance (31 Oct), built, not committed** (on top of `58ed136`): per-species `renew`; litter frees half
  the nitrogen; the biggest taker holds from 2%; slugs in a small wet niche; habitats show 50 / hide 35. The rot
  chain was refixed (litter decay 0.01, fungus needs litter from 0.008). NaN and over-grazing bugs fixed.
  `npm run check` passed; `npm run sim` 5/5 seeds.

## Decided
- Nothing new this session.

## Next
1. Your check of `ROADMAP.md` (its three open calls) and of `docs/vision.md` (the condensation note at the top).
2. Commit: the P30 code pass, then the docs cleanup.
3. `/spec 11e`: close out the sim (11d part C, nitrogen by the gram, small fixes).

## Open
- Roadmap calls: M1's "done when"; the tempo clock in 11e or after M1; P33 c before 12a.
- The 25–26 Oct bets under "On hold" in vision.md: which still hold?
