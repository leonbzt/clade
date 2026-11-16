# Builds: the axes of plant life, and a build system (3 Nov)

AI analysis after your call on builds (decisions.md, 3 Nov: "a build like levelling a pure OSRS character or a Dark
Souls build", a shared budget, pressure and armour, a skill tree per clade). Biology from general knowledge of plant
functional ecology (Grime's CSR, Westoby's LHS scheme, the leaf economics spectrum, Wright et al. 2004); verify
before quoting. Everything here is a *proposal* unless marked decided.

## 1. What sets plants apart in their niches
Ecologists sort plants along a dozen axes. Each one is a **trade-off**: no plant wins at both ends, and that is
why there are many plants instead of one.

| # | Axis | The two ends (real examples) | What it costs | The pressure it answers |
| --- | --- | --- | --- | --- |
| 1 | **Pace** | Fast: thin cheap leaves, high photosynthesis, short life (weeds) ↔ Slow: thick tough long-lived leaves (heather, pine) | Fast is fragile, thirsty, hungry; slow loses in rich ground | Rich and wet favour fast; poor and harsh favour slow |
| 2 | **Stature** | Low mat ↔ tall | Height needs wood, time and water; wind throws it | Shade from neighbours: the race for light |
| 3 | **Light** | Sun leaves ↔ shade leaves (low break-even light: ferns, forest floor) | Shade plants grow slowly in sun | Shade under a canopy |
| 4 | **Water** | Spender (open pores, fast) ↔ saver (wax, succulence, CAM night breathing: cacti, stonecrop) | Saving water stalls growth | Drought, dry ash, lava |
| 5 | **Roots** | Shallow and wide (grasses) ↔ deep taproot; alone ↔ with partners (fungi trade phosphorus, nodules fix nitrogen) | Roots and partners cost sugar | Drought, poor soil, wind |
| 6 | **Toughness** | Soft ↔ hard (dense wood, lignin, silica, bark) | Slow and costly to build | Wind, trampling, fire (bark), some grazing |
| 7 | **Defence** | Thorns, hairs, toxins (always on, or only when bitten) ↔ tolerance (regrow from the base: grasses) ↔ escape (too tall, too early) | Defence costs growth (the growth–defence trade-off) | Grazers |
| 8 | **Resistances** | Heat, frost, salt, flooding (air channels in roots), toxic soil (sulphur, metals), fire | Each is a specific cost, useless elsewhere | One per place: vents, wet, coast, lava |
| 9 | **Offspring** | Many small seeds that travel far ↔ few big seeds whose seedlings survive shade; a seed bank that waits | Small seeds die in shade; big seeds are few | Disturbance and new ground ↔ crowded ground |
| 10 | **Spread** | Seed ↔ clone (runners, rhizomes hold ground) | Clones don't travel; seeds don't hold | Holding a patch ↔ reaching a new one |
| 11 | **Life history** | Annual: live fast, seed, die ↔ perennial: hold on for years; early ↔ late in the season | Annuals lose ground; perennials pay upkeep all year | Disturbance ↔ stable ground |
| 12 | **Neighbours** | Compete ↔ help (nurse plants) ↔ exploit (climbers borrow height, parasites borrow sugar, allelopathy poisons the soil: walnut) | Climbers and parasites need a host | Crowding |

**The summary ecologists use: Grime's CSR triangle.** Every plant sits between three pure strategies:
- **Competitor** (rich, stable ground): tall, fast, big leaves; takes the light.
- **Stress-tolerator** (poor or harsh ground): slow, tough, saving; outlasts.
- **Ruderal** (disturbed ground): small, short-lived, many seeds; gets there first.

The corners are the **pures** (OSRS-style), the edges are hybrids. Axes 1–11 are mostly ways to move inside that
triangle; axis 12 and the resistances are specialisations on top.

**What today's 8 genes cover:** only shape (axes 2, 5 and part of 6). Pace, Light, Water, Defence, Resistances,
Offspring, Spread and Life history (the axes that make plants *different*) are missing. That's why the genes "don't
sound right": they describe how a plant looks, not how it lives.

## 2. The build system: three layers, like Dark Souls
| Dark Souls | Clade | Biology |
| --- | --- | --- |
| Attributes, levelled with souls, allocated | **Attributes** (the bars you stack): ~6 trade-off axes | Quantitative traits, many small genes |
| Gear and spells with stat requirements | **Traits**: a skill tree per form, each node a rule change, locked behind attribute thresholds | Key innovations (wood, seeds, runners, CAM) |
| Damage types and resistances | **Pressures** per niche (drought, heat, shade, grazing, frost, flooding) and the resistances that answer them | Selection |
| Bosses | Each niche's holder (the natives) | Incumbents |

**Anti-all-round, three locks:**
1. **Upkeep grows with the genome.** Every attribute point costs upkeep. A big all-rounder starves in poor ground,
   so poor niches only fit lean, low-level specialists: the OSRS pure, and biologically true (costly tissue
   doesn't pay on lava).
2. **Pressures deal damage.** A niche's pressure takes biomass each tick; resistance is the armour. Below a
   threshold the plant can't hold the niche at all: the locked reward.
3. **Tree paths exclude.** At branch points you take one side (water saver *or* water spender).

**A sketch of 6 attributes** (each can be stacked; the cost is upkeep and the points you didn't spend elsewhere):
Pace, Stature, Endurance (water and heat), Shade, Roots, Toughness. The run's shape genes (internode, angle…)
become the body's *look* within the form, not build choices. *Open:* whether Offspring/Spread is an attribute or a
tree branch.

**A sketch of a tree** (moss, for M1): a root node, three branches toward C, S and R. S: *Desiccation sleep* (goes
dormant in drought, needs Endurance 5) → *Crust* (holds on lava) → *Sulphur grip* (enters vents). R: *Spore cloud*
(spreads far in the garden) → *Pioneer* (first on new ground). C: *Cushion* (stacks tall) → *Turf* (shades out
other mats). Named forms (Succulent, Pioneer…) are nodes, as you said.

## 3. Where the points come from (the key open call)
- **(a) Free allocation** (Dark Souls): you place every point. Most control; feels like a character editor,
  less like evolution.
- **(b) Selected variation**: each level shows 3 seeds, each with a different point or trait; you pick. Evolution's
  texture (variation, then selection), but you can't plan a build exactly.
- **(c) Both** (lean): **attributes** come through the brood (b), with one seed in three a sport; **tree nodes** are
  bought (a), with biomass or a point per new tier. The tree gives the planned path, the brood the surprise.

Levels themselves: one per season survived in a run, plus a lineage's level carries over (heritage). Buying upgrades
with biomass fits the tree.

## 4. Scope (rule 2)
This rewrites spec §3. A lean M1 version: 6 attributes, one pressure per niche, a small tree per form (~6 nodes,
two exclusive branches). Parked for M2 unless you call it: grazers, a full C/S/R tree, chromosome duplication
(a new bar to stack, like polyploidy).

## 5. Generalising (after your call, 3 Nov)
**Decided 3 Nov:** the three layers, (c) for the points, the three locks, the lean M1 version. The rest is a proposal.

**The rule: attributes are general numbers; the tree makes them specific.** Dark Souls does the same: one general
defence stat, and the elemental resistances come from gear. So:
- **Endurance** = general armour against weather (drought, heat, frost, flooding). Tree nodes add the specific
  resistances (*Desiccation sleep*, *Sulphur grip*), so niches still differ.
- **Defence** = general armour against bodies (grazers, trampling, wind); it absorbs Toughness (dense tissue, bark).
  Tree nodes pick the kind: thorns, toxins, or regrowing from the base.
- **Health** = reserves: the pool that pressures damage, and the regrowth after it (tubers, thick stems, winter).
- **Spread** = Offspring + Spread: how much new ground the species takes in the garden and how many stand members
  sprout in the run. Tree nodes pick the mode: far seeds, near clones (runners), a spore cloud, a seed bank.
- **Neighbours** isn't a number but a set of strategies: climb, parasitise, nurse, poison the soil. They are tree
  nodes (rule changes), not an attribute.

**8 attributes, by CSR corner:**
| Compete (C) | Endure (S) | Spread (R) |
| --- | --- | --- |
| Stature, Roots | Shade, Endurance, Defence, Health | Pace, Spread |

A species' CSR position is the share of its points per corner, normalised by the corner's size. It is drawn as a dot
in a triangle, which is its identity on the tier list and the clade tree.

**The body's look comes from the attributes**, not from separate shape genes: Stature sets internode and height,
Pace sets leaf size and thinness, Defence sets thickness and colour, Shade sets leaf breadth, Roots sets root share.
So 8 attributes are the whole genome (budget: 10), and the genes drive the looks. The run's offers still bend the
body, and the 6 stats are still measured from it (the slice spec sets which 6).
