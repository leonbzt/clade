# Fable brief, part 3: the maths pass

12 Nov 2026, written by Claude (Opus) from the user's asks. **Run it after the N4 play test** (*decided 12 Nov*), with
the user's N4 notes in `docs/playtests/n4-who-eats-whom.md`. Parts [1](fable-brief.md) and [2](fable-brief-2.md)
set up the whole-game pass of 10 Nov; this one is narrower and deeper: the systems under the game, as maths.

## Why this pass
The user, 12 Nov: "use its mathematical capabilities"; "a deep and really efficient and well thought through network
and system could really improve the game"; "I want to cater to Fable's wide reasoning and mathematical capabilities."
The user knows boids, cellular automata, Lenia and L-systems from their own toys, and wants critical, realistic takes
with measured numbers, not a vision in prose.

## 0. How to work
- **Read, in order:** this file; `docs/tastes.md` (the taste every answer must fit); `whole-game-build.md` §3–§6 and
  §10; `whole-game.md` §3, §4 and §12; `docs/status.md`; the N4 spec and the user's N4 notes; `ROADMAP.md` "Now".
  Then the code the answers touch, for measured facts: `clade/src/sim/{sea,fitness,hunt,wild,news}.ts`,
  `clade/src/data/{sea,parts,clades}.ts`. v1 (25 Oct – 2 Nov) is summarised in part 2 §5; its code stays off limits
  unless the user opens it.
- **Write:** one document, `docs/design/maths-pass.md`, one section per question below. Each section ends with a
  lean, its cost (lines, ms, sessions), what it changes in `clade/` (patch or rewrite, measured), and the roadmap step
  it serves. *Decided*, *proposal* and *idea* labels as in the repo.
- **Toys:** at most two, single HTML files in `toys/`, for the claims that numbers on paper can't settle. *Lean:* the
  sea model (8 h of catch-up at speed, with swings and no collapse) and the organism grammar (one contact sheet).
  Describe any other toy as a spec for a later session.
- **Questions to the user:** at most three per round, two rounds, options with a lean. Proposals: at most three open in
  `docs/proposals.md`. The user owns the design; nothing here becomes the plan without their call.
- **Spend the depth on Q1, then Q3–Q6.** Q2, Q7 and Q8 can be shorter.

## 1. Hard limits (change one only by naming it and saying why)
- Phone first; 8 h catch-up about 5 s (up to 10); `npm run check` under 10 s; 160 generations under 100 ms.
- At most 4 stocks, 6 stats and 10 genes per kingdom (`ROADMAP.md` budgets). Adding one means removing one.
- `fitness` is the only source of tier letters; nothing derived is saved; `sim` never imports the view (§6 laws).
- The look contract (§5): one palette, a plan plus stamps per creature, one visual channel per thing to read, 16 px.
- The user's lessons: v1 was "lost and random" (a sim as the product, without cause and effect); "I just auto every
  time" (choices that don't bite); the larva was "too much" (complexity creep). "Fewer visible layers, more hidden
  depth." "A lot of feel with simple mechanics."

## 2. The questions
**Q1. The living sea, in depth, and the land later.** The user: "how to simulate or give the feeling of a full
ecosystem, have strong interaction"; "how an ecosystem can feel alive, lead to discoveries and how it can be
interconnected, evolve by itself and stay readable and compute efficient". And: "in v1 I had a tile by tile sim with
multiple layers. Is there an approach from a fresh start?"
- *Representation.* v1 ran every tile with layers (water, shade, nitrogen) on a 96×56 grid; today's sea is a graph of
  10–16 habitats with stocks and populations, and tiles are only ground and paint. Is there a design that keeps local
  texture (gradients, fronts, patchiness, succession) at near-graph cost? Weigh, don't assume: coarse fields under the
  graph, distributions inside each habitat, slow cellular automata for the ground only, event-driven updates, detail
  only where the camera looks.
