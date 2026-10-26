# Clade

An idle / RPG evolution game: raise species, release them, and grow an island ecosystem like a garden.
**Prototype stage (fresh start 25 Oct 2026).** Slice 01 is built in `src/`. Throwaway toys live in `toys/`. Git is set up.

## Rules
- The user owns the design. Only the user moves things into `docs/brief.md` (Pillars or Current bets). AI ideas go in `docs/systems.md` as proposals.
- `_old/` is an AI-made old prototype, and `_archive/` holds retired docs. Don't read them, reuse them, or propose
  their ideas unless the user asks.
- We're looking for the best base. Nothing built so far is sacred; rework freely when the user agrees.
- Build only what the current slice spec says (`docs/slices/`). New ideas go on a list, not into the code.
- Balance by feel plus a simple curve model and a dev panel. No balance bot.
- Keep source files under ~400 lines, with data separate from logic.

## Start here
`docs/status.md` (where we are) → `docs/README.md` (index; open only what you need).

## Session flow
`/kickoff` to start, `/handoff` before `/clear`. See `docs/workflow.md`.
Delegate web research to the `researcher` agent.
