# Clade — Live proposals

AI proposals that are still open. Nothing here is decided until you move it into [brief.md](brief.md).
Keep each one short. Delete a proposal when it's decided or dropped.

The old proposals S0–S26 were archived on 26 Oct (`_archive/2026-10-26/systems.md`). Ask for one by name to bring it back.

## P1. Hands-on play in the colony *(on hold since 26 Oct: the garden core comes first)*
Three toys test three answers: steer the spread, grow one plant, or pick genes that rewrite rules.
See [slices/02-toys.md](slices/02-toys.md), and the wider brainstorm in [minigames.md](minigames.md).

## P2. One grid, four verbs *(on hold; slice 03 has one layer)*
Every kingdom plays on the same tile grid at its own layer (plants on, fungi under, animals over), using the same
verbs: Grow, Gather, Guard, Bet. Relationships come from layers touching. Details in [minigames.md](minigames.md).

## P3. Picks with a cost
Most traits get one downside. Creeping shoots spread faster but dry out more; dense tufts hold water but spread
slower. A pick becomes a bet on your home, not a pure upgrade. Toys 1 and 3 try this.

## P4. Fit as a tier list *(built in slice 03 as the placement heatmap)*
Show S / A / B / C / D instead of bronze, silver, gold. Only labels and colours change. Toy 3 shows it per zone.

## P5. Split controls *(obsolete: slice 03 has no split)*
The three-way slider felt clunky. Try presets (e.g. Grow / Hold / Seed) plus fine tuning. Toy 2 tries presets.

## P6. Biomass needs a first use
The release pays, but nothing spends biomass yet. The next slice that builds the game needs a sink, e.g. soil
building. Show it greyed out on the release screen so the payoff reads.

## P7. The type specimen as a growing plant *(built in slice 03: code-painted sprites; traits show)*
Draw the specimen from an organ graph (VirtualPlantLab ideas) or an L-system, driven by genes. Every pick changes
its shape. That's cheap, and it answers "does the pick visibly change it?"

## P8. The critical path *(replaced 27 Oct by P9's stages)*

## P9. The layered sim: one approach from four sources *(27 Oct)*
From [review-layer-sim.md](review-layer-sim.md) and `research/layer-sim-{games,ecology,engineering}.md`. All four
agree on the core; the points where they differed are marked.
- **Strata:** each tile has one species per stratum (soil / ground / herb, later canopy), each with a cover value.
  Species compete only inside their stratum; up and down they touch only through layers. *(Ecology wanted fungi as
  two tile values, not a slot. The proposal: a slot, because you want fungi as a species you place.)*
- **Layers are typed 0–1 arrays of two kinds:** stocks with memory that decay (soil, nitrogen, litter), and levels
  recomputed from the current state (shade, water). Defined as data; one generic kernel runs them all.
- **Species are data:** needs are trapezoids (ideal band inside a survivable band), makes are rates. **Fit = the
  lowest need**, so every tile has one named limit: "Fit C, limited by light".
- **Species never name each other.** Every interaction goes through layers or guild tags, so the cost grows with
  species + layers, not species².
- **Not frozen:** lifespans, a seed lottery for open tiles (spreading fast vs holding well), loops that undermine
  themselves (ferns shade out their own young), decay on every stock, small capped events. **Not collapsed:**
  refuges, spore rain, a floor for your species. Disturbance is a lever, not a law (the peak-diversity claim is weak).
- **Readable:** a placement view with tier + limiting factor, one view per layer (hotkeys), a tile card that names
  the failing need, an event feed with causes, and later biomes as named regions (untested in any shipped game →
  toy first).
- **The economy can't hear sim noise:** smoothed income, requirements latch once met.
- **Tools first:** a headless runner on 5 seeds, scenarios as command replays, invariants (bounded, not frozen,
  coexistence), ASCII map dumps, a generated species × layer table, a `trace` for the tile card, cause-coded event
  log, a determinism lint, and a "dt test" for offline.
- **Stages:** 05 readable layers (rewrite of the sim core, six species ported, fungi added as data only) → 06 first
  biomes → 07 trees (canopy) → sea line → animals as density fields (individuals drawn only in the view) → the
  adapting minigame (traits move need curves, so you see what they change).

## P10. Landmarks and static layers *(27 Oct, from your landmark idea)*
- **Static layers cost nothing per tick:** they're set when the island is made (like terrain and base wetness) and
  never recomputed. So the CPU allows many. The real limit is reading: each layer you *see* should change a
  placement decision. So: few visible layers, and more static ones folded into landmarks.
- **Landmarks as tile features:** a feature per tile (vent, beach, river, waterfall, cave, ...) with fixed effects:
  wetness, shelter, a status. The beach gives the status **Salty**; species have a tolerance instead of a salt band
  (fit × tolerance). The tile card shows "Beach: salty (−70% for mosses)".
- Landmarks also give the map names and places to aim for, and biomes can grow around them.
