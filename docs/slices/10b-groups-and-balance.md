# Slice 10b: Groups and a balance pass

**Question:** with animals as groups, does the island read calmly (a few sprites, high real numbers), with food
rather than caps limiting each population, snails that spread inland, and nitrogen that still differs clearly
across the map?

Builds on slice 10. From P21 a–c and the slice 10 playtest ([playtests/10-first-animals.md](../playtests/10-first-animals.md)).
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

### Settled groups *(P21 b)*
- **Slow tick:** a group that is fed, wasn't hunted in the last ~30 s and isn't moving counts as settled. It
  updates every 10 ticks with 10× dt, at a fixed offset by id, so `npm run sim` stays reproducible. Anything that
  wakes it (hunger, a hunter on its tile, a crowded tile) puts it back on the fast tick.
- **Merging:** two groups of the same variant on one tile merge when together they're under half the split size.
- No camera rule: the sim never depends on what you look at.

### Balance *(structure, not the final numbers)*
- **Snails move on:** a hungry animal (eating less than its upkeep) looks twice as far, and wanders when the best
  spot it sees is barely better than where it is (not only when nothing has food). Dispersal does the rest.
- **Litter eaters are food-limited:** lower gain and a higher rate, so they really draw litter down and the
  island's litter supports a target population. Springtails become the broad base of the food web; that's fine.
- **Nitrogen is conserved:** litter decay releases a share of what decays as nitrogen on its tile (new stock option,
  e.g. `into: { nitrogen: 0.3 }`). Litter eaters turn eaten litter into nitrogen at **no more** than that share.
  Eating speeds the flow up; it doesn't add to it. Check snail dung the same way against what grazed cover would
  give as litter.
- **Predators damped:**
  - **Handling time:** after a catch, a hunter rests for a while (scaled by what it caught).
  - **Refuges:** prey on tiles with thick ground cover are harder to catch.
  - **Territory:** hunters don't hunt on a tile where another of their kind already is; they move on.
  - Beetles eat snails less often than springtails.
- **A small curve model:** per animal, an expected size = the food its diet finds on the island ÷ what one member
  needs (upkeep ÷ gain), in a few lines. The dev panel shows it next to the real count.
- **Bitter:** check after the fixes. If it still loses under snails, lower its growth cost.

### View *(animals only)*
- A group draws 1 sprite for a few members, up to 3 for a full group; swarms as 3–6 hopping dots as now.
- A minimum sprite size at the fit zoom, so animals don't vanish.
- Overview zoom (fit or wider): no animal sprites; the Animals view shows a tint by members per tile.
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
- [ ] `npm run check` passes. `npm run sim` 5×60 (5/5 pass):
  - the slice 10 checks still pass (both arrivals adopted; snails and springtails alive at 60 min; moss above
    half its peak)
  - no animal species is above 80% of its cap at 60 min
  - snails have spread at least 8 tiles from their landing beach 15 min after adoption
  - **nitrogen contrast:** the top tenth of land tiles holds at least as much more than the median as at
    `slice-09` (a new metric)
  - beetles are alive at 60 min in 4 of 5 runs, and snails never drop below a fifth of their peak after beetles land
  - total agents stay under ~400 at 60 min; a tick stays under ~3 ms
- [ ] A unit test: a group splits at its size, and the split-off half walks away before it eats.
- [ ] A unit test: a settled group on the slow tick ends within 5% of the same group on the fast tick over 60 s.
- [ ] A unit test: litter eaten by animals adds no more nitrogen than the same litter decaying.
- [ ] A unit test: a hunter rests after a catch, and prey in thick cover are caught less often.
- [ ] **You:** few sprites, the island reads calmly; snails leave the beach; regions still differ; bitter mosses
  show up where snails graze.
