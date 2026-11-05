# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv` on GitHub (`leonbzt/clade`). The plan: [planning/plan.md](planning/plan.md).

**Milestone:** M1, the first playable sea ([ROADMAP](../ROADMAP.md)). Step 1 (PixiJS) done. **The M1 run built steps 2–8**
([m1-run](planning/m1-run.md)): all built, none played. Next: you play, notes into `docs/playtests/`, then tick the ROADMAP.

## Built, not played (5 Nov) · AI choices to judge
- **09 The Life** ([spec](slices/09-life-for-real.md)): sand shallows (low tide), volcanic rock (vents, surge), the arthropod
  drawn, textured ground, stone-and-brass menus. *Judge:* boards, events, palette and textures, the OSRS-like frame.
- **10 Verbs** ([spec](slices/10-verb-slots.md)): six verbs from parts, pick 1–3 (sweeper, digger, tank). *Judge:* verbs cost
  upkeep via parts; verbs are your starting body; start food 6; mats regrow in 4 turns (the new boards starved without).
- **11 The predator Life** ([spec](slices/11-predator-life.md)): the swimmer; worms burrow, trilobites run, Wiwaxia hunkers;
  lurk ×2, frenzy; compound eyes preview prey (tap to aim, tap again). *Judge:* prey notice you only after you move.
- **13 Garden and island** ([spec](slices/13-garden-island.md)): island map, habitat cards (open niches first, ranks to beat,
  news), the ported garden with a 60% self-limit, the one door, 3-min generations, Skip, 8 h offline. *Judge:* niche →
  body (grazer → arthropod, burrower → worm, hunter → swimmer); one tier scale S 40 · A 28 · B 18 · C 10 · D 4; natives.
- **12 Open your clutch** ([spec](slices/12-open-your-clutch.md)): 2–5 eggs hatch as common/rare/epic cards; keep a form your
  line carries into that niche. *Judge:* odds; a form = one inherited part.
- **14 Your hunter, the trilobite** ([spec](slices/14-your-predator.md)): topping a hunter row makes your swimmers the board's
  hunter (lurk, boldness, form effects); an A as an arthropod opens the trilobite. *Judge:* those rules and the unlock.
- **15 Ship it** ([spec](slices/15-ship-it.md)): versioned saves with a backup, species codes (friends' species visit your
  garden), a Menu, `game/dist/clade.html` (764 KB, 60 fps), [itch page text](itch.md). Discord is yours.

## Open
- Balance is unplayed: a throwaway heuristic player survived every board after the regrow fix, but laid few eggs; an A tier
  may be too far for a fresh start (tiers or egg counts are the knob).
- The feel values are still the stack test's defaults. Pixelify's 2, 3 and 5 read like 8 or S at small sizes.
- `life.ts`, `hunt.ts` and `threat.ts` import each other (works; split further if it bites).
- R2's [K] biology lines still need a check before they show as text.

## Next
```
/kickoff play the M1 run: I played it, my notes are in docs/playtests/10-m1-run.md
```
