# The whole game: a fresh concept, then the build against it

10 Nov 2026. Written by Claude (Fable) in one session, for the ask in [fable-brief.md](fable-brief.md) §0.
**Part A** was written from `fable-brief.md` alone, before seeing the build, and was not edited afterwards.
**Part B** was written after `fable-brief-2.md`; its §8, §11 and §12 were revised the same day, after the user's
replies and a measurement of the code. Everything here is a *proposal* unless marked *idea*; nothing is
decided until the user says so.

# Part A. The fresh concept

## 1. The core fantasy
Life is an MMO called Outside, and you main a few lineages. A lineage is a class with a real body plan (worm, lobopod,
mollusc), and you spec it by living, not by shopping. A Life is one match: you are one small creature on a real patch
of sea floor, with an energy budget, food that needs the right parts, and something hunting you. The eggs you lay are
your score and your loot: the clutch throws mutants and you choose the heir. The species then lives in the garden,
the island's sea, where each habitat offers slots (grazer, burrower, hunter) with a tier letter, and the sim alone
decides whether your build holds its slot. The garden pushes back: a hunter moves in, a boom crashes, the meta shifts,
and the patch notes say why. Hold slots well and a lineage reaches a real turning point (a moult, a shell, eyes); a
new branch of the tree opens and you get another character to level in parallel.

**In one line: you play the variation, the world plays the selection.**

## 2. The activity
**Answer: a short board game you play as the creature, wrapped in an auto-battler you set up and watch. Knowledge is
the skill.** Not menus only: the user's own evidence is that being the creature pulled ("I started new rounds without
deciding") and waiting did not. Not reflex skill either: it is a phone idle game, and the TierZoo pleasure is knowing
*why* a build wins. So the skill is route planning under a budget in the Life and reading the meta in the garden.
Mechanical skill shows up only in boss patterns.

| Play | Share of active time | What you do |
|---|---|---|
| The Life | ~70% | be the creature on the habitat's board, 2–4 min |
| The clutch | ~10% | open the eggs, see the mutants, pick the heir |
| The garden | ~20% | read tiers and patch notes, choose the next slot and which lineage to send |

Idle: the garden runs. You come back to patch notes and banked clutches.

**The Life (the Forage board).**
- **Step time:** the world moves when you move. Portrait, tap to step, about 60–120 steps.
- **One number: energy.** Every step costs your body's upkeep; food refills it. That is the whole budget.
- **The board is the habitat.** Food tiles come from its stocks; rivals and hunters are the species holding its slots.
  When the garden changes, the board changes.
- **Three beats.** *Hatch:* small, a few safe steps. *Grow:* each growth step switches on one part of your build and
  opens the food it unlocks (shelled prey needs a crusher, buried food needs digging). *Breed:* turn surplus into
  eggs step by step while threats ramp up (the tide drops, the hunter wakes). Stop when you dare. Die before the
  first egg and the Life pays XP only.
- **Every Life has a purpose, picked on the map:** *Colonise* (seed an open slot), *Adapt* (hunt mutants for a species
  that is losing), *Challenge* (take a slot from a rival or the apex).
- **No auto-Life.** "I just auto every time" is the warning. The garden is the automation; a Life is always played for
  a reason and starts from your evolved build, never from zero.

**The catalogue.** One habitat board, several *verbs*. The verb follows the way of life, not the kingdom. Costs are
sessions on top of a working Forage board, and rough.

| Activity | How it plays | Fits | Sim method | Skill | Cost |
|---|---|---|---|---|---|
| **Forage** | move for food on an energy budget, dodge the hunter | mobile grazers, scavengers, deposit feeders | grid, tile stocks, simple chaser | routing, risk | base |
| **Hunt** | same board flipped: prey flees, you cut it off or ambush | predators, the apex | prey as small boid schools | cornering, burst timing | 2–3 |
| **Burrow** | the mud is fog; numbers hint at buried food and danger | infauna worms, digging hunters | layered grid, Minesweeper hints | deduction | 1–2 |
| **Boss** | an apex with patterns you learn over several Lives | era apex | scripted moves on the board | pattern learning | 1–2 |
| **Stack** | pick a spot, grow up into the current; taller eats more, storms topple | sponges, brachiopods, corals, crinoids | flow field + stacking | placement, push your luck | 2–3 |
| **Grow** | spend sugar each turn to branch toward light or root toward water | seaweeds, plants | L-system, space colonization | allocation, shape | 3–4 |
| **Spread** | seed a colony and set 2–3 rule toggles; take ground from a rival mat | bacteria, mats, moss, lichen | cellular automaton, forest fire | reading patterns | 2–3 |
| **Network** | link food sources with the cheapest web; cut links starve | fungi, slime moulds | physarum, connect-the-flow | efficient routing | 2–3 |
| **Swarm** | steer a school or lay trails; tight is safe, wide eats more | schooling fish, krill, ants | boids, pheromone trails | flock control | 3 |
| **Ride** | stay on a host and feed without being noticed | parasites, cleaners | stealth meter on the Forage board | timing | 2 |
| **Place** | drop a species in a slot, read the preview, watch the result | every lineage (the garden itself) | the garden model | reading the meta | core |

