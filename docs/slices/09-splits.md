# Slice 09: Species split off from variants

**Question:** when you play an early land plant ancestor, when a variant you grew splits off as a new species
(taking its tiles with it), and when a clade opens because one of your variants met its recipe, does the flow from
variant → species → clade feel like *your* lineage, and is it clear what makes a moss?

Builds on slice 08 (tag `slice-08`). From P17 a–d, g and the map notes, your calls on 27 Oct.

## In scope

### The ancestor *(P17 g)*
- A new authored species, **Early land plants** (short "Thallus"): a flat green sheet on damp rock, between
  liverworts and mosses in its needs. Traits: Rhizoids, Waxy cuticle, Tough spores. You found it in the
  **Land plants** node (after cyanobacteria, as the Land node now opens), like cyanobacteria.
- Liverworts are no longer the start. Liverworts, Mosses and Vascular plants become **doors** (below).

### Splits *(P17 a)*
- Founding a Rare+ variant as a species **splits it off**: every tile of that variant becomes the new species
  (same cover and health), the parent loses them, and you place one founder patch where you choose.
- Its genome becomes the new species' base, so its own variants start from there (as now).

### Doors open by recipe *(P17 b, d; data: `KEYS`)*
- Each door is a node with an authored **template** species (look, base needs, its trait list) and a **recipe**:
  2 precursor genes, then a key gene. The doors, and whose species can meet them (loosely like the real tree):
  - **Liverworts** (from Land plants): wet −1, tight −1, then **Oil bodies**.
  - **Mosses** (from Land plants or Liverworts): dry +1, wind +1, then the **Leafy shoot**.
  - **Vascular plants** (from Land plants or Mosses): Rhizoids, dry +1, then **Water-carrying cells**. Its
    template is the club moss (lycophytes are the oldest living vascular line), and it still needs soil tiles.
- A shown variant that carries the whole recipe is a **candidate** (gold glint on the map, a gold "candidate" note
  on its row). Only candidates roll the key: it arrives in the biggest candidate within `window` minutes of having
  one (0.5–3).
- **Nudge (the pity clock):** with the door open and no candidate for `nudge` minutes, the variant closest to the
  recipe gains one missing precursor on a small patch (a feed line says so). Progress never stalls.
- The variant with the key is Legendary. Its button reads **"Split off as the first Moss"** (the node's biomass
  cost). The split makes your first species of that clade: a genome on the template.
- **Genes carry, traits drop** *(P17 c)*: axis genes carry over as the new base (the cap counts from the clade
  template, so splits can't pile up); the old clade's trait genes and the key drop.
- The templates are no longer founded from the tree. The other nodes (fungi, lichens, ferns) stay as they are.

### Readability
- The tree screen shows each door's recipe as a checklist, with the closest variant and any candidates.
- A variant row shows the recipe it's working toward when it carries at least one precursor ("Moss: dry +1 ✔
  wind +1 ○").
- The spindle: a clade's first species branches off the species it split from (it already does for splits).

### Map *(P17, agreed)*
- The normal view tints plants by species (its base genome), not by variant; variant colours stay in the Variants
  view and on hover. Shown variants per species 8 → 4. Half the sprites when zoomed in.

## Out of scope
Gene meters, edge and "why it's winning", tooltips (slice 10). Spindle curves, more combos, wild species, slots,
recipes for fungi, lichens and ferns, flows, animals.

## Done when
- [x] `npm run check` passes; `npm run sim` 5×60: slice 06 checks still pass (≥5 plants alive), Mosses and
  Vascular plants arrive by splits, the bot's species live.
- [x] A unit test: a split moves the variant's tiles to the new species (no twin population).
- [x] A unit test: a candidate gets the key; a clade split keeps axis genes and drops traits.
- [ ] **You:** the ancestor → liverwort / moss → vascular flow reads as your lineage, and the recipe makes clear
  what makes a moss.

## Build notes (28 Oct, AI)
- Results (5×60): 5/5 seeds pass slice 06's checks (≥5 of 7 plants). Mosses opened by a split at 4.3–6.5 min,
  Vascular at 14.5–24.7 min (slice 08: 20–29), 5/5. Unit tests: split moves tiles; candidate → key → clade split
  keeps axes and drops traits. Glanced at in Chrome (bot 8 min): tree leaves, recipes and spindle render, no errors.
- Deviations: **Vascular also needs 150 moss tiles** (otherwise the ancestor opened it at ~10 min and club mosses
  took 78% of the herb layer); key and nudge patches always get a shown slot, and candidates and key carriers are
  never swamped (with the cap at 4 they were lost before the key could roll); nudge every 2 min on a radius-2 patch.
  The Lycophytes node merged into Vascular plants (its template is the club moss). The founded-variant faint line
  is gone (a split takes the variant with it).
- Side effect: with 4 shown variants, "busy species ≥2 shown/10 min" fell to 0/5. Liverworts' timing varies a lot
  (Oily 5–45 min in earlier runs).
- Files: `src/sim/keys.ts` (rewritten: candidates, roll, nudge), `src/sim/reqs.ts` (new: requirements), splits in
  `src/sim/commands.ts`; data in `KEYS`/`KEY` (`src/data/genes.ts`), the ancestor in `src/data/species.ts`.
