# Slice 19: Join the sea

**Milestone:** M2, step 4 ([ROADMAP](../../ROADMAP.md)).
**Question:** Does each Life visibly change the sea and determine where you play next?
**Status:** scope draft reviewed in chat and saved with permission on 7 Nov; not implemented or played.
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
- **Proposal:** retain the existing diet-to-role calculation initially, but resolve its predator-worm mismatch
  before wiring it to board threats (see open questions). This slice does not introduce the general body model.

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
- Species export/import needs an explicit compatibility decision before the UI switch; do not silently remove it
  or let pasted codes bypass the new world's species and continuation rules.

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
- [ ] A new save has zero animals, including after time advances. Founding offers a playable worm board with no invented animals.
- [ ] A positive-egg result adds its actual eggs to its patch once and visibly becomes the continuation clutch.
- [ ] Only that patch and its direct neighbours permit the next run. A successful adjacent run moves the continuation point.
- [ ] Failure, retry, population extinction and reload cannot leave the player without a launch; retries do not duplicate releases.
- [ ] Existing bodies are selectable after founding without tier gates; distinct bodies remain distinct populations.
- [ ] Empty and depleted patches produce matching boards, including prey respawns and threats; no worm is presented as a swimmer hunter.
- [ ] Patch-to-board snapshots and result-to-population transfer have focused automated checks, including a full round trip.
- [ ] New saves round-trip deterministically; v1/v2 migration preserves progress and pending results; invalid/newer imports do not overwrite progress.
- [ ] Reload during terminal playback or clutch selection neither loses nor duplicates eggs. Storage failure has clear feedback.
- [ ] Offline tests cover below, at and above eight hours, repeated calls, and clock rollback; catch-up meets the roadmap budget.
- [ ] Species-code compatibility is documented and tested; any temporary limitation is explicitly approved.
- [ ] `npm run check` and `npm run build:game` pass. The packaged page is smoke-tested through founding, continuation and reload.
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
1. **Predator identity:** worms can score as predators by eating carcasses, but `preyInit()` only gives live prey to
   swimmers and the current threat path uses swimmer behaviour. Choose a bounded compatibility treatment before
   wiring those populations into threats; live worm hunting is not implied by the role label.
2. **Sharing:** how should existing species codes join a player-founded sea without separate rival species or
   bypassing spatial continuation? Preserve the feature pending an explicit adaptation or deferral decision.
3. **Founding balance:** does the real empty-world loop need a boost? Measure actual early clutches on a few seeds
   and play the return to the map before proposing a number. This does not block the model/serialization part.
