# Slice 20: Join the bodies

**Milestone:** M2, step 5 ([ROADMAP](../../ROADMAP.md)).
**Question:** Is the creature I equip the one I play, with readable choices that preserve the fun of different habitats?
**Status:** specified for review 8 Nov; inheritance and initial lineage-power choices are recorded below.
The request authorizes specification, not runtime implementation. Slice 19's navigation follow-up and
outstanding player/phone checks remain separate.
**Builds on:** [release vision](../design/full-version.md), [body decisions](../decisions.md#6-nov-after-the-body-toy-slots-and-style-style-still-open),
[body approach](../design/body-approach.md), [review](../design/part-c-and-gameplay-review.md),
[Part C desktop feedback](../playtests/19-join-the-sea.md#reported-part-c-desktop-feedback-8-nov).

## Cause and smallest change

The connected Life/sea loop is now fun in reported desktop play, and habitats noticeably change the runs.
The missing step-5 experience is the large creature with visible equipment places, backed by the same body
and parts used on the board. Production still uses per-body view classes, head/side/tail slots, and a
verb-first launch picker. The creature toy has a general spine and recipe-based drawing, but its built-in
appendages and added slots can draw over one another. It is not the final six-place model.

Port the proven body/gait/painter pieces into production, use one occupied part choice per named place,
and connect an equipment view to the actual starting build and moult choices. Start with the four playable
bodies. Keep the existing floor, turns, movement styles, habitats and sea lifecycle. No new dependency.

**Main risk:** this is more than a renderer swap. Existing rules count repeated legs, gills, guts and pouches;
strikes depend on side and can tear parts off. Six choices cannot silently be substituted for those rules.
Part A must make the mapping, costs, coverage and compatibility explicit before runtime cutover.

## In

### 1. One body definition used by equipment and play

- Stable records for worm, arthropod, trilobite and swimmer, retaining current IDs (including `swimmer` in
  saves/codes). Shape, material, gait, places and existing movement behaviour belong to those records.
- Six named places: **Front, Eyes, Limbs, Sides, Back, Tail**. A row is one equipment choice; body size
  determines how many appendages are drawn. Decorative leg count must not accidentally multiply stat bonuses.
- One place holds one part or part variant. A built-in appendage occupies its place instead of drawing a
  second copy underneath equipment. A locked place constrains the part family; it can accept fitting upgrades.
  Future lineages may reopen places, but no lineage-transition/unlock system is implemented here.
- Proposed bound: leave at least three places open on each current body. Publish the exact locked families,
  defaults and effects for all four before the model is wired into play. **Decided 8 Nov:** start with built-in
  parts as the source of extra lineage strength; retain existing base/movement rules. New lineage stat
  bonuses remain a possible later direction, not a rejected option. Do not add them in this slice.
- Preserve existing base movement and habitat interactions: worm tunnelling, arthropod movement/moult
  vulnerability, trilobite ploughing/enrolment, swimmer movement/capture/ambush. Data may select these existing
  behaviours; no generic mechanics framework or broad rewrite is needed.
- Shape is visual in this slice; existing body rules still have effects. No new shape stat or shape editor.

### 2. The large equipment view

**User reference (8 Nov):** [A Life v2](../../toys/life2.html) is “a good example”, and “could be done
differently”. Its `life2-ui.ts` shows the body alongside the board, part cards with effects/upkeep, a visible
starter allowance, and picking a part then clicking a slot for both setup and moulting. Use that direct
connection between choice and body as the interaction reference. The new layout, drawing and choice order
may differ; retain readable parts, clear placement/replacement and an obvious start action. This does not
adopt the toy's old slot counts, starting rules or lineage progression.

- From an eligible patch, select the body and see a large creature, its six labelled places and available
  parts beside it. Selecting a place highlights it on the creature; a part-first flow may instead highlight
  its compatible places. Show current, empty and locked states, and make the active choice unambiguous.
- A part explains its action/passive effect, food upkeep and what it replaces. Preview changes before launch;
  draw the same build at board size beside the large view. Show habitat/food context and inherited-part origin.
- Parts are the choices; the displayed verbs are their consequences. Preserve the three-active-verb limit,
  and show a conflict instead of silently hiding an action or dropping an inherited part.
- Keep the current starting allowance: starter action parts plus the chosen compatible clutch part (and
  necessary body defaults). The screen must not grant six freely filled places, rare traits or extra passive
  equipment merely because every place is visible. The part-to-place contract must explain defaults' costs.
- Retain current quick build presets where they still fit. If six places makes an existing preset conflict,
  show and resolve that explicitly before launch; do not quietly change its advertised verbs.
- During a Life, the equipment view is inspection only except when choosing a legal moult offer. Moult
  previews show the replacing part, changed action/cost and resulting creature; selecting commits one offer.
  No free mid-Life swapping, extra turns, extra offers or inventory system.
- Phone layout stacks creature and controls, supports tapping and scrolling, and keeps start/back actions
  reachable. No hover-only explanation. Pause hidden preview animation and release its drawing resources.

### 3. Parts remain real gameplay

Part A's reviewable contract must enumerate all 27 existing `PartId`s, not just the toy's 11 visual parts.
For each: allowed place/family and bodies, visual treatment, effects/verb, upkeep, repeated-copy treatment,
guard directions, injury/shed behaviour, starter/moult availability, and legacy mapping. In particular:

| Existing case | Required resolution before cutover |
| --- | --- |
| Legs, flaps, gills, guts and pouches have per-copy effects | Define one row's effect and its cost; state any lost stacking as an intentional balance change for review |
| Raking and walking limbs currently coexist | Preserve the sweeper's meaningful action combination or explicitly propose its replacement; do not make a default preset invalid unnoticed |
| Grasping arms plus arm spines; ordinary/compound eyes; proboscis/hook | Define replacements/upgrades so improving a part does not accidentally remove capture, sensing or feeding capability |
| Blood, symbionts and progenesis are physiological traits | Keep their effects and readable labels; give them an explicit home rather than inventing unrelated visible anatomy or deleting them |
| Guards and torn parts depend on strike direction | Publish coverage and damage rules for each row; locked means restricted equipment, not invulnerable anatomy |
| A full or locked body may have no fitting offer | Offer a legal replacement/upgrade or allow growth to finish without installing a part; never trap the Life or consume a choice invisibly |

No part, rare effect or existing playable style may disappear as an incidental port. Any unavoidable change
to stacking or directional combat is a named proposal with a before/after example, not a routine refactor.
Keep movement, growth, laying, rare inheritance and injury decisions recognisable in actual play.

### 4. Inheritance, identity and the sea

- **Already settled:** the first successful Life in a patch contributes its actual eggs there. Existing
  residents/spread remain; new eggs add to them. Launch does not seed a population. Preserve the two existing
  post-Life generations and the distinction between eggs released and population currently alive.
- **Decided 8 Nov:** the one compatible part chosen from the last successful clutch follows
  that continuation into its patch or a neighbour. The next Life still starts small and grows through moults.
  This is a temporary bridge: later species/lineage integration must revisit inheritance. Whole-build or
  whole-build-plus-mutations inheritance and founding new species are later ideas, not rejected directions.
  Show which clutch supplied the trait.
- Save the carried choice with continuation; a positive result updates it once at settlement.
  A zero-egg result retains the previous continuation/trait. No chosen card means no new carried trait.
  Incompatible body changes explain why it cannot be equipped and do not erase stored forms. Existing local
  forms remain available explicitly; do not silently choose a different local part over the continuing trait.
- For old saves without a continuation trait, use the existing saved form for that continuation's exact
  patch/body/diet (or its documented legacy fallback) if compatible. With no evidence, show no inherited trait;
  do not infer the whole parent's build or grant a rare part.
- Keep lineage/body identity separate from the observed diet and tool-based feeding. Equipment previews
  describe capabilities; actual food eaten still records diet. Do not invent a new score to guess identity.
- Proposed bridge for step 5: sea populations remain aggregate body/diet lines with representative equipment.
  The latest/best representative rule from slice 19 remains. UI wording must not promise every custom build
  has its own independently persistent species. Named forms, family-tree identity and recipe transitions
  belong to step 6; the body's data must not be presented as already delivering those systems.
- The same saved build describes the player, equipment/result portrait and identifiable residents where
  their build is known. Generic/unknown migrated residents stay honestly labelled. Preserve the capped map
  markers for this slice; detailed moving portraits on every patch are not a completion requirement.

### 5. Drawing and existing appearance

- Reuse the general spine, gaits and code painter; port reusable source into `game/` instead of importing
  prototype entry points or depending on a toy/spike at runtime. Keep drawing behind the existing small
  creature interface where practical. Do not introduce an engine, rendering framework or plugin layer.
- Use the current floor and a restrained low-poly presentation as the working default. Final pixel/low-poly
  style selection remains step 9. Retain the ability to change the painter without changing simulation data.
- Fix the known arthropod/trilobite hull projecting ahead of the head. Verify head joins, front tools,
  eyes and mirrored rows at sizes 1–5 and in several headings, including turns on an actual board.
- Preserve mud dimming, growth, strike feedback, softness and lost-part appearance. Two builds on one base
  should read differently at board size, especially through the front appendage.
- Measure a representative packaged board with its actual residents and equipment preview. Record device,
  viewport, method and frame times; compare the unchanged build with the new one. Do not reuse toy numbers
  or CPU throttling as a claim about phone hardware. Optimise only if that comparison reveals a problem.

### 6. Saves and sharing

- Keep populations, progress, seed/RNG, patch graph, continuation and pending results. A pending old result
  must still settle its exact eggs once, including the build recorded at the last lay before later injury.
- Define conversion with the part contract. Keep original data recoverable; old arrays may contain repeats
  or mixed parts that cannot fit six choices. Do not discard those entries or overwrite their effects through
  a guessed mapping. A conflicting launch design needs a visible resolution before use.
- If new place assignments/variants change the meaning of saved data, use an explicit save version and
  tested migration. Simple optional fields alone do not justify silently reinterpreting v3 parts.
- Existing share codes still decode as starting designs, granting no animals or launch access. Codes that
  conflict with the new places explain the conflict. Export must faithfully reproduce the offered starting
  build, using a versioned extension if necessary; no design library or exchange service.

## Concrete review example

A worm in mud starts with digging/sensing tools, grows a useful trait, lays eggs and founds that patch.
Its next Life can go to a listed neighbour. The chosen compatible clutch part
appears in that neighbour's equipment screen before launch. Compare a grazing build in a food-rich patch
with a digging build in mud: different actions, silhouette and upkeep should lead to different decisions.
Moulting changes the actual equipment; a later injury must not rewrite the build already laid in eggs.

For a future arthropod-to-trilobite recipe, inspect on paper which places become characteristic/locked and
which remain personal choices. Do not implement the recipe in this slice. This checks the body contract
against step 6 without adding a tree or temporary unlock ladder now.

## Boundaries and build order

| Boundary | Deliverable | Files to inspect/change when that part begins |
| --- | --- | --- |
| Slice 19 follow-up | Approved visible Play next choices and eligible map labels; separate small commit | `ui/Meta.svelte`, `view/sea-map.ts`, map fixtures/smoke runner; [spec](19-join-the-sea.md#part-d-next-patch-navigation-follow-up-8-nov) |
| 20A: model contract | All current parts and four bodies mapped; explicit effects/coverage/migration; focused pure fixtures before replacing the runtime model | `data/life.ts`, `sim/life.ts`, `sim/verbs.ts`, `sim/hunt.ts`, `sim/threat.ts`; reference `toys/creature-data.ts`, `toys/creature-model.ts` |
| 20B: equipment and board | General drawing, six-place editor, legal starters/moults, consistent actions and injuries; known head fix | `main.ts`, `scene.ts`, `playback.ts`, `ui/Meta.svelte`, `ui/hud.ts`, new focused body view; reference `toys/creature-body.ts`, `toys/creature-parts.ts`, `toys/creature-gait.ts`, `spikes/body-render/polyplus.ts`, `toys/life2-ui.ts`, `toys/life2-view.ts` |
| 20C: result and continuity | Chosen inheritance rule, exact result snapshots, compatible persistence/sharing, resident identity, integrated play pass | `sim/sea-life.ts`, `sim/sea-save.ts`, `sim/sea-migration.ts`, `sim/save-validation.ts`, `sim/share.ts`, `sim/feeding.ts`, `sim/door.ts`, `ui/Clutch.svelte`, resident views |

Paths in the table are relative to `game/src/` unless prefixed by `toys/` or `spikes/`.
Keep the current playable build intact at every checkpoint. Model helpers can be staged first; switching the
runtime requires the relevant persistence/feeding adapters from 20C in the same verified change. Never ship
an intermediate six-place model that the codec cannot preserve. Separate commits do not justify a broken boundary.

## Out

- XP, respec, permanent unlock gates, authored lineage recipes, full hatching/family-tree sequence: step 6.
- More playable bodies, live worm hunting, algae/food-chain expansion: step 7 or their bounded follow-up.
- Reefs, new patch geography, additional stocks, new minigames: ideas/later scope; no expansion here.
- Full adult-build inheritance, whole-build-plus-mutations inheritance and founding independent custom species:
  revisit in the step-6 species/lineage design, without assuming all require implementation in that step.
- Final art redesign, individual leg placement, new physics, generated animal assets, map crowd portraits: later polish.
- Mid-Life saving and publishing: step 10. Preserve completed-result recovery now.

## Done when

- [ ] The part/body contract accounts for all 27 existing parts, all four bodies, stacking and directional
  damage; any gameplay changes are explicit and approved before cutover.
- [ ] The equipment view shows the large creature with six labelled places and real available parts;
  previews match the next Life's body, verbs, costs and inherited trait.
- [ ] Two builds on the same base are recognisable and produce distinct choices on appropriate habitats.
- [ ] Growth, offers, replacing/upgrading parts, rare effects and injury remain playable; no duplicated
  appendages, hidden free parts, invalid starting presets or impossible locked-place offers.
- [ ] All four current bodies retain their movement/habitat roles; known head protrusion is fixed.
- [ ] Old pending results, save migration, exact once-only release, zero-egg continuation, extinction/retry,
  last-lay snapshots and design-code compatibility pass focused tests.
- [ ] Drawing/preview does not mutate the sim or RNG; resident identity stays truthful.
- [ ] `npm run check`, `npm run build:game` and the updated `node scripts/sea-smoke.mjs` pass. Add only
  meaningful fixtures around changed rules; retain existing sea regressions. Root `build` remains archival.
- [ ] Actual player notes compare large/board views, two builds, a moult, a neighbour and a result. Record
  performance method and limitations; leave unavailable real-phone checks open rather than marking them passed.

## Size check and decisions

One system: the general equipped body. It touches runtime part representation and save interpretation, so
it needs the three bounded parts above rather than a single oversized build session. Existing sea settlement
remains the sole owner of population changes. No roadmap reordering or new permanent progression system.

**Decided for step 5:** one selected clutch part follows continuation; start with built-in parts for extra
lineage strength, keeping current base/movement differences. Later species inheritance and lineage stats
remain open possibilities. No additional player decision blocks preparing 20A's contract; review its concrete
mapping and any balance changes before dependent runtime implementation. The remaining body-toy play checks
are still open; resolve recognisability with this real equipment/board view, and keep actual lineage-transformation
play for step 6.
