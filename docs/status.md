# Status

Updated 2026-11-07. Branch `codex/part-c-review-plan`. Active spec: [19 Join the sea](slices/19-join-the-sea.md).
Read this and that spec first; open other docs and source files only as needed.

## Saved checkpoint
- Previous gameplay: `c9c20da`; project instructions: `d36588e`; reviewed spec: `bc4d87c`; Part A: `09dc4b0`.
- Part B simulation/lifecycle checkpoint: `b6ccf69` (`feat: connect patch boards and recover sea clutches`).
  Latest gameplay: `a8a54b8` (`feat: run sea lives with creature design sharing`).
- Part C specification, reported feedback and review agenda: `docs: specify Part C and gameplay review handoff`
  on the current branch; use `git log -1 --oneline` for that documentation checkpoint. No runtime changes.
- No new dependencies or push. Only disposable browser profiles were used; no personal browser saves were accessed.
  Remote state has not been freshly queried.

## Current milestone and decisions
M2 steps 1/2 are complete. Step 3 retains three open play checks. Step 4 parts A/B are implemented;
Part C's patch-map presentation and playtesting remain; its implementation spec is now concrete.
The roadmap order is unchanged.

- New seas have food/environment and zero animals. A worm Life founds the population through its actual eggs.
- Continuation uses the **last successful clutch**, in its patch or a direct neighbour. Failure, retry and world
  extinction do not revoke it. A new positive result replaces it, even if the parent died. No egg spending.
- All four existing bodies open after founding, without rank gates or recipes. Starting a body adds no population.
- **New user decision:** "keep recording diet but use parts and verbs to specify. sharing creature design".
  Diet is recorded separately from feeding capabilities. Codes load a fitting starting build; score/habitat
  grants no eggs, visitors or launch access. Existing migrated visitors remain.
