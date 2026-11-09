# Status

Updated 9 Nov 2026 (Codex, slice 22 build). Branch `slice-22-build`, local, not pushed.
**Milestone:** M2, step 6. [Slice 22](slices/22-the-larva.md) part A built; part B follows in this session.
**Checkpoint:** based on `82fddd6`; commit subject `feat(22A): inherit body plans and regrow larvae`.

**Done:** inherited plan beside grown rows, buds with no stats, split moult price, frozen plan at lay, species fills
and branches, kept-card free-place preference, saved plan parts unlock, and v6 with a small v5 migration.
**Verified:** `npm run check` passes (147 tests and Svelte/TypeScript). Two-Life, damage, Signature, plan ceiling,
affordability and migration coverage in `game/tests/plan.test.ts`. Short browser smoke check: larva → regrown eye.

**Next:** finish 22B's bud drawing, prices, hatching and launcher; run the required 360 px browser checks, then hand
Claude the full two-commit diff for review. [Play notes](playtests/22-the-larva.md).
**Still pending:** your 21C play and your slice 22 play; do not tick roadmap step 6 before both.
**Decisions:** unchanged; P48 C, one sea before step 7. No new scope or dependencies.
