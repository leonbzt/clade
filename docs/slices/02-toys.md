# Slice 02: Three throwaway toys

**Question:** which kind of hands-on play do you want to keep coming back to in a colony? Each toy tests one answer.
The ideas behind them, and the wider brainstorm, are in minigames.md (archived).

| Toy | File | What you do | What it tests |
| --- | --- | --- | --- |
| **1. Patch** | `toys/patch.ts` | The rules are fixed. You plant a flag to steer the spread, tap dew before a dry spell, and catch stray spores. Two trait toggles each carry a cost. | Spatial verbs on a cellular automaton. Does steering feel like a choice or a chore? |
| **2. Specimen** | `toys/specimen.ts` | Grow one plant. Shoots reach for light, roots for water pockets (space colonization). You set where to grow and pick a preset (Shoots / Even / Roots). You shoo grazers. A neighbour shades the left side. | Your old growing minigame redone small. Is one plant more fun than a colony? Do the presets beat a slider? |
| **3. Rules** | `toys/rules.ts` | You never touch the map. Each generation offers 3 genes; each changes a written rule with one upside and one downside. Replay the same island to compare builds. | Is "genes = visible rule changes" fun to watch and plan? Does the S–D tier per zone read well? |

### Round 2 (after your notes in [playtests/02-toys.md](../playtests/02-toys.md))

All three looked and felt good, but the decisions felt weak. Toy 4 tests whether Patch's look plus real choices fixes that.

| Toy | Files | What you do | What it tests |
| --- | --- | --- | --- |
| **4. Colony** | `toys/colony.ts` (view), `colony-sim.ts`, `colony-data.ts` | Limited spore drops instead of a free flag. Hidden ground, with Minesweeper-style hints (damp neighbours). Lichen to take by surrounding it (Go). A gene draft where pairs form combos. Slide to collect dew and spores. A Spreading skill whose levels unlock perks (the last one auto-collects dew). Three goals with times. | Do discrete, scarce choices on an organic sim feel strong? Do hints make drops a real choice? |

## In scope
- Standalone pages under `toys/`, with plain TS and canvas. No Svelte and no shared code with `src/`.
- Rough constants at the top of each file. The "data separate from logic" rule is waived for toys.
- A speed toggle, and a few readouts per toy.

## Out of scope
- Saving, art, sound, mobile layout, balance, and any link to the slice 01 game.

## Done when
- [ ] `npm run dev`, then open `/toys/`. All three run.
- [ ] You've played each one for about 10 minutes and written notes in `docs/playtests/02-toys.md`, covering:
  which one you'd keep, which verb felt best, and what to steal from the others.

Afterwards the toys get deleted or folded into the real game. Don't build on them.