"Moss vs herb vs tree should all play different" is Spread vs fast Grow vs slow Grow: three rule sets, one engine.
Class mechanics (§5) add variety inside a verb for half a session each, which is far cheaper than a new verb.

**Lean for the first release: Forage and Hunt on one engine, plus Place and one Boss.** Forage is the proven fun.
Hunt answers "really wanted to play as a predator" and reuses everything. Stack is the first verb after release: it
opens the sessile half of the Cambrian (sponges, brachiopods) and is the cheapest test of "a different way of life".

## 3. The scales
| Scale | Lasts | You decide | Carries over | The pull |
|---|---|---|---|---|
| **A Life** | 2–4 min | where to go, what to risk, when to breed | eggs, the clutch, what you saw | the clutch reveal; "one more" |
| **A species** (a build in a slot) | hours to days | which mutant is the heir, where to seed it | genome, tier, population | the next letter; the habitat next door |
| **A lineage** (the class) | the whole game | what it specialises in, when to branch | level, parts unlocked, its species | the level bar; the next gate |
| **The ecosystem** (the board) | always moving | which slot, which lineage, how to answer a swing | all living things and the terrain they made | open slots, patch notes |
| **The tree** | across eras | which branch to chase | nodes found, real species found | silhouettes with hints |

- **Yours:** the names, the looks, the off-recipe builds, the shape of your garden. Two players' islands differ.
- **Four zoom layers, four scales** (*idea*): the board (a Life), the habitat side view (its food pyramid, who eats
  whom), the island map (the slots), the tree. One screen each.
- **Session shapes:** 3 minutes (one Life), 30 minutes (take a slot: 1–3 Lives and a clutch or two), a return visit
  (patch notes, banked clutches, pick the next target).

## 4. The systems, one job each
| System | Its one job | One record per | The rule that keeps it honest |
|---|---|---|---|
| **Tree node** | say what a body plan is and what it can become | clade or grade (authored) | reached by descent plus a gate, never bought |
| **Lineage** | be the character you level | node you play | never lost; branching opens a new slot, the old one goes on |
| **Species** | be a build that holds or loses a slot | genome living in a habitat | lives or dies by tier alone |
| **Variant** | be the surprise | egg that differs by one gene | mutation is random; the Life filters which you see |
| **Genes and parts** | be the build, and the drawing | gene (≤10: 7 shared, 3 per class) | every part costs upkeep; losing a part is a real pick |
| **Stats** | turn the body into rules | six questions (below) | the same six for every kingdom |
| **Tier** | say how fit this build is for this slot today | species × slot | one formula, a letter and three reasons |
| **Habitat and slot** | be the board | detected habitat; slot = a food plus a way to eat it | slots open and close with the food |
| **Link** | be an interaction | pair of species | derived from tags and stats; hidden until witnessed |
| **Codex** | hold what you found | link, node, real species, landmark | filled only by seeing it happen |

**The six stats are six questions** every living thing answers, whatever its kingdom: *Bite* (can it open its food?),
*Thrift* (what does the body cost?), *Defence* (what stops it being eaten?), *Speed* (how fast does it move or
spread?), *Senses* (how much does it notice?), *Brood* (many cheap young or few strong ones?). Defence has a type
(shell, spines, hiding, fleeing) and each type has a counter (crusher, size, senses, ambush). That is where
"strong vs / weak vs" comes from.

**What a tier measures: fitness, in this slot, in this meta.**
`fitness = food it can reach here ÷ upkeep × chance to live long enough to breed`.
Three terms, three sentences on every tier card: "Intake B: it grazes mats but can't dig. Upkeep S: no eyes, no legs.
Survival C: the priapulid swallows it whole." The user's worm line ("no upkeep in mud was a gamechanger") is the
upkeep term doing its job. **The Life is the same formula played by hand:** energy in, upkeep out, don't get eaten,
count the eggs. A C-tier build feels hungry on the board; an S-tier one feels rich. One rule set, two speeds. If the
board and the tier card ever disagree, that is a bug, not a balance question.

