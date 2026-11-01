# Clade

An idle / RPG evolution game. Species grow on a young volcanic island; you take a lineage on runs to young islands,
bring the adapted line home, and it has to win a habitat slot that the sim decides. Web: Svelte 5, TypeScript, Vite.
**Prototype, heading for the first playable (M1 in `ROADMAP.md`).**

## Where things are
- `ROADMAP.md`: milestones and the current steps. **The current milestone is the only thing we build for.**
- `docs/status.md`: the last handoff. `docs/README.md`: the docs index (open only what the task needs).
- `docs/vision.md`: what the user has decided, as it stands now. `docs/decisions.md`: the dated log of their calls.
- `docs/proposals.md`: open AI proposals (three at most). `docs/ideas.md`: the parking lot.
- `docs/slices/`: one spec per slice (`_template.md`); `docs/playtests/`: the user's notes after playing.
- Code: `src/sim` (rules, no DOM; never imports view or ui), `src/data` (numbers and content), `src/view` (canvas),
  `src/ui` (Svelte). `tests/`. `toys/` holds throwaway prototypes.
- `npm run dev` · `npm run check` (types and tests, prints only failures) · `npm run sim` (headless, 5 seeds;
  `SEEDS=1 MIN=30` for a quick look).

## Rules
1. **The user owns the design.** `vision.md` and `ROADMAP.md` change only on the user's explicit call, and each call
   is logged with its date in `decisions.md`. AI ideas are proposals or ideas, never the plan.
2. **Scope gate.** Spec and build only what the current milestone needs. Any other idea (yours or the user's) gets
   one line in `docs/ideas.md`, and then the work goes on.
3. **Label design statements:** *decided (date)*, *proposal* or *idea*.
4. **Proposals:** a few options with an AI lean, at most three questions, about 15 lines, naming the milestone they
   serve. At most three open at once. Ask for big calls before writing plans (options first, then converge).
5. **One slice = one question.** Write a spec from the template before code. One or two sessions each. Play it
   before calling it done.
6. **Sim freeze** (see the roadmap): while it's on, the sim gets bug fixes and tuning only.
7. **Code:** files under ~400 lines; data separate from logic. Balance by feel, a simple curve model and the dev
   panel; no balance bot.
8. **Off limits:** `_old/` (an AI-made old prototype) and `_archive/` (retired docs). Don't read or reuse them
   unless the user asks.
9. **Be critical and lean.** Keep replies, docs and test or sim output short.

## Session flow
`/kickoff <topic>` to start · `/spec <slice>` to write a spec · `/handoff` before `/clear`.
How we work: `docs/workflow.md`. Web research goes to the `researcher` agent.
