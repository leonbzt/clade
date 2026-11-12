# Step N4: Who eats whom

**Milestone:** M2, step 11, N4 (from `ROADMAP.md`) · 3 sessions (the map motion added the third, *decided 12 Nov*) ·
in `clade/` · built with a breakpoint after every part, like N3
**Question:** Do I want to take that slot from that animal? From *first worm*, play four Lives with no dev bar. After
each one, watch the sea move and read its notes: does it push back (a hunter, a wild branch in a slot you left), and
does that give you a reason to pick where, as what, and whether to challenge or adopt?
**Builds on:** decisions.md, 12 Nov (living paint and a return replay in N4; your N3 play: "boring runs", "few
decisions in the runs and in between", "more action on the habitat map"); 11 Nov (lasting swings wait for N4's
hunters; the shadow until N4); 10 Nov (only opened lineages; wild branches). [whole-game-build.md](../design/whole-game-build.md)
§3 (the sea step, living paint), §6 (`survival`, laws 1–4, 6, 7), §10; [whole-game.md](../design/whole-game.md) §12.2
(wild branches, displace, adopt); slice 23 part A (the diet rule); `ideas.md` (type II hunters; a target's reason
names its rival).

## In (parts in order; each part is one commit and a breakpoint)
**Session 1: the food web, tested, no screen.**
- **A. Who eats whom** (`sim/hunt.ts`, numbers in `data/sea.ts`). A part flag `hunts` (proboscis, hook, claw, arms,
  spikes). A build with one eats populations in its habitat that are no bigger than it (`genes.size`; equal counts until
  size steps in R5) and carry no hunting part. One **hunt slot** per habitat where that prey weighs at least
  `slotFloor`; its food is the prey populations, so no new stock. A hunter's take levels off as prey grows (type II) and
  falls on the commonest prey most (by share of grams squared, so rare prey gets a refuge and the two cycle). Each
  defence of the prey that the hunter's `beats` lacks cuts the take by `GUARD` (start 0.5). One function, `hunted(habitat,
  world)`, gives the grams each hunter takes from each prey: the sea removes exactly that, and `fitness` reads it as
  `survival = 1 − share of the prey's grams taken`. Survival's reason names the hunter ("Proboscis worm hunts it here").
  **Laws as tests:** adding a hunter lowers its prey's survival; removing the prey drives the hunter down.
- **B. Wild branches** (`sim/wild.ts`). Each generation, each slot with food that no population chooses buds with
  chance `WILD.chance` (start 0.08, seeded by world seed, generation and habitat). The bud's parent is the heaviest
  species in the habitat or a neighbour that has a candidate. Candidates are the parent's legal one-step changes (the
  clutch's gain, swap or lose, non-rare parts of its clade, rank 0), then two steps if none fits. The bud keeps the best
  candidate whose letter there is C or B; if none fits, there is no bud. It is born with `lineage: null`, `parent` set
  (law 4), a generated name ("Wild proboscis worm") and `WILD.founders` grams. A wild species with no population
  anywhere is removed from `World`; yours never are.
- **C. The sea runs during a Life.** Going back to the map after hatching runs `LIFE_GENS` generations (start 12, in
  data). `step` returns a per-generation report (eaten, hunted by whom, spread in and out, budded, gone); the UI keeps
  it like `history`, never in `World` (law 2). **News** (`sim/news.ts`, port the grouping from `game/src/sim/sea-news.ts`):
  any population change over 30%, any arrival, bud or loss becomes one line naming its largest term, in tier talk,
  yours first: "Wild proboscis worm budded in Lee mud flats and hunts your Bulb worm: survival C."
  Cost: 160 generations with 20 species stay under 100 ms (law 6).

