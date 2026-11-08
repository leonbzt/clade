# Status

Updated 2026-11-08. Branch `codex/slice20a-review`. Current review: [20A body/part contract](design/20a-body-part-contract.md)
for [20 Join the bodies](slices/20-join-the-bodies.md). Gameplay remains at `13b1ccb`.
[Slice 19](slices/19-join-the-sea.md) remains open, with Part D navigation implemented and player/phone checks still open.
Read this and the spec for the selected task first; open other docs and source files only as needed.

## Saved checkpoint
- Previous gameplay: `c9c20da`; project instructions: `d36588e`; reviewed spec: `bc4d87c`; Part A: `09dc4b0`.
- Part B simulation/lifecycle checkpoint: `b6ccf69` (`feat: connect patch boards and recover sea clutches`).
  Latest gameplay: `a8a54b8` (`feat: run sea lives with creature design sharing`).
- Part C specification, reported feedback and review agenda: `900cc01`
  (`docs: specify Part C and gameplay review handoff`), the documentation-only task base.
- Part C task base: `900cc01` (current `codex/part-c-review-plan` HEAD at task start).
  C1 map: `a1da0f1`; C2 feedback: `99c413d`; integrated verification/handoff:
  `4f6c783` (`test: verify the living sea map and save Part C handoff`).
- Desktop feedback checkpoint: `8952a22` (`docs: record Part C desktop feedback and navigation follow-up`).
- Step-5 planning task base: `8952a22`; specification checkpoint: `docs: specify body integration and next-patch navigation`.
  Documentation only; gameplay remains at `4f6c783`. No equipment/body implementation in this session.
- No new dependencies or push. Only disposable browser profiles were used; no personal browser saves were accessed.
  Remote state has not been freshly queried.

## Current milestone and decisions
M2 steps 1/2 are complete. Step 3 retains three open play checks. Step 4 parts A/B are implemented;
Part C's map/feedback are implemented and automated checks pass. User-reported desktop play supports the
loop, visible spread and distinct habitats; next-patch discovery is difficult. Remaining player/phone checks stay open.
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

## Planning checkpoint (8 Nov)

