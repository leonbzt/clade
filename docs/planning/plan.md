# Plan for the real build (part 2, in progress)

Started 5 Nov in the planning session. Every item is labelled *decided (date)*, *proposal* or *idea*. Calls are logged in
`docs/decisions.md`. Inputs: `big-picture.md`, `research-digest.md`, playtests 06 and 08.

## The game in one screen *(proposal)*
1. **Island map.** The volcanic island with habitats as areas in the sea around it (big-picture §4).
2. **Habitat card.** Each habitat shows a roster of niches (grazer, burrower, filter feeder, predator) × tier rows. Empty or weak
   slots are the call to action: "Predator in the reef: nobody of yours. Rank to beat: B."
3. **Life.** You pick a gap and play a Life there (about 5 min, 20 turns). Each role has its own verb.
4. **Release and rank.** Eggs add population and score your body in that niche.
5. **Garden runs,** offline too, with a self-limit per species so no one takes the row (R5). Changes show as bars and news.
6. **Back to 1.** The board has changed; your own past predators can now hunt you (R4).

## Biggest doubt *(AI)*
The pull is "play the other niches", so each role needs its own verb. That is the most authoring and the most tangling in
the plan, and only one verb (walk and eat) has been played. So the first build should prove a second verb (the predator)
before porting the garden.

## Topics
| Topic | State |
| --- | --- |
| The pull, filling a niche, cost of a Life | decided (5 Nov), below |
| Playing a predator, ghosts, verbs | predator decided (5 Nov); ghosts open |
| Body plans | open |
| The island view | open |
| The garden model | open |
| Species and the tree | open |
| Era and apex | open |
| The look | open |
| Code and process | fresh start, stack test slice 08 (5 Nov) |
| Community and scope | open |

## Calls so far
- **Fresh start** *(decided 5 Nov)*: from the current standing and ideas; copy useful code; rethink the stack from the beginning.
- **Several playstyles must be proven** *(decided 5 Nov)*, not one verb. **Verbs can come from equipment (parts); many verbs and skills** *(decided 5 Nov)*.
- **Filling a niche = C** *(decided 5 Nov)*: you pick the gap and get that role's base body; it counts only if you lived that way.
- **First roles: grazer and predator** *(decided 5 Nov)*, maybe several grazer playstyles. Filter feeders: stacking up to reach efficient current flow *(idea, yours)*.
- **A Life costs nothing at first** *(decided 5 Nov)*. **A lootbox feeling** *(wish, 5 Nov)*: **open your clutch** after a Life *(decided 5 Nov)*; garden variants as chests later.
- **Verbs:** the body plan keeps its move (chess piece); parts give verbs; **1–3 verb slots you pick** per Life *(decided 5 Nov, open to minigames later)*.
- **Stack** *(decided 5 Nov: lean Godot, PixiJS the alternative; test first)*: [slice 08, the stack test](../slices/08-stack-test.md) builds the mud-flats Life twice, with feel values you tune yourself.
- **The predator** *(decided 5 Nov)*: seeing the prey's next step, maybe as an upgrade; you can change your movement and speed; the substrate changes how prey escape; armour matters.
- **Your predator chases you** *(decided 5 Nov)*: your best predator body in a habitat becomes that board's hunter once it ranks top. Special predator rules or mechanics welcome *(wish)*.
- **Grounds** *(decided 5 Nov, first boards)*: mud, sand, reef, matching the natural map's ground.
- **Body plans, first milestone** *(decided 5 Nov)*: worm, arthropod, swimmer, plus maybe one memorable extra (turn 5).
