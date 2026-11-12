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

## 5 Nov, planning session turn 3
- **Stack:** "lean godot, but pixi as alternative sounds good. i dont trust ai to get the feel right without help. want smooth workflow. will test, write it as a slice." → [slices/08-stack-test.md](slices/08-stack-test.md).
- **The predator:** "you see next step (maybe as upgrade) and you can change your movement and speed. also differnt undergrounds change escape. also armour."

## 5 Nov, planning session turn 4
- **Your predator chases you:** A, your best predator body in a habitat becomes that board's hunter once it ranks top; "maybe some special rules or mechanics for the predator would also be cool".
- **Grounds:** mud, sand and reef for the first boards, but they "should be the same as the natural map, so maybe should go together with this".
- **Body plans:** worm, arthropod, swimmer, "but maybe one extra role or body plan? what woud fit from the time? clam/brachipod? something cute or exciting or memorable".

## 5 Nov, planning session turn 5
- **Fourth body plan:** C, the trilobite, "maybe evolve from arthropods". Hallucigenia "only with sponges"; the brachiopod next milestone.
- **The island:** "should maybe change a little depending on the living species there. but basic starting habitats these three sound good." "it would be good if the island/garden still gave you the habitats within some range. still authoring like sand shallows or volcanic rock or mud flats is a good starting base geology wise. should be geology given life evolves. maybe to complicated for the start"
- **Predator rules:** ambush and frenzy.

## 5 Nov, planning session turn 6
- **Coming back:** "a with news": open and contested niches first, news underneath. "keep garden and prevent bad behaviour" (keep the toy's garden, stop one winner).
- **Era and apex:** "one era apex later is okay, keep open for both".
- **First release to the community:** "after first milestone."
- **The roadmap:** "adopt the roadmap" (M1, the first playable sea, slices 08–15). "set everything up to start the next slice in a fresh sessn".

## 5 Nov, stack test: the Godot half played
- **Godot half (slice 08):** "everything seems a lot smoother for the animation and board but the look in general is really
  rough and looks more like from a template."
- **AI freedom:** "i feel more freedom for ai is also good."
- "get ready and commit so i can start a new session to continue after this stack test." No stack picked yet.

## 5 Nov, stack test: the PixiJS half
- **The PixiJS half's look:** "dont keep the simple shapes, feel free to do a free interpretation" (said while it was being
  built). It got the 2D low-poly look from the look toy; the Godot half keeps its placeholder shapes.
- **The stack:** "pixi is good enough stay with this for itch." PixiJS (TypeScript, Vite) for the first itch release.
- **The next session:** "set up everything so i can start a session that implements as much as possible to hit the free
  credit limit." → [planning/m1-run.md](planning/m1-run.md); slices are built back to back and played afterwards.

## 5 Nov, after the first look at the M1 run
- **The verdict:** "the basics seem fun and as imagined." Notes: [playtests/10-m1-run.md](playtests/10-m1-run.md).
- **Trust fixes before more play:** "go ahead with the trust fixes" (kept forms real, a Life saved when it ends, stay with your
  form, passing on works, Feel hidden from players).
- **What comes next:** "keeping in mind the map and species chaning place is important, alongside further improvements and deeper
  progression."
- **How a species changes the place:** "a mix between a and b with maybe an overview map so you get a good feeling for things are
  spreading on a larger scale" (a: fixed, readable rules per role; b: populations that boom and move the stocks).
- **Roles don't fit everywhere:** "burrower on sand beeing bad is a good thing. not all roles should fit everywhere." "its fine if a
  burrower can't live in some habitats." More buried food on sand: "maybe introduced later to give it as a new niche."
- **Crashes:** "populations shod be abe to crash."
- **Roles from the body:** "'burrower' and alike should come from the body and be assigned during and after. maybe at start give a
  guess or current best fi." This changes "filling a niche = C, pick gives the base body" (5 Nov). How it's assigned is still open.
- **Verbs from the body:** "verbs should come from the body, not the body from the verbs." This reverses slice 10's direction.
- **Open, your ideas to shape:** a pick-and-plug body, a skill tree with parts as keys (part plus XP unlocks a verb), a new font.
  Options: [design/world-and-body-review.md](design/world-and-body-review.md).

## 5 Nov, the review's proposal
- **The proposal:** "the proposal sounds really good and what i wanted." ([design/world-and-body-review.md](design/world-and-body-review.md))
- **The living sea:** "I like the lviing sea proposal a lot, with patches that are really goverened and booms and crashes happen.
  species spreading and only few named rules." "the overview map is very important for feeling."
- **The body:** "i also like the proposal. big drawing with visible slots and inventory is cool." "verbs from plug ins sounds good."
  "feeling of really adapting and having maybe a recognizable species is good."
- **The skill tree:** "skill tree is cool, and i like the climb."
- **The order:** "the order sounds good" (quick wins, sea toy, overview map, named rules, body screen, skill tree, look pass).
- **The milestone (Q1):** "lean yes. world is core and was intendet for m1." The living sea goes next; filter feeders and sponges wait.
- **Role at the end of a Life (Q2):** "body and diet is good."
- **The offline budget (Q3):** "better fewer time savings and better map and game. 8h catchup window limit maybe around 5s (up to 10)."
  Replaces 8 h < 0.5 s; the old 0.1 ms step limit goes with it (5 s over 160 generations is about 30 ms each).
- **Tracking trade-offs:** "i like the comparison table, maybe keep something like this to follow where tradoffs have been made
  and what they achieved." → [design/tradeoffs.md](design/tradeoffs.md).

## 5 Nov, the sea toy's numbers and the bars
- **A generation:** 3 min, "yes for now." **Crash pace:** "depends on real dynamics but every 5-50 gens." **Patches:** about 70, "sounds good."
- **Asked, not decided:** "do mats rot and oxygen make sense? what about mats/plants, animals/prey, and oxygen or similar." Slice 16
  builds Mats, Buried, Prey, Oxygen as a proposal (the rot stock stays underneath).
- **The font is still open:** "are there more pixel fonts? can we build one?" Jersey 15 is a placeholder.

