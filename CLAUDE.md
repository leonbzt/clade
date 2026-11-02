# Clade

An idle / incremental evolution game. You grow a plant line in short side-view runs, release it into an idle island
garden that the sim runs per habitat, and a niche × tier list ranks your builds. Web: Svelte 5, TypeScript, Vite.
**v2, a rebuild since 2 Nov: M0 (the toy, then the spec) in `ROADMAP.md`.**

## Where things are
- `ROADMAP.md`: milestones, the current steps, the budgets. **The current milestone is the only thing we build for.**
- `docs/status.md`: the last handoff. `docs/README.md`: the docs index (open only what the task needs).
- `docs/spec.md` (after the toy): the game in one page. Until it exists, `docs/design/rebuild.md` is the plan.
- `docs/tastes.md`: the user's tastes, wishes and lessons. `docs/decisions.md`: the dated log of their calls.
- `docs/proposals.md`: open AI proposals (three at most). `docs/ideas.md`: the parking lot.
- `docs/slices/`: one spec per slice (`_template.md`); `docs/playtests/`: the user's notes after playing.
- Code (from M1): `src/sim` (rules, no DOM; never imports view or ui), `src/data` (numbers and content), `src/view`
  (canvas), `src/ui` (Svelte). `tests/`. `toys/` holds throwaway prototypes (`npm run dev`, then `/toys/`).
- `npm run dev` · `npm run check` (types and tests, prints only failures).

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
6. **Budgets** (in the roadmap): garden step < 0.1 ms, 8 h offline < 0.5 s, `npm run check` < 10 s; at most 4
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
How we work: `docs/workflow.md`. Web research goes to the `researcher` agent.
