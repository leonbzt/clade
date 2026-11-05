# Status

Updated 2026-11-05. Work is on branch `claude/project-thread-cy8ptv` (from `v2`) on GitHub (`leonbzt/clade`).

**Direction (your calls, 5 Nov):** a fresh start for the real build. The plan: [planning/plan.md](planning/plan.md). The roadmap
is adopted: [../ROADMAP.md](../ROADMAP.md), M1 "the first playable sea". `src/` (the plant game) and `big-picture.md` are now
background; where they disagree with `plan.md`, `plan.md` wins.

## Done (5 Nov)
- **Research:** seven tracks in `research/`, digest in [planning/research-digest.md](planning/research-digest.md). All ran short
  of web fetches; unverified lines are marked (most of R2's species table).
- **Planning session:** your calls in [decisions.md](decisions.md) (5 Nov, turns 1–6) and [planning/plan.md](planning/plan.md).

## Done: slice 08, the Godot half (5 Nov)
[`spikes/godot-life/`](../spikes/godot-life/README.md): the mud flats Life in Godot 4.7.2, phone first, with the five feel values
as inspector sliders on **Main**. The web build is committed in `spikes/godot-life/build/web/` (single-threaded); an Android APK
was built and signed in the cloud (sent in the chat, not committed). Phone link: https://claude.ai/artifact/MG9hUEo96KYvYqew9x95GQ (private). 37 rule tests run headless in about 10 ms. Workflow log and load numbers:
[playtests/09-stack-test.md](playtests/09-stack-test.md).

## Next
1. You: open `spikes/godot-life/` in Godot 4.7, play, tune the five values, try it on your phone; notes go in playtest 09.
2. The PixiJS half, in a fresh cloud session on this branch:
```
Follow docs/slices/08-stack-test.md: build the PixiJS half. Read docs/status.md first.
```
3. Then you play both and pick; the call goes in `decisions.md`.

## Open
- The Godot half was checked only in headless Chromium at phone size, not in the editor or on a real phone.
- The board is the toy's map turned a quarter (8 × 11) to fill a phone held upright: an AI choice for you to judge.
- R2's [K] biology lines need a check before they go into text the player sees.
- Hallucigenia, the brachiopod and generated habitats wait for M2 (see ROADMAP).
