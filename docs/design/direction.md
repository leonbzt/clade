# The direction: a wide island of real species

15 Nov 2026. Written by Claude (Fable) after the user's review of the maths pass. **This page wins** over every other
design doc; §9 says which parts of the older ones still hold. Items are *decided* (with a date) or *proposal* until
the user says so. A build session reads its step spec, not this page; the spec cites the sections it needs.

## 1. Decided on 15 Nov (the user)
- **The aim:** "a full game, with many different species, preferably many real recent ones, alongside land life and
  plants." Priorities: "most important is fun and a hooking core, second is a full ecosystem/slots board and food
  chains."
- **The critique of the maths pass:** "too much focus on fixing the current system instead of finding the overall
  best approach"; it "feels a lot like only thinking about the worm builds"; rebuilding and rebalancing in small steps
  is wasted if a wide roster means "going through this again".
- **1c. What a species is:** a lineage is a real clade with a fixed body plan and 2–3 dials; named real species are
  the leaves you reach.
- **2b. When it is set:** a present-day island. The tree is the unlock map; ancestors are nodes you pass through.
- **3a. What is playable at release:** movers only (forage, hunt, dig). Plants and sessile life are board pieces that
  hold slots.
- **Traits:** "a real bottleneck, and will have to be done well, and could be fleshed out over time with some hand
  authoring and researcher agents."
- **Process:** Fable for advice and deeper architecture; weaker agents follow through; no drift (§10).
- The findings in §2–§8 are agreed "mainly ... good inputs". They are still *proposals* in their details.

**Second round, the same day:**
- **"Adopt":** the plan in §8 is the roadmap.
- **A young island** (question 1, a): real species arrive as colonists on a bar; your lines radiate into what is open.
- **The roster is a mix chosen for recognisability** (question 2, c), not one real place.
- **The first line is a present-day marine worm** (question 3, a); the tuned worm Life ports as it is.
- **Land by evolution:** "life should come to land as the lines evolve in that way, as it could have happened in real
  life. Key adaptations should allow it, like walking or breathing."
- **Variant hunting:** "the hunting for variants with differing genomes and mutations was very fun, so I would like to
  include it if feasible, to make looking at the map its own core gameplay loop."

**Third round, the same day (the W1 architect session; each was the option taken as put):**
- **The model is a real module:** W1 writes it, tested, in `clade/src/model/`; the toy is a thin page over it; W2
  shrinks to wiring it into the sea, the Life and the screens and deleting the old records.
- **Dials are shared axes under each clade's own words:** the rules know five (size, bite, guard, speed, brood),
  each with one law where it pays and an upkeep cost; a clade shows size and at most two more, named its own way.
- **In the toy the shore opens and the land stays shut:** a rare "breathes air" variant shows in a population of
  yours at the tide line; adopting it opens shore cells. The land shows its plants only. This uses the lean of
  §11.2 for the toy and does not decide it for W4.

## 2. Findings: why the frame had to move
*Measured in `clade/src` on 15 Nov.*
- **The sim's world is written as types, not data:** 5 clades, 2 foods, 3 roles, 3 defence kinds and 27 named parts
  (`sim/records.ts`). The sim is 3 100 lines; the organism model in it (records, fitness, hunt, sea, wild and their
  data) is about 700. The ground, map, board, Life and screens do not depend on what a worm is.
- **What the maths pass got right survives any roster:** the slot board, the quiet sea, letters against the meta, one
  fitness formula, the Life as a board, one zoom rule (the habitat is the simulation).
- **What would be redone:** part-by-part tuning (P53), the worm's tree (N6), the trilobite and swimmer lines (N7).
- **The play verdict stands** (12 Nov): "core there but no game". A wider roster does not fix a weak loop. It adds
  recognition and collection; the loop still needs a next goal and something that is yours (§7).
- **Diversity is cheap in the sim and dear elsewhere.** Species 200 costs one data row. Each *kind of Life* is a
  minigame and each *body plan* is a drawing. So: few kinds of Life, few plans, many species.
