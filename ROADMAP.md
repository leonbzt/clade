# Roadmap

> **Adopted 5 Nov** from the planning session ("adopt the roadmap"). The plan: [docs/planning/plan.md](docs/planning/plan.md).
> The plant M1 and M0 are history in git (`v2` branch). This file changes only on your call; AI may propose edits.

We build only for the current milestone; everything else waits in [docs/ideas.md](docs/ideas.md).

## Now: M2, the living sea
**Goal:** "world is core": a sea of patches where populations boom and crash, species spread and change the boards, seen on an overview
map; a body you build and a climb to go with it (*decided 5 Nov*; the steps are the review's order: "the order sounds good").
**Done when:** *proposal, yours to change:* the map feels alive; your species changes the board you walk on, and you can say why; you
build a body you recognise; the skill tree gives you a climb you want to go on with.
Design: [docs/design/world-and-body-review.md](docs/design/world-and-body-review.md).

1. [ ] [16 Quick wins](docs/slices/16-quick-wins.md): the toy's resource bars and "next board" line, a new font, clipped labels
2. [ ] [17 The sea toy](docs/slices/17-sea-toy.md): patches with real populations and crashes, seen on a map ("does the map feel alive?")
3. [ ] The overview map in the game; boards come from patches
4. [ ] The few named rules, and "what changed" on the start card
5. [ ] The body screen: big drawing, visible slots, inventory; verbs from plug-ins; a role guess, settled by body and diet
6. [ ] The skill tree: part plus XP unlocks a verb
7. [ ] A look pass

## Built: M1, the first playable sea (5 Nov; "the basics seem fun and as imagined"; only the release is left)
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
| M3 Filter feeders and sponges | The brachiopod's stacking minigame, sponges, Hallucigenia, garden chests | Does a new kind of Life widen the pull? |
| M4 Apex and era | The apex slot and its era-wide rule, the boss Life, the next real era | Does taking the apex feel like a climax? |
| After | Generated habitats, more body plans, the tree, life ashore and plants, phones | Set later |

## Budgets
8 h catch-up about 5 s, up to 10 (5 Nov; the garden step is whatever fits that, about 30 ms a generation) · tests < 10 s. The toy's budgets (stocks, natives) are a start, not limits.
