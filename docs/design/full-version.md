# The full version: one game, ready to release (6 Nov)

*Written after a questions-one-by-one session. **Decided (6 Nov):** the order, the loop in section 1, keep the systems arriving one at a
time, 6–10 lineages (about 15 if the toy makes it easy), one tree screen plus a close-up, hatching at the end of a Life, recipes made of
body parts, the shore cliffhanger. **Proposal:** everything marked so. Your exact words: [decisions.md](../decisions.md). The steps:
[ROADMAP](../../ROADMAP.md). Where this and `planning/plan.md` differ, this wins.*

## 1. The game
You play one Life at a time, and each one moves your line on. Everything leads from a Life to the map and back.

1. **The map (home).** The living sea, with hooks from the sim: a crash, an open niche, a population booming.
   **Updated 7 Nov:** a new sea has no animals; the first worm Life founds it. Thereafter the last successful clutch
   permits a Life in its patch or an adjacent patch and remains available for retries. A new successful Life replaces
   that clutch. Pick a body and build at an eligible patch; the trees are one tap away when introduced.
2. **The Life.** You hatch small, eat and moult. Each moult offers parts your line has unlocked, sometimes a rare one, and the creature on
   the board changes.
3. **Hatching.** The eggs open at the end. Found genes belong here, with reproduction, not on the board.
4. **The family tree.** XP arrives and your new form appears. If it meets a recipe and you played well, it becomes a new animal.
5. **Watch it spread.** Back on the map, a few fast seconds with causes shown. Then the next hook.

**The arc.** The whole release is the sea. When one line reaches the shore, you play one special Life on the tide line, "to be continued",
and the sea keeps running. A run is one Life.

**Step 4 bridge (7 Nov):** existing body choices are temporarily open after founding, without new rank gates.
Diet stays recorded; inherited parts and verbs determine feeding behaviour. Species codes share starting creature
designs that still follow founding and continuation rules, rather than introducing populations.
This does not settle permanent progression. Food and environmental conditions exist before animals; populations
come from releases and their descendants. The scope, migration requirements and remaining compatibility decisions
are in [slice 19: Join the sea](../slices/19-join-the-sea.md).

## 2. Who does what
| System | Its one job | Where |
|---|---|---|
| Lineage XP and close-up tree | What your line can be offered: parts, verbs, mechanics, stats. This is where you plan a build | Tree screen |
| Moult | What this body grows, this Life | The board |
| Hatching and found genes | The rare surprise, and which form goes on | End of a Life |
| Recipe | When a body becomes a new animal | Family tree |
| Tree of life | Which animals exist, which you have, the silhouettes ahead | Tree screen |

**Trees** *(decided: one screen, one close-up)*: the tree screen is the tree of life, with your named forms small under each lineage, so it
doesn't crowd. Tap a lineage for its close-up: forms and skills side by side. *Open for that slice:* whether you can respec, and whether
XP belongs to a lineage or your whole line.

**One at a time** *(decided; the schedule is a proposal, to tune by feel)*: the first Life shows only moults and laying. Then hatching, then the family
tree, then XP and the first close-up node, then recipe hints and the full tree. Rare genes turn up on their own along the way.

## 3. Rigs: the ways to do it, and how many
Today each animal is a class of about 80–195 lines (`Worm`, `Arthropod`, `Swimmer`, `Wiwaxia`) behind one interface (`Creature`). That can't
reach 15 animals with parts on each. The ways out:

