# Step B0 round two: The kit toy

**Roadmap step:** 14 (round two)
**Question:** do stats, rung ladders, offers and a steady beat make a Life a build you want to try again?
**Builds on:** your playtest `docs/playtests/b0-playtest.md` and calls of 17 Nov (`decisions.md`: P62 m the mix,
P63 a work on a beat, P64 a this toy before W2, the budget); `design/direction.md` §1 (eighth round) and §5;
`docs/research/hooks-and-loops.md` for why. A builder reads this spec, `docs/status.md` and the files its part names.

## In
- A page at `/clade/?toy=kit`: a body screen (plan your parts, see the ladder and your level), three boards with an
  egg goal each, one Life, a result card that moves a level bar. `?toy=build` (round one) stays as it is.
- **Kit mode** in today's Life: the body is six stats; every node adds stats and nothing else. Parts have up to
  three rungs; two traits have no place. Food asks for a stat and takes work. The season is 60 turns.
- **The mix:** you plan one to three parts before the Life (kept between Lives); each moult offers three other
  nodes, a rare one seldom. A point grows a planned or offered node, or climbs a rung.
- **Tasks on a beat:** tap a tile, the worm walks there and works it, one action a beat; it stops when the hunter
  marks a strike. A clock switch lets the world run while you idle.
- **Progress:** eggs over all Lives are the line's level (1 to 4); a level opens nodes, rungs and plan slots.

