# Slice 10: verb slots

**Milestone:** M1, step 3 (ROADMAP)
**Question:** do 1–3 picked verbs make grazer builds play differently?
**Builds on:** decisions.md, 5 Nov: "the verbs can also come from the equipment… many verbs/skills would be cool"; "go with
the 1-3 verb slots that you could pick"; the body plan keeps its move; grazer styles sweeper, digger, tank (plan.md).
tastes.md: builds like a pure OSRS character; all-rounders are bad.

## In
- **Six verbs, each from a part** (the part sits on the body and keeps its upkeep and slot):

  | Verb | Does | Turn | Recharge | Worm part | Arthropod part |
  | --- | --- | --- | --- | --- | --- |
  | Graze | eat every mat around you (8 tiles) | yes | 3 | Tentacles (head) | Raking limbs (side) |
  | Dash | your next move goes twice as far | free | 3 | Bristles (side) | Walking leg (side) |
  | Dig | eat the buried food on and beside your tile; strikes miss you | yes | 2 | Burrowing bulb (tail) | Digging limb (side) |
  | Sense | reveal hidden food within 5 tiles | free | 4 | Eye (head) | Eye (head) |
  | Brace | stay put: strikes on every side are blocked, the hunter backs off 3 turns | yes | 3 | Sclerites (side) | Spine (side) |
  | Crush | break a shell bed or carcass beside you, +4 food, any size | yes | 2 | Proboscis (head) | Crushing claw (head) |

- **Pick 1–3 verbs before a Life** (the pick screen): your body starts with just those parts. Three presets (Sweeper,
  Digger, Tank) and free picks; the screen shows the upkeep. Fewer verbs: cheaper, emptier body for moult parts.
  Head-slot clashes are real (a worm can't Graze and Crush).
- **Verb buttons** above Wait, Moult, Lay, with their recharge as pips. A free verb doesn't end the turn.
- Moults still offer parts; a verb part taken at a moult adds its verb while you have fewer than 3.

## Out
- Rare verbs (slice 12, the clutch); predator verbs (slice 11); minigames (ideas.md).

## Done when
- [ ] The three styles want different routes on the same board (sweeper by the shore, digger in the mud, tank at the
      shell beds and against the hunter).
- [ ] `npm run check` passes; `npm run look` plays a Life with each style.
- [ ] Your notes are in `docs/playtests/`.

## Size check
- New system: verbs (one). Fits one session.

## AI choices to judge
- Verbs cost upkeep through their parts, not food per use; recharge in turns.
- The starters (gut gland, sclerites; claw, gill) are gone: your verbs are your starting body.
- The verb table above, including the two new parts (tentacles, raking limbs, burrowing bulb).
