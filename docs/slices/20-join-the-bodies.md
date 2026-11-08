# Slice 20: Join the bodies

**Milestone:** M2, step 5 ([ROADMAP](../../ROADMAP.md)).
**Question:** Is the creature I equip the one I play, with readable choices that keep habitats different?
**Status:** 20A model built 8 Nov (`game/src/data/body.ts`, `sim/body.ts`, `sim/body-hurt.ts`, `tests/body.test.ts`); 20B equipment view built 9 Nov (`ui/Equip.svelte`); 20C cutover built 9 Nov (the runtime runs on `Build`; v4 save reset; `ui/LifeBody.svelte`), your play pending. [20A contract](../design/20a-body-part-contract.md) approved 8 Nov. Trimmed 8 Nov
after the [review](../design/m2-review-8-nov.md); the long version is at `git show fa6baee:docs/slices/20-join-the-bodies.md`.
**Builds on:** [release vision](../design/full-version.md), [body approach](../design/body-approach.md),
[20A calls](../decisions.md#8-nov-slice-20a-contract-review), [8 Nov calls](../decisions.md#8-nov-review-of-the-codex-stretch-and-tierzoo)
(sea save resets at the cutover; Dash outside the verb ceiling), [Part C feedback](../playtests/19-join-the-sea.md#reported-part-c-desktop-feedback-8-nov).

## Cause and smallest change

The Life/sea loop is fun in desktop play and habitats change runs. Missing: a large creature with visible equipment
places, backed by the same body and parts used on the board. Production still has per-body view classes, head/side/tail
slots and a verb-first launch picker; the toy's spine and painter work, but its built-ins and slots overlap.

Port the body/gait/painter pieces into `game/`, one part choice per named place, and connect an equipment view to the
real starting build and moult choices. Four current bodies; floor, turns, movement styles, habitats and sea lifecycle
unchanged. No new dependency. **Main risk:** current rules count repeated parts and tear one side's copy; 20A defines
the new rules explicitly instead of a silent substitution.

## In

### 1. One body definition for equipment and play
- Records for worm, arthropod, trilobite and swimmer (IDs kept) with shape, material, gait, places and movement.
- Six places: **Front, Eyes, Limbs, Sides, Back, Tail**. One choice each; size sets how many appendages are drawn,
  never the bonus. Built-ins occupy their place (no second copy drawn underneath). Locks restrict the part family.
- Defaults, locks, costs and effects per 20A. Built-in parts are the source of extra lineage strength (*decided 8 Nov*);
  lineage stat bonuses stay a later possibility.
- Keep worm tunnelling, arthropod moult vulnerability, trilobite ploughing/enrolment, swimmer capture/ambush. Shape is
  visual only.

### 2. The large equipment view
**Reference:** [A Life v2](../../toys/life2.html) (`life2-ui.ts`), "a good example" that "could be done differently":
body beside the board, part cards with effects and upkeep, a visible starter allowance, pick a part then a place.
- From an eligible patch: the body large, its six labelled places, the available parts beside it. Selecting a place
  highlights it on the creature (or a part highlights its legal places). Current, empty and locked states are clear.
- A part card shows its effect, upkeep and what it replaces, as a trade-off tooltip (TierZoo, 8 Nov). The same build
  is drawn at board size next to the large view. Show habitat/food context and the inherited part's origin.
- Parts are the choices; verbs are their consequences. Verb ceiling and starter allowance per 20A; a conflict is
  shown, never resolved silently. Quick presets stay where they fit and show any conflict.
- During a Life the view is inspection only, except choosing a moult offer: preview the part, cost and creature, one
  tap commits. No mid-Life swapping, inventory or extra offers.
- Phone: creature and controls stacked, tap and scroll, start/back reachable, no hover-only text. Pause the hidden
  preview and release its drawing resources.

### 3. Parts stay real gameplay
20A maps all 27 parts: place/family, bodies, drawing, effect/verb, upkeep, guards, injury, access. Its balance changes
(lost stacking, whole-row tears, new defaults) are approved; anything beyond them is a new proposal with an example.

### 4. Inheritance and the sea
- The first successful Life in a patch adds its actual eggs there; launch seeds nothing. Keep the two post-Life
  generations and eggs released vs population alive.
- One chosen compatible clutch part follows the continuation into its patch or a neighbour (*decided 8 Nov*, a bridge
  until step 6). The next Life starts small and grows through moults. Rules per 20A.
- Body identity stays separate from the observed diet. Sea lines stay aggregate body/diet with a representative
  build; the UI must not promise each custom build its own species. Named forms and family trees are step 6.
- One saved build draws the player, the result portrait and residents with a known build. Map markers stay capped.

### 5. Drawing
- Port the general spine, gaits and code painter into `game/` behind the small creature interface; no runtime import
  from `toys/` or `spikes/`, no engine or framework. Restrained low-poly on the current floor; style is step 9.
- Fix the arthropod/trilobite hull poking ahead of the head. Check head joins, front tools, eyes and mirrored rows at
  sizes 1–5 and several headings on a real board.
- Keep mud dimming, growth, strike feedback, softness and lost parts. Two builds on one body read differently at
  board size, mostly through the Front.
- Measure one packaged board with residents and preview, before and after (device, viewport, method, frame times).
  Optimise only if that shows a problem.

### 6. Saves and codes
Reset at the cutover; lay snapshots, resident drawing and `CLADE2-` codes per 20A. Old saves and codes are dropped
without a message (*decided 8 Nov*). Keep seed/RNG, patch graph and the once-only settlement of pending results.

## Review example
A worm in mud starts with digging/sensing tools, grows a trait, lays eggs and founds that patch. Its chosen clutch
part shows up in a neighbour's equipment screen. A grazing build in a food-rich patch and a digging build in mud lead
to different actions, silhouettes and upkeep. A moult changes the actual equipment; a later injury doesn't change the
build already laid. On paper only: which places an arthropod-to-trilobite recipe would lock (step 6 check).

## Boundaries and build order

| Part | Deliverable | Files (`game/src/` unless noted) |
| --- | --- | --- |
| 20A model | Pure definitions, check helpers, 20A fixtures; runtime untouched | new `data/`/`sim/` body files; read `data/life.ts`, `sim/life.ts`, `sim/verbs.ts`, `sim/hunt.ts`, `sim/threat.ts`, `toys/creature-data.ts`, `toys/creature-model.ts` |
| 20B equipment | Painter port, head fix, equipment preview in the launch flow, not yet launching | `main.ts`, `scene.ts`, `playback.ts`, `ui/Meta.svelte`, `ui/hud.ts`, new body view; read `toys/creature-*.ts`, `spikes/body-render/polyplus.ts`, `toys/life2-*.ts` |
| 20C cutover | Switch runtime parts, feeding, offers, drawing and saves together; reset; snapshots, continuation, codes, residents; play | `sim/sea-life.ts`, `sim/sea-save.ts`, `sim/save-validation.ts`, `sim/share.ts`, `sim/feeding.ts`, `sim/door.ts`, `ui/Clutch.svelte`, resident views |

The game stays playable at every commit; the runtime switches in one verified change (20C).

## Out
- XP, respec, unlock gates, lineage recipes, hatching/family tree: step 6.
- More bodies, worm hunting, algae and food chain: step 7.
- Whole-build inheritance, founding custom species: step-6 species design.
- Reefs, new geography, stocks, minigames: ideas. Final art, per-leg placement, map crowd portraits: later.
- Save compatibility, mid-Life saving: step 10.

## Done when
- [ ] 20A's fixtures pass for all 27 parts and four bodies.
- [ ] The equipment view shows the large creature, six places and real parts; previews match the next Life's body,
  verbs, costs and inherited part.
- [ ] Two builds on one body look and play differently on fitting habitats.
- [ ] Growth, offers, upgrades, rares and injury stay playable: no duplicated appendages, free parts, invalid presets
  or impossible offers. All four bodies keep their roles; the head poke is fixed.
- [ ] Reset, lay snapshots after injury, once-only release, zero-egg continuation, extinction and codes pass tests.
  Drawing doesn't touch the sim or RNG.
- [ ] `npm run check`, `npm run build:game` and the updated `node scripts/sea-smoke.mjs` pass.
- [ ] Your notes compare large/board views, two builds, a moult, a neighbour and a result; performance method noted;
  real-phone checks stay open until done.

## Size check
One system, the general equipped body, in three parts (20A–C), each one or two sessions. Sea settlement remains the
only owner of population changes. Open after equipment play: A's costs, locks and the verb ceiling.
