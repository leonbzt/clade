# Status

11 Nov 2026 · **M2, step 8 N1 done; step 9 N2 (the Life) is next.** Branch `n1-the-core`, local, fixes uncommitted.

**Done (Claude, N1 review):**
- The user's play notes: `docs/playtests/n1-the-core.md`. Review measured on seeds 1–2 over 200 generations.
- Letters rank the build at full food: a ladder from break-even (D), ×1.5 per letter, F can't live there
  (`clade/src/data/sea.ts`, `sim/fitness.ts`, `Fitness.full` in `sim/records.ts`). Growth and spread read today's
  food; a newcomer spreads only where it would grow (`sim/sea.ts`).
- Grams ×10 (yields, reference density, slot floor). Rivals is now tentacle worm (B) against bare worm (C)
  (`data/presets.ts`). The test fixtures were rescaled and the home-letter test rewritten; no new tests.
- Result: holder letters S–D all appear (seed 2: S 2, A 3, B 6, C 5, D 3); about 100 kg per sea; Rivals spreads to
  6–8 habitats and the bare worm loses by about generation 60. Sheet recaptured: `docs/playtests/n1-sheet/`.
- `npm run check` passed in 5.3 s (41 tests).
- Updated: decisions.md, tastes.md, ideas.md (r vs K, sea swings, life history), the N1 spec, `whole-game-build.md` §3 and §6, ROADMAP (N1 ticked).

**Decided (user, 11 Nov; full list in decisions.md):** letters rank the build; grams ×10; gut gland unchanged; sea
dynamics wait for N4; each egg founds a fixed brood of heads; the sea uses adult size; Codex builds N2; no Fable
consult before N4.

**Next:**
1. User: commit the fixes on `n1-the-core` and decide whether to merge it into `main` before N2.
2. `/kickoff N2 spec`: write `docs/slices/n2-the-life.md` with a Codex build brief. Port by bins:
   - *Copy as is:* grid, movement, tunnelling, verbs, hunter, threats, body-hurt, nodes; `data/life` numbers;
     floor, camera, fx, tween and body drawing.
   - *Write fresh:* the clade `Build`, Grow/Enforce/Lay (§4), `boardFor(habitat, world, seed)`, `found()`, Colonise.
   - *Drop:* buds and larva (`plan.ts`), moult picks, `tierOf`, garden, `sea-*`.
   - *The coherence points:* the board samples the sea (density, upkeep, reach); Enforce shows its payback; the
     economy lives in its own module.

**Open:**
- Heads per egg (the founding number) and the Enforce cost curve: set in the N2 spec.
- The user asked whether to put the current `game/` build on itch now for early feedback (Claude's advice in chat;
  no call yet).
