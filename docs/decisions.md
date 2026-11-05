# Decisions log

Your calls, dated, in your words where possible. Only explicit calls; AI proposals never go here. v1's log
(25 Oct – 2 Nov) is in `_v1/docs/decisions.md`; its lasting tastes are in [tastes.md](tastes.md).

## 2 Nov, the rebuild direction (after the v1 review)
- **"I'm unsatisfied with the current trajectory":** the project is blowing up, sessions are long from sim runs and
  tests, the vision drifts, several parts are half-baked. Review and plan: [design/rebuild.md](design/rebuild.md).
- **The plan: "I love your reply in general and the new plan."** Breed a line in a run, release it into an idle
  garden, a tier list of builds. Stays idle/incremental.
- **Tier list: niches × tiers, "maybe some light ladder or ladder feeling".**
- **Sim: "I definitely want to check out the patch model"**; keep getting the habitats in detail.
- **Genetics: "love the genetics split with the body determining stats"** (genome → body → stats → niche).
- **Run: "side view grow run is cool for a start".**
- **Rebuild: "sounds fine".**

## 2 Nov, after the research and the sim check
- **Toy first**, then the spec.
- **Commit v1 and move it to `_v1/`** (done: commit `ecaff4f` on `slice-11e`, branch `v2`).
- **The spec replaces the vision; AI drafts a new roadmap.** "Some of my ideas and tastes and vision should still be
  saved somewhere" → [tastes.md](tastes.md).
- **Likes:** the side view and "the feeling you grow everything"; Hatched's staged assembly. "I like the new ideas
  and inputs."
