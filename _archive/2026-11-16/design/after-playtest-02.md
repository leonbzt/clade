# After playtest 02: why it reads as a toy, and the new course (3 Nov)

AI analysis of [playtests/02-builds.md](../playtests/02-builds.md); you: "I like all of these insights" (3 Nov).
Your calls are in [decisions.md](../decisions.md); this file keeps the reasoning.

## What part B (the tree) would and wouldn't fix
| Your note | Part B? | What fixes it |
| --- | --- | --- |
| No own shadow; one plant per run | no | The stand, shadows drawn |
| Levels should follow growth | no | Biomass grown = XP → levels → pips you place |
| Broods not liked | no | Saplings you watch grow and pick from (your idea, below) |
| "Sport" unclear | no | "Mutation" |
| The spot differs each run | no | You choose it (the map pick exists but nothing says so) |
| Other attributes' effects unseen; a gene view | no | Each effect shown where it acts in the run; a gene view |
| Low-res low-poly look | no | A look toy, then a look pass |

Part B adds build identity (named forms, locked rewards). It's a fourth layer; the run under it isn't right yet.

## Why it reads as a toy
1. **Playing well doesn't feed progression.** Levels came from the brood pick, not from how well the plant grew.
   An RPG feels serious because the fight pays the XP; ours didn't.
2. **The run's space is hidden.** One plant, and self-shade that matters (0.8 per leaf above) but isn't drawn.
3. **Effects don't show where they act.** Shade, Roots, Endurance change numbers you never see change.
4. **The look is a placeholder.** Art direction carries a lot of "serious".
5. **Systems were stacked before the core worked:** attributes, CSR, pressures, then a tree, on an unproven run.

## Steering: the cycle to break
Live growth (grow toy, 2 Nov: "didn't really see a benefit of steering") → pulses (3 Nov: "less autogrowth") →
"I just auto every time". Both failed for the same reason: **steering didn't visibly change the outcome**, and auto
was as good as you. Live vs turns isn't the fix. What makes steering matter:
- **Shadows drawn:** a steered shoot visibly takes light from a rival or a sibling.
- **Several saplings:** steering decides which one wins the year, and you pick among them.
- **Auto is naive:** the genes grow up and toward light; you know where the gaps, pockets and stones are.
- **Steering is scarce** (costs nutrient or attention), so it's a choice where to spend it, not clicking everything.

## Your run idea (3 Nov), with AI notes
"A few saplings growing at the same time, you can steer all of them, and select one at the end to found the next
year, where the new saplings start as that + random mutations."
- **Risk: attention.** Live steering of 3–5 plants can be hectic. *Proposal:* 3 saplings, slow growth with pause
  and speed, steering as targets (a light gap, a soil cell) that a tip heads toward, as the toy's dig did.
- **Risk: the pick is always "the biggest".** The pressure ramp gives it a trade: a smaller sapling with +2
  Endurance may be the right founder for Lava mat. Show both (grams and the niche score) on each sapling.
- **Levels:** the stand's biomass grown → XP → pips you place on the founder at the year's end; mutations stay
  random on top. Risk: a Pace snowball; genome upkeep is the counter.

## The course (decided 3 Nov)
1. A look toy (slice 02): 2D low-poly vs simple 3D, both low-res and procedural, the references' UI.
2. The stand: your run idea, levels from growth, the spot chosen, effects shown, mutation for sport.
3. Variants in the garden, hunted on the map (P40). Then part B (the tree) and the map with income.

## The hunts (P40, decided 3 Nov: both)
Your fun parts were hunts: roots reaching hidden pockets (v2) and variants forming by themselves (v1, playtests
07–08). So discovery is the core verb, with steering on top:
- **Below (the run):** roots race your other saplings and the natives for hidden pockets (hints, stone, a rare find).
- **Above (the run):** cutting in winter, extra energy sent into one shoot, toward lit gaps and away from shade.
  Light and shade are drawn, so "things to dodge or go towards" read at a glance.
- **On the map (the garden):** variants mutate in proportion to grams, spread or fade by fit, and rare ones glint
  until seen; you found one, and it gets a run. v1's `src/sim/variants.ts` is read for ideas, not ported (tiles there,
  patches here). Budget: cap live variants per species.
