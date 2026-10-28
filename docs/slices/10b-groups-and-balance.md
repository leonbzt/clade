# Slice 10b: Groups and a balance pass

**Question:** with animals as groups, does the island read calmly (a few sprites, high real numbers), with food
rather than caps limiting each population, snails that spread inland, and nitrogen that still differs clearly
across the map?

Builds on slice 10 (tag `slice-10`). From P21 a–c and your calls on 28 Oct and the slice 10 playtest ([playtests/10-first-animals.md](../playtests/10-first-animals.md)).
Readability of genes and variants (P17 e, f, tooltips) stays in slice 11. This slice fixes the structure, not the
final numbers (P21 c).

## In scope

### Groups *(P21 a)*
- Every animal agent is a group. `group` in the body is its split size: snails and slugs ~12, springtails ~200,
  bristletails ~10, beetles 1 (they stay individuals). Tune by feel.
- Arrivals bring a few groups, each about half full.
- **Breeding adds members.** At the split size the group splits in two (as swarms do now).
- **Dispersal:** the half that splits off picks a target 4–10 tiles away on land and walks there before it eats or
  breeds. It can mutate at the split (one genome per group; the chance is per split, tuned so variants still show
  up about as often as in slice 10).
- Upkeep, eating and corpses already scale with members. Hunters bite `bite` members.
- **Counts are members:** variant rows, population bars, the spindle and the caps (raise the caps to match, as a
  safety net only).
- **Card:** "Snail family #14 · 12 snails · Wet variant"; log as now ("split in two; half went inland").

### Pace and settled groups *(P21 b, your calls)*
- **Pace, like metabolism:** each animal updates every `pace` ticks with the time since its last update (snails 4,
  slugs 3, springtails and bristletails 2, beetles 1). A data number now; a gene can change it later (P22).
- **Settled groups slow down:** a group that is fed, wasn't hunted lately and isn't moving updates 3× less often.
  Hunger, a hunter on its tile or a crowded tile wakes it up.
- **Batching:** each animal keeps the tick of its last update, started at a random offset, so updates spread
  evenly over the ticks instead of all at once. Reproducible (seeded rng).
- **Merging:** two groups of the same variant on one tile merge when together they're under half the split size.
- **Plant old growth:** a plant slot at steady health and nearly full cover updates every 4 ticks with 4× dt (by
  slot offset). Anything that changes it (a fit change, grazing, a takeover) puts it back on every tick.
- No camera rule: the sim never depends on what you look at.

### Balance *(structure, not the final numbers)*
- **Snails move on:** a hungry animal (eating less than its upkeep) looks twice as far, and wanders when the best
  spot it sees is barely better than where it is (not only when nothing has food). Dispersal does the rest.
- **Litter eaters are food-limited:** lower gain and a higher rate, so they really draw litter down and the
  island's litter supports a target population. Springtails become the broad base of the food web; that's fine.
- **Nitrogen: animals keep releasing it (your call), but none is made from nothing.** Litter carries a nitrogen
  share: when it decays it releases that share on its tile (new stock option, e.g. `into: { nitrogen: 0.1 }`).
  Litter eaters release the same share of what they eat, sooner and in dung hotspots. Snail dung likewise matches
  what the grazed cover would have given as litter. Check the plants' balance: decaying litter is a new nitrogen
  source for them.
- **Predators damped:**
  - **Handling time:** after a catch, a hunter rests for a while (scaled by what it caught).
  - **Refuges:** prey on tiles with thick ground cover are harder to catch.
  - **Territory:** hunters don't hunt on a tile where another of their kind already is; they move on.
  - Beetles eat snails less often than springtails.
- **A small curve model:** per animal, an expected size = the food its diet finds on the island ÷ what one member
  needs (upkeep ÷ gain), in a few lines. The dev panel shows it next to the real count.
- **Bitter:** check after the fixes. If it still loses under snails, lower its growth cost.
- **Founding cost per clade:** a split costs `speciate.base × growth^n`, with n counting the species already made
  **in that clade** (not on the whole island), and a gentler growth (2.5 → 1.8). Re-founding a species grows ×2
  instead of ×3. By feel.

