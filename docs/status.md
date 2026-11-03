# Status

Updated 2026-11-03. **v2, the rebuild. M0 (the toy and the spec) is done: both steps ticked. Next: M1, the first
playable** (the roadmap still lists M0 under "Now" until you say to move M1 up). Branch `v2` on GitHub
(`leonbzt/clade`, public); v1 is on `slice-11e` and in `_v1/`.

## Done
- Committed the toy and the docs: `a6adf02`.
- **`docs/spec.md` written** (123 lines, "sounds good"): run with pulses, moss / herb / tree, one line branching into
  lineages, the garden on patches with 3 stocks and 8 niches, the tier list and ladder, biomass and sprouts, budgets,
  M1's scope and a build order (§7).
- `ROADMAP.md`: step 2 ticked; M1's scope points to spec §7, with the one-pass build.
- Not committed: the spec, ROADMAP, decisions, ideas, status.

## Decided (3 Nov, details in decisions.md)
- **Oneshot M1:** the spec, then M1 in one build pass, bare ("without full expanded rules and upgrade paths").
- **Core verb: pulses** that wait for your pick (tip, and shoot, leaf or root); the genes decide how; auto when idle.
- **Moss, herb and tree in M1**, along the ladder. **Tier: score, then area** (area is the goal and pays).
- **Runs on a home-island habitat.** Garden: **steady, "but needs to stay interesting".**
- **"One line that evolves into lineages that you do the runs with."**
- **Run cost coupled with an opportunity** (a rare gene in the garden, an event or an unlock) → sprouts in the spec.
- **No "Scree" or "Loam"** → Lava → Bare ground → Forest floor (your words from tastes.md).

## Next
1. Commit the spec and docs; move M1 to "Now" in the roadmap (both on your word).
2. Build step 1 of spec §7: `src/data` + `src/sim`: island (port v1's generator), habitat finder, garden step,
   tests for 10 h and offline under budget.
3. Then the run with pulses (from the toy), then the loop end to end in Svelte.

## Open
- Sprout pace (lean: ~one per 10 min early) and wilting (lean: hold 3, the oldest wilts): set by feel in the build.
- AI proposals in the spec, yours to change: score³ share, the 8 niche names and weights, B opens the next form, the
  half-year, the clade tree kept plain in M1.
- `main` is still v1's older state; `v2` isn't merged (on your word).
