# Status

Updated 9 Nov 2026 (Claude). Branch `slice-20a-model`: 21A and 21B built, **not committed** (you didn't ask).

**Milestone:** M2, step 6, [slice 21, the climb](slices/21-the-climb.md). 21B built; play it next, then 21C.

**Done (9 Nov), 21B, plus the 21A play notes** (triage at the end of [playtests/21-the-climb.md](playtests/21-the-climb.md)):
- **Species are launch bodies** (*decided 9 Nov*): a species is the body a Life started as plus the kept gene
  (`sim/lineage.ts` `speciesOf`; the Life and the pending result carry `launch`, validated in `sea-save.ts`).
- **Hatching** (`ui/Hatch.svelte`, replaces `Clutch.svelte`): eggs open into genes, "New" ones marked; the kept one
  shows on the species' slots as old → new and names it. Then the **XP screen**: the bar fills level by level with
  its unlock lines, the kept gene and species, and a recipe met draws the new form.
- **The close-up** (`ui/LineView.svelte`, from the map's line rows in `Lines.svelte`): XP bar, the level track with
  unlock icons and the end point, a species drawn with its slots; tap a slot for the parts that fit there, their rank
  pips, effects in words and the buy buttons; the species list; recipe hints with the levels still needed.
- Shared: `ui/line.ts` (words and numbers), `Creature.svelte`, `XpBar.svelte`; Enhanced names its effect.
- Fixes: moult view shows each part once (its places light up, tap one); upkeep number on every slot; launcher
  shows the newest three species and starts on the newest; a Dev button on the map; the patch card no longer shows
  as an empty box behind the launcher (`.metaWrap[hidden]`).
- Checked in Chrome (faked a finished Life): hatching, XP screen, close-up buying, the moult view.
- `npm run check`: 129 of 130 pass, about 8.5 s. `garden.test.ts`'s step budget (0.1 ms) fails under the parallel
  run at 0.108 ms and passes alone; it was flaky before, and a new test file adds load. svelte-check is clean.

**Next:**
1. Play 21B: `npm run dev`; the map's Dev button has "+100 line XP" and "Open all lineages". Notes in the playtest.
2. 21C (the tree of life screen, watching it spread), without a new spec round. Commit when you say so.

**Open:**
- The garden budget test: loosen it, or run it alone (your call if it keeps failing).
- Ideas parked 9 Nov: grown parts kept over runs, a wild moult offer, recipes from real traits (legs), a stronger
  build identity. Upkeep "seems really high" (step 10). The map is "clunky and rough" (step 9). P47 questions, P46.
