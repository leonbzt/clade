# Status

Updated 2026-11-05. Branch `claude/project-thread-cy8ptv`. The plan: [ROADMAP](../ROADMAP.md).

**Milestone:** M2, the living sea. Steps 1 and 2 are built and wait for your play. M1 is built; only its itch upload and Discord are left.

**Done**
- [Slice 17](slices/17-sea-toy.md), the sea toy: `npm run dev`, then `/toys/sea.html`. Files are `toys/sea*.ts`; test is `game/tests/sea.test.ts`.
  The test's bars all pass on 3 seeds. A patch's median gap between crashes is 26–29 generations; at most 9 patches at once; a generation costs 0.3–0.6 ms; Skip 160 about 60 ms. Causes come from what actually killed them.
- **The bars, your request:** Surface, Buried, Prey, Oxygen, with real foods beside them, in the game and the toy (`sim/garden.ts`).
- **The font, your call:** the RuneScape font stays ([research](research/font-licences.md): small risk, not legal advice). Now named Clade Text in files, family and internal names. GNF is the fallback.
- Slice 16: built earlier, unplayed. `npm run check` passes in 9 s. The itch build is one file, 728 KB, and loads from disk.

**Next**
1. Play the toy for the question "does the map feel alive?" Name a boom, a crash and a spread. Notes go in `docs/playtests/17-sea-toy.md`.
2. Play slice 16 in the game; notes in `docs/playtests/16-quick-wins.md`. Then tick steps 1 and 2.
3. Upload to itch, which needs your account: `npm run build:game`, then `game/dist/clade.html`; text in [itch.md](itch.md).
4. If the toy lives: step 3, the overview map in the game.

**Open**
- Known weak spots in the toy: Anomalocaris takes nearly all the hunting, and each patch's cycle is fairly regular. Your feel decides if they matter.
- Slice 17 changed two things from its spec: bare coast splits into mud and rock arcs, and headlines merge across the whole map (see the spec).
- `npm run look` fails here because Playwright isn't installed; screenshots used a temporary driver.
- How limited is the inventory? Banked offline time (idea)? How do body and diet weigh in the role? When is the itch release?
- M2's "done when" and the 30 ms step limit are my drafts. `tests/garden.test.ts:48` should loosen when the new model lands.
- Left from M1: saving mid-Life, Deep burrow against Dig, clutch odds, sweeper and tank balance (tank 0% A+).
