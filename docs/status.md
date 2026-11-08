# Status

Updated 9 Nov 2026 (Claude). Branch `slice-20a-model`: 20A `b34e9cc`, 20B `3229e3d`, 20C `39ca951`.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md): 20A, 20B and **20C cutover built**; your play pending.

**Done (9 Nov):** 20C. The runtime runs on the 20A `Build`; the old slot/verb-picker code is gone.
- `sim/life.ts`: `build`, `offers`, `laid` snapshot; tears absorb damage; starvation sheds the newest row.
  `threat.ts` (strikes by side), `hunt.ts`, `feeding.ts`, `door.ts`, `sea.ts`: builds on species and residents.
- Saves v4 (`sim/sea-save.ts`): older saves start a fresh sea silently; `sea-migration.ts` deleted. The one-part
  trait `{part, patch, line, life}` replaces forms (`sea-life.ts`: `carriable`, `nextTrait`); Clutch says "keep one part".
- Codes are CLADE2- (`share.ts designOf`: starter parts of the laid build only).
- Launcher: Meta's verb picker replaced by `ui/Equip.svelte` with a Start button. In a Life: a **Body** button and the
  moult offers in `ui/LifeBody.svelte` (preview on the creature, then commit; or grow without a part). Keys 1–4.
- Drawing: one `view/body.ts` painter for you, rivals and prey; `worm.ts`, `arthropod.ts`, `swimmer.ts` deleted.
- Tests reworked (`tests/build.ts` helpers); smoke covers launcher, moult view, carry nothing, CLADE2- import.
- Draw cost (i7-1165G7, headless Chrome + SwiftShader, 390×844, packaged build, 180 rAF frames, CDP TaskDuration),
  20B → 20C: empty worm board 1.7 → 1.8 ms/frame; swimmer + 5 resident prey 3.9 → 5.4; moult open 3.6 (card) → 8.2
  (live preview, second Pixi app). Frames stay at 60 fps mean; p95 33 ms in both builds (software GL).
- `npm run check` passes (~5 s); `build:game` 779 KB; `node scripts/sea-smoke.mjs` passes. **Decided:** nothing new.

**Next:**
1. You play 20C: launcher, a few moults with the preview, a tear, a clutch carry into a neighbour, a CLADE2- code.
2. Then slice 20's close: tick roadmap step 5 or list fixes.

**Open:**
- AI readings of the 20A contract, for your OK (`git show 7f2f356:docs/status.md`).
- Trilobite range is 2 now (one mud tile; two with Dash); the swimmer starts with flaps (speed 3). Both per 20A.
- Flaky `garden.test.ts` timing; `npm run look` needs Playwright locally. P47, P46. Slice 19 human checks.
