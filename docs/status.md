# Status

Updated 2026-10-26 by `/handoff`.

## Done
- Slice 01 is built and playable: Vite + Svelte 5 + TS. `src/core/` holds the sim, `src/data/` the numbers and
  content, `src/ui/` the screens. The dev panel opens with the ` key; `window.dev.dump()` works in the console.
- `npm run check` passes: typecheck plus 13 core tests in `tests/core.test.ts`, run 26 Oct.
- The AI's choices beyond the spec are listed in `docs/slices/01-found-to-release.md` ("Built beyond the spec"), and
  its done-when list is ticked. Still open there: a ×1 timing, and animation constants in `src/ui/`.
- You played it and wrote `docs/playtests/01-found-to-release.md`. The AI's answers are in `docs/systems.md` S26.

## Decided
- Nothing new this session. Your playtest notes have candidates (see Open).

## Next
1. Read S26 and pick a direction for the colony: keep the split, add trade-off picks, or add more interaction.
2. Design slice 02 (acts 5–7), including biomass's first use.
3. An art spike for the look you described: OSRS / Idle Obelisk-style pixel menus with Stardew-style 2D or low-poly
   models (Q7).

## Open
- Candidates from your notes for the brief: fit as a tier list (S–D); traits with downsides; the art direction above.
  Move them yourself if you agree.
- You liked the old prototype's growing minigame and its UI. Should the AI look at `_old/` for that? It's off limits
  until you say so.
- Two slice 01 assumptions are built but still unconfirmed: Svelte for menus, and no saving.
- From before: a second fact-check of the [M] lines in moss-facts.md. Move S0, S2, S3, S7, S8, S9, S11, S12, S16 and
  S17 into the brief? Also Q9 layout and Q10 which relationships go in the core.
