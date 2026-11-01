# Status

Updated 2026-11-01. **Milestone: M1, the first playable · step 1, close out the sim (slice 11e)** (`ROADMAP.md`).

## Done
- **Commits:** `cb2a503` the P30 a–e rebalance (code and tests; `npm run check` passed before it), `e17ade1` the docs
  cleanup, `6726aa6` the 11e spec. No code changed after that.
- **Slice 11e spec:** `docs/slices/11e-close-out-the-sim.md`. Three parts, about one session each: A animals in
  grams (11d part C, swings, the currency in grams), B nitrogen by the gram and the rot chain (N ledger, fungus as a
  decay boost, litter decay ~0.001/s), C real units on screen and small fixes.
- P32 and P33 a moved from proposals to `docs/design/nitrogen-and-time.md` (the numbers for 11e). P33 c now holds
  your species notes and the fitting ideas. The roadmap links the spec; the clock is on the frozen list.

## Decided
- The three-tempo clock waits until after slice 12 or later; a year ≈ 8 min is a display conversion until then.
- How species are made: maybe better after the core gameplay (your lean). Adaptations discovered from random gene
  changes; species as one connected tree; home start leaning algae, cyano, early land plants, if we take the
  full-evolution route.
- 11e: snails are the high-appetite grazer; the whole real-units display goes in now.

## Next
1. Build 11e part A (animals in grams), then check with `npm run sim` before part B.
2. Part B (nitrogen by the gram), with the fragility test (litter decay × 0.5 and × 2).
3. Part C, then your playtest of 11e.

## Open
- Roadmap call 1: M1's goal and "done when". The 25–26 Oct bets under "On hold" in vision.md: which still hold?
- P33 c (how species are made): confirm the "after the core loop" lean at the 12a spec.
