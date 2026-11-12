# N4 Who eats whom: play notes (12 Nov)

Verdict, the user agreeing with Opus: "core there but no game".

A short play, not the full four Lives. The user's points, close to their words.

## Liked
- The animals on the map feel "good and cute"; hunters chasing others "looked cool".
- Before the first play, the map with ~4 capsules looks cute.
- Midgame preset: "the population dynamics were cool".
- The adopt mechanic; the current holders list.

## Problems
- **Capsules get stuck** on habitat borders a lot.
- **Look:** the colour and graphics of the capsules aren't there yet; plain-coloured habitats look uniform.
- **An arthropod** I introduced didn't show on the map.
- **Too much too fast:** after founding the first worm there were worms all over; after the first Life (lots of food)
  the map filled with many species.
- **Proboscis worm** had nothing to eat: one carcass (needs a larger size), shell beds marked red, no prey. Couldn't lay
  10 eggs, so couldn't adopt it. Unsure whether I could even go there.
- **What to do next** is unclear once the map is populated: where to play, challenge or adopt. No pull to grind the
  worm line, though I think I should want to.
- **Mine vs wild** is unclear, and where the hunters came from.
- **UI:** too much at once; the top rows ("preview") are unclear; holders want less info up front, maybe a grid.
  "A lot of letters everywhere."
- **Arthropod looks like a worm** (on the map all capsules share one shape per role).
- **Crush** was needed before the proboscis worm could eat: "that was nice, but it should be indicated clearer".
- **Laid eggs as a worm with proboscis and sclerites but couldn't found arthropods.** Cause: gates are only a hint on
  the tree; nothing in `sim` crosses them yet (R6, "gates from real traits").

## Wishes
- Genetic variants like v1: see populations evolve and change by themselves (pairs with adopt).
- A strong direction; maybe focus on one lineage at a time.
- An early ladder with more unlocks.

## Causes found (12 Nov, from the code)
- Stuck: at a border `view/living.ts` re-targets every frame but keeps its heading, so a capsule only turns slowly in
  place; fleeing and chasing push straight into the edge.
- Proboscis: `hunts: true` eats prey only, shells need a claw or hook (`sim/life-body.ts:89`), carcass needs size 4. On
  an early board it has no food at all.
- Worms everywhere: 12 sea generations per Life, `WILD.chance` 0.08 per open slot per generation, and spread.
- Arthropod: not checked yet (likely it shrank or was eaten during the 12 generations).
