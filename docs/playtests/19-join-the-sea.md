# Playtest 19: Join the sea

## Reported Part B feedback (7 Nov)

User report from chat, not an observed or instrumented session:

- Part B “mostly looks good”.
- The living sea map from the earlier version is still missing.
- Species unlocks still feel too fast.
- The equipment view is missing. Clarified: **large creature with visible slots and parts beside it**.
- Wants a general gameplay/design review of genes, founding species and how the systems support steering
  lifeforms, an RPG feel, fun runs and strategy; later minigames should fit the same vision.

Device, seed, run count, egg totals and timings were not supplied. This report does not complete the Part C
map, comprehension or phone checks. The current body access rule is temporary; the equipment view belongs to step 5.

## Planned Part C player checks

Use a separate test save/profile. Do not replace the player's existing save. Record build, seed, device/browser,
viewport, starting state and whether results came from normal play or a controlled fixture.

1. Start with zero animals. Play a worm normally, moult and lay; return to the map and identify what was founded.
2. Play consecutive Lives from the clutch and a neighbour. Identify the current continuation point and explain
   why an occupied distant patch remains unavailable.
3. Try two contrasting builds/feeding approaches where the actual food/prey supports them. Record whether
   the map influenced a choice and whether the board delivered what the patch preview promised.
4. Include a failed/zero-egg Life. Verify that the player understands the retained continuation and can retry.
   Use a separately labelled fixture for extinction/reload edge cases if ordinary play does not reach them.
5. Watch real population change. Identify a cause and the next useful run. A young one-species sea need not
   generate the mature toy's boom/crash sequence; do not inject animals to make a normal-play result look better.
6. On an actual phone, try small/border patches, sheet scrolling, closing/back, loadout, clutch and return.
   Check readable labels, taps, map animation, return from background and any visible stalls. Record hardware
   and measured frame/timing data when available; desktop mobile emulation is a separate result.

Suggested first sample: 3–5 consecutive ordinary Lives, then a short founding attempt on another fixed seed
if balance is uncertain. Expand only to resolve a specific problem. Record first eggs, survival, run duration,
confusing decisions and whether the player wants another run. Do not tune permanent species unlocks from this bridge.

Ask without explaining first: “Where did these animals come from?”, “What did your last Life change?”,
“Where can you start next, and why?”, and “What would you change in your next build?”

## Part C automated verification (8 Nov)

Build: task branch `codex/part-c-living-map`, C1 `a1da0f1`, C2 `99c413d`, plus the integrated-check
commit named in status. Packaged `game/dist/clade.html`, 755 KB; installed headless desktop Chrome,
390×844 mobile emulation and 1200×900 desktop, disposable browser profile. Fixed seed 1 from the smoke
runner's deterministic startup random source. Initial populations: zero.

- A CDP touch on the actual map opens the matching mud patch. The first edge-tile attempt failed;
  the final test uses the tile centre and content bounds, with CSS borders excluded from hit mapping.
- A controlled terminal lay releases 3 actual eggs through the normal lifecycle. Pending playback and
  clutch reload preserve the result; settlement occurs once. Return text distinguishes 3 released eggs
  from the current population after two generations. Dismissal changes no save state.
- A zero-egg terminal fixture retains continuation. Reload while feedback is visible reconstructs the
  clutch marker without replaying feedback. Out-of-range patches remain inspectable and cannot launch.
- Existing smoke coverage for four bodies, design sharing, storage retry and reload still passes.
  All overlays are exercised; no page exceptions observed. Five pure/renderer map fixtures and the
  existing integrated suite pass via `npm run check`; `npm run build:game` passes.
- Screenshots of map, patch and return views were visually inspected at phone width; desktop map/return
  and patch-sheet views were also inspected. The phone patch
  sheet leaves map cues above it and scrolls to history/loadout actions. The real map and return view
  retain the existing pixel geography and panel style. Screenshots are in `/tmp/clade-sea-*.png`.

These are automated correctness fixtures and desktop layout observations. They do not establish ordinary
founding balance, fun, comprehension, production frame rate or real-device touch performance. No numerical
tuning was made. The prior Part B deterministic viability test was not repeated as a player test.

## Human and real-phone results still pending

No observed human playtest or real-phone device was available during Part C implementation. The ordinary
3–5-Life protocol above, actual early-clutch/run timings, the comprehension questions, the player's verdict,
and phone/background/performance checks remain open. Save those observations here in the next fresh session;
slice 19 is not complete until its player criteria pass.
