# Status

Updated 2026-10-28 (slice 09 built). Git: `slice-08` (c1f2473); slice 09 code and all doc changes are uncommitted.
`npm run check` passes; `npm run sim` 5×60: 5/5 pass.

## Done
- Playtest notes: `docs/playtests/08-lineage.md`, `docs/playtests/09-splits.md`.
- P17 (splits, recipes, gene meters, distance + fit, the ancestor) and P18 (real species) in `docs/systems.md`;
  rough outline by act in `docs/outline.md` (indexed in README).
- **Slice 09 (splits) built**, spec and build notes in `docs/slices/09-splits.md`:
  - The ancestor "Early land plants" (`src/data/species.ts`), founded from the Land plants node.
  - Doors by recipe (`KEYS`, `KEY` in `src/data/genes.ts`; `src/sim/keys.ts`): Liverworts, Mosses, Vascular.
    Candidates (gold glint), key roll 0.5–3 min, a nudge every 2 min without a candidate.
  - Splits (`src/sim/commands.ts`): the variant's tiles move to the new species, plus a founder patch; a clade
    split keeps axis genes and drops traits. Requirements moved to `src/sim/reqs.ts`.
  - UI: recipes on the tree screen and on variant rows, split buttons. Map: tint by species, cap 4, half sprites.
- Sim: Mosses at 4.3–6.5 min, Vascular at 14.5–24.7 min (now also needs 150 moss tiles).

## Decided
- See brief.md, "Direction (27–28 Oct, after playing slice 08)": splits, clades from your variant, authored clades
  and free species, genes carry, recipes, gene meters with two directions, the ancestor, animals soon.

## Next
1. New session: research and brainstorm systematics for the early to mid game (which groups and branches, for
   plants, fungi and animals); use the `researcher` agent. Animals soon.
2. Commit slice 09 when you're happy (not committed yet).
3. Then slice 10 (readability: gene meters, edge, "why it's winning"), or P18 (real species).

## Open
- Placed organisms lack character ("Early land plants"); P18 is one answer.
- Liverworts' timing varies (5–45 min); with 4 shown variants, busy species show few new ones.
- Older: combos rare; stacked names; refunds; flows (P13), zooms (P15), nitrogen (P11); delete `toys/`?
