# The M1 run: one long session builds as much of M1 as it can

**Your calls (5 Nov):** "pixi is good enough stay with this for itch." "set up everything so i can start a session that
implements as much as possible to hit the free credit limit." Everything below is the AI's reading of that *(proposal;
change anything)*.

## How the run works
1. **Start:** read this file, `docs/status.md`, `docs/planning/plan.md` and the "Now" section of `ROADMAP.md`. Then go
   slice by slice, 09 to 15, in order (13 may move before 12, as plan.md allows).
2. **Each slice:**
   - **Spec first,** `docs/slices/NN-name.md` from the template, half a page. Instead of asking, it lists
     **AI choices to judge**.
   - **Build** in `game/` (`src/sim`, `src/data`, `src/view`, `src/ui`), with tests of the rules in `game/tests/`.
   - **Check yourself:** `npm run check`, then `npm run look` to see it at phone size and play a Life with real taps.
     Fix what the shots show, readability first (the stack test found three such problems only by looking).
   - **Commit and push,** then one line in `status.md`. Don't tick `ROADMAP.md`: a step ticks once you've played it.
     Mark slices "built, not played".
3. **Don't stop to ask.** On an open design call, take the lean from plan.md or the spec, label it *AI choice* and list it
   in the spec and in `status.md`. Never reverse a decided item; if one blocks, note it and pick the smallest option that
   keeps both ways open.
4. **Push early and often:** after every slice and at every green point inside one. Credits can end mid-step; what's
   pushed is safe. Never push a red check.
5. **Keep `status.md` current** after each slice (30 lines at most), so a fresh session can resume with
   `/kickoff continue the M1 run`. After the harness compacts the conversation, re-read this file and `status.md`.
6. **Stuck** on one slice for long: push what's green, write the blocker in `status.md`, and go on to the next slice
   that doesn't depend on it.

## What still holds
- **Scope:** M1 only; other ideas get one line in `docs/ideas.md`. `_old/`, `_archive/`, `_v1/` stay closed (CLAUDE.md's
  exceptions apply).
- **Budgets:** `npm run check` under 10 s (4.4 s now), garden step under 0.1 ms, 8 h offline under 0.5 s, files about
  400 lines, data apart from logic, `sim` never imports `view` or `ui`.
- **Guardrails** (plan.md): one door between Life and garden; the Life runs alone on fixed boards; garden numbers show on
  a board or the map.
- **Changed for this run (your call):** slices are built back to back; you play them afterwards, not between.
- **The look:** the stack test's 2D low-poly (`game/src/view/shade.ts`: one palette, one sun, one outline). New
  creatures and boards follow it. *AI choice:* new screens (clutch, island, garden rows) in Svelte 5, which the repo
  already builds; the board stays Pixi.

## Tools
- `npm run dev`, then `/game/` · `npm run check` · `npm run look -- /game/ '<steps>'` (the steps are in the header of
  `scripts/look.mjs`; screenshots land in `.shots/`) · `npm run build:game` makes `game/dist/clade.html` for itch.
- A phone link: publish the page's inside as an artifact (`node game/inline.mjs <path>`), once at the end of the run,
  not per slice.

## The slices (plan.md; decided items are dated there)
- **09 The Life, for real.** *Does a Life feel well made on a phone?* Three boards from geology (decided): mud flats (done),
  sand shallows, volcanic rock; start from the toy's other maps (`toys/life2-habitats.ts`) with R2's fixes
  (`docs/research/cambrian-world.md`). The worm and the arthropod (decided), drawn in the low-poly look. A plain screen
  to pick the board and the body, until the island exists (slice 13). The phone layout polished.
- **10 Verb slots.** *Do 1–3 picked verbs make grazer builds play differently?* Parts give verbs; you pick 1–3 slots per
  Life; the body plan keeps its move (decided). Grazer styles: sweeper, digger, tank.
- **11 The predator Life.** *Is hunting fun?* The swimmer; prey that flee by one rule each; the ground changes escape;
  armour matters; ambush (stay still a turn, the next move doubles) and frenzy (+1 speed per catch in a row); the prey's
  next step shown as an upgrade (all decided 5 Nov).
- **12 Open your clutch.** *Does the clutch pull you into the next Life?* After a Life, eggs hatch as cards; rare parts;
  you pick the form (decided).
- **13 The garden and the island.** *Do open niches pull you back in?* The island map with three habitats (port the
  generator: `src/sim/island.ts`, `src/data/island.ts`); a habitat card with niche rows × tiers, open and contested
  niches first, news underneath (decided). Keep the toy's garden and stop one winner (decided); *proposal:* a
  self-limit per species (R5), so 8 h offline jumps to its closed-form state. The garden writes the board
  (`toys/garden-board.ts`, the one door). Saves and offline from the pattern in `src/sim/save.ts` and `Away.svelte`.
- **14 Your predator hunts you, and the trilobite.** Your best predator in a habitat becomes its board's hunter once it
  ranks top (decided). Arthropod → trilobite (decided); *proposal:* unlocked by a first A tier as an arthropod.
- **15 Ship it.** Versioned saves, a copy-species code, the itch build (one HTML file; you upload it), a short itch page
  text. Discord is yours.

## Port list (plan.md)
- **Port as reference:** `toys/life2-*` (done for the mud flats), `toys/garden-sim.ts`, `garden-data.ts`, `garden-board.ts`,
  `toys/body-view.ts` (the body doll, redrawn low-poly), `src/sim/island.ts` + `src/data/island.ts`, `src/sim/rng.ts`,
  the save and offline pattern.
- **Ideas only:** `src/sim/habitats.ts`, `succession.ts`, `src/sim/garden.ts`, `TierList.svelte`.
- **Leave behind:** the side-view run, plant genes and forms, the three.js look toy, the plant tests.

## When the run ends
`status.md` says where it stopped and lists the AI choices to judge. You play (the phone link or `/game/`) and your
notes go to `docs/playtests/`, one file per slice or one for the run.