**Evolution has all three parts** (the fault the 22-game study found is leaving one out):
- **Variation.** Each egg may differ by one gene step, or rarely carry a new part. The clutch shows the three that
  survived, and how you lived decides which survive: a Life spent digging favours diggers, a bitten parent favours
  armour. This is honest biology (the Life selects among random mutants; behaviour leads, genes follow) and it gives
  the user's "higher chance of parts that relate to the current actions". Rare cards: a new part, a combo, a morph.
- **Inheritance.** You pick the heir, or keep the parent form. A very different mutant can be kept aside to found a
  new species somewhere else. Losing a part is offered as often as gaining one.
- **Selection.** The garden does it, by tier. **No rescue:** you cannot feed or protect a failing species. The only
  tools are a better build (Adapt), a better place (seed elsewhere) or a changed web (add its hunter's hunter, a
  partner, a different food). This is the rule that stops the game reading as design by will.

**Combos** (*idea*): a small authored table of "part + part = new part" (limb + flat = paddle; eyespot + lens = eye;
segments + hard skin = jointed armour). It is the user's "overarching rules" in the cheapest form, and a gate on
the tree is just a combo that founds a node.

**The garden: about ten habitats, three or four slots each, six named rules.**
1. *Eat:* a species draws down its food (a stock, or the population it hunts).
2. *Starve:* a population shrinks when food falls below upkeep.
3. *Hunt:* hunters take prey by Bite against Defence type.
4. *Spread:* a thriving species seeds neighbouring habitats where its predicted tier is C or better. You watch your
   worm creep across the map, and where it stalls is your next Life.
5. *Drift:* a held species slowly shifts one gene step toward what its patch demands. The sim tunes; only played
   Lives bring new parts. Idle time banks clutches to open on return.
6. *Engineer:* a population changes a stock or the terrain (burrowers break up mats, filterers clear the water,
   builders leave rock).

Stocks: three foods per habitat (mat, plankton, detritus) and banked eggs per species. Each food stock is itself a
slot some producer holds; at release the producers are wild builds. **Every species is also a food:** placing one
opens the slots that eat it, ride it or partner with it, so a habitat grows upward like a pyramid (barren to lush).
Rare things come from the system: a reef when filterers stack three high, a carcass bloom after a crash, an ash fall
from the volcano that kills a habitat and then feeds it. The idle sim never simulates individuals: forty populations,
a tick a minute, eight hours in milliseconds. Creatures drawn on the map are sampled from the populations.

**Interactions are links, all read from the same tags.**
| Interaction | In the garden | In a Life |
|---|---|---|
| Predator and prey | a hunter slot draws down the prey population | it chases you, or you chase it |
| Competition | same slot: shares by fitness, the weaker fades or moves out | a rival reaches your food first |
| Mutualism | a bond: each fills a part slot of the other | the partner is shelter or food on the board |
| Parasitism | a slot on a host: takes a share of its intake | you Ride the host |
| Engineering | a population changes stocks or terrain | the board looks different next time |

**A partner is a part that is alive.** Mitochondria, plastids, coral algae and lichens are all "one species equipped
by another", so one bond mechanic covers symbiosis now and the big trunk gates later (the eukaryote, the plant).
It also gives parallel lineages a reason to exist: they combine.

**Wild species are other players' builds.** Rivals, invaders and the apex are made by the same generator from the
same parts, seeded from the real fauna. Nothing is authored that you cannot one day play.

**Discovery** has five things to find, each by witnessing: tree nodes (silhouette plus a hint), slots (a "?" until
you have lived in the habitat), links (the food web fills in), real species (your build matches a recipe of real
defining traits: a card, real facts, a strong set bonus; off-recipe builds get a generated name and are your own
thing), and landmarks and events.

## 5. The whole tree with one framework
**Shared by every branch:** the record (lineage → species → genome → body → six stats), the tier formula, the slot
rule (a food plus a way to eat it), the links, the clutch, the habitat board. **Per branch:** a verb, one class
mechanic, three class genes and its drawings. A new branch costs content, not a new game.