- **A critical review of all collected ideas first** → [ideas.md](ideas.md) (the verdicts are AI's).

## 2 Nov, the roadmap and the ideas review
- **Roadmap draft approved** ("roadmap confirmed").
- **Ideas review: the drops confirmed.** The rest of the verdicts stay AI's.
- **A short spec for the toy** before building it.
- **The toy's verb: not aimed shots** ("it would feel really copied"). **Buds and pruning above ground, mixed with
  hidden soil below (Minesweeper-like), with a switch to turn the verbs off.** "A game-like mechanic similar to this,
  also not required." Spec: [slices/00-grow-toy.md](slices/00-grow-toy.md).
- **The toy spec's open questions:** seeds land at different spots: **in**. Nutrient as the only currency **for the
  verbs**: **yes**. (The first build read this as the only stock, without the spec; corrected below.)

## 2 Nov, after playing the first build ([playtests/00-grow-toy.md](playtests/00-grow-toy.md))
- **Rebuild the toy to match the spec**, from a fresh start. "Fun in principle"; managing growth and roots and
  directing the plant "is something I can imagine going forward with".
- **Generations are too short** → longer seasons.
- **The habitat is shaped by its neighbours and its habitat type** → added to the toy spec.

## 3 Nov, after playtest 2 and P36 ([playtests/00-grow-toy.md](playtests/00-grow-toy.md))
- **"I like the planned rebuild."** Next: a second toy pass, then the calls go into the spec.
- **Plants must feel different: "moss vs herb vs tree should all play different."** Maybe more kingdoms and species.
- **Zoom layers (P36.1):** M1 builds only the side view and the island; later milestones each open a layer.
- **Area (P36.2):** "maybe more complex calculation with biomass and so on, but display as a clear goal."
- **Skills (P36.3):** "active skills, 'shell cracking', 'efficient photosynthesis'… like unlockable perks or ways
  of life." Not OSRS levels; the keys and doors (parts) shown as skills.
- **Toy pass 2: add the tree beside the herb.** **Moss is in M1.** The plant-model research is good
  ([research/plant-models.md](research/plant-models.md)); breeding with dominance is interesting.
- **Slice 00b approved:** the tree runs 8 seasons of 60 s; a good herb season earns a 4th seed.

## 3 Nov, after playtest 3 ([playtests/00-grow-toy.md](playtests/00-grow-toy.md))
- **The toy is done: "I want to go on to the next phase now to see the vision."** → M0 step 2, the spec.
- Kept from toy pass 2 (you liked them): the tree's look, the spring leaves, cutting during winter. Herb and tree
  "play differently".

## 3 Nov, the spec's first calls (M0 step 2)
- **Oneshot M1:** the spec, then M1 in one build pass instead of a slice per part. "If helpful ask some questions
  first and build a very bare version, without full expanded rules and upgrade paths."
- **The core verb: growth in pulses.** At each pulse a few tips light up; you pick where growth goes (tip, and shoot,
  leaf or root); the genes decide how. Idle grows by itself.
- **Growth forms in M1: moss, herb and tree,** unlocked along the tier ladder (moss → herb → tree).
- **Pulses wait for your pick** (turn-based, ~8–12 a season; an auto toggle picks when idle).
- **Tier: score, then area.** Stats × niche weights → score → tier, shown at release; the garden then decides the
  area (biomass) the line holds, which pays and is the visible goal.
- **Runs happen on a home-island habitat;** one island in M1.

## 3 Nov, the spec draft ([spec.md](spec.md)): "sounds good"
- **No "Scree" or "Loam"** ("don't like the names"). AI renamed them to your own words from tastes.md: Lava → Bare
  ground → Forest floor.
- **Garden competition: steady, "but needs to stay interesting".**
- **"One line that evolves into lineages that you do the runs with."**
- **Run cost: "maybe coupled with an opportunity to do the run, like a rare gene in the garden or some event or
  unlock."**
- The spec sets M1's scope; the roadmap points to it.

## 3 Nov, M1 starts
- **Commit the spec and docs; M1 moves to "Now".** "Go build step 1, keep going until M1 is built", then an
  overview of the assumptions and defaults, a critical review and the other options.

## 3 Nov, after the first M1 playtest ([playtests/01-m1.md](playtests/01-m1.md))
- **The speed is right:** "I like the speed."
- **Fewer pulses, and release the best season** (P37 picks (a)). Also: "more root control, clearer stat trades and
  a gene/stat rework. Maybe they have genes and the stats are calculated from that." More genes, "like metabolism,
  heat resistance and so on." (The shape of the rework is P38.)
- **Income from biomass held** (P37 income (c): keep grams → biomass; the runaway gets fixed in the tuning, not by
  a new income rule).
- **"Fast climb means noticeable improvement."**
- **Part 2 as proposed in P38:** "part two sounds good as proposed." Genes (a): shape genes + body-chemistry genes
  in the 10-gene budget, stats measured from the body and scaled by the chemistry, one condition per niche, the gain
  over the parent shown. The run (b): a stand, the heir sprouts beside its parent. Then the map and income pass.
  Order: genes → stand → map and income. (P37's garden question stays open.)

## 3 Nov, builds (on [design/diverse-evolution.md](design/diverse-evolution.md))
- **Builds like a game character:** "making a build like levelling a specific pure OSRS character, or making a Dark
  Souls build. You could have to buy some upgrades and allocate stats gained by levelling. The genes or chromosomes
  could be like an upgrade bar that you can keep stacking up."
- **A shared budget is "very much the right direction"**; favouring all-rounders is bad. "There always needs to be
  some kind of pressure or damage and some kind of armour, or locked reward."
- **A condition for each niche:** the right direction.
- **Fewer model tests; play around more.**
- **Genes that change rules are "really important":** clade-specific upgrades and a **skill tree that characterises
  a clade**, with builds formed by choosing different paths. Named forms (Succulent, Pioneer…) are part of that tree.
- **Grazers soon.**
- "The genes still don't sound right": asked for an overview of the axes that set lifeforms apart in their niches
  ([design/builds.md](design/builds.md)).
- **The build system in three layers** (attributes, a skill tree per form, pressures and resistances): "I love
  the build system in three layers." Keep the **CSR triangle** in mind; it "could be used to show the identity of a
  species."
- **Attributes:** Pace, Stature, Endurance, Shade, Roots, Toughness liked; asked whether Defence and Health could be
  general names, and whether Spread, Offspring and Neighbours can be generalised (answered in builds.md §5).
- **The three locks against all-rounders:** yes. **Points: (c)**: attributes through the brood, tree nodes bought.
  **Upkeep grows with the genome:** "sounds interesting" (try it in play).
- **M1 gets the lean version:** ~6–8 attributes, one pressure per niche, ~6 tree nodes per form. The full tree,
  grazers and chromosome duplication come later.

## 3 Nov, on the builds spec ([slices/01-builds.md](slices/01-builds.md))
- **Paths:** "not sure, should still have choice." No hard one-branch lock yet; the choice stays (open).
- **Node cost:** "biomass or other currency" (open between the two).
- **Defence answers wind in M1:** "ok". Pressures "also maybe drought and sun and heat and cold."
- **Pressure kinds in part A:** heat, drought, shade, wind and flooding ("is ok"). Sun and cold wait for niches.

## 3 Nov, after playtest 02 ([playtests/02-builds.md](playtests/02-builds.md), [design/after-playtest-02.md](design/after-playtest-02.md))
- **Liked:** the attributes ("it felt good to raise those"), the pressures, genome upkeep.
- **P39 (b): "I like all of these insights, go ahead with a look toy first then slice 2."** Part B (the tree) waits
  until after the stand; it isn't dropped.
- **No pulses:** "I don't like the pulses as I just auto every time." Back to live steering: **"a few saplings
  growing at the same time, you can steer all of them and select one at the end to found the next year, where the
  new saplings start as that + random mutations."** The brood goes.
- **Levels follow growth** ("they should depend on how much it grew"); with P39: XP from growth, pips you place,
  "mutation" instead of "sport", the spot chosen, each attribute's effect shown, a gene view.
- **The look:** "I'd really like to go towards a low-res low-poly look." References: two pixel-art frames (bold
  outlined pixel fonts, segmented bars, framed cards, a "VS" favour bar).
- **The look toy tries both 2D and simple 3D:** "not sure 2D only. If it can get the look right that's fine,
  otherwise simple 3D would be really cool." The run's core waits on P40 (roots and variants as hunts).
- **P40 (c), both hunts:** the garden breeds variants by itself that you hunt on the map and found (v1's evolution
  back; sprouts become these variants), and a founded variant gets a run whose roots hunt hidden soil.
- **Shoots keep input:** "cutting in winter, and possibility to send more energy into a specific shoot. Maybe there
  are also things to dodge or go towards, could be solved by displayed light and shade."

## 3 Nov, after the look toy ([playtests/03-look.md](playtests/03-look.md))
- **The look: a mix.** "I like the 3D more for the plants but overall the 2D low poly is more coherent." "The world
  and underground feels better 2D but the plants feel better 3D." Widths: 3D at 480, 2D at 320 or 480. How: P41.
- **The panel stays in this style:** the home island, the card, the coloured attribute bars ("a lot"); the matchup
  "kind of". **Menus:** "a more OSRS-like font and maybe a little less colours."
- **P41: try (a) in the toy** (2D world, the plants upgraded in the 2D renderer). What the 3D plants have:
  "mostly the shadows and seeing the plants clearly and the volume." Fonts: try 2–3 open OSRS-style pixel fonts.
- **The references** meant "mostly the low poly low res look, and basics like the tiers, but the current approach is
  a really good start."
- **Round 2, the call: (a) 2D low-poly, for now:** "least buggy and weird and the shadows make sense to use them";
  "2D + 3D plants was very glitchy"; 3D "very glitchy… if it could be stable it were great." Replaces the mix.
- **Font: Pixelify** (not Tiny5, Silkscreen or VT323). **Menus: calm** (one frame colour, a drop shadow, colour only
  where it means something).
- **P42: (a) now** ("we can keep with a now"): Svelte + TypeScript + Canvas 2D. **"Godot and later Steam and phone
  are cool."** When to switch: P42, left open.

## 3 Nov, the stand (P43, for [slices/03-stand.md](slices/03-stand.md))
- **Steering, (a) targets:** click a soil cell or a lit gap and the selected sapling's nearest tip heads there;
  click a shoot to feed it; cut any time. Pause and 1×/2×/4×; no auto button (unsteered saplings grow by their
  genes); steering costs the sapling's own nutrient.
- **The run's shape, (b):** moss and herb re-found each year (3 saplings, pick one). The tree's 3 saplings stay the
  whole run; each winter the pips go on one and you may cut one. Herb first; the tree's thinning in a second part.
- **XP, (a):** the whole stand's grams that year; about 1–2 pips a year.
- **The sun is fixed per plot** (the spec's question 3, lean taken): the gaps hold still.

## 3 Nov, after playtest 04 ([playtests/04-stand.md](playtests/04-stand.md), P44)
- **Toys for the run's core play:** (a) turn-based growth on the plot, (b) a patch strategy map, (c1 + c2) a body
  builder scored by balance, "to really feel out possible game": [slices/04-core-toys.md](slices/04-core-toys.md).
- **Slice 03 part 1b:** you lean to pausing it ("but i also want to get to some point"); see the slice's question 1.

## 4 Nov, slice 04's questions ([slices/04-core-toys.md](slices/04-core-toys.md))
- **Q1: pause slice 03 part 1b** for the core-play toys ("q1 pause yes"), time-boxed to slice 04's two parts.
- **Q3: toy C is scored by the real niche weights** ("q3: yes"): the 6 stats → `nicheScore` → the tier list's tiers.

## 4 Nov, the direction ([design/big-picture.md](design/big-picture.md))
Logged on your call ("Document and save everything"). You had asked to hold logging while you thought it through.
- **Toys A and C:** "they actually seem really fun"; clear limits made "clear and visible choices"; [playtest 05](playtests/05-core-toys.md).
- **The sim isn't the game:** "not having sim as the game might be a good move to save time."
- **Animals first:** "most of my vision came from animals"; plants "feel like they should be the baseline".
- **Moving a creature:** body plans move differently, "like chess". "Just building bodies sounds kind of boring, its important you
  can see the uses as well."
- **The Life's shape:** a simple game of roaming for food; nodes locked by a stat or an unlocked skill ("body locks and skill locks
  souds great"); the body grows during the Life from a plan and starter parts ("mix is perfect"); eggs are the goal.
- **The activity "should be how the build proves itself".**
- **Species:** "keep it until you choose to branch". **At release** you choose whether this body becomes the species' form; eggs
  add population either way.
- **The tier list:** the species shapes the biome, the rank is set by the tier list, and the tier list gives the environment
  ("sounds great"). Capped biomes, ranked within trophic role. High overall tiers can be bad in a specific biome.
- **Bosses:** S tier needn't be the best. An apex predator slot that determines the era "is nice"; "i love the boss idea". What the
  slot does is open (P45).
- **Eras:** the next era resets to a real one. "It should still be free do evolve your own things, but the environment should promote
  that it resolves naturally in the next real era."
- **Authoring:** "make the rules of nature authored and then have more freedom"; "selection of real things is what drives authoring".
- **Goal:** "a hobby with 100 nerds on discord"; about 3 h a day. Harshness: "can be harsh". Tone still open: Terra Nil wonder plus
  gamey slang.

## 4 Nov, after playing the Life ([playtests/06-life.md](playtests/06-life.md))
- **The Life is the core, P44 closed:** "i think i want to go on with this as a core." "This is a perfect first zoom stage."
- **Habitats are areas in the garden,** and v2's habitats should come from the garden. **"The 'living' ecosystem is also really
  important to me."**
- **Life v2 as proposed:** fixed habitats; **fewer slots for now**, not longer runs; **a body you finish** ("like growing up");
  **lay only later** ("maybe"); worm tunnels. **More feel and UI: "only later".**
- **Not answered:** whether left and right sides stay. They stay for now, since nobody called it.

## 4 Nov, P45 ([design/big-picture.md](design/big-picture.md))
- **Next step: build the living garden toy** ([slices/07-living-garden.md](slices/07-living-garden.md)).
- **The apex slot sets one era-wide rule, and your species can take it** ("one era wide rule, my species can take it").
- **The world: the shallow sea around the existing volcanic island.**
- **The overview:** "the how this fits together overview sounds really cool and the examply is just what i had in mind."
- **"The single maps could still split."** AI's reading, to confirm: one habitat's map can later become more than one board.
- **"Take good measures so it doesn't get tangled":** the rules are in big-picture §12 and CLAUDE.md.

## 5 Nov, after playing the living garden toy ([playtests/08-garden.md](playtests/08-garden.md))
- **The real build:** "i want to go down this route with the actual build." "so the plan sounds good."
- **The guardrails aren't law:** "measures sound good but make sure its not taken to seriously by future ai and they don't think outside this rule."
- **Tests:** "the garden tests don't all need to run." AI's reading: the plant garden's 8 h timing test, now skipped.
- **Planning and research happen next,** in cloud sessions: [planning/README.md](planning/README.md).
- **Wishes, not yet calls:** to play the other niches; to play as a predator; "your predator behaviour would later chase you"; an island view; recognisable creatures ("can come later").


## 5 Nov, planning session turn 1 ([planning/plan.md](planning/plan.md))
- **A fresh start:** "i think i want to do a fresh start from this point with the current standing and ideas. maybe copy some useful code but try to think it from the beginning stack wise."
- **Playstyles:** "there need to be multiple different playstyles proven." **Verbs from equipment:** "the verbs can also come from the equipment, walk and eat is also vey basic. but many verbs/skills would be cool."
- **Filling a niche:** C, you pick the gap and it counts only if you lived that way; "pick should still give the selected base body".
- **Roles first:** "grazer and predator first good. maybe different grazer playstyles." Filter feeders: "maybe stacking up to get to efficent current flow?"
- **A Life's cost:** "at first no." **"There should also be some kind of lootbox feeling maybe."**

## 5 Nov, planning session turn 2
- **Verbs:** "the direction sounds good", not sure yet; "could also be a cool idea with the 3 slots. but i could also imagine different minigames. but go with the 1-3 verb slots that you could pick".
- **Lootbox:** "b) open your clutch, c later" (garden variants as chests later).
- **Stack:** asked for an honest evaluation: "an actual properly well done game thats playable on phones lateron... i don't want the prottype like style and limitations."
