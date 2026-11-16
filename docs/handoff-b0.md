# The long handoff, 16 Nov: from the whole-road session to the build toy

For the agent that continues. `status.md` is the short state; this page is the reasoning, the traps and the tasks,
so nothing has to be worked out twice. It is a guide, not a design page: where it disagrees with
`design/direction.md`, the spec or a contract test, they win. Delete it when B0 is played.

Marks: **[V]** verified this session (read in code or run). **[C]** carried from an earlier measurement, not
re-measured. **[A]** an assumption or an AI proposal: do not treat it as decided. **[U]** unknown.

## 1. Where things stand
- [V] Branch `b0-the-build-toy`, cut from `main` at `b7c5a12` (the merge of `n4-who-eats-whom`). Working tree clean
  at the time of writing. Nothing is pushed; a remote exists. Do not push unless the user asks.
- [V] `npm run check` passes: 13.5 s and 14.0 s on two runs. The budget is 10 s. The fix is a part of W2, not B0.
- [V] Test counts from the last full listing: 244 tests in 30 files; 12 skipped (all in `clade/tests/tree.test.ts`),
  1 todo. (Read off a run that had one failing data test; that test was fixed and the check then passed.)
- [V] Roadmap step 14 is **B0 the build toy**: spec `docs/slices/b0-the-build-toy.md`, two parts, A then B.
- [V] `docs/proposals.md` has no open proposal. Every call of 16 Nov is in `docs/decisions.md` (two sections).

## 2. What is decided, what is not
Decided by the user on 16 Nov (their words are in `decisions.md`; do not reopen):
1. **Two layers, split by job.** The species (dials and mutations) is what the board and the laws read. The build is
   what one animal grows in one Life. A line's levels *open* nodes for good; a Life *spends* points among the open
   nodes and resets. No node enters `fitness`.
2. **One Life engine**: the grid board (8 × 11, 20 turns). Forage, dig and hunt are node sets on it.
3. **One progression map** (direction §7): food and points last one Life; eggs give the cell and line XP; levels
   open nodes; variants move the species; cards open lines. The meta is voice only until after the alpha.
4. **The build reaches the board through the clutch**: a tree's branches are the clade's dials; the clutch is a
   variant one step along the branch you spent most in, on the usual compare card.
5. **The look is split**: L1a before the closed test, L1b after W5. Code draws what moves and is yours.
6. **The road**: B0, W2, B1, N5, LC, L1a, the closed test, then W3, W5, W4, L1b, A. **No design pass before the
   closed test**: a new idea gets one line in `docs/ideas.md` and the work goes on.

Not decided (all [A], labelled *proposal* in the docs): every number; the node list; the budget of 9 nodes a clade,
12 effect kinds and 8 verbs; the doors table (auto-run, partner links, other kinds of Life); the one-sentence pitch;
everything in the B0 spec's rules beyond "a Life earns points by growing and spends them".

## 3. Why it is shaped this way (so you do not redesign it)
- **The finding that started it** [C]: the wide toy (W1) answered the map loop, but the direction had swapped parts
  on slots for dials, 43 of 54 dials were flat, and the toy had no Life, so nothing was yours to build. The user
  called builds "a core aspect of my vision".
- **Why the tree is not the genome**: the laws and the roster stay a table of dials a row; twenty clades cost twenty
  small trees of data, not twenty rule sets. The user liked "the tree being the genome" but called it "probably too
  complicated"; it is parked in `ideas.md`.
- **Why the clutch bridge**: the user's objection was that a build which never touches the board "goes against my
  intuition". Branch-to-dial needs no new law, and it shrinks the laws' second cut to the dials of playable lines
  (step LC). [U] Which of the 43 flat dials belong to playable lines was never measured.
- **Why B0 is an opt-in mode and not a rewrite**: the old Life is place-keyed (`Build.parts`: one part a place, six
  places) and switches parts on by size in a fixed family order. Tree mode replaces only that last rule. Every old
  test and the whole game flow keep running, so the question "does it feel like a build?" costs one session.
