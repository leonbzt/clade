# Slice 11e: Close out the sim

**Milestone:** M1, step 1 (from `ROADMAP.md`)
**Question:** with animals and nitrogen in real grams, does the food web hold together, and stay calm when one rate
changes, so the sim can freeze for M1?
**Builds on:** 11d part C ([11d-real-biomass.md](11d-real-biomass.md); your P26 d2 call, 30 Oct). decisions.md,
31 Oct: swings wanted, tiles 10 m, the currency stays Biomass. decisions.md, 1 Nov: nitrogen follows the grams (a1),
the rot chain (b1 + b2), real values as a start, a year ≈ 8 min, the clock after slice 12. Numbers and reasons:
[design/nitrogen-and-time.md](../design/nitrogen-and-time.md).

Three parts, in order, each checked with `npm run sim` before the next.

## In
**Part A: animals in grams** (11d part C, sim side)
- A member's body mass = real mass × `stands`. Intake up to `appetite` × burn; burn = `B` × mass^0.75 (× stress as
  now); kept = eaten × `keep` (~0.3 for grazers and litter eaters, ~0.8 for hunters); the rest is dung, in grams.
- The store `e` (0–1) means up to `store` × body mass. Young cost their body mass; a catch is worth the prey's mass;
  dead members go to litter in grams. The grams ledger includes animals.
- Tiles are 10 m (`NUM.mass.tile` = 100); `stands` scales with it.
- **Swings:** snails get a high appetite and grazes patches to death, crashes, and comes back. Hunters persist
  through `keep` and `B`.
- The Biomass currency counts real grams made (plant growth + young born). Costs × one factor, so the first founding
  comes at about today's time (±30 %). No more tuning: founding changes once runs exist.

**Part B: nitrogen by the gram and the rot chain** (P32 a1, b)
- Each species has a tissue N share (data, from the real values). Production takes production × share from the
  tile; with too little, production slows.
- Litter carries the N of what fell (a hidden litter-N stock per tile). Decay frees it; a `leak` share (start 10 %) is
  lost, the rest becomes available N.
- **Fungus speeds decay** on its tile instead of making N. Its need, and eaters' `full`, are in years of litterfall.
- Fixers (crusts, lichens) add N per gram they make. Rain adds a little everywhere (an outside input).
- Dung carries the food's N minus what the body keeps; bodies carry theirs into litter.
- **Litter decay to the year:** ~0.001/s (now 0.01), so the floor holds 1–3 years (8–24 min) of fall.
- The nitrogen layer's unit becomes a real amount (a few g/m²); needs are rescaled with it. An **N ledger** beside the
  grams one: in (fixed, rain), out (leak), and the change in plants, litter, animals and the soil pool.

**Part C: real units and small fixes**
- The top bar and costs in g → kg → t. The tile card: soil in cm, light %, moisture %, N and litter in g/m², litter in
  years of fall. Populations as real counts and densities; habitats in hectares; slot sizes with productivity per
  m². A scale bar.
- Fewer headlines (a higher bar or a per-habitat cooldown). Bristletails eat dry crusts first, litter second.
  Refounding a springtail with insect traits makes a bristletail. A sim line: N by source, litter in years of fall.

## Out
- The three-tempo clock: your call, after slice 12 or later. Until then a year ≈ 8 min is a display conversion
  (ideas.md, design/nitrogen-and-time.md).
- Leak as a mechanic, humus, geology, more nutrients, food quality as C:N (ideas.md).
- How species are made (P33 c; your lean: after the core loop) (proposals.md).
- Juvenile growth, sprite size by mass, the food-web view, seabird hotspots, trees, more animals (ideas.md; frozen
  until M1 is played).

## Done when
- [ ] A: hunters alive on ≥ 4/5 seeds at 60 min; a grazer swings (a local crash and return) on ≥ 2 seeds; the grams
  ledger balances within 0.1 % with animals; the first founding within ±30 % of today; tick cost ≤ +20 %.
- [ ] B: the N ledger balances within 0.1 %; N only enters through fixers and rain; litter holds 1–3 years of fall.
  **The fragility test:** litter decay × 0.5 and × 2 keep fungus and ferns alive on 5/5 seeds.
- [ ] C: every number on the board, top bar and tile card is in real units; ≤ ~20 headlines an hour after 30 min;
  both bugs gone.
- [ ] `npm run check` passes; `npm run sim` 5/5 seeds.
- [ ] Your playtest notes are in `docs/playtests/11e-close-out.md`: does the web feel alive but steady? Do the
  numbers feel real? Do the swings read?

## Size check
- New systems: one, the nitrogen ledger (N follows the grams). Part A finishes 11d's grams.
- Touches sim structure: yes (A and B), on your calls of 30 Oct and 1 Nov. The sim freeze starts after this slice.
- Three parts, about one session each. C can ride along with B if there's room.

## Your calls (1 Nov)
1. Swings: snails get the high appetite (on ground plants); slugs stay in their small wet niche.
2. Part C: the whole display list now.
