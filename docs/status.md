# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv`. **Everything below is uncommitted.** The plan: [ROADMAP](../ROADMAP.md).

**Milestone:** M2, the living sea, step 1 (quick wins), not started. M1 is built; only its itch release and Discord are left.

**Done**
- Trust fixes, tried with real clicks: a form is really on the body (`sim/life.ts`, `ui/Meta.svelte`); a finished Life and its clutch survive a
  reload (`sim/save.ts`, `main.ts`); a passed-on rare is a sure card, and you can decline a form (`sim/clutch.ts`, `ui/Clutch.svelte`); Feel button
  hidden in player builds (`ui/dev.ts`). `npm run check` passed in 7.2 s.
- [design/world-and-body-review.md](design/world-and-body-review.md): v1, v2 map, toy and now compared, why the map is dead, the proposals.
- [design/tradeoffs.md](design/tradeoffs.md) (new, the living comparison), [patch-notes.md](patch-notes.md), [playtests/10-m1-run.md](playtests/10-m1-run.md).

**Decided** (5 Nov, [decisions.md](decisions.md))
- The living sea: governed patches, booms and crashes, spreading, few named rules, an overview map. Next milestone; filter feeders wait.
- The body: big drawing, visible slots, inventory, verbs from plug-ins. Role settled by body and diet. The skill tree. The review's order.
- 8 h catch-up about 5 s (up to 10): "better fewer time savings and better map and game".

**Next**
1. `/spec` the quick wins: the resource bars and "next board" line from `toys/garden-view.ts`, a font from `toys/fonts.html`, clipped labels.
2. `/spec` the toy of patches with real populations and crashes, seen on a map; one question: "does the map feel alive?"
3. Your further play notes go in playtest 10, any time. The phone page still has the old build: https://claude.ai/artifact/M6LoHUuraYzC5bTdf2SjEn

**Open**
- How limited is the inventory? Banked or pieced offline time instead of one catch-up (idea)? How do body and diet weigh in the role?
- M2's "done when" is my draft, and the 30 ms step limit is my reading of your 5 s: both yours to change. When does the itch release happen?
- `tests/garden.test.ts:48` still enforces 0.1 ms and 0.5 s; it passes, and should loosen when the new model lands.
- Left from M1: saving mid-Life, Deep burrow against Dig, clutch odds, sweeper and tank balance (tank 0% A+).
- To re-run v1: `git archive slice-11e` outside the repo, symlink `node_modules`, `npx vite`, open with `?bot=1200`.