| Way | How | Good | Bad |
|---|---|---|---|
| A. A class per animal (today) | Hand-written | Best fit per animal | Parts × animals; doesn't scale |
| B. A few separate rigs | Worm rig, leg rig, swim rig, each with data | Clear, safe | Each rig repeats parts, sizes and map forms |
| **C. One spine, many gaits (lean)** | Every body is a chain of segments. Data sets the length, stiffness, width along the body, head and shell shape. A gait is one small function: ripple, legs, flaps, creep | More rigs become cheap, so you can have many; parts and sizes work once for all | Must be proven as good as the hand-written ones |
| D. Bones and hand-made animation | Skeleton tools such as Spine | Very polished | Needs an art pipeline; every part needs fitting by hand |
| E. Physics on top | Rope physics for bodies, feet that plant and step (like Rain World's creatures) | Looks very alive | Fiddly; an extra for C, not a base |
| F. Soft skin (metaballs, distance fields) | One smooth skin over the spine | Organic look | Leaves the low-poly look; costly per creature |

**Lean: C now, with E's planted feet as polish if they're cheap.** It answers "maybe even more rigs": a new gait becomes a small function, not a
new class, so we can have many. The worm, the plated trilobite and the swimmer stop being different programs: a worm is a loose spine, a trilobite a stiff one.
The body toy tests whether this holds up against today's drawings.

**Body kinds the spine can't do**, which need their own small rig later:

| Kind | Animals | When |
|---|---|---|
| Loose spine | Priapulid, bristle worm, lobopod | Release |
| Stiff spine with legs | Arthropod, trilobite, shore crawler, sea scorpion, millipede | Release |
| Spine with flaps or fins | Opabinia, Anomalocaris, then Pikaia, fish | Release |
| Short spine on a foot | Wiwaxia, then snails | Release |
| Anchored, on a stalk or a mound | Brachiopod, sponge, crinoid | After, with the stacking minigame |
| Shell with a jet | Nautiloid | After |
| Four limbs on land | First tetrapods | Far later |

## 4. A new lineage from body parts
**Decided (your idea):** a recipe is made of body parts, and some of them go into the base of the new lineage. "Running an arthropod with
claws and 10 legs, it would be a crab, and become a base crab."

**Decided (6 Nov):** a new lineage is "more of a fresh start". It can look different, but "optimally it should overlap", so your build already looks
like it, and becoming it is "a more direct or \"branded\" result that feels like an upgrade". Recipes name their parts: authored "is easiest mainly".

**Open: how parts go into the base.** Your worry: "be careful that it doesn't stack to much or can't be changed again", "maybe it could also be a default start with that body part or just some are integrated? not sure".
- **A. Integrated:** drawn in, with no slot and no upkeep. A clear upgrade, but it stacks up the ladder and can't be changed.
- **B. Default start:** the new lineage starts each Life with the part, and you can swap it. It can't stack, and `newLife` already takes starter parts, so it's cheap. It feels less like a new animal.
- **C. One integrated, the rest default start (lean):** each recipe integrates one signature part, such as the claw, which shapes the base; the others are default starts. The toy has a switch so you can feel the difference.

*Proposal for the rest:*
- **Each lineage is one data record:** base spine, slots, move rule, recipe, its integrated and default parts, and an optional `mechanic`.
- **Played well** means a rank in that niche. A hint shows as you get close: "2 of 3 parts of something new."
- **Your form gets a name** from its base and parts, such as "Rockplate".

## 5. The ladder
Every animal is a lineage you can play, with no creatures made only for the background. Today's prey and rivals (`data/prey.ts`, the boards' rivals) become lineages.

```
Worm (the start)
├─ Bristle worm ── Wiwaxia ── (later: hyolith, snail, nautiloid)
└─ Lobopod ─┬─ Arthropod ─┬─ Trilobite
            │             ├─ Shore crawler → the cliffhanger
            │             └─ (stretch: Marrella, Waptia, Leanchoilia)
            └─ Opabinia ── Anomalocaris ── (stretch: Hurdia, sifter)
```

| Lineage | Its job | Moves | Food-chain layer | Recipe, roughly | Status |
|---|---|---|---|---|---|
| Worm | Burrower, the start | Tunnels mud | Low | Start | In the game |
| Bristle worm | Grazes on mud | Crawl, bristles | Low | Worm + bristles + tentacles | Rival today |
| Wiwaxia | Armoured grazer | Creep, hunker | Low | Bristle worm + scales + spines | Prey today |
| Lobopod (Hallucigenia, Aysheaia) | First walker; the bridge | Walk on stubby legs | Low | Worm + legs + spines | New |
| Arthropod (Sidneyia-like) | Crusher, generalist | Runs lines | Middle | Lobopod + hard plates + claw | In the game |
| Trilobite | Tank; ploughs, rolls up | Plough | Middle | Arthropod + plates + enrolment | In the game |
| Opabinia | First hunter; five eyes, a snout | Swim, snatch | Middle | Lobopod + flaps + proboscis | New |
| Anomalocaris | Apex; lurk, pounce, frenzy | Swim any way | Top | Opabinia + arms + compound eyes | In the game |
| Shore crawler (euthycarcinoid) | Goes onto the tide line | Many legs, slow | Middle | Arthropod + many legs + blue blood | New, the arc |

**Named species as end points** *(your wish, 6 Nov)*: a lineage can arrive at a named real species, so "you have something to arrive at". It's "pretty strong", and you can still "spec into a slightly different sidebuild that could be more
optimal under some circumstances". For more recent animals, "it would be cool to discover an own thing" (AI's reading of "maybe not as more recent animals"; correct me if that's wrong). *Proposal for end points, all from R2's table:* Ottoia (worm), Burgessochaeta (bristle worm), Wiwaxia,
Hallucigenia (lobopod), Sidneyia (arthropod), Olenoides (trilobite), Opabinia, Anomalocaris. The shore crawler stays nameless, as your own thing. *Open:* does the group's base (Trilobite) stay a separate step before its named end (Olenoides)? That would double the count, so I'd keep one record per lineage at first, with the end point as a late upgrade of it.

