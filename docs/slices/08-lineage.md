# Slice 08: Lineages you grow

**Question:** when founding moves a species' centre so it can reach further, when the next clade grows out of a
variant you raised, and when the tree of life shows your species as branches over time, does it feel like *your*
lineage, and can you read species and variants at a glance while playing?

Builds on slice 07 (tag `slice-07`). From P16 and your calls on 27 Oct: b inside a for play, a separate tree
screen for overview and milestones, d + e, slots later, a spindle diagram as the time axis.

## In scope

### Two screens
- **Species panel (play):** one row per species, listed once. Under each, a **population bar**: its shown variants
  as segments sized by tiles, in the same colours as the Variants view; hidden mutants as a grey rest. Click a row
  to expand its variant rows (only the focused species expands). A variant that was founded as a species shows as
  one faint line "→ now its own species: X" (click to focus X), not a full row.
- **Variants on the map:** hovering a bar segment or a variant row lights up that variant's tiles in any view.
- **Tree of life screen:** a full overlay (tab button or `T`, `Esc` closes), not a side tab. Left: the clade nodes
  and their requirements as now, with **your species as leaves** under their clade, nested by who they came from.
  Extinct ones stay as grey **fossils**. Right: the **spindle diagram**.
- **Spindle diagram:** time left to right; each species a band as thick as its tiles (sampled each minute). A
  founded species branches off its parent's band at its founding time, labelled with the variant it came from. A
  new clade's first species branches off the species whose variant carried the key gene ("Mosses ← Leafy
  Liverwort").

### Founding helps, extremes stay rare *(data: `GENES.reach`)*
- Axis steps now go from −4 to +4 (hard cap). Steps 3 and 4 extend steps 1–2: band shifts grow linearly, gains
  (×>1) grow at the same rate, costs (×<1) grow steeply.
- A mutation step that moves **further than 2 from its species' own base** only takes with odds `reach.out` per
  extra step; one that moves **beyond ±2 from the clade's original genes** also needs `reach.extreme` per step.
  So founding a +2 form makes +3 several times likelier, but +4 stays rare. No hard re-centre.
- Rarity: as before (distance to the species' base), one tier up if a gene sits beyond ±2.

### Key genes grow out of variants *(data: `KEYS`)*
- Key innovations become a list: **Leafy shoot** in Liverworts → Mosses (as now), and **Hydroids** (simple
  water-conducting cells) in Mosses → Vascular plants. Vascular plants loses its moss-tiles requirement.
- **Precursors:** each key lists 2 precursor genes (Leafy: dry +1, wind +1; Hydroids: Rhizoids, dry +1). The pity
  clock runs at ×1 / ×1.5 / ×2.5 when the best shown variant of that lineage (base species and the ones founded
  from it) carries 0 / 1 / 2 precursors. The key gene appears in that best variant.
- The tree screen shows the precursors as a checklist under the key requirement, with the best variant's name.

## Out of scope
Slots and releasing old species (f), refunds, push and favour nudges, crossing, new axes, the "resembles a real
species" line, wild splitting, flows, animals, zooms, balance beyond keeping the checks.

## Done when
- [x] `npm run check` passes; `npm run sim` 5×60: slice 06 checks still pass, both keys arrive, the bot's species live.
- [x] A species founded from a +2 form reaches +3 more often than its base species does (a unit test: >2.5×).
- [x] Each species shows once in the panel; the bar and hover make its variants findable on the map.
- [x] The tree screen shows your species as leaves and fossils, and the spindle diagram shows branches over time.
- [ ] **You:** it reads as your lineage, and the two screens split cleanly into overview and play.

## Build notes (27 Oct, AI)
- Results (5×60): 5/5 seeds pass slice 06's checks. Leafy +6.5–9.6 min, Hydroids +12.5–20.7 min after Mosses;
  Vascular plants at 20–29 min (slice 07: 21–39). New species alive 10 min 5/5. Glanced at in Chrome: panel,
  hover highlight, tree screen and spindle all render.
- **No form went beyond ±2 in the bot runs:** the bot founds whatever Rare comes first (often 3 axes at ±1), never a
  form at ±2 on one axis. Reaching +3 is a player move; the reach rule is checked by a unit test instead.
- Deviations: the clock speeds are ×1 / ×1.5 / ×2.5 (×0.5 for no precursors pushed Mosses too late, against fast
  early unlocks) · species list in lineage order with a small indent (founded ones right after their parent) ·
  a founded variant's line reads "now its own species" when the names match · tree screen key `T`.
- Files: `src/sim/keys.ts` (new: key clocks, precursors, `stemOf`), `src/ui/TreeScreen.svelte`,
  `src/ui/Spindle.svelte`, `src/ui/PopBar.svelte` (new). `s.history` samples tiles per species once a minute.
- Knobs: `GENES.reach`, `KEY.speed`, `KEYS[*].window` and precursors in `src/data/genes.ts`.