## 5 Nov, the font
- **The font:** "using this would be great and first priority" (RuneStar's Old School RuneScape fonts); "i dont like all would prefer
  runescape font or else gnf." "drawing our own would also be great." Plain 12 and Bold 12 are in the game; crisp at 16 and 32 px, so those are the only sizes.
- **Not settled for release (AI flag):** RuneStar's CC0 covers only RuneStar's own rights, and its README says the glyphs are exactly as
  in the game, so Jagex's rights aren't cleared by it. The repo is public, so a push publishes the font files too. Decide before pushing or the itch release.
- **The bars' names:** "map specififc names are okay but maybe general names are easier long term? or maybe show the kind of food types." Not yet changed.

## 5 Nov, the bars and the release font
- **The bars:** "build slice 17 and pick the bars to use." Picked by AI at your request: **Surface, Buried, Prey, Oxygen**, each with this habitat's real foods beside it ("grazers eat mats, shell beds"; "hunters eat Wiwaxia, Olenoides"). In the game's card and the sea toy.
- **The font:** "i like runescape best, release it if possible with this otherwise gnf." Checked ([research](research/font-licences.md), not legal advice): it can ship with a small risk, so **the RuneScape font stays**. Likely outcome nothing; worst realistic case a takedown request, then we swap the font. GNF is the fallback, embedded only and never in the repo. Jagex's fan policy gives no permission, so don't cite it.
- **Done because of that (AI):** the files, family and internal names are now Clade Text, and "RuneScape" stays out of the UI and the itch page.

## 5 Nov, after playing slices 16 and 17
- **The sea toy:** "it looks really cool and is similar to what i've imagined and feel really nice to see the changes." "i played the toy and could watch these" (a boom, a crash and a spread). Notes: [playtest 17](playtests/17-sea-toy.md).
- **Slice 16:** "it feels a little better."
- **The font:** "rs font is cool."
- **The itch upload waits:** "before itch upload i would like to put everything together."
- **The goal:** "get a clean freshly put together full version that i can release to get feedback and ideas." It needs: "polish look, species beeing recogniazble"; "one full run and different playstyyles, and recognizable creatures and possibly names"; and "make the connection feel good between ah i played this run and advanced my lineage now i can see it play out on the map and change conditions. what run do i pick next?"
- **For the next session to discuss, not decided:** when to start a new folder or repository; when to put it all together; more lines and customisable characters; the art pass.

## 6 Nov, planning the full version (tastes, one question at a time; the options and the plan come after)
- **The aim:** "i liked the individual game, and i like the lviing sea, and i want to put it together." "most importantly the current toys should become one game." Also: more animals, "maybe some plants or algae", "progression in the lines to actually change the body", "a lot of ui and art".
- **One full run** is one Life: "for now one full run would be one life, and along you evolve your lineage."
- **After a Life** *(leaning, not final)*: the family tree: "this sounds really good, and also a little how i imagined an evoltuin upgrade skill tree". "watch it spread is also a core aspect." "opening the clutch still seems fun but maybe not in place yet."
- **The trees: undecided.** "i really like the classic skill tree and pure family tree, and i think pure family tree could get too crowded. but maybe there could be one big tree of life, then the lineage tree and skill tree together or side by side?"
- **New parts: undecided, a direction:** "i like earned by living part, that you actually grow up and grow the body parts to use them"; "somehow earned with evolution points or evolution xp"; "i really like the random genes and \"mutation\" aspect"; "lineagexp for unlocks and skills, get rare \"genes\" or \"body parts\" that you can equip or grow during a run."
- **Growing up:** moult offers drawn from your genes: "i like this best, lineage should also offer verbs and mechanics and stats." Plan first by "speccing the lineage tree to see what could be offered for a run." "finding genes is interesting but makes more sense for reproduction."
- **Animals:** "you can play as every lineage and start as most build if you have unlocked it." Keep it general: "generalized bodys and creation as possible"; "a authored base sprite per lineage with adaptable body parts and slots that can change during the loadout"; "not author tons of other creatures that you can't play." Lineages change because you played them well: "picked adaptations that formed a real new lineage. that also looks differnt." Open: "either body just from parts/gen or authored lineages with body plans that automatically are put together and appear as the final species."
- **A new lineage** *(leaning)*: authored recipes (meet a lineage's parts and play well, and your form becomes it): "this is cool, but pureley from parts or having a strong generator would also be really important. the feeling that the animal or creature you see and build is qctually the one drawn fells important, and also see your impact."
- **Home and the next run:** the map, with run hooks made by the sim (a crash, an open niche, a rival booming); tap, pick a lineage and build, live; the trees one tap away (AI's option, picked without changes).
- **Plants and algae:** a living food layer first: "a living food layer is definetley the direction i want to move, maybe multilayered animal food chain first too." "this needs to come at some point, playable later is okay."
- **Creature art:** code-drawn low-poly, pushed further, one generator: "this sounds the best, i also like the idea of code drawn pixelated or hand drawn bases for good recognizability. but i think this is the most robust and fitting."
- **The arc of the first release:** the whole release is the sea, and a line reaching the shore in one special Life is the cliffhanger; the sea keeps running afterwards (AI's option, picked without changes).
- **Order:** a body toy first ("is the one I built the one I see?"), then join sea and bodies in `game/`, then trees and XP, more lineages and algae, the UI and art pass, then a clean repo and itch (AI's option, picked without changes).
- **The whole picture:** "sounds good, order good." ROADMAP changed on this: M2 is now the full version, step 3 the body toy. "make sure that we stay on the road to this vision for release soon." Design: [full-version.md](design/full-version.md).
- **Systems:** arrive "one at a time".
- **Rigs:** "maybe even more rigs? what ways are there to do this?" Answered in full-version.md §3 (AI's lean: one spine, many gaits; the toy tests it).
- **Recipes:** "would be cool if the recipes were body parts, some of which then would go into the base of the new lineage. like running an arthropods with claws and 10 legs, it would be a crab, and become a base crab."
- **Every lineage playable:** "i plan to add more mechanics and minigames midterm, so show also maybe carry some more, but keep simple now but expandable."
- **Lineages in the release:** "6-10 unless toy makes it easy, them aim for around 15."
- **Trees:** "one tree screen, maybe one extra closeup lineage spec tree for skills and upgrades for that run."
- **Hatching:** "maybe hatching for now is okay, so at the end."
- **Slice 18, the body toy,** is next: "go ahead and spec the body toy as next slice and document all thoughts tastes, plans and ideas."
- **Named species as end points** *(a wish, with question marks)*: "i would like it if a named real species was an end point for a lineage so you have something to arrive at? maybe not as more recent animals it would be cool to discover an own thing, but it would be cool if you could arrive at named species that are pretty strong but still spec into a slightly different sidebuild that could be more optimal under some circumstances."
- **Parts in the new base: not decided.** "that sounds great, but maybe be careful that it doesn't stack to much or can't be changed again, maybe it could also be a default start with that body part or just some are integrated? not sure about that."
- **Long term:** "long term sounds good. did you think it through?" (AI's answer and the gaps: full-version.md §6.)
- **What a new lineage is:** "more of a fresh start and can look different but optimally it should overlap so that the lineages look is anyways already kind of how the creature i build. but maybe as a more direct or \"branded\" result that feels like an upgrade."
- **The crab:** "crab similar thing would be cute, cambrian crusher later crabs would be cool."
- **Recipes:** "recipe naming parts to fuse is cool, or also by rules that are overarching. (skeleton + flabby skin/feathers = wing) but i think authered is easierst mainly."

## 6 Nov, after the body toy (slots and style; style still open)
- **One place, one thing:** "everything you can see lives in a place and a place holds one thing sounds like a good rule."
- **Locked places by lineage:** "locked places as lineages sounds cool and like a good idea, maybe the kind of spot should stay but still improve (carpace > spiked carapace/tough carapace)."
- **Locked isn't forever:** "locked slots could also reopen later when going to even more advanced lineages"; "locked should also become free again or still changable and upgradable within the class."
- **Front:** "front appendage beeing like the weapon slot is also cool."
- **Stacking: open.** "i think lineage power could come from the locked parts in this setup, but i think both is a good solution. still open."
- **Exact placement:** "exact placement would still really nice to have in some places, but for now its ok."
- **Style: open, a direction.** "in the current way i almost like the current best, but i think in general i want to go more cozy retro pixel vibes or more detailed low poly. or a scientific feel." And: "i wanted a little cuter animals also for a start instead of just bug-looking things." Not in tastes.md until you say so.

## 6 Nov, after the seven looks (style still open; the board test is what decides)
- **Where you stand:** "low res (low) poly is i think the way to go, but everything should be really efficent and maybe could get swapped with pixel arts at some times. maybe all pixel could also be nice."
- **Pixels:** "i also like the low poly world and also want future minigames with shadows. but i like the pixel style a little more."
- **The looks:** "I think I like the idea of D but right now c looks better, today is also cool."
- **Field guide:** "pretty intriguing but i think i wond end u liking it."
- **Cute:** "not a lot of cute."
- **How to compare:** approach each style fresh, on a real board. Done in slice 18c. Not in tastes.md until you say so.

## 6 Nov, after watching the board (research shortlist; style still open)
- **Research shortlist:** "1 and 2 sound good" (hidden drift then rare breakthroughs; niche-model food web). "3 sounds good but also complicated, what effects would body shapes have?" "5 also sounds really cool to have and to collect" (heritable coat patterns). Ideas, not plans.
- **How the look gets picked:** "for now I'll decide what is easiest to get high quality ai generation for, and fits most animals easy." "Speed and performance is important to me. mainly though the ease of getting everything right."
- **Other options wanted:** more basic, less movement, generalised; really small sprites; a cheap sprite in-game and on maps with a larger detailed one for equipment.
- **Reactions:** "for background i like the current best." Likes the 3D look of low poly and the overall vibe of pixels most, "especially the simple 16x vibe", but "bodies, segments and map structure are less visible" there; "better recognizable in 24x for animals and background". "the improved low poly look for the animals is actually really good as well", "chunkier low poly is actually also pretty good", but "glitchy and flicker a lot"; "i like that you can see the legs and everything well moving". Likes having 3D info for map models and future plants.

## 7 Nov, closing the looks for now (the final style stays open and changeable)
- **How animals get made:** "you write the painter and each animal is a recipe sounds good." So no image AI for the animals themselves.
- **Keep:** "same recipe painting all sizes is great. also keeping 3d info is great. also the flicker fix is great."
- **The target:** "for a look i think i want to hit between osrs and stardew valley."
- **Stop here:** "if we can change all of this up easily i wouldn't waste more time on this now, and continue towards itch release."
- **Reactions, not calls:** "i like low poly steady for the arthrpods, but prefer low poly chunkier." "for general look i prefer 16px over 24 but some of the animals are way better readable in 24px." "for the full animal chart i think 16 is most my look but 24 is still really cool and fits." "maybe we can switch u inbetweem or even use 16px for smaller or two tiles for larger?"
- **Bug you found:** "for some arthropods and the trilobite the head or front end from the body sticks out in front of the original head."

## 7 Nov, join the sea (step 4): who lives on the map
- **Same species, and you invent it:** "so b same specises, and you invent the trilobite so the map starts empty, maybe some really basic things that you also start with. \"you start as one of the worms\"." This drops the nine natives as a starting cast, and answers gap 5 in full-version.md §6.
- **Becoming a new lineage** *(a lean, not a call; step 5)*: "i lean becoming an trilobite is an empty build, or having the parts locked, then you could still see the impact".

## 7 Nov, join the sea: empty founding and continuation (resumed in Codex)
- **Empty animal map:** "empty map your first play gives the first animal." This supersedes the earlier possibility
  of starting with basic native animals. The step-4 draft keeps food and environmental conditions present; the first Life is a worm.
- **Temporary body access:** "don't overthink this if we will change it later. so i guess lean b", referring to
  existing bodies being open instead of temporary rank gates. The saved draft uses that after the founding Life;
  it does not decide permanent lineage progression or recipes.
- **Close connection:** "would be also cool if you could only start a run from your last runs eggs, so you have to
  spread step by step. the sea and basegame should interact closeley and feel connected".
- **Continuation rule selected:** the user chose "first" between the last successful clutch and any living descendant
  population. Use the last successful clutch, in its patch or an adjacent patch, retained for retries. A new
  successful Life replaces it. This is spatial continuation, not an egg-inventory spending system.
- **Worm predators and more animals:** "can we make worm predators?" and "maybe add more animals" remain requests
  to investigate, not approval for a larger step-4 scope. Live worm hunting needs a bounded gameplay change.
- **Spec checkpoint:** the user authorized saving the reviewed step-4 draft, decisions and workflow on a fresh branch:
  "yes you can change things on a fresh branch ... if you make sure with git everything is reversiable and tracable
  thats fine". [Slice 19](slices/19-join-the-sea.md) records the scope and remaining compatibility decisions.
- **Old measurements:** the resumed Claude transcript contains fewer-species experiments from an unsaved scratch
  script. Their scores were provisional; these are reported results, not reproducible evidence in this repository.
  Do not derive an empty-world founding boost from competition against the old nine-native starting population.

## 7 Nov, context, verification and handoffs
- Fresh session per task: store decisions and handoff first. "also remind me when to hanover to a new session".
- Keep AGENTS.md/CLAUDE.md concise and link to details. Restrict inspection to relevant files and dependencies.
- Separate investigation from implementation; propose the cause, smallest change and checks before approval.
  Existing authorization does not need to be requested again.
- Use deterministic scripts for checks and summarize output; limit parallel agents to explicitly requested,
  independent work. The shared rules are in [workflow.md](workflow.md).
- Git checkpoints on a fresh branch must preserve previous work and make changes reversible and traceable.

## 7 Nov, join the sea part A implementation
- **Authorized scope:** continue on `codex/m2-step4-spec`, implement part A, and explain the smallest change and
  verification before coding. The latest instruction says "saves are no priority"; it supersedes the earlier
  emphasis on preserving saves. No save files were edited or browser data accessed.
- **Implementation boundary:** stage the production sea and v3 codec alongside the v2 garden UI until part B.
  Keep the existing UI and species sharing working during the port. This is an implementation choice within A,
  not a decision to retain two world simulations in the release.
- **Migration choice:** retain original JSON and map legacy habitats/populations and pending results deterministically.
  Old saves lack last-clutch chronology; use the documented successful-entry/progress fallback. Exact rules and
  typed-array ordering are in [slice 19's Part A notes](slices/19-join-the-sea.md#part-a-implementation-boundary-and-migration).
- Predator-worm representation, new sharing rules and founding balance remain open for their dependent parts.


## 7 Nov, join the sea part B: feeding and creature-design sharing
- **User decision:** "keep recording diet but use parts and verbs to specify. sharing creature design".
  Diet remains an observed record; it does not grant hunting behaviour. This supersedes the slice's proposal
  to use diet roles as the complete feeding specification. Body identity remains distinct from feeding.
- **Bounded implementation:** existing grazing parts/verbs use mats, digging and crushing tools use the existing
  rot stock, and grasping arms/arm spines enable live capture. Mixed graze/detritus tools split feeding effort.
  No new food stock, animal, worm-hunting mechanic or general body system. Basic builds without feeding tools
  use the existing mat-feeding fallback. Existing swimmer catching now requires a capture part.
- Record the build at the latest lay, so later injuries do not rewrite the eggs. Keep the existing body/diet
  species IDs and use the strongest successful clutch's parts as their representative build (latest wins ties).
  This is a bounded bridge, not a system of separately simulated genotypes. Fitness never decreases.
- Older saves lack inherited builds: retain their IDs/populations and derive compatible parts from body/old role.
  A legacy meat-eating worm gets a proboscis and scavenges; it does not become a swimmer hunter. Unknown legacy
  bodies remain in the sea and are explicitly listed as sea-only on the board preview.
- **Sharing means a starting creature design:** old codes keep their body, carried form and verbs, but score
  and habitat grant neither animals nor launch access. Existing migrated visitors remain; new imports add no
  visitors. Body compatibility and slot/verb capacity are checked. The imported preset is held for this visit;
  its code remains the portable artifact, without adding a design-library feature.
- **Part B presentation:** retain the island overview and authored boards, add patch lists/eligibility and
  existing body/loadout controls. The visual patch map and release highlighting remain part C.

## 7 Nov, Part B feedback and Part C specification
- **Reported play feedback:** Part B mostly looks good; the living sea map is missing and species unlocks feel
  too fast. This is feedback on the temporary bridge, not a decision to reinstate rank gates.
- **Equipment clarified:** the missing view means “Large creature with visible slots and parts beside it”.
  This reaffirms the body-screen direction; its roadmap home is step 5.
- **Requested planning:** finish the Part C spec and advise on an implementation agent for token efficiency.
  The user also wants a general gameplay/design review of genes, founding species, steering lifeforms,
  RPG-like runs, strategy and how later minigames fit together.
- **AI recommendation, not a user decision:** do that review after the connected Part C loop is played and
  before step 5. [Plan and preliminary assessment](design/part-c-and-gameplay-review.md),
  [Part C spec](slices/19-join-the-sea.md#part-c-implementation-specification),
  [reported feedback and future play protocol](playtests/19-join-the-sea.md).
- This session specifies and records the work; it does not implement gameplay, change release scope, or
  claim that the general review or phone playtest has happened.

## 8 Nov, Part C navigation and the next body phase

- **Navigation accepted:** “play next list would be good”. Specify visible eligible choices with matching
  map labels as [slice 19 Part D](slices/19-join-the-sea.md#part-d-next-patch-navigation-follow-up-8-nov).
- **Population suggestion:** “number of eggs from the first run in that area could be starting pop”. Read
  as the eggs laid by the first Life played there founding that local population, matching the current rule.
  Existing residents are retained and eggs add to them; this is not a decision to transfer/re-release the
  previous patch's eggs at launch or overwrite population already spread into the neighbour.
- **Step-5 specification requested:** “help me spec the next phase”. [Slice 20 draft](slices/20-join-the-bodies.md)
  covers general bodies, the large equipment view, actual part-driven actions and continuity. No runtime
  implementation, permanent lineage gates or expanded release geography was requested in this planning thread.
- **Inheritance bridge selected:** “one chosen club part from the clutch”, with the qualification that it
  “needs better integration with the species and lineage system lateron”. One compatible chosen clutch part
  follows the continuing line into a neighbour for step 5; this does not settle final species inheritance.
- **Later ideas, not current scope:** founding a new species; “the whole build as its one species”, or
  “the whole build + mutations”. Revisit these in the species/lineage review for step 6 before fixing its model.
  Step 5 retains aggregate body/diet populations and must label them honestly.
- **Initial lineage strength selected:** “built in parts first”, “can start with built in”. Existing
  movement/base differences remain. New extra lineage stat bonuses wait; the user still thinks different
  base stats per lineage make sense and also likes strength coming from the body/build. This is a starting
  choice for step 5, not a permanent prohibition on authored lineage stats.
- **Equipment reference:** “the toy a life v2 is a good example, however it could be done differently”.
  Use its visible body/slots and part-card interaction as a reference; the layout and interaction can improve.
  This does not adopt the toy's old slot rules or progression instead of the step-5 body model.

## 8 Nov, slice 20A contract review

- **A — revised rule approved provisionally:** after selecting “Revise A before acceptance”, the
  user clarified: “maybe only light starting upkeep, otherwise sounds okay for now but document that this
  is open to revision. maybe there shoud be less than 3 verbs possible.” Defaults/family locks are acceptable
  provisionally; lighter starting upkeep is preferred, with costs and the action limit explicitly revisable.
  The possible lower verb limit is a tentative idea, not an accepted hard two-verb cap. Builds may already
  have fewer than three verbs; the existing ceiling is not a required number of actions.
  The user then approved the [concrete A revision](design/20a-body-part-contract.md#a-revision-light-upkeep-and-open-verb-limit):
  “approve for now”. Include basic built-ins in base upkeep 1; charge extra tools normally. Apply one
  explicit allowance of 1 while A/T has its `leg` component or S has `flap`, including within walking
  variants and after legal repair; otherwise no allowance. Base upkeep stays 1 even after loss. Preserve
  the listed defaults/locks and the provisional ceiling of three verbs, with fewer allowed and no hidden
  equipped actions. Default-only upkeep is 1 for every body; A Digger 2, S 1 and T Tank 3 without a carried
  part. Costs, defaults/locks and a possible lower verb ceiling remain open to revision after equipment
  playtesting. This closes A's decision gate for the staged model; it does not claim balance is verified.
- **B — accepted as proposed:** the user selected “Accept B as proposed (recommended)”. New six-place builds
  use one effect copy per choice and no repeated-ID stacking; size changes drawing count only. Retain explicit
  walking/raking and walking/digging variants, frontal rakes, spined shield and action-preserving upgrades.
  Compound/hook/deep retain Sense/Crush/Dig; spined arms retain capture. Accept the listed finite-place and
  physiology conflicts and numeric stacking losses (two gills' oxygen 7 → 5; size-3 double-pouch eggs 9 → 6).
  Legacy arrays keep their existing effects. Exact mappings and examples remain in the
  [contract](design/20a-body-part-contract.md#place-and-variant-semantics). B's nominal component costs remain;
  A's subsequently approved allowance determines effective whole-build upkeep.
- **C — accepted as proposed:** the user selected “Accept C as proposed (recommended)”. Rows cover both
  flanks where specified; a tear removes the whole row/variant, including its actions, effects and upkeep.
  Locked/default rows remain damageable and shedable, without free restoration. Use the specified fixed
  tear priority, guard bypass, softness and installation-order starvation rules. Eventual cutover uses v4
  saves, tagged legacy versus placed builds, recoverable source JSON and exact versioned design exports.
  Preserve legacy effects, RNG/populations/graph/progress, last-lay builds and exact once-only pending
  settlement. Old launch conflicts need visible resolution; never silently discard parts. The contract's
  continuation/local-form distinctions and old-code decoding remain required. This accepts future rules;
  it does not authorize changing the running codec or beginning runtime integration in this review.
- **Boundary:** the contract calls are settled for the next staged model. Use a fresh implementation
  session for pure definitions/helpers and deterministic fixtures, preserving the running slot model and
  v3 codec. Equipment/board work and persistence/feeding/result cutover follow the bounded stages; this
  review changes documentation only. No balance/play/performance check is implied by acceptance.

## 8 Nov, review of the Codex stretch and TierZoo

From Claude's [review](design/m2-review-8-nov.md) and the [TierZoo concepts](design/tierzoo-concepts.md).
- **Reset the sea save at the body cutover:** asked to choose between a reset, a rough conversion and the full
  compatibility layer, the user chose "reset sea save". This supersedes C's v4 legacy layer: old v3 part rules
  beside the new places, legacy representatives keeping old effects, and conversion of old pending results and
  designs. C's damage rules (bilateral whole rows, tear order, no free restoration) stand. Old share codes are an
  open detail (AI lean: reject them with a message).
- **Default movement is outside the verb ceiling:** "yes". Dash from the default `leg` (A/T) or `flap` (S) no longer counts
  toward the three-verb ceiling. This amends A; a T Tank can then take a compound eye as one legal change.
- **Merge to main:** "yes, if everything is in order and the continued build makes sense", possibly in another thread.
- **Wiki export:** "gitignore the wiki". `wiki.json` is ignored; `infoboxes.json` is kept.
- **TierZoo reactions:**
  - Likes: patch notes with a cause, a tier letter per niche, "strong vs/weak vs or some kind of triangle", and
    trade-off tooltips.
  - Borrow the genre, not the names or text: agreed "mostly", since "it's great inspiration".
  - "A full dex or numeric stat sheets would be cool in the future."
  - "This whole system aligns closely to my vision that you can pick a build and level it along these lines;
    also ties in closely with the evolution points/skill tree/body parts."
  - Open: "maybe with this setup it makes more sense to start more recent" (see P47).
- **TierZoo direction (at the handoff):** "i really liked the table and the proposed comparisons and want to really keep
  going into that direction." The P47 questions (start era, the game's words, when the stat bars come) stay open.

## 8 Nov, housekeeping and the automatic handoff
- **Merge and prune:** "go ahead, commit and do all of the tasks": `main` fast-forwarded to the `codex/*` stack and
  pushed; all old local and remote branches deleted (every one was already in `main`'s history).
- **Automatic handoff:** "handoff should be done automatically once a large task is done so i dont have to rerun the
  command." The AI runs the `/handoff` steps itself at the end of a large task, then says it is ready for `/clear`.

## 8 Nov, trimming slice 20
- **Old share codes after the reset:** "no message needed, there is no saves or codes outside mine". Old saves and
  `CLADE-` codes are simply dropped/invalid; no rejection message, no conversion. Slice 20 and 20A were trimmed by
  deletion to match (no legacy layer); starter checks for codes and size-keeping lay snapshots are specified in 20A.

## 9 Nov, 20C play
- **A hit always costs health:** "taking a hit should take a life even if a part is lost". Replaces the 20A
  contract's "a tear absorbs the damage". Notes: [playtest 20](playtests/20-join-the-bodies.md).
- **Slice 20's close:** five fixes (hit costs health, upkeep shown off mud with Deep Burrow's 0 named, no size
  picker, proboscis from the head's tip, slots in the moult view): "the fixes sound good". Compact slots with
  icons become **20D** ("20d is fine"). Cutting unused parts waits for step 7 ("wait for 7").

## 9 Nov, 20D spec
- **20D slots, the AI leans taken** ("go with your leans, build it"): slots around the creature (one row under it on a
  phone), no leader lines, icons at the toy's 6×6 for now (8×8 in step 9). Spec: [20D](slices/20d-slots.md).

## 9 Nov, 20D play and step 6 planning
- **20D:** slots fine, icons okay for now; the slot jump on tap fixed. Upkeep "seems really high" (balance, later).
- **Step 4 checks** (steps 4 and 5 ticked; map polish to step 9): map "clunky still and rough" on desktop and phone, smooth on desktop; the story of founding and
  continuation "was okay", now "a little more confusing". Notes: [playtest 19](playtests/19-join-the-sea.md).
- **Step 6 in three parts:** "splitting in 3 is fine, but i don't want to start a plan spec, check, and review step
  each time." So one spec for all of step 6, built part by part without a new spec and review round per part.
- **What a run carries forward:** (c), both: the lineage keeps XP and unlocks, and saved species (a whole build plus
  mutations) live inside it as presets.
- **XP:** "spend points gotten by leveling, some levels could unlock things and the currency could be used for
  further upgrades."
- **Order:** model first.
- **Upgrades (slice 21 Q1):** "maybe better stats if applicable, sometimes less upkeep sometimes more bonuses ...
  first go lean/enhanced for less upkeep or more effect and then signature to get the free built in. not sure on this
  one. needs to feel cool, maybe we have to integrate it carefully with future changes" (skill tree, moves). Taken:
  rank 1 Lean or Enhanced, rank 2 Signature, as data records the skill tree can extend; revisited in 21B.
- **Bodies from recipes (Q2):** yes, as planned in the ladder; "swimmer maybe swimming flaps as well".
- **Hatching card (Q3):** "yes": a mutation in the saved species, unlocks its part, replaces the carried part.

## 9 Nov, 21A play (your notes in playtests/21-the-climb.md)
- **Saved species are launch bodies:** "species = launch bodies": a species keeps the body the Life started as plus the
  kept gene, not the parts it grew, so every Life grows again. Built in 21B. Your follow-up, "maybe the build in parts
  could be kept? or upgraded? could be a longer process that plays over multiple runs", is in ideas.md.
- **The pool stays strict for now:** "leave it for now, lean wild moult offer maybe and show cards better but for now
  its ok". Both are in ideas.md; the hatching screen marks new genes anyway.

## 9 Nov, the 21B play and the work split
- **Claude plans, Codex builds:** "A": Claude (Opus) does kickoff, triage, specs, build briefs and reviews; Codex
  (ChatGPT Pro) builds from the brief. Set up in `AGENTS.md` and `workflow.md`. 21A and 21B committed first.
- **21B play:** hatching, the XP screen and the close-up are "really cool approaches"; lines level fast, "okay".
  Not pulled to play lately; worries about repetition and "a heavy authorship direction" (notes in the playtest).
- **21C:** "place then watch" (you choose where the eggs settle, then watch it spread); the linear map waits for
  step 9; hatching bringing new parts "is good" (it already offers genes outside the line). Build brief in the spec.
- **Direction (not decided):** "you don't have to start over and over but still have something to do in each run";
  a body you finish, more upgrades, lineages and species, surprises, maybe a larger genome with mutations like v1.
  The long loop: "pick server, pick habitat, pick niche, pick build, adapt build, optimize build, get rewards". P48.

## 9 Nov, the 21C review
- **P48: C** ("p48: c"): A now (a species keeps its whole grown body as a plan; a Life starts as a larva with those
  parts as buds; moult food grows a bud or puts a new part in a slot), then B's surprise as part variants from
  hatching, with step 7's lineages. Asked as "C as slice 22 before step 7, and the one sea for M2?"; the answer
  named C, so confirm the timing and the one sea at the slice 22 kickoff.
- **P46 closed** ("as above"): body shape stays visible only, as built.
- **P47 closed** ("as above"): the Cambrian stays, and the game keeps its words (line, species, part, rank, XP).
  Tier letters per niche, patch notes with a cause and stat bars go to step 9 or ideas.md.
- **The map** "needs to be larger and zoomable. add quick zoom if cheap now": built (+/−, drag, auto zoom while placing
  and in the replay). "make the fixes now": a Life without eggs has no replay; the placing line shows the real
  strength; the replay shows the release first.
- **The tree:** "cool for now"; "smaller portraits are okay, one shared canvas as well works" (ideas.md, step 7).

## 9 Nov, the slice 22 kickoff
- **Slice 22 is P48 A, in step 6, in the one sea** ("yes, step 6, one sea"): built before step 7's lineages.
  "in the future the server select should pick the era, and rough region, but thats future work" (ideas.md).
- **Slice 22's three questions: the defaults** ("defaults are fine, commit everything"): presets and fresh designs
  start as buds; the kept hatching card goes into the plan as a bud; a bud costs about half a moult.

## 9 Nov, P49 and the Carapace notes ([research](research/carapace.md))
- **P49, Q1** ("i do like the concept a lot of what you do is steering the body, but it could go over generations and
  by picks. but it would alo be cool if there was a higher chance of parts that relate to the current actions"): what
  you do steers the body. It builds up over generations through your picks, and a Life's actions raise the chance of
  related parts in the moult offer (a chance, not a fixed rank).
- **P49, Q3** ("maybe. lean yes"): the offer shows its reason. **Q2** ("lean park but maybe we can think about in what
  scale of the game this concept would fit in"): unlocking by count is parked; which scale it fits stays open in P49.
- **From Carapace:** you like the generation cards and its character graphics. Landmarks, things to discover, a more
  varied map, rarer special maps, layouts or features ("clam colony, whale skeleton, sea grass meadows, volcanic vent
  ect."): "some surprise and change and actually feeling like you have to adapt is great" (P50). Seasons "lateron"
  (ideas.md). The food web and real-biology events: "i want something like this, best if it came from the actual
  system" (P50). Named forms "have to be carefully integrated. i want species generation to keep a life dynamic."

## 9 Nov, P49 and P50 closed
- **P49 closed** ("for open, populations should drift towards what their patch demands anyways. tracking behaviour in
  lines or lives sounds fun but no priority"): populations drift toward what their patch demands. Today a patch's fit
  changes only with releases, so this is new sea work. Tracking behaviour per Life or per line is parked (ideas.md).
  *AI reading:* the use-weighted moult offer from the first answer needs that tracking, so it waits with it.
- **P50: A in step 7, B later** ("discoveries like the ones proposed including sponge gardens and the reefs sounds great.
  a in step 7 and b later. cambrian are fine."): sea features from the food web in step 7: vents, algal meadows,
  brachiopod beds, carcass falls, sponge gardens, reefs. Rare sea layouts (B) come later, with the server select.
- **Rare features come from sim events** ("maybe simplified version of whats there and assign a small chance of a event
  or landmark if the required population is there"): each feature or event has a small chance when the population
  it needs is in the patch.
- "handoff and get everything ready to playtest 22 and plan the next steps."

## 9 Nov, slice 23 round 1: drift, the food web, lineages (leans and reactions; the spec converges next round)
- **Drift: gene variants, lean yes** ("b' sounds cool"; "the idea of a small genome is great to me. maybe it will be too
  complex in the beginning though"; a and c less). Rethink the stat names (classic RPG or biological terms) and find "a
  good split" between parts and genes, "maybe ... internal vs external". "breath sounds a little bit weak, diet sounds
  good." Many species are fine with "a clear distinction between variant/species/clade/family/guild/clan".
- **Algae:** microbial mats, plankton bloom, crust and seaweed "all sounds good". Sulfur mats belong to the vent. Filter
  feeders might get "a shorter, place and grow and watch style".
- **Layers maybe from rules:** "diet focused (eats plants or meat) and/or size focused (you can eat bigger prey)". Food
  chains "should be important"; show who eats whom and which chains are running.
- **Lineages, yes:** worm → bristle worm as "an easy first recipe unlock to teach"; Wiwaxia; hyoliths; Marrella; the lobopod
  as the link from worms to arthropods; Opabinia as a swimmer; Anomalocaris; Pikaia as the cliffhanger or a hint at
  vertebrates; the arrow worm "fun as carnivore worm"; Hurdia or Cambroraster maybe, as a sifting radiodont. Leanchoilia
  and Waptia no: "only take arthropods that are significant for now to start a new direction (insects, crabs, isopods,
  spiders ...) or ones that could be unique". Authored species should be "important stepping stones, or characteristic
  feature combinations".
- **Sessile life as features first,** unlocked with its lineage or clade ("in the beginning there were only sponges but
  later on when you get better worms tube worms could appear, or sea lilys"); maybe playable later in a simpler game.
- **Open:** an empty or a full sea ("I'm still not sure").

## 9 Nov, slice 23 round 2 (the spec is rewritten from these)
- **Parts are tools, genes are body settings** ("good"). **Genes: Size and Gut first** ("1) yes, size and gut first ok");
  Pace "make[s] sense"; gut as "plant vs meat makes sense" (parts also shape diet). You asked about more: intelligence,
  speed or mobility.
- **Words:** variant < species < clade, and clade vs guild, "makes sense"; a lineage "doesn't quite fit in there and could be
  more player related".
- **Who eats whom from rules, not layers:** "2) yes". The real tree and its lines "make sense ... needs research"; the
  roster "sounds good"; sessile life as features and eocrinoids "work"; cnidarians and jellies "lateron".
- **Sea: lean b, wild branches** ("still lean a, but especially with drift the wild branches also make a lot of sense";
  "3) lean b").
- **The lineage run is unclear:** "it would be cool if you had ie a arthropod lineage that you level along the whole game,
  and when for examples spiders branch off you start a new parallel one. or some kind of character slots or something.
  right now it feels a little confusing whats mine and whats the benefit is."
- **A whole-game pass with Fable:** "bring the whole game into shape, and find a suitable fit for my original vision of
  playing lineages and evolving them and caring for a full ecosystem"; "save as much fable uage as possible".

## 10 Nov, the Fable brief ([part 1](design/fable-brief.md), [part 2](design/fable-brief-2.md))
- **Biology goes in** ("you can include the biology"): the researcher checked the real tree
  ([research](research/tree-for-the-game.md)).
- **What the Fable pass is for:** "my original vision of playing as a "build" and developing your lineages, advancing and
  discovering the tree of life, discovering things in the ecosystem, placing your species in the ecosystem to see how they
  do and interact, and try to fill new slots with a high tier, well adapted lifeform"; all branches of the tree; real
  biology; the current state against the vision; "a fresh view ... from a fresh start, or how the current approach would
  make most sense"; what makes a good-feeling game; where accuracy matters; how to set up all systems; "what the gameplay
  should actually be like (decisions/menus only, a minigame like currently, something skill/knowledge based...?)".
- **Fable designs from the tastes first:** "it should also give fable a strong reason to think up a game concept from
  only my tastes before seeing whats already there." The brief is split in two; Part A is written before part 2 is read.
- **Opus's reading stays in** ("keep §9 in, most points seem to match my taste"), trimmed where it steered.
- **The activity matters:** "the minigame or activity aspect is also important to me"; "what kinds of minigames could
  there be?" (in the ask).
- **The Fable pass, three calls (10 Nov):** written up in [whole-game.md](design/whole-game.md) §12 and the
  [build brief](design/whole-game-build.md) §1.
  - **Rebuild the core in a fresh folder:** "yes sounds good"; "i agree to restart in a fresh folder". New records,
    sea and screens; the Life engine and what play tuned are ported. Step 7 is re-cut (roadmap edit pending).
  - **Only opened lineages live in the sea** (wild branches of your own species fill open slots): "call sounds good,
    thin early is okay if there are fast unlocks, earlygame needs good onboarding and early experience anyways".
  - **The body just grows; Enforce replaces part picks at each moult:** "sounds good"; "your proposal with the
    enforcement sounds great"; keep "boosting food early in life and egg production later" as decisions.
  - **Open, the user's to call:** start at the worm with a trunk below it (build brief §2), the sea's new structure
    (§3), the look contract (§5), itch timing (§9: closed test after N4, public alpha about 15 sessions in).

## 10 Nov, the first build session (build brief §0; picks from three questions)
- **The roadmap is re-cut** ("Apply as shown"): steps 7–10 make way for the build brief's §8 route, numbered 7–17
  (N0 … R10, R11). Slice 23 is re-cut: its parts land in N4, R5, R7 and R8.
- **The fresh folder is `clade/`** ("clade/"), with the proposed `CLAUDE.md` wording: the build brief and
  whole-game.md win over full-version.md; `game/` is frozen until the play test after N4, then archived;
  `npm run check` covers `clade/` only from N0 (`npm run check:game` for the old game).
- **The four open sections are decided** ("All four decided"): build brief §2 (start at the worm, with a faded trunk to
  the first cell), §3 (the sea's ground: depth × substrate × exposure, 10–16 flood-filled habitats, area sets
  ceilings), §5 (the look contract) and §9 (a closed test after N4, the public alpha after step A).

## 10 Nov, after the N0 play (step 7)
- **N0 passes the play question** ("looks good, i can tell them apart"); a sea that partly reads as a ring is fine.
- **The build's departures are accepted for now:** ~30 ms ground + finder ("not important"), the finder's cuts and
  merges, mixed habitats, deep scraps that belong to no habitat. Re-splitting large or mixed habitats, a habitat for
  the leftover water and the phone fix are parked in `docs/ideas.md`.
- **Exposure stays as the plan has it** ("i would prefer sticking to the plan"): it classes and names habitats and
  shapes tide flats; no rule reads it in N1. The AI's proposal (sheltered → mats, open → plankton and waves) is parked.
- **Session tools point at the rebuild:** `/spec` reads the build brief, not the archived `docs/spec.md`; `/handoff`
  and `CLAUDE.md` likewise ("fix /spec and commit").

## 10 Nov, the N1 spec (step 8)
- **Populations in grams, not heads:** "grams would be a lot more realistic, 100 large animals are way more biomass
  than 1000 small ones". Stocks and populations are both biomass; heads are shown as grams ÷ body mass (N1 part D).
- **ChatGPT builds N1:** "I maybe want to do the implementation using chatgpt again, so set it up". The build brief
  sits at the end of the N1 spec; Claude reviews each session's diff.
- **Claude fixes review findings itself:** "go ahead, fix them yourself" (the N1 session-1 review). The fixes are in
  `5af0601`; the spec's part D now matches them.
- **Letters read the current food:** "current food makes most sense, i agree, tier should always reflect the current
  fit of a species" (N1 open call). A settled holder reads C at home; the card's intake line shows the food left.
- **Codex builds N1 session 2 (E–G):** "i want to do implementation in codex". Claude reviews the diff after.

## 11 Nov, the N1 review (step 8)
- **Letters rank the build, at full food** (reverses 10 Nov's "letters read the current food"): "letters ranking the
  build is definetley what i want … leters should always classify the build itself and how it fits in the
  meta/habitat/ecosystem". Why: every settled holder grazes to its break-even, so a current-food letter read C for all
  of them. The ladder starts D at break-even, ×1.5 per letter; F can't live there. D lives thinly and is easily
  replaced; a higher letter always wins its slot. Growth and spread still read today's food: a newcomer moves only
  where it would grow. The card names the food left. Hunters enter later as the survival term (N4).
- **Grams ×10:** "scaling grams works, but maybe not 100x? maybe start with around 10x." Founders stay 20 heads.
- **Rivals** becomes the tentacle worm against the bare worm; the arthropod's edge comes later (N4's armour).
- **Gut gland unchanged** ("changes later"); **sea dynamics wait** for N4 ("wait for dynamics from future steps
  first"); **few new tests.**
- **Eggs to founders:** each egg stands for a fixed brood of heads ("makes sense"); r vs K parked in `ideas.md`.
- **The sea uses the adult (full-grown) size** for now; growth stages in populations parked.
- **N2:** the Life is ported by bins (copy the board as is, write the joints fresh from the brief, drop the rest);
  the three coherence points (the board samples the sea, Enforce as payback, the economy in its own module);
  purpose is Colonise only; **Codex builds N2**; no Fable consult before N4 ("i lean port for now").

## 11 Nov, the N2 spec (step 9)
- **N1 merged:** "commit n1 fixes and merge". Fixes committed on `n1-the-core`, merged into `main`; N2 on `n2-the-life`.
- **The hunter on N2 boards:** "no hunter till n4 is fine, if shadow from deep is cheap add it". The ported hunter
  stays as an unnamed shadow from deep water, behind a data flag; N4 replaces it with the sea's hunters.
- **Numbers:** 2 heads per egg; Enforce costs 3, 5, 7, 9, 11 food per Life; a part's cap is 1 + its line rank ("ok").
- **Parts switch on in family order** (feed, move, sense, guard, brood), derived from the build: "family order from
  build sounds good, would be cool to be able to customize eventually". Claude's advice: wait, since nothing could set
  a custom order before hatching (N3) or genes (R5), and an optional field later costs no more. Parked in `ideas.md`.

## 11 Nov, the N2 Session 1 review
- **Boards are generated from the habitat, not templates:** "generator sounds good, with ground from bottom type and
  food from stocks, with included direction from neighbors". A board is "just a closeup of one small patch within the
  habitat", so there is creative freedom: "maps should stay playable and a little mixed". The board event comes from
  depth and bottom type ("sounds great"). Claude builds it in Session 1 ("you can build it now").
- **Fit:** "its fine if there isn't enough food for a specific species in a habitat that doesn't support the main
  playstyle"; a digger that doesn't fit can switch to mats. The board must agree with the sea's tier.

## 11 Nov, the N2 Session 2 review
- **No early itch page:** "skip itch early feedback, stay at itch after n4". The closed test stays at roadmap step 12.
- **The Lay price rises per lay:** 4, 6, 8, … food within a Life (`LAY_STEP = 2`); "with part that reduces it later"
  (parked). The scripted Lives fall from 86 and 60 eggs to 46 and 38; tune by feel.
- **More choice in the Life: keep the plan** (option A: N3's mutation event and clutch cards bring choice). An
  equipping moment in the Life ("maybe c lateron") and bigger stock bars ("with ui rehaul") are parked in `ideas.md`.
- **Fewer tokens:** "i want to test most things, instead of using heavy simulations and tests, also fewer
  screenshots". Steps skip the separate review round unless the check fails or play feels off; one phone-size look
  run per step (full sheets only for the play test); no scripted strategy comparisons; specs about 60 lines.

## 11 Nov, the N3 spec (step 10)
- **The mutation event is pick one of three:** once per Life, at size 3, three parts for empty places or pass; eggs
  laid after it carry it as a sure clutch card (the parked equipping moment, pulled into N3).
- **A level gives a point to spend** on one part's rank (−1 upkeep, +1 Enforce cap); "later this should become like an
  evolution tree, maybe with verbs, special abilities or part upgrades possible" (parked in `ideas.md`).
- **Codex builds N3**, "but the limit is very low, set it up so there is a lot of breakpoints so you can pick up if its
  over": one commit and one status line per part, A to I.

## 12 Nov, the N3 play and the N4 spec
- **N3 played:** "everything is looking solid and ui is nice", "nothing major is wrong"; but "the runs themselves are a
  little boring" and "I don't feel a lot of decisions in the runs, and in between yet"; still missing "the equipment
  and rpg character, and more animals"; "more action going on on the habitat map". N2 and N3 merged to `main`, ticked.
- **N4 adds living paint and a return replay on the map** ("1 yes"): three sessions instead of two.
  [Spec](slices/n4-who-eats-whom.md).
- **Fable after the N4 play test, as the brief plans** ("3 after n4, write the brief"): a maths pass on the living sea
  (and the land later), a fresh take on a tile sim, organism generation and drawing, genetics, skill and evolution
  trees and their balance, minigames from maths toys, zoom levels. [Brief](design/fable-brief-3.md).
- **Hunters don't graze, for now** (12 Nov, after N4 A: "hunters not grazing is fine for now, later maybe dual builds
  could exist"). A hunting tool commits the build to prey.
- **No shadow from the deep any more** (12 Nov, after N4 E: "there should only be hunters now if there are hunters in
  the habitat"; asked, "hunters only"). A board has a predator only when a sea hunter that can eat you lives there;
  boards without one have none. `BOARD.shadow` keeps the old shadow behind a flag, off.
- **Brace doesn't stop a hunter that gets past armour** ("brace shouldn't block a hunter who can get past armour").
- **Adopt stays until the play test** ("I don't like adopt i think but I'll wait for the playtest").

## 12 Nov, the N4 play (short)
- **Verdict:** "core there but no game" fits. Notes in [playtests/n4-who-eats-whom.md](playtests/n4-who-eats-whom.md).
- **No direction fixed before the Fable pass:** "don't fix these decisions until the fable session". The Fable pass
  (brief 3) now also judges the N4 notes, P51 (one line, one ladder) and the other open proposals, and "has freedom to
  think a little outside the box and find what would actually fit best".
