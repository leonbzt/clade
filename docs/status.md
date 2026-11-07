# Status

Updated 2026-11-07. Branch `codex/m2-step4-spec`. Active spec: [19 Join the sea](slices/19-join-the-sea.md).
Read this and that spec first; open other docs and source files only as needed.

## Saved checkpoint
- Previous work is committed at `c9c20da` on `claude/project-thread-cy8ptv`; it was not lost at the limit.
- The task branch starts from that commit. `d36588e` preserves the previously untracked `AGENTS.md` unchanged.
- This documentation checkpoint is committed as `docs: specify M2 step 4 and session handoffs`; use
  `git log -3 --oneline` for its hash. No gameplay, dependency or save-file changes in this checkpoint.
- No push was performed. The old branch was one commit ahead of its locally recorded upstream; the transcript's
  `git push origin main` did not push that working branch. Remote state has not been freshly queried.

## Current milestone and decisions
M2 release: steps 1/2 are complete. Step 3 is built and played but retains three open play checks. Step 4 now has
a saved scope spec; implementation has not started. The roadmap order is unchanged.

- New seas start without animals. The first worm Life founds the population; food/environment remain present.
- Next Lives start from the **last successful clutch**, in its patch or a directly adjacent patch. Keep it for
  retries; replace it on a new success. Any living descendant population is not an alternate launch source.
- Existing bodies temporarily open after founding; no new tier gates or recipes in step 4.
- The player invents the same species seen on the map. Worm hunting and species-code compatibility still need
  bounded decisions before dependent integration; see the spec. Do not re-ask the settled founding/clutch choices.
- Context-saving rules and the request for handoff reminders are saved in [workflow.md](workflow.md).
  Exact calls: [decisions.md](decisions.md#7-nov-join-the-sea-empty-founding-and-continuation-resumed-in-codex).

## Verification and known limits
The read-only audit at `c9c20da` found 72/72 tests passing across 11 files (3.44 s), type checking with zero errors/
warnings, and both Vite targets compiling in memory. Tests used a cache-disabled, in-memory Vitest configuration
with thread workers; type checking explicitly loaded `svelte.config.js` to avoid temporary writes. This was not a
normal `npm run check` invocation. Root build targets the archived plant game; release uses `build:game`.

- Reproduced: `parseSave()` accepts structurally invalid saves; `advance()` advances another four hours on the next
  tick after a twelve-hour absence; plain JSON loses the sea's typed-array types; a weaker toy release lowers fitness.
- Inspected: `act()` persists terminal results after animation; live worm prey are disabled, but carcass diet can
  label worms as predators and give their board hunter swimmer behaviour. These matter to integration.
- No browser or phone test, and no final single-file packaging test in the audit. Playwright is not declared or
  installed here; do not claim `npm run look` works without establishing that dependency.
- Documentation checks: 81 local links/anchors passed; whitespace and file-scope review passed. Gameplay tests
  were not repeated for these documentation-only changes.

## Next session
Good handoff point now: the spec and decisions are saved. Start a fresh session for **slice 19, part A**.

> Continue on `codex/m2-step4-spec`. Read AGENTS.md, docs/status.md and docs/slices/19-join-the-sea.md.
> Work only on part A: the sea model, serialization and legacy migration, keeping the current UI playable.
> Inspect the relevant implementation, explain the smallest change and verification plan before coding, and
> obtain approval unless implementation is already authorized. Preserve saves, use focused commits, update the
> handoff and remind me when this part is ready for a fresh session. No subagents or new dependencies by default.

## Later work retained
- Step 5: general bodies/six places and arthropod/trilobite head geometry. Body toy and rendering spike are saved
  in `c9c20da`; [body approach](design/body-approach.md) and [slice 18 playtest](playtests/18-body-toy.md) hold the details.
- Step 6: parts entering new bases, respec and XP ownership remain open. [P46](proposals.md) retains the body/slot
  proposals. Step 9: final style remains open; the target is between OSRS and Stardew Valley. Performance evidence
  so far is software graphics, not phones. Step 3's three play checks are still outstanding.
- Research shortlist and biology-tooltip checks remain in their existing docs; no new research is required for part A.
