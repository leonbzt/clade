# Status

Updated 9 Nov 2026 (Claude). Branch `slice-20a-model`: 20A `b34e9cc`, 20B `3229e3d`, 20C `39ca951`, 20C fixes after play.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md): 20A–20C built and played (9 Nov, "mainly fine"); close fixes done; **20D next**.

**Done (9 Nov):** your 20C play, [notes](playtests/20-join-the-bodies.md). Fixes from it:
- A hit always costs health, even with a tear (*decided 9 Nov*; `sim/body-hurt.ts`, `threat.ts`; 20A contract updated).
- Upkeep with Deep Burrow: views show the off-mud number and name the mud 0 (`main.ts`, `ui/equip.ts`, `hud.ts`);
  launcher cards show only the change to the total.
- Launcher size picker removed; proboscis grows from the head's tip (`view/body-parts.ts`, checked in a screenshot).
- Moult view (`ui/LifeBody.svelte`): six slots under the creature, the replaced one outlined "old → new".
- `npm run check` passes (garden timing flaked twice in the full run, passes alone); build 780 KB; smoke passes.

**Next:**
1. `/spec` 20D: compact slots like the lifev2 toy / OSRS, an icon on each part, launcher and moult view
   (*decided 9 Nov*). Read `toys/life2-ui.ts`, `toys/life2.css`.
2. Play 20D, then tick roadmap step 5.

**Parked 9 Nov (ideas.md):** art direction without the thick outline (step 9); cut unused parts (step 7, *decided*);
clutch/parts scaling with brood size; icons everywhere; drawing only some parts; reef/adjacent patches (again).

**Open:**
- AI readings of the 20A contract, for your OK (`git show 7f2f356:docs/status.md`).
- Trilobite range is 2 now (one mud tile; two with Dash); the swimmer starts with flaps (speed 3). Both per 20A.
- Flaky `garden.test.ts` timing; `npm run look` needs Playwright locally. P47, P46. Slice 19 human checks.
- `npm run look` fails without Playwright; for screenshots, a scratch CDP script copied from `scripts/sea-smoke.mjs` works.
