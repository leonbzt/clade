# Fable brief, part 4: the whole road

16 Nov 2026, written by Claude (Fable) at the user's ask, after the W1 round-two play. Run it in a fresh session:
`/architect the whole road: follow docs/design/fable-brief-4.md`. Briefs 1 to 3 are history; do not read them.
Everything marked *lean* is the brief writer's proposal, to be judged and not adopted.

## Why this pass (the user, 16 Nov)
"a big fable session to set up everything for the future of the build as well as possible so everything is
structured, plannable, efficent, token saving, having a clear roadmap and documentation, good mechanics and life
minigames and other things that could be important when working on the project and getting it to itch release and
then to full first release, including minigames, accounting for different kingdoms, interactions, symbioses, art and
identity."

## What the play said (`docs/playtests/w1-round-two.md`, 10 lines: read it)
- **Works:** "I like it a lot better now and everything is moving closer to how i imagined it." Finding variants
  with a different gene; the population-against-variant cards and the preview of what changes; the steps toward a
  species ("happy when i got closer and disappointed when i took a step in the wrong direction"); collecting cards
  to open a lineage; several lineages open at once.
- **Missing, and named as core:** "skill/ability/evolution trees with points to allocate and make builds that way.
  this is a core aspect of my vision." The user's own sketch: the board "could stay similar to the current system"
  and "the evolution tree/skill tree allocation is only for a specific run."
- **Open, in the user's words:** "the actual games, like a current life, how to give them identity and the feeling
  of building your own build, similar to the equipping parts in the body slots and speccing an skill tree and using
  abilities."
- **Not said, so not known:** rivals and Hold, the many Wait goals, thrift, telling species apart.

## The finding to start from
1. **The map loop is answered; the build is not.** W1's question was the board, and the answer is yes. The toy has
   no Life in it. The 15 Nov direction replaced parts on slots (the one place a build was made) with 2–3 dials, and
   43 of 54 of those are flat (direction §11.4). So the board gained a climb and the player lost the build.
2. **The wish is old and consistent:** "skill tree is cool" (5 Nov), points that "buy verbs, special abilities or
   part upgrades" (11 Nov), "equipment and an RPG character" (12 Nov), a skill bar a line on an OSRS curve (16 Nov).
   No design since 10 Nov has given it a home.
3. **W2 cannot be cut before this is settled.** W2 deletes the old records, and the Life's verbs come from parts
   (`sim/verbs.ts`, `life-body.ts`; a loose grep finds parts in 26 files of sim, view and ui, not read). Porting
   "the worm as it was" ports a build layer that the same step removes.
4. **A caution.** This is the fourth big design pass in a week (10, 12, 15 Nov), against 7 700 lines of game. Its
   output is calls, a roadmap and contracts, not another long page.

## Fixed and open
- **Fixed** (decided, and now confirmed in play): the slot board of jobs; real species as named points; cards;
  variants to find, compare and adopt; several lines; the quiet sea; movers only at release; land by evolution.