| Branch | Verb | Class mechanic (one small rule) | When |
|---|---|---|---|
| Worms (the ancestor, priapulids, annelids) | Forage, Burrow | dig: hidden under mud but slow | release |
| Lobopods → arthropods | Forage | moult: grow in jumps, soft for a few steps after | release |
| Molluscs | Forage | shell: close up and wait it out; heavy | release |
| Chordates | Forage, Hunt | dash: a burst of speed that costs energy | release, late |
| Radiodonts | Hunt | grasp: hold prey that is smaller | release, as the apex |
| Sponges, brachiopods, corals | Stack | filter: intake rises with height and flow | first after release |
| Algae and plants | Grow, Spread | light and water budgets | the era ashore |
| Bacteria and mats | Spread | chemistry: what you excrete is someone's food | prologue or later |
| Fungi | Network | trade: sugar for minerals across links | the era ashore |
| Parasites, cleaners | Ride | attach to a host | any era, as a side branch |

**Two kinds of unlock, and this is where the biology must hold.** *Parts are functional and convergent:* any lineage
may evolve an eye, a shell, legs or a burrow, as in life (eyes 40+ times, the crab body five times). *Nodes are
historical:* you become an arthropod only from a lobopod; a tree position cannot be bought or skipped. Eras work the
same way for the whole game: an era is the same island later, with one new verb, one or two trunk gates, and an apex
whose rule defines the meta. Your species can take the apex slot, and then you choose the era rule.

| Must be right | Gameplay wins |
|---|---|
| which branch a creature sits on; who can descend from whom | the timeline (a Life is minutes, a species is a few runs) |
| the defining traits of a clade (its gate) | all numbers |
| the direction of every trade-off (armour, eyes and size cost energy) | grade nodes ("worm", "lobopod"), a single start |
| food-web logic: hunters are rarer than prey; no food, no slot | tidy slots (real niches are fuzzy) |
| real species: traits, era, role (inferred roles labelled) | which parts are on offer when; the steering by how you lived |
| extinct means extinct; fitness decides, not the player | tier letters and the patch-note voice |

## 6. What makes it feel good
- **Pull.** Every screen ends on a visible next target: a slot that says what it wants ("needs Defence vs crushers"),
  a clutch card that says "2 of 3 for Hallucigenia", a silhouette with a hint, a level bar almost full.
- **Pacing** (headline only): a Life in 2–4 min; a slot taken in 1–3 Lives; a first new lineage inside the first
  hour, then slower; the apex after several hours; a return visit readable in 30 seconds.
- **Surprise comes from the system, never from dice alone:** invaders from the real fauna, a rare mutant, a landmark
  that forms because the populations for it were there. Roughly one real surprise per session.
- **Readability.** One formula, three reasons, a preview before every commitment, and patch notes that name the
  largest cause. The test for every slice: can the player guess the letter before placing? If not, it is v1 again.
- **Swings.** Booms and crashes are real but local, and a habitat recovers within one idle stretch. Species die out
  in a habitat; a lineage is never lost (*never locked out*). The volcano is the reset that makes barren ground new.
- **Numbers that climb:** lineage level, slots held, pyramid height, codex per cent.
- **The voice:** "Patch 14: priapulids reached the mud flat. Soft burrowers lost their free lunch: Mud worm A → C."

**What I would not build:** a free part editor (the user found placing parts clunky), auto-growth, individuals in the
idle sim, different rules per kingdom, anything that lets the player prop up an unfit species.

**Where this concept can fail.** (1) The board and the garden drift into two games: prevent with the one formula.
(2) The garden becomes the product again: cap it at slots times six rules. (3) Lives feel like repeated fresh starts:
each needs a purpose, a changed board and a short hatch. (4) Idle drift makes play pointless: the sim only tunes.
(5) Content per lineage (mechanic, parts, drawings, one or two real species) is about two sessions each, so the
release should ship five or six lineages, not twelve.

# Part B. The build against it

## 7. Diagnosis
**The headline: the skeleton is right, and Part A agrees with it.** Written blind, Part A landed on the spine the
build already has: a Life on the habitat's board with upkeep and a hunter, eggs as the score, a clutch of gene cards,
a line that levels, a tree of silhouettes, a sea of populations with swings. That is independent support for the calls
of 4–9 Nov. The gap is not the foundation. It is four seams where the Life and the sea fail to meet.

| # | Seam | The vision and Part A | The build | The user |
|---|---|---|---|---|
| 1 | **The slot** | a habitat offers slots with a tier list; you fill or take them | no slots; 12 global body × role cells; only your own species | "slots/niches that need to be filled. which build is s tier in this habitat?" |
| 2 | **The tier** | fitness of this build in this slot today; it moves with the meta | eggs in one Life; fit frozen at release | "should mostly refer to how good it currently fits the meta and that patch" |
| 3 | **The character** | lineage = the character; species = one record, a build living in a slot | four layers: lineage, line XP, saved plan, sea species | "confusing whats mine and whats the benefit is" |
| 4 | **The purpose of a Life** | colonise, adapt or challenge, starting from your build | always "lay the most eggs", rebuilt from a larva | "the fresh start over and over" |

