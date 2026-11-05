# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv` on GitHub (`leonbzt/clade`). The plan: [planning/plan.md](planning/plan.md).

**Milestone:** M1, the first playable sea ([ROADMAP](../ROADMAP.md)). Step 1: [slice 08, the stack test](slices/08-stack-test.md);
both halves are built; the Godot half is played, the PixiJS half is not; no stack picked yet.

## Done (5 Nov)
- **Godot half:** [`spikes/godot-life/`](../spikes/godot-life/README.md), Godot 4.7.2, 37 headless tests, five feel values as
  inspector sliders. Phone page https://claude.ai/artifact/MG9hUEo96KYvYqew9x95GQ; APK sent in that session's chat.
- **PixiJS half:** [`spikes/pixi-life/`](../spikes/pixi-life/README.md), PixiJS 8.22 + TypeScript + Vite, the same rules and
  checks (vitest, inside `npm run check`), five feel values in a dev panel (the **Feel** button). Its look is a free
  interpretation (your call): the 2D low-poly look from the look toy. Phone page https://claude.ai/artifact/EmQkbFhyV8LLhx5CYe7Jm8.
- **Workflow logs, load numbers side by side, your notes:** [playtests/09-stack-test.md](playtests/09-stack-test.md).
  In short: Pixi loads in under a second (Godot 5–45 s on a slow phone link); Godot gave tweens, particles and an inspector
  for free, Pixi needed them written (about 250 lines).

## Decided (5 Nov, your words)
- Godot half: "a lot smoother for the animation and board but the look in general is really rough and looks more like from a
  template." "i feel more freedom for ai is also good."
- PixiJS half: "dont keep the simple shapes, feel free to do a free interpretation." ([decisions.md](decisions.md))

## Next
1. You play the PixiJS half (phone page or `npm run dev`, `/spikes/pixi-life/`), tune its five values, and note how it went.
2. Pick the stack; the call goes in `decisions.md` and ticks step 1 of the roadmap. Then slice 09 gets a spec in the chosen stack.

## Open
- The two halves now differ in look on purpose. Judge the stacks on feel and workflow; the look can move to either one
  (the low-poly drawing is plain code). If the look sways you, the Godot half could get the same pass first (one session).
- "More freedom for AI": in the look, in the feel values, or in the whole build? It changes how the next slices are written.
- The board turned a quarter (8 × 11) for phones is an AI choice you haven't judged. R2's [K] biology lines still need a check.
