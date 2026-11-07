# Roadmap

> **Adopted 5 Nov** from the planning session ("adopt the roadmap"). The plan: [docs/planning/plan.md](docs/planning/plan.md).
> The plant M1 and M0 are history in git (`v2` branch). This file changes only on your call; AI may propose edits.

We build only for the current milestone; everything else waits in [docs/ideas.md](docs/ideas.md).

## Now: M2, the full version (release)
**Goal:** "a clean freshly put together full version that i can release to get feedback and ideas": the Life and the living sea as one game (*decided 6 Nov*: "sounds good, order good").
**Done when:** *proposal, yours to change:* you'd send it to strangers: "I played this run, I advanced my lineage, I can see it on the map, and I know what run I pick next"; 6–10 lineages
look and play differently, and you recognise your own; a line reaches the shore.
Design: [docs/design/full-version.md](docs/design/full-version.md). **Staying on the road:** every slice names a step below; anything else goes to `docs/ideas.md`.

1. [x] [16 Quick wins](docs/slices/16-quick-wins.md): the toy's resource bars and "next board" line, a new font, clipped labels
2. [x] [17 The sea toy](docs/slices/17-sea-toy.md): patches with real populations and crashes, seen on a map ("does the map feel alive?")
3. [ ] [18 The body toy](docs/slices/18-body-toy.md): one general body, parts on slots, recipes ("is the one I built the one I see?")
4. [ ] Join the sea: it replaces the garden; the map is home, with run hooks; boards come from patches; the few named rules and "what changed"
5. [ ] Join the bodies: the general body in the game, lineages as data; the body screen, verbs from parts, a role guess settled by body and diet
6. [ ] After a Life, and the climb: hatching, family tree, watch it spread; lineage XP; one tree screen and a close-up; recipes; systems arriving one at a time
7. [ ] More lineages, the algae layer and the food chain: 6–10 lineages, about 15 if the toy makes it easy
8. [ ] The shore: the special Life on the tide line, "to be continued" (*proposal:* placed here by AI)
9. [ ] The UI and art pass, for every screen and creature
10. [ ] Release: M1's leftovers (saving mid-Life, clutch odds, balance), a clean repo, itch, Discord

## Built: M1, the first playable sea (5 Nov; "the basics seem fun and as imagined"; its release moved into M2, step 10)
1. [x] [08 The stack test](docs/slices/08-stack-test.md): Godot or PixiJS → **PixiJS** (5 Nov)
2. [x] 09 The Life, for real: three boards, worm and arthropod, feel and phone layout
3. [x] 10 Verb slots: parts give verbs, 1–3 picked; grazer styles
4. [x] 11 The predator Life: the swimmer, readable prey, ground and armour, ambush and frenzy
5. [x] 12 Open your clutch
6. [x] 13 The garden and the island: niche rows, self-limit model, offline, news; the garden writes the board
7. [x] 14 Your predator hunts you, and the trilobite branch
8. [ ] 15 Ship it: saves, a copy-species code and the itch build are done; **the itch release and Discord are not**

## Later (order and scope set when we get there)
| Milestone | Could build | Question |
| --- | --- | --- |
| M3 Filter feeders and sponges | The brachiopod's stacking minigame, sponges, more mechanics and minigames, garden chests | Does a new kind of Life widen the pull? |
| M4 Apex and era | The apex slot and its era-wide rule, the boss Life, the next real era | Does taking the apex feel like a climax? |
| After | Generated habitats, more body kinds, playable algae and plants, life ashore, phones | Set later |

## Budgets
8 h catch-up about 5 s, up to 10 (5 Nov; the garden step is whatever fits that, about 30 ms a generation) · tests < 10 s. The toy's budgets (stocks, natives) are a start, not limits; the algae layer's 3–5 kinds may pass the 4 stocks (your pick, 6 Nov).
