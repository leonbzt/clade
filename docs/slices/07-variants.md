# Slice 07: Species that evolve by themselves

**Question:** when a species carries a few variants that mutate by luck and win or lose by fit, do you see
evolution happen on the map, does a rare find feel like a reward, and does picking a variant to found as a new,
named species feel like steering it?

Builds on slice 06 (git tag `slice-06`). From the species talk on 27 Oct ([species-models.md](../species-models.md),
P12 in [systems.md](../systems.md)) and your calls:
- Variants within a species. Evolution runs by itself and surprises you. You still see the mutations, and you pick a
  variant as a founder for another part of the map.
- **Rarity uses game-like tiers.**
- **A big enough difference (a few good gene combinations) is enough for a new species.** A **key innovation is a new
  clade.**
- **Wild splitting:** later, and acknowledged, with a chance for you to act. Not in this slice.

## In scope

### Genes *(data: `src/data/genes.ts`)*
- **Shared gene axes for all plants, in steps from −2 to +2.** Each step is a list of the existing mods (band edges,
  stats, makes), and every step has a cost:

| Axis | + side | − side |
| --- | --- | --- |
| Dry | lives drier (water band moves down) | grows faster, needs wetter |
| Shade | takes more shade | grows faster in full light, takes less shade |
| Lean | needs less nitrogen | yields more, needs more nitrogen |
| Spread | more spores | holds its tile better |

- **Today's traits become trait genes** (on/off). They keep their up/down text and sprite changes. They mutate in
  more rarely than axis steps. **The trait shop is removed.**
- **Combos:** 3 combinations as data, each with an extra effect beyond its parts, opening a niche. Rough set:
  - Dry +2 with Spread −1: "Crust form", much better salt tolerance (the beach).
  - Shade +2 with Dry −1: "Cave form", wider shade band (lava tube mouths).
  - Lean +2 with Dry +1: "Ash form", lives on bare rock with almost no soil.

  Exact numbers are set by feel.

### Variants in the sim
- **A slot holds a variant**, not a species. The species comes from the variant. A profile (today: a species
  with its traits) becomes one per variant, so fit, needs and limits work as now.
- **The species list moves into the state**, because new species are made in play. The data keeps the base species.
- **Up to 8 variants per species** (data). Same genome means the same variant. A variant with no tiles dies out.
  When the cap is full, a new mutant replaces the smallest variant (one with no glint).
- **Mutation:** when a plant settles a new tile, there's a small chance (data) that the child mutates: one axis
  moves one step, or, more rarely, one trait gene flips. Spore rain uses the existing variants, weighted by tiles.
- **Selection is just the sim:** variants compete in their stratum like species do today. A variant that fits a
  place better spreads there.

### Rarity *(game-like tiers)*
- **Tier from distance to the species' base genome** (sum of steps, a trait gene counts 2), with a combo bumping it one tier:
  **Common** (1), **Uncommon** (2), **Rare** (3–4 or a combo), **Epic** (5+, or a combo plus a trait gene).
  **Legendary** is for key innovations.
- Each tier has a colour, used in the feed, the panel and the glint.
- **A variant is shown once it holds 5 tiles** (data). Mutants that fail before that stay hidden.
- **Glint:** a Rare or better variant sparkles on its tiles on the map until you've looked at it (tile card or panel).

### Founding a new species
- **Allowed when** a shown variant is **Rare or better**: a few good steps, or a combo.
- **Pick the variant** (species panel or tile card), **pick a spot** (founding as now: patch radius 2), and **name it**.
  The suggested name comes from its genes ("Dry Shade Moss"), and you can edit it.
- **The new species** starts with that genome as its own base. It gets its own variant pool, its own small hue shift,
  and its own row in the panel. It competes in the same stratum. Its parent keeps its variants.
- **Cost:** biomass, rising with each new species (a first real biomass sink, P6).

### Key innovation, one example *(a new clade)*
- **Leafy shoot** is a Legendary mutation that can appear in Liverworts. It unlocks the **Mosses** node in place of the
  tile requirement, as in the brief ("Mosses is reached through the leafy shoot").
- **Pity timer:** its odds rise the longer Liverworts have been on the map, so it arrives in a rough window (target:
  5–15 minutes after Liverworts are founded). Bigger populations get it a bit sooner.
