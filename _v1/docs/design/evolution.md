# Evolution and the tree of life (1 Nov)

From the 1 Nov chat: how species, genes and the tree work today, how real evolution works, where they differ, and
the plan. **An AI analysis and plan built on your calls.** Your calls are in [decisions.md](../decisions.md)
(1 Nov, the evolution route); open parts are P35 in [proposals.md](../proposals.md).

## 0. Your calls (1 Nov)
- **Route B early, into route C with genome v2.** Runs make species now (12a/12b); the full evolution route comes
  with genome v2 (M4). *Decided.*
- ~~**Coming home: merge back if it didn't diverge enough.**~~ *Reversed 2 Nov: no merge back; runs aim at a home
  target slot; new species start fresh (decisions.md).*
- **Stem doors: "I want a connected tree."** New clades open only from their parent group's line. *Decided*; when
  (now or after M1) is open.
- **New clades through runs**, the way proposed in §4. *Decided.*
- **The feeling to aim for: discovering life yourself.** §5 is the AI answer to "what's authored, what's free".
- **P35 (1 Nov, later):** stem doors and P34 b now (built: 11e part D); §5's rule "author the laws, not the
  history": yes; recipes hinted and revealed step by step (route C). Order as in §7.

## 1. How it works today (code on `slice-11e`)

**Genes** (`src/data/genes.ts`): three layers, plus on/off traits.
- **Axes:** plants have four (Dry/Wet, Shade/Sun, Lean/Rich, Wind/Tight), animals two (Dry/Wet, Picky/Broad).
  Steps −4…+4; a step moves a need band and costs a stat (Dry: lives drier, grows 8% slower). Past ±2 from the
  species' base a step takes with odds 0.3 per extra step, and past ±2 from the clade's original genes also × 0.5.
- **Trait genes:** 2–4 on/off genes per species (rhizoids, bitter, gemma cups…), each with an up and a down.
  10% of mutations flip one.
- **Combos:** three pairs of axis steps with an extra effect (Crust, Cave, Ash).
- **Keys:** five authored recipes of two precursors each: Oily → liverworts (Wet + Tight), Leafy → mosses (Dry +
  Wind), Upright → vascular (rhizoids + Dry), Bare → slugs, Insect → insects. A key is close to neutral; the payoff
  is the new clade's template (another stratum, other stats).

**Variants** (`src/sim/variants.ts`): a genome inside a species. 3% of new settlers of a shown variant mutate.
Mutants are hidden until 5 tiles; at most 4 are shown per species and 8 hidden; the smallest is swamped into the
biggest. Variants compete by fit like species, so this is real **mutation + selection + drift** on a map. Rarity
is the distance from the species' own base (Rare: 3–4 steps or a combo; Legendary: a key).

**How species get in:**

| Way | Who | Real? |
| --- | --- | --- |
| Bought from a tree node | cyano (free), early land plants, fungi, lichens, ferns | No: from nowhere |
| Arrival (adopted) | springtails, snails, beetles | Yes: colonisation |
| Door: a key rolls in a variant with the recipe (a nudge after 2 min with none), you split it off | liverworts, mosses, club mosses, slugs, bristletails | Partly |
| Split: you found a Rare+ variant as a species (its tiles move) | "Dry Moss II" | No; goes at 12b (no split-and-place, 1 Nov) |

5 of 8 plants and 3 of 5 animals don't descend from anything you had. Only doors and splits draw a parent line:
**the tree is mostly a tech tree with twigs.**

**The tree** (`src/data/tree.ts`): an authored backbone. Life → cyanobacteria · land plants → liverworts, mosses,
vascular → ferns · fungi → lichens · animals → hexapods → insects, beetles · snails → slugs. Species you make hang
under it with a parent and the form they grew from.

**Runs** (12a/12b, planned): the line alone on a young island; mutation and keys as at home; a brood of three a
season (Steady, Cross, Wild); a key on the run becomes the line's form; the leading variant comes home (12b).

**Sim check** (2 seeds, 40 min): every door opens on time (Oily ~6 min, Leafy ~7, Upright ~18–21). Early land
plants survive at home (440–580 tiles). **No combo shown on either seed; no form beyond ±2 anywhere.** Home
evolution is one or two steps per species, then the next door.

**Problems found**
1. **Most species descend from nothing** (bought or arrived).
2. **The ladder:** doors open from sister groups (liverwort → moss, moss → club moss, springtail → bristletail).
   With keys keeping the precursor genome and Dry winning almost everywhere, each clade is a waiting room for the
   next (P34: ~90% of moss is Dry, 43–49% carries the whole Upright recipe).
3. **One direction wins everywhere:** no divergence, so no branches.
4. **Species are made by a click** (split) or a key, not by isolation.
5. **Thin at home:** combos and extremes never show up; sister species share a template and differ only in four
   axis positions.
