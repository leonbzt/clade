# The world and the body: where the game stands (5 Nov)

*AI analysis of your first notes ([playtest 10](../playtests/10-m1-run.md)), v1 and the v2 map. **Decided (5 Nov):** the living sea, the
body proposal, the skill tree, the order in section 7, role from body and diet, 8 h catch-up about 5 s (up to 10). **Still open:** how
limited the inventory is, banked offline time, and the details below. Your exact words: [decisions.md](../decisions.md).*

## 1. The short version
The Life is right, and you said so: board, moves, foods, verbs, lurk and pounce, niches and tiers. Keep all of it. What's missing
is everything around the Life. v1 was a world with no game; the M1 build is a game with almost no world. The job is to put a world
back without losing what v1 lost: learnable causes, cheap saves and offline.

## 2. Three maps compared
Looked at by running each one (v1 from `slice-11e`, grown 21 game minutes by its autoplayer).

| | v1 | v2 plant map | Garden toy | Now |
|---|---|---|---|---|
| **What a place is** | Tiles (10 m), habitats found by the sim | Tiles for land, 89 patches for life | 3 boards side by side | 3 fixed spots, 3 numbers each |
| **Can a place change shape?** | Yes, each window | Yes: life builds soil, Lava → Bare → Forest | No | No |
| **Do you see spreading?** | Yes: green patches grow across the lava | Yes, patch by patch | No, one board per habitat | No |
| **Does anything move?** | Yes, animals and growth | Little | Yes, creatures roam | **Nothing: 1 distinct frame in 4** |
| **Layers to look at** | 9 views: garden, zones, water, soil, nitrogen, shade, variants, animals, habitats | Hover a patch for its holder | Mats, detritus and oxygen bars, the next board in words | Species bars only |
| **Crashes** | Yes: snails were best grazer at 18:00, dead at 19:30 | Not checked | Not checked | None in 1,000 generations |
| **New forms turn up by themselves** | Yes, with rarity and gene pips | Sprouts | No | Only as clutch cards |
| **Cost** | 1.3 ms a tick, 6 min CPU for 8 h | 0.01–0.2 ms by size, on paper | Same as now | 0.08 ms; 13 ms for 8 h |
| **Weakness** | Hard to read, one moss takes everything, no saves | Plant game, patches feel abstract | Only 3 places | Dead map |

The frame count hashed the whole page, so a ticking clock counts as movement in the others. Today's island scoring 1 in 4 is the
real finding: nothing on it changes at all.

**Worth taking from each:**
- **v1:** spreading you can see, layer views, headlines the sim writes itself, crashes, forms that surprise you, "it feels alive".
- **v2:** the patch model. It's the cheap way to get v1's picture, and `CLAUDE.md` already allows porting it.
- **The toy:** resource bars with a "normal" mark, "Next board: 11 mats · 15 buried…", creatures on the overview. All three were
  lost in the port, and they're easy to bring back.

## 3. v1's core vision against the game now
| v1's line | Now |
|---|---|
| "The feeling of growing an ecosystem and growing your species is the most important thing." | Half: you climb tier lists, nothing grows |
| "It appears on the map. When you evolve and move on, it stays, and the ecosystem expands." | Stays as a row on a card, not on the map |
| "The board must live on the map." | Lost: the board is on cards |
| "Habitats on the map are the slots… like an RPG equipment loadout." | Slots yes, as text; no pictures |
| "Traits are visible on the species, even drawn small." | Worm and arthropod draw parts, small; the swimmer barely |
| "Simple core, strong progression." | Simple core yes, progression no |
| "Swings are wanted… some species dying out." | Not happening |
| "Things push back." | Yes: natives adapt and take rows back |
| "The sim decides; the game names it." | Partly: roles are read from diet, boards are mostly authored |
| "Genes appear and spread by themselves." | Left out on purpose so far |

## 4. Why the map feels dead, in the code
- `drawIsland` paints the map once from the seed. The garden never touches it, and it holds three pots with no geometry.
- A role's total is set by `capacity()`, which reads only stocks. A species can only take a share, so it can't boom.
- Populations ease toward capacity (`rate: 0.35`). That maths can't overshoot, so it can't crash.
- Grazing and churn are too weak to move the stocks: an S-tier worm leaves board mats at 9.9, same as no worm.

So this is the model, not tuning. No number will bring it alive.

## 5. Proposal: the living sea
Your call was a mix of readable rules and real populations, plus an overview map. In layers:

1. **Patches around the shore.** Use the island we already generate. Cut the shallows into about 40–90 patches with v2's finder.
   Each holds its ground kind, mats, rot, oxygen and its populations.
