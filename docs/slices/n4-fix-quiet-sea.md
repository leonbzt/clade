# Step N4 fix: the quiet sea

**Milestone:** M2, step 12 (from `ROADMAP.md`) · 1–2 sessions · in `clade/`, on branch `n4-who-eats-whom` · one commit
and a breakpoint per part
**Question:** Does a sea that waits feel alive? From *first worm*, no dev bar: after Life 1 the map holds your one
cell and stays that way; over five Lives, can you say what is yours, and where the first wild cousin came from?
**Builds on:** decisions.md, 12 Nov ("you first, the sea later"; the order; Adopt stays; bars only in habitats you
live in, your "go"). [maths-pass.md](../design/maths-pass.md) Q0 (ownership, the quiet sea, the step table) and Q1
(the refuge). Your N4 notes ([playtests/n4-who-eats-whom.md](../playtests/n4-who-eats-whom.md)): stuck capsules, "too
much too fast", "where the hunters came from", the proboscis worm with nothing to eat, the crush "indicated clearer".

A **cell** is one slot in one habitat (Graze, Dig or Hunt). All numbers are starting values in `data/`, tuned by play.

## In (parts in order)
**The fixes.**
- **A. Stuck capsules** (`view/living.ts`). At its habitat's edge a capsule slides along it (the x step, then the y
  step); if both are blocked it faces its new target at once. After touching the edge it stops chasing or fleeing for
  `LIVING.edge` seconds (0.8). **Also checked here:** the arthropod that never showed on the map. Reproduce it with a
  placed arthropod and 12 generations, then fix the view or name the cause in the notes.
- **B. A hunter's Life has prey, and says so** (`sim/board.ts`, `sim/found.ts`, the Life's UI).
  - A hunting build's board carries up to `BOARD.prey` (3) rivals, all of them residents it can eat, heaviest first.
  - Colonise, Challenge and Adopt are offered for a hunting build only where the board would hold prey. Otherwise the
    card says "No prey here for a hunter."
  - The crush hint: prey you can eat wear a ring in the hunter accent; the Crush button reads "Catch \<name\>" and
    lights up when one is beside you; a hunter's Life opens with "You hunt: stand beside \<name\> and Crush."

**The quiet sea.**
- **C. A refuge per tile** (`sim/hunt.ts`, `sim/fitness.ts`, `data/sea.ts`). Hunters cannot reach the first
  `HUNT.refuge` grams of prey per tile: 0.15 on sand, 0.30 on mud, 0.45 on rock. The spare is the prey above that.
  The take's level reads the spare, and hunters together take at most `maxTake` of each prey's share of it. This
  replaces the 100 g floor. A hunter **arrives** (by spread or as a cousin) only at `HUNT.from` (500 g) of spare.
- **D. Your species spread only into cells you have won** (`sim/sea.ts`, `sim/found.ts`). `World.claimed` lists your
  cells. A Life's eggs claim the cell their build takes, if they grow there; adopting claims the cousin's cells; a dev
  placement and a preset claim theirs. Step 5 moves a population only if it is yours and the cell it would take next
  door is claimed (so cells refill after a crash). Wild species never spread.
- **E. Wild cousins on a bar, on a leash** (`sim/wild.ts`, about 70 lines rewritten; the dice go).
  - **The bar.** `World.bars` counts generations per cell. It runs on a cell with food that nobody holds, in a habitat
    where a species of yours lives; anywhere else it resets to 0. At `WILD.bar` (36, about three Lives) a cousin takes
    the cell and the bar restarts.
  - **The leash.** The cousin is the best build within two legal changes of a species living in that habitat that
    eats this cell's food, grows there today, and reads B at most. Its parent is that species (law 4). No such build,
    no cousin.
  - **Shown:** an unheld slot on the habitat card reads "a wild cousin in N generations". The notes say "A wild cousin
    took Graze in Lee shallows: Wild bulb worm (C), from your Tentacle worm." When nothing else happened, the notes
    name the nearest bar.

## Not in this step
The grid of cells on the map, cell colours, the one next goal, letters against the meta, Take / Beat / Hold / Adopt,
three-line notes, cutting the preview's top rows and the holders list: N5. Losing a claim: N5 (Hold). The waste loop
(P52) and the formula stability test: N5. XP from cells, levels, part unlocks, gates crossing in `sim`: N6. "Drifting
larvae" and bars in habitats next to yours: `ideas.md`, after this play. A hunter's own chase: N7. The capsules' look
and the arthropod reading as a worm: L1. Saving to disk: step A.

## Done when
- [ ] **Play question** (`/clade/`, no dev bar): five Lives from *first worm*, with one idle skip. Does the still map
  read as calm or as dead? You can name your cells and the first cousin's cause.
- [ ] Midgame preset: hunters and prey still swing and nobody is lost. No capsule sticks on a border. Playing a
  hunter, you know to Crush.
- [ ] Tests: capsules keep moving on a real map; a hunter's board has prey or no Life is offered; prey is never hunted
  below its refuge; the trough test (presets, three seeds, 160 generations, no holder lost); no spread into an
  unclaimed cell and a claimed one refills; wild species never spread; a bar fills in exactly 36 generations, resets
  when you leave, and is deterministic; a cousin is B at most, grows, and has its parent in the habitat; 96 idle
  generations after Life 1 leave one cell; laws 2, 4 and 6 updated.
- [ ] `npm run check` under 10 s; one phone-size look run.
- [ ] Your notes are in `docs/playtests/n4-fix-quiet-sea.md`; then the branch merges into `main`.

## Size check
- **New systems:** none; three rules change (spread, buds, the hunters' floor). No new stock, stat, gene or screen.
- **Touches the records:** two saved fields, `World.claimed` and `World.bars`. The maths pass named both: a choice and
  a timer, not derived values, so law 2 holds.
- **If it slips:** the notes' "nearest bar" line goes first, then the prey ring.

## Open questions (the build follows the leans unless you change them)
1. **What may a cousin carry before N6 has unlocks?** (a) Any part a clutch could offer your line today (*lean*): a
   cousin can show a part you have not grown yet, and Adopt is how you get it. (b) Only parts your species already
   carry: stiller, and the first cousin comes much later.
2. **Three prey on a hunter's board** (*lean*; today it is one rival worth 10 food, too little to lay 10 eggs), or no
   Lives as a hunter until N7?
