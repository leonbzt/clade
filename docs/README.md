# Docs index

Open only what the task needs. Top to bottom is the order of authority: when two docs disagree, the higher one
wins (and the code is the truth for what's built).

**Current task:** [slice 19: Join the sea](slices/19-join-the-sea.md), M2 step 4. Start with [status.md](status.md)
and that spec; open the documents below only as the task needs them.

| File | What it holds | Who changes it | When to read it |
| --- | --- | --- | --- |
| [design/full-version.md](design/full-version.md) | **The full version (6 Nov, updated 7 Nov): the game, rigs, recipes, lineage ladder and staying on the road** | You (AI drafts) | Relevant sections for design or scope questions |
| [design/body-approach.md](design/body-approach.md) | **Bodies, slots, species and what animation costs (6 Nov):** six places, measured render costs, styles | AI, after your slice 18 notes | For the slot model and the style |
| [planning/plan.md](planning/plan.md) | The plan for the real build (5 Nov): your calls, M1's slices, what's ported, cuts | You (AI drafts) | When a call's history matters |
| [design/big-picture.md](design/big-picture.md) | The direction before planning (4 Nov); `plan.md` wins where they differ | You (AI drafts) | Background |
| [planning/m1-run.md](planning/m1-run.md) | **The M1 run: how one long session builds slices 09–15 (5 Nov)** | You (AI drafts) | Build sessions in M1 |
| [planning/README.md](planning/README.md) | **The kit for research and planning the real build in cloud sessions (5 Nov)** | AI, you | When planning |
| [../ROADMAP.md](../ROADMAP.md) | Milestones, the current steps, the budgets | You (AI drafts) | Scope or budget questions |
| [status.md](status.md) | The last handoff: done, decided, next, open | AI at `/handoff` | Every session |
| [spec.md](spec.md) | Archived plant-game spec; current release vision is `design/full-version.md` | You (AI drafts) | Historical context only when needed |
| [tastes.md](tastes.md) | Your tastes, wishes and lessons, in your words | You (AI records) | Design sessions, specs |
| [slices/](slices/) | One spec per slice ([_template.md](slices/_template.md)) | AI drafts, you approve | The current one when building |
| [proposals.md](proposals.md) | Open AI proposals (three at most) | AI | When deciding |
| [decisions.md](decisions.md) | The dated log of your calls (v2) | AI records them | To check why or when |
| [ideas.md](ideas.md) | The parking lot, reviewed against v2 | Anyone | When planning the next milestone |
| [workflow.md](workflow.md) | How we work: sessions, the idea funnel, tokens | You | When the process changes |
| [patch-notes.md](patch-notes.md) | What changed, written for players | AI drafts, you edit | When shipping a build |
| [design/world-and-body-review.md](design/world-and-body-review.md) | **The living sea, the body, the skill tree (5 Nov): design for M2** | You (AI drafts) | M2 sessions |
| [design/tradeoffs.md](design/tradeoffs.md) | The versions compared: what each trade-off cost and achieved | AI, you | When a big model or look changes |

**Reference** (open when a spec needs it):
- `design/`: [rebuild.md](design/rebuild.md) (the v1 review and the v2 plan, with the grid vs patch benchmark,
  2 Nov) · [references.md](design/references.md) (games to learn from) · [m1-build-report.md](design/m1-build-report.md)
  (M1 build: defaults, review, options, 3 Nov) ·
  [diverse-evolution.md](design/diverse-evolution.md) (how to make evolution feel diverse, 3 Nov) ·
  [builds.md](design/builds.md) (the axes of plant life, a build system, 3 Nov) ·
  [after-playtest-02.md](design/after-playtest-02.md) (why it reads as a toy, steering, the new course, 3 Nov).
- `research/`: sourced facts from the `researcher` agent (Mycelarium, Hatched, real evolution, mosses, the tree of
  life, layer sims, progression games, the virtual plant lab, diverse evolution in games).
- `playtests/`: your notes after playing each slice (v2 starts empty).

Outside `docs/`: `toys/` holds throwaway prototypes. `_v1/` is v1 (code, tests and docs, 25 Oct – 2 Nov);
`_archive/` holds older retired docs; `_old/` the first AI prototype. All three are off limits unless you ask
(CLAUDE.md names the v1 files a spec may carry over).