- *Dynamics.* The smallest model whose food web swings without collapsing, with few species, and what makes it
  interconnected: closed nutrient loops (detritus back to producers), size-structured predation, functional responses,
  competition by fitness, spread between habitats. How to test stability cheaply (for example, the fixed point's
  eigenvalues as a unit test).
- *Evolving by itself.* Wild branches (N4), drift toward what a habitat demands, the sea crossing a gate on its own.
  What keeps "your Lives bring the big changes" true.
- *Discoveries and readability.* Rare things that fall out of the system (a reef, a carcass bloom, an ash fall), each
  with one nameable cause for the patch notes. How a player learns the rules like a tier list.
- *Speed.* Catch-up by big steps, closed forms or skipping to the next event; what stays exact.
- *The land later* (the shore chapter): soil, plants as the baseline, succession on lava (lava → bare → forest; Terra
  Nil). Does one engine run sea and land with different stocks?

**Q2. Zoom levels.** Soil, patch, habitat, island, continent: which are simulations, which are views, and which carry
a decision of their own? How do the levels stay consistent (what is aggregated, what is sampled)? *Opus's lean, to
test:* a level earns its place only through its own decision; soil reads better as a kind of board (a Life among
tiny animals in the mud), the continent as chapters.

**Q3. One organism engine.** The user: "how to design and draw a wide variety of organisms such as vertebrates,
insects, plants, fungi etc. all from one core engine"; "organism generation and drawing is a really difficult
problem." Animals are built along one axis, with repeated segments that change front to back; plants and fungi are
modular, repeating units that branch. Is there one grammar for both? How do a few genes and parts develop into a body
(development as a function), with size setting proportions and upkeep (allometry)? How does it stay recognisable per
line and true to the real defining traits of each group (tastes, 10 Nov)?

**Q4. Drawing it.** From that data to pixels at three sizes (map icon, board sprite, portrait) through §5's channels;
what is generated and what is a hand-made stamp; motion as a function on the body (gaits). A check that two lines
never read alike. The target look: "between OSRS and Stardew Valley", 16 px.

**Q5. Genetics, rethought.** The user: genetics "could be approached from a mathematical perspective, and also
rethought": how genes "could be fun, readable but also deep, feel dynamic and give readable traits and stats". Today:
parts are tools picked in Lives; two genes (size, gut) wait for R5. Ask: what a gene is in this game (a setting, an
allele, a quantitative trait); trade-offs that make builds (no gene only helps; "not every stat can be improved");
how a population's genes move without the player (selection, drift) and how the Life steers them; how a genome reads at
a glance (the user liked pips "like a chromosome arm"); how rare finds stay exciting.

**Q6. Skills, skill trees and evolution trees, and their balance.** The user: "how skills, skill and evolution trees
could work and be balanced"; earlier: the line as an RPG class (IdleOn's parallel classes, an OSRS pure, a Dark Souls
build), "levels as an evolution tree: points buy verbs, special abilities or part upgrades", and "equipment and an
RPG character". The tree of life's gates from real traits (R6). Balance without a balance bot: value curves in closed
form, dominance checks, counter triangles, intransitive competition, and the brief's fail test (no single best order).

**Q7. Minigames from maths toys.** For cellular automata, Lenia, boids, L-systems, reaction–diffusion and others: the
one lever the player holds, the feedback loop, a failure you can read, the clade it suits, and how its result goes back
to the sea as eggs and events (law 7). Each Life mechanic today is a turn-based board (forage, tunnel, hunt).

**Q8. Decisions and fun.** The user after N3: "the runs themselves are a little boring", "I don't feel a lot of
decisions in the runs, and in between yet"; and their N4 notes. How many real choices per Life and between Lives,
and which trade-offs make the best answer depend on the board and the sea?

## 3. What the user should get back
A document they can read in one sitting with a table of leans (question → lean → cost → step), the toys, and at most
three questions. The deep sections can be long; the summary must not be.
