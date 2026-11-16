# Slice 13: the garden and the island

**Milestone:** M1, step 6 (ROADMAP; built before 12, as plan.md allows)
**Question:** do open niches pull you back into another Life?
**Builds on:** plan.md and decisions.md, 5 Nov: the island map with three habitats; a habitat card with niche rows × tiers,
open and contested niches first, news underneath ("a with news"); keep the toy's garden and stop one winner; filling a niche
= C (pick the gap, get that role's base body, it counts only if you lived that way); the one door; playtest 08: "really felt
sad i couldn't play to fill the other niches", liked the bars, skipping and the overview.

## In
- **The island** from the ported generator (`game/src/sim/island.ts`), drawn as a pixel map; the three habitats are areas in
  the sea off its coast: sand shallows off a beach, volcanic rock off the lava coast, mud flats where a stream comes down.
- **A habitat card** per habitat: three niche rows (Grazer, Burrower, Hunter), each a ranked list of species with tier
  letters and population bars; open and contested rows first with their call ("Hunter: none of yours. Rank to beat: B");
  the habitat's news underneath. Tapping a row starts that niche's Life: grazer → arthropod, burrower → worm, hunter →
  swimmer (the base body), with the verb loadout for grazers.
- **The garden** (ported from `toys/garden-sim.ts`): per habitat, stocks (mats, rot, oxygen) feed the roles; species share a
  role by score; hunters eat prey; crowded species spill into neighbours; natives you beat adapt; shocks. **Self-limit**
  *(proposal from R5, taken)*: no species can hold more than 60% of its role's room, so one winner never takes the row.
- **The one door:** the garden writes the board (food counts follow the stocks, the top grazer and burrower are the rivals,
  the top hunter that isn't yours is the hunter, prey follow the prey populations); the Life hands back eggs and the role
  its diet earned. A Life counts in the niche you actually lived.
- **Time:** a generation every 3 minutes, two more after each Life, a Skip button (+10). **Offline:** up to 8 h of
  generations when you come back, with a "While you were away" card. **Save** in the browser (versioned saves are slice 15).

## Out
- The clutch (slice 12, next), your predator as the hunter (14), generated habitats, filter feeders (M2).

## Done when
- [ ] From the island you pick a gap, live it, and see your line enter that row; coming back, the rows have moved.
- [ ] `npm run check` passes; the garden step < 0.1 ms; 8 h offline < 0.5 s (tests).
- [ ] Your notes are in `docs/playtests/`.

## Size check
- New systems: the garden (ported) and the island (ported). Two, but both ports; the card is UI. One long session.

## AI choices to judge
- The niche → body mapping; the 60% self-limit; one tier scale for all three habitats (S 40, A 28, B 18, C 10, D 4).
- The natives per habitat and their scores (from R2's species table, composite Cambrian).