**Session 2: the Life and the purposes.**
- **D. The board's hunter and rivals come from the sea.** If a hunter that can eat you lives here with at least
  `rivalAt` heads, it is the board's predator: drawn with its build, named in the banner, and its `beats` ignore that
  defence of yours. Otherwise there is no predator (*decided 12 Nov*: no shadow; Brace doesn't stop a hunter that beats armour). Rivals stay the heaviest residents, so wild
  branches show up on boards. A build with `hunts` may crush an adjacent rival it could eat: the rival is gone and you
  gain `PREY_FOOD` food.
- **E. Challenge and adopt** (habitat card, `ui/HabitatCard.svelte`, `sim/found.ts`). When the slot your species would
  take is held, Colonise reads **Challenge** and shows both letters ("Challenge Wild bulb worm (B) · your Tentacle worm A").
  Shares by fitness settle it in the sea; there is no new rule. **Adopt** appears on a wild species in any habitat you
  can see: play a Life as it there. If you lay at least `ADOPT_EGGS` (start 10), it joins your line (`lineage` set, the
  parent kept) and the hatch screen says so. A home-map target's reason may now name its holder ("Wild bulb worm holds
  it").

**Session 3: the map moves.**
- **F. Living paint** (`view/living.ts`, view only). Per habitat and species there are `clamp(round(log2 heads), 1, 8)`
  small capsules, 150 at most on the map. They are drawn in the role's accent (grazer green, burrower brown, hunter red),
  yours with a gold pixel, and wander inside their habitat's tiles by simple steering. Hunter capsules drift toward
  prey capsules and the prey veer away. L1 swaps in real map icons. No rule reads it (law 7).
- **G. The return replay and the notes.** After hatching, the `LIFE_GENS` generations play over about 4 s: capsule
  counts follow the populations, arrivals walk in across the shared border, buds flash once with their name, and the
  lost fade. Tap to skip. Then the **notes** card lists the news, yours first, and a **notes** button on the map bar
  reopens the latest.

## Not in this step
Size and gut genes, size steps, gut leaning to meat: R5. The swimmer's Life (`hunt.ts` from `game/`) and playing a
hunter's own chase: when the swimmer has a slot (R6, R8). Shells and carcasses as sea foods, features, engineering:
R7. The idle clock, banked clutches, XP while away: step A. Real map icons: L1. Seasons: `ideas.md`. Cutting unused
parts: after this step's play test (`ideas.md`).

## Done when
- [ ] **Play question** (`/clade/`, no dev bar): four Lives from *first worm*; at least once a hunter or a wild branch
  changes where you go next, and you can say why from the notes and the map.
- [ ] Tests: the diet rule (tool, size, no hunter prey); law 3 both ways; guard cuts the take; buds are deterministic,
  C or B only, parent set, none in a held slot; adopt below and above `ADOPT_EGGS`; every news line has a cause;
  160 generations with 20 species under 100 ms; laws 2 and 7.
- [x] `npm run check` under 10 s; one phone-size look run per part; one desktop shot of the replay.
- [ ] Your notes are in `docs/playtests/n4-who-eats-whom.md`, then the whole N0–N4 play (step 12).

## Size check
- **New systems:** one rule system, the food web (hunting, with wild branches budding on the clutch's machinery).
  News, paint and replay are views of the step's report. No new stock, stat or gene; `Part.hunts` is data; no new
  saved field.
- **If it slips:** the crush on the board goes first, then adopt (to R5), then the hunter chasing in the paint.

## Open questions (leans the build follows unless you change them)
1. The sea runs 12 generations per Life. Today it moves only on the dev skip, and the replay needs it to run.
2. Prey can be as big as its hunter until R5's size steps. With "smaller only", no worm could hunt a worm.

## Build brief
Branch `n4-who-eats-whom` (already made from `main` after the N2/N3 merge). Read `AGENTS.md`, `docs/status.md`,
this spec, and `whole-game-build.md` §3, §6 and §10. Port by copying, never importing `game/`. Files under ~400
lines; data holds no logic; don't rebalance ported numbers. **Breakpoints:** parts A to G in order; after each, `npm
run check` passes, one commit **"N4 X: …"**, and one line under `## N4 progress` in `docs/status.md` ("X done: what
landed; next: Y"). If a part needs a call this spec doesn't make, or a new record, stock, stat or screen, stop and
write the question there.
