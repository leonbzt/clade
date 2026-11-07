# Status

Updated 2026-11-07. Branch `claude/project-thread-cy8ptv`. The plan: [ROADMAP](../ROADMAP.md), the vision: [full-version.md](design/full-version.md).

**Milestone:** M2, the full version (release). Steps 1 and 2 are ticked. Step 3, the body toy, is built and played, but not ticked: three of its play checks are still open. Next is step 4.

**Done** (nothing committed; the docs from 5 Nov on and all of slice 18 are only in the working tree)
- Body toy: `toys/creature*`, `game/tests/creature.test.ts`, [spec](slices/18-body-toy.md), [your notes](playtests/18-body-toy.md).
- Looks on a real board, a spike: `spikes/body-render/board.html`, with `?round=2`, `?view=sizes` and `?view=beasts`. [Spec](slices/18c-board-looks.md), [your notes](playtests/18c-board-looks.md).
- Analysis and numbers: [body-approach.md](design/body-approach.md). Research: [AI sprites](research/ai-sprite-workflows.md), [models of life](research/ruliology-and-models-of-life.md).
- `npm run check` passes in 9.8 s, close to the 10 s budget.

**Decided** ([decisions.md](decisions.md))
- 7 Nov: "you write the painter and each animal is a recipe". The same recipe paints every size; 3D info stays; the look aims "between osrs and stardew valley"; don't spend more time on looks now, "continue towards itch release".
- 6 Nov: one place, one thing; places locked by lineage, can improve inside their kind and can reopen; Front is the weapon slot; rows for now.

**Next**
1. `/kickoff join the sea` (step 4). Spec it first: the sea replaces the garden, the map is home with run hooks, boards come from patches.
2. Answer first in that spec: is your Rockplate a rival of the native trilobite, or the same species? ([full-version.md §6](design/full-version.md), gap 5.)
3. Step 5 then brings in the general body, six places and the head bug fix, with the painter behind one draw call.

**Open**
- **Final style, step 9:** pixels or low poly, 16 or 24 px, large animals across two tiles. The painters and the data exist in the spike only; none of it is in the game.
- **Bug:** the front of the body sticks out past the head on arthropods and the trilobite ([body-approach.md §6](design/body-approach.md)).
- **Step 3:** tick it, or play its three open checks? AI lean: roll them into step 5.
- **Animals on the sea map:** only roamers and one-part map forms exist; an *idea* is in `ideas.md`, for the step 4 spec.
- [P46](proposals.md): six places in step 5; power from locked parts; body shape visible first (AI's leans, not your calls).
- How parts go into a new base. Respec, and XP per lineage or whole line (step 6). Recipes don't fit today's slots and moults; each animal has a player side and an AI side ([full-version.md §6](design/full-version.md)).
- Research shortlist 1, 2, 5 (drift, food web, coat patterns): you liked them; parked in `ideas.md`.
- Before tooltips: `researcher` should check three biology claims (full-version.md §5). M2's "done when" is a draft. The sea toy's Anomalocaris does nearly all the hunting.
- **Costs measured on software graphics only;** no phone or real GPU tested.
