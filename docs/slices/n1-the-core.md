# Step N1: The core

**Milestone:** M2, step 8, N1 (from `ROADMAP.md`) · 2 sessions · in `clade/`
**Question:** Does each habitat have a tier list you believe? Pick a build: the preview gives its letter in every
habitat. Place it and skip 100 generations: does it spread where the preview said and hold where it is strong, and
do the populations swing and settle?
**Builds on:** decisions.md, 10 Nov (the rebuild; only opened lineages live in the sea; §2 and §3 decided; exposure
has no rule in N1). [whole-game-build.md](../design/whole-game-build.md) §3 (the sea step), §4 (families), §6
(records, `fitness`, the one curve, the laws), §8 (port list); [whole-game.md](../design/whole-game.md) §4 (the tier
card's three sentences; mat, plankton and detritus as foods).

## In (parts in order)
**Session 1: the rules, tested, no screen.**
- **A. The records** (`sim/records.ts`): §6's interfaces as written. Fields no N1 rule reads (`gate`, `mechanic`,
  `endpoint`, `debated`, `stamp`, `job`, `beats`) are typed and filled in data, unused. N0's `Habitat` gains `stocks`
  and `pops`. One world record: seed, stocks, pops, species, lineages, generation. Nothing derived in it (law 2).
- **B. The data.** `data/parts.ts`: one part table in §6's shape, ported whole from `game/src/data/life.ts` (names,
  upkeep, does) and `data/body.ts` (places, pools). Each part gets a family (feed, guard, brood, move, sense) and its
  `opens` (tentacles, rake → mats; bulb, digging limb → detritus). N2's Life port reads this table; there is no second
  one. `data/clades.ts`: the first cell (root, chapter 0, not playable); the worm (chapter 1, parent the first cell;
  its mouth grazes mats weakly); arthropod, trilobite, swimmer with their old recipes as gates, and substrate
  modifiers from `PLANS` (the worm tunnels in mud, mud stops the arthropod, the trilobite ploughs). `data/sea.ts`:
  two foods, **mats** and **detritus**, a yield per tile by depth × substrate (mats need light: flats and shallows;
  detritus settles in mud and deeper), ceiling = yield × area; the curve's numbers and the letter thresholds, each
  with a comment naming its term.
- **C. `stats`, `slots`, `fitness`** (`sim/fitness.ts`), as §6. N1's slots: *graze mats* (grazer, green) and *dig
  detritus* (burrower, brown), where the ceiling clears a floor. Survival is 1 ("nothing hunts it here") until N4.
  Each term gets its own letter and one sentence: "Intake B: grazes mats, can't dig. Upkeep S: no eyes, no legs."
