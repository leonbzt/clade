# Slice 09: the Life, for real

**Milestone:** M1, step 2 (ROADMAP)
**Question:** does a Life feel well made on a phone, on three boards that play differently, as a worm or an arthropod?
**Builds on:** plan.md (5 Nov): three habitats from geology (mud flats, sand shallows, volcanic rock); worm and arthropod;
Pixi picked. Your words at the M1 run's kickoff (5 Nov): the palette needn't stay; "more realistic in the textures" and
"more gamey/osrs".

## In
- **Three boards**, 8 × 11, plain data in `game/src/data/habitats.ts`:
  - *Mud flats* (done): hidden food in mud, the mudslide on turns 12–15. Worm country.
  - *Sand shallows*: open sand with mats and shell beds, two small mud pockets, the hunter early (turn 4). **Low tide**
    on turns 9–12: the three rows nearest the shore run dry (no oxygen there), and the rich mats grow there. Arthropod country.
  - *Volcanic rock*: basalt lanes that cut moves short, warm vent seeps (dead water with sulfur mats, rich but no oxygen),
    shell beds in the cracks. **Vent surge** on turns 8–10: oxygen falls everywhere. Gills matter.
- **Rares per board** (from the toy): mud: deep burrow, compound eye; sand: hooked proboscis, enrolment; rock: sulfur
  symbionts, blue blood. Progenesis stays the second everywhere.
- **The arthropod drawn**: a rigid, plated body that turns as one piece (the worm trails), walking legs that step, its
  parts on the body (claw, head shield, eyes, spines, legs, digging limbs, gills, gut glow, pouch).
- **A plain pick screen** before each Life: three board cards and two body cards, each with one line on how it plays,
  and your best tier there this visit. Gone once the island exists (slice 13).
- **The look, redone** *(AI choice, from your words)*: realistic ground textures (sand grain and ripples, silty mud with
  burrow holes, pitted basalt, vent crust) on the low-poly facets, earthier colours under blue-green water; the menus
  in a gamey stone-and-brass frame with yellow numbers, in the spirit of OSRS (no copied art).
- **Phone layout polish**: a bigger board (a slimmer bottom panel), the stocks on one row, thumb-sized buttons.

## Out
- Verb slots (slice 10), the predator Life (11), eggs as cards (12), the island (13). Saves (15): the best tier lasts
  only this visit.

## Done when
- [ ] You pick a board and a body, and the three boards ask for different play.
- [ ] The arthropod reads as an arthropod at phone size.
- [ ] `npm run check` passes; `npm run look` shows each board and body at 390 × 844.
- [ ] Your notes are in `docs/playtests/`.

## Size check
- New systems: none (a board event over rows, two terrains' nodes, the pick screen).
- Fits one session.

## AI choices to judge
- Low tide and vent surge as the two new events; the boards' maps; the hunter is Anomalocaris everywhere (R2).
- The new palette and textures; the OSRS-like frame.
