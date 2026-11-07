# Plan for the real build

Started 5 Nov in the planning session. Every item is labelled *decided (date)*, *proposal* or *idea*. Calls are logged in
`docs/decisions.md`. Inputs: `big-picture.md`, `research-digest.md`, playtests 06 and 08.

**Since M1 (5 Nov):** the living sea's design is
[design/world-and-body-review.md](../design/world-and-body-review.md), and it wins over the garden model and milestones below.
**Since then (6 Nov):** M2 is the full version; [design/full-version.md](../design/full-version.md) wins over this file and the review.

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
| Body plans | decided (5 Nov), below |
| The island view | decided (5 Nov), below |
| The garden model | decided (5 Nov), below |
| Species and the tree | proposal below |
| Era and apex | one era first, apex later (5 Nov) |
| The look | proposal below |
| Code and process | fresh start, stack test slice 08 (5 Nov) |
| Community and scope | release after the first milestone (5 Nov) |

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
- **Body plans, first milestone** *(decided 5 Nov)*: worm, arthropod, swimmer, plus the **trilobite**, maybe evolving from the arthropod *(decided 5 Nov)*. Hallucigenia once there are sponges; the brachiopod (filter feeder, stacking) next milestone.
- **Habitats** *(decided 5 Nov)*: three to start, from geology (sand shallows, volcanic rock, mud flats); the island gives habitats within authored ranges, and life changes them a little. Generated ranges may be too much for the start: author the three first *(AI reading)*.
- **Predator rules** *(decided 5 Nov)*: ambush (stay still a turn, the next move doubles) and frenzy (+1 speed per catch in a row).
- **Coming back** *(decided 5 Nov)*: open and contested niches first, news underneath. **Keep the toy's garden** and stop bad
  behaviour such as one winner *(decided 5 Nov)*; *proposal:* replace `slots: 3` with a self-limit per species (R5), so 8 h
  offline jumps to its closed-form state.
- **One era first; apex and boss later,** both kept open *(decided 5 Nov)*.
- **First release** to itch and a small Discord after the first milestone *(decided 5 Nov)*.

## Proposals for the rest
- **Species and the tree** *(proposal)*: base body by the niche you pick; release choice as decided 4 Nov; the first branch is
  arthropod → trilobite, unlocked by a milestone (e.g. a first A tier as an arthropod). No full tree yet.
- **The look** *(proposal, from R6)*: silhouette first; one palette, one non-black outline, one light direction for all parts;
  a simpler "signature" drawing at map size; role tint on the map. Spike S2 in the README can test it inside the new stack.
- **Biology** *(proposal)*: apply R2's 6 substantive corrections when porting the data; Peytoia and Hurdia become sifters, the
  hunters are Anomalocaris-like, Sidneyia and Ottoia. Tag the sea "composite Cambrian".

## The first milestone: M1, the first playable sea *(proposal)*
**Goal:** two roles that play differently, on three habitats around the island, joined by a garden that shows open niches.
**Done when:** you'd send it to the 100 nerds: you start Lives to fill niches without deciding to, a grazer and a predator Life
feel different, and a fresh start reaches a first A tier.

| # | Slice | Question | Play |
| --- | --- | --- | --- |
| 08 | [The stack test](../slices/08-stack-test.md) | Godot or PixiJS for feel, phones and workflow? | The mud flats, twice |
| 09 | The Life, for real | Does a Life feel well made on a phone in the chosen stack? | Worm and arthropod on mud flats, sand shallows, volcanic rock |
| 10 | Verb slots | Do 1–3 picked verbs make grazer builds play differently? | Sweeper, digger, tank; parts give verbs |
| 11 | The predator Life | Is hunting fun? | Swimmer; prey flee by one rule each; ground changes escape; armour; ambush, frenzy; next-step preview as an upgrade |
| 12 | Open your clutch | Does the clutch pull you into the next Life? | Eggs hatch as cards; rare parts; pick the form |
| 13 | The garden and the island | Do open niches pull you back in? | Island map, 3 habitats, niche × tier rows, self-limit model, offline, news; the garden writes the board |
| 14 | Your predator hunts you, and the trilobite | Does your own build as the hunter make a story? | Your top predator becomes the board's hunter; arthropod → trilobite |
| 15 | Ship it | Will strangers play a second Life? | Saves, a copy-species code, an itch build, a small Discord |

Each slice gets a spec from the template before code, and is played before the next. 13 may move before 12 if the Lives feel
done sooner.

## What happens to `src/` and the toys *(proposal)*
Fresh start in a new folder (`game/`), whichever stack wins. `src/` becomes the archive of the plant game.
- **Port (rules, as reference):** `toys/life2-sim.ts`, `life2-data.ts`, `life2-habitats.ts` (with R2's fixes), `toys/garden-sim.ts`,
  `garden-board.ts` (the one door), `toys/body-view.ts` (the body doll), `src/sim/island.ts` + `src/data/island.ts` (the island
  generator), `src/sim/rng.ts`, the save and offline pattern from `src/sim/save.ts` and `Away.svelte`.
- **Ideas only:** `src/sim/habitats.ts` (patch finder, for generated habitats later), `src/sim/succession.ts` (ground changing),
  `src/sim/garden.ts` (spread along borders), `TierList.svelte` (the look of the rows).
- **Leave behind:** the side-view run (`src/sim/run/`, `src/view/side.ts`, `Run.svelte`), plant genes and forms, the three.js look
  toy, the plant tests. Plants return in a later era.

## What I'd cut *(proposal)*
Overall rank beside habitat rank (one list first) · left and right sides on bodies · the apex, boss and eras (decided later) ·
filter feeders and Hallucigenia · generated habitats · garden chests · minigames beyond the verb bar · 3D · any server.

## Guardrails to keep *(proposal)*
One door between Life and garden; the Life runs alone on fixed boards; garden numbers must show on a board or the map; a slice
is played before the next starts. Drop the toy budgets (3 stocks, 10 natives) as limits; keep them as a start.
