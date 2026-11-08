# Slice 19: Join the sea

**Milestone:** M2, step 4 ([ROADMAP](../../ROADMAP.md)).
**Question:** Does each Life visibly change the sea and determine where you play next?
**Status:** parts A/B implemented on 7 Nov: sea model, v3 runtime, patch snapshots, completion/continuation and
creature-design sharing. Part C map/feedback are implemented and automated verification passes. Reported desktop
play supports the loop and habitat variety; next-patch discovery needs improvement. Remaining player and real-phone checks stay open.
Verification is recorded in `docs/status.md`.
**Builds on:** [7 Nov decisions](../decisions.md#7-nov-join-the-sea-empty-founding-and-continuation-resumed-in-codex),
[the release vision](../design/full-version.md), the sea toy (slice 17), and the existing Life, clutch and save systems.
Gameplay calls below are settled for this slice; items labelled proposal or open are not new user decisions.

## In

### Founding and continuation
- A new sea starts with no animals. Food and environmental conditions exist. The first Life is a worm;
  eggs laid during it establish the first population. No pre-populated natives or automatic open-sea immigration.
- The last successful clutch permits a Life in its patch or one directly adjacent patch in the sea's neighbour
  graph. Distant occupied patches do not become launch points merely because the simulation spread there.
- A Life with eggs is successful for continuation, even if the parent later dies. Its completed result becomes
  the new clutch; a zero-egg Life keeps the previous clutch. Before the first success, retry founding.
- The continuation clutch remains available for retries even if its world population dies out. No new egg-spending
  inventory: starting a run must not create a permanent dead end. Retrying does not release the old eggs again.
- After founding, offer the existing worm, arthropod, trilobite and swimmer without new rank gates or recipes.
  This temporary body selection uses the continuation clutch's location; it is not a permanent evolution rule.
  Starting a body does not add its population to the sea; releasing its eggs does.

### The patch, the board and the result
- The sea replaces the garden as the world's simulation. Port the selected `toys/sea*` logic into `game/`;
  retain the existing Life rules and presentation where possible. Do not import prototype page entry points.
- Carry a stable patch ID and species/body identity through selection, board creation, completed result and save.
  A role alone is not an identity: arthropods and trilobites must not collapse into one generic grazer slot.
- Keep the three authored terrain templates for now. The selected patch supplies their food stocks, oxygen,
  rivals, prey and threats. Species absent from the patch must not appear through minimum-prey rules or respawns.
  Board names, appearance and behaviour must agree about which animal is present.
- Snapshot the patch when the Life begins; the current board must not change underneath a turn. The result
  releases the actual eggs into that patch once. Further releases must not accidentally downgrade established fitness.
- **Proposal:** retain bounded food-safety adjustments around the start; show depleted food and absent prey honestly
  in the start card. A predator choice need not be viable in every patch. Do not manufacture animals to make it viable.
- **Decided 7 Nov:** keep recording diet; use inherited parts and verbs to specify feeding behaviour. Diet roles
  remain progress/identity labels, not permission to hunt. This slice does not introduce the general body model.

### Home map and feedback
- The sea map is home. Show eligible launch patches and why other patches are unavailable. Tapping a patch shows
  its food/oxygen bars, named populations, causes of recent changes and what its next board contains.
- Keep the toy's few named ecological rules and crash/boom/spread headlines. The return from a Life highlights
  its release patch and descendants, then makes the next eligible run clear. Pacing is tuned in play.
- Retain existing map markers and creature rendering for this slice. No dependency on the step-5 painter or a new art pass.
- Test founding against the empty starting world. The earlier nine-native competition experiment does not establish
  a required release multiplier. Any boost beyond actual eggs needs evidence and a separately stated tuning proposal.
- Early success is a visible founding and continuation loop; a one-species start need not meet the old mature,
  nine-species toy's crash and colour targets. Keep meaningful ecological checks as diversity grows.

### Saves and compatibility
- Version the sea save. Preserve seed, simulation RNG, elapsed time, patch populations, progress, forms,
  pending completed results and the continuation clutch. Serialize and reconstruct typed arrays explicitly;
  species arrays need stable IDs so content reordering cannot swap populations.
- Preserve v1/v2 progress and pending clutches through an explicit migration. The empty-start rule applies to new
  worlds, not a silent wipe of existing worlds. Document habitat-to-patch mapping and how a legacy save gets a
  continuation point before implementing the migration; keep original data recoverable.
- Validate imported data before replacing the active save. Keep failed imports recoverable, and report storage
  failures accurately. Persist a completed result before animation; reload and release must not duplicate eggs.
- Fix the offline cap so a second timer tick cannot consume time already discarded. Keep generation remainders
  for ordinary elapsed time and preserve the roadmap's eight-hour catch-up cap.
- **Decided 7 Nov:** species codes share starting creature designs (body, carried form and verbs). Existing codes
  remain readable; their score/habitat grants no population or launch access. Migrated visitors remain.

## Relevant files and smallest route

| Boundary | Inspect/change when its part starts |
| --- | --- |
| Sea model and patch graph | `toys/sea-data.ts`, `sea-patches.ts`, `sea-sim.ts`, `sea-news.ts`; port into `game/src/data` and `game/src/sim` |
| Board and result | `game/src/sim/door.ts`, `garden.ts`, `life.ts`, `hunt.ts`, `threat.ts`; habitat/prey data |
| Save and clutch | `game/src/sim/save.ts`, `clutch.ts`, `share.ts`; `main.ts` result lifecycle |
| Home and launch | `game/src/ui/meta.svelte.ts`, `Meta.svelte`, `Clutch.svelte`, `Menu.svelte`, `main.ts`; `toys/sea-view.ts` |
| Verification | `game/tests/sea.test.ts`, `garden.test.ts`, `save.test.ts`, `boards.test.ts`, `threat.test.ts`; `scripts/check.mjs`, `look.mjs`, `game/inline.mjs` |

Keep rules independent of DOM/Pixi. Use `door.ts` as the board/result boundary; add the patch reference where
needed without rewriting movement, parts or event playback. No new framework, dependency or generic plugin system.

## Out
- General bodies, six places, the head geometry fix and the new painter: step 5.
- New playable animals and live worm hunting: a bounded follow-up, coordinated with steps 5/7; not silently included here.
- Permanent lineage gates, parts unlocks, XP, family trees and recipes: steps 5/6.
- The algae layer, food-chain expansion, shore and final art pass: their existing roadmap steps.
- Full mid-Life saving: step 10. Completed-result recovery and continuation saves are in this slice.
- Release publishing and repository-wide cleanup: step 10. `npm run build:game` remains the current game build;
  plain `npm run build` targets the archived plant game.

## Done when
- [x] A new save has zero animals, including after time advances. Founding offers a playable worm board with no invented animals.
- [x] A positive-egg result adds its actual eggs to its patch once and visibly becomes the continuation clutch.
- [x] Only that patch and its direct neighbours permit the next run. A successful adjacent run moves the continuation point.
- [x] Failure, retry, population extinction and reload cannot leave the player without a launch; retries do not duplicate releases.
- [x] Existing bodies are selectable after founding without tier gates; distinct bodies remain distinct populations.
- [x] Empty and depleted patches produce matching boards, including prey respawns and threats; no worm is presented as a swimmer hunter.
- [x] Patch-to-board snapshots and result-to-population transfer have focused automated checks, including a full round trip.
- [x] New saves round-trip deterministically; v1/v2 migration preserves progress and pending results; invalid/newer imports do not overwrite progress.
- [x] Reload during terminal playback or clutch selection neither loses nor duplicates eggs. Storage failure has clear feedback.
- [x] Offline tests cover below, at and above eight hours, repeated calls, and clock rollback; catch-up meets the roadmap budget.
- [x] Species-code compatibility is documented and tested; any temporary limitation is explicitly approved.
- [x] `npm run check` and `npm run build:game` pass. The packaged page is smoke-tested through founding, continuation and reload.
- [x] The home is the living patch map; selection, launch range and named populations are readable.
- [x] Return from a Life shows its actual release, current line distribution and next eligible patches without replaying settlement.
- [ ] A phone playtest checks map readability, taps and performance; limitations are reported if no device is available.
- [ ] The user can explain where the first animals came from and why the next run can start where it does;
  notes are saved in `docs/playtests/19-join-the-sea.md` after actual play.

## Size check and session boundaries
- New system: one integrated patch-based sea/continuation loop. The body and permanent progression systems stay out.
- Touches simulation structure and save format: yes; preserve the existing playable build during the port.
- This is larger than one small implementation session. Use three bounded parts, each with focused commits:
  **A.** Port the sea model and define/test serialization and legacy migration while leaving the current UI playable.
  **B.** Wire patch boards, completed results, the continuation clutch and failed-run recovery.
  **C.** Switch the home map, resolve sharing/representation edges, then verify the packaged loop and playtest.
- Explain each part's smallest change and tests before implementation; obtain approval if that implementation is not
  already authorized. Start a fresh session after the saved spec and after each verified part, with `status.md` updated.

## Open questions (before dependent work)
1. **Predator identity resolved:** parts and verbs specify feeding; diet stays recorded. No new live worm hunting.
2. **Sharing resolved:** import a creature design to try in an eligible Life; do not introduce a visitor population.
3. **Founding balance:** does the real empty-world loop need a boost? Measure actual early clutches on a few seeds
   and play the return to the map before proposing a number. This does not block the model/serialization part.

## Part A implementation boundary and migration

- Stage the production sea and v3 codec alongside the playable v2 garden. Part B will switch the runtime save and
  connect results; Part C will replace the home view. Do not keep two live simulations or silently overwrite the
  browser save during this model-only port. Save preservation is lower priority per the 7 Nov implementation request;
  the bounded migration below remains part of A.
- Species carry stable IDs, role and (for player lines) body. Player IDs are `line:<body>:<role>` so different bodies
  and diets never share a slot. The saved registry owns array ordering; decoding orders by ID and remaps columns.
  Natives and visitors exist only when migrated. New seas have food/environment but zero populations and no immigration.
- Each legacy habitat maps to its lowest-ID patch with matching ground (lowest patch ID as a fallback if a seed
  lacks that ground). Copy food, oxygen and their normal values to matching patches, but put each population only
  in its mapped patch: no multiplication by patch count. Preserve its score, body/role, native/visitor identity,
  simulation generation/RNG, timestamp, progress, forms and unlocks. Retain the original JSON in the migrated save.
- Pending completed results keep their cards, eggs and habitat, gain patch/species references, and are **not** released
  by migration. A positive pending result is the continuation point. Otherwise use the highest-scoring successful
  player entry (ties: habitat order, then species ID); if none survives, use the best positive tier in progress with
  the old role's default body. With no success evidence, leave continuation unset and allow founding. Old saves did
  not record the last successful clutch, so this deterministic fallback cannot reconstruct its exact chronology.
- Store the patch graph, species registry, ecological memory and headlines explicitly; reconstruct all typed arrays.
  The immutable island is regenerated from its seed; the saved patch graph is retained. A future island-generator
  change needs a save-version decision. Movement buffers are scratch space and are rebuilt empty.
- Validate before returning a save; reject malformed or newer data without storage writes. Keep ordinary partial
  generations, discard elapsed time above eight hours once, and never move the timestamp backwards on clock rollback.
  Browser storage feedback and terminal-playback/release atomicity belong to the runtime integration in Part B.


## Part B implementation boundary

- `sea-life.ts` owns launch eligibility, terminal completion and settlement. `door.ts` makes detached patch boards.
  The current Life keeps its snapshot while the sea can advance later. Species absent at launch cannot respawn.
- Save the completed result before terminal playback. Its actual eggs, inherited parts, diet, cards and patch/species
  references survive reload. Settlement accepts only the active pending object, releases once, advances the existing
  two post-Life generations and clears pending in one saved snapshot. Failed writes retain recoverable in-memory
  progress and show an error/retry; imports replace active state only after validation and a successful write.
- Positive results replace continuation even if the parent died. Zero-egg results retain it; extinction never
  revokes it. Founding permits worms; afterwards all four existing bodies are available. No launch spends eggs.
- Parts at the latest lay represent the clutch. The best successful clutch supplies the existing body/diet line's
  representative build, with latest winning ties. Feeding is derived from those parts/verbs, independently of diet.
  Graze tools use mats, dig/crush tools use rot, capture arms/spines hunt; mixed non-hunting tools split effort.
  Existing IDs and the v3 format remain readable, with optional validated `parts`/`diet` fields. Old builds get
  deterministic body-compatible defaults; there is no separate genotype registry or new stock.
- Current worm, arthropod, trilobite and swimmer bodies are reused for matching residents. Unknown migrated body
  types are listed as sea-only instead of being disguised. Old worm predator labels now use scavenging tools.
- Codes describe a fitting starting build, including one carried form and available verbs. Code score and habitat
  do not grant eggs, animals, bodies before founding or distant launch points. Imported designs remain selected
  for the current visit; the portable code can be pasted again. Invalid designs leave the previous selection intact.
- Part B keeps the existing island drawing with patch lists and stock/population/board previews. Part C still owns
  the actual patch-map view, release/descendant highlighting, pacing and player/phone playtests.

## Part C implementation specification

Specified 7 Nov at the user's request. This defines the remaining presentation/playtest work in step 4;
permanent evolution progression comes later. [Part B feedback and play protocol](../playtests/19-join-the-sea.md);
[release route and proposed design review](../design/part-c-and-gameplay-review.md).

### Cause and smallest change

The production sea, patch graph and Life lifecycle exist. `Meta.svelte` still draws `drawIsland` with habitat
buttons and patch lists, and `main.ts` returns directly to a patch card after settlement. The sea toy already
has patch colouring, roaming population markers, overlays and history curves. Port that presentation into
`game/`, adapt it to the saved species registry and part-based feeding, and connect selection/result feedback.
Do not port the toy's starting populations or entry point, create a second simulation, or rewrite the Life.

### C1. The living map is home

- Keep the island/sea geography and current visual style. Draw actual patches with population-dependent fill,
  transitions and a capped set of moving markers. Zero animals means zero animal markers, even after waiting.
- Reuse the toy's population, mats, oxygen and hunter views with a small legend. Read production `sea.species`,
  `holder`, `preyOf`, `huntersOf` and feeding rules; never assume the toy's fixed species indices or use diet
  labels as hunting permission. The population view's holder colour describes dominant prey; hunter presence
  must still be visible in markers/details and the hunter view.
- Distinguish bodies/species with labels and a stable visual key. All current player lines share one saved
  colour, so do not rely on that colour alone. View-only distinctions may use stable IDs without rewriting saves.
  Preserve existing simple map markers; detailed inherited-body portraits wait for step 5. Unknown migrated
  animals get an honest generic marker/name and the existing sea-only explanation, not a false playable identity.
- Tapping a patch opens its card directly. Show food/oxygen, named populations, recent causes, the next-board
  preview and the toy's compact stock/prey history using the existing history buffer. No invented historic data.
- Mark selection, the last successful clutch and its direct neighbours distinctly; explain the key in text.
  Other patches remain inspectable and explain why launch is unavailable. Population spread grants no access.
- Make the map the primary route. Keep a compact named patch/eligible-patch list as a keyboard/touch fallback
  for tiny patches, plus a clear return-to-map action. Preserve loadout, design import/export, menu, away news,
  pending-clutch recovery and storage-error controls.
- Fit phone widths, use a scrollable patch sheet without covering every map cue, and avoid hover-only controls.
  Reuse the existing canvas approach; cap decorative markers and stop its animation while the map is hidden.
  Drawing and visual randomness must not advance or consume the simulation RNG.

### C2. See what the Life changed

- After successful settlement, return to the visible map, focus/pulse the release patch and state the actual
  eggs released and species/body name. Show the current population separately: the existing two post-Life
  generations may already have changed it. Keep next-run access clear and the feedback short/skippable.
- Highlight the selected line's current occupied patches and actual spread/change events. These are aggregate
  body/diet populations, not tracked individual descendants of the latest clutch. Use wording such as “Your
  worm line here”; do not invent an ancestry trail or attribute all existing animals to the last release.
- Use read-only before/after display data around the existing once-only settlement if needed. Feedback may
  interpolate saved observations, but must not release twice, add generations, delay persistence or change RNG.
  An extinct line still has a continuation marker; a zero-egg result shows no new release and keeps the old one.
- Keep transient animation state out of the save. After reload, reconstruct the last-clutch focus and current
  distribution from continuation/state; do not replay a settlement or pretend an unsaved animation was recovered.
  A pending result still resumes clutch selection before settlement, as in Part B.
- Retain truthful crash/boom/spread causes and a clear next eligible patch. Do not force a crash, add natives,
  boost eggs or change founding/continuation/unlock rules to make the presentation busier.

### Files and implementation boundary

| Work | Relevant files |
| --- | --- |
| Renderer and selection | Reference `toys/sea-view.ts`; port to `game/src/view/sea-map.ts`; reuse `view/islandmap.ts` |
| Cards, history and phone layout | `ui/Meta.svelte`, `ui/meta.svelte.ts`, `ui/style.css`; history reference in `toys/sea.ts` |
| Return feedback | `main.ts` around `settle`; reuse `sim/sea-life.ts` as the sole lifecycle owner |
| Read-only data | `data/sea.ts`, `sim/sea.ts`, `sea-news.ts`, `sea-patches.ts`, `feeding.ts`, `door.ts` |
| Verification | Relevant sea/lifecycle tests; `scripts/sea-smoke.mjs`; playtest 19 |

Expected runtime edits are presentation and the small return-feedback connection. No new dependency, save
version, genotype registry, body model, equipment system, permanent gate, XP, recipe or minigame is needed.
Sharing rules were resolved in B; only preserve access and honest representation here.

### C3. Verification and completion

1. Add focused checks for any nontrivial map/state mapping: resized canvas coordinates select the correct
   patch; eligibility follows the graph; absent populations have no markers; legacy identities and part-based
   hunter classification remain correct. Check that rendering does not mutate simulation state/RNG.
2. Update the packaged smoke runner to navigate the real map, including a pointer/touch hit on a patch at a
   phone viewport, not only the fallback list. Retain pending/clutch reload, single settlement, failure,
   continuation, design sharing and save-error checks. Include dismiss/reload during return feedback.
3. Run `npm run check`, `npm run build:game`, and `node scripts/sea-smoke.mjs`. Inspect map/patch/return views
   at desktop and phone widths. The root `build` is still the archived plant build.
4. Play the ordinary loop using the protocol in playtest 19. Record actual founding and return pacing before
   proposing numerical tuning. A deterministic fixture checks correctness, not fun or founding balance.
5. Record a real-phone check, or leave that criterion open and state the device limitation. Report timings
   with the device/build/measurement method; do not reuse the toy's performance numbers as production results.
6. Inspect the diff for scope, commit the work and handoff, and keep slice 19 open until its player checks pass.

Use focused checkpoints for C1 (map) and C2 (return feedback), then the integrated checks/player pass. Start
a fresh session if a verified checkpoint becomes a handoff; do not repeat the A/B audit. The proposed next
design session is one general gameplay review after C's playable loop and before step 5.

Permanent species pacing and the large creature/slots/parts equipment view remain steps 5/6. The review
should shape them before their implementation; these requests are recorded, not treated as fixed by Part C.

## Part D: next-patch navigation follow-up (8 Nov)

**Accepted direction:** “play next list would be good”. This is the bounded response to reported desktop
difficulty finding the next patch, specified before the [step-5 body work](20-join-the-bodies.md). This
planning session changes documentation only; slice 19's remaining player/phone criteria stay open.

**Cause:** `Meta.svelte` has a current-clutch button, but its eligible-first patch list is collapsed.
`sea-map.ts` outlines eligible neighbours without necessarily numbering them. These are plausible causes
of poor discovery; the user has not identified a unique cause.

**Smallest change:**

- Show an always-visible “Play next” group directly below the map, before the long legend/news content.
  With continuation, show its patch first (“Last clutch”), then all direct neighbours (“Neighbour”).
  Each button includes the existing patch number and habitat name and opens that patch's card.
- Number those eligible patches on the map using the same IDs as the buttons. Keep clutch, selection and
  occupied-line distinctions legible in all overlays; these labels do not imply animals are present.
- Use the existing `launchPatches` result, not distance or occupancy. With no continuation, all patches are
  eligible for founding: show an obvious founding chooser using the existing patch list rather than a huge
  permanent button stack. Do not narrow founding access or pretend a last clutch exists.
- Retain inspection of all other patches and their unavailable explanation. Scroll/wrap the controls at
  phone widths. Use real buttons for keyboard access; no automatic launch or automatic “best” patch choice.
- Release, zero-egg retry, reload and extinction must update the choices from the same saved continuation.
  Keep the named all-patch fallback. Do not add simulation steps, change the graph or release population.

**Checks:** existing map/eligibility fixtures plus list-to-map/card matching; packaged smoke from a positive
clutch to a neighbour, through zero eggs and reload; desktop and phone-width layout. Ask the player to find
and open a next patch unaided. Run `npm run check`, `npm run build:game` and the focused smoke path after
implementation. Real-phone verification stays separately open if unavailable.


**Implementation checkpoint (8 Nov):** `feat: expose next-patch navigation` on `codex/slice19-part-d`.
Play next, the founding chooser and matching map labels are implemented. Typecheck, 102 tests, packaged
build and extended desktop/phone-width browser smoke pass. See [verification notes](../playtests/19-join-the-sea.md#part-d-automated-navigation-verification-8-nov).
Unaided player discovery and real-phone checks remain open; slice 19 is not marked complete.
