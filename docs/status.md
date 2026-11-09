# Status

Updated 9 Nov 2026 (Claude, 21C review). Branch `slice-21c-build`, local; review fixes **uncommitted** (not asked).
**Milestone:** M2, step 6, [slice 21](slices/21-the-climb.md). **21C reviewed and fixed; slice 22 specced (in step 6, one sea); your 21C play next.**

**Done (review of `41ddcf5..74fb30b`, then fixes):**
- Review: matches the brief; placement/once-only settlement/save checks hold. Default release unchanged (Life hab = patch ground).
- No replay after a Life without eggs: `settlePending` returns `spread: null`; the sea still passes 2 generations (`sim/sea-life.ts`).
- Placing line shows the real start: `releaseStrength` (full on the Life's ground, else max(line's fit, half)); `ui/Placement.svelte`.
- Replay opens with the release ("Your eggs settle", gold pulse), then "The sea moves on · 1 of 2"; a line explains why (`ui/replay.ts`, `Replay.svelte`, `Meta.svelte`).
- Map zoom: `ui/MapZoom.svelte` (+/−, 1–3×, touch scroll, mouse drag; auto 2× on the release choices while placing and in the replay). The frame moved from `.isle` to it.
- Check reliability: dropped the M1 garden's 0.1 ms step timing (flaked under load; the sea's budgets stay); island labels 200 → 60 seeds (2.3 s, timed out under load).

**Verified:** `npm run check` 4/4 passes, 8.5–8.7 s (was 9.0–10.9 s, failing 4 of 6 under load). `npm run look` 21c placement/replay/tree pass at 360 px; placement at 1280 px. No WebGL leak over 8 tree open/closes.

**Decided (9 Nov, decisions.md):** P48: C (confirm "slice 22 before step 7, one sea" at its kickoff). P46 and P47 closed. Map zoom built on your call. Hidden box: gone.

**Next:**
1. Play 21C fully (review fixes and the slice 22 spec committed 9 Nov); notes in [playtests/21-the-climb.md](playtests/21-the-climb.md). Tick 21C after.
2. Read [slice 22: The larva](slices/22-the-larva.md) (spec 9 Nov; its questions answered: the defaults), then Codex builds 22A, then 22B.
3. Shared build (9 Nov, the 21C working tree): https://claude.ai/artifact/M6LoHUuraYzC5bTdf2SjEn (the 5 Nov link, updated; private until shared from its Share menu).

**Open:** none in proposals.md. For later (ideas.md): tree portraits or one shared canvas (step 7); P47 leftovers and map labels over small patches (step 9). The tree is ~1,040 px tall on a phone with 4 lineages.
