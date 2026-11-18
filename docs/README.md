# Docs index

Open only what the task needs. Top to bottom is the order of authority: when two docs disagree, the higher one
wins (and the code is the truth for what's built).

**Current task:** M2 step 14, **B0 the build toy** ([spec](slices/b0-the-build-toy.md)). The road from here is in
`ROADMAP.md` (re-cut 16 Nov). No design pass before the closed test: a new idea gets one line in `ideas.md`.

**Who reads what** (*decided 16 Nov*):
- **A build session:** [status.md](status.md), its part of the step's spec, and the files that part names.
- **An architect or spec session:** also [design/direction.md](design/direction.md) and the "Now" section of the
  roadmap. `decisions.md` and `ideas.md` by search only, never whole.
- Everything else here is opened when a spec cites it.

| File | What it holds | Who changes it |
| --- | --- | --- |
| [design/direction.md](design/direction.md) | **The direction: the one design page that wins.** A present-day island of real species; clades with dials; the tree and the Life; the laws; the plan | You (the architect drafts) |
| [design/whole-game-build.md](design/whole-game-build.md) | The build brief (10 Nov). In force only where direction §9 says: §3 ground, §4 the Life's economy, §5 the look, §6 the laws, §9 itch, §10 drift | You (AI drafts) |
| [design/maths-pass.md](design/maths-pass.md) | The maths pass (12 Nov). In force only where direction §9 says: Q0 the board and the next goal, Q2 zoom, Q3 and Q4 the body grammar | You (AI drafts) |
| [../ROADMAP.md](../ROADMAP.md) | Milestones, the current steps, the budgets | You (AI drafts) |
| [status.md](status.md) | The last handoff: done, decided, next, open | AI at `/handoff` |
| [slices/](slices/) | One spec per step, from N0 on ([_template.md](slices/_template.md)) | AI drafts, you approve |
| [playtests/](playtests/) | Your notes after playing each step, from N0 on | You |
| [tastes.md](tastes.md) | Your tastes, wishes and lessons, in your words | You (AI records) |
| [decisions.md](decisions.md) | The dated log of your calls | AI records them |
| [proposals.md](proposals.md) | Open AI proposals (three at most; none open) | AI |
| [ideas.md](ideas.md) | The parking lot | Anyone |
| [workflow.md](workflow.md) | How we work: sessions, roles, the idea funnel, tokens | You |
| [patch-notes.md](patch-notes.md) | What changed, written for players | AI drafts, you edit |
| [spec.md](spec.md) | The archived plant-game spec | Nobody |

**Reference** (open when a spec needs it):
- `research/`: sourced facts from the `researcher` agent (reference games, real evolution, the tree of life,
  progression games, masses, licences). `research/species/`: batches of real species rows for the roster (from W3). `game-psychology.md`: motivation research applied to Clade.

**Archived 16 Nov** in `_archive/2026-11-16/` (off limits unless you ask): every other design doc (the reviews, the
four briefs, the whole-game pass, the full version, the body and world reviews), `planning/`, and the specs and
playtests from before N0.

Outside `docs/`: `toys/` holds throwaway prototypes. `_v1/` is v1 (code, tests and docs, 25 Oct – 2 Nov);
`_archive/` holds retired docs; `_old/` the first AI prototype. All three are off limits unless you ask
(CLAUDE.md names the v1 files a spec may carry over).
