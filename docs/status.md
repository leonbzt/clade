# Status

Updated 9 Nov 2026 (Claude). Branch `slice-20a-model`; 20A committed as `b34e9cc`, **20B uncommitted**. The long
Codex-era status is at `git show 8b5b202:docs/status.md`.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md): 20A model built, **20B equipment view built (preview)**, 20C cutover next.

**Done (9 Nov, this session):** 20B, runtime untouched (the Life still starts from the verb picker).
- Painter port (no imports from `toys/`): `data/body-look.ts` (shape per body), `view/body.ts` (spine, gaits, skin,
  shield), `view/body-parts.ts` (one painter per place, all 27 parts, lost-limb stumps).
- Head poke fixed: with a head shield the ridge hull starts under it and has no front cap.
- `view/equip-stage.ts` + `ui/equip.ts` + `ui/Equip.svelte`: large creature with six labelled places and leader lines,
  option cards (effect, verb, upkeep, replaces, gains/loses, problems), sizes 1–5, presets, carried part with origin
  and home choice, habitat context, board-size copy walking a circle, phone layout (stacked under 720 px).
- Opened from Meta's loadout: "Equipment (preview of the new body)". Check page: `/toys/equip.html?body=&carry=&preset=&size=`.
- `tests/equip.test.ts`: choices, locks, variant swap, carried state, painter finite at sizes 1–5 on every body.
- `npm run check` ~9 s; `garden.test.ts:65` timing budget still fails ~1 run in 3. `build:game` 793 KB.

**Decided:** nothing new this session.

**Next:**
1. You play the equipment view (desktop + phone): do the builds read apart? Labels, cards, board-size copy.
2. 20C: switch runtime to `Build` (parts, feeding, offers, drawing, saves, reset) in one change; moult-offer preview
   in the view; measure draw cost on a packed board.

**Open:**
- AI readings of the 20A contract, for your OK (see `git show 7f2f356:docs/status.md`).
- Look: worm reads as a smooth tube at large size; swimmer shadow is large.
- Flaky `garden.test.ts` timing budget: loosen or drop it. `npm run look` needs Playwright installed locally.
- P47, P46. Slice 19 checks: unaided next-patch discovery, 3–5 Lives, a real phone; founding-map labels; code terms.
