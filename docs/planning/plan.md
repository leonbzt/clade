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
| Playing a predator, ghosts, verbs | open (turn 2) |
| Body plans | open |
| The island view | open |
| The garden model | open |
| Species and the tree | open |
| Era and apex | open |
| The look | open |
| Code and process | fresh start decided (5 Nov); stack open (turn 2) |
| Community and scope | open |

## Calls so far
- **Fresh start** *(decided 5 Nov)*: from the current standing and ideas; copy useful code; rethink the stack from the beginning.
- **Several playstyles must be proven** *(decided 5 Nov)*, not one verb. **Verbs can come from equipment (parts); many verbs and skills** *(decided 5 Nov)*.
- **Filling a niche = C** *(decided 5 Nov)*: you pick the gap and get that role's base body; it counts only if you lived that way.
- **First roles: grazer and predator** *(decided 5 Nov)*, maybe several grazer playstyles. Filter feeders: stacking up to reach efficient current flow *(idea, yours)*.
- **A Life costs nothing at first** *(decided 5 Nov)*. **A lootbox feeling** *(wish, 5 Nov)*: **open your clutch** after a Life *(decided 5 Nov)*; garden variants as chests later.
- **Verbs:** the body plan keeps its move (chess piece); parts give verbs; **1–3 verb slots you pick** per Life *(decided 5 Nov, open to minigames later)*.
- **Stack** *(proposal, turn 3)*: the goal is now a well-made game, phones later. AI lean Godot 4 (GDScript), proven first by a one-session spike porting the Life board.
