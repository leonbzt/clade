# The feeling of diverse evolution (3 Nov)

AI analysis after playtest 01, for slice 1 of part 2 (genes → stats, decided 3 Nov). Sources:
[research/diverse-evolution-games.md](../research/diverse-evolution-games.md), [research/real-evolution.md](../research/real-evolution.md),
`src/data/niches.ts`, `src/data/genes.ts`. Everything below is a *proposal* unless marked decided.

## 1. What other games teach (short)
Felt diversity comes from eight things (the research synthesis):
1. **A trait changes a rule or a verb**, not just a +% (Thrive's flagellum, Plague Inc's fungus that needs spores).
2. **Every gain costs something** from one shared budget (Thrive's mutation points, Niche's fertility trade, Evolution's
   body size vs food).
3. **Fitness is relational:** counters and pressure (predators, the cure, The Sapling's food sources that evolve
   defences and reopen niches).
4. **A few named synergies** players can say out loud (Fat tissue + Carnivore).
5. **Rule-changing archetypes at the root** (Plague Inc's disease types). Clade has these: moss, herb, tree.
6. **The body visibly changes with function** (Ecosystem's swimmers).
7. **A readable lineage record:** trees, reports, named bloodlines.
8. **Heritage carries over**, so each run is a step (Niche's gene pool).

The pitfalls: traits that don't bind (Species: "legs don't improve speed"), randomness with no legible cause, one
dominant generalist, an unlock tree mistaken for divergence (Equilinox), too many factors to read.

## 2. Clade today, measured against that (blunt)
| # | Mechanism | Clade M1 | Verdict |
| --- | --- | --- | --- |
| 1 | Genes change rules | All 8 genes are shape numbers; nothing changes a rule | Missing |
| 2 | Gains cost | Genes cost nothing; a high pip is just better or neutral | **Missing: the root cause** |
| 3 | Relational fitness | Natives have fixed scores; nothing counters anything | Missing (fine for M1) |
| 4 | Named synergies | None | Missing |
| 5 | Archetypes | Moss, herb, tree | **Have it** |
| 6 | Body shows function | The body comes mostly from picks, not genes, so genes barely show | Weak |
| 7 | Lineage record | The clade tree is plain names; the map colours are unreadable | Weak |
| 8 | Heritage | The heir carries the genes; the gain over the parent isn't shown | Half |

The scoring makes it worse. A niche scores a weighted **sum** of stats, Growth counts in all 8 niches and Reach in 5,
and no niche *forbids* anything (only two have a negative weight). So a big, fast plant that's good at everything
fits everywhere: one generalist, pitfall 3. Diversity can't come from more genes alone. Real evolution (research)
says the same thing: lines diverge only when **places want opposite things** and a gene that helps everywhere
sweeps.

## 3. The plan (lean), as rules for slice 1
1. **One shared pip budget** (mechanism 2). The genome has a fixed total of pips. A mutation moves pips from one
   gene to another, so every gain is a loss somewhere. The budget grows by one pip with each new tier reached, and
   that is the fast climb: each run has more to spend *and* spends it better. A brood seed moves 1 pip; one seed in
   three is a **sport** that moves 3 (a big, visible step; the "rare gene" sprouts already do this).
2. **Niche conditions are gates, not weights** (the anti-generalist rule). Each niche keeps its stat weights and
   gets one condition: heat at the vents, drought on the lava and bare ash, shade in the forest, waterlogging in
   the wet. A tolerance below the need multiplies the score down hard (e.g. ×0.5). The conditions oppose each
   other: Metabolism helps in the wet and hurts in drought and shade. **Model test:** no genome scores B in more
   than 3 of the 8 niches (cheap, runs in ms; it guards diversity like a budget).
3. **Three or four genes change a rule** (mechanism 1), the rest are numbers. Candidates: **Wood** (the body
   carries over winter; how a tree is born), **Runners** (new stand members sprout from stolons: the stand's
   clonal verb), **Heat** (roots may enter vent cells), **Drought** (goes dormant in a dry spell instead of
   losing leaves). Each verb costs code in the run, so no more than four.
4. **Drop genes nothing tests.** P38 listed Defence, but M1 has no grazers, so Defence would be a non-binding
   trait (pitfall 1). Swap it for **Shade** tolerance: the forest niches and the stand's own shading test it.
   Angle and Dive go: dragged roots replace Dive (your "more root control"), and Dominance sets the angle.
   A 10-gene sketch: *shape*: Stem, Branching, Dominance, Leaf, Roots; *chemistry*: Metabolism, Wood, Drought,
   Heat, Shade.
5. **Named forms as labels** (mechanism 4, cheap version). A few gene patterns get a name when a species reaches
   them: *Succulent* (Drought high, Metabolism low), *Pioneer* (Metabolism high, Heat), *Cushion* (moss, Stem low,
   Branching high), *Understory* (Shade high, Leaf high). Labels only, no bonus, so no extra balance work; they
   name your lineages in the tier list and the clade tree ("Succulent ash moss").
6. **Show the divergence** (mechanisms 6–8). Chemistry genes tint the body and the map colour (Wood browns, Drought
   greys, Metabolism brightens, Heat reddens), so related lines look related and divergent lines look apart. That
   folds into the map pass. The heir pick shows each seed beside its parent, with what changed; the release shows
   the gain (decided). The clade tree draws each species as a small silhouette.

Parked (not M1): counters and grazers (mechanism 3), named combos with bonuses, the garden pushing related
species apart (character displacement).

## 4. Risks
- **Too many factors** (pitfall 5): 10 genes, 6 stats, 8 conditions. Mitigation: one condition per niche, shown as
  an icon on the row, and the label names the strategy so you don't have to read pips.
- **Gates can feel like walls:** if a tolerance is too binary, a niche reads as locked. Use a smooth ramp, not a cliff.
- **A fixed budget can feel like no progress:** that's why the budget grows with tiers, and why the release shows
  the gain over the parent.
