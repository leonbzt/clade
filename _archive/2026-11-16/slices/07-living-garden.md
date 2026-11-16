# Slice 07: the living garden toy

**Milestone:** none set yet; the next step in [design/big-picture.md](../design/big-picture.md) §11.
**Question:** does coming back to a changed garden pull me into another Life?
**Builds on:** decisions.md, 4 Nov: P45 (build this toy, the shallow sea around the volcanic island), habitats as areas in the garden, "the
'living' ecosystem is also really important", the tier list gives the environment, capped habitats ranked within trophic role, eggs add
population, "take good measures so it doesn't get tangled". The numbers and model below are *proposal*.

## In
- **The garden strip, off the volcanic island:** the shore, then reef, mud flats and basin, drawn from the same boards you walk on.
- **Three stocks per habitat:** mats, detritus, oxygen. Each shows as bars and on the board.
- **10 real residents in 4 roles** (grazer, burrower, filter feeder, predator), with scores counted in eggs, so you compare directly with them.
- **Generations:** one every few minutes, also while you're away (capped), plus a skip button for testing. A Life's end also passes time.
- **The tier list:** per habitat, by role, capped, F to S. Your line enters with its eggs.
- **The garden writes the board:** mats, buried food, shells, carcasses, dead water, the rival and the predator's name and arrival all come
  from the garden. The maps stay the same, so you can see what changed.
- **Your role comes from what you ate** in that Life.
- **Your descendants on the board,** as rivals, when your line leads a role.
- **One link: spill.** Crowded lines cross borders and arrive unproven, ranked low until you go and prove them.
- **Pushback:** natives you've beaten slowly adapt, so a top tier needs defending.
- **Variants:** your populations throw up rare parts while you're away. "Go live it."
- **News with reasons,** and a "while you were away" summary.
- **Small creatures roaming the strip,** a capped readout of the populations.

## Out
- The apex slot and its era-wide rule (decided, later) · drift and roaming → after this toy is played.
- The release choice, species and branching → the first real build. Here a line's score in a habitat is its best proof there.
- The real island map, a split of one habitat's map into several boards → later; habitats are already a list with neighbours, so a split
  adds a habitat instead of changing the rules.
- Feel and polish → later. Anything in `src/` → after this toy has earned it.

## Rules against tangling (big-picture §12), enforced in `tests/garden-toy.test.ts`
- `garden-sim.ts` never imports the Life's rules or the DOM; `life2-sim.ts` never imports the garden; only `garden-board.ts` sees both.
- Moving each stock, and each role's population, changes the board.
- A garden at normal writes exactly the authored board; the start stays fed and never goes dead; the predator never comes before turn 4.
- All news has a reason.
- Budgets are counted: 3 stocks, 4 roles, 10 natives, 3 habitats.
- Numbers stay bounded over long runs, boards stay valid at every extreme, and nothing is frozen: populations keep moving.

## Done when
- [x] In play from `/toys/`: read the garden, go in, play, come back, see your eggs change things, and see the next board differ for a stated reason.
- [x] `npm run check` passes, including the tests above.
- [x] Your notes are in [playtest 08](../playtests/08-garden.md), from one session. Waiting didn't pull; wanting to fill niches did.

## Exit
If it doesn't pull you back after a few real returns, shrink it to tier lists and a few authored shifts. Don't add systems to rescue it. *Not triggered (5 Nov): you liked the garden and want more to do in it.*

## Size check
- New system: one, the garden model, in `toys/` only: `garden-data.ts`, `garden-sim.ts` (under ~250 lines), `garden-board.ts`, `garden-view.ts`, `garden.ts`.
- Life v2's page logic moves to `life2-ui.ts` so both pages share it, with its rules unchanged, except that a board is passed in as data, can hold
  several rivals, and records what you ate.

## What the build found (4 Nov)
- A throwaway bot played the first garden boards and collapsed: the reef arthropod fell from 18 eggs to under 1. One lost mat by the start stopped
  hatchlings growing, and extra rivals ate a node nearly every turn. Hence the rule that a garden at normal writes the authored board.
- After that, mean bot eggs, fixed map → garden at normal → 16 generations after a 60-egg worm boom: reef arthropod 18 → 18 → 8–13; mud worm 33 → 31 → 28.
  Pressure, not collapse. A person should beat these numbers.
- All model numbers are first guesses, and how it feels is untested: nobody has played it yet. Native facts are from memory, so please correct them.
- AI additions to check: natives adapting to you, role from what you ate, variants with their pace. Saves are separate from v2.

## Open questions
1. Does "the single maps could still split" mean one habitat's map can become more than one board? (AI's reading.)
2. Generation pace: 3 minutes is a first guess, to change by feel.
