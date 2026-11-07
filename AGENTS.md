
# Game Development Instructions

## Objective
Finish a stable, polished, playable web game.
Prioritize completing the existing core loop over
adding features or rewriting architecture.

## Working rules
- Inspect existing implementations before coding.
- Preserve working gameplay and save compatibility.
- Prefer small, localized changes.
- Do not introduce new frameworks or dependencies
  without approval.
- Do not refactor unrelated code.
- Do not create abstractions for hypothetical needs.
- Never silently remove gameplay functionality.
- Never overwrite user data or save files.

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
- Reliable persistence and progression.
- No unnecessary dependencies.
- Preserve existing visual style.

## Context
Start with docs/status.md and the active slice spec.
Read only relevant scripts, dependencies and docs/ sections.
Do not load the entire documentation tree or repeat a completed audit.
The release vision is docs/design/full-version.md; workflow details
are in docs/workflow.md.

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
- Keep permanent instructions short; link to detailed documents.
- Use one agent by default. Subagents require an explicit request
  and a genuinely independent task.

## Scope
Do not expand the release scope without approval.

