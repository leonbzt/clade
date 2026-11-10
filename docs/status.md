# Status

Updated 10 Nov 2026 (Claude, the first session of the rebuild: clerical, no code). Branch `slice-22-build`, local;
all doc edits from the Fable pass and this session are uncommitted.
**Milestone:** M2. Step 6 (`game/`, slices 21–22) is built but not ticked: your play is pending. **Now: step 7, N0.**

**Read first:** the core is rebuilt in `clade/` from [design/whole-game-build.md](design/whole-game-build.md) (how;
[whole-game.md](design/whole-game.md) is the why). A build session reads that brief and its step spec, nothing else
by default. `game/` is frozen: playable, and the port source until the play test after N4.

**Done:**
- `ROADMAP.md` re-cut from step 7 with the brief's §8: steps 7–17 are N0 … R10, R11; the closed test is step 12, the
  public alpha is in step 15.
- `CLAUDE.md`: the new folder, the doc precedence (the brief wins over full-version.md), `check` vs `check:game`.
- [slices/23-the-food-web.md](slices/23-the-food-web.md) is marked re-cut (its parts go to N4, R5, R7, R8).
- The N0 spec: [slices/n0-the-ground.md](slices/n0-the-ground.md). `docs/README.md` points at it and the brief.

**Decided (10 Nov, see decisions.md):** apply the roadmap re-cut; the folder is `clade/`, with the proposed
`CLAUDE.md` wording; the brief's §2 (worm with a trunk), §3 (the sea's ground), §5 (look contract) and §9 (itch
timing) are decided.

**Next:**
1. Commit the docs (your call), then a task branch for N0 (`git switch -c n0-the-ground`).
2. Build N0: `/kickoff N0`, then the spec's parts 0, A–E in order; end with the screenshot sheet and three lines here.
3. Your play of 21C and 22 on `game/` can still happen any time; tick step 6 and merge when you say so.

**Open:**
- Playwright isn't in the repo, so `npm run look` fails; N0 part 0 makes it work for `/clade/`.
- `docs/planning/m1-run.md` is no longer named in `CLAUDE.md`; the brief's §0 replaces it for build sessions.
