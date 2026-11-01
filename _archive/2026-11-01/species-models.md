# Species models: how evolution could run (27 Oct)

AI overview for the species rework. Nothing here is decided; the short version is P12 in [systems.md](systems.md).
Your wishes (27 Oct): evolution runs by itself and surprises you; you see mutations, pick one as a new founder
elsewhere, or push a direction; rare combinations can fit outside the usual range or open new niches; early on
you pick the founding variant and name the new species; later you breed or combine variants. It has to rework
today's barebones traits (bought per species).

## 1. The four models

| Model | What a tile holds | Evolution feels like | Compute | Readable | Main problem |
| --- | --- | --- | --- | --- | --- |
| **A. Species only** (today) | a species | a shop: you buy traits | tiny | very | nothing happens by itself |
| **B. Many species** | a species; new ones appear often | a stream of unlocks | small (fit table grows with species) | ok up to ~20, then lists | no variation inside a species; near-duplicates pile up |
| **C. Variants** | a species + one of its few variants | watching forms spread and lose | tiny (+1 small number per slot) | good, if variants are capped | needs a cap and a merge rule |
| **D. Individuals** | many individuals, each with genes | real population genetics | heavy: ~250k agents at 50 per tile | poor: the map averages out | offline catch-up, balance, rewrite |

Also possible, and worth naming so we can rule it out:
- **Gene frequencies per tile** (each slot holds 0–1 values that average when plants spread). Cheap and smooth,
  but averaging kills rare combinations: everything drifts to the middle. That's the opposite of what you want.

## 2. The proposal: a mix

- **The sim runs variants (C).** Each species has up to ~6–8 variants. A variant is a small genome. Each slot
  stores its variant.
- **Species are named groups of variants (B, earned).** A new species is born when you pick a variant and found
  it. So species count grows from play, not from a list.
- **Individuals live only in the view and in the minigame (D, where it's cheap).** The close view draws
  individuals with small differences taken from the variant. Breeding works on a handful of individuals at a time.

## 3. The genome

- **3–4 gene axes in steps (−2 … +2), not floats.** Each moves an existing need curve or rate: dryness, shade,
  nitrogen, spread vs hold. Later salt and heat. Steps keep variants countable and nameable ("Dry-leaf +1").
- **Every step has a cost** (P3): +1 dryness → grows 10% slower. No variant beats all others everywhere; the best
  one depends on the place. That's what keeps several variants alive.
- **Key innovations are rare on/off genes** tied to real tree nodes: rhizoids, leafy shoot, stalked capsule,
  vascular tissue. Getting one is the big moment; it unlocks the next node.
- **Combos (the rare finds).** A short data list of gene combinations with an extra effect beyond the sum, e.g.
  dryness +2 with salt +1 = "Crust form": can live on the beach. Combos are how a variant fits outside the usual
  range or opens a niche (beach, vent rim, cave mouth). A **combo log** shows found ones and blanks for the rest:
  something to look for.
- **Today's traits become genes.** Their up/down text and the sprite changes (P7) carry over; you just stop
  buying them.

## 4. Evolution by itself

- When a plant spreads, a small chance of a **mutation**: one gene moves one step. Mutations are random.
  **Selection does the steering**: a variant that fits a place better wins tiles there.
- More tiles → more mutations. Big populations in harsh places are where the good finds happen.
- Most mutants fail and vanish quietly. A new variant is **shown** once it holds a few tiles (e.g. 5), so the feed
  shows survivors, not noise.
- **Rare ones glint on the map** (a small sparkle on the tile) until you look. That's the unexpected reward.
- **Pacing guard** (hand-curated progression): key innovations have odds that rise over time (a pity timer), so
  luck changes when they arrive, not whether.
- **Caps:** a variant with no tiles dies out. Same genome = same variant (convergence merges). At the cap, a new
  mutant replaces the smallest variant.

## 5. Your nudges (by stage)

| Stage | Nudge | What it does |
| --- | --- | --- |
| Early | **Pick a founder** | Choose a variant on the map → found it at another spot → it becomes a new species. You name it. |
| Early | **Name** | A naming moment for each new species; costs biomass (a first biomass sink, P6). |
| Mid | **Push** | Spend biomass to bias mutations toward one axis for a while ("toward dry"). Odds change, not outcomes. |
| Mid | **Favour** | Mark a variant: it holds tiles a little better (artificial selection, light). |
| Mid | **Isolate** | Founding far away (another landmark) lets a variant drift on its own: faster divergence. |
| Late | **Cross** | Where two variants meet, cross them: the child mixes genes, with some luck. This is the adapting minigame. |
| Late | **Gene bank** | Keep a variant to found again later, after it died out on the map. |

## 6. Reading it

- **Map:** variants share the species' hue and differ in sprite details (leaf shape, tint), as traits do today.
- **Tile card:** "Mosses · Dry-leaf (+1 dry) · fit B, limited by light".
- **Species panel:** variants as rows: tiles, gene pips, a small trend line. A small lineage tree.
- **A variants view:** colour one species' tiles by variant, so you see a dry form take the dry slope.
- **Feed:** "New form at the Steam Vent: Mosses, dry +1 (spreads 10% slower)".

## 7. Cost

- **Compute (C):** ~16k slots; fit per slot instead of per species. Under 1 ms per layer update. Not a concern.
- **Work:** about one slice for variants + mutation + selection + founding/naming + panel and card. Push, favour,
  combos log: maybe a second small slice. Crossing is the minigame, later.
- **Touches:** `sim/state`, `sim/life`, `sim/fit`, `data/species` (genes replace traits), `view/plants`, the
  species UI, and tests (variants must not explode or all die).

## 8. Risks

- **Grey mush:** too many genes, or too many variants shown. Keep axes few and steps coarse.
- **Nothing happens:** if mutations are too rare or selection too weak, the calm sim hides evolution. Rough
  targets: a visible new variant every few minutes, a good one taking a region in ~5–10 minutes.
- **Player has nothing to do:** solved by founding, naming and pushing early, and crossing later.
- **Luck vs curation:** the pity timer keeps the tree-of-life pacing.

## 9. Your answers (27 Oct)

1. Rarity: game-like tiers.
2. A big enough difference (a few good combinations) is enough for a new species; a key innovation is a new clade.
3. Wild splitting: maybe, when a variant is very survivable, but acknowledged, with a chance for you to act.

Slice spec: [slices/07-variants.md](slices/07-variants.md).
