# Clade

An idle / incremental evolution game. Web: TypeScript, PixiJS (the board), Svelte 5 (screens), Vite. You live one creature's Life at a time on a real habitat board: walk, eat, grow up,
lay eggs. The eggs join a living garden of habitats in the shallow sea around a volcanic island, where your species climbs a tier list per niche. What the
garden becomes is the next board you walk on.

**Start here: `docs/status.md` and its active slice spec. Read only the relevant sections of `docs/design/full-version.md` (the release vision; it wins over `docs/planning/plan.md` and `big-picture.md`) and `ROADMAP.md` when needed.**
The game is in `game/` (PixiJS won the stack test, 5 Nov); a long build session follows `docs/planning/m1-run.md`. The plant game in
`docs/spec.md`, `src/` and `tests/` is the archive; its island, habitat and garden code may be ported.

**The guardrails against tangling (big-picture §12) are defaults, not laws (the user's words, 5 Nov: don't take them too seriously or stop thinking outside them).**
They were written for one toy. If one blocks a better idea, say so and propose changing it; the tests that check them can change too.

## Where things are
- `ROADMAP.md`: milestones, the current steps, the budgets. **The current milestone is the only thing we build for.**
- `docs/status.md`: the last handoff. `docs/README.md`: the docs index (open only what the task needs).
- `docs/design/big-picture.md`: the current plan, decided and proposed items labelled. `docs/spec.md`: the plant version, out of date; the user is drafting a new one.
- `docs/tastes.md`: the user's tastes, wishes and lessons. `docs/decisions.md`: the dated log of their calls.
- `docs/proposals.md`: open AI proposals (three at most). `docs/ideas.md`: the parking lot.
- `docs/slices/`: one spec per slice (`_template.md`); `docs/playtests/`: the user's notes after playing.
- Code: `game/src/sim` (rules, no DOM; never imports view or ui), `game/src/data` (numbers and content), `game/src/view`
  (Pixi), `game/src/ui` (DOM and Svelte), `game/tests/`. `toys/` and `spikes/` hold throwaway prototypes.
- `npm run dev` (then `/game/`) · `npm run check` (the game's types and tests, prints only failures) · `npm run look`
  (headless browser: screenshots and real taps, see `scripts/look.mjs`) · `npm run build:game` (one HTML file for itch).

## Rules
1. **The user owns the design.** `spec.md`, `tastes.md` and `ROADMAP.md` change only on the user's explicit call,
   and each call is logged with its date in `decisions.md`. AI ideas are proposals or ideas, never the plan.
2. **Scope gate.** Spec and build only what the current milestone needs. Any other idea (yours or the user's) gets
   one line in `docs/ideas.md`, and then the work goes on.
3. **Label design statements:** *decided (date)*, *proposal* or *idea*.
4. **Proposals:** a few options with an AI lean, at most three questions, about 15 lines, naming the milestone they
   serve. At most three open at once. Ask for big calls before writing plans (options first, then converge).
5. **One slice = one question.** Write a spec from the template before code. One or two sessions each. Play it
   before calling it done.
6. **Budgets** (in the roadmap): 8 h catch-up about 5 s (up to 10), `npm run check` < 10 s; at most 4
   stocks, 6 stats and 10 genes per kingdom. Adding one means removing one, or the user's call. No long headless sim
   runs: model tests run hours of garden in under a second.
7. **Code:** files under ~400 lines; data separate from logic. Balance by feel, a simple curve model and the dev
   panel; no balance bot.
8. **Off limits:** `_old/` (an AI-made old prototype), `_archive/` (retired docs) and `_v1/` (v1, 25 Oct – 2 Nov).
   Don't read or reuse them unless the user asks. **Exception:** when a spec carries them over, these v1 files may be
   read: `_v1/src/sim/island.ts` and `_v1/src/data/islands.ts` (the generator), `_v1/src/sim/habitats.ts` (the
   habitat finder), `_v1/src/view/pixels.ts`, `terrain.ts` and `plants.ts` (the pixel painting).
9. **Be critical and lean.** Keep replies, docs and test output short.

## Session flow
`/kickoff <topic>` to start · `/spec <slice>` to write a spec · `/handoff` before `/clear`.
How we work: `docs/workflow.md`; shared context and Git rules: `AGENTS.md`. Save a handoff and remind the user to start a fresh session at task boundaries. One agent by default; delegation requires an explicit request and an independent task.
