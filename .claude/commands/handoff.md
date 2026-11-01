---
description: Write the session's state to docs/status.md so the next session can start fresh after /clear
---

Wrap up this session so it can be cleared without losing anything.

1. **Log the user's calls.** Append to `docs/decisions.md`, dated, only what the user **explicitly** decided this
   session, in their words where possible. Update the matching lines in `docs/vision.md` so it stays current (no
   history there). Never record an AI proposal as a decision.
2. **Park and prune.** New AI ideas, and ideas the user floated without deciding, get one line each in
   `docs/ideas.md`. Remove decided or stale proposals from `docs/proposals.md` (three open at most).
3. **Roadmap.** Tick finished steps in `ROADMAP.md`. Change its plan only if the user asked to.
4. **Drift check.** Was everything done this session on the current milestone? If not, say what wasn't, in one line.
5. **Checks.** If code changed, run `npm run check` (and `npm run sim` if the sim changed); note the result.
   Commit only if the user asked.
6. **Rewrite `docs/status.md`** in at most 30 lines:
   - **Milestone:** the current one and its step
   - **Done:** this session's results, with file paths
   - **Decided:** only what the user explicitly decided
   - **Next:** 1–3 concrete steps
   - **Open:** open questions
7. Tell the user: "Ready for /clear, then /kickoff <topic>." List the files you changed.