## Out
- The game's own Lives: untouched. The swap is W2, which then deletes the old growth order and round one's tree mode.
- A drawn creature on the body screen (slots only; the board's worm shows what is grown): W2.
- The clutch as a variant, the genome setting the kit: B1. The line's bigger tree outside the Life: W5.
- Hunters of different force, luck rolls, difficulty steps for a solved board, a daily board: `ideas.md`.
- Other clades' kits; new art; rivals and events on the boards; balance beyond one pass by feel.

## Contract (written 17 Nov; shapes change only on your call)
- `clade/src/data/kit.ts`: `KitNode`, `Rung`, `KitState`, `KitProgress`, `Gate`, `GATES`, `KIT` (every number),
  `WORM_KIT` (12 parts, 2 traits), the stat and slot names. `clade/src/data/kit-boards.ts`: `KIT_BOARDS`.
- `clade/src/sim/kit.ts` and `kit-stats.ts`: the exported names and signatures (the bodies throw until built).
- `clade/src/sim/life-body.ts`: `LifeBody.kit?: KitState`. `sim/life.ts`: `Tile.work`, the events `work` and
  `rung`, `season(l)`. Undefined `kit` means the Life plays exactly as before.
- `clade/tests/kit.test.ts`: three data tests pass today; fourteen are skipped until `startKit` is built (part A).
  `clade/tests/kit-rules.test.ts`: seventeen, skipped until `work` is built (part B). Every other test stays green
  and unedited.

## Build brief (one part per builder session, in order)
### Part A: the kit in the sim
- **Touch:** `sim/kit.ts` (the part A bodies), `sim/kit-stats.ts`, `sim/life-body.ts` (`activePlaces` only),
  `sim/economy.ts` (`grow`, `enforceCost`), `sim/mutation.ts` (`offerMutation`).
- **Don't touch:** every test; `clade/src/data`, `sim/records.ts`, the types in `sim/life.ts`; `sim/tree.ts`;
  `clade/src/model`, `view`, `ui`; `game/`.
- **Behaviour** (numbers are `KIT`; a node's name is its first rung's name; a part's place is `PARTS[id].place`):
  1. `planOk(level, plan)`: the level is 1 to `KIT.levelEggs.length`; at most `KIT.planSlots[level - 1]` parts; each
     is a part node of the kit, not rare, with `level` at most this level; no place twice.
  2. `startKit(life, level, plan)`: false, changing nothing, if the build has a part, `tree` or `kit` is set, or the
     plan is not ok. Else `kit = { level, plan: [...plan], points: KIT.birthPoints, bought: 0, grown: [], order: [],
     rungs: {}, offer: [], offers: 0, task: null }`, then `rollOffer`.
  3. `kitStats(kit, lost)`: a copy of `KIT.base` plus the `adds` of rungs 1 to `rungs[id]` of every node in `order`,
     leaving out a part whose place is in `lost`.
  4. `activePlaces` in kit mode is `kit.grown` without the `lost` places, in that order.
  5. `kitState(life, id)`, first match wins. Outside kit mode or not in the kit: `shut`, "not in the kit". Its
     `level` is above `kit.level`: `locked`. A part whose place is lost: `shut`, "lost this Life". `rungs[id]` is 1
     or more: `grown`, `cap = min(rungs.length, KIT.rungCap[level - 1])`. A part whose place holds another part:
     `shut`, "<that node's name, lower case> grows there". It has `needs` and none has a rung: `shut`, "needs
     <names, lower case, joined by or>". In `plan`: `open` by `plan`. In `offer`: `open` by `offer`. Else `wait`.
  6. `canSpend`: the phase is play, a point is left, and the state is `open`, or `grown` with `rung < cap`.
  7. `spend`: false if not `canSpend`. Else `events = []`, one point less. Open: `rungs[id] = 1`, `id` onto `order`
     and out of `offer`; a part also goes into a new `build.parts` object, its place onto `grown`, and emits
     `{ k: 'part', place, part }`. Grown: `rungs[id]` +1. Then always `say` "Grew <the new rung's name, lower
     case>.", emit `{ k: 'rung', id, rung }`, `reveal`. Never food, never a turn.
  8. `rollOffer`: the pool is every node with state `wait` (so: open by level, not grown, not planned, its place
     free, its needs met). Draw without putting back, up to `KIT.offerSize`, with `seeded(life.seed + 7919 *
     kit.offers)`: a rare node weighs `KIT.rareWeight`, the others 1; after one rare is drawn the other rares leave
     the pool. Then `offers` +1. (Clear `offer` before reading the states.)
  9. `grow` in kit mode adds `KIT.moultPoints` and calls `rollOffer`. `offerMutation` returns false and
     `enforceCost` null in kit mode.
  10. `pointCost`, `canBuyPoint`, `buyPoint`: as in `sim/tree.ts`, on `kit` and `KIT.pointCosts`.
  11. `branchOf`: each rung of each node in `order` counts 1 for its branch; the highest wins, a tie goes to the
      branch whose node is first in `order`. Null with nothing grown or outside kit mode.
  12. `levelOf(eggs)`: the highest level whose `KIT.levelEggs` entry is at most `eggs`. `nextLevel(eggs)`: that
      level + 1, its entry, and the ids of the nodes with that `level` in kit order; null at the top.
      `afterLife(progress, board, eggs)`: a new object with `eggs` added and `best[board]` the larger of the two.
- **Done:** every test in `tests/kit.test.ts` runs and passes (none skipped); all other tests unedited and green;
  `npm run check` passes (13.5 s today against a 10 s budget; that fix is W2's, so do not add more than half a
  second); one commit "B0 round two, part A: the kit".
- **Stop and ask if:** an existing test fails; a contract test seems wrong; you need a new field, event or number.

### Part B: the Life reads the stats
- **Touch:** `sim/kit.ts` (`work`, `setTask`, `stepTask`), `sim/life-body.ts`, `sim/life.ts` (`dests`, `cleared`,
  `eat`, `world`).
- **Don't touch:** every test; `clade/src/data`; `sim/verbs.ts`, `sim/threat.ts`, `sim/economy.ts`, `sim/tree.ts`;
  `model`, `view`, `ui`; `game/`. Outside kit mode no line may behave differently.
- **Behaviour** (in kit mode only; `s = kitStats(body.kit, body.lost)`):
  1. `life-body.ts`, each as its first line: `upkeep` is `RULE.baseUpkeep`; `range` is `min(RULE.maxRange,
     s.speed)`; `tunnel` is `RULE.tunnel + s.speed - 1`; `sense` is `s.senses`; `oxygenMax` is `RULE.oxygen`;
     `foodOf` is `NODES[node].food + s.thrift`; `clutch` is `size + s.brood`; `canGrab` is false; `mature` is
     `size >= RULE.adultSize`.
  2. `lockOf`: with `g = GATES[node]` and `have = s[g.stat]` (plus `KIT.crushBite` when `cracked`): null when
     `have >= g.min`, else "needs <stat> <min>, you have <have>".
  3. `strikeOn`: the buried or dug line and the braced line as today; then `s.defence >= KIT.strike` is
     `{ ...safe, kind: 'blocked' }`; else the hit as today's last two lines. No guard or enforced block by name.
  4. `dests`: a worm's straight-line budget is `range(l)` (not 1). `cleared`: a mat regrows after `KIT.regrow`, and
     `work` is unset.
  5. `eat`: after the lock check, `t.work = (t.work ?? 0) + have`. Below `g.work`: `say` "<food name>:
     <work>/<of>.", emit `{ k: 'work', i, node, work, of }`, return. Else eat as today for `foodOf` (the `bonus`
     argument is ignored).
  6. `world`: food drops by upkeep (and starving is checked) only when `l.turn % KIT.upkeepEvery === 0`; the
     `upkeep` event is emitted every turn as today. The season ends after `season(l)` turns.
  7. `work(life)`: false, changing nothing, outside kit mode, when the Life is over, or with no food under you.
     Else `events = []`, `moved = false`, `eat` your tile, `world`.
  8. `setTask(life, i)`: false outside kit mode or when over. Null drops the task. A tile off the board or of rock
     is false. Else `kit.task = i`. Never a turn.
  9. `stepTask(life)`: false with no task or when over. A strike is marked (`pred.state === 'strike'`): drop the
     task, false. On the task's tile: with food you can open, `work`; else drop the task, false. Elsewhere: of the
     `dests` that are not grabs, take the one nearest the task (`dist`; the first found on a tie); if it is not
     nearer than you are now, drop the task, false; else `move` there. After the action drop the task when: you
     stand on its tile and no food is left there or its food is locked; health fell; a place was lost; a strike
     is marked; the Life is over. An action taken returns true.
- **Done:** every test in `tests/kit-rules.test.ts` runs and passes; all others unedited and green; the check as in
  part A; one commit "B0 round two, part B: stats, work and tasks".
- **Stop and ask if:** a test outside the two kit files fails; a rule here needs a part's name; a file passes 400 lines.

### Part C: the toy page
- **Touch:** `clade/src/main.ts`; new `ui/toy/KitToy.svelte`, `ui/toy/KitBody.svelte`, `ui/toy/kit-progress.ts`.
- **Don't touch:** `ui/App.svelte`, `ui/toy/BuildToy.svelte`, `ui/life`, `view`, `sim`, `data`, tests, `game/`.
- **Behaviour:**
  1. `main.ts` mounts `KitToy` when the URL has `?toy=kit`.
  2. `kit-progress.ts`: load and save a `KitProgress` under the localStorage key `clade.kit.v1`, each in try/catch;
     the default is `{ eggs: 0, best: {}, plan: [] }`; a loaded plan that fails `planOk` becomes `[]`.
  3. The start screen, top to bottom. **Level:** "Level N", a bar from this level's eggs to the next's, "E / at
     eggs", and "Next: " with the names of `nextLevel().opens`, plus "a third rung" or "one more planned part" when
     `KIT.rungCap` or `KIT.planSlots` rises there; at the top "Everything is open."
  4. **Body** (`KitBody`): one box a place the kit uses, in `SLOT_NAMES` order, then "Traits". Each node is a row:
     its name, its first rung's adds ("+1 bite"), and "level N" when locked, "rare · offered only" when rare,
     "offered in the Life" for a trait. A tap on an open, common part plans it; a tap on a planned part unplans it;
     a second part on a place replaces the first; past `KIT.planSlots` the tap does nothing and a line says "N
     planned parts at this level". Planned rows carry the class `planned`. Below: the six stats with `STAT_DOES`.
  5. **Boards:** a button a board: name, `asks`, "Best B / goal G", and a star when `B >= G`.
  6. A pick saves the plan, makes `newLife(board, the bare worm, {}, seed)` with a fresh seed each Life
     (`Date.now() % 1e6`), calls `startKit(life, level, plan)` and shows the Life screen keyed by a run counter.
     Above the board: the board's name and a "Restart" button (one tap, the same board, no eggs counted).
  7. When the Life is over, a card: the eggs and how it ended; the nodes grown, each by its current rung's name;
     `BRANCHES[branchOf(life)].life` ("A bare Life" for null); the level bar moving from before to after
     (`afterLife`, saved once); "Level N: opens …" when the level rose; "Solved: N eggs on <board>. A chapter
     done; the next board waits." when the best first reaches the goal. Buttons: "Again" and "Body".
  8. "Reset progress" at the foot of the start screen: the first tap turns it to "Tap again to reset".
  9. At 390 px wide nothing scrolls sideways and nothing covers the board.
- **Done:** one `npm run look -- "/clade/?toy=kit"` run at phone size: plan a part, pick a board, see the Life
  start (screenshot paths in `status.md`); `npm run check` passes; one commit "B0 round two, part C: the toy page".
- **Stop and ask if:** the Life screen needs changes to lay out here; anything reads as a design choice.

### Part D: the Life's side
- **Touch:** `ui/life/hud.ts`, `ui/life/Life.svelte`, new `ui/life/kit-hud.ts`, `view/life-stage.ts`,
  `view/playback.ts`; `ui/toy/KitToy.svelte` for the clock switch only.
- **Don't touch:** `sim`, `data`, tests, `ui/App.svelte`, `game/`. A Life outside kit mode looks and plays as today.
- **Behaviour** (kit mode only):
  1. The turn reads `Turn t/season(l)`; `endSeason` in `life-stage.ts` uses `season`. `resident()` passes
     `kit: undefined`.
  2. In place of the Enforce list (`kit-hud.ts`): "Build · N points"; one line of the six stats ("Bite 2 · …");
     the button "Point · N food" as in round one; then the nodes by place in `SLOT_NAMES` order, then "Traits".
     A row's label is the current rung's name (the first rung's when not grown). Its note, by state: open by plan
     "planned · <adds>"; open by offer "offered · <adds>" ("rare offer · <adds>" for a rare node); grown below the
     cap "next: <rung name> <adds>"; grown at the cap "full", or "deeper at level N" when the node has more
     rungs; `wait` "not offered"; `locked` "level N"; `shut` its `why`. A row is disabled unless `canSpend`, and
     carries the classes `grown`, `offer`, `rare` as they apply. A tap runs `spend` through `stage.act`.
  3. Taps on the board. A strike is marked: a tap is today's move. Else a tap on any tile calls `setTask` and the
     beat starts; a tap on your own tile with nothing to work drops the task.
  4. The beat: while `kit.task` is set, run `stepTask` through `stage.act`, one step every `KIT.beatMs` counted
     from the start of the last step, or as soon as its playback ends if that is later. A false step ends the
     beat. Any button (verb, Grow, Lay, Point, a node) drops the task first.
  5. The clock (a switch "Clock" beside Restart, off at the start, kept in the toy's state): when on, with no
     task, no playback running and no strike marked, each beat runs `stay`.
  6. `playback.ts`: `work` shows a floater "<work>/<of>" over the tile and a short bounce; `rung` shows the hud
     banner with the rung's name in gold.
  7. `window.__game` gains `task(x, y)`, `step()`, `kit()` (the Life's `kit`); `spend(id)` and `point()` go to the
     kit in kit mode.
- **Done:** one look run: plan a part, pick the mat field, grow the planned part, tap a mat three tiles off, wait
  until it is eaten, switch the clock on (screenshot paths, and how long one step's playback takes against the
  600 ms beat, in `status.md`); `npm run check` passes; one commit "B0 round two, part D: the Life's side".
- **Stop and ask if:** `hud.ts` or `life-stage.ts` would pass 400 lines; the beat needs a change in `sim`.

## Done when
- [ ] In play: over several Lives you plan, take offers, climb rungs, level up and solve a board.
- [ ] `npm run check` passes.
- [ ] Your notes are in `docs/playtests/`. Five things to look for: did offers change your build from Life to
      Life; did a level-up make you start another Life; does work on a beat feel like the fun you named, or like
      waiting; is the goal the right size for a "chapter"; which numbers are off first?

## Size check
- New systems (one at most): one, kit mode (it replaces round one's tree mode at W2; until then both exist).
- Budgets: 6 stats (at the cap); a clade's kit at most 6 places, 12 parts, 3 rungs a part, 2 traits (*your call,
  17 Nov*, for what a Life uses; it replaces "9 nodes a clade"). No new verb; no new food.
- Fits its sessions? Four parts, each one builder session; A and B may share one. W2 loses a session for it.

## Open questions (none blocks part A)
1. **No number was played, and I could not run the skipped tests.** A rough sum says a bare first Life lays 10 to
   15 eggs and a good build several times that, so the goals (24, 18, 14) and the levels (12, 40, 90 eggs) may be
   far off. Tune in `data/kit.ts` after the first Lives.
2. **Defence is all or nothing** (2 turns the strike, 1 does nothing), as your "20 defence" example asks. The
   research warns that hard gates feed "solved". If it plays flat: hunters of different force (`ideas.md`).
3. **Stats show as small whole numbers** (bite 1 to 9). Your examples used 50 and 20; a ×10 display is one line.
