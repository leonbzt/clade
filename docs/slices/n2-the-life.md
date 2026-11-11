# Step N2: The Life

**Milestone:** M2, step 9, N2 (from `ROADMAP.md`) · 2 sessions · in `clade/` · Codex builds it (*decided 11 Nov*)
**Question:** Is it as good as the old Life, and does the tenth Life differ from the first? Start from *first worm*
and play Lives on three habitats (a mat flat, a mud shallows, a deep slope): do the boards ask for different
Enforce choices, and does each Life's colony show up on the map where you laid the eggs?
**Builds on:** decisions.md, 10 Nov (the body just grows; Enforce replaces part picks at each moult), 11 Nov (port by
bins; the three coherence points; purpose is Colonise only; each egg founds a fixed brood of heads; the sea uses the
adult size; the N2 spec's three answers: the shadow, the numbers, family order). [whole-game-build.md](../design/whole-game-build.md) §4 (the Life's economy), §6 (laws 1, 7, 8), §8
(port list), §10; [whole-game.md](../design/whole-game.md) §2 (the Life's three beats, a purpose per Life) and §12.3.

## In (parts in order)
**Session 1: the rules, tested, no screen.**
- **A. The Life body** (`sim/life-body.ts`). The species' `Build` (one part per place) is the plan; the Life adds
  size 1–5 and the places lost to tears or starving. No rows, variants, buds, defaults, locks, allowance, verb
  ceiling, share codes or old rank kinds: those are `game/`'s body model, dropped. **Parts switch on with size**
  (*decided 11 Nov*, no new field): in family order (feed, move, sense, guard, brood; ties in `PLACES` order), the
  first `size` parts are on, and size 5 (full grown) switches on all. One function, `growthOrder(build)`, holds the
  order, so a species' own order can replace it later without touching the Life. So a three-part worm feeds first, guards next, broods
  last: juvenile, adult, parent. Everything the Life reads comes from the parts that are on: `has`, range, tunnel,
  sense, oxygen, meal food, clutch, verbs (one per part, in that order), and strikes (`body-hurt.ts`'s rules over
  places: a guard on the struck side blocks; a hit tears the struck place).
  - **Coherence with the sea** (*decided 11 Nov*): a food node is locked when `fitness.ts`'s `reach` is 0 for its
    food (mat → mats, buried → detritus) with the parts that are on. So a bare worm can't dig until a bulb switches
    on, and an arthropod in a mud habitat can eat nothing. Part upkeep and lean ranks come from one helper shared
    with `fitness`; the Life keeps its ported base upkeep (1). Meals keep their ported sizes.
- **B. The engine port** (`sim/life.ts`, `grid.ts`, `verbs.ts`, `threat.ts`, `data/life.ts`). Copy
  `game/src/sim/life.ts` and its neighbours and re-point them at part A. *Keep as is:* the grid, movement and
  tunnelling (the worm tunnels in mud; mud stops the arthropod; the trilobite ploughs), eating, regrowing mats,
  rivals, the hunter's mark, strike and rest (as **a shadow from deep water**, below), Brace and Dig, starving sheds the newest part that is on, oxygen, board
  events, 20 turns, events for playback. *Numbers:* `COLS`, `ROWS`, `TURNS`, `RULE`, `STAGES`, `PLANS` movement,
  `VERBS`, `NODES` copied unchanged; parts come from `data/parts.ts` (no second table). *Drop:* moult offers and
  `pick`, rares, `tierOf`/`nextTier`, `presetBuild`/`STARTER_PLAN`, the swimmer's Life (`hunt.ts`; it returns in N4
  when the swimmer has a slot), sulfur mats and vent water (R7). The board type is `Board`, not `Habitat`.
- **C. The economy** (`sim/economy.ts`, numbers in `data/economy.ts`), its own module (*decided 11 Nov*). Surplus food
  has three uses; none ends the turn except Lay.
  - **Grow** (the moult): `ceil((size + moultExtra) × 0.5)` food, the ported bud price (worm 2, 2, 3, 3), once a turn;
    one size up and the next part switches on, free. Arthropods and trilobites are soft for the turn, as ported.
  - **Enforce** one part that is on: its effect for the rest of the Life. *Costs* (*decided 11 Nov*): 3, 5, 7, 9, 11 food for
    the 1st to 5th Enforce of the Life, whatever the part. *Cap:* a part goes at most 1 + its line rank. *Effects*, a
    table in data: feed: +1 food per meal of its food (tentacles, rake → mats; bulb, digging limb, deep burrow →
    buried; claw, proboscis, hook → shell beds and carcasses; gut gland → every meal); guard: sclerites, spine, head
    shield, enrolment block the next hit that would land (one per rank), gill +1 oxygen; brood: brood pouch +1 egg per
    lay; move: leg +1 range, bristles +1 tunnel, flaps +1 speed; sense: eye +2 sight. Parts with no row can't be
    enforced. **The button says the payback** (*decided 11 Nov*): feed "pays back after 3 mats", brood "+1 egg each
    lay", guard "blocks the next hit", the rest their effect; with the turns left in the season.
  - **Lay:** the ported lay: 4 food for `size` eggs (×2 with a pouch on, +1 deep burrow in mud, + enforced pouch
    ranks), from size 3 (or progenesis); ends the turn.
  - **The Life's result** (a return value, never saved): eggs, enforced ranks per part (N3's clutch reads them), food
    eaten by kind, the cause (season or died), and the species witnessed on the board.
