# Clade

An idle / incremental evolution game. Web: TypeScript, PixiJS (the board), Svelte 5 (screens), Vite. You live one creature's Life at a time on a real habitat board: walk, eat, grow up,
lay eggs. The eggs join a living garden of habitats in the shallow sea around a volcanic island, where your species climbs a tier list per niche. What the
garden becomes is the next board you walk on.

**Start here: `docs/status.md` and its active step spec. `docs/design/direction.md` (15 Nov, eighth round 17 Nov) is
the one design page that wins: a present-day island of real species, lineages as real clades with dials, movers
playable, and each Life makes a build from its clade's tree. Its §9 names the sections of the two older docs still in
force. `ROADMAP.md` when needed. No design pass before the closed test (*decided 16 Nov*): a new idea gets one line in
`docs/ideas.md`.**
The game lives in `clade/` (*decided 10 Nov*) and stays there: the direction is a model swap inside it, not a new
folder. A build session reads its step spec and what the spec names, nothing else; where code and the spec disagree,
the spec wins, and where the spec is silent the builder asks. `game/` (PixiJS, 5 Nov) is frozen: playable and the port source until the new game passes the
play test after N4, then archived. The plant game in `docs/spec.md`, `src/` and `tests/` is the archive.

**The guardrails against tangling (big-picture §12) are defaults, not laws (the user's words, 5 Nov: don't take them too seriously or stop thinking outside them).**
They were written for one toy. If one blocks a better idea, say so and propose changing it; the tests that check them can change too.

## Where things are
- `ROADMAP.md`: milestones, the current steps, the budgets. **The current milestone is the only thing we build for.**
- `docs/status.md`: the last handoff. `docs/README.md`: the docs index (open only what the task needs).
- `docs/design/direction.md`: the direction (what the game is, the organism model, the tree and the Life, the plan). `whole-game-build.md`, `maths-pass.md`: in force only where direction §9 says. `docs/spec.md`: the archived plant game.
- **Who reads what** (*decided 16 Nov*): a builder reads `status.md`, its part of the step spec and the files it names; an architect adds the direction and the roadmap's "Now"; `decisions.md` and `ideas.md` by search only.
- `docs/tastes.md`: the user's tastes, wishes and lessons. `docs/decisions.md`: the dated log of their calls.
- `docs/proposals.md`: open AI proposals (three at most). `docs/ideas.md`: the parking lot.
- `docs/slices/`: one spec per slice (`_template.md`); `docs/playtests/`: the user's notes after playing.
- Code: `clade/src/sim` (rules, no DOM; never imports view or ui), `clade/src/model` (the organism model from W1: laws
  and board over `data/roster`; imports nothing else), `clade/src/data` (numbers and content),
  `clade/src/view` (Pixi), `clade/src/ui` (DOM and Svelte), `clade/tests/`. `game/` has the same layout. `toys/` and
  `spikes/` hold throwaway prototypes.
- `npm run dev` (then `/clade/`; the old game at `/game/`) · `npm run check` (types and tests, prints only failures;
  `clade/` only from N0, `npm run check:game` for the frozen game) · `npm run look -- /clade/` (headless browser:
  screenshots and real taps, see `scripts/look.mjs`) · `npm run build:game` (one HTML file for itch; moves to `clade/`
  at step A).

## Rules
1. **The user owns the design.** `spec.md`, `tastes.md` and `ROADMAP.md` change only on the user's explicit call,
   and each call is logged with its date in `decisions.md`. AI ideas are proposals or ideas, never the plan.
2. **Scope gate.** Spec and build only what the current milestone needs. Any other idea (yours or the user's) gets
   one line in `docs/ideas.md`, and then the work goes on.
3. **Label design statements:** *decided (date)*, *proposal* or *idea*.
4. **Proposals:** a few options with an AI lean, at most three questions, about 15 lines, naming the milestone they
   serve. At most three open at once. Ask for big calls before writing plans (options first, then converge).
5. **One slice = one question.** Write a spec from the template before code. One or two sessions each. Play it
   before calling it done.
6. **Budgets** (in the roadmap): 8 h catch-up about 5 s (up to 10), `npm run check` < 10 s; at most 4
   stocks per habitat, 6 stats, 3 dials per line and 6 mutations per clade (*proposal 15 Nov*; before: 10 genes per kingdom); 12 effect kinds and 8 verbs in the game (*proposal 16 Nov*); a Life's kit at most 6 places, 12 parts, 3 rungs a part and 2 traits per clade (*decided 17 Nov*). Adding one means removing one, or the user's call. No long headless sim
   runs: model tests run hours of garden in under a second.
7. **Code:** files under ~400 lines; data separate from logic. Balance by feel, a simple curve model and the dev
   panel; no balance bot.
8. **Off limits:** `_old/` (an AI-made old prototype), `_archive/` (retired docs; from 16 Nov also the old design docs, planning, and the specs and playtests from before N0) and `_v1/` (v1, 25 Oct – 2 Nov).
   Don't read or reuse them unless the user asks. **Exception:** when a spec carries them over, these v1 files may be
   read: `_v1/src/sim/island.ts` and `_v1/src/data/islands.ts` (the generator), `_v1/src/sim/habitats.ts` (the
   habitat finder), `_v1/src/view/pixels.ts`, `terrain.ts` and `plants.ts` (the pixel painting).
9. **Be critical and lean.** Keep replies, docs and test output short.

## Session flow
`/kickoff <topic>` to start · `/architect <topic>` for advice, contracts and specs (the strongest model; never
builds) · `/build <step> <part>` for one part of a build brief (a weaker model; never decides design: it writes the
question under "For the architect" in `docs/status.md` and stops) · `/spec <step>` · `/handoff` before `/clear`.
**A rule a builder must keep is a test, not a sentence.**
How we work: `docs/workflow.md`; shared context and Git rules: `AGENTS.md`. When a large task is done, run the `/handoff` steps yourself without being asked (*decided 8 Nov*), then tell the user it is ready for `/clear`. One agent by default; delegation requires an explicit request and an independent task.