**Why the pull dropped** (my reading; the first three are one cause seen from three sides):
1. **The world asks nothing new.** With no slots, rivals or moving meta, every Life poses the same question. The Life
   toy pulled as a fresh puzzle with rare drops. Many Lives later the puzzle is solved, and the outer loop has not
   replaced it with new ones.
2. **A run score is not a status.** "S, 40 eggs" is gone when the Life ends. "Holds A in the mud flat" persists, shows
   on the map and can be threatened. Only the second brings a player back.
3. **Nothing can be taken or lost.** The sea holds only your species, so placing has no opponent and idle time has no
   stakes ("didn't have a big pull to wait").
4. **The body is rebuilt every Life.** Buds halve the price and keep the chore. The user's own doubt ("maybe make the
   body then just grow") is right.
5. **Species are cheap.** In the hatching screenshot one card on a tier-F Life with 3 eggs makes "Worm 1 (bristles)".
   A name given for nothing means nothing: hence "whats exactly a species when... or why".
6. **A guess, cheap to test:** playtests start from fresh saves, so the user has played the first twenty minutes many
   times and the tenth hour never. A levelling game can't be judged that way. A dev preset ("line level 5, three
   patches settled") separates "the game is repetitive" from "I keep replaying the opening".

**Smaller things that fight the vision.**
- **The map shows the wrong subject.** In the screenshot the island's rock fills the picture and the sea, where the
  game happens, is a thin ring with tiny numbers. "Play next" reads "Patch 9 · Sand shallows · Neighbour": nothing
  says what a patch offers or wants, so nothing argues for one over another.
- **Parts are a shop by another name.** Levels add parts to a line's pool, and the user feels it ("having only
  unlocked parts in your lineage makes it hard to change"). Part A's split answers it: functional parts are shared
  and convergent; a few class traits gate the tree.
- **Recipes are shown, arbitrary and unreal.** The tree prints the checklist, so nothing is discovered, and
  "sclerites + proboscis" is not what makes an arthropod.
- **The ladder crosses the tree** (brief §9): everything descends from a priapulid. And **moulting is the Life's
  growth button, but only Ecdysozoa moult.** Fine for today's four lines; wrong for the bristle worm, Wiwaxia, the
  hyolith and Pikaia. Growth should be general, and moulting the ecdysozoan way of doing it.
- **"A lot of effects I never use":** 27 parts and 6 verbs exist before the sea asks for most of them.
- **Slice 23 is five systems in one step** (algae stocks, a diet rule, genes and variants, wild branches, sea
  features, six lineages). Each is right. None is the slot or the tier, so content grows while the centre stays
  missing. By my count its three algae stocks plus rot and oxygen make five stocks against a budget of four.

**Where the build beats Part A** (Part A gives way): 20 heavy turns with a move rule per body are proven and have more
character than my 60–120 light steps. Patches with real populations are a finer sim than my ten habitats. Ranks on
parts (Lean, Enhanced, Signature) are a better spec system than anything I proposed. An empty sea that you found is a
stronger opening than my pre-filled one, provided something else then arrives.

**On Opus's reading:** I agree with 1, 2, 5, 6 and 8; they are seams 1–3. On 3: the authored ladder is not the
problem (the user: "authered is easierst"); the pool-by-level and the arbitrary recipes are. On 4: add the fresh-save
cause. On 9: agreed, and the cure is one play question per step.

**Decided calls I would reopen** (all *proposal*):
| Call | Change |
|---|---|
| A Life starts as a larva with buds (9 Nov) | Keep the plan, drop the buds: planned parts switch on with size, free |
| Recipes are made of body parts (6 Nov) | Still authored, but the gate is the clade's real defining trait, found as a rare card |
| Saves are no priority before release | Add dev presets now, so playtests reach the midgame |
| An empty sea at the start (7 Nov) | Keep, plus one rule: an open slot with food does not stay open (a wild branch of your own lines buds into it) |
| Every line begins with the worm (Ottoia) | An unnamed worm-like root; Ottoia is the end of one branch |

