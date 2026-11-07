# Status

Updated 2026-11-07. Branch `codex/m2-step4-spec`. Active spec: [19 Join the sea](slices/19-join-the-sea.md).
Read this and that spec first; open other docs and source files only as needed.

## Saved checkpoint
- Previous gameplay is preserved at `c9c20da`; `d36588e` preserves `AGENTS.md`. The reviewed spec is `bc4d87c`.
- Part A and this handoff are committed as `feat: stage sea model and v3 save migration`; use `git log -1 --oneline`
  for the hash. No new dependencies, browser save writes or push. Remote state has not been freshly queried.

## Current milestone and decisions
M2 release: steps 1/2 are complete. Step 3 is built and played but retains three open play checks. Step 4 part A
is implemented; parts B/C remain. The roadmap order is unchanged.

- New seas start without animals. The first worm Life founds the population; food/environment remain present.
- Next Lives start from the **last successful clutch**, in its patch or a directly adjacent patch. Keep it for
  retries; replace it on a new success. Any living descendant population is not an alternate launch source.
- Existing bodies temporarily open after founding; no new tier gates or recipes in step 4.
- The player invents the same species seen on the map. Worm hunting and species-code compatibility still need
  bounded decisions before dependent integration; see the spec. Do not re-ask the settled founding/clutch choices.
- Context-saving rules and the request for handoff reminders are saved in [workflow.md](workflow.md).
  Exact calls: [decisions.md](decisions.md#7-nov-join-the-sea-empty-founding-and-continuation-resumed-in-codex).
- Latest implementation instruction: "saves are no priority". The bounded migration remains in A; no browser data
  was accessed. See [Part A decisions](decisions.md#7-nov-join-the-sea-part-a-implementation).

## Part A completed and integration boundary
- Production files: `game/src/data/sea.ts`, `sim/sea.ts`, `sea-patches.ts`, `sea-news.ts`. No toy imports. New seas
  have food/environment, zero animals and no immigration. Player IDs include body and role; actual-egg releases
  keep arthropods/trilobites distinct and never lower established fitness. Existing toy/reference tests remain.
- `sim/sea-save.ts` exposes `freshSeaSave`, `serializeSeaSave`, `parseSeaSave`, `advanceSeaSave`, `SeaPending` and
  `Continuation`. V3 saves explicitly encode/reconstruct typed arrays and remap every species column by ID;
  seed, RNG, time, graph, ecological memory, news, progress, forms, pending result and continuation round-trip.
- `sim/sea-migration.ts` migrates validated v1/v2 data without releasing pending eggs. Each habitat's populations
  go into one matching patch, without duplication; original JSON remains in `legacy.json`. The spec documents
  the continuation fallback and missing-ground fallback. Old last-clutch chronology cannot be reconstructed.
- **Staged, not active in the UI:** `main.ts`/UI still use the v2 garden save, existing boards and sharing. Part B
  must switch runtime persistence to the codec, snapshot patch boards and implement result/continuation lifecycle.
  `release()` is an additive model primitive; exactly-once settlement and saving before playback are still B work.
- Active v2 reader now validates structure. The offline timestamp bug is fixed in both save paths: consume the
  eight-hour cap once, retain ordinary generation remainders and leave the timestamp unchanged on clock rollback.

## Verification and known limits
- Focused checks passed (23 tests), followed by the full suite: **85/85 tests across 13 files, 5.19 s**. Added
  production model/codec/migration checks; mature nine-native ecology expectations still test the original toy.
  Tests cover empty worlds, exact eggs, distinct bodies, fitness, deterministic reload, reordered species columns,
  v1/v2 progress/cards/visitors, malformed/newer inputs, extinction fallback and elapsed-time boundaries.
- `npm run check` passed after fixing a test-fixture typing error: zero type errors/warnings and all tests passing.
  The sandbox blocked the wrapper's child launches (`spawnSync npx EPERM`); the standard wrapper passed with
  execution permission after the first approval review timed out. No check-script changes were needed.
- `npm run build:game` passed and emitted `game/dist/clade.html` (730 KB). Existing build notices: Svelte config
  fallback, deprecated inlineDynamicImports and a large JS chunk. Root `build` targets the archived plant game.
- The populated migrated-registry catch-up test meets the roadmap's five-second target in this environment.
- All 51 local links/anchors in the changed docs passed. Whitespace and file-scope review passed.
- No browser/phone playtest. Playwright is not installed; no `npm run look` claim. Part A does not expose the sea
  in the UI, so founding/continuation play and packaged reload verification belong to B/C.
- Remaining runtime issues: terminal results currently persist after animation; storage failures lack clear feedback.
  Predator-role worms still need a bounded representation decision before threats; species-code adaptation is open.
  No balance boost was added or measured. The island generator must remain compatible with v3's saved seed/patch graph.

## Next session
Good handoff point: part A is ready. Start a fresh session for **slice 19, part B**.

> Continue on `codex/m2-step4-spec`. Read AGENTS.md, docs/status.md and docs/slices/19-join-the-sea.md.
> Work on part B: patch board snapshots, completed results, continuation and failed-run recovery. Inspect the
> staged sea model and v3 codec, explain the smallest change and checks before coding, and resolve the predator
> identity question before wiring threats. Follow the Part A integration boundary; keep the current UI playable.
> Saves are lower priority. Use focused commits, update the handoff and remind me at the next session boundary.
> No subagents or new dependencies by default.

## Later work retained
- Step 5: general bodies/six places and arthropod/trilobite head geometry. Body toy and rendering spike are saved
  in `c9c20da`; [body approach](design/body-approach.md) and [slice 18 playtest](playtests/18-body-toy.md) hold the details.
- Step 6: parts entering new bases, respec and XP ownership remain open. [P46](proposals.md) retains the body/slot
  proposals. Step 9: final style remains open; the target is between OSRS and Stardew Valley. Performance evidence
  so far is software graphics, not phones. Step 3's three play checks are still outstanding.
- Research shortlist and biology-tooltip checks remain in their existing docs; no new research is required for part A.
