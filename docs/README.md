# Docs index

Open only what the task needs. Top to bottom is the order of authority: when two docs disagree, the higher one
wins (and the code is the truth for what's built).

| File | What it holds | Who changes it | When to read it |
| --- | --- | --- | --- |
| [../ROADMAP.md](../ROADMAP.md) | Milestones, the current steps, what's frozen | You (AI drafts) | Every session |
| [status.md](status.md) | The last handoff: done, decided, next, open | AI at `/handoff` | Every session |
| [vision.md](vision.md) | What you've decided, as it stands now | You (AI records your calls) | Design sessions, specs |
| [slices/](slices/) | One spec per slice ([_template.md](slices/_template.md)) | AI drafts, you approve | The current one when building |
| [proposals.md](proposals.md) | Open AI proposals (three at most) | AI | When deciding |
| [decisions.md](decisions.md) | The dated log of your calls | AI records them at `/handoff` | To check why or when |
| [ideas.md](ideas.md) | The parking lot, one line each | Anyone | When planning the next milestone |
| [workflow.md](workflow.md) | How we work: sessions, the idea funnel, tokens | You | When the process changes |

**Reference** (open when a spec needs it):
- `design/`: [game-shape.md](design/game-shape.md) (the plan behind M1–M4, 29 Oct) ·
  [food-web.md](design/food-web.md) (the expansion plan, P31, parked) ·
  [nitrogen-and-time.md](design/nitrogen-and-time.md) (P32 and the clock, P33 a; the source for 11e) · [fresh-eyes.md](design/fresh-eyes.md)
  (an outside designer's view, 26 Oct) · [references.md](design/references.md) (games to learn from, the look) ·
  [tech-art.md](design/tech-art.md) (stack, art direction).
- `playtests/`: your notes after playing each slice. `research/`: sourced facts from the `researcher` agent.

Outside `docs/`: `toys/` holds throwaway prototypes. `_archive/` holds retired docs (P1–P33 in full, the old brief,
the outline, minigames, species models, the layer-sim review); reading it is blocked, like `_old/`. Ask to bring one
back.
