# Step XX: <name>

**Roadmap step:** N (from `ROADMAP.md`)
**Question:** one sentence. What will playing this tell us?
**Builds on:** `design/direction.md` sections and your calls, with dates. A builder reads only what is named here.

## In
- The smallest version that answers the question.

## Out
- Each with where it's parked (`ideas.md`, a later step).

## Contract (the architect writes this before any build)
- The types and data shapes that may not change without the user's call.
- The tests that carry this step's rules, by file and name. They exist and fail (or are skipped) before part 1.

## Build brief (one part per builder session, in order)
### Part A: <name>
- **Touch:** the files this part may change or create.
- **Don't touch:** files and behaviour that must stay as they are.
- **Behaviour:** what it does, as rules a test can check. Numbers come from the data file named here.
- **Done:** the tests that now pass; `npm run check` under 10 s; one commit named "XX part A: ...".
- **Stop and ask if:** the cases where the builder must not decide (a new record, stock, stat, dial or screen; a
  contract test that seems wrong; anything this spec does not settle). Write the question in `status.md` under
  "For the architect" and end the session there.

## Done when
- [ ] In play: what you can see and do.
- [ ] `npm run check` passes.
- [ ] Your playtest notes are in `docs/playtests/XX-name.md`.

## Size check
- New systems (one at most):
- Budgets touched (4 stocks per habitat, 6 stats, 3 dials per line)?
- Fits its sessions? If not, split a part.

## Open questions (three at most; none may block part A)
