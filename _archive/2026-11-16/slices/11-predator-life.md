# Slice 11: the predator Life

**Milestone:** M1, step 4 (ROADMAP)
**Question:** is hunting fun?
**Builds on:** decisions.md, 5 Nov: "you see next step (maybe as upgrade) and you can change your movement and speed. also
differnt undergrounds change escape. also armour"; ambush and frenzy; the swimmer as a body plan; tastes: "I like to be the
little creature and chase things around", "really wanted to play as a predator".

## In
- **The swimmer** (Anomalocaris-like, you): swims 2 tiles along any path, over rock, never into vent water. Swimming onto
  prey catches it (food). No hunter on your board: you are the hunter. Moult and lay as before.
- **Prey that flee by one rule each** (sensing you only when you moved this turn):
  - *Priapulid worm* (8 food, senses 2): burrows if on mud (hidden 2 turns); on sand it crawls 1 tile, toward mud.
  - *Trilobite* (10 food, senses 3): runs 2 tiles in a straight line away from you; rock, mud and vent water stop it.
  - *Wiwaxia* (12 food, senses 2, armoured): doesn't run; if it saw you coming, its spines cut you (−1 health), unless you
    have arm spines. Ambush it instead.
  - Unalarmed prey graze toward their food. A caught prey's kind comes back at the board's edge 3 turns later.
- **The ground changes escape**: mud saves worms and traps trilobites; open sand is the trilobite's; the mudslide drives
  worms out of the mud (no hiding while it lasts).
- **Ambush**: Wait (Lurk) a turn: prey don't notice you, and your next move goes twice as far (three times with a tail fan).
- **Frenzy**: +1 speed for each catch in a row (turns back to 0 on a turn without one).
- **Swimmer parts**: grasping arms (start), arm spines (armour), compound eyes (**the next step as an upgrade**: tap once to
  aim, see where every prey will go, tap again to go), swimming flaps (+1 speed), gut gland, gill, brood pouch; rare: tail fan,
  progenesis.
- The pick screen offers the swimmer; its card shows the hunter's rules instead of verbs.

## Out
- Being hunted as a predator (slice 14 makes your predator the grazers' hunter). Prey from the garden (13). Swimmer verbs.

## Done when
- [ ] You chase, lurk and frenzy on each board; the ground decides which prey you can get.
- [ ] `npm run check` passes; `npm run look` plays a hunting Life.
- [ ] Your notes are in `docs/playtests/`.

## Size check
- New system: prey (one). The swimmer's move reuses the hunter's look. Fits one session.

## AI choices to judge
- Prey sense you only after you move (that is what makes the ambush work); the three flee rules and their numbers.
- Respawn after 3 turns at the edge, until the garden supplies prey.
- Aim-then-go with compound eyes; without them one tap moves.
