# M1 build report (3 Nov)

The one-pass build of spec §7: what's there, every default the AI chose, a critical review, and the other options.
Everything below is a **proposal** unless the spec marks it *decided*. Nothing here changes the spec or the roadmap.

## 1. Overview
| Step | Commit | What |
| --- | --- | --- |
| 1 | `bf14864` | `src/data`, `src/sim`: island (v1 generator port), habitats, garden step, succession, game, saves, offline; 5 model tests |
| 2 | `7eab5ea` | `src/sim/run/`: the toy's growth rebuilt around pulses and offers; moss, herb, tree; brood; 3 run tests |
| 3 | `e10314d` | Svelte app: island map, tier list, clade tree, sprouts, run screen, brood, winter, release, saves, away, dev panel |
| 4 | `1207027` | Depth: "why" reasons on the map, holder news, crowding, vents, dev sprouts per form |

**Play:** `npm run dev`, open `/`. The founder sprout → Start → pick offers (or `auto`, `fast`) → pick heirs → Release.
The dev panel (top right) has speed, biomass, sprouts per form, skip 1 h / 8 h, reset. The toys are still at `/toys/`.

**Measured:** `npm run check` 6.7 s (< 10). Garden step 9 µs (< 100); game step 24 µs; 8 h offline < 0.5 s (test).
Habitat finder 0.8 ms, remap 1.1 ms (only on kind flips, every 300 s at most). 4 stocks budget: 3 used (water, light,
nutrient). 6 stats, 8 genes. Largest file 221 lines.

**Played in the browser (by the AI):** a full founder run (4 seasons, auto picks, heirs) → C 43 or D 37 → released →
the first-tier sprout → 1 h garden skip; a herb run to season 1; a tree run through winter and spring. A full herb run
to release and a full 8-season tree were not played.

## 2. Assumptions and defaults (all AI, all tunable in `src/data`)
**Island** (`data/island.ts`): 96×56 tiles; 3–4 beaches, 1–2 vents, 2–3 springs with 40-tile streams; 8% cracks on
lava; Wet at water ≥ 0.62; lava stays lava within 5 tiles of a vent. Soil: Lava < 0.3 ≤ Bare < 0.75 ≤ Forest.
Succession: soil grows 1.4e-5 / 2.2e-5 / 3.2e-5 per s per full layer (mat / herb / canopy), natives count ×0.08,
each layer stops adding soil at 0.45 / 0.9 / 1.2; checked every 60 s, kinds flip every 300 s. Lava → Bare takes
roughly 6+ h under a full mat.
**Habitats:** flood fill per kind, chunks ≤ 60 tiles, leftovers ≤ 2 tiles merge when there's room; neighbour
weights by shared border.
**Garden** (`data/garden.ts`): capacity per tile 20 kg (mat), 50 kg (herb), 1 t (canopy) × productivity. Weight =
(score × fit / 100)³; grams close 1/300 of the gap to the target share per s; growth capped at 0.12%/s + 0.5 g;
**crowding (new, not in the spec):** a species above its share shrinks only once the slot is > 85% full. Spread:
0.012% of grams per s × (0.3 + Spread) along borders, every 30 s. Fit: light (low upkeep bears shade), water (roots
help), nutrient (roots help). Shade: a full canopy takes 65% of the herb's light, a full herb layer 45% of the mat's.
Half-year: water ×(1 ± 0.25) over 30 min. Releases put 2 kg / 5 kg / 40 kg into the patch.
**Natives:** one per niche, fixed scores 30–50 (Crust lichen 30 … Pioneer trees 50), never die out (1 g floor).
**Economy:** start 20 k biomass; 0.1 biomass/s per kg held; run costs moss 10 k, herb 50 k, tree 1 M; founder free.
Sprouts: one per 900 s × (kg held ÷ 200, clamped 0.5–1.2), only after your first release; hold 3, the oldest wilts;
40% chance of the next form once open, else a jump of 2–3 pips on one gene. First time at a tier in a row: a sprout.
Ladder: B (55) in a mat row opens the herb; B in a herb row opens the tree.
**Run** (`data/run.ts`, `data/genes.ts`): 10 pulses per season; seasons moss 4×600 ticks, herb 5×900, tree 8×600;
the pick's node gets ×8 growth; 2 offers, +1 at Buds 4, +1 at Buds 7; Dominance ≥ 0.5 puts the main tip first; each
offer is previewed one pulse ahead on what you've seen of the soil. Moss: light ×0.4, segment cost ×0.8, cushion cap
8 + 9 × thickness cm, rhizoids 6–22 cm by Dive, dry spells by kind (lava 30%, bare 20%, wet 5%). Brood of 3, 1–3
genes step ±1 (20% ±2). The release takes **the last season's** body. Stat scales per form (moss reach 30 cm, spread
500, roots 120 …) were set from one season of base genes so the founder lands around C.
**UI:** the map paints 6 px per tile; mats show at 60% of their fill so the ground shows through; cover grows out
from each patch's seed tile; your lines get a dot per patch. Moss runs are zoomed ×3. Auto picks the best preview
after 0.7 s; brood picks stay manual. Saves every 10 s and on hide; a run open on load is refunded.