- Exact decisions and bounded implementation choices are in
  [Part B decisions](decisions.md#7-nov-join-the-sea-part-b-feeding-and-creature-design-sharing).
  Saves remain lower priority; the existing bounded v1/v2 migration is retained.

## Part B completed
- `door.ts` creates detached patch boards using the three authored templates. Food follows stocks with the
  existing small start refuge; low snapshot oxygen affects all boards. Prey/rivals/hunters come from actual
  residents, retain species/body identity and cannot respawn absent species. Arthropods and trilobites stay distinct.
- `feeding.ts` derives feeding from inherited parts and their verbs: graze uses mats; dig/crush uses rot;
  arms/spines enable live capture. Mixed non-hunting tools split effort. No new stock or live worm hunting.
  Diet/role labels do not grant hunting. Legacy builds get deterministic body-compatible defaults.
- Parts at the latest lay survive later injuries in the result. The strongest successful clutch supplies the
  existing body/diet species slot's representative parts (latest wins ties); weaker releases do not lower fitness.
  This retains broad species slots, not separate genotypes for every part combination.
- `sea-life.ts` owns launch checks, completion and once-only settlement. `main.ts` saves the full pending result
  before terminal playback. Reload resumes clutch selection; settlement clears pending in the same snapshot as
  its release/progress. Zero-egg results recover too. New forms are keyed by patch/body/diet, with legacy fallback.
- Runtime persistence now uses the v3 codec. Optional inherited `parts` and `diet` fields are validated and survive
  round trips. Storage errors are visible with retry/export guidance. Failed imports leave the active sea unchanged;
  an unread startup save cannot be overwritten. Broken/newer JSON must be backed up before a fresh save is written.
- Home retains the current island drawing, with patch lists, eligibility, stocks, named populations, board previews
  and ecological news. The existing loadout/clutch screens remain. Part C still owns the visual patch map and
  release/descendant highlighting.
- Species codes export/import starting designs: body, one carried form and fitting verbs. Existing codes still
  decode. Imported presets last for the visit; the code can be pasted again. No design-library system was added.

## Part C planning checkpoint
- [Part C spec](slices/19-join-the-sea.md#part-c-implementation-specification): port the living patch map,
  expose launch range and patch history, connect truthful release/line highlighting, then verify and play.
- [User's Part B feedback](playtests/19-join-the-sea.md): mostly good; missing living map, species access too
  fast, missing equipment view. Equipment means the large creature with visible slots and parts beside it.
- [Plan and review agenda](design/part-c-and-gameplay-review.md): recommend one general gameplay/design review
  after C's connected-loop playtest and before step 5. Review genes, inheritance, species founding, RPG strategy
  and later minigames together. This timing is a recommendation, not a change to the adopted roadmap.
- The large equipment view is an explicit step-5 deliverable. Permanent species progression remains steps 5/6;
  no temporary unlock gates were added. One carried part and aggregate body/diet populations remain bridges.
- This session changed documentation only. Local links/anchors, consistency and diff scope were checked;
  gameplay checks below are the prior Part B results, not new runs. No new human/phone test was performed.

## Part B verification and remaining limits
- **96/96 automated tests across 14 files**, including 11 new Part B checks; direct suite completed in 4.01 s.
  Covers empty/depleted snapshots, matching identities/respawns, part-based feeding, oxygen, real terminal lays,
  reload/once-only settlement, adjacent continuation, failure/extinction, storage errors and design compatibility.
- A deterministic policy founded empty mud patches on seeds 1/2/3 using ordinary food, moulting and laying.
  No injected food/eggs or population boost in that check. This is limited viability evidence, not balance tuning.
- `npm run check` passes (typecheck and full suite). The sandbox intermittently blocked nested npx launches with
  `spawnSync npx EPERM`; the unchanged wrapper was run with execution permission. Direct tests also passed.
- `npm run build:game` passes; packaged `game/dist/clade.html` is 744 KB. Existing Svelte config fallback,
  inlineDynamicImports deprecation and large-chunk notices remain. Root `build` targets the archived plant game.
- `node scripts/sea-smoke.mjs` checks the packaged page in installed Chrome at 390×844, in a temporary profile:
  empty founding, saved result while playback is busy, terminal/clutch reloads, single settlement, all four body
  choices, failed-run continuation, code import and visible storage-error retry. It uses controlled terminal
  fixtures, not a full player run. A screenshot was visually inspected; no page exceptions were observed.
  Chrome needed execution permission for its local crash-handler socket. Initial permission review timed out;
  the permitted retry ran. The runner closes Chrome before removing its disposable profile.
- All 53 local links/anchors in the changed docs passed, along with whitespace and file-scope diff review.
- Part B verification had no observed human/phone playtest, no frame-rate claim, and no founding balance adjustment.
  Subsequent user-reported feedback is saved above. The real map and its taps,
  pacing and player understanding remain Part C work; do not mark the whole slice complete.
- Unknown migrated body types remain in the ecology and are explicitly listed as sea-only in board previews.
  Their representation still needs review in C. The staged seed/patch graph compatibility boundary remains.

## Next session
The Part C spec is a saved boundary. Start a fresh implementation session from this branch/checkpoint.

> Implement slice 19 Part C from `codex/part-c-review-plan`, on a task branch based on its current HEAD.
> Read AGENTS.md, docs/status.md and docs/slices/19-join-the-sea.md, especially the Part C implementation spec.
> Begin with C1's map, then C2's release feedback, and run C3's integrated checks. Reuse the Part B lifecycle
> and codec. Preserve temporary body access; equipment and permanent progression remain steps 5/6.
> Use one agent, no new dependencies, and targeted source reads. Do not repeat the A/B or architecture audit.
> Save focused commits and a handoff. Report actual player/phone tests separately from automated fixtures;
> leave unavailable human checks open. Remind me at the next verified boundary.

## Later work retained
- Step 5: general bodies/six places and arthropod/trilobite head geometry. Body toy/rendering spike remain in
  `c9c20da`; [body approach](design/body-approach.md) and [slice 18 playtest](playtests/18-body-toy.md) have details.
- Step 6: parts entering new bases, respec and XP ownership remain open. [P46](proposals.md) retains the proposals.
- Step 9: final style remains open, between OSRS and Stardew Valley. Step 3's three play checks are still open.
- Research shortlist and biology-tooltip checks remain in their existing docs; no new research was needed here.
