# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv`. The plan: [ROADMAP](../ROADMAP.md).

**Milestone:** M2, the living sea, step 1 (quick wins) built and committed, waiting for your play. M1 is built; only its itch release and Discord are left.
**Not pushed:** the last commits are local. The repo is public, so a push publishes the RuneScape font files (see Open).

**Done**
- [Slice 16](slices/16-quick-wins.md): four bars with "normal" marks and the next-board line on the habitat card (`sim/garden.ts`, `sim/door.ts`, `ui/Meta.svelte`);
  map labels stay inside (`view/islandmap.ts`, test on 200 seeds).
- The RuneScape font, Plain and Bold 12, as its own commit (`ui/fonts/`, `ui/style.css`, `scripts/build-font.py`). All text is 16 or 32 px, the only crisp sizes.
  The font's `·` was one high pixel, so the build redraws it as a mid-height dot. Screens checked by screenshot, no overflow found on the start screen; itch build is one file, 728 KB.
- `toys/fonts.html` compares 21 fonts; GNF sits in gitignored `toys/fonts-local/`. [Slice 17](slices/17-sea-toy.md): spec written, not started.
- `npm run check` passed in 8.7 s. `npm run look` fails here because Playwright isn't installed; screenshots used a temporary driver.

**Decided** (5 Nov, [decisions.md](decisions.md))
- Font: the RuneScape fonts first, "or else gnf"; "drawing our own would also be great".
- A generation stays 3 min "for now"; crashes "every 5-50 gens"; about 70 patches. The living sea, the body and the review's order, as logged earlier.

**Next**
1. Play slice 16 with the new font; notes go in `docs/playtests/16-quick-wins.md`. Then tick step 1.
2. Settle the bars' names (below) and apply them.
3. Build slice 17: one question, "does the map feel alive?"

**Open**
- **Font licence, before a push or the itch release:** RuneStar's CC0 can't clear Jagex's rights, as its README says the glyphs are exactly as in the game. Keep it, GNF (embed only, never in the repo), or our own (AI lean)?
- **Bars' names:** AI lean is Surface, Buried, Prey, Oxygen, with this habitat's real foods beside them. Buried barely moves today (sand 23–29 over 160 gens); the sea toy must fix that.
- How limited is the inventory? Banked offline time (idea)? How do body and diet weigh in the role? When is the itch release?
- M2's "done when" and the 30 ms step limit are my drafts. `tests/garden.test.ts:48` should loosen when the new model lands.
- Left from M1: saving mid-Life, Deep burrow against Dig, clutch odds, sweeper and tank balance (tank 0% A+).
