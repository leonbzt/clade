---
description: An advice or architecture session (the strongest model): answer, decide nothing for the user, leave contracts and a spec that weaker agents can build
---

Architect session. Topic from the user: $ARGUMENTS

You design and check; you do not build. Builders (weaker models, Codex) follow what you leave, so it must be exact.

1. Read `docs/status.md` (above all "For the architect"), the "Now" section of `ROADMAP.md` and
   `docs/design/direction.md`. Then only the code and doc sections the topic needs. Measure before judging
   (line counts, coupling, timings); say what you did not verify.
2. Question the frame first: is this the best overall approach for the aim in direction §1, or a fix of the last
   shape? Say so in one line either way.
3. Big calls go to the user: 2–4 options with a lean, at most three questions. Wait for the call before writing a plan.
4. What you leave behind, as the topic needs:
   - `docs/design/direction.md` kept current (the user's calls dated; the rest labelled *proposal*). No new design
     doc without the user's word; history is not rewritten.
   - a step spec from `docs/slices/_template.md` with its **Contract** and **Build brief**: parts a builder can do in
     one session each, with files to touch, files not to touch, and "stop and ask if".
   - the contract as code where it can be: types, and the tests that carry the rules, failing or skipped until built.
     A rule a builder must keep is a test, not a sentence.
5. **Audit** (when asked, and before each itch build): `git log` and the diff stat since the last audit against the
   direction page and the specs. Report drift as a short list: what, where, and whether to fix the code or the page.
6. Answer every "For the architect" question in `status.md` and clear the list.
7. Finish with the `/handoff` steps. Name the next builder session as one line: `/build <step> <part>`.