- When it appears: a Legendary feed line, a glint, and the Mosses node opens. Founding Mosses works as now.
  Other nodes keep their current requirements in this slice.

### Reading it
- **Species panel:** variant rows under each species: tier colour, name, tiles, gene pips (4 axes plus trait genes),
  combo badge, and a "Found as new species" button when allowed. A small "combos found: 1 / 3" line.
- **Tile card:** "Mosses · Dry Moss (Uncommon: dry +1, spread −1) · fit B, limited by light".
- **Variants view (key 7):** colours the selected species' tiles by variant, so you can see which form holds which place.
- **Feed:** "Uncommon form at the North Vent: Mosses, dry +2". Only shown variants, one line each.
- **Sprites:** trait genes change the drawing as now. Axis genes give a slight tint shift per variant.

### A calmer screen *(the clutter)*
- **Fewer sprites in the calm view:** fern ~0.2, club moss ~0.15, the others a little lower (`src/data/view.ts`).
  Spread them out so sprites don't clump. Ground cover carries the area. The close (detail) zoom stays fuller.

### Tools
- `npm run check` and `npm run sim` keep working, with short output. The bot founds a new species whenever one is allowed.
- New sim measures: variants shown per species per 10 minutes; the largest variant's share of its species; and
  **sorting**: the mean water (or shade) on a + variant's tiles vs its parent's. Also: time to the first Rare,
  combos found, the Leafy shoot's arrival time, and species founded.
- Invariants: ≤ cap variants per species, no orphan slots, deterministic per seed.

## Out of scope
Push and favour nudges, crossing and breeding (the adapting minigame), the gene bank, wild splitting (next: an
acknowledged prompt), key innovations beyond Leafy shoot, animals, flows (downhill water and nitrogen, erosion, wind
and rain), two zoom levels and chunks, species slots (Q8), save and offline progress, the art pass.

## Rough timing
A shown variant every few minutes per busy species; a good one takes a region in ~5–10 minutes; the first Rare in
~10–20 minutes; Leafy shoot 5–15 minutes after Liverworts. Pacing stays rough; tune by feel.

## Done when
- [x] `npm run check` passes.
- [x] `npm run sim` on 5 seeds, 60 sim-minutes: slice 06's checks still pass (≥5 of 6 plants survive, no species
  above 60% of its stratum, flips near slice 06).
- [ ] Each busy species shows at least 2 variants per 10 minutes, and at least one variant per seed reaches 30% of
  its species: selection shows.
- [x] **Sorting:** on most seeds, a Dry + variant sits on clearly drier tiles than its parent.
- [ ] A Rare appears by 30 minutes on ≥4 of 5 seeds, and at least one combo is found on ≥3 of 5 seeds.
- [x] Leafy shoot arrives within its window on 5 of 5 seeds.
- [x] The bot founds at least one new species per seed, and it survives 10 minutes.
- [ ] Frame rate stays smooth.
- [ ] **You:** you notice variants spreading without being told, a Rare glint feels like a find, founding and naming
  feels like your step, and the map looks less cluttered.

## Build notes (27 Oct, AI)
- Results (5×60): slice 06 checks 5/5 · variant ≥30% 5/5 · Dry+ drier 5/5 · Rare by 30m 5/5 · Leafy in window 5/5 ·
  new species alive 10m 5/5. **Misses:** ≥2 shown/10m 0/5 (moss 1–2.4, fern <1; others 2–4) · combo 1/5 · first
  Rare too early on some seeds (1.6–2.4 min). Frame rate unmeasured (Chrome throttled the automation window).
- Deviations: the cap of 8 is for shown variants, plus a hidden buffer of 8 · only shown variants mutate · a variant
  is founded once ("founded as …") · name first, then spot · Leafy is near-neutral (hold ×1.2 shut out mosses) ·
  Lean+ also costs seeds · Ash combo softer · Dry steps 0.05/0.10 · founding cost 1500 ×2.5 · hue shift 0.05.
- Side effect: the Leafy gate puts Lichens at 13–27 min and Vascular at 21–39 (slice 06: 3–11, 5–14).
- Knobs: `GENES.mutate`, Dry steps, `KEY.window` in `src/data/genes.ts`.
