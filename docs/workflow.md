# How we work

## The idea funnel

Every idea takes the same path, and each step has one home:

```
idea ──► ideas.md (one line) ──► proposals.md (when a milestone needs it: options, AI lean, ≤3 questions)
     ──► your call ──► decisions.md (dated) + vision.md ──► a slice spec ──► build ──► playtests/
```

- **Ideas don't skip steps.** A new idea mid-session gets one line in `ideas.md`, and the work goes on.
- **A proposal must name the milestone it serves.** If the current milestone doesn't need it, it stays an idea.
- **At most three open proposals.** When you decide, the call is logged and the proposal is deleted; when one goes
  stale, it moves back to `ideas.md` as one line.
- **vision.md holds only your calls,** current and without history. `decisions.md` keeps the history.

## Milestones and the scope gate

- `ROADMAP.md` lists milestones. **Only the current one gets specs and code.**
- Before any spec or code, ask: *does the current milestone need this?* If not, park it.
- **Sim freeze:** while the player-facing slices of a milestone are being built, the sim gets bug fixes and tuning
  only. A structural change needs your explicit OK.
- A milestone ends when its "done when" holds in play, not when the code is in. Then we plan the next one from the
  roadmap and `ideas.md`, with options first.

## Sessions: one topic each

| Type | What it's for | Model / effort | Starts with | Ends with |
| --- | --- | --- | --- | --- |
| **Design** | Decide things, write specs | Strongest model, high effort | `/kickoff` + the topic | `/spec` or `/handoff` |
| **Build** | Implement one written slice spec | Sonnet is usually enough (`/model`) | `/kickoff build slice NN` | `/handoff` |
| **Research** | Facts, reference games, libraries | The `researcher` agent | A question from a design session | A file in `research/` |

- Check `/context` now and then. At about half full, after a commit, a spec or a slice part: `/handoff`, `/clear`,
  `/kickoff`. Mid-task with no time to hand off: `/compact focus on <task>`.
- `/handoff` rewrites `status.md`, logs your calls, parks new ideas and runs a drift check (was this session's work
  on the milestone?).

## The slice

- **One slice = one question.** Spec first, from [slices/_template.md](slices/_template.md): the milestone step, the
  question, what's in and out, "done when", at most one new system.
- One or two sessions each; if it's bigger, split it into parts.
- **Play it before calling it done.** Your notes go to `playtests/NN-name.md`.
- **Toys** (`toys/`) are throwaway pages for testing feel: plain TS and canvas, no shared code with `src/`. Delete
  them or fold the winner into the game; never build on them.

## Saving tokens

1. CLAUDE.md is short (rules and pointers); it's loaded on every turn.
2. Read the index, then only the docs the task needs. Reference files by path; never paste them.
3. `_old/` and `_archive/` reads are blocked in `.claude/settings.json`: no accidental reads, no drift.
4. Small source files, data separate from logic, so reads stay small.
5. Text over screenshots: the dev panel and `window.dev.dump()`. Screenshots only for visual questions, scaled down.
6. Quiet scripts: `npm run check` prints only failures; `SEEDS=1 MIN=30 npm run sim` for a quick look.
7. Decisions are written once (`decisions.md`, `vision.md`) and not re-discussed.
8. Batch questions at the end of a turn.
9. The cheaper model for mechanical work: data entry, renames, boilerplate.

## Delegation

**Delegate:** broad web research, searches across many files, self-contained mechanical tasks with a clear spec.
**Don't delegate:** anything that needs the current conversation, or small tasks. An agent starts cold and re-reads
everything, which can cost more in total (a research agent was ~70–80k tokens).

| Agent | Defined in | What it does |
| --- | --- | --- |
| `researcher` | `.claude/agents/researcher.md` | Web research; writes a sourced summary to `docs/research/`; replies in under 10 lines |
| `Explore` | built in | Read-only search across the codebase |
