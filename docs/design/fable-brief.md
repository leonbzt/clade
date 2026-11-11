# Fable brief, part 1: the vision

10 Nov 2026. Written by Claude (Opus) from the repo, for one Fable session. Quotes are the user's own words, typos
kept. Anything marked *AI* is Opus's reading, to test, not to trust.

**How to work: two parts, in order.**
1. **Read only this file first.** It holds the ask, the person, the vision in the user's words, the biology and the
   constraints. It says almost nothing about what is built, on purpose.
2. **Write Part A of `docs/design/whole-game.md`: your own game concept, from these tastes alone.** Why: the user asked
   for "a fresh view of how my vision could be implemented and achieved from a fresh start". The current build was
   made by many AI sessions, each inheriting the last one's shape, so nobody has yet designed this game from the
   tastes alone. Once you've seen the build you can't unsee it, so the concept has to come first. Don't open part 2
   or any other repo file before Part A is written, and don't rewrite Part A afterwards: differences go in Part B.
3. **Then read part 2** ([fable-brief-2.md](fable-brief-2.md): the game as built, with four screenshots, the
   playtests, the calls made and Opus's reading), and write Part B.

## 0. The ask
**The user, 10 Nov, verbatim:**
> the help i want is on my original vision of playing as a "build" and developing your lineages, advancing and
> discovering the tree of life, discovering things in the ecosystem, placing your species in the ecosystem to see how
> they do and interact, and try to fill new slots with a high tier, well adapted lifeform. it ideally should cover all
> branches of the tree of life, give you the feeling that you actually steer and discover things, that there is
> actually freedom and things can happen. it should focus on the vision and how to achieve it, how to achieve it and
> include real biology, and how the current state of the game is and how it fits the visions, and what parts could be
> improved or changed. also maybe a fresh view of how my vision could be implemented and achieved from a fresh start,
> or how the current approach would make most sense. also what contributes to a good feeling game, where accuracy is
> important and where decisions should mainly serve the gameplay. main focus is my vision throughout the project and of
> the game i really want, how it could be done, and what to change or keep in the current approach. then also how to
> setup all systems to achieve the vision, and also maybe what the gameplay should actually be like (decisions/menus
> only, a minigame like currently, something skill/knowledge based...?)

> the minigame or activity aspect is also important to me. [...] also what kinds of minigames could there be? i really
> like the ressource management one from currently, but i also had an early game approach where you had areas with
> different minigames based on things like cellular automata or boids. the big inspiration is the tierzoo world
> treating real life as an rpg. also what i really think would be cool is having interactions such as predator/prey,
> symbionts parasitism, ect.

And 9 Nov: "bring the whole game into shape, and find a suitable fit for my original vision of playing lineages and
evolving them and caring for a full ecosystem"; "save as much fable uage as possible".

**What to write in `docs/design/whole-game.md`** (about 350–500 lines in all; plain words; tables welcome):

*Part A, the fresh concept (after part 1 only):*
1. **The core fantasy** in one paragraph, in the TierZoo frame: real life as an RPG.
2. **The activity:** what the player does minute to minute, and why. Answer "decisions/menus only, a minigame,
   something skill/knowledge based?" Then a **catalogue of minigames or activities**: for each, how it plays, which
   branch or way of life it fits, which sim method could drive it (resource board, cellular automata, boids, L-systems,
   physarum, ...), what skill it asks, and what it costs to build. Lean on one or two for the first release.
3. **The scales:** a Life, a lineage (the "class"), the ecosystem (a board of niches to fill), the tree of life. What
   you decide at each, what carries over, what is yours, and where the pull to play again comes from.
4. **The systems, one job each:** lineages, species, variants, parts and genes, tiers (and what a tier measures),
   the ecosystem, interactions (predator and prey, symbiosis, parasitism, competition), discovery, the tree.
5. **The whole tree with one framework:** how the game reaches all branches (§4) without a new game per kingdom;
   where the biology must be right and where gameplay wins.
6. **What makes it feel good:** pull, pacing, surprise, readability, swings.

*Part B, after part 2:*
7. **Diagnosis:** the build against the vision and against Part A. What fits, what fights it, why the pull dropped.
8. **Two routes:** (a) evolve the current build toward the vision, (b) a fresh start from Part A. What each keeps,
   what each costs in sessions, and a lean.
9. **Keep / change / cut** for today's systems, as a table.
10. **System setup:** the shape of the data and rules (one record per what?) so later branches fit without rewrites.
11. **A roadmap** from roadmap step 7 to the release, then the milestones after it. Steps of one or two sessions.
12. **At most 3 questions** for the user. They reply in the same session; then fold the answers in.

**Rules.** The user owns the design: label statements *proposal* or *idea*; nothing is decided until they say so. Be
critical and concrete, no padding. Don't read the code. Open the files listed at the end of part 2 only if a claim
truly needs it (they cost tokens). Write only `docs/design/whole-game.md`.

## 1. The person
- **Clade:** an idle / incremental evolution game for the web, one HTML file on itch first, phones later, portrait
  first. A hobby "with about 100 nerds on Discord", about 3 h a day. The audience: idle and RPG players who like nature.
  The user knows boids, CA, L-systems and Lenia, and wants critical, realistic takes.
- **How it's built:** AI sessions from short slice specs. The user designs, plays every slice and writes notes.
- **What went wrong before** (the user's words): "AI iteration made it convoluted; long sessions from sim runs and
  tests; the vision drifted; parts were half-baked." An earlier attempt, "Cradle of Life", ended from "tangled systems
  and a new idea pulling away".
- **v1** (25 Oct – 2 Nov), in the user's words (10 Nov): "a plant sim where variants occur and the plants form their
  own habitats independently, and animals are introduced as individuals roaming around. this is very cool and has a lot
  of detail but i was worried about performance. but the way new species a founded and variants popped up was very
  cool. we also experimented with plant growing minigame there." The AI review then: the sim became the product, with
  no learnable cause and effect, and checking any change took minutes of simulation.

## 2. The vision, in the user's words
**The frame.** "The big inspiration is the tierzoo world treating real life as an rpg" (10 Nov). TierZoo (YouTube)
treats animals as builds in an MMO called "Outside", with tier lists, metas and specs. "Tier talk is the voice of the
game": "no upkeep in mud was a gamechanger for the worm and brought it to s tier. i think this is exactly the way
someone should talk about the game" (4 Nov). Liked most from that frame: patch notes with a cause, a tier letter per
niche, strong vs / weak vs, trade-off tooltips (8 Nov).

**The feeling.**
- "Growing an ecosystem and growing your species" is the most important thing. "A garden you tend."
- "Discovering life yourself." "Author the laws of nature, not the history" (1 Nov).
- "Always adapt to your surroundings" (2 Nov). "World is core" (5 Nov). "Species has to change the board."
- "It feels alive", "The 'living' ecosystem is also really important to me to have the feeling" (4 Nov).
- "I like to be the little creature and chase things around" (4 Nov); to feel "really a part of that habitat".
- "Some surprise and change and actually feeling like you have to adapt is great" (9 Nov).

**Builds and lineages.**
- "You should have the feeling of beeing able to select a build or class like in an rpg, and maybe evolve your
  lineages along the way" (10 Nov).
- "Like levelling a specific pure OSRS character, or making a Dark Souls build" (3 Nov). All-rounders are bad;
  "there always needs to be some kind of pressure or damage and some kind of armour, or locked reward."
- "Lineages are your characters"; you grow one thing the whole time (29 Oct).
- "It would be cool if you had ie a arthropod lineage that you level along the whole game, and when for examples
  spiders branch off you start a new parallel one. or some kind of character slots" (9 Nov); "similar to playing
  different classes in Idleon in parellel, each has a function and speciality" (10 Nov).
- "You can play as every lineage"; "generalized bodys and creation"; "not author tons of other creatures that you
  can't play." Lineages change "because you played them well and picked adaptations that formed a real new lineage.
  that also looks differnt" (6 Nov).
- A named real species as "an end point for a lineage", "pretty strong", with "a slightly different sidebuild that
  could be more optimal under some circumstances"; for recent animals "it would be cool to discover an own thing".
- "The animal or creature you see and build is qctually the one drawn fells important, and also see your impact."
- New forms: "pureley from parts or having a strong generator would also be really important"; "or also by rules that
  are overarching. (skeleton + flabby skin/feathers = wing) but i think authered is easierst mainly" (6 Nov). The traits
  that define a form should be real: autapomorphies of species and clades (10 Nov), maybe "a rare unlock you get at
  some runs, or need to combine it with other oarts and a good score".

**Evolution.**
- Genes appear and spread by themselves, and that stays at the heart; "mutations can be an unexpected reward";
  choices sit on top. Genome → body → stats → niche ("love the genetics split", 2 Nov).
- From v1: "looking at and observing the variants feels very cool", "hunting for new variants was a lot of fun"; the
  variants "emerged automatically and always ended up having the best fit"; "a small genome is great to me" (9 Nov).
- "I really like the random genes and 'mutation' aspect"; "there should also be some kind of lootbox feeling maybe".
- What you do steers the body, "over generations and by picks", with "a higher chance of parts that relate to the
  current actions" (9 Nov). "I want species generation to keep a life dynamic."
- "Adapting has to feel like adapting. Buying every trait isn't it." Some choices trade ("more spread while drying out
  more").

**The ecosystem.**
- "Ecosystem should feel like a board that evolves and offers slots/niches/habitats that need to be filled. which
  build is s tier in this habitat? oh i made a s tier build in the current meta. also like a garden that evolves and
  grows, where you can discover things, new animals, and should be cool to look at" (10 Nov).
- Interactions: "predator/prey, symbionts parasitism, ect." (10 Nov). "A living food layer is definetley the
  direction"; food chains "should be important", with who eats whom on show.
- Places "really goverened", "booms and crashes", "species spreading and only few named rules"; "the overview map is
  very important for feeling"; "not all roles should fit everywhere" (5 Nov). "Swings are wanted": species dying out,
  grazers eating plants to death. "The sim has a life of its own; you can't influence everything."
- "Populations should drift towards what their patch demands." Rare features and events "best if it came from the
  actual system": "a small chance" when "the required population is there" (9 Nov). Landmarks, "a special map,
  layout or feature", things to discover. "Habitats the sim detects, in detail."
- Readable: show why something is winning; every change has a true reason.

**The tree and the breadth.**
- A connected tree that loosely follows the real tree of life, "with a lot of freedom". Eras: "It should still be free
  do evolve your own things, but the environment should promote that it resolves naturally in the next real era."
- "Most of my vision came from animals"; plants "feel like they should be the baseline", playable later; "moss vs
  herb vs tree should all play different"; filter feeders "maybe stacking up"; life coming ashore.
- Zoom layers (a friend's idea, 2 Nov): soil close-up, side view, island map, world: "I really like the zoom layers".
- "Many small games that show the diversity of life"; "I plan to add more mechanics and minigames midterm."
- An apex slot per era that sets one era-wide rule, "my species can take it"; "i love the boss idea".

**How it should play.**
- "A lot of feel with simple mechanics that can get done, instead of overly complicated and not fitting things."
- Simple core, strong progression; hand-curated progression; shortcuts to proven concepts (IdleOn, Idle Obelisk Miner,
  Melvor, OSRS). Hybrid idle: early systems need attention, then go idle. Fast unlocks to learn, then a midgame.
- "Fast climb means noticeable improvement." Things push back; pressure is good; never locked out.
- "Simple and impactful" decisions, budgets and moving for rewards: "a great little minigame to solve" (4 Nov).
- Rare drops, the most efficient route, milestones worked for, "getting mechanically better at bosses".
- Mechanics liked (26 Oct): territory capture (Go, Risk), tile placement (Carcassonne), connect the flow, hidden info
  (Minesweeper-like), a timing bar, a skill you build up, draft and deckbuilding ("has to be done very well"), auto
  battlers ("set up and see how good it does"), idle skilling, IdleOn-style placing of effects. Sim methods liked:
  CA, forest fire, L-systems, space colonization, physarum, boids, ant pheromone trails, layered grids with toggles.

**What playing taught** (the user's verdicts on earlier toys, without their systems):
- Most fun so far: being one creature on a small board with a food budget, moving for rewards and dodging a hunter:
  "I started new rounds without deciding"; rare mutations: "felt really compelled to go on". "Finding places for
  different species was pretty fun."
- Clear resource limits felt good, "a little bit like a drafting game". Visible threats "felt really cool".
- Placing parts by hand felt "clunky"; autogrowth was "not a good feeling game"; "I just auto every time" when a
  choice didn't bite. Lost and random when causes were hidden.
- Waiting for change didn't pull; "really felt sad i couldn't play to fill the other niches"; "really wanted to play
  as a predator". Fresh starts over and over felt repetitive; heavy authorship felt less fluid than emergent variants.

**The look.** "Between osrs and stardew valley"; code-drawn low-poly pixel creatures; Terra Nil's barren → lush; old-
school pixel menus; the side view; Carapace's character graphics and generation cards.

## 3. Constraints
- **The release goal** (6 Nov): "a clean freshly put together full version that i can release to get feedback and
  ideas", soon. Success sentence: "I played this run, I advanced my lineage, I can see it on the map, and I know what
  run I pick next."
- **Setting** (the user's call, confirmed 9 Nov; argue if needed): the Cambrian shallow sea around a young volcanic
  island for the first release; later eras and life ashore after it.
- **Budgets** (the user's; changeable only by their call): 8 h of offline catch-up computed in about 5 s (up to 10);
  tests under 10 s; at most 4 stocks, 6 stats and 10 genes per kingdom (adding one removes one); files under ~400
  lines; balance by feel and a simple curve model, no balance bot; no long headless sim runs.
- **Production:** one person, AI-built, about 3 h a day. Web: TypeScript, PixiJS, Svelte. 2D, 16–24 px code-drawn
  creatures. Each new system has cost 1–3 sessions. Fable is expensive: one pass, then Opus builds.

## 4. The biology (researcher, 10 Nov; sources in `docs/research/tree-for-the-game.md`)
**Animals split early into three branches** from a worm-like ancestor: Ecdysozoa (moulting animals: priapulid worms,
lobopods, arthropods), Spiralia (annelids, molluscs, brachiopods, likely Wiwaxia and hyoliths) and Deuterostomia
(chordates such as Pikaia, echinoderms). Arrow worms are protostomes of unresolved placement. Opabinia and the
radiodonts (Anomalocaris; Hurdia and Cambroraster were sifters, not hunters) are sister stem-arthropod lines.

**The whole tree as stepping stones.** About eight trunk gates: photosynthesis (~3 Ga), the eukaryote and its
mitochondria, plastids, multicellularity, hard parts (~539 Ma), eyes (~530 Ma), jaws (~440 Ma), life ashore (plants
~470 Ma, arthropods, tetrapods ~375 Ma). Branches: bacteria and archaea (mats, chemosynthesis, oxygen); algae and plants
(seaweeds, then cuticle, vessels, seeds, flowers); fungi (hyphae, mycorrhiza, lichens); animals (sponges and cnidarians;
Ecdysozoa: cuticle, moulting, jointed legs, compound eyes, wings; Spiralia: shells, radula; Deuterostomia: notochord,
backbone, jaws, limbs, eggs, feathers, milk). Partnerships made whole branches: mitochondria and plastids, lichens,
mycorrhiza, coral and its algae.

**Convergence is the norm:** multicellularity at least 25 times; eyespots 40–65 times; the crab body at least five
times; flight four times; going ashore many times. So a new form can be defined by a *function* (eyes, shell, legs,
flight) that several lineages can reach, as well as by authored ancestor → descendant steps.

**What players notice.** The branch a creature sits on must be right (fungi aren't plants; a priapulid doesn't become
an annelid). Grades as nodes ("worm", "lobopod"), a single start, a compressed timeline and inferred roles are safe if
labelled; debated placements can be shown as debated. Spore's lesson (Science, 2008): no common descent and
design-by-will read as intelligent design. A study of 22 evolution games: only 5 modelled variation, inheritance *and*
selection; the commonest fault is that the player saves unfit organisms, so fitness doesn't decide survival.

**True crabs** appear in the Early Jurassic and stay rare until the Cretaceous. **First onto land:** Cambrian tidal-flat
tracks (Protichnites) are tied to euthycarcinoids, arthropods related to millipedes; "first on land" is tentative.