- **Why nine nodes on five places**: those are all the worm's non-rare parts. Two nodes on one place are an
  either/or. Deeper chains are impossible without new parts, which is content and the user's call.
- **Why Point replaces Enforce**: food keeps three uses (Grow, Point, Lay). A fourth sink would be a design change.
- **What the play decides** [A]: "yes" means W2 as planned. "Thin" means more nodes a place before W2. "No" means
  an architect session before W2, because decision 1 rests on it.

## 4. Tasks, in order
### Task 1: `/build B0 A`, tree mode in the sim
Read: `docs/slices/b0-the-build-toy.md` part A, `clade/tests/tree.test.ts`, `clade/src/data/tree.ts`.
May change: `clade/src/sim/tree.ts`, and in `sim/life-body.ts` only `activePlaces`, in `sim/economy.ts` only `grow`
and `enforceCost`, in `sim/mutation.ts` only `offerMutation`.
Notes that save time (all [V] by reading, none run):
- `activePlaces`: add the tree branch as the first line; leave the old body untouched below it.
- `grow` needs one line (`life.tree.points += TREE.moultPoints`). The loop that emits `part` events then emits
  nothing by itself, because the active places did not change.
- `spend` on an open node copies `pickMutation` in `sim/mutation.ts`, minus two things: it must **not** set
  `life.mutation`, and it pushes the place onto `tree.grown`. `say`, `emit`, `reveal` come from `sim/life.ts`.
- `spend` on a grown node copies `enforce` in `sim/economy.ts`, minus the food. The event carries `food: life.food`.
- `nodeState` checks in the spec's order. "Lost" comes before "grown": a lost place shuts both of its nodes.
- A need counts when its part is in `build.parts`, lost or not (the test "keeps the order grown" checks this).
- `branchOf` needs no stored tally: count the tree's nodes whose part is in `build.parts`, 1 + `enforced[part]`.
- Imports: `sim/tree.ts` may import `sim/life.ts`; `economy.ts` and `mutation.ts` need only `life.tree` and
  `data/tree.ts`. Do not import `sim/tree.ts` from `life-body.ts`.

Accept when: every test in `tests/tree.test.ts` runs (0 skipped in that file) and passes; no other test file is
edited; `npm run check` passes and is not slower than about 14.5 s; one commit "B0 part A: tree mode".

### Task 2: `/build B0 B`, the toy page
Read: the spec's part B, `clade/src/ui/life/hud.ts`, `ui/life/Life.svelte`, `view/life-stage.ts`, `main.ts`.
Facts [V] by reading:
- `index.html` loads `ui/style.css` itself, and `.life-screen` is `position: absolute; inset: 0` inside the fixed
  `#app`. So the Life screen should lay out without `App.svelte`. [U] Not run.
- The player's body draws from `activePlaces` (`view/body.ts`), and playback already shows a banner for `part` and
  handles `enforce` (`view/playback.ts`). A grown node should appear on the body with no view work. [U] Not run.
- `Hud` finds its elements by id when it is built. The "Enforce" heading in `Life.svelte` has no id yet.
- `LifeStage` keeps one scene in the module singleton `S`: one Life at a time, and the old stage must be destroyed
  before the next (key the Life screen by `run`).
- `complete` fires once when the Life is over. The dev buttons (+10 food, End the season) stay and help the look run.
- `resident()` in `life-stage.ts` spreads `...this.life`, so a rival or hunter body would copy the player's `tree`.
  The toy's boards have neither, but pass `tree: undefined` there anyway (the spec says so).
- Clone the bare worm's build (`structuredClone`) before `newLife`; never mutate `DEV_SPECIES`.
- [A] `npm run look -- "/clade/?toy=build" '<steps json>'` should work: the script appends the page argument to the
  server URL. Steps use `{"click":"selector"}`, `{"eval":"__game.spend('tentacles')"}`, `{"shot":"name"}`.