- **D. The sea step** (`sim/sea.ts`): §3's steps 1, 2, 3 and 5. A species sits in its best slot per habitat,
  recomputed each generation, never stored. **Everything is in grams** (*decided 10 Nov*): stocks and populations are
  both biomass, so 100 big animals outweigh 1000 small ones, and one graph axis holds food and eaters. Heads = grams ÷
  the body's mass (a mass per `size`, in data); they are shown, never stored.
  2. *Eat:* each species wants `pop × appetite × intake`, where intake is `fitness`'s term (reach × food per tile), so
     a grazed-down stock feeds less. If the wants exceed the stock, the stock is split in proportion to population ×
     reach.
  3. *Breed and die:* `target = pop × (1 − deaths) + eaten × brood ÷ upkeep × survival`, with the terms taken from
     `fitness`; then `pop += damping × (target − pop)`. A population under two heads' mass dies out.
  1. *Regrow:* `stock += regrow × (ceiling − stock)`, one rate per food. It runs after breeding, so the stored stock
     is the standing food: what the next eaters find and what every letter reads.
  5. *Spread:* where the newcomer would grow at today's food (*11 Nov*; was "C or better"), `pop × spread × border ÷ perimeter` grams move to each
     neighbour (that neighbour's border length over the habitat's whole border). A move under two heads' mass stays
     home.
  `fitness`'s intake reads food per tile (`stock ÷ area`, against a reference density in data). So a habitat's size
  changes how much lives there, not its letter, and a grazed-down habitat scores lower for newcomers and residents.
  **Letters rank the build at full food** (*decided 11 Nov*, replacing 10 Nov's "the letter is the growth rate"): D
  starts at break-even (appetite × value = deaths), ×1.5 per letter, so a higher letter always wins its slot. Growth
  and spread read today's food: a newcomer moves only where it would grow. Grams ×10 (*11 Nov*).

**Session 2: the screens, on N0's map.**
- **E. The tier card** (`ui/TierCard.svelte`): one build in one slot: the letter and three term lines. N0's habitat
  card lists its slots with their holders' cards, and a small graph of stocks and populations over 160 generations.
  Map labels show each slot's holder as a letter in the slot's accent. Letters rank the build (*11 Nov*); `fitness`'s
  intake sentence names the food left ("grazes mats, food at 38%").
  The graph's history is kept by the UI as generations pass, never in the world record (law 2).
- **F. The placement preview:** a build picker in the dev bar. The map shows the picked build's best letter per
  habitat; a tap shows its cards there; **Place** founds a population of 20 heads (20 × the body's mass in grams; N2's eggs do this later).
- **G. Dev presets and time** (`data/presets.ts`): *empty sea*, *first worm* (the root worm in one shallow habitat),
  *three worms* (tentacle, bulb and sclerite worms apart), *rivals* (a worm and an arthropod in one slot), *midgame*
  (a worm line with lean ranks, several habitats held). Skip 1, 10, 100 generations.

## Not in this step
- Hunting, the hunter slot, shells and carcasses as food, survival below 1, wild branches (drift and bud), patch
  notes with a cause: N4. Eggs founding populations, the Life board, Grow, Enforce and Lay, the Life's port: N2.
- The home map, fog, living paint (sprites and mats over tiles), the tree's trunk: N3.
- Plankton and the filterer slot: R7–R9, with the first filterer. Shocks, oxygen and vent water as hazards,
  engineering: R7. Genes beyond fixed `size` and `gut`, variants: R5. Gates read by a rule: R6. Saving: step A.
- Cutting the parts you never use (ideas.md, 9 Nov): after the N4 play test; the table is ported whole.

## Done when
- [x] **Play question** (sheet or `/clade/`): on two seeds, do three worm builds get letters per habitat you agree
  with, and does skip 100 move them where the preview said? Do the graphs swing and settle, not flatline or explode?
- [x] Tests: §6 laws 1–5 and 7 (only `fitness` makes a letter, and the sea, card and preview call it; the world
  record holds no slot, tier or role; more upkeep never raises fitness, a food removed drives its eaters down; every
  clade but the root has a parent; ≤ 6 stats, 10 genes, 4 stocks; `sim` imports no view or ui). Law 6: 160
  generations of 16 habitats × 8 species under 100 ms. Same seed and preset, same sea after 160 generations. A
  species never spreads into a habitat where its predicted tier is below C.
- [x] `npm run check` passes in under 10 s.
- [x] The sheet: the preview for three builds on one seed; one habitat card with slots and graph; the map after skip
  100 from *three worms*. Three lines in `docs/status.md`.
- [x] Your notes are in `docs/playtests/n1-the-core.md`.

## Size check
- **New systems:** one, the sea's populations with `fitness` as its only rule; the card and preview are views of it.
  Two stocks (budget 4), six stats (6), two genes (10): all from §6, nothing beyond it.
- **Sim structure:** new files in `clade/src/sim` and `data`; N0's habitat record gains stocks and pops.
- **Two sessions:** A–D, then E–G. **If it slips:** the graph goes first, then the *midgame* preset.

## Open questions
None. Heads or grams: grams (*decided 10 Nov*, part D). The curve's numbers are tuned by feel on the sheet.

## Build brief (Codex; *decided 10 Nov*: the user builds N1 with ChatGPT)
Branch `n1-the-core`. Read `AGENTS.md`, `docs/status.md`, this spec, and `docs/design/whole-game-build.md` §3, §6
and §10. Port from `game/src/data/life.ts` and `game/src/data/body.ts` by copying; `clade/` never imports `game/`.
Files stay under ~400 lines; data holds no logic. One commit per part. If a part needs a design call this spec doesn't
make, or a new record, stock, stat or screen, stop and write the question in `docs/status.md`.
**Session 1: A–D, no screen.**
1. **A.** `clade/src/sim/records.ts`: §6's types, `Food = 'mats' | 'detritus'`. `Habitat` (N0's, in
   `sim/habitats.ts`) gains `stocks` and `pops` (grams). A `World` record: seed, generation, habitats, species,
   lineages. Its tiles and neighbours come from the seed.
2. **B.** `clade/src/data/parts.ts`, `clades.ts` and `sea.ts`, as part B says. Every number in `sea.ts`
   (yields, regrow, appetite, deaths, damping, spread, mass per size, reference density, letter thresholds) gets a
   comment naming its term. Pick starting numbers so a lone worm on a shallow mat habitat settles within about 30
   generations.
3. **C.** `clade/src/sim/fitness.ts`: `stats`, `slots`, `fitness`, pure. Tests in `clade/tests/fitness.test.ts`: law 1
   (a grep test: no other file makes a letter), law 3 (more upkeep never raises value; a food set to 0 drops its
   eaters' intake to 0), law 4 (every clade but the root has a parent), law 5 (counts of stats, genes, stocks).
4. **D.** `clade/src/sim/sea.ts`: `step(world)` with steps 1, 2, 3 and 5, as part D says. Tests in
   `clade/tests/sea.test.ts`: law 2 (the world record holds no slot, tier, letter or role), law 6 (160 generations of
   16 habitats × 8 species under 100 ms), same seed and preset give the same sea after 160 generations, nothing
   spreads where its letter is below C, a lone worm neither flatlines at 0 nor runs past its ceiling's worth, and law 7
   (`sim` imports no `view` or `ui`).
**Session 2: E–G, the screens.** Parts E, F and G in order, on N0's map. Run `npm run look -- /clade/` at 360 px and
at desktop size for the sheet: the preview for three builds on one seed, one habitat card with its slots and graph,
and the map after skip 100 from *three worms*. Save the shots under `docs/playtests/n1-sheet/`.
**Each session ends:** `npm run check` passes in under 10 s; three lines in `docs/status.md` naming what Claude should
review and any number that felt arbitrary.
