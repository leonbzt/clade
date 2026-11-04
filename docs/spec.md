# Clade: the spec

**Draft, 3 Nov (AI, from your calls; "sounds good", 3 Nov).** It changes only on your call. Labels: *decided (date)* is yours, *proposal*
is AI's. It replaces v1's vision; [tastes.md](tastes.md) is the taste it has to fit. M1 is **bare** *(decided 3 Nov)*:
the whole loop, few rules, no upgrade paths.

## 1. The game
An idle evolution game on a young volcanic island. **You grow a plant line in short side-view runs, release it into
the island garden, and a niche × tier list ranks it.** The garden runs by itself, offline too; the area your lines
hold pays for the next run. Genome → body → stats → score → tier → area *(decided 2 Nov)*.

```
RUN (active, ~5 min)              GARDEN (idle, always on)             TIER LIST
a sprout + biomass, a habitat →   the line spreads by patch;      →    niche rows × F…S
side view, pulses, seasons        holds area by score vs others        B opens the next form and rows
brood of 3 → heir → release       pays biomass, throws up sprouts      ↺ sprouts and biomass, the next run
```

## 2. The run (side view)
*Changing (decided 3 Nov, P38 and playtest 02):* **no pulses.** A few saplings grow at once, live, and you steer
them; shade is drawn; at the year's end you pick one to found the next year (it + random mutations). Levels follow
growth. **The run hunts** (P40, 3 Nov): roots reach into hidden soil; shoots take cutting in winter and extra energy
sent into one shoot, toward lit gaps and away from shade, both drawn. *Decided 3 Nov (P43):* you steer by targets
(a soil cell, a lit gap, a shoot to feed), paid in the sapling's nutrient, with no auto; moss and herb re-found each
year from 3 saplings, while the tree's 3 stay the whole run and are thinned; XP is the whole stand's grams. The stand's
slice ([slices/03-stand.md](slices/03-stand.md)) rewrites this section. *Under test (3 Nov, after playtest 04):* the
run's core play, in three toys ([slices/04-core-toys.md](slices/04-core-toys.md), P44).

- **Start** *(decided 3 Nov)*: spend a **sprout** (§5) and biomass, and pick the habitat patch to grow in. The
  run's soil, light, water and neighbours come from that patch: the natives and your garden species there
  stand beside you and shade or drink, as in the toy.
- **Pulses** *(decided 3 Nov)*: the plant grows in pulses. A pulse spends the energy its leaves banked: growth
  animates for ~1 s, then the game **waits**. 2–4 offers light up on the body, each a place and an organ: *extend
  this shoot*, *wake this bud*, *leaf flush here*, *root toward that cell*. Each shows its cost and its stat change.
  The pick gets most of the next pulse's growth; the genes decide how it grows (length, angle, leaf size) and spend
  the rest by Root share. Which offers come up is genetic too (Dominance favours the main tip, Buds gives more).
  **Cutting** is free between pulses and returns some nutrient. An **auto** toggle picks for you.
- **Soil** stays hidden below: cells reveal around root tips; water and nutrient pockets, hard soil, stone.
- **Seasons:** ~5 pulses each *(decided 3 Nov: fewer pulses)*. **Brood:** 3 seeds (spores for moss), each the parent's genome with small random
  steps, drawn as small bodies with stat changes; pick the heir. The run ends after the form's seasons.
- **Release:** the best season's body *(decided 3 Nov)*: its 6 stats become a new species (named by you or by its form and best stat), released
  into the patch it grew in, as a branch of the species it came from. The list shows its score in every niche it can enter before you confirm.

### Growth forms *(decided 3 Nov: moss, herb and tree in M1, along the ladder)*
| Form | Rules (the genome is shared; the form changes the rules) | Run | Opens |
| --- | --- | --- | --- |
| Moss | A low mat. No roots: rhizoids hold on, water comes from the surface; dry spells make it dormant. Offers pick which edge creeps and where shoots stack into a cushion. | 4 seasons, spores | at start |
| Herb | The toy's herb: shoots, leaves, roots; seeds each season, pick the heir. | 5 seasons | B in a mat row |
| Tree | One body for the run: wood each winter, spring leaves on the outer twigs, winter pulses are cuts only. | 8 seasons | B in a herb row |

