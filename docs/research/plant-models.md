# Plant-modelling projects and growth forms (research, 3 Nov 2026)

## Summary
- PlantGL (C++/Python, CeCILL-C) and VirtualPlantLab (Julia, MIT) are research toolkits for 3D virtual plants. Neither runs in a browser; only ideas transfer.
- PlantStudio-js is TypeScript and runs in a browser, but is AGPL: reading it is fine, copying code would force Clade open under AGPL. Treat as ideas only unless the user decides otherwise.
- Common core of FSPM practice: a plant is a graph/string of repeated units (phytomers/organs) made by meristems; resources and light feed organ growth.
- Growth forms differ less in rules than in where the buds live, what survives the bad season, and how water/carbon come in (Raunkiær: bud position in the unfavourable season).
- Gaps: I could not read PlantStudio's parameter docs (nothing in the README), nor the VPL paper body (bioRxiv rate-limited), so their internals are only partly sourced.

## The three projects
- **PlantGL** — C++ core with Python bindings (`openalea.plantgl`), geometry library + viewer; builds plant architectures from field measurements or procedural algorithms; Linux/Windows via conda. No browser/WebGL mention. License badge: CeCILL-C (an LGPL-like French licence; I only saw the badge, the LICENSE URL 404'd). https://github.com/openalea/plantgl
  - L-system layer is the sister package L-Py ("L-systems + Python"), also CeCILL-C per the Anaconda listing; MTG is the shared plant-architecture data structure. https://lpy.readthedocs.io/en/latest/ · https://anaconda.org/openalea/repo?page=2&type=conda
- **VirtualPlantLab (VPL)** — GitHub org of Julia packages (PlantGraphs, PlantGeomTurtle, PlantRayTracer, SkyDomes, Ecophys, PlantSimEngine ...), repos marked MIT. Plants are dynamic graphs turned into meshes by a turtle; light by ray tracing on the meshes. https://github.com/VirtualPlantLab · https://github.com/VirtualPlantLab/VirtualPlantLab.jl
  - Model (Morales et al. 2025, in silico Plants): plant topology = directed acyclic graph; node = organ or separator, holds user-defined data; a rule replaces matched nodes with a node, a subgraph or nothing (deleting the node and everything downstream); all rules match first, then apply, so rules are unordered and all run each step. https://hal.inrae.fr/hal-05067022v1 (bioRxiv: https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full.pdf)
  - Julia: not usable in a browser TS game. MIT means code could be borrowed, but nothing here is portable.
- **PlantStudio-js** — in-progress TypeScript web port of PlantStudio (Delphi, ~1997) by Paul Fernhout and Cynthia Kurtz; playable for creating and breeding plants; export and 3D-object editing unfinished. README says AGPL (the old Delphi repo says GPL v3+). Philosophy: hand-built, understandable models plus UIs to vary and select. https://github.com/pdfernhout/plantstudio-js · https://github.com/pdfernhout/PlantStudio
  - Mechanics: a "Plant Wizard" then per-parameter editing (e.g. internode length), an age control that animates growth, and a breeding tool where parameters pass on and become dominant across generations. Source: Illinois State Museum lesson https://www.museum.state.il.us/ismdepts/botany/herbarium/pdfs/DrawingPlantswithPlantStudioFreeware.pdf. Reviews call it a simulator of herbaceous plants over their life cycle (secondary, see https://pketh.org/plantstudio.html). Internal parameter list: not found.
  - Runs in the browser with the same stack family as Clade, but AGPL, so ideas only.

## Ideas we could borrow
- **Rewriting rules as a growth step** (VPL, L-Py): one rule set, all matched nodes rewritten at once each tick; "replace with nothing" = prune a branch and everything beyond it. Maps to Clade's segment tree.
- **Node = organ with its own data** (VPL): a segment carries mass, light, age; stats are sums over nodes.
- **Age slider/playback** (PlantStudio): scrub a plant's growth to preview a genome; useful for the tier list.
- **Parameter breeding with dominance** (PlantStudio): parent genes pass on with dominant/recessive behaviour; matches the ≤10-gene genome.
- **Light by interception** (VPL ray tracer): in 2D a cheap version is per-segment shading by segments above it.

## How growth forms differ in models
Common FSPM frame: meristems create new organs, which act as carbon sources or sinks; organ expansion from incoming biomass drives growth; structure and allocation interact (Vos et al. 2010, via https://hal.inrae.fr/hal-02650874). Shoots are built from phytomers formed in sequence by an apical meristem (same source family). Raunkiær sorts by where renewal buds sit in the bad season: phanerophytes (high, trees/shrubs), chamaephytes (low), hemicryptophytes (at soil surface), cryptophytes (below ground/water), therophytes (annuals, survive as seeds). Cut-off heights disagree (25 cm, 30 cm, 50 cm by source). https://en.wikipedia.org/wiki/Raunki%C3%A6r_plant_life-form · https://www.batrachos.com/en/zhyttyevi_formy/ . Bryophytes are not in that scheme.

Five model-level differences that would change play:
1. **What persists across seasons.** Annual (therophyte): nothing but seeds; the body is reset, only the genome/seed count carries. Tree (phanerophyte): the whole woody frame and its buds persist; last season's investment is the base for the next. Moss: shoots persist and keep growing at the tips while old parts die behind; there are no resting buds in the Raunkiær sense.
2. **Time scale and growth mode.** Annual: one fast determinate phytomer sequence ending in flowering. Tree: indeterminate, many seasons, branching grows exponentially in node count and is limited by light competition. Moss: very slow per-shoot rate, but clonal spread (many short shoots) rather than height.
3. **How resources are gathered.** Moss: poikilohydric, takes up water and nutrients over the whole shoot surface from rain, mist and dust, no roots (rhizoids anchor, general knowledge), tolerates drying and rehydrates; so it is active only when wet and idles, not dies, when dry. https://u.osu.edu/slateplantecology/?p=6 · https://sicb.org/?p=32276 . Herb and tree: roots plus leaves; tree reaches deeper water and higher light but pays a standing maintenance cost for wood.
4. **Secondary growth (tree only, general knowledge, not sourced here).** Stem thickening lets old nodes carry more load and transport, so height is limited by mechanical support, not by phytomer count. Cheap model: node radius grows each season, support capacity = f(radius), height costs mass.
5. **What pruning means.** Tree/shrub: removing a node deletes its subtree (VPL "replace with nothing") and lateral buds can re-sprout, so pruning reshapes and may boost the rest. Annual: pruning loses the whole yield; only harvest/seed timing matters. Moss: fragments regrow, so "pruning" is spreading (clonal), not loss.

## Ideas for Clade
- **idea**: Give each form a different "carry-over" at season end: herb = seeds only, tree = surviving woody frame plus buds, moss = surviving tips; one rule, three play loops.
- **idea**: Model water as moss "active/dormant" toggling (poikilohydric idling) instead of death, so mosses suit dry or erratic habitats and fit offline idle.
- **idea**: Make pruning a node-subtree delete with bud re-sprout for woody forms only, and secondary growth as per-season radius that caps height.