- [Desktop feedback](playtests/19-join-the-sea.md#reported-part-c-desktop-feedback-8-nov): fun runs, noticeable
  habitat differences, visible spread, direction endorsed. The next patch was hard to find; no phone play.
  This is a qualitative report, not the complete 3–5-Life protocol or measured founding balance.
- [Navigation proposal and review](design/part-c-and-gameplay-review.md#part-c-desktop-feedback-and-navigation-follow-up-8-nov):
  expose eligible next patches directly and label them on the map. Existing controls are partly collapsed;
  eligible empty neighbours need not have number labels. Subsequently accepted by the user and specified as
  [Part D](slices/19-join-the-sea.md#part-d-next-patch-navigation-follow-up-8-nov); not implemented here.
- Reefs/more map structure are saved in [ideas](ideas.md). Step 9 covers UI/art and step 7 ecological variety;
  neither promises a new map layout. No roadmap or release-scope change.
- Docs checks: local links/anchors, consistency and whitespace/diff review. Gameplay checks were not repeated
  for this documentation checkpoint; no browser saves were accessed.

## Step-5 specification checkpoint (8 Nov)

- User requested the next-phase spec. [Slice 20](slices/20-join-the-bodies.md) specifies the four current
  bodies as data, six occupied places, large equipment view, part-driven actions, general board rendering,
  head-geometry repair and safe result/persistence integration. No new animals, XP, recipes, reefs or art overhaul.
- A Life v2 is the user's equipment interaction reference, with freedom to change its layout: visible body,
  clear places and part cards, effects/upkeep and placement/replacement. Relevant source is `toys/life2-ui.ts`.
- **Decided for this phase:** one compatible chosen clutch part follows continuation into a neighbour;
  start with built-in parts for extra lineage strength, preserving existing base/movement differences.
  [Exact calls](decisions.md#8-nov-part-c-navigation-and-the-next-body-phase). Both are bounded starting choices.
- The first Life played in an area contributes its actual eggs there, matching existing settlement. Existing
  spread/residents remain. Launch does not re-release the previous clutch or replace the area's population.
- [Focused review outcome](design/part-c-and-gameplay-review.md#step-5-review-outcome-8-nov) records system
  roles, examples and risks. Later species founding, whole-build/mutation inheritance and extra lineage stats
  remain open directions; XP/respec/rewards are still step 6. Aggregate population identity remains a bridge.
- **Key implementation boundary:** 20A must publish all 27 part mappings, locked defaults, repeated-bonus
  treatment, injury/coverage and migration before runtime cutover. Any unavoidable balance change needs a
  concrete review. Stage safely; the running game and its codec must agree at every verified checkpoint.
- Docs-only checks: local links/anchors, consistency and diff/whitespace review. No gameplay tests repeated.

## Part D navigation checkpoint (8 Nov)

- Task base: `2e3a9f9` on `codex/step5-body-spec`; checkpoint: `feat: expose next-patch navigation`
  on `codex/slice19-part-d`. This task implements only slice 19 Part D; body work remains separate.
- An always-visible Play next group directly below the map uses existing `launchPatches` order:
  Last clutch first, then every direct Neighbour, with matching patch numbers/habitat names and card buttons.
  Before founding, Choose a founding patch opens/focuses the existing all-patch list; all patches remain available.
- Eligible empty patches now receive map numbers in every overlay. Labels are enlarged for readability;
  gold clutch, white selection, green eligibility and the occupied-line dot remain distinct. Existing named
  fallback and unavailable-patch explanations remain. No simulation, graph, settlement, codec or body changes.
- `npm run check` passes: typecheck and 102/102 tests, including six map fixtures. The new renderer fixture
  covers founding labels, empty neighbours, every overlay, clutch/selection/line cues and no phantom markers.
  An initial fixture missed a browser stub (fixed); an initial run also exceeded the existing garden timing
  threshold. The complete rerun passed without changing that test or simulation code.
- `npm run build:game` passes; packaged page 756 KB. Existing config/deprecation/chunk notices remain.
  Extended `node scripts/sea-smoke.mjs` passes at 390×844 and 1200×900: founding chooser/focus, exact saved
  choices and labels, every listed card, neighbour launch, zero-egg return and reload, no horizontal overflow,
  existing lifecycle/design/storage paths and all overlays; no page exceptions. Disposable profiles only.
  Phone-width return and desktop map screenshots were visually inspected. Chrome and the check wrapper
  needed execution permission for the previously documented sandbox restrictions.
- **Still open:** unaided player next-patch discovery, remaining ordinary-Life protocol and real-phone
  taps/background/performance. Automated terminal fixtures and desktop emulation do not close these checks.

## Slice 20A contract checkpoint (8 Nov)

- Task base: `13b1ccb`; branch `codex/slice20a-contract`; checkpoint subject:
  `docs: prepare slice 20A body and part compatibility contract`. Documentation only; gameplay is unchanged.
- [Contract for review](design/20a-body-part-contract.md) maps all 27 production IDs and four bodies:
  places/families, visuals, actions/effects/upkeep, starter/moult/rare routes, replacement variants,
  locked defaults, directional guards, row injuries/starvation and legacy mappings.
- Three **proposed**, unapproved groups: costed built-in defaults/locks; single-copy bonuses with explicit
  walking/raking and upgrade variants; bilateral row damage and versioned legacy compatibility. Numeric
  before/after examples expose lost stacking, new starting costs/actions and physiological-place conflicts.
  This is not a promise of unchanged balance. No new user decision was inferred or logged as accepted.
- Migration proposal preserves original v3 arrays and their semantics, pending eggs/cards/last-lay builds,
  populations, graph and RNG; new place records would require v4 and exact versioned sharing. Continuation
  distinguishes unknown legacy evidence, explicitly no trait and a chosen part, retaining source/local forms.
- Docs checks: all 27 unique part rows and four bodies, exact source body restrictions/default costs,
  46 local links/anchors, consistency and whitespace/diff review. No gameplay tests were repeated.
  No pure model fixtures or runtime changes were added, and no
  browser saves were accessed.
  The contract lists the deterministic fixtures required after review and before dependent implementation.
- Slice 20's completion boxes stay open. Remaining slice-19 player discovery, ordinary-Life and real-phone
  checks stay open; this design task supplies no additional play or performance evidence.

## Slice 20A review checkpoint (8 Nov; A remains open)

- Task base: `c6c272d`; branch `codex/slice20a-review`; checkpoint subject:
  `docs: specify provisional lighter-upkeep direction for slice 20A`. Prior review: `5ce8615`.
  Documentation only; gameplay remains at `13b1ccb`. No pure model, fixtures, runtime/codec changes or
  browser-save access.
- [Accepted calls](decisions.md#8-nov-slice-20a-contract-review-in-progress): **B accepted as proposed**
  (single-copy bonuses, explicit variants/upgrades, finite-place conflicts, old effects retained for legacy
  builds); **C accepted as proposed** (bilateral whole-row damage, loss of locked rows, versioned compatibility,
  recoverable input, old pending/feeding semantics and visible launch-conflict resolution).
- **A follow-up:** defaults/locks sound acceptable provisionally; the user prefers light starting upkeep
  and explicitly wants the rules open to revision. A possible lower verb limit is tentative. The
  [concrete proposal](design/20a-body-part-contract.md#a-revision-light-upkeep-and-open-verb-limit) includes
  ordinary built-ins in base upkeep 1 with one explicit leg/flap allowance, extra tools cost normally,
  and three stays a provisional ceiling (fewer allowed). Exact revision awaits a user call; do not treat
  “maybe” as an accepted hard two-verb cap or the proposed cost allowance as already accepted.
- [Review assessment](design/20a-body-part-contract.md#review-assessment-8-nov) records the recommendation,
  numeric costs and risks. Accepted B variants do not silently accept A's default loadouts/starting costs.
  Keep dependent implementation gated until A is settled and examples are reconciled.
- Docs checks: 108 local links/anchors, all 27 unique production part mappings/four body records, source
  consistency and whitespace/diff scope. Proposed upkeep arithmetic passes for five starter examples and
  all four default-only bodies against production nominal costs plus the proposed allowance. No gameplay
  tests repeated; no new balance/performance/play claim.
  Slice 20 completion boxes and slice 19's outstanding player/phone checks remain open.

**Next action:** settle the [concrete A proposal](design/20a-body-part-contract.md#a-revision-light-upkeep-and-open-verb-limit),
then record the selected rule and reconcile the contract's nominal/effective cost examples. B/C do not
need re-approval unless that amendment changes them. Only after the contract is settled, use a fresh
implementation session for 20A's pure model/fixtures. Runtime body
integration is not authorized here. Separately, have the player find/open a next patch unaided for slice 19.

> Read AGENTS.md, docs/status.md and docs/design/20a-body-part-contract.md. B/C are accepted; A's defaults/locks
> are provisionally acceptable, with lighter upkeep preferred and a lower verb ceiling tentative. Settle the
> concrete A cost proposal and reconcile the contract before implementation.
> Preserve the running game; do not begin runtime body integration. Keep slice-19 checks open.

## Later work retained
- Step 5: general bodies/six places and arthropod/trilobite head geometry. Body toy/rendering spike remain in
  `c9c20da`; [body approach](design/body-approach.md) and [slice 18 playtest](playtests/18-body-toy.md) have details.
- Step 6: species founding/whole-build inheritance, recipe transitions, respec and XP ownership remain open.
  [P46](proposals.md) retains the remaining shape-effects proposal; built-in power first is now decided for step 5.
- Step 9: final style remains open, between OSRS and Stardew Valley. Step 3's three play checks are still open.
- Research shortlist and biology-tooltip checks remain in their existing docs; no new research was needed here.
