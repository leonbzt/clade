# The big picture: Life, garden, era

**4 Nov. AI draft from your calls, as input for your own spec.** *Decided (date)* is yours; *proposal* is AI's and
hasn't been played. Only the Life has been played. Everything about the running garden is a hypothesis until a toy
tests it.

## 0. What playing has taught so far (5 Nov, [playtest 08](../playtests/08-garden.md))
- **The route is decided:** "i want to go down this route with the actual build."
- **Liked:** the overview with creatures roaming, the stock bars, skipping to see changes, variant offers.
- **Waiting didn't pull. Wanting to play did:** "didn't have a big pull to wait and see what changes", but "really felt sad i couldn't play to fill the other niches" and "really wanted to play as a
  predator". *AI read, from one session:* the garden's strongest job may be showing what you haven't filled yet, more than news of what changed. §6 and §7 below were written before this.

## 1. The game
*Proposal wording, your calls:* you live one creature's Life at a time on a real habitat: walk, eat, grow up, lay
eggs. The eggs join a living garden, where your species competes with everything else in that habitat and climbs its
tier list. What the garden becomes is the next board you walk on.

```
ERA      Earth history: which world, which rules, one apex slot        weeks
  │      the environment nudges it toward the next real era
  ▼
GARDEN   a map of connected habitats that runs by itself, offline too  idle
  │  ▲   populations · tier lists · news · variants
  ▼  │
LIFE     one creature on one habitat's board, 20 turns                 about 5 min
         move · eat · moult · lay · survive
```

