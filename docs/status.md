# Status

Updated 9 Nov 2026 (Codex). Branch `slice-21c-build`, local only; not pushed.
**Milestone:** M2, step 6, [slice 21](slices/21-the-climb.md). **21C built; Claude review and your playtest next.**
**Checkpoint:** base `41ddcf5`; parts 1–4 `2503471`, `6d63e9a`, `bf4f221`, `1499d2a`; final commit “feat(21C-5): add lineage tree and review handoff”.

**Done (brief order, one commit each):**
- 1: inactive map/HUD frames hidden behind sheets; launcher no longer mounts a hidden patch panel (`Meta.svelte`, `style.css`). No separate empty modal reproduced; confirm the original reported box in play.
- 2: `placePending`, validated `pending.place`, neighbour-only release and continuation; `release` keeps the Life's ground proven when eggs move (`sim/sea-life.ts`, `sea-save.ts`, `sea.ts`).
- 3: map placement, ground/holder/hunters/risk preview, Release here → hatching (`ui/Placement.svelte`, `after-life.ts`). Reload before confirmation resumes choice at the Life patch; afterward resumes hatching.
- 4: atomic settlement returns two population/headline frames; 1.5 s each, growth/fall pulses, tap-to-skip (`ui/Replay.svelte`, `replay.ts`, map renderer). Playback never advances the sim. Final review kept empty replay patches dark.
- 5: CSS recipe tree, locked silhouettes, levels, newest three species/+N, close-up return (`ui/Tree.svelte`, `Lines.svelte`, `LineView.svelte`). Compact portraits reuse `Creature`; `main.ts` is 329 lines.

**Verified:**
- `npm run check` passed after final code edits (10.90 s: over the 10 s target). Placement/save rejection/defaults, frame isolation and ancestry are covered by tests.
- `npm run build:game` passed; packaged placement/reload/skip and timed replay browser checks passed. Build still warns about bundle size and deprecated `inlineDynamicImports`.
- `npm run look`: before/after panel states, placement, both reload paths, replay completion/skip, tree fresh/unlocked/species/navigation; tree and close-ups fit 360 px. No runtime exceptions; look logged an incidental resource 404.
- Reproducible scenarios: `scripts/look/21c-{placement,replay,tree}.json`. Screenshots: `.shots/21c-{before,after}-*.png`, `21c-placing*.png`, `21c-replay-frame.png`, `21c-tree-*.png` (local, gitignored).
- Local look uses existing Playwright: `NODE_PATH=/home/leon/.npm/_npx/e41f203b7505f1fb/node_modules CHROME_BIN=/usr/bin/google-chrome npm run look -- /game/ scripts/look/21c-tree.json` (prefix `W=360` for phone). No dependencies added.

**Decided:** no new design calls; built the approved brief. The map, wild moult offers and P48 remain outside this build.

**Next:**
1. Fresh Claude session: `/kickoff review 21C`. Review `41ddcf5..slice-21c-build`, especially inactive panels, placement/proven-ground fitness, once-only settlement/replay and tree phone layout.
2. Play 21C, add your notes to [playtests/21-the-climb.md](playtests/21-the-climb.md), then answer P48. Slice/roadmap play-completion boxes remain unchecked.

**Open:** P48, P47, P46. Existing garden timing test failed once at 0.122 ms/step under parallel load; subsequent full checks passed, test unchanged. Human confirmation of the original hidden box and play feel is still needed.
