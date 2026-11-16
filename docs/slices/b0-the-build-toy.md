# Step B0: The build toy

**Roadmap step:** 14
**Question:** does a Life feel like making a build?
**Builds on:** `design/direction.md` §1 (seventh round) and §5 "Lines and the tree"; your calls of 16 Nov (P56: a Life
earns points by growing and spends them among nodes; P57: one engine; P61: the toy first). A builder reads this
spec, `docs/status.md` and the files its part names.

## In
- A page at `/clade/?toy=build`: pick one of three boards, live one Life as the bare worm, read a result card, go again.
- **Tree mode** in today's Life: one point at birth and one a moult; food buys more, at the old Enforce prices.
  A point grows a node (the worm's nine parts, on five places) or adds a rank to a grown one.
- The result card names the eggs, the build and the branch you spent most in.

## Out
- The game's own Lives (map, Life, hatching) keep the old growth order. The swap is W2.
- Line levels that open nodes: here every node is open. B1.
- The clutch as a variant along your branch: the card only names the branch. B1.
- The mutation offer: off in tree mode. It returns in B1 as a node grown at birth.
- The verb bar's cap of three: every verb your build has shows (a worm has four at most). `ideas.md`.
- Rivals, sea hunters and events on the toy's boards; other clades' trees; new art (a node shows the stamp its part
  has today); balance beyond one pass by feel.

## Contract (written 16 Nov; shapes change only on your call)
- `clade/src/data/tree.ts`: `TreeNode`, `TreeState`, `Branch`, `BRANCHES`, `TREE` (the numbers), `WORM_TREE`.
- `clade/src/data/toy-boards.ts`: `TOY_BOARDS`, the three boards.
- `clade/src/sim/life-body.ts`: `LifeBody.tree?: TreeState`. Undefined means the Life plays exactly as before.
- `clade/src/sim/tree.ts`: the exported names and signatures (the bodies throw until part A).
- `clade/tests/tree.test.ts`: two data tests pass today; the twelve tests of "a Life in tree mode" are skipped until
  `startTree` stops throwing, then all run. Every other test stays green and unedited.

## Build brief (one part per builder session, in order)
### Part A: tree mode in the sim
- **Touch:** `clade/src/sim/tree.ts` (the bodies), `sim/life-body.ts` (`activePlaces` only), `sim/economy.ts` (`grow`,
  `enforceCost`), `sim/mutation.ts` (`offerMutation`).
- **Don't touch:** every test; `data/tree.ts`, `data/toy-boards.ts`, `data/parts.ts`, `sim/records.ts`, the `Ev` type
  in `sim/life.ts`; `clade/src/model`, `view`, `ui`; `game/`.
- **Behaviour** (numbers are `TREE` in `data/tree.ts`; a part's place is `PARTS[part].place`):
  1. `startTree(life)`: false, changing nothing, if the build has a part or `tree` is set. Else
     `tree = { points: TREE.birthPoints, bought: 0, grown: [] }`. `treeOf` returns `WORM_TREE`.
  2. `activePlaces` in tree mode is `tree.grown` without the `lost` places, in that order. No other line of the old
     path changes.
  3. `nodeState(life, part)`, first match wins. Outside tree mode, or a part not in the tree: `shut`. Its place is
     lost: `shut`, "lost this Life". `build.parts[place]` is this part: `grown`, `rank = enforced[part] ?? 0`,
     `cap = ENFORCE_HEADROOM + max(0, ranks[part] ?? 0)`. The place holds another part: `shut`, "<its name> grows
     there". It has `needs` and none of them is in `build.parts`: `shut`, "needs <names joined by or>". Else `open`.
  4. `canSpend`: the phase is play, a point is left, and the state is `open`, or `grown` with `rank < cap`.
  5. `spend`: false if not `canSpend`. Else `events = []` and one point less. Open: the part goes into a new
     `build.parts` object (as `pickMutation` does), its place onto `grown`; `say` "Grew <name>."; emit
     `{ k: 'part', place, part }`; `reveal`. Grown: `enforced[part]` +1; `say`; emit
     `{ k: 'enforce', part, rank, food }`; `reveal` when the effect kind is `sight`. Never food, never a turn.
  6. `grow` in tree mode adds `TREE.moultPoints`. `offerMutation` returns false in tree mode and leaves
     `mutationOffer` alone. `enforceCost` returns null in tree mode.
  7. `pointCost`: `TREE.pointCosts[bought]`, or null past the list or outside tree mode. `buyPoint`: in play with
     the food: `events = []`, pay, `points` +1, `bought` +1, `say` "Bought a point.". No event, no turn.
  8. `branchOf`: a grown node counts 1 for its branch and each of its ranks 1 (lost or not). The highest count
     wins; a tie goes to the branch whose node comes first in `grown`. Null with nothing grown or outside tree mode.
- **Done:** every test in `tests/tree.test.ts` runs and passes (none skipped); all other tests unedited and green;
  `npm run check` passes (it takes about 13.5 s today against a 10 s budget; that fix is a W2 part, so only do not
  add more than half a second); one commit "B0 part A: tree mode".
- **Stop and ask if:** an existing test fails; a contract test seems wrong; you need a new event kind, field,
  part or number.

### Part B: the toy page
- **Touch:** `clade/src/main.ts`; new `clade/src/ui/toy/BuildToy.svelte` (its styles inside it); `ui/life/hud.ts`,
  `ui/life/Life.svelte`, `view/life-stage.ts`.
- **Don't touch:** `ui/App.svelte` and the game's flow; `clade/src/sim`, `data`, `model`; every test; `game/`.
- **Behaviour:**
  1. `main.ts` mounts `BuildToy` in place of `App` when the URL has `?toy=build`. Without it nothing changes.
  2. The start card: "The build toy" and one button a board (`name`, `asks`). A pick makes
     `newLife(board, the bare worm's build, {}, run)` (`DEV_SPECIES` `root-worm`, cloned), calls `startTree` and
     shows the Life screen with the board's name as its purpose, keyed by `run` so each Life gets a fresh stage.
  3. In tree mode only, the Enforce heading reads "Build · N points" and its list shows: first a button
     "Point · N food" ("all bought" at null; disabled unless `canBuyPoint`); then every node of `treeOf(life)` in
     order, under its branch's name. A node's label is the part's name, with " · rank r" when ranked; its note is
     the part's `does` when open, the rank's effect when grown (the text Enforce shows today) and `why` when shut.
     Disabled unless `canSpend`; a grown node carries the class `grown`. A tap runs `spend` through `stage.act`.
     A Life outside tree mode shows the Enforce list exactly as today.
  4. `window.__game` gains `spend(part)` and `point()`. `resident()` in `life-stage.ts` passes `tree: undefined`, so
     a rival's or hunter's body never copies your tree.
  5. When the Life is over, a card over the board: the eggs, how it ended, the nodes grown with their ranks, and
     `BRANCHES[branchOf(life)].life` ("A bare Life" for null). Two buttons: "Again" (the same board, `run` +1) and
     "Boards" (the start card).
  6. At 390 px wide the node list scrolls inside the controls and nothing covers the board.
- **Done:** one `npm run look -- "/clade/?toy=build"` run at phone size: pick a board, spend the birth point, grow
  once, end the season, see the card (the screenshot paths go in `status.md`); `npm run check` passes; one commit
  "B0 part B: the toy page".
- **Stop and ask if:** the Life screen needs the app's shell to lay out (more than about 20 lines of CSS);
  playback needs a new event; anything here reads as a design choice.

## Done when
- [ ] In play: on each of the three boards you pick nodes through a Life and end on a card that names your build.
- [ ] `npm run check` passes.
- [ ] Your playtest notes are in `docs/playtests/b0-the-build-toy.md`. Four things to look for: did you build
      differently on the three boards; were points scarce enough to hurt; did the birth point matter; did you see
      the build on the body?

## Size check
- New systems (one at most): one, tree mode.
- Budgets touched: nine nodes, at the proposed cap. Food keeps three uses (Grow, Point, Lay): Point takes Enforce's
  place in tree mode.
- Fits its sessions? A and B are each well under a session; one builder session may do both, in order, with one
  commit each.

## Open questions (none blocks part A)
1. **The tree is shallow.** Nine parts on five places means a full-grown worm fills every place; the choices are
   three either/ors (front, sides, tail), the order, and where the bought points go. If that plays thin, the answer
   is more nodes a place or deeper needs, which is content and your call after the play.
2. **Nothing here was played.** The boards and the prices are a first cut.
3. **Branch to dial**, for B1: Feed moves size, Burrow moves guard, Spawn moves brood (the ragworm's three dials).