**Six exist already, nine make the ladder and the arc work.** Stretch to about 15 if the toy makes lineages cheap: Marrella (small, fast prey), Waptia (swimming
brooder), Leanchoilia (long-armed hunter), Hurdia (a swimmer that sifts), hyolith (Ottoia's real prey), Pikaia.

**Cut order if the release slips:** stretch animals, then Opabinia (Anomalocaris comes directly from the lobopod), then Bristle worm. Keep the worm, arthropod, trilobite,
Anomalocaris, Wiwaxia and the shore crawler, so playstyles and the arc stay.

**On the biology.** The table above uses `research/cambrian-world.md`, with its corrections; recipes are game logic, not history. Three things are my background knowledge, to check with the
`researcher` before they reach a tooltip: lobopods as near the root of arthropods; Cambrian tidal-flat trackways credited to euthycarcinoids, which would make the
cliffhanger real history; and crabs appearing only around the Jurassic. **Decided (6 Nov):** "crab similar thing would be cute, cambrian crusher later crabs would be cool": a crab-like Cambrian crusher now, real crabs in a later era.

## 6. What it needs long term
Build these simply now, in a way that can grow. *Proposal.*

| Need | Now | Later it allows |
|---|---|---|
| Lineages as data | Records instead of `plan === 'worm'` (about 30 such lines in `sim/life.ts` and `main.ts`) | Adding animals without touching rules |
| Parts free of plans | Parts name a slot kind, not a fixed list of plans | Crossovers, new body kinds |
| A `mechanic` key on a lineage | Empty for all of them; the Life checks one place | Your stacking minigame, jets, plants growing |
| Sea species = lineages | The sea's list comes from the lineage records | New animals appear on the map by themselves |
| Saves keyed by lineage id, with a version | One format from the join on | Updates without wiping players |
| Stocks as a list | Algae kinds are entries, not code | Land layers, soil, new eras |

**Later, in order of how much you've asked for them:** minigames and new kinds of Life; filter feeders and sponges; playable algae and plants; life ashore and the island; the apex and eras; generated habitats.

**Don't build ahead:** the `mechanic` key stays one empty field until a second kind of Life exists. No plugin system.

**Not thought through yet** (you asked; found on a second pass against the code, 6 Nov). These are the real gaps in the table above:
1. **Recipes don't fit today's bodies.** An arthropod has 4 side slots, so 2 leg pairs at most, and a Life has at most 4 moults. "Claws and 10 legs" can't be reached. Either slots grow with size, or recipes ask for less, or a form starts Lives with kept parts. This needs a call by step 5, and the third way fits your "default start".
2. **The toy only prices drawing.** New lineages may still need new rules: a walking lobopod, Opabinia's snatch, the shore. Rules, not art, may be what limits us to 6–10 or 15.
3. **Every animal has two sides.** A lineage needs rules for you and behaviour when it's prey, a rival or a hunter. Today those are separate code (`PLANS`, `data/prey.ts`, `sim/threat.ts`). Both must come from one record, or each animal costs double.
4. **Parts free of plans have a price.** "Worm + legs" needs a leg to mean something on a worm. Today 27 parts are tied to plans, and verbs per plan (`VERB_PART`). Some parts will need a rule per body kind, or a list of allowed bases.
5. **Whose trilobites are they?** *Answered and clarified (7 Nov):* the same species. "empty map your first play gives the first animal" supersedes the earlier suggestion of basic starting natives. See [decisions.md](../decisions.md).

## 7. The sea with more in it
*Decided:* algae are a living food layer first, playable later; "maybe multilayered animal food chain first too". *Proposal:* about 3–5 kinds that grow, spread and crash, painted on the
map and boards, with grazers specialising; and the three animal layers in the table above. The sea toy's generation costs 0.3–0.6 ms against a budget of about 30 ms,
so there is room. **Budget note:** this passes CLAUDE.md's 4 stocks; your pick of the algae layer counts as your call, and the roadmap's budget line now says so.
**Known toy weakness to fix then:** Anomalocaris does nearly all the hunting. More hunters on the ladder should help.

## 8. Staying on the road
- **Every slice names a step of the milestone.** Anything else, however good, gets one line in `ideas.md`.
- **New systems wait for release:** a system outside section 2 needs your call.
- **The release question stays the same:** "I played this run, I advanced my lineage, I can see it on the map, and I know what run I pick next."
- **If it slips,** cut lineages first (section 5), then algae kinds, then close-up tree depth. Don't cut the link from Life to map or the look of the creatures.

**Risks.**
- **The body toy could fail.** If one spine looks worse than today's hand-written animals, we fall back to way B, and the lineage count stays near 6–10.
- **Five body-changing systems can confuse.** That is why they arrive one at a time.
- **A long after-Life sequence** (hatching, tree, spread) can drag. Each part must be skippable, and short.
- **Recipes could become a checklist** that makes everyone build the same animal. Hints stay vague and the parts you add beyond the recipe stay yours.
