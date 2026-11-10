---
description: Write a slice spec for the current milestone, from the template, after a scope check
---

Write a slice spec. Slice and topic from the user: $ARGUMENTS

1. Read `ROADMAP.md` (the "Now" section and the budgets), `docs/slices/_template.md`, `docs/tastes.md`, and from
   `docs/design/whole-game-build.md` §0, §10, the step's row in §8 and only the sections that step needs. Open
   `whole-game.md` only for a question the brief does not settle, and other docs only if the step names them.
   `docs/spec.md` is the archived plant game: don't read it. Never read `_old/`, `_archive/` or `_v1/` (except the carry-over files CLAUDE.md names).
2. **Scope check.** Which milestone step does this serve? If none, stop and say so. If the slice needs a call the
   user hasn't made, ask for it first (options with an AI lean, at most three questions) and don't write the spec yet.
3. Write `docs/slices/NN-name.md` from the template, one page at most:
   - the smallest version that answers the slice's question
   - everything left out, each with where it's parked (`docs/ideas.md`, a later slice or milestone)
   - at most one new system, and whether it stays within the budgets (a new stock, stat or gene needs the user's
     OK)
4. Add the spec's link to its step in `ROADMAP.md`. Don't write code.
5. Reply in at most 8 lines: the question, what's in, what's out, and the open questions.