- **D. The board and the founding** (`sim/board.ts`, `sim/found.ts`, `data/boards.ts`).
  - **`boardFor(habitat, world, seed) → Board`**, pure (law 8). **Generated from the habitat** (*decided 11 Nov,
    after the review*; it replaces the three templates, which only held 1–2 buried nodes on sand and rock). The board
    is a close-up of one patch: playable and a little mixed. *Ground from the bottom type:* smoothed noise gives mud
    patches and rock outcrops (walls) at the old templates' shares (`GROUNDS` in data); walls never cut the board
    and the start's surroundings stay clear. *Direction from the neighbours:* deeper neighbours pull, shallower ones
    push, and map north is up; you start one cell in from the shore edge, and the shadow enters on the deep edge.
    **The hunter is a shadow from deep water** (*decided 11 Nov*: "no hunter till N4 is fine, if shadow from deep is
    cheap add it"): the ported hunter, unnamed old life, at the bottom type's turn, switched by `BOARD.shadow`. N4
    replaces it with the sea's hunters. *Food from the stocks:* `round(BOARD.nodes × density(habitat, food))` mat and
    buried nodes, at most 1.5 × `nodes`; a node brings its own ground (a buried node is a mud pocket). So no mats on
    the slope or deep, and a grazed-down habitat has fewer. Shell beds and carcasses are bottom-type features until
    N4 makes them a food. *The event from depth and bottom type:* low tide on the flats (the shore band runs dry);
    below them a mudslide on mud, a vent surge on rock and an upwelling on sand (the deep band loses oxygen).
    *Rivals:* the species present with at least `rivalAt` heads, the heaviest first, one spot at least 4 steps from
    the start; each eats its best slot's node.
  - **`found(world, habitat, species, eggs)`:** adds `eggs × HEADS_PER_EGG × bodyMass(build)` grams to the habitat.
    `HEADS_PER_EGG = 2` (*decided 11 Nov*): a typical Life (10–18 eggs) founds 20–36 heads, about N1's tested 20; a poor
    one (4 eggs) founds 8. It takes plain numbers: the sea never knows how the eggs were made (law 7).
  - **Colonise, the one purpose** (*decided 11 Nov*): a habitat where the species doesn't live yet and its best
    letter is D or better. Named at the start ("Colonise Lee shallows · graze mats · tier B") and judged at the end
    with `fitness` and the sea's growth test: "36 tentacle worms founded · tier B · they grow here", or "too few to
    hold" under two heads.

**Session 2: the screen and the loop, on N1's map.**
- **E. The Life screen.** Port `game/`'s floor, camera, effects, tween, the hunter's drawing and marks, `scene.ts`,
  `playback.ts` and the HUD into `clade/src/view` and `clade/src/ui/life/`. The creature drawing (`view/body*`,
  `shade`, `textures`, `data/body-look`) is ported and reworked in L1; it draws the parts that are on. The HUD: the
  purpose line, food, eggs, turn, size and stage, health, oxygen; the verbs of the parts that are on; **Grow** (its
  price), **Enforce** (a short list of the parts that are on: effect, price, payback; taken ones show their rank),
  **Lay** (price → eggs). Ported view files keep `shade.ts` colours until L1.
- **F. The loop.** The habitat card gains **Colonise** beside N1's Place, for the species picked in the dev bar
  (only where Colonise allows). It opens the Life on `boardFor` with seed = world seed, habitat and Life count. At
  the end a result card: the judgement line, `fitness`'s three reasons, **Back to the map**; `found` has run and the
  habitat card shows the new population. Generations pass only by the dev skip buttons (the idle clock is step A).
- **G. Dev and the sheet.** Two three-part dev species in `data/builds.ts`: a *grazer worm* (tentacles, sclerites,
  brood pouch) and a *digger worm* (bulb, eye, brood pouch), so Grow switches on parts across sizes. Dev buttons in
  a Life: +10 food, end the season. No new presets.

## Not in this step
- Hatching, the clutch and its cards, the one mutation event per Life, XP and ranks earned, the line view, the home
  map, fog: N3. Adapt and Challenge (as displace and adopt), hunters from the sea, survival below 1, the swimmer's
  Life, shells and carcasses as sea foods: N4. Vents, oxygen as a stock, shocks: R7. Genes beyond fixed size and
  gut, r vs K: R5. Saving: step A (mid-Life: R11). Growth stages in populations: `ideas.md`.
- *Idea:* Shed (switch a part off for this Life). The body's look: L1.

## Done when
- [ ] **Play question** (`/clade/`): from *first worm*, Lives on a mat flat, a mud shallows and a deep slope. Is it as
  good as the old Life? Do the boards ask for different Enforce orders (the fail test: the same order wins on every
  board), and does each colony appear on the map where you laid it?
- [x] Tests: the ported engine tests from `game/tests` (life, verbs, threat) minus moult picks; parts switch on in
  family order and all at size 5; a node is locked exactly when `reach` is 0 with the parts that are on; each Enforce
  costs more than the last and a part stops at 1 + its line rank; a feed Enforce adds its food to its meals only; a
  guard Enforce blocks one hit; with `BOARD.shadow` off no hunter arrives; law 8 (same habitat state and seed, same board); halving a stock never adds nodes of
  its food, and a stock at 0 gives none; `found` adds eggs × 2 × body mass; law 7 (`sim/sea.ts` and `sim/found.ts`
  import nothing from the Life files; `sim` imports no view or ui).
- [x] `npm run check` passes in under 10 s.
- [x] The sheet (`docs/playtests/n2-sheet/`, 360 px and desktop): the start of a Life on two habitats side by side;
  the Enforce list with payback; a hit and a block; a result card; the map after three Colonise Lives. Three lines
  in `docs/status.md`.
- [x] Your notes are in `docs/playtests/n2-the-life.md`.

## Size check
- **New systems:** one, the Life with its economy; the engine is ported, the board and founding are its two joints.
  No new record, stock, stat or gene: the Life and the board are transient; the result is a return value.
- **Sim structure:** new files in `clade/src/sim` and `data`; `fitness.ts` exports its part-upkeep helper.
- **Two sessions:** A–D, then E–G. **If it slips:** the hunter's marks drawing goes first, then the payback wording
  (show the price only), then the two dev species.

## Open questions
None. Answered 11 Nov: the shadow from deep water if cheap (else no hunter until N4); 2 heads per egg, Enforce 3, 5,
7, 9, 11 and the cap of 1 + line rank; family order, with a species' own order parked in `ideas.md`.

## Build brief (Codex)
Branch `n2-the-life` (from `main` after the N1 merge). Read `AGENTS.md`, `docs/status.md`, this spec, and
`docs/design/whole-game-build.md` §4, §6 and §10. Port from `game/src` by copying; `clade/` never imports `game/`.
Files stay under ~400 lines; data holds no logic. One commit per part. If a part needs a design call this spec
doesn't make, or a new record, stock, stat or screen, stop and write the question in `docs/status.md`. Don't
rebalance ported numbers.
**Session 1: A–D, no screen.**
1. **A.** `clade/src/sim/life-body.ts` over `records.ts`'s `Build` plus `{ size, lost }`. Port `game/src/sim/body.ts`'s
   derived numbers and `body-hurt.ts`'s strike resolution to one part per place. Export `partUpkeep` from
   `sim/fitness.ts` and use it. Tests in `clade/tests/life-body.test.ts`.
2. **B.** `clade/src/data/life.ts` (the ported numbers minus `PARTS`), `sim/grid.ts`, `sim/life.ts`, `sim/verbs.ts`,
   `sim/threat.ts`, as part B says. `newLife(board, build, ranks, seed)`. Port the engine tests into
   `clade/tests/life.test.ts`, dropping the moult-pick ones.
3. **C.** `clade/src/data/economy.ts` (the grow price, the Enforce costs and effect table, `HEADS_PER_EGG`, each with
   a comment naming its term) and `sim/economy.ts`: `growCost`, `grow`, `enforceCost`, `canEnforce`, `enforce`,
   `payback`, `lay`, `resultOf`. Tests in `clade/tests/economy.test.ts`.
4. **D.** `clade/src/data/boards.ts` (`BOARD`, `GROUNDS` and the events; the templates were replaced by the
   generator after the review), `sim/board.ts` (`boardFor`) and `sim/found.ts` (`found`, the Colonise
   check and judgement, using `fitness` and the sea's growth test exported from `sea.ts`). Tests in
   `clade/tests/board.test.ts`, plus law 7 in the existing import test.
**Session 2: E–G.** Parts E, F and G in order. Run `npm run look -- /clade/` at 360 px and desktop size for the sheet
and save it under `docs/playtests/n2-sheet/`.
**Each session ends:** `npm run check` passes in under 10 s; three lines in `docs/status.md` naming what Claude should
review and any number that felt arbitrary.
