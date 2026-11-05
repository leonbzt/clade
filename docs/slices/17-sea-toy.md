# Slice 17: the sea toy

**Milestone:** M2, step 2 (from `ROADMAP.md`)
**Question:** Does the map feel alive?
**Builds on:** "patches that are really goverened and booms and crashes happen. species spreading and only few named rules"; "the
overview map is very important for feeling"; "populations shod be abe to crash"; 8 h catch-up about 5 s (decisions.md, 5 Nov);
[review](../design/world-and-body-review.md) §4, §5.

## In
A throwaway page, `toys/sea.html`, with no Life: only the sea, watched and poked. Nothing goes into `game/` yet. The model and all
numbers below are *proposal*.

- **Patches.** The real island (`makeIsland`, `drawIsland`). Shallows up to 5 tiles from land (median 1,144 tiles over 200 seeds), cut
  by the finder from `src/sim/habitats.ts` into chunks of about 16 tiles: **about 70 patches.** Ground comes from the nearest coast:
  beach → sand, lava → rock, the rest → mud. A patch holds mats, rot, oxygen (no new stock) and its populations.
- **Real populations.** The 9 natives, scored by ground as in `NATIVES`. Each generation a species eats from its stock with a
  saturating intake, then breeds from what it ate, with no capacity. Hunters breed from prey the same way, so they lag. That overshoots
  by itself. Below 1, a population is gone from that patch.
- **The few rules, and nothing else:**
  - grazers eat mats
  - burrowers eat rot and stir oxygen
  - hunters take prey, the commonest most
  - deaths become rot, and rot uses up oxygen
- **Spreading.** Hungry populations flow across patch borders, by shared border length. A trickle arrives from the open sea at the
  outer patches, so a wiped-out species can come back. Natives can only enter ground they have a score on, so a burrower can't live on sand.
- **Shocks stay,** one patch at a time: storm, mudslide, vent surge (`WORLD`).
- **The map.**
  - Each patch is painted in the colour of its most numerous prey species, brighter when full and dark when crashed. Colours fade between generations.
  - Views: holder, mats, oxygen, hunters.
  - Small creatures roam, capped as in `toys/garden-view.ts`, so it moves between generations.
- **Tap a patch:** the card's bars with a "normal" mark (Surface, Buried, Prey, Oxygen, as in slice 16), the species rows, and one small history graph of the last 60 generations.
- **Headlines with causes.** "Wiwaxia crashed on 5 sand patches: mats ran out, 62 → 9." Neighbouring crashes merge into one line, and
  tapping a line shows its patches.
- **Poke it.** Tap a patch and release 30 of your line, picking its role and tier. It shows in one bright colour, so you can watch it
  spread, boom or die.
- **Time.** Pause · real speed (a generation every 3 min) · 1 a second · 4 a second · **Skip 160**, which shows the "While you were
  away" list (five lines at most) and how long it took.

## Out
- A Life or real boards in the toy, the map in the game, saves: step 3.
- "What changed" on the start card: step 4.
- Habitats changing shape (sand to mud): after this toy, if the map lives; one line in `ideas.md`.
- New forms turning up by themselves, gene pips, land life, filter feeders and sponges: `ideas.md`, M3.
- Banked offline time: stays in `ideas.md`.

## Done when
- [ ] In play: you can name a boom, a crash and a spread you just watched, and say why each happened.
- [x] A model test on 3 seeds over 160 generations, in under 1 s (all 8 tests take about 0.7 s). Starting bars, to be tuned by feel:
  - at least 20 local crashes, and a patch's crashes come 5–50 generations apart
  - fewer than a third of the patches crash at once, so the whole map doesn't pulse
  - no species holds over half the patches for 40 generations in a row
  - no role is gone from the whole map for more than 20 generations
  - your line can take a patch and lose it
- [x] A generation costs well under 30 ms, shown in the toy (0.3–0.6 ms; Skip 160 about 60 ms).
- [x] `npm run check` passes; the test is `game/tests/sea.test.ts` (toys aren't in the typecheck otherwise).
- [x] A toy column in `docs/design/tradeoffs.md`.
- [ ] Your verdict in `docs/playtests/17-sea-toy.md`.

## Size check
- New systems: one, patches with populations, replacing the garden model if the answer is yes. No new stock; natives stay at 9.
- Touches sim structure? No, `game/` is untouched.
- Fits one or two sessions; tuning is the unknown, so the model comes first and the map second, with a look at each.

**Risks.** The natural failures are all-or-nothing swings, one species taking everything (v1's moss), and the whole map pulsing as one.
The test catches these, and the feel is still yours. If the answer is no, we learned it for the price of a toy, and the review's plan
for steps 3–4 changes.

## Changed while building (5 Nov, proposal)
- **Ground:** most of the coast is bare ground, so "the rest → mud" gave 75% mud and one species held the map. Bare coast now takes long arcs of mud or rock, by the seed.
- **Headlines:** the same story within 4 generations is one line anywhere on the map, not only between neighbours; neighbour-only left three identical lines in one generation.
- **Measured (seeds 1–3, 160 generations):** 321–357 patch crashes; the median gap is 26–29 generations (the middle 80% of gaps: 19–54); at most 9 patches at once out of 66–73; no species over half the map for more than 19 generations in a row.
- **Known weak spots:** Anomalocaris takes nearly all the hunting (at the end of the runs, Ottoia and Sidneyia number 4–21 across the whole map, Anomalocaris 600–1,197), and each patch's cycle is fairly regular.

## Answered (5 Nov)
- A generation stays 3 min "for now". Crash pace: "depends on real dynamics but every 5-50 gens". About 70 patches: "sounds good".

## Open questions (three at most)
None right now.
