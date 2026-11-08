# Status

Updated 2026-11-08. Branch `codex/part-c-living-map`. Active spec: [19 Join the sea](slices/19-join-the-sea.md).
Read this and that spec first; open other docs and source files only as needed.

## Saved checkpoint
- Previous gameplay: `c9c20da`; project instructions: `d36588e`; reviewed spec: `bc4d87c`; Part A: `09dc4b0`.
- Part B simulation/lifecycle checkpoint: `b6ccf69` (`feat: connect patch boards and recover sea clutches`).
  Latest gameplay: `a8a54b8` (`feat: run sea lives with creature design sharing`).
- Part C specification, reported feedback and review agenda: `900cc01`
  (`docs: specify Part C and gameplay review handoff`), the documentation-only task base.
- Part C task base: `900cc01` (current `codex/part-c-review-plan` HEAD at task start).
  C1 map: `a1da0f1`; C2 feedback: `99c413d`; integrated verification/handoff:
  `test: verify the living sea map and save Part C handoff` on this branch.
- No new dependencies or push. Only disposable browser profiles were used; no personal browser saves were accessed.
  Remote state has not been freshly queried.

## Current milestone and decisions
M2 steps 1/2 are complete. Step 3 retains three open play checks. Step 4 parts A/B are implemented;
Part C's map/feedback are implemented and automated checks pass; ordinary player and real-phone checks remain.
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

## Part C specification and retained scope
- [Part C spec](slices/19-join-the-sea.md#part-c-implementation-specification): port the living patch map,
  expose launch range and patch history, connect truthful release/line highlighting, then verify and play.
- [User's Part B feedback](playtests/19-join-the-sea.md): mostly good; missing living map, species access too
  fast, missing equipment view. Equipment means the large creature with visible slots and parts beside it.
- [Plan and review agenda](design/part-c-and-gameplay-review.md): recommend one general gameplay/design review
  after C's connected-loop playtest and before step 5. Review genes, inheritance, species founding, RPG strategy
  and later minigames together. This timing is a recommendation, not a change to the adopted roadmap.
- The large equipment view is an explicit step-5 deliverable. Permanent species progression remains steps 5/6;
  no temporary unlock gates were added. One carried part and aggregate body/diet populations remain bridges.
- The planning base changed documentation only. The Part C implementation and new verification are recorded below;
  no new human/phone test was performed.

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
  Part C adds generic map markers and explicit identity keys; human representation review remains open.
  The staged seed/patch graph compatibility boundary remains.

## Part C implementation and verification (8 Nov)

- Home now uses the ported canvas patch map, with population/mats/oxygen/hunter views, transitions,
  capped decorative motion (200 markers maximum), stable species colours plus printed identity keys,
  honest generic/sea-only migrated identities and a named-patch fallback list. No simulation RNG is used.
- Direct canvas taps open the scrollable patch sheet. Selection, clutch, eligible neighbours and current
  line distribution have distinct cues. Patch details retain loadout/board previews and show recorded
  stock/prey history only. Animation stops behind loadout, clutch, menu and blocking notices.
- Settlement still belongs solely to Part B. After its existing save, transient feedback pulses the result
  patch and separates actual released eggs from current population after two generations. Dismissal is
  read-only; reload reconstructs continuation/distribution without replaying feedback or settlement.
  Zero eggs retain the previous continuation. Line highlights mean aggregate body/diet populations.
- `npm run check` passes, including five new focused map tests: resized/content-box coordinates (including
  CSS borders), empty markers/cap, species/feeding identity, recorded ring history, and render/save/RNG purity.
  Existing lifecycle, migration, codec and sharing checks remain in the integrated suite.
- `npm run build:game` passes; packaged `game/dist/clade.html` is 755 KB. Existing Svelte-config fallback,
  inlineDynamicImports deprecation and large-chunk notices remain.
- Updated `node scripts/sea-smoke.mjs` passes in installed desktop Chrome using a disposable profile:
  real CDP canvas touch at 390×844; matching patch card; out-of-range fallback; all four post-founding
  bodies; pending/clutch reload; single settlement; return dismissal/reload; zero-egg continuation;
  design import; storage retry; all overlays; 1200×900 desktop layout. No page exceptions observed.
  Initial edge-tile touch failed; using the tile centre and accounting for CSS borders fixed the hit.
  All patch tiles with bordered/resized coordinates are also covered by the renderer fixture.
- Map, patch sheet and return screenshots were visually inspected at phone width; desktop map/return
  and patch-sheet views were also inspected.
  Screenshots are disposable `/tmp/clade-sea-*.png` artifacts. This is desktop emulation, not phone hardware.
- The check wrapper and Chrome required execution permission (nested launcher / crash-handler socket);
  permitted runs passed. Personal browser saves were not accessed; no balance or population tuning occurred.
- **Open:** ordinary 3–5-Life player protocol, founding/return pacing, player comprehension and desire to
  replay, real-phone taps/background/performance. No human player or phone was available. Automated terminal
  fixtures and earlier deterministic founding viability do not close those criteria. Slice 19 stays open.

## Next session

This is the verified Part C implementation boundary. Start a fresh session for the player pass, then the
proposed general gameplay/design review before step 5. No equipment/progression implementation is authorized here.

> Continue from `codex/part-c-living-map`. Read status and playtest 19. Run the ordinary player protocol in
> a separate save/profile, record device/build/seed/eggs/pacing and comprehension separately from fixtures,
> and check an actual phone when available. Leave unavailable human/device checks open. Do not repeat A/B
> or the architecture audit, tune permanent gates, or begin equipment/progression before the design review.

## Later work retained
- Step 5: general bodies/six places and arthropod/trilobite head geometry. Body toy/rendering spike remain in
  `c9c20da`; [body approach](design/body-approach.md) and [slice 18 playtest](playtests/18-body-toy.md) have details.
- Step 6: parts entering new bases, respec and XP ownership remain open. [P46](proposals.md) retains the proposals.
- Step 9: final style remains open, between OSRS and Stardew Valley. Step 3's three play checks are still open.
- Research shortlist and biology-tooltip checks remain in their existing docs; no new research was needed here.
