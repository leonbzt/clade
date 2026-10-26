---
description: Write the session's state to docs/status.md so the next session can start fresh after /clear
---

Wrap up this session so it can be cleared without losing anything.

1. Rewrite `docs/status.md` in at most 30 lines, with these sections:
   - **Done**: this session's results, with file paths
   - **Decided**: only what the user explicitly decided
   - **Next**: 1–3 concrete steps
   - **Open**: open questions
2. Add to `docs/brief.md` (Pillars or Current bets) only what the user **explicitly** decided this session, dated.
   Never move AI proposals there yourself.
3. Put new AI ideas into `docs/systems.md` as proposals, or the current slice spec. Keep them short.
4. If code changed: run the checks and note the result in status.md. Commit only if the user asked.
5. Tell the user: "Ready for /clear, then /kickoff <topic>." List the files you changed.
