# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv` on GitHub (`leonbzt/clade`). The plan: [planning/plan.md](planning/plan.md).

**Milestone:** M1, the first playable sea ([ROADMAP](../ROADMAP.md)). Step 1: [slice 08, the stack test](slices/08-stack-test.md);
the Godot half is built and played, the PixiJS half is not built, no stack picked yet.

## Done (5 Nov)
- **Godot half:** [`spikes/godot-life/`](../spikes/godot-life/README.md), the mud flats Life in Godot 4.7.2: rules port with 37
  headless tests (`rules/`, `tests/`), feel (`main.gd`, `view/`), the five feel values as sliders on **Main**. Web build in
  `build/web/` (single-threaded); phone page https://claude.ai/artifact/MG9hUEo96KYvYqew9x95GQ; APK sent in that session's chat.
- **Workflow log, load numbers and your notes:** [playtests/09-stack-test.md](playtests/09-stack-test.md).

## Decided (5 Nov, your words)
- Godot half: "a lot smoother for the animation and board but the look in general is really rough and looks more like from a
  template." "i feel more freedom for ai is also good." ([decisions.md](decisions.md))

## Next
1. The PixiJS half, in a fresh session:
```
Follow docs/slices/08-stack-test.md: build the PixiJS half. Read docs/status.md first.
```
2. You play both, tune the five values in each, and pick; the call goes in `decisions.md` and ticks step 1 of the roadmap.

## Open
- Build the PixiJS half, or skip it and pick Godot on this test alone? (Your call; the slice says both.)
- "More freedom for AI": in the look, in the feel values, or in the whole build? It changes how the next slices are written.
- The look reads as a template; the PixiJS half starts from the same placeholder shapes, and the look is its own topic
  (plan.md, "The look"). Judge the stacks on feel and workflow, or give the PixiJS half more freedom on the look?
- The board turned a quarter (8 × 11) for phones is an AI choice you haven't judged. R2's [K] biology lines still need a check.
