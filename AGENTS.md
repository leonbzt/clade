
# Game Development Instructions

## Objective
Finish a stable, polished, playable web game.
Prioritize completing the existing core loop over
adding features or rewriting architecture.

## Working rules
- Inspect existing implementations before coding.
- Preserve working gameplay. Saves are no priority before release
  (7 Nov); the sea save resets at the body cutover (8 Nov).
- Prefer small, localized changes.
- Do not introduce new frameworks or dependencies
  without approval.
- Do not refactor unrelated code.
- Do not create abstractions for hypothetical needs.
- Never silently remove gameplay functionality.
- Never overwrite user data or save files on disk; a planned save
  reset is a game change, not an edit of someone's data.

## Before implementation
1. Identify relevant files and dependencies.
2. Explain the root problem or required behavior.
3. Propose the smallest viable change.
4. Identify how the result will be tested.

## After implementation
1. Run relevant automated checks.
2. Inspect the diff for unrelated changes.
3. Report what changed and what was verified.
4. Report unresolved issues honestly.

## Game-specific priorities
- Gameplay correctness over code elegance.
- Performance on target devices.
- Reliable progression; persistence matters from release on.
- No unnecessary dependencies.
- Preserve existing visual style.

## Context
Start with docs/status.md and the active slice spec.
Read only relevant scripts, dependencies and docs/ sections.
Do not load the entire documentation tree or repeat a completed audit.
docs/design/direction.md (15 Nov) is the one design page that wins; its
§9 names what still holds in older docs. A build session reads its
step spec and what the spec names. Workflow details are in
docs/workflow.md.

## Sessions and traceability
- Use a fresh session for a new task. Save decisions and a short
  handoff first; remind the user at a completed task boundary.
- Keep investigation separate from implementation: state the cause,
  smallest change and checks, then obtain approval unless the user
  has already authorized that implementation.
- Work on a task branch and make focused, reviewable commits.
  Preserve existing user work; do not reset or rewrite its history.
- Use deterministic scripts for checks; summarize their results.
  Repeat checks only after changes, failures or unresolved concerns.
- Keep permanent instructions and docs short; link to detailed documents.
- One slice answers one question in one or two sessions.
- Use one agent by default. Subagents require an explicit request
  and a genuinely independent task.

## Architect and builders (9 Nov, widened 15 Nov)
The strongest model is the architect; weaker models and Codex build
(docs/workflow.md, Roles).
- "kickoff", "architect", "build", "spec", "handoff": follow
  `.claude/commands/<name>.md` (`$ARGUMENTS` is the rest of the
  user's message).
- A build session implements one part of the "Build brief" in the
  active step spec, in its order, and nothing else. It keeps to the
  part's "Touch" and "Don't touch" lists and never edits a contract
  test to make it pass.
- A design question is never decided in a build session: write it
  under "For the architect" in docs/status.md and stop there.
- End with `npm run check` passing, one commit per brief part,
  and a handoff in docs/status.md.

## Scope
Do not expand the release scope without approval.