- **The Life is the core and the first zoom stage** *(decided 4 Nov: "i want to go on with this as a core", "a perfect
  first zoom stage")*.
- **Habitats are areas in the garden** *(decided 4 Nov)*.
- **The sim is not the game** *(decided 4 Nov)*, but **the feeling of a living ecosystem is really important** *(decided
  4 Nov)*. So the garden is a simple model that looks and acts alive; it isn't a detailed simulation.

## 2. The loop
1. **Garden:** read what changed and see which niches are open. Pick a habitat and a species.
2. **Life:** play the board. Your build proves itself *(decided 4 Nov)*.
3. **Release:** eggs add population either way; you choose whether this body becomes the species' form *(decided 4 Nov)*.
   A rare part passes on if you laid after getting it.
4. **Rank:** the Life's eggs score this body in this habitat, which sets its tier. Ranked within its trophic role, in a
   capped habitat *(decided 4 Nov)*. Overall and habitat rank can disagree *(decided 4 Nov)*.
5. **Garden runs:** populations rise, crash and spill. Then back to 1, and the board has changed.

Two arrows make this one game instead of two:
- **Life → garden:** eggs are both population and proof.
- **Garden → Life:** "the tier list is the level generator" *(decided 4 Nov)*. See §3.

## 3. How the garden writes the board *(proposal)*
Each habitat keeps its learned map, so route knowledge lasts. What's on the map comes from the garden, so you know the
place and can see it has changed. Three stocks per habitat (the budget allows four), each one visible on the board:

| In the garden | On the board |
| --- | --- |
| **Mats** stock: grows by itself, grazers eat it | Number of microbial mats |
| **Detritus** stock: fed by deaths and by what drifts in | Number of buried food nodes and carcasses |
| **Oxygen** stock: falls with decay, rises with burrowing | How much dead water; low-oxygen events |
| Filter feeders living here | Brachiopod beds and sponge gardens |
| Top grazer in the list | The rival: its name, what it eats, how many |
| Top predator in the list | The predator: its name, when it arrives, later its move pattern |
| Your species' population | Your own descendants on the board, as rivals |

*Your wish (5 Nov):* "your predator behaviour would later chase you": your own predator line on the board as the hunter, with its build. Not possible in the toy yet.

**Role comes from the Life** *(proposal)*: what you ate sets your trophic role. Mostly mats makes you a grazer in that
habitat; mostly buried food a deposit feeder; shells and carcasses a predator or scavenger. Nobody picks a role from a
menu, so a build can surprise you.

## 4. Is there still a garden? Yes, and most of the engine exists
Built for the plant version and reusable *(checked in `src/`, not yet run with animals)*:

| Exists | Does | Change needed |
| --- | --- | --- |
| `src/sim/habitats.ts` | Patches, and a neighbour graph weighted by shared border | Sea kinds instead of land kinds |
| `src/sim/garden.ts` | Shares by score³, spread along borders, native incumbents, 1 s step | Slots per role, not per plant layer; the three stocks above |
| `src/sim/succession.ts` | Tiles change kind when a stock crosses a threshold | Mud, reef and dead water shifting |
| `src/sim/save.ts`, `Away.svelte` | Saves, 8 h offline, "while you were away" | Little |
| `src/sim/island.ts`, `src/view/island.ts` | Island generator and map view | A sea shelf (§9) |
| `TierList.svelte` | Rows × F…S | Habitat × role rows |

Not reusable: the side-view run (`src/sim/run/`, `src/view/side.ts`, `Run.svelte`), the plant genes and forms. They wait
for the plant era (§9).

**The island view stays** *(the world is decided, 4 Nov; you asked about the view, 5 Nov)*. *Proposal:* the top level is the island map, as in the old plant app at `/`, with the habitats as areas in the sea around it. Click one
and you zoom into its board. The toy's strip is a stand-in, and nothing is built in that sea yet (spike S3 in [planning/README.md](../planning/README.md) would try it).

## 5. How habitats connect *(proposal)*
One map of bordering habitats, not separate levels. Three links, each visible on the map and each felt on a board. Start
with the first; add the others only if the garden toy calls for them.

1. **Spill (species).** When a role in a habitat is full, the surplus moves across borders. Your mud worm turns up in the
   reef's mud pockets without you, and the reef's list shows "Worm, D, arrived by spill". Now you may want to go and live
   there. `spread()` already does this.
2. **Drift (food).** Dead matter moves down the transect: reef → mud flats → basin. If the reef crashes, the mud flats
   get fewer buried nodes later. That's a cascade with one rule (real: marine snow), and you said chains are features.
3. **Roaming (the predator).** The apex predator hunts across habitats, and the map shows where it is this season. That
   board gets it early and the others are quieter, so it shapes where you choose to live.

*Idea, later:* door tiles on a board's edge, so a Life can cross into the next habitat and found a population there.

## 6. What makes it feel alive *(proposal, cheapest first)*
1. **It changes while you're away,** and tells you as news: "Wiwaxia crashed in the reef. Your worms spilled in."
2. **Every change has a visible reason** on the map and on the board.
3. **Small creatures roam the map,** drawn with the same body doll as yours, their number a capped readout of the
   population. They aren't simulated one by one (v1 showed the risk: "snails and springtails overran the map").
4. **The same residents are on the board** when you go in, including your own descendants.
5. **Species shape the place** *(decided 4 Nov)*: burrowers churn away the mats and oxygenate the mud (real: the Cambrian
   substrate revolution); the mud flats slowly become a different place.
6. **Swings and history:** booms, crashes, extinctions, a population graph. These are the stories people would tell on
   Discord.

**An example of the feeling** *(made up, nothing like this runs yet)*: your Deep-burrow worm hits S in the mud flats and
booms. Burrowing churns the mats away, so the next board has fewer of them. With more prey, Peytoia rises and arrives on
turn 4 instead of 6. Surplus worms spill into the reef, where they rank D. While you were away, the garden threw up a worm
with sclerites. You go in to defend your S tier.

## 7. Rare parts: two sources *(first decided, second proposal)*
- **In a Life:** at a moult, pass it on by laying *(you loved this, 4 Nov)*. v2: each habitat holds its own.
- **From the garden:** your populations throw up variants by themselves, more often the bigger they are (your 3 Nov call on
  variants the garden breeds, P40). "Your mud worms threw a Hooked proboscis. Go live it." This is the idle → active pull,
  and it gives the idle layer a job you can feel.

## 8. Era, apex slot, tree
- **Apex slot** *(decided 4 Nov)*: one per era; its holder sets **one era-wide rule**, and **your species can take it**.
  *Proposal:* it starts with a real predator and is the boss: a special Life where it hunts you with its full kit, and you get
  mechanically better at it.
- **Next era** *(decided 4 Nov)*: a real one. You stay free to evolve your own things, and the environment promotes that it
  resolves naturally into the next real era. *Proposal:* oxygen, substrate and new habitat kinds do the nudging.
- **Species** *(decided 4 Nov)*: kept until you choose to branch. **Bodies grow during the Life** from a plan and starter parts.
- **Evolution tree** *(your sketch, 4 Nov)*: playstyles and parts, loosely following the real tree. *Proposal:* new body plans
  are new chess pieces, unlocked by milestones such as a first S tier in a habitat.
- **Authoring** *(decided 4 Nov)*: the rules of nature are authored with freedom on top; selecting real things drives the content.

## 9. What happens to the old plan
| Piece | spec.md (3 Nov) | Now |
| --- | --- | --- |
| The run | Side-view plant | A Life *(decided 4 Nov)* |
| The garden | Island patches, idle | Stays *(decided 4 Nov)*; slots by role *(proposal)* |
| Score | Stats × niche weights | Eggs on that habitat's board *(proposal)* |
| Tier list | Niche × F…S | Habitat × role, plus overall *(decided 4 Nov)* |
| Plants | The first kingdom | The baseline *(decided 4 Nov)*; playable later *(you, 4 Nov: they fit the body concept)* |
| Reward | Biomass, sprouts | Population, variants *(proposal)* |

**The world** *(decided 4 Nov)*: the shallow sea around the existing volcanic island. *Proposal:* when life comes ashore in a
later era, the land half opens, with the succession and plant work you already have. That keeps "the sea line and life coming
ashore" from tastes.md, and plants return with their own verb: they can't chase anything, so they grow (your "Grow by turns" toy).

## 10. Risks
- **Tangled systems** ended your earlier projects. This plan has several layers, and a polished document is easy to approve
  before anything is played. Guard: one arrow at a time, each proven by a toy.
- **The garden may not pull.** Its only job is to make you want the next Life. If the toy fails that test, shrink it to tier
  lists and a few authored shifts, and the game still works.
- **One winner takes all.** v1 had "one moss and one liverwort took everything". Capped habitats and roles help; P38 is still open.
- **Fixed boards get solved.** Route knowledge is fun until it's done. Garden-driven nodes are the planned answer, unproven.
- **Authoring load.** Mutations felt like a chore to write by hand. Three boards took one session. Real nature supplies the
  nouns, but about 40 parts and 8 habitats per era is real work. Boards as plain text also let the community make them.

## 11. Proposed order
*Superseded for planning by [planning/README.md](../planning/README.md) (5 Nov): research, then a planning session, then a first build milestone in `ROADMAP.md`.* The rough shape remains:
1. **Toys played:** the Life and the living garden.
2. **Research and planning,** in cloud sessions.
3. **First real build:** the Life and garden in `src/`, a Cambrian sea around the island, playable niches, saves, offline, tier lists. A first itch release and Discord could come here (~100 nerds is the goal).
4. **Depth, whenever it's fun:** predators, stacking, more parts and body plans, feel and UI.
5. **Apex and boss, then the next era and the tree.**

## 12. Guardrails against tangling: defaults, not laws
You asked for measures against tangling (4 Nov), then asked that future AI not take them too seriously or stop thinking outside them (5 Nov). They were written for one toy. **If one blocks a better idea, say so and
propose changing it. Nothing here outranks a good idea or your call.** `tests/garden-toy.test.ts` checks some of them for this toy: a smoke alarm, not a rulebook.
1. **One door.** Life and garden meet in one file (`toys/garden-board.ts`). The garden hands the Life a board as plain data, and the Life hands back a result.
2. **The Life works alone.** It still runs on its fixed maps, so if the garden is cut, nothing else breaks.
3. **Garden numbers show.** A number that never changes a board or the map is suspect.
4. **Changes have reasons,** and true ones. A rule whose effect doesn't fit one sentence deserves a second look.
5. **Budgets for the toy:** 3 stocks, 4 roles, 10 natives, 3 habitats, 1 link. They kept it simple; they're not limits on the game.
6. **The garden doesn't break the Life.** A garden at normal writes the authored board, so balance on the fixed maps carries over; food by the start is protected. (Added after a bot's arthropod went from 18 eggs to under 1 on a board that
   had lost one starting mat.)
7. **Questions before systems.** Prefer one question per toy and playing before adding a layer. If something doesn't work, try cutting before adding.