## 8. Three routes
My first draft of this section leaned "evolve in place, firmly". The user then asked for my own call on a rewrite
("I've often gotten good results from a rewrite, with the information and specification that I've developed and
tested"), so I measured the code (sizes and word counts, not a read), and the lean changed.

**Measured, 10 Nov.** 7,200 lines: sim 2,630, view 1,750, ui 1,660, data 640; no file over 380 lines. "plan" appears
in 37 files, "eggs" in 29, "species" in 28, "tier" in 17, spread over sim, data and ui. In view they hardly appear
(tier 0, plan 2, species 2). So the seams of §7 run through about half the files, all on the rules and screens side,
and the drawing is clean of them.

| | (a) Patch in place | (b) From zero, per Part A | **(c) New core, ported organs** |
|---|---|---|---|
| What | change tier, species, slots and growth inside today's files | rewrite everything, the Life included | write §10's records, the sea and the screens fresh in a new folder; carry over the drawing, the island and the Life engine with its numbers and tests |
| Carries over | all of it, old shapes included | the docs | about 40%: view, the island generator, the Life's moves, strikes, verbs and tuning |
| Cost to the first full play test | 8–11 sessions | 12 or more, and the Life's feel has to be found again | about 8 |
| Risk | half-migrated concepts (plans beside species, eggs under tiers): the user's "convoluted", "half-baked" | loses the proven core; a third restart | scope creep during the rebuild |

**Lean: (c).**
1. The central records change (what a species is, what a tier is). Patching central records through 37 files is
   exactly where AI iteration tangles.
2. The code is small and the spec has now been tested by play. That is the case in which the user's rewrites went well.
3. Every screen was due a rewrite in the UI pass anyway, and no player's save constrains anything yet.
4. The feel lives in the Life engine and the drawing, and (c) carries those over untouched.

Not (b): wherever the build was proven by play, Part A gave way (§7). The session counts are rough guesses.

**Guards.** *Side by side:* today's `game/` stays playable until the new one passes the play test after N4, then it
is archived. *Scope lock:* the rebuild goes to N4 and adds nothing that is not in this document. *Parity:* after N2,
play the old and the new Life back to back. If the new one is not at least as good within two sessions, fall back
to (a).

## 9. Keep, change, cut
| Today | Verdict | What |
|---|---|---|
| The Life: moves per body, food nodes, marked strikes, upkeep, lay | **Keep** | the proven core; don't touch its feel |
| Tier = eggs in one Life | **Change** | tier = fitness of the build in the slot, recomputed each generation, with three reasons; eggs become the founding size, the XP and a personal best |
| Fit frozen at release | **Cut** | follows from the above |
| "New ground: 50% strength" | **Cut** | the placement preview shows the predicted tier in the target slot instead |
| 12 slots (4 bodies × 3 roles), yours only | **Change** | slots per habitat: one per food and way of eating it, each a ranked list of your species and wild branches of your lines |
| Saved plan vs sea species | **Merge** | one record: a species is a build that has established a population. The name is earned by holding a slot for about ten generations; until then it is a clutch |
| Play next: last patch and neighbours | **Change** | launch from any habitat where a species of yours lives, into it or a neighbour; each target shows its slot, what it wants and the predicted tier |
| Moult to add a part each time; larva buds | **Change** | the body just grows: planned parts switch on with size. Moult stays as the ecdysozoan risk window. Surplus food then has three uses: Grow, Enforce (push one part a rank for this Life) or Lay (§12.3). At most one mutation offer per Life, and it is an event |
| Every Life is "lay the most eggs" | **Change** | each Life has a purpose from the map (colonise, adapt, challenge), named at the start and judged at the end |
| Hatching gene cards | **Keep, re-source** | cards weighted by what the Life did and what the patch demands; drawn from a shared pool plus class traits; "lose a part" appears as often as "gain one" |
| Line XP, levels, points, ranks, named end point | **Keep** | this is the character. Add XP from slots held while away, and one job per line in the sea (burrowers stir oxygen, grazers thin mats, hunters cap booms) shown on its card |
| Part pool unlocked by line level | **Change** | levels raise ranks and caps; parts arrive through the clutch |
| 27 parts, 6 verbs | **Prune** | the test for each part: does it open a food, counter a threat or cut a cost that some slot asks for? If not, it waits |
| Recipes: two parts + tier B, text shown | **Change** | gate = real trait (rare card) + a slot held at B; the tree shows a hint and "1 of 2 found", not the checklist |
| Tree screen, line close-up | **Keep, re-root** | unnamed root, three branches, sisters drawn as sisters, debated nodes marked |
| Sea model: stocks, four rules, overshoot, border crossing, shocks | **Keep** | add slot shares (the fitter species takes more of the food), wild branches and the cause in every news line |
| Map: ring of numbered patches | **Change** | the sea fills the picture; depth as a second axis (tide line, shallows, slope); named habitats with slot markers |
| News, watch it spread | **Keep, grow** | becomes patch notes in tier talk |
| Slice 23 as one step | **Re-cut** | nothing is thrown away: see N4, R5, R7, R8 |

## 10. System setup
| Record | One per | Stores | Derived, never stored |
|---|---|---|---|
| **Clade** | tree node (authored) | parent, gate trait, class mechanic, class traits, verb, end-point recipe, debated flag | |
| **Part** | tool (authored) | place, the food it opens, the threat it counters, upkeep, verb, pool (shared or a clade) | |
| **Build** | genome | clade, a part per place, gene settings (Size, Gut, later more) | the six stats |
| **Species** | established build | lineage, build, name, parent species, owner (you or wild) | its role, from diet |
| **Population** | species × patch | a count | its fitness |
| **Habitat** | group of like patches | patches, stocks | its slots, each a ranked list |
| **Lineage** | character (yours) | clade, XP, level, ranks, species | slots held |
| **Codex** | save | witnessed links, nodes, real species, features | |

Parts are what the creature has, genes are what the sea tunes, stats are what the tier card reads. That is the
answer to "stats vs parts": stats are never bought or shown as a build screen, only as reasons.

1. **One fitness function.** `fitness(build, slot, habitat) → intake, upkeep, survival, letter, reasons`, pure. The
   sea step, the placement preview, the tier card and the richness of the Life's board all call it.
2. **The sea never knows how eggs were made.** Every verb (Forage now; Stack, Grow later) is a module with one
   contract: a board and a build in, eggs and witnessed events out.
3. **Producers are species too**, owned by the wild; a stock is their population. When algae and plants become
   playable, nothing in the model changes.
4. **Wild and yours are the same record** with a different owner, made by the same generator. A wild species always has a parent species:
   every animal in the sea descends from your first worm.
5. **Nothing derived is saved.** Role, slot, tier and links are recomputed, so a rule change needs no migration.
6. **A new branch is rows** (a clade, parts, a move rule, drawings), plus a verb module only when its way of life is
   new.

## 11. The roadmap
Replaces roadmap step 7 onward (*proposal*; the user owns `ROADMAP.md`). N steps build the new core (route c); R steps
are content on top. Each step has one play question.

| Step | What | Sessions | The play question |
|---|---|---|---|
| **N1** | The core and the sea: §10's records (the re-rooted tree is just data here), the fitness function, slots, the sea step with slot shares, model tests, dev presets. A bare map with tier cards and a placement preview | 2 | Can I guess the letter before I place? |
| **N2** | The Life, ported: engine, moves, strikes, verbs and numbers carried over. The body just grows; Enforce; a purpose per Life; eggs found a population | 2 | Is it as good as the old Life, and does the tenth Life differ from the first? |
| **N3** | The screens: home map (slots, "yours", targets with reasons), hatching with re-sourced cards, the line view (XP, ranks, its job), the tree | 2 | Do I know what I own and what I pick next? |
| **N4** | Who eats whom (slice 23's diet rule); wild branches bud into open slots; challenge and adopt; patch notes with a cause | 2 | Do I want to take that slot from that animal? |
| | **Play N1–N4 as a whole.** If the pull is back, the rest is content. If not, stop and rethink before adding any | | |
| **R5** | Genes the sea selects (Size, Gut); variants named; clutches banked while away | 1–2 | Do I come back to see what changed? |
| **R6** | Gates from real traits as rare cards; the first pick at the root chooses the branch | 1 | Does a new line feel discovered, not bought? |
| **R7** | The map with depth; sea features from sim events (reef, carcass fall, vent) | 2 | Is my next target obvious on the map? |
| **R8** | Lineages 4 → 6–8, one class mechanic each, across all three branches | 2–3 | Do they play differently? |
| **R9** | The shore: the "to be continued" Life on the tide line | 1 | |
| **R10** | UI and art pass (smaller: the screens are new) | 2 | |
| **R11** | Release: saving mid-Life, balance, clean repo, itch, Discord | 2 | |

About 19–21 sessions. N1–N4 alone deliver the success sentence ("I advanced my lineage, I can see it on the map, I
know what run I pick next"), so a smaller release of N1–N4 + R6 + R10 + R11 (about 13) is possible if "soon" matters
more than breadth. Add plankton as the fourth food only when a filterer or swimmer needs it.

| After release | Adds | Why then |
|---|---|---|
| **M3 The apex and partners** | a Boss; the apex slot and its era rule (decided 4 Nov); bonds (a partner as a living part); Ride | closes the interaction list: predator, competitor, symbiont, parasite |
| **M4 The sessile sea** | Stack: sponges, brachiopods; reefs that become terrain | the first new verb; the real test of "one framework" |
| **M5 The green shore** | Grow and Spread: playable algae and plants; arthropods ashore; fungi (Network) | the next era; producers stop being wild |
| **M6 The deep past** (*idea*) | Spread: mats, the eukaryote made by a bond | a prologue, only if M4–M5 held |

## 12. The three questions, the user's replies and my calls (10 Nov)
The user asked for my call on each and then accepted all three (*decided 10 Nov*): route (c) in a fresh folder;
only opened lineages; the body just grows, with Enforce. The second round (where to start the tree, the sea's
structure, the look, itch) is answered in [whole-game-build.md](whole-game-build.md), the brief for the build
sessions. Its §8 replaces §11's step list where they differ.

**1. Route.** *The user:* "does it make more sense to start fresh? I've often gotten good results from a rewrite".
**My call: (c), a new core with ported organs** (§8), made after measuring the code.

**2. Who else lives in the sea.** *The user:* "i really like the idea of discovering the tree of life yourself, maybe
only opened lineages makes sense."
**My call: only opened lineages, and stricter: everything alive in your sea descends from your first worm.** I leaned
"any release lineage" when I asked; this is better. (Second round: "everything" means every animal. Mats, algae and
sponges are older life that was already there; see the build brief §2.)
- **Why.** If an Anomalocaris simply arrives, the tree existed without you and you only catch up with it. If the sea
  fills with offshoots of what you opened, the tree is yours, common descent is literally true (the piece Spore
  lacked), and it is what really happened: one stock radiating into empty niches.
- **Wild branches.** When a slot with food stays open for a while, the nearest fitting species (yours or wild) buds a
  wild branch, one or two steps toward what the slot demands, with a generated look and name.
- **They are beatable.** Wild branches use shared parts and genes only: no class traits, no ranks, no gates. They
  hold slots at C or B; a specced build takes them.
- **Two answers to a wild branch:** displace it (Challenge), or adopt it (play a Life as it and match its tier, and
  it is yours). Adopting is v1's "hunting for new variants".
- **The meta develops because you do.** Each lineage you open is an expansion that patches the meta for all the
  others: the swimmers you unlock will hunt your worms. Unlocking pushes back.
- **The class pick survives.** The root's first pick (cuticle, bristles or notochord) is the RPG class choice; the
  other two branches open later as parallel characters.
- **The price:** the early meta is thin (worm against worm), so the first unlocks must come fast.
- *Ideas:* late in the game the sea may cross a side-twig gate by itself (a wild Hallucigenia to find and adopt).
  The hunter of the first Lives is an unnamed shadow from deep water until your own lines produce hunters.

**3. Growth in a Life.** *The user:* "body just grows makes most sense... but the minigame was fun when deciding which
things to pick in which situation. maybe these kind of decisions or adaptation could come from something else."
**My call: the body just grows, and the decision moves from "which part do I add" to "where does my surplus go".**
- **Grow** (the moult): bigger; planned parts switch on with size, free, in the species' own order.
- **Enforce:** spend food to push one part you already have to its next rank, for this Life only. It reuses the rank
  effects that exist, and it is real biology (inducible defences: water fleas grow helmets when they smell a
  predator).
- **Lay:** eggs now.
- That is the real life-history trade-off: growth, defence, offspring. The situational choice stays (the hunter is
  near: enforce the armour; rich buried food: enforce the digger), but nothing is rebuilt and nothing is bought.
- **It steers evolution.** What you enforced marks the clutch: its cards come up more often. That is the user's
  "higher chance of parts that relate to the current actions" (the real name is genetic assimilation, compressed).
- *Idea:* **Shed**, the mirror: switch a part off for this Life to save upkeep; it marks "lose this part" in the
  clutch. The mud worm losing its eyes, as a button.
- At most one mutation event per Life.
- **The fail test:** if the same part gets enforced on every board ("I just auto every time"), the boards are not
  asking different things. Fix the boards, not the button.
- Not "choose which planned part switches on next": that keeps the rebuilding chore under a new name.

**Next:** follow [whole-game-build.md](whole-game-build.md) §0.