### One line, many lineages *(decided 3 Nov: "one line that evolves into lineages that you do the runs with")*
You start with one moss, the founder. Every release branches off the species its run started from, so your species
form a tree: your clade, drawn as a small branching tree beside the tier list. A **lineage** is a branch you keep
running. Forms evolve along it: once the herb is open, a sprout of a moss species may come up as a herb (its genes
carry over), and a herb's as a tree. *Proposal:* the tree view is plain in M1 (names, form, best tier).

## 3. Genetics
*Being replaced (decided 3 Nov):* attributes, a skill tree per form, and pressures; see
[design/builds.md](design/builds.md). The slice spec will rewrite this section. Pressure kinds in M1 *(decided 3 Nov)*:
heat, drought, shade, wind, flooding.

| Layer | M1 | Free or authored |
| --- | --- | --- |
| Genome | The toy's 8 genes, 1–9 pips: Internode, Angle, Buds, Dominance, Leaf, Root share, Dive, Thickness. Moss reads Root share as rhizoids and Dive as crack grip. | Free: brood steps |
| Body | Segments and nodes, grown by the form's rules | Emergent |
| Stats | 6, measured from the body: Reach, Spread, Roots, Toughness, Growth, Upkeep | Fixed formulas, shown |
| Niche | Weights on the stats (the toy's targets) → score 0–100 → tier S 85, A 70, B 55, C 40, D 25, F | Authored |
| Skills (parts) | **Out of M1.** The forms are the only unlocks. Later: perks such as "shell cracking" *(decided 3 Nov)* | Authored |

## 4. The garden (the sim, four layers) *(the patch model, decided 2 Nov)*
1. **Land (tiles):** v1's generator carried over (`_v1/src/sim/island.ts`, `_v1/src/data/islands.ts`): the home
   island, ~96×56 tiles of 10 m. Each tile has a kind: **Lava, Bare ground, Forest floor, Wet** (by springs and
   streams), plus sea and beach (no life in M1). A tile stock **soil depth**, fed by the life on it, turns Lava →
   Bare ground → Forest floor at thresholds *(names: your words, tastes.md)*; this is succession, and the island
   growing up is the ladder.
2. **Habitats (patches):** a new, small finder (v1's `habitats.ts` is read for ideas only): a flood fill per kind,
   big pieces cut to ≤ ~60 tiles, a neighbour graph weighted by border length. Recomputed only when a tile changes
   kind; grams are remapped by area.
3. **Life (per patch), one fixed step of 1 s:** 3 stocks: **water** (from the land), **light** (shade from the
   layers above), **nutrient** (soil depth plus litter). Each patch has one slot per layer (Mat, Herb, Canopy), so a
   patch holds up to 3 niches. Inside a niche, species share the patch's capacity by score: target share ∝ score³,
   grams move toward it at a steady rate *(steady, decided 3 Nov)*. Natives sit in some niches as fixed incumbents
   (a lichen at D on lava, sedges at C in the wet), so a newcomer has to beat them. Spread: a share of grams flows
   to neighbour patches along borders × Spread. Below 1 g a species dies out in that patch.
   **What keeps it interesting** (*decided 3 Nov: "steady but needs to stay interesting"*; the means are a
   *proposal*): scores read the patch's stocks, so the garden shifts by itself while every step stays steady.
   A canopy shades the mats and herbs under it; a wet and a dry half-year move water; succession turns a patch's
   kind and opens or closes its niches; your own lines crowd each other. Each shift shows its reason
   ("Wet herb: shaded by your Oak line, B → C").
4. **View:** v1's pixel painting carried over (`pixels.ts`, `terrain.ts`, `plants.ts`), each species painted over
   its patch's tiles by its area (grams ÷ density per tile), growing out from where it was released.
   **The look** (*decided 3 Nov*, [playtest 03](playtests/03-look.md)): 2D low-res low-poly, as in the look toy;
   calm menus, Pixelify font. The stack stays Svelte + TypeScript + Canvas 2D for now (when to switch: P42).

**Niches (M1, 8):** Lava mat · Bare mat · Wet mat · Bare herb · Wet herb · Forest herb · Forest canopy · Wet
canopy. Each is a habitat kind × layer with its own weights (lava mat wants Toughness and Roots; wet herb wants
Reach and Growth; forest canopy wants Reach and Toughness). Rows a kind doesn't have yet (no Forest floor at the
start) show as locked.

## 5. The tier list and the economy
- **Rows** are the 8 niches, **columns** F → S. Each cell shows your best species there, its score, the holder
  (biggest share, yours or a native) and the area your lines hold. **The clear goal is area** *(decided 3 Nov)*:
  a big number per row and for the island ("your lines cover 412 tiles").
- **The ladder** *(proposal, after rebuild.md)*: mat rows are open at the start; B in any mat row opens the herb
  form and the herb rows; B in a herb row opens the tree and the canopy rows. First time at each tier: a sprout.
- **Biomass** is the one currency: your lines' grams in the garden produce biomass per second (offline too).
- *Changing (decided 3 Nov, P40):* sprouts become **variants the garden breeds by itself**, which you hunt on the
  map and found (v1's variants back). Their slice rewrites this item.
- **Sprouts: the chance to run** *(decided 3 Nov: the cost "coupled with an opportunity… a rare gene in the garden or
  some event or unlock"; the means are a proposal)*. A run needs a sprout and biomass. The garden throws up sprouts
  by itself, more often where your lines hold more grams: a seedling of one of your species with a **rare gene** (a
  jump of 2–3 pips on one gene, or the next form once it's open), shown where it came up. The first time at each
  tier also gives a sprout. You hold up to 3; older ones wilt when a fourth comes. The cost grows with the form
  (moss < herb < tree). The first run is a free sprout of the founder.
- **Saves:** localStorage, every 10 s and on close. **Offline:** the same 1 s step, run in a loop on load, capped at
  8 h, with a "while you were away" summary (area gained and lost, species lost).

## 6. Budgets *(roadmap)*
Garden step < 0.1 ms · 8 h offline < 0.5 s · `npm run check` < 10 s · ≤ 4 stocks (3 used), ≤ 6 stats (6), ≤ 10
genes per kingdom (8). Model tests run 10 h of garden in under a second; no headless runs of the side view beyond a
season.

## 7. M1: the first playable
**Question:** "Does growing a line in side view and placing it on the tier list make me want the next run?"
**In:** the home island (generated, habitats, 3 stocks, succession by soil depth, the half-year); the run with
pulses and the three forms; brood and heir; release; the garden step and spread; the tier list with 8 rows and the
ladder; the clade tree; biomass, sprouts, saves and offline. Natives as fixed incumbents.
**Out (ideas.md):** skills and parts, lineage levels and perks, events and pressure, animals, fungi, run islands, zoom layers beyond side view and island, multipliers, the codex, sound.
**Done when:** a fresh start reaches its first B in 30–60 min; a second run makes a visibly different build; you
want a third run.

### Build order (one pass, loop first) *(decided 3 Nov: oneshot)*
1. `src/data` and `src/sim`: the island (generator port), habitats, the garden step; tests for 10 h and offline.
2. The run: the toy's growth moved into `src/sim/run/`, rebuilt around pulses and offers; the three forms.
3. The loop end to end in Svelte: island screen with the tier list, the run screen, release, biomass, saves.
4. Then depth: the pixel painting, succession, the half-year, natives, the summary. Play.

## 8. Open questions
1. **Sprout pace:** how often the garden throws one up. Lean: about one per 10 min early, by feel in the dev panel.
2. **Do sprouts wilt?** Lean: hold 3, the oldest wilts when a fourth comes (a little pressure to come back).
