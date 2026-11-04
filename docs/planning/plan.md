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
| The pull, filling a niche, cost of a Life | open (turn 1) |
| Playing a predator, ghosts | open |
| Body plans | open |
| The island view | open |
| The garden model | open |
| Species and the tree | open |
| Era and apex | open |
| The look | open |
| Code and process | open; R7 leans web |
| Community and scope | open |