- **Open:** "a build is its dials, and no more" (1c's second half); the roadmap from W2 on; what W5 is; the Life's
  kit; the budgets; every *proposal* in direction §3 to §8. Judge each lean against one structurally different
  answer.

## Questions, most depth first
**Q1. Where the build lives.** Trees, points, abilities, parts on slots: in one run, on the line, or both? Options
to judge: (a) a tree for one Life: points come from growing, are spent in that Life, and reset (the user's sketch);
(b) a permanent tree a line, points from line levels (the skill-bar wish); (c) both: the line's tree unlocks, the
Life equips a few (the verb slots of M1 step 10, which played well); (d) the tree *is* the genome and the flat dials
go. For each: does a node enter `fitness`, or only the Life? (*Lean:* only the Life, so the laws and their tests
stand, and the board stays the species layer.) What does one more clade cost: its own tree, or a shared tree a kind
of Life with one clade branch? How does it sit with real biology (nodes as the clade's real features)?

**Q2. The Life.** What one match is under the new model: forage, dig, hunt; abilities you use; the clade's one
mechanic; what makes two Lives of the same line differ. The smallest kit for the alpha, and which minigames wait
(maths pass Q7 has a table of six). The worm Life is proven and stays the base.

**Q3. One progression map.** Eggs, line XP and levels, points, cards, lines, the tree as the unlock map: what earns
what, in one small table, with no second currency doing the first one's job. The meta wish (a meta to find your
place in, patches as eras and events, earlier Lives staying as inhabitants): in the alpha, after it, or parked.

**Q4. The genome after Q1.** Flat dials (§11.4) and the near relative with no place (§11.5). If the tree carries
the build, how many dials does a line still need, and does the laws' second cut shrink?

**Q5. Doors, not designs.** Plants, fungi and sessile life as playable kingdoms; symbiosis, parasitism, pollination.
The release is movers only. Name what the model needs now so these are a data row and a rule later and not a
rebuild (as `eats` is derived, a partner link could be), and say in one line each: alpha, release, or after.

**Q6. Art and identity.** Two things: my creature reads as mine (the look contract, L1; the grammar is unproven on
fish, lizards and birds), and the game reads as itself (name, tone, one sentence, the itch page, cards). Where
code drawing, PhyloPic silhouettes and Retro Diffusion each earn a place.

**Q7. The road and the workshop.** The roadmap from here to the closed test, the alpha and the release: each step
one question and a session count. Then the workshop: which docs a session may read, what moves to `_archive/`,
the test budget, the branch, the session types.

## Measured 16 Nov (do not measure again)
- Code: `clade/src` 7 678 lines (sim 2 560, model 793, data 907, view 2 241, ui 1 177); tests 3 667 lines, 230
  tests and one todo. `toys/` 9 883 lines and `game/` 7 229, both throwaway or frozen.
- Docs: `docs/design/` 3 970 lines in 24 files, of which the direction (266) wins and two more hold in part;
  `decisions.md` 924; `ideas.md` 243; `tastes.md` 186; 34 slice specs.
- `npm run check` 13.2 s against a 10 s budget. The tests alone run 7.8 s in parallel; the three slow ones are
  the toy board's goal walks (2.7, 1.7 and 1.5 s). `hunt.test.ts` "under 100 ms" took 1 184 ms under a parallel
  run: a timing test that depends on the runner.
- Branch `n4-who-eats-whom` carries all of W1; step 12 is built, never played, never merged.
- Not verified: the Life in `clade/` as it plays today; the trait sources (direction §6).

## Read, and nothing else until a question needs it (about 600 lines)
`docs/status.md` · `docs/design/direction.md` · `docs/playtests/w1-the-wide-toy.md` and `w1-round-two.md` ·
`docs/tastes.md` · `ROADMAP.md` "Now". By question only: `clade/src/model/types.ts` (Q1, Q4, Q5),
`clade/src/sim/verbs.ts` and `life.ts` (Q2), `maths-pass.md` Q7 (Q2), `whole-game-build.md` §5 (Q6),
`docs/research/progression-games.md` (Q3). `ideas.md` and `decisions.md` by grep, never whole.

## How to run it
- **Round 1, options.** Q1 to Q3 as one proposal of about 15 lines each with a lean, three questions at most.
  Stop for the user's calls. Write nothing but `docs/proposals.md`.
- **Round 2, the rest.** Q4 to Q7 the same way, short, after the calls of round 1.
- **Round 3, write.** Only what was called. After each round the calls go to `decisions.md`, so a reset loses
  nothing.
- One agent. A researcher only for a fact that changes a call.

## What it leaves
- `direction.md` amended in place (a new round in §1; §3, §5, §7 and §8 current), not a new design page.
- `ROADMAP.md` re-cut on the user's "adopt"; the calls in `decisions.md`; `ideas.md` pruned of what was decided.
- The spec of the next step, with its contract and build brief; types and failing or skipped tests where a rule
  can be code.
- The workshop: `docs/README.md` and `CLAUDE.md` naming what is read; the history moved out of reach with the
  user's okay; the check back under its budget, or the budget changed by the user.
- Limits: under 60 new lines in the direction page; no step specified beyond the next two.
