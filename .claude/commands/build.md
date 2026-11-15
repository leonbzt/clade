---
description: A build session: implement one part of the active step's build brief, exactly, then check, commit and hand off
---

Build session. Step and part from the user: $ARGUMENTS

1. Read `docs/status.md` and the step's spec in `docs/slices/`. Read the doc sections and source files the part
   names, and nothing else. Do not read other design docs, `game/`, `_old/`, `_archive/` or `_v1/` unless the part
   says so.
2. Reply in at most 5 lines: the part, the files you will touch, the tests that will pass. Then build; do not wait
   unless something blocks you.
3. Build that part only, in the spec's order. Keep to **Touch** and **Don't touch**. Numbers go in the data file the
   part names. Port tuned numbers as they are; do not rebalance.
4. **Never decide design.** If the spec does not settle something, a contract test looks wrong, or the part seems to
   need a new record, stock, stat, dial, screen or dependency: stop, write the question under "For the architect" in
   `docs/status.md`, and end the session. Do not change a contract test to make it pass.
5. Run `npm run check` (and one `npm run look -- /clade/` for a screen change). Read your diff for anything outside
   the part and undo it.
6. One commit: "<step> part <X>: <what>". Then the `/handoff` steps: what was built, the check result, what the user
   should play, and the next line (`/build <step> <next part>`, or `/architect` if a question is open).
