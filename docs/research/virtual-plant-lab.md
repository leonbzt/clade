# Virtual Plant Lab (VPL) and PlantGraphs.jl

Researched 2026-10-26.

## Summary
- VPL is a set of Julia packages for functional-structural plant models (FSPM). MIT licensed.
- PlantGraphs.jl is its graph rewriting core: nodes, rules, queries, `rewrite!`.
- It is a research tool for crop science. Tiny community (3-4 stars), no tagged releases on GitHub.
- Not usable in a browser game directly. Julia to WASM is still experimental.
- Worth porting as ideas, not code: organ graph, parallel rewrite rules, queries, a simple light model.
- A small TS version of the graph plus turtle plus crude light is about 3-6 days. No JS FSPM library exists.

## 1. What they are
- VPL: "a collection of Julia packages" for building and rendering FSPMs. Author: Alejandro Morales, Wageningen. [site](https://virtualplantlab.com/stable/)
- Paper: Morales et al., in silico Plants 2025, diaf005. The paper says VPL is in "constant development". [bioRxiv](https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full)
- Core packages: PlantGraphs (rewriting), PlantGeomPrimitives, PlantGeomTurtle, PlantRayTracer, PlantViz. VirtualPlantLab.jl is the meta-package. [bioRxiv](https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full)
- Graph rewriting: a plant is a directed acyclic graph of user-defined node types. A rule has a node type, an optional `lhs` match function and an `rhs` that returns a node or subgraph. No `rhs` means prune the subtree. [manual](https://virtualplantlab.com/stable/manual/Graphs/)
- Rules run in parallel. All matches are found first, then replaced. One node matched by two rules is an error. Growth comes from calling `rewrite!` repeatedly. [manual](https://virtualplantlab.com/stable/manual/Graphs/)
- Queries return matched nodes and do not change topology. They can mutate node state (for example accumulate light). [manual](https://virtualplantlab.com/stable/manual/Graphs/)
- Turtle geometry: a turtle walks the graph from the root. A user method per node type emits triangle meshes and moves the turtle. Export to PLY or OBJ. [bioRxiv](https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full)
- Ray tracer: forward Monte Carlo, multi-waveband, Lambert and Phong materials, BVH, multithreaded, Russian roulette. The text does not mention GPU. [bioRxiv](https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full), [repo](https://github.com/VirtualPlantLab/PlantRayTracer.jl)
- Ecophysiology: Ecophys.jl (photosynthesis, transpiration, energy balance, phenology), PlantBiophysics.jl, PlantSimEngine.jl (model coupling and time stepping), SkyDomes.jl. [bioRxiv](https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full)
- Licence: MIT for VirtualPlantLab.jl, PlantGraphs.jl and PlantRayTracer.jl. [VPL repo](https://github.com/VirtualPlantLab/VirtualPlantLab.jl), [PlantGraphs](https://github.com/VirtualPlantLab/PlantGraphs.jl)
- Maturity: PlantGraphs has 3 stars, 56 commits, empty Releases tab. VPL meta repo has 4 stars. Paper's own demo is a cereal-legume intercrop. Roadmap lists MTG support and faster radiation. [PlantGraphs](https://github.com/VirtualPlantLab/PlantGraphs.jl), [bioRxiv](https://www.biorxiv.org/content/10.1101/2024.09.27.615350.full)
- Not checked: last commit dates (pages did not show them).

## 2. Use it directly?
- Browser WASM: not realistic. The best option is WasmTarget.jl, announced Apr 2026, called experimental. About 176 functions verified. Julia 1.12 and 1.13. Unsupported code errors out. [Discourse](https://discourse.julialang.org/t/136901)
- An LWN piece (2025) said Julia on WASM supports only a restricted subset. VPL uses multithreading, meshes and plotting stacks that are far from that subset. [LWN](https://lwn.net/Articles/1006117)
- My judgement: even if PlantGraphs alone compiled, its dynamic dispatch on user node types would be the risk. Not confirmed by any source.
- Server: breaks "fully client-side, itch.io first". Needs hosting, a Julia runtime and cold start. Not worth it.
- Precompute: run VPL offline and ship results (meshes as OBJ/GLB, light-vs-density tables). This works, but gives fixed specimens only. Not a live plant that reacts to the player. Needs a Julia toolchain in the build.
- Verdict: use VPL offline only as a reference to check a TS port against. Do not depend on it.

## 3. Concepts worth porting (proposals, see below)
- Organ graph with typed nodes (shoot tip, stem, leaf, sporophyte) plus parallel rewrite rules. Core of PlantGraphs and simple to write.
- Rules as `match(node)` and `replace(node)` functions, with a collect-then-apply step. Avoids order bugs.
- Queries: a pass that reads or mutates node state without changing topology.
- Turtle to 2D or 3D shapes. Port as a function per node type that returns segments and advances a pose.
- Source/sink growth (carbon from leaves shared among organs). This is a standard FSPM idea, not specific to VPL; it is not in the pages read.
- Light interception: skip ray tracing. Use per-leaf shading by counting leaves above in a height-sorted list or a 1-D column (Beer-Lambert style).
- Ecophys photosynthesis curves: one light-response curve per species is enough.

## 4. Other libraries and papers
- Space colonization: Runions, Lane, Prusinkiewicz 2007, Eurographics NPH, pp. 63-70. Attractor points compete for branch tips. [paper](https://www.algorithmicbotany.org/papers/colonization.egwnp2007.html)
- JS space colonization: npm `space-colonization` v0.2.0 (marked unstable). Algorithm is about 100 lines, so write your own. [npm](https://npmjs.com/package/space-colonization), [Coding Train](https://thecodingtrain.com/challenges/17-fractal-trees-space-colonization)
- L-systems in JS: `lindenmayer` (nylki), MIT, 207 stars, parametric, context-sensitive, stochastic, function productions. Best off-the-shelf pick. [repo](https://github.com/nylki/lindenmayer)
- Procedural trees: EZ-Tree (three.js, reported MIT, npm `@dgreenheck/ez-tree`). Trees only, no growth simulation, so not a fit for mosses. [repo](https://github.com/dgreenheck/ez-tree)
- GroIMP and XL: Java, XL is "an extension of Java" implementing relational growth grammars (Kniemeyer thesis 2008). GPL (v2 per SourceForge) or commercial. Java 21 for v2.2. [SourceForge](https://sourceforge.net/p/groimp/), [thesis](https://opus4.kobv.de/opus4-btu/frontdoor/index/index/docId/462)
- Others: OpenAlea with MTG format (Python), L-Studio (Prusinkiewicz lab). No JS or browser FSPM found in my searches. [OpenAlea](https://publish.csiro.au/FP/fulltext/FP08084)

## Use in Clade (all **proposal**)
- **proposal** Moss specimen renderer: small TS organ graph (protonema, gametophore stem, leaf, sporophyte stalk, capsule) with 3-5 rewrite rules. Draw in 2D canvas or SVG. About 2-3 days.
- **proposal** Make species traits the rule parameters (branching chance, leaf size, stalk length). Evolving a species then visibly changes its shape.
- **proposal** Light: 1-D column or per-leaf shading, feeding a carbon pool that decides which rules fire. About 1-2 days. Fits the source/sink idea.
- **proposal** Use `lindenmayer` for a quick spike if the L-system look is enough. Hours, not days.
- **proposal** Space colonization only if a tree or shrub stage is added later. About 1 day for 2D.
- **proposal** Keep the sim cheap: cap nodes per specimen (for example 500), run rewrite steps per tick, not per frame.
- Total effort estimate: 3-6 days for a minigame-grade grow-and-render loop. These are my estimates, not sourced.
