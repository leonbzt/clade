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

## Reported Part C desktop feedback (8 Nov)

User report from chat after a little desktop play, not an observed or instrumented session. Exact build,
seed, browser, run count, egg totals and timings were not supplied. No phone play was reported.

- “Everything seems to work as imagined”; likes playing the creatures and seeing them spread on the map.
- “The playthrough is fun”; differences between habitats are clearly noticeable. “This is a direction i like.”
- Could see changes in the map, but “the next patch wasn't really easy to find”. This is an open navigation
  issue; the report does not demonstrate understanding of the precise clutch/neighbour eligibility rule.
- Suggests “maybe some coral reefs or a little more structure on the map instead of just going sideways”.
  Saved as an idea, not an approved geography change; whether this means landmarks or different routes is open.
- Excited for the next phases and the first complete build. Asked whether later map improvements are planned:
  step 9 covers UI/art and step 7 ecological variety; neither currently specifies reefs or a new patch layout.

This supports the connected loop's appeal, visible consequences and habitat variety. It does not complete
the full player protocol or establish numerical balance. Next-patch clarity, founding/eligibility comprehension,
early-clutch/run timings and real-phone taps/background/performance remain open. Slice 19 stays open.


## Part D automated navigation verification (8 Nov)

Checkpoint: `feat: expose next-patch navigation` on `codex/slice19-part-d`, based on `2e3a9f9`.
Packaged page 756 KB; installed headless Chrome in a disposable profile, fixed seed 1,
390×844 mobile emulation and 1200×900 desktop. No personal saves accessed.

- Before founding, the visible chooser opens the complete named-patch list and focuses its first button.
- After a controlled real Lay/settlement of 3 eggs, Play next shows the saved clutch first and exactly its
  direct neighbours. Patch numbers, habitat names and Last clutch/Neighbour labels match saved access.
  Every choice opens its matching card; inspecting cards changes no continuation/population state.
- A direct-neighbour trilobite Life launches through the new list. A controlled zero-egg failure retains
  the previous choices immediately and after reload. The existing unavailable-patch inspection still works.
- Controls fit without horizontal overflow at both widths. Map/card touch, pending/clutch reload,
  single settlement, design sharing, storage retry and all map overlays still pass with no page exceptions.
- Phone-width return and desktop map screenshots were visually inspected: the list sits directly below
  the map, wraps to columns on desktop and stacks on phone width. Eligible patches have numbered labels;
  clutch/selection/line cues remain. Six renderer/projection fixtures and the full 102-test suite pass.

No player or real phone was available. Ask the player to find and open a next patch unaided; navigation
comprehension, the remaining ordinary-Life protocol and phone hardware checks remain open. Body work
was not started. This verification does not establish balance or frame-rate performance.
