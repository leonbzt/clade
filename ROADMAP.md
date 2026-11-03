# Roadmap

Where Clade is heading, one milestone at a time. **We build only for the current milestone.** Everything else waits
in [docs/ideas.md](docs/ideas.md). This file changes only on your call; AI may propose edits.

> **Approved 2 Nov.** v2, the rebuild: [docs/design/rebuild.md](docs/design/rebuild.md).
> v1's roadmap is in `_v1/ROADMAP.md`.

## Now: M1, the first playable (scope set in the spec)

**Goal:** one turn of the loop from a fresh start: grow a line → release it → it takes a tier → the garden pays for
the next run.
- **Scope:** [docs/spec.md](docs/spec.md) §7, bare: one line that branches into lineages; moss, herb and tree; the
  home island with 8 niches; the run with pulses; the tier list with the ladder; biomass, sprouts, saves, offline.
- **How:** one build pass, loop first (decided 3 Nov), not a slice per part.
- **Done when:** a fresh start reaches its first B tier in 30–60 min; a second run makes a visibly different build;
  you want a third run.
- **Part 2** (after playtest 01, decided 3 Nov; course changed after playtest 02, 3 Nov): 1. builds, part A:
  [docs/slices/01-builds.md](docs/slices/01-builds.md) (played) · 2. the look toy:
  [docs/slices/02-look.md](docs/slices/02-look.md) (played: 2D low-poly) · 3. the stand:
  [docs/slices/03-stand.md](docs/slices/03-stand.md) (the run: a few saplings, roots hunting hidden soil, shoots
  cut and fed, levels from growth) · 4. variants in the garden, hunted on the map (P40) · then part B (the tree) and
  the map with income, order set later.

## Done: M0, the toy and the spec (26 Oct – 3 Nov)

**Goal:** find out whether growing a line in side view is fun on its own, then write the game down in one page.

1. [x] **The toy: grow a line** (`toys/`, built on the 26 Oct specimen toy). Up to 10 genes grow a side-view plant
   (shoots for light, roots for water and nutrient pockets, stone in the way); the stats read out live; buds and
   pruning above ground and hidden soil below, with cost previews, and a switch that turns the verbs off; at the
   season's end a brood of 3 seeds, drawn as bodies → pick the heir; 4–6 seasons. Spec: [docs/slices/00-grow-toy.md](docs/slices/00-grow-toy.md). Pass 2, the tree beside the herb:
   [docs/slices/00b-tree-and-herb.md](docs/slices/00b-tree-and-herb.md).
   **Question:** are there enough decisions, and do the heirs feel different? (The 26 Oct specimen toy: "there
   isn't a lot to decide.")
2. [x] **The spec** ([docs/spec.md](docs/spec.md), 3 Nov; it replaces v1's vision): the loop, the genetics layers,
   the sim's four layers, the tier list, the budgets, M1's scope.

## Later (order and scope set when we get there)

| Milestone | Could build | Question |
| --- | --- | --- |
| M2 A second kingdom | Fungi in side view, or animals with staged assembly and their own run | Does a second line make the garden richer? |
| M3 The moving world | Events, more run islands, partnerships, eras and the climax | Do changes make gifts and challenges? |
| After | Morphs, "Resembles…", the codex, the nursery, sharing codes, the archipelago | Set later |

## Budgets (every milestone)
Garden step < 0.1 ms · 8 h offline < 0.5 s · `npm run check` < 10 s · at most 4 stocks, 6 stats and 10 genes per
kingdom. Adding one means removing one, or your call.

## Done: v1 (25 Oct – 2 Nov)
A tile sim, variants, the tree of life, the slot board and the first run, in `_v1/`. What it taught:
[docs/design/rebuild.md](docs/design/rebuild.md) §2; what you liked: [docs/tastes.md](docs/tastes.md).