6. **Two data errors:** beetles sit beside insects (beetles *are* insects); bristletails evolve from springtails
   (cousins, not ancestor and descendant).

## 2. How real evolution works
- **Variation:** mutations are random, mostly tiny or neutral. Sex reshuffles existing genes every generation; most
  new combinations come from that. Traits like drought tolerance are many genes of small effect: an axis is a fair
  summary (a step moves the trait's mean). Trait genes are like single big-effect genes.
- **Selection is local and relative:** what wins on dry lava loses at a wet vent. A gene that helps everywhere
  sweeps (a selective sweep). Divergence needs places that want different things (divergent selection).
- **Drift:** chance, strong in small populations. A handful of founders carries a random sample of the genes and can
  cross "valleys" in fitness that a big population can't (the founder effect).
- **Gene flow** blends populations and works against divergence.
- **A new species needs gene flow to stop.** The main way is geography (allopatric speciation); the textbook case is
  a few founders on an island (peripatric). Darwin's finches: about 15 species from one ancestor. Hawaii's
  silverswords: about 30 from one Californian tarweed. Plants also make species in one step by doubling their genome
  (polyploidy: ~31% of fern and ~15% of flowering-plant speciations; Wood et al. 2009). Hybrids can found species.
- **Meeting again (secondary contact):** if they diverged far enough, both persist and compete, and often push each
  other further apart (character displacement: on Daphne Major the medium ground finch's beak shrank in the
  2004–05 drought after the large ground finch moved in; Grant & Grant 2006). If not, they hybridise and merge back.
- **Chain and tree are both real:** one line changing over time (anagenesis) and lines splitting (cladogenesis).
- **It's a tree, not a ladder.** Modern mosses never became club mosses; both descend from an extinct plant that was
  neither. Every living group is equally modern. The first vascular plants (Cooksonia, ~430 million years ago) were
  a few centimetres tall and leafless: a cousin of mosses plus one feature. **A big group gets its name in
  hindsight**, once its branch has radiated.
- **Key innovations** open a new way of life, and a burst of species follows (adaptive radiation). They build on
  older features that evolved for something else (exaptation): **your precursors are exactly that.**
- **Convergence:** the same answer evolves many times (slugs lost the shell in several unrelated lines).
- **Extinction:** over 99% of all species ever are gone. Pruning shapes the tree as much as branching.
- **Islands:** a young volcanic island gets almost all its groups by arrival (spores on the wind, snails on logs),
  then the arrivals radiate into local species. In Hawaii lineages hop from older islands to younger ones, and their
  family trees follow the island ages (the progression rule). **That is Clade's loop:** an old home island, runs to
  young ones.
- **Time:** a species takes thousands to millions of years; a big new group, tens of millions.

## 3. Game vs real

| Real | Clade today | Verdict |
| --- | --- | --- |
| Many genes of small effect | 4 axes, a few traits | Keep: readable |
| Sex mixes genes every generation | Variants are clones; only the Cross card mixes | Keep: Cross is the recombination |
| Selection differs by place | Dry wins almost everywhere | **Fix:** no divergence, no branches |
| Species form when gene flow stops | A click or a key | **Fix:** runs are the isolation (§4) |
| Branches from extinct stems | Modern groups turn into each other | **Fix:** stem doors (§4) |
| Groups descend or arrive | 5 of 8 plants bought | Route C (§6): descend or arrive, nothing bought |
| Groups named in hindsight | A clade is "reached" at its first species | Route C: hindsight names (§5) |
| Big steps are rare and contingent | Keys forced by a timer and a nudge | Keep: a game needs them to come |
| Deep time vs decades | Both on one island | Keep: real in *how* species form, not *how long* |

## 4. The model: runs make species (route B, decided 1 Nov)
**A run is a speciation event**, the real mechanism: a few founders, an isolated young island, a theme that pushes
one way.
- **Landing splits the line.** The parent stays home; the line on the island is already a separate population.
- **The theme is the selection.** One parent run on a dry island and again on a wet one: two sister species, a
  **fork**. Running again from the newest form: a **chain**.
- **Broods are the player's hand in it:** Steady (selection), Cross (recombination), Wild (a jump across a valley,
  as founders' drift allows).
- **A key on a run makes the line a new clade** (12a already). Island themes lean toward recipes: wet → Oily
  (Wet + Tight); dry and windy → Leafy (Dry + Wind); dry → Upright.
- **Coming home is the meeting again.** If the line diverged far enough (Rare or better from its parent, or a key),
  it is a **new species**: a branch you name, tagged with where it was born ("the dry island, run 2"). If not, it
  **merges back** as a variant of its parent; it keeps its XP and loses only the branch. *Decided 1 Nov, reversed 2 Nov.*
- **The new species then fights for a slot**, maybe against its own parent: the forecast is the honest "why".
- **Home is the garden:** variants keep drifting there. A key carrier or a Rare variant that turns up at home is a
  **find you take on a run**, and the run makes it a species. No species by hand at home (decided 1 Nov); the home
  split goes at 12b. First-run hook: a Leafy shoot at ~7 min is the founder of your first run and comes home as the
  first moss.
- **Stem doors** (decided 1 Nov): a door opens only from its parent node's line. Early land plants open liverworts,
  mosses and vascular plants; a moss stays a moss and branches into moss species. If the first lineage is the early
  land plant (12a's open fill-in), **your first character is the ancestor of all land plants.**

The loop: home variants → a founder → a run (the theme selects, broods choose, a key may fire) → home: a new species
or a merge back → a slot won or lost → the slot pays → the next run. One branch per successful run.

## 5. What's authored, what's free *(rule decided 1 Nov; details are proposals)*
**Author the laws of nature, not the history.** If the player could have caused it, it's free. If it's a law the
player can learn, it's authored, and hidden until learned.

**Authored (the laws):**
- The backbone of big groups, following the real tree; their body plans (stratum, base needs and stats).
- The gene vocabulary: axes, traits per group, combos, their trade-offs.
- Key recipes, grounded in real exaptations; odds, rates and rarity.
- Island themes and who can arrive from outside. Facts and group names.

**Free (the history):**
- Every species: its genome, parent, birthplace, name.
- The tree's shape: which line opens which door, in what order, how many species each group gets.
- Which forms and combos turn up, which lines die out or merge back, which island taught the line what.

**Discovered (authored, but hidden until you find it):**
- **Recipes:** the next ring of the tree shows a silhouette and a hint; each precursor reveals when one of your
  variants reaches it ("your Dry Thallus is on to something"). Route C. M1 keeps today's visible checklist.
- **Group names in hindsight** (route C): the key carrier is first a strange new species ("Upright Thallus"); the
  tree names the group ("Vascular plants", with its fact) when the branch proves itself, e.g. holds herb ground or
  has two species.
- **The tree shows only what has lived**, plus one ring of silhouettes. No map of the future.
- **Forms and morphs:** silhouettes in the codex (M4).

**Risk:** discovery fights readability. In playtest 08 you missed the checklist and picks felt random. Hints have to
sit where you play (the variant row, the map), and each step has to show when it lands.

**Genome v2 tie** *(proposal, M4)*: today a key swaps the line onto a template (a moss becomes the Mosses template's
stats). Instead a key adds a body-plan feature to the line's genome, so the first vascular plant from a dry thallus
keeps its history; the template gives the group's look and stratum. Then sister species really differ.

## 6. Route C with genome v2 (M4, decided 1 Nov; pieces are proposals)
1. **Nothing is bought:** everything descends or arrives. A starting set at home (your lean: algae, cyano, early land
   plants), arrivals for the rest (fungi as spores on the wind, animals as today).
2. **Stem templates where the tree needs one:** an early vascular plant (club mosses and ferns both branch from it;
   today ferns hang under club mosses), a stem hexapod (springtails and insects both branch from it). Beetles go
   under insects.
3. **Wild species at home:** drift when habitat pieces isolate a line; a headline; the new species is wild at first.
4. **Partnerships:** lichen from fungus and cyano overlapping long enough.
5. **The discovery layer** (§5): hinted recipes, hindsight names, silhouettes.
6. **Genome v2:** keys add features; stats with upkeep; forms; morphs.
7. **Extinct species stay on the tree** as ended branches.
8. Later: the archipelago with island ages (the progression rule); life coming ashore from the sea.

## 7. Work

| Piece | When | Size |
| --- | --- | --- |
| Stem doors (the `from` lists in `genes.ts`) + P34 b (Dry trades shade) | **Done 1 Nov** (11e part D) | ½ session |
| A run starts from any living species of the line, or a home variant | **Built** in 12a (another session) | Small |
| Merge back unless Rare+ from the parent or a key; the birthplace tag | 12b | Small: `distance` and `rarity` exist |
| The home split goes; home finds become run founders | 12b | Small; removes code |
| The lineage's family tree from runs | 12b | Small–medium: the tree screen draws parents |
| Route C with genome v2 | M4 | Big: 3–5 slices, ~6–10 sessions, plus balance |

**For M1: about one session left, in 12b.** P34 b's result: the trade-off is real but doesn't split the moss at home
(born Dry, and liverworts and early land plants hold the shady wet ground). The wet sister comes from runs.

**Risks**
- Stem doors moved Upright ~2 min later (19.9 and 23.4 min on 2 seeds), now from early land plants.
- **Doors on run islands:** settled in 12a's build: home's requirements count (copied at landing), no nudges on
  runs, and a door home already reached still fires on a run (the line becomes a new species of that clade).
- Route C's pacing: "fast unlocks at the start" with nothing to buy needs a good starting set and arrivals.
- The tree's feel is capped by how different sister species can be until genome v2.
