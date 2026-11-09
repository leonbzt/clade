# Slice 22: The larva, a body you keep growing

**Milestone:** M2, step 6 ([ROADMAP](../../ROADMAP.md)): the climb, after slice 21. *Decided 9 Nov:* P48 C, built in
step 6 before step 7, in the one sea.
**Question:** If my species keeps its whole grown body and each Life regrows it from buds, does that stop the
starting over while still leaving me a choice in every run?
**Status:** spec 9 Nov, questions answered the same day. Parts A and B are built in order, one commit each, with a short play after each.
**Builds on:** [decisions](../decisions.md), 9 Nov: P48 C (A now: a species keeps its whole grown body as a plan, a
Life starts as a larva with that plan's parts as buds, and moult food grows a bud cheaply or puts a new part in a free
or swapped place at a higher price; B's part variants come with step 7). From the 21B play: "you don't have to start
over and over but still have something to do in each run". This replaces "species = launch bodies" (9 Nov).

## Cause
A species saves only the body it launched as plus the kept card. Each Life regrows the same opening and loses its
moult picks (21B play: "it might just be the fresh start over and over").

## 22A: the model (rules and tests)
1. **The plan.** A species holds a plan, one row per place (today's `rows`). A Life carries its plan next to its
   body. The plan starts as the launch design and changes only with moult picks, never with a tear. The lay freezes
   the plan along with the clutch, as `laid` does today, so only what was planned at the lay passes on.
2. **The larva.** A Life starts at size 1 with the body's defaults and the line's Signature parts grown. Every other
   planned row is a **bud**: drawn on the body, but with no verb, effect, upkeep or guard until it grows, so a larva
   is cheap to run. A default part keeps working while a variant bud waits on it (a walking leg under a
   walking/raking bud). Presets and launcher designs also start as buds: one rule for every start.
3. **The moult** still adds one size and fills one place, now at two prices:
   - **grow a bud:** about half of today's moult cost, rounded up;
   - **a new part** (from the line's pool, a habitat rare or the kept gene) into a free place, or over a bud or a
     part (a swap): today's cost.
   You can also take neither and grow a size only, at the bud price. Every change must keep the whole plan legal
   (anatomy, the 3-verb ceiling), so every bud can always grow. `moult()` charges the bud price, and `pick`
   charges the rest for a new part. Headline: a plan of four buds is back by the last moult, for less food than
   today's opening; each change from the plan costs about double.
4. **Species: a fill keeps it, a swap branches it.** A Life with eggs saves its frozen plan. If it launched from a
   species and only filled free places, that same species is updated in place (rows, best tier, last Life) and moves
   to the front. If any held place changed, or a launcher design matches no species, a new species is saved, named
   as today. The plan's parts join the line's pool, so a rare that was laid can launch again.
5. **The kept card** unlocks its part as today and goes into the saved plan as a bud. It takes a free place first,
   which fills the species. If no place is free, it takes its first legal place, which is a swap and names a new
   species ("Worm 3 (gill)", as today).
6. **Save v6:** `launch` gives way to the plan. A v5 save keeps its lines and species if that costs only a few lines
   (their rows are valid plans). If not, it drops, as decided 8 Nov.

## 22B: in play
- **The larva on the board:** buds are drawn small and pale at their places (`view/body-parts.ts`), in
  `LifeBody.svelte`, and faded in `Slots.svelte`. Size 1 is called "Larva" (`STAGES[0]`).
- **The moult offer:** your buds come first ("Grow Tentacles · 2 food"), then the new parts with their price and
  what they replace ("Gill over the Chaetae bud · 5 food · a new species"). Anything you can't afford is greyed out.
- **Hatching** shows the plan as old → new, then says "Worm 2 grows" (a fill) or names the new species (a swap).
- **The launcher's** species chips draw their plans as buds; the close-up lists each species with "4 of 5 places".

## Build brief (Codex; one commit per part)
Read `AGENTS.md`, this spec and `docs/status.md`. Files stay under ~400 lines; `life.ts` is 363, so the plan logic goes
in a new `sim/plan.ts`. Body stats keep reading grown rows only, and buds sit beside them. The bud share is a number
in `data/life.ts` `RULE`.
1. **22A.** Tests (`tests/plan.test.ts`) play two Lives of one species and check that:
   - Life 2 starts with Life 1's picks as buds, and regrowing them costs less food than Life 1's opening;
   - a fill keeps the species and a swap branches a new one;
   - a tear leaves the plan alone;
   - a Signature part starts grown;
   - no change can take the plan past 3 verbs.
   Update the 21B tests that assume launch bodies.
2. **22B.** Run `npm run look` at 360 px on: a larva with buds, the moult offer at both prices, and hatching for both a
   fill and a branch.
- **Checks:** `npm run check` stays under 10 s.

## Out
- B's part variants from hatching ("long proboscis"): step 7, with the new lineages (P48 C).
- Several seas: future work. The server select would pick the era and a rough region (*decided 9 Nov*; ideas.md).
- A moult that ranks up a held part once the plan is full ("make the body then just grow"): ideas.md. Revisit after
  22's play.
- Respec, renaming or merging species: ideas.md. Bud and part prices beyond the headline: by feel, step 10.

## Done when
- [ ] 22A: the model tests above pass; `npm run check` passes.
- [ ] 22B: in play, my second Life of a species starts as a larva with my last body as buds. I regrow it faster and
  spend what's left to change something, and a change that lays well becomes a new species.
- [ ] Your notes are in `docs/playtests/22-the-larva.md`; then tick roadmap step 6 (with 21C).

## Size check
- New systems: none. A bud is a state of a planned row, and the moult price splits in two. No new stock, stat or gene.
- Touches the sim: `body.ts`, `life.ts` (start, moult, pick, lay), `lineage.ts` (species as plans),
  `sea-life.ts`, `sea-save.ts`. About one session per part.

## Open questions
None. Answered 9 Nov ("defaults are fine"): presets and fresh designs start as buds; the kept card goes into the plan
as a bud; a bud costs about half a moult.