- **Process:** 4 000 lines of design docs against 5 500 of code, and four restarts in three weeks. This is a model
  swap inside `clade/`, not a fifth folder.

## 3. The game in one paragraph (*proposal*)
A young volcanic island today, with a sea, a shore and bare land. Every habitat is a board of jobs (a food and a way
of eating it). Real species arrive and hold the jobs, and who eats whom follows from their traits. You main a line: a
real clade with its own body plan, starting as a marine worm. A Life is one match as one creature of that line; its
eggs move the line's dials and take or hold a job. Between Lives the map is its own game: populations throw variants
with different genomes, and you find, compare and adopt them. A line that fits a real species' numbers *is* that
species: you get its card. Finished lines open their nearest relatives on the real tree. The land stays empty of
animals until a line of yours gains what it takes to live there (walking, breathing air); then it radiates into it.
Real island life is adaptive radiation (one colonist, many niches); that is the game.

## 4. The organism model: balance laws, not species (*proposal*; the contract is code since 16 Nov)
**A build is a point in its clade's dial space. A real species is a named point.** One record serves both, so wild
species stay "other players' builds".
**The shapes are `clade/src/model/types.ts`** (they win over this page): `Clade` (plan, life, diet, ground,
adaptations, guard, beats, base stats, dials, mutations; a producer also `makes` stocks), `Build` (clade, dials,
mutations: the genome, and no more), `Named` (a build with a name, a real home and a grade per trait), `Site` (a
habitat as the laws read it). The functions are `clade/src/model/laws.ts`: `stats(build)` (the same six, derived),
`eats(a, b, kind)` (derived, never authored), `fitness(build, job, site)` (intake, upkeep, survival, value, letter,
grams, three reasons), `climax(kind, area, pool)` (the reference web). Against the sketch of 15 Nov: no feed mode
(the diet says it), a `hunt2` job for whoever eats the hunter, a `salt` adaptation, and open water as a ground.
**The laws** (numbers by feel in one data file; directions are biology and must hold):
1. *Size:* upkeep per gram falls with mass and losses weigh more on a big body (exponents 0.15 and 0.2 today, flatter
   than Kleiber's so the letters stay readable). Big is thrifty per gram and slow.
2. *Food:* a job is a food and a way of eating it. At most 4 food stocks in any one habitat; the list of foods across
   the island is longer (mats, plankton, detritus; leaf, seed, litter).
3. *Hunt:* a hunter takes prey inside a size window below its own mass. Above the window is safety by size.
4. *Guard:* each guard kind (shell, spines, hiding, fleeing, toxin) has a counter. This is "strong vs, weak vs".
5. *Producers:* a plant or alga holds a producer slot and sets which food stocks its habitat has and their ceilings.
6. *Transfer:* a population's grams come from its food, so hunters end rarer than prey without a rule saying so.
7. *Realm* (land by evolution, *decided 15 Nov*; the rule is a *proposal*): a habitat kind names the adaptations it
   needs (the shore: walking or clinging, and air for a while; the land: walking, breathing air, holding water). A
   build lives where it has them all. Where a clade can live is derived from this, never listed.

**Tests on the data, instead of a balance bot:**
- *Sign change:* every dial has a job where more is better and one where less is better.
- *No best, no dead:* no named species reads top in every job of its realm; none reads F everywhere.
- *Known links:* a small file of documented feeding links and non-links; `eats` must reproduce most of them. The
  real web is the check, never the input.
- *Coverage:* every job in every habitat kind has at least two candidates; every realm has a chain three long.
  (Measured 16 Nov on 43 drafted species: 3 sea and shore cells have none and 16 of 76 have one; the land has no
  animals yet. The tests hold these as lists that may only shrink.)
- *No names in rules:* `sim/` holds no clade or species id (today it does; the swap removes them).

**One mechanic per clade keeps species from feeling like numbers** (moult, shell, dash, burrow: whole-game §5). It is
data on the clade and a rule in the Life, not a new system.

## 5. The island, the tree and the Lives
- **The island (2b, and young: *decided 15 Nov*):** land and shore are new ground kinds on the same habitat graph.
  Life arrives: a real species from the roster comes as a colonist on a bar you can watch (the cousin's bar, renamed).
  That keeps "barren to lush" and the quiet sea, and young volcanic islands do fill up in a known order.
- **Land by evolution (*decided 15 Nov*):** no animal colonist lands. Animals reach the shore and the land only through
  a line that gained the key adaptations, "as it could have happened in real life". *Proposal:* an adaptation is a
  rare mutation (below) that shows up where it would pay, in populations at the edge: air tolerance at the tide line.
  Adopting or hatching it opens the clade that has it for good (the real ones: land crabs, land snails, earthworms,
  the fish that walk). Plants are board pieces and the baseline, so producers do colonise bare land on a bar; an
  animal that arrives finds food and no rivals. That is the radiation.
- **The tree as the unlock map (2b):** the tree is the real one, cut down to the roster (§6). Leaves are named
  species; inner nodes are ancestors, each with its defining trait, passed on the way. *Proposal:* a finished line
  opens other clades at a cost that grows with distance on the tree, so relatives come first.
- **Lines (1c):** the plan and the fixed traits belong to the clade. A clutch offers dial steps; how you lived steers
  which (P49, 9 Nov). The ladder and the small tree (12 Nov) stay as the line's levels; what a level gives is re-cut
  in the lines step (dial range, thrift, the mechanic's strength), since parts are gone.
- **The genome and the variants (*decided 15 Nov* to include; the shape is a *proposal*):** a genome is the dials (at
  most 3, they drive the rules) plus named **mutations** (discrete, rare, a short list per clade as data). A mutation
  is one of three kinds: a look (a colour morph: yours to collect), a push (a dial beyond its normal range, at a
  cost), or a key adaptation (opens a realm and a clade). Feasible and cheap: a variant is the same `Build` record
  with other numbers, so the sim, the letters and the drawing already handle it.
- **The map loop:** every population drifts a dial step toward what its cell demands (the 9 Nov wish) and now and
  then throws a variant, on a bar. On the map a variant is drawn differently and marked. You tap it, compare its
  genome and letter with your line's, and **adopt** it (it becomes your line's heir there), leave it, or watch it
  win or lose its cell by itself. Coming back after hours means new variants to look through. Rare ones are worth
  hunting; where they appear follows a rule you can learn (the edge, a crash, a new rival).
- **Lives (3a):** three kinds, the verbs that exist: forage, dig, hunt. Every mover clade names one. Swimming, walking
  and flying are board rules (speed, which tiles), not new minigames. A board piece has no Life; at release it is
  wild only.

## 6. The trait pipeline (the bottleneck)
**What the tree sources give, and don't** (from background knowledge, *not verified this session*; step W3's first
task is a researcher check of access, coverage and licences):

| Source | Gives | Use |
| --- | --- | --- |
| Open Tree of Life | taxonomy, stable ids, a tree for any set of species | `tree.json`, generated once at build time for the roster |
| OneZoom | common names, a popularity rank, photos (mixed licences) | choosing recognisable species; not the photos |
| PhyloPic | free silhouettes keyed to taxonomy | undiscovered tree nodes and cards, licence by licence |
| Mass, diet and feeding-link datasets | patchy numbers, good for birds, mammals and fish | seeding and checking rows; the known-links file |
| *None of them* | gameplay traits | the rows are authored: this is the work |

- **No network at run time.** The pipeline writes static data; itch gets one offline file.
- **A trait must feed a stat or a law.** Tags like "tool use" are card text, never rules.
- **Every trait carries a grade:** `drafted` (AI, from memory) → `researched` (the `researcher` agent, with a URL) or
  `measured` (a dataset) → `hand` (you wrote or approved it; nothing overwrites it). *Proposal:* nothing ships with a
  drafted mass, diet or realm.
- **The flow, per batch of at most ten species:** a coverage table names the jobs that lack candidates → the
  researcher writes `docs/research/species/<batch>.md` with sources and a row block → a builder copies the rows into
  `clade/src/data/species/` and the data tests run → you check a roster sheet (cards, trait bars, derived links) and
  hand-edit.
- **A species that reads wrong is a row to fix.** If many read wrong the same way, it is a law to fix. A rule for one
  species is never added.
- **The roster is a mix chosen for recognisability** (*decided 15 Nov*), not one real place: each species is real,
  the assembly is the game's. *Proposal:* a species gets in if it is recognisable, fills a job that lacks candidates,
  and a marine or island life is plausible for it. About 40 for the toy (drafted), 60 at the closed test, 100–150 at
  the public alpha.
- **Precision needed is low:** mass works on a log scale, and the rest are tags that are right or wrong. The hard
  part is checking, not generating.

## 7. Fun first: what the hook is, and how the first step tests it
The loop: pick a job on the board → live a Life there → open the clutch → the line takes or holds the job and its
letter moves → the web answers (a hunter, a rival) → the line levels → it becomes a real species → a relative opens.
Three pulls, to be judged in play and not in a doc:
1. **One next goal, always visible** (the maths pass's rule, kept).
2. **Reaching real, recognisable species.** New with this direction; the Cambrian roster could not give it.
3. **The web answering you**, with one cause line each time.
4. **Hunting variants on the map** (§5). Proven fun before ("very fun", 15 Nov; "the way ... variants popped up was
   very cool", 10 Nov), so it goes into the first toy.
The Life is proven ("the basics seem fun and as imagined", 5 Nov) and is ported, not rebalanced.

## 8. The plan (*adopted 15 Nov*; `ROADMAP.md` carries it)
| Step | What | Question it answers | Sessions |
| --- | --- | --- | --- |
| 12 | N4 fix: play it ten minutes, merge | does the quiet board hold? (it carries over) | you |
| **W1** | The wide toy: about 40 real species as rows (drafted), sea, shore and land cells on the slot board (shore and land locked behind their adaptations), the laws, the derived web, the next goal, variants on a bar to compare and adopt | is a derived web of real species a board I want to climb and look through, and can I tell species apart? | 2 |
| **W2** | The model swap in `clade/` (*15 Nov, third round:* W1's module wired into the sea, the Life and the screens; the old records, fitness and hunt deleted); the first line plays as the worm did | does the game still play, with no names in the rules? | 2 |
| **N5** | The board (the maths pass's cut): jobs as a grid, the one next goal, Take, Beat, Hold, Adopt; variants drawn and marked on the map, the compare card | do I know what is mine and what is next, and is the map worth looking at? | 2 |
| | **Closed test:** an unlisted itch build, sea and shore, about 30 species, one or two lines | does a stranger? | |
| **W3** | The pipeline and the roster to 60: the source check, `tree.json`, grades, the roster sheet, researcher batches | are the rows right? | 1, plus batches |
| **W4** | The land: ground kinds, producers as board pieces colonising on a bar, the realm law, the first line to cross by a key adaptation | does coming ashore feel earned, and the island like one ecosystem? | 2 |
| **W5** | Lines: XP, levels, dial steps and mutations in the clutch, named species, the tree as the unlock map | does a line feel like mine, and the tree like a map? | 2 |
| **L1** | The look: a plan per clade from the body grammar, the contact sheet | do I recognise them? | 2 |
| **A** | The alpha pass: the first fifteen minutes, saving, a light UI pass. **The public alpha** | | 2–3 |

About 6 sessions to the closed test and 15–17 to the public alpha. Researcher batches run alongside from W2.

**Risks, blunt:**
- *The laws flatten species into a mass and a diet.* W1 tests exactly this; the clade mechanic is the guard.
- *Wrong facts* in front of a biology-literate audience. Hence the grades and the known-links test.
- *The look:* the body grammar is proven on seven invertebrate-like lines, not on fish, lizards or birds. L1 may need
  silhouettes for cards as the fallback.
- *Evolving on a present-day island* bends time. Timelines were always the game's to bend (whole-game §5).
- *Land doubles the ground work,* so it comes after the closed test.
- *Three dials may be too thin a genome to hunt through.* The mutations are the answer; W1 shows whether it is enough.
- *A recognisable mix is not a real place.* The card says where a species really lives.

## 9. What the earlier calls become
*AI reading; a line here that changes one of your calls waits for your word.*

| Earlier | Now |
| --- | --- |
| Start at the worm in the Cambrian sea; chapters (10 Nov) | **Replaced by 2b.** The Cambrian roster (trilobite, swimmer, radiodont) leaves the release; parked as an era. The worm Life's tuned numbers go to the first line |
| Parts on six places, 27 parts, recipes, Enforce picks a family (10 Nov) | **Replaced by 1c.** The plan is the clade's; a build is its dials. *Proposal:* Enforce steers which dial the clutch offers; a recipe is a named species' dials |
| Only opened lineages live in the sea; wild cousins of your own species fill open cells (10, 12 Nov) | **Replaced** (15 Nov): real species arrive as colonists on a bar. Cousins live on as variants of any population (§5) |
| Genes as dials and variants, banked clutches (R5); drift toward the cell's optimum (maths pass Q5) | **Kept and moved up:** the genome is dials and mutations; variants are on the map from N5 |
| Life ashore "later" (the roadmap's After row) | **In the release, by evolution** (15 Nov): W4 |
| The slot board, the quiet sea, letters against the meta, one active line, ladder then tree, Adopt (12 Nov) | **Kept** |
| N6 The line, N7 The other lines; P53 | **Replaced** by W5, the roster and the sign-change test. P52 (the waste loop) is parked |
| The look contract, the body grammar (build brief §5; maths pass Q3, Q4) | **Kept**; one plan per clade |
| Budgets: 4 stocks, 6 stats, 10 genes | 4 stocks *per habitat*, 6 stats, **3 dials per line and at most 6 mutations per clade** (*proposal*) |
| M2's "done when" (6–10 lineages that look and play differently; a line reaches the shore) | Still fits; the shore is in from the start |

**Still in force where this page is silent:** the build brief (`whole-game-build.md`) §3 the ground's layers, §4 the
Life's economy, §5 the look, §6 the laws, §9 itch, §10 where sessions drift; the maths pass Q0 (the board, the quiet
sea, the next goal), Q2 (zoom), Q3 and Q4 (grammar and drawing). Everything else in `docs/design/` is history.

## 10. Against drift: who does what
- **Architect** (Fable; `/architect`): this page, the contracts (types and the law tests, written before the build),
  each step's spec and its build brief, and an audit before each itch build. Never builds.
- **Builder** (a weaker model or Codex; `/build`): one brief part per session, in order, nothing else. A design
  question is not decided: it goes into `docs/status.md` under "For the architect", and the part stops there.
- **Researcher** (`researcher` agent): one batch of rows with sources, in `docs/research/species/`.
- **You:** the calls, the play, the `hand` grade.
- **Tests carry the rules, prose only explains them.** A rule a builder must keep becomes a test in the same step.
- **One page wins** (this one), one spec per step, one roadmap. A new design doc needs your word.

## 11. Open questions (none blocks W1)
1. **After your line is ashore, who else comes?** (a) *Lean:* wild variants of your land lines only, so the land is
   yours to radiate into; (b) flying and rafting colonists too (birds, lizards on driftwood: real, and it fills the
   land faster). For the W4 spec.
2. **How is a key adaptation won?** (a) *Lean:* as a rare variant you find on the map or in a clutch, in a population
   living at the edge; (b) as a level on the line's ladder; (c) both: the ladder raises the chance. For W4 and W5.
3. **The budget:** 3 dials per line and at most 6 mutations per clade, replacing "10 genes per kingdom"? For W2.
