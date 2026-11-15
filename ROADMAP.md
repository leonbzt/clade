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
4. [x] Join the sea: it replaces the garden; the map is home, with run hooks; boards come from patches; the few named rules and "what changed"
5. [x] [20 Join the bodies](docs/slices/20-join-the-bodies.md), last part [20D slots](docs/slices/20d-slots.md): the general body in the game, lineages as data; the body screen, verbs from parts, a role guess settled by body and diet
6. [ ] [21 The climb](docs/slices/21-the-climb.md), after a Life: hatching, family tree, watch it spread; lineage XP; one tree screen and a close-up; recipes; systems arriving one at a time; then [22 The larva](docs/slices/22-the-larva.md): a body you keep growing (P48 A)

**From step 7 the core is rebuilt in a fresh folder, `clade/`** (*decided 10 Nov*; the route approved 10 Nov). How:
[whole-game-build.md](docs/design/whole-game-build.md) §8; why: [whole-game.md](docs/design/whole-game.md). `game/`
stays playable until the new game passes the play test after N4. Slice 23 is re-cut: its parts land in N4, R5, R7, R8.

7. [x] **N0** [The ground](docs/slices/n0-the-ground.md): terrain kinds, the habitat finder, names, a bare zoomable map, the palette file · 1 session
8. [x] **N1** [The core](docs/slices/n1-the-core.md): the records, `fitness`, slots, the sea step, tier cards, the placement preview, dev presets · 2
9. [x] **N2** [The Life](docs/slices/n2-the-life.md), ported, with Grow, Enforce and Lay; a purpose per Life; eggs found a population · 2
10. [x] **N3** [The screens](docs/slices/n3-the-screens.md): home map, hatching, the line view, the tree with its trunk · 2
11. [x] **N4** [Who eats whom](docs/slices/n4-who-eats-whom.md): who eats whom; wild branches; displace and adopt; patch notes with a cause; living paint and a return replay on the map (*decided 12 Nov*) · 3. Played 12 Nov: "core there but no game".

**From step 12 the order follows the maths pass** (*decided 12 Nov*: "fix board line look, also the other planned species
would be nice to add soon"; [docs/design/maths-pass.md](docs/design/maths-pass.md) Q0). Each step's cut is a proposal until its spec.

12. [ ] **N4 fix and** [the quiet sea](docs/slices/n4-fix-quiet-sea.md)**:** stuck capsules, the crush hint, no hunter build without prey; your species spread only into cells you won; wild cousins on a bar, on a leash; a refuge per tile · 1

**From step 13 the order follows the direction page** ([docs/design/direction.md](docs/design/direction.md), 15 Nov).
*Decided 15 Nov:* a present-day island of real species, sea, shore and land (2b); a lineage is a real clade with a
fixed plan and 2–3 dials, and named real species are its leaves (1c); movers only are playable, plants and sessile
life are board pieces (3a); the island is young and real species arrive as colonists; animals come to land only as
lines gain key adaptations; variant hunting makes the map its own loop. **Adopted 15 Nov** ("adopt"). The steps
replace the 12 Nov order (N5, N6, N7, L1, the closed test, R5, A, R7–R11); N6 and N7 are gone, N5 and L1 stay. Each
step's cut is a proposal until its spec.

13. [ ] **W1** The wide toy: about 40 real species as data rows, sea, shore and land cells on the slot board, the laws, the derived food web, the one next goal, variants to compare and adopt ("is this a board I want to climb and look through, and can I tell species apart?") · 2
14. [ ] **W2** The model swap in `clade/`: records become clades, dials and mutations, `fitness` and the hunt run on the laws, the data tests; the first line plays as the worm did · 2
15. [ ] **N5** The board: the map's holders as a grid of jobs; the one next goal; letters against the meta; Take, Beat, Hold, Adopt; variants drawn and marked on the map · 2
16. [ ] **The closed test:** an unlisted itch page for 3–5 Discord players (sea and shore, about 30 species, one or two lines)
17. [ ] **W3** The trait pipeline and the roster to 60: the source check, the generated tree, grades per trait, the roster sheet, researcher batches · 1, plus batches
18. [ ] **W4** The land: ground kinds, producers as board pieces colonising on a bar, a habitat names the adaptations it needs, the first line to come ashore by a key adaptation · 2
19. [ ] **W5** Lines: XP from eggs and held cells, levels, dial steps and mutations in the clutch, named species, the tree as the unlock map · 2
20. [ ] **L1** The look contract in code: a plan per clade from the body grammar, stamps, the contact sheet and its two checks · 2
21. [ ] **A** The alpha pass: the first fifteen minutes, saving, a light UI pass; **the public alpha** on itch (roster 100–150) · 2–3
22. [ ] **After the alpha**, each a public update: sea and land features, engineering, more lines and species, art and UI polish, the release (M1's leftovers, a clean repo, Discord)

## Built: M1, the first playable sea (5 Nov; "the basics seem fun and as imagined"; its release moved into M2, step 17)
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
