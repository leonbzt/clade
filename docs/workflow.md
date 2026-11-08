# How we work

## The idea funnel

Every idea takes the same path, and each step has one home:

```
idea ──► ideas.md (one line) ──► proposals.md (when a milestone needs it: options, AI lean, ≤3 questions)
     ──► your call ──► decisions.md (dated) + full-version.md ──► a slice spec ──► build ──► playtests/
```

- **Ideas don't skip steps.** A new idea mid-session gets one line in `ideas.md`, and the work goes on.
- **A proposal must name the milestone it serves.** If the current milestone doesn't need it, it stays an idea.
- **At most three open proposals.** When you decide, the call is logged and the proposal is deleted; when one goes
  stale, it moves back to `ideas.md` as one line.
- **design/full-version.md is the release vision.** `spec.md` describes the archived plant game. `tastes.md` keeps
  your tastes and lessons; `decisions.md` keeps the history; the active slice defines the current task.

## Milestones and the scope gate

- `ROADMAP.md` lists milestones. **Only the current one gets specs and code.**
- Before any spec or code, ask: *does the current milestone need this?* If not, park it.
- **Budgets** (in the roadmap): speed, check time, and at most 4 stocks, 6 stats and 10 genes per kingdom. A new
  stock, stat or gene replaces one, or needs your explicit OK.
- A milestone ends when its "done when" holds in play, not when the code is in. Then we plan the next one from the
  roadmap and `ideas.md`, with options first.

## Sessions: one topic each

| Type | What it's for | Starts with | Ends with |
| --- | --- | --- | --- |
| **Design** | Decide things and write one spec | `status.md`, the active scope and relevant decisions | Saved spec and handoff |
| **Build** | Implement one approved slice or named part | `status.md`, the slice and relevant source files | Verified commit and handoff |
| **Research** | Answer one unresolved question | A bounded question from the active task | Findings, sources and implications |

- **Fresh session per task (7 Nov).** Finish the spec, bug or named slice part before starting a new topic.
  Remind the user at that boundary; do not carry a long conversation into the next feature.
- Before handing over, update `status.md` with the branch, a committed checkpoint, completed work, checks and
  limitations, unresolved decisions and one exact next action. Record decisions in `decisions.md`, not only chat.
  Commit the handoff with its work; its checkpoint can name a stable earlier commit plus the new commit's subject
  (avoid a self-referential hash). Supply the resulting hash and a short next-session prompt in the reply.
- In Claude sessions, run the `/handoff` steps unasked when a large task is done (8 Nov), then the user can `/clear`.
  If context runs short mid-task, preserve progress and outstanding work before compacting or changing sessions.
- **Investigation before implementation.** Identify the relevant files, cause, smallest change and checks first.
  Get approval before implementing unless the user already authorized that change; do not re-ask settled design calls.

## Git checkpoints

- Start a task branch from the current work, not an unrelated `main`. Inspect and preserve uncommitted work first.
- Keep commits focused. Inspect staged changes and run checks appropriate to the files changed. Do not use resets,
  force pushes or history rewriting to tidy up user work.
- A local commit is a recovery point, not a remote backup. Report whether the working branch was pushed;
  pushing `main` does not back up a different branch. Do not publish without authorization.

## The slice

- **One slice = one question.** Spec first, from [slices/_template.md](slices/_template.md): the milestone step, the
  question, what's in and out, "done when", at most one new system.
- One or two sessions each; if it's bigger, split it into parts.
- **Play it before calling it done.** Your notes go to `playtests/NN-name.md`.
- **Toys** (`toys/`) and `spikes/` test ideas. Port the selected implementation into `game/` when its slice calls
  for it; production code should not depend on prototype entry points. Preserve references until the port is verified.

## Saving tokens

1. Keep AGENTS.md and CLAUDE.md short: rules and pointers, not duplicated design documents.
2. Start with `status.md` and the active slice. Inspect only relevant scripts and dependencies; use the index when needed.
3. `_old/` and `_archive/` reads are blocked in `.claude/settings.json`; `_v1/` is off limits by CLAUDE.md, except
   the carry-over files it names. No accidental reads, no drift.
4. Small source files, data separate from logic, so reads stay small.
5. Prefer text for state checks: the dev panel and `window.__game`. Use screenshots for visual questions.
6. Use deterministic scripts for tests, type checks and build validation. Keep output short; repeat only for new
   changes, failures or unresolved concerns. The target for `npm run check` is under 10 s; no long headless sim runs.
7. Record calls once in `decisions.md` and link them from the active spec; do not re-investigate answered questions.
8. Ask only decisions that block the next useful step; label proposals and unknowns explicitly.
9. A docs-only change needs link, consistency and diff checks, not another gameplay test run.

## Delegation

**One agent by default (7 Nov).** Spawn subagents only when explicitly requested and the work is genuinely
independent. Give each a bounded file scope and avoid overlapping edits. Searches, routine checks and small tasks
do not justify delegation; parallel agents can multiply tokens and conflicting changes.

| Agent | Defined in | What it does |
| --- | --- | --- |
| `researcher` | `.claude/agents/researcher.md` | Web research; writes a sourced summary to `docs/research/`; replies in under 10 lines |
| `Explore` | built in | Read-only search across the codebase |

## Working preferences (copied from the local AI memory, so cloud sessions have them)
- The user is a biologist and solo hobby developer who owns the design; AI critiques, asks and labels its ideas as hypotheses. See the brief in `planning/README.md`.
- Guardrails and process here are defaults. Say so when one gets in the way of a better idea (5 Nov).
- Remind the user when a saved, verified task boundary makes a fresh session useful; do not append a reminder to every reply.
- Big calls: 2–4 options with a lean, at most three questions; converge after the user reacts, then plan.
- Big reviews: measured numbers, blunt critique, one plan with a lean.
- Specs give headline timings only; the user tunes pacing by feel over several passes.
- Keep test, sim and screenshot output small; usage is light.
- The user knows boids, CA, L-systems and Lenia; they want critical, realistic takes.
- A design analysis the user values goes in full to `docs/design/`; their calls go to the logs.
- Design facts live in the repo docs (spec, tastes, decisions, ROADMAP), never only in memory.