2. **Real populations.** Each species grows from the food it finds and eats it down, and hunters follow with a lag. That overshoots
   by itself, so booms and crashes need no script. A dead row is an open niche, which feeds the loop you like. A crash can also end
   a lead that today would hold forever at 47 eggs.
3. **Spreading.** Crowded species flow along patch borders, as in v2. Your line shows up next door without you doing anything.
4. **Readable rules on top.** The effects stay few and named, and the start card says what changed and why:
   - grazers boom → mats thin out
   - burrowers boom → mats churned away, more buried food, oxygen shifts
   - hunters boom → they arrive earlier, and prey gets scarce and wary
   - a crash → carcasses and rot, then regrowth
5. **Habitats can move.** Enough churn turns sand to mud at the edges. You walk on the patch you pick, so the board comes from that
   patch through the same door (`boardFor`).
6. **The overview map.** Patches painted by holder, with views for mats, oxygen and hunters, small creatures roaming, and headlines
   from the sim. Tap a patch for its card and bars.

**Cost.** *Decided (5 Nov):* 8 h catch-up about 5 s, up to 10; that's about 30 ms a generation at 160 generations. 89 patches at
today's cost per habitat would be about 2.4 ms a generation, so there's roughly 12× room for a richer model. That's a scaling
estimate, not a test. Banked time is parked as an idea.

**Risks.**
- Crashes can feel random. Every crash needs a headline with a cause.
- Learnable boards are what you liked, so patches should vary what's on a board, not its layout.
- This needs a toy first, as the Life did. Rule 5: one question, "does the map feel alive?"

## 6. Proposal: the body
**The new flow.** Pick a place → build the body → see the verbs it gives and a guess at its role → live → the role is settled.

- **Body screen.** A big drawing of your creature with its slots visible, and an inventory of parts beside it. Tap to plug in; the
  creature changes as you do. The sim already has this shape: slots have a kind, side and segment, and the worm and arthropod draw
  parts. The new work is mostly art: sprites for about 13–14 parts per body.
- **Verbs from the body.** The verb list becomes a readout of what the parts give. `VERB_PART` already holds the link, so it mainly
  turns around.
- **Role as a guess.** "This body: Burrower 70%, Grazer 30%", against each row in that habitat. Sand can say plainly that a worm
  fits badly there, which is the honest version of your "not all roles fit everywhere".
- **Passing on becomes an inventory.** Today's one-form-per-niche is the weak part. Instead, parts you pass on join your line's
  inventory for good, and slots and upkeep are the limit. That's your "passing on unlocks". Moult offers stay, so Life decisions stay.

**How free should bodies be?**
- **A. Parts into authored bodies (lean, now).** Worm, arthropod and swimmer stay. It keeps creatures recognisable and art affordable.
- **B. Pluggable segments, heads and tails (lean, later).** Chassis pieces become rare items: an extra segment is a real find. It
  fits v1's "clades are authored, species are free".
- **C. Fully free bodies.** Most expressive, but real animals get lost, art cost is much higher and balance is hard. I'd avoid it.

**Skill tree (your idea, and it's a strong one).** A verb needs its part as the key, plus XP in its skill from doing it.
- Skills: Digging, Grazing, Hunting, Armour, Senses, each with about 3–5 nodes. For example, Hunting: Lurk → Pounce → Frenzy.
- Parts answer "what can this body do?"; skills answer "what has my line learned?". XP lasts across Lives, which gives the
  OSRS/Melvor climb the game lacks, and the body and the tree pull on each other.
- The risk: lurk and pounce are the fun, so they can't be locked for long. First nodes should open in the first Life or two.
- `l.xp` and Foraging already exist, so this has a place to start.

## 7. Suggested order
| Step | What | Why here |
|---|---|---|
| 0 | Quick wins: resource bars and "next board" back from the toy, a new font (options in `toys/fonts.html`), label clipping | Small, and you've asked for each |
| 1 | Toy: patches with real populations and crashes, seen on a map | The riskiest question, and your top priority |
| 2 | The overview map in the game; boards from patches | Makes step 1 real |
| 3 | The readable rules and "what changed" on the start card | Delivers "species has to change the board" |
| 4 | Body screen, verbs from the body, role guess, inventory | Next biggest; the role can then feed the map |
| 5 | Skill tree | Needs verbs from the body first |
| 6 | Look pass, plus one more body or niche such as buried sand | Art lasts better once screens have settled |

Today's M2 (filter feeders and sponges) would wait behind this. That's a ROADMAP change, so it's your call.

## 8. Still unknown
- Whether v1's feeling survives moving from thousands of tiles to about 90 patches. The toy answers this.
- Whether the sea should stay near the island's shore, or whether land comes back later.
- How crashes and an 8 h offline run feel together: a night away could bring a lot of bad news at once.
