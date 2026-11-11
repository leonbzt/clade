# Slice 20D: Slots

**Milestone:** M2, step 5 ([ROADMAP](../../ROADMAP.md)); the last part of [slice 20](20-join-the-bodies.md).
**Question:** Can I read a whole build at a glance from six icon slots, and see what a choice replaces, in the launcher and the moult view?
**Status:** played 9 Nov, done. Leans taken (*decided 9 Nov*): slots around the creature, one row on a phone; no leader lines; 6×6 icons.
**Builds on:** *decided 9 Nov* ("20d is fine"): compact, clear slots like the lifev2 toy or OSRS, an icon on each part
in its slot, in the launcher and the moult view ([decisions](../decisions.md#9-nov-20c-play), [playtest 20](../playtests/20-join-the-bodies.md)).
Reference: `toys/life2-view.ts` (`icon`, `drawBody`: 6×6 pixel icons in 8×8 slot boxes), `toys/life2-ui.ts` and
`toys/life2.css` (`.card`: icon left, name, one line of effect, one of upkeep).

## Cause
Today the launcher labels places with text tags and leader lines; the moult view lists six text slots under the
creature. Both read as text to parse. No rule changes: this is a UI slice only.

## In
1. **27 part icons.** Port the toy's 19 pixel icons and their inks; draw the 8 missing ones (rake, arms, spikes,
   lenses, flap, fan, tentacles, bulb) in the same 6×6 style. Data in `data/part-icons.ts`, one small `ui/PartIcon.svelte`
   (pixelated, any size). A two-part row (e.g. leg + rake) shows its added part, the base as a small corner icon.
2. **One slot ring, shared.** A `ui/Slots.svelte` that replaces the launcher's place tags and the moult view's text list:
   six square slots (about 44 px) at fixed spots around the large creature, roughly where each place sits (Front ahead,
   Eyes and Back above, Limbs and Sides below, Tail behind), place name as a tiny caption. States drawn, not written:
   held (icon), empty (dim box), locked (lock mark, family on tap), unsupported (greyed), carried (green corner),
   selected (gold), legal for the hovered part (green). The stage's existing highlight on the creature stays.
3. **Launcher** (`ui/Equip.svelte`): tap a slot to pick it; the choices become toy-style cards: icon, name, one
   trade line (gains/loses, upkeep change). The effect text shows for the selected card only. Presets, carried part,
   sum and Start unchanged.
4. **Moult view** (`ui/LifeBody.svelte`): the same ring; the slot an offer changes shows old icon → new icon in gold;
   the offer cards get icons. Inspection mode shows the ring only.
5. **Phone:** slots stay tappable (44 px); tapping a slot shows its part's name, effect and upkeep in the side panel,
   so nothing is hover-only. Stacked layout as today.

## Out
- Icons on the HUD, clutch, results, map; verb and stat icons: step 9 (`ideas.md`, "more icons and symbols", 9 Nov).
- Final icon and creature art, the thick outline: step 9 (`ideas.md`, 9 Nov).
- Drag and drop, inventory, mid-Life swaps: out per slice 20. Per-side slots like the toy: no, one choice per place (20A).
- Any rule, cost or part change; cutting unused parts: step 7 (*decided 9 Nov*).

## Done when
- [x] Launcher and moult view show six icon slots; every part has a distinct icon; each state reads without text.
- [x] A moult shows what gets replaced on the slot itself; phone layout tappable, nothing hover-only.
- [x] `npm run check` passes; a test that every `PartId` has an icon; build and `scripts/sea-smoke.mjs` pass.
- [x] Your notes in `docs/playtests/20-join-the-bodies.md` (20D section); then tick roadmap step 5.

## Size check
- New systems: none (one icon table, one shared component). No sim change; budgets untouched.
- One session. `Equip.svelte` shrinks (tags, leaders and their CSS move into `Slots.svelte`).

## Open questions
1. Slots around the creature (OSRS doll, lifev2) or a compact 3×2 icon grid beside it? *AI lean:* around the
   creature on desktop; on phone the same six in one row under it.
2. Keep the thin leader lines from slot to body spot? *AI lean:* drop them; the slot's spot and the gold highlight
   on the creature are enough.
3. Icons at the toy's 6×6, or redraw all 27 at 8×8 for clearer shapes? *AI lean:* 6×6 now (19 exist), 8×8 in step 9.