Accept when: without `?toy=build` the game is unchanged (existing screen tests pass); with it, one phone-size look
run shows the start card, a Life with the node list and "Build · N points", a node grown on the body, and the
result card with "Again" and "Boards"; no page error in the look output; `npm run check` passes; one commit
"B0 part B: the toy page"; screenshot paths in `status.md`.

### Task 3: the user plays
The user plays `/clade/?toy=build` and writes `docs/playtests/b0-the-build-toy.md`. An agent never writes that file
or ticks "played". The four things to look for are in the spec's "Done when".

### Task 4: an architect session writes W2's spec (not a builder's job)
Nothing past B0 has a spec, on purpose. What was adopted for W2 with the road (in `decisions.md`, P61):
- The check comes back under 10 s inside W2: delete the old sea tests, among them the timing law in
  `clade/tests/hunt.test.ts`; the wide toy's three goal walks share one walk.
- W1's module (`clade/src/model/`) is wired into the sea and the screens; the old records, `fitness` and hunt go.
- [A] `data/parts.ts` must survive W2 in some form: the tree's nodes *are* the old part records. Deleting "the old
  records" means the sea's use of them, not the Life's.
- [A] B1 needs, from the species down: dials set the Life's starting numbers; a mutation is a node grown at birth.
  From the Life up: `branchOf` picks the dial the clutch variant steps. Branch to dial for the ragworm: Feed to
  size, Burrow to guard, Spawn to brood.

## 5. Mistakes made this session, and traps
- I told the user B0 has "a bar of three verbs". It does not; the cap needs slot levels (B1 or W5). Check a spec
  against what was promised in chat before calling it done.
- My first node list gave the gill a need (bristles) on its own place, which can never be met. A data test caught
  it. Keep that test; when adding nodes, a need must sit on another place.
- `as const` on a board literal made `rivals` readonly and failed the type check. Build boards as plain `Board`s.
- The direction page was to grow by under 60 lines; it grew by 51 net (72 added, 21 removed). It is now 317 lines:
  amend in place, do not append rounds forever.
- Never edit a contract test to make it pass, and never touch `clade/src/model/` or its tests in B0. A test that
  seems wrong is a question under "For the architect" in `status.md`, and the session ends there.
- Do not add a kind to the `Ev` type: `view/playback.ts` switches over it.
- Do not fix the check's time in B0, and do not delete old tests yet.
- Do not read `_archive/`, `_old/` or `_v1/`. The old design docs now live in `_archive/2026-11-16/`; the roadmap
  links there for history only.
- Tool notes: a shell command that listed `_archive` and a scripted rewrite of `CLAUDE.md` were both refused. Use
  the edit tool for `CLAUDE.md`, and do not retry a refused command unchanged.
- The user tests by playing. No balance bot, no strategy simulation, no review rounds, one look run a part.

## 6. Open questions, and who answers
| Question | Who | When |
| --- | --- | --- |
| Is a tree of nine nodes on five places enough to feel like a build? | The user, by play | After B0 |
| Were rivals and Hold readable in the wide toy? | The user | Before N5's spec |
| The budget: 9 nodes, 12 effect kinds, 8 verbs | The user | W2's spec |
| Which flat dials belong to playable lines | An architect, by measuring | Step LC |
| Do the three boards ask for different builds? Are the prices right? | The user, by play | After B0 |
| Does the Life screen lay out alone, and does a grown node show on the body? | The builder of part B, by one look run | B0 part B |

## 7. Evidence this page leans on
- [C] From the brief of 16 Nov, not re-measured: `clade/src` 7 678 lines; 43 of 54 dials flat.
- [V] Read in code: `RULE` (start food 6, adult at size 3, full grown at 5, health 3); Grow costs 2, 2, 3, 3 for a
  worm; `ENFORCE_COSTS` 3, 5, 7, 9, 11 with one rank of headroom; a worm on mud is buried and strikes miss it.
- [C] Read earlier in the session, not run: a bare worm can eat mats; buried food needs the burrowing bulb.
- [U] How a Life plays today with a bare worm on these boards. Nobody has run one.