### View *(animals only)*
- Up close a group draws 1 sprite for a few members, up to 3 for a full group; swarms as 2–6 hopping dots.
- At the fit zoom a group draws one sprite (its leader), so the island stays calm but alive. The Animals view
  shows a tint by groups per tile.
- Smooth movement between ticks (draw between the last and the current position).
- Animals on the tile card: groups and members per species.

### Dev panel
- Per animal species: groups, members, expected size, and share of its cap.
- Total agents, share settled, ms per tick.

## Out of scope
Contrast from climate (wind side, height, disturbance: P21 d, for after this), regions and zooms (P15), gene meters
and "why it's winning" (slice 11), new animals, spiders, fleeing, plant patches, offline catch-up, the player's
part (P21 e, a planning thread next).

## Done when
- [x] `npm run check` passes. `npm run sim` 5×60: **4/5 pass** (seed 3 fails: clubmoss holds 64% of its stratum; the
  limit is 60%, and `slice-09` had 58% on one seed). Against the checks:
  - slice 10 checks: arrivals adopted; snails and springtails alive at 60 min in 5/5; moss above half its peak 5/5
  - no animal species above 80% of its cap: yes (the fullest: slugs at 55%)
  - snails spread ≥ 8 tiles from the landing beach 15 min after adoption: yes (15–75 tiles)
  - nitrogen contrast: median/top 0.02–0.08 / 0.08–0.21 (slice-09: 0.02–0.08 / 0.09–0.11; slice 10: up to 0.36)
  - beetles alive at 60 min: 5/5, but only 1–3 of them. Snails stay small anyway (13–46), so the "fifth of their
    peak" check says little; not measured
  - agents 34–75 at 60 min; a tick 3.0–4.7 ms (slice 10: 3.8–5.1). Under 3 ms not met; plants are most of it
- [x] Tests (kept few): a group splits and the half walks off; a slow-paced snail spends the same energy as a fast
  one; eaten litter (and prey) releases no more nitrogen than decaying litter (it caught the beetles at 0.1).
- [ ] **You:** few sprites, the island reads calmly; snails leave the beach; regions still differ; bitter mosses
  show up where snails graze.

## Build notes *(28 Oct)*
- **Groups:** family (snails, slugs, 12), swarm (springtails, 200), troop (bristletails, 10); beetles single.
  Counts: `count` and caps are groups, `members` is animals (bars, tree, species list, tile card, dev panel).
  A variant is shown at 5 members.
- **Mutations:** a group's young bud off as a small new line with a chance per breeding (up to 10%), so mutation
  supply follows births. Without this, slugs and insects never came.
- **A group ages by members** (a few die now and then, the group goes on). Whole swarms dying of old age at once
  was the first big loss.
- **A group feeds on the 3×3 around it, richest tiles first**, as its members would. A family stuck on one tile
  starved next to good moss.
- **Moving on uses the real cost** (upkeep with the fit stress). Snails used to sit on salty beach tiles where they
  just broke even. Hungry animals look twice as far and only wander to tiles they can live on.
- **The half that splits off** walks to the best of 8 spots 4–10 tiles away (food × fit).
- **Litter eaters have a `full` level** (springtails, bristletails 0.3): they hold litter near 0.15–0.2 instead of
  0.06. At 0.06 fungi starved, and with them the nitrogen for clubmoss and ferns.
- **Nitrogen share 0.03** for decaying litter and every animal that eats litter or prey. At 0.1, the extra nitrogen
  fed clubmoss and ferns, their shade pushed out the lichens, and moss took the island (the slice 10 effect).
- **Pace:** snails 4, slugs 3, springtails and bristletails 2, beetles 1; settled ×3. 10–30% of agents settled.
  **Plant old growth** every 4 ticks. **Founding cost** per clade, growth 1.8; re-founding ×2.
- **Not done:** a minimum sprite size at the fit zoom (one sprite per group instead). Not checked in the browser.
- **Open for your feel pass:** springtails are food-limited now but few (420–710); snails small (13–46); beetles
  1–3; bristletails died out on one seed. Idea: springtails mainly eat fungi (real: they graze hyphae), making a
  chain litter → fungi → springtails → beetles.