## 3. Critical review
1. **The pulse pick is weak, and it's the core verb.** One season of base genes: auto vs no picks moves the score by
   −6 to +16 and is often worse (herb bare 50 → 44, herb forest 54 → 50). The previews are one pulse deep and greedy,
   and the stats mostly come from season averages, so a pick barely shows in the number. If picks don't matter,
   the run is a waiting screen with a brood choice at the end. This is the M1 question's biggest risk.
2. **One decent line sweeps its row.** With score³ shares, a D 37 moss beats the 30 lichen 65:35, and the lava mat
   is ~2,400 tiles (half the island). After 8 h of garden the first moss held 860 tiles. Area is the goal, but the
   first release wins most of it, and the garden then has little tension.
3. **The economy runs away.** Biomass is linear in grams: 43 k after 1 h, ~3 M after 3 h, ~16 M after 8 h, against
   costs of 10 k / 50 k / 1 M. Past hour 3, biomass stops being a limit; only sprouts gate runs.
4. **Sprouts mostly wilt.** At saturation one comes every ~12 min; offline, most wilt unseen (8 h: ~30 made, 3 kept).
5. **The ladder target (first B in 30–60 min) is unverified.** Base moss scores 27–49 across habitats; B in a mat row
   needs good heirs. The tree climbs fast (C 51 → B 55 by season 2 of 8) and will likely overshoot to A/S.
6. **The final body, not the best one, is released.** Season scores wobble (38, 35, 40, 37), so a run can end on a
   dip you can't undo.
7. **Stat scales are fragile:** hand-set per form from one season of base genes; any growth change re-tunes them.
8. **Map readability:** native cover hides most ground; a fresh line is a dot for the first ~30 min; colours are
   golden-angle hues that can sit near ground tones.
9. **Hitches:** a herb pulse's previews take ~100 ms (3 previews × 90 ticks); the brood predicts 3 full seasons
   (~0.3–1 s for herbs) at the season's end.
10. **Spec deviations, all AI:** the crowding rule; succession slowed 5×; biomass rate 0.1/kg; herb and tree costs
    cut to 50 k and 1 M; the sprout pace. The spec's "why" lines exist only in the map hover ("shaded −20%") and as
    holder news, not as "B → C" lines.

## 4. Other options per decision
| Decision | Taken (AI) | Options | Lean |
| --- | --- | --- | --- |
| Pulse offers | 2–4 organ/place picks, ×8 focus, 1-pulse greedy preview | (a) fewer pulses (5/season), each a clear stat trade ("+Reach −Upkeep"); (b) previews to the season's end; (c) picks spend a scarce stock, so skipping is a real choice | (a): legible trades make picks matter |
| Garden competition | target share ∝ score³, steady, with crowding | (a) replicator growth: dg ∝ w·g·(1 − total/cap), S-curves, newcomers earn ground; (b) winner takes a patch; (c) Lotka–Volterra per layer | (a): slower takeovers and real fronts, still steady |
| Area as the goal | tiles held per row | (a) the share of each row (%), capped by natives' refuges; (b) the best tier per row only; (c) island-wide cover | keep tiles, but make rows smaller (split lava) |
| Income | 0.1/s per kg held | (a) per tile held × the tier; (b) per kg with diminishing returns; (c) costs grow ×1.5 per run of a form | (a) + (c) |
| Run gate | sprouts by grams, hold 3 | (a) sprouts only from firsts and holder changes (events); (b) a run timer; (c) offline sprouts kept up to 3, no wilt news | (a): fewer and meaningful |
| Released body | the last season | (a) the best season; (b) the mean of the seasons; (c) choose any season's body | (a) |
| Natives | fixed scores 30–50 | (a) natives drift up over time (pressure); (b) a second native tier appears with succession | later (M3 pressure) |
| Map | per-pixel cover by fill, natives coloured | (a) natives drawn faint, yours bright; (b) patch outlines by holder | (a) |
| Forms' scales | per-form STAT_SCALE | (a) scale by percentiles of a reference brood; (b) one scale, forms differ by niches | keep, re-tune by feel |

## 5. Plan (lean)
Play it first (30–60 min, fresh save). Then one tuning pass on the three biggest risks, in this order: make picks
legible (fewer pulses with stat trades, best-season release), switch the garden to replicator growth so fronts form,
and pay income per tile held. Each is a small data/sim change; none adds stocks, stats or genes.
