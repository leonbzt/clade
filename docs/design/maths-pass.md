# The maths pass

12 Nov 2026, by Claude (Fable), from [fable-brief-3.md](fable-brief-3.md) and two rounds of questions. Labels:
*decided (date)* is your call; *measured* is a number from `clade/` on this branch; *toy* is a number from one of the
two toys; *proposal* and *idea* are mine. Nothing marked proposal is the plan until you say so.

## Summary

**The verdict.** "Core there but no game" has five measured causes, and none of them is the Life:
1. **The map plays itself.** Spread (6 % a generation into any habitat where a species would grow) and dice (0.08 per
   open slot per generation) fill every habitat by generation 24–36. *Measured:* your first worm, left alone, is pushed
   out of its home by the sea's own cousins by generation 84 (7 idle Lives). There is nothing to take and nothing to keep.
2. **The letter does not mean what it says.** It is the build against break-even at full food, which works out to "how
   far down can this build eat the food and still hold" (D only at a full stock, S down to 20 %). On mud 70 of 144 worm
   builds read S.
3. **Three of eight worm parts carry no sea decision** (Eye is worse everywhere, Gill and Sclerites do nothing without
   hunters) and the Gut gland is better everywhere.
4. **Nothing is yours.** Mine and wild look alike; hunters come from dice.
5. **Gates do not cross in `sim`,** so a line cannot lead anywhere.

**The answer** (*decided 12 Nov* in its main lines): the sea is a **board of jobs** (each habitat offers Graze, Dig and
Hunt), your line is a **character you level** by winning jobs with Lives, and the sea **waits for you**: it only
changes on a bar you can watch.

| Q | Lean | Cost | Step |
| --- | --- | --- | --- |
| Q0 game | Slot board, one next goal, letters against the meta, ladder then a small tree, quiet sea | ~900 lines over 5 sessions; goal and cells < 1 ms | N4 fix, N5, N6 |
| Q1 sea | Keep the graph. Refuge per tile, bars for dice, a waste loop. Texture is paint only | ~100 lines, +0 stocks, +0.02 ms a generation | N4 fix, N5 |
| Q2 zoom | One simulation (the habitat). Boards sample down, eggs count up | 0 lines (a rule) | all |
| Q3 organisms | One grammar: an axis of modules whose laterals are stamps or axes | ~280 lines, 0.02 ms a sprite | L1 |
| Q4 drawing | Icon is its own render; two checks on a contact sheet; RD for cards and ground only | ~240 lines, 1–2 sessions plus hand-made stamps | L1 |
| Q5 genes | A gene is a dial on a trade-off; size by Kleiber; drift toward the cell's optimum | ~150 lines, 2 `score` calls per population per Life | R5 |
| Q6 trees | 3 fixed levels, then 13 nodes for 7 points; four balance tests on data | ~180 lines, tests < 50 ms | N6 |
| Q7 minigames | Each maths toy is a new kind of Life for a new clade; none before M3 | 0 now | M3 |
| Q8 decisions | Three per Life: where, what, how. The board supplies "where" | in N5 | N5 |

**Your calls in this pass** (*decided 12 Nov*, logged in `decisions.md`): the slot board; you first, the sea later; one
active line, the rest live on, a line finishes at its named species and still goes on; letters against the meta; a
ladder, then a small tree; the order fix, board, line, look, with the other planned species soon.

**The order** (*decided 12 Nov*; the cut of each step is a *proposal*):
1. **N4 fix and the quiet sea** · 1 session. 2. **N5 The board** · 2. 3. **N6 The line** · 2.
4. **N7 The other lines** · 1. 5. **L1 The look** · 1–2. Then the closed test, then R5.

**The toys** (`npm run dev`, then the path; both fit a phone):
- `/toys/sea-board.html`: the board with the quiet-sea rules; an "Old sea" box switches to N4's rules. Try: tap the
  gold-framed cell, "Live a Life here" a few times; then "Midgame" and "8 h away".
- `/toys/body-grammar.html`: seven lines from one grammar, three sizes, silhouettes, and the two checks as tables.

**Three questions left for you:**
1. **The waste loop** (the dead and mat slough become detritus and sink one band down; §Q1): build it in N5 with the
   new letters (*lean*; it gives the slope and the deep a cause), or keep fixed detritus ceilings until R7?
2. **Parts with no decision** (Eye, Gill, Sclerites, Gut gland; §Q6): retune them in N6 under the "sign-change rule"
   (*lean*), or leave them for R5?
3. **N7 before L1** is my reading of "the other planned species soon": the look then draws all four lines at once. Swap
   them if you want proper creatures a session earlier.

---

## Q0. The game around the sea

### The concept in one paragraph
The map is a grid of jobs: every habitat has up to three cells (Graze, Dig, Hunt). A Life is how you win a cell: you
play the creature, lay eggs, and the eggs take the cell if your build fits. Eggs give XP, held cells give a trickle
while you are away, levels unlock parts, verbs and habitat types, and from level 4 give points for a small tree. At
level 10 the line is *described* as its named species (Ottoia) and its gate opens the next line. The sea stays quiet
until you act. What grows in an empty cell is a **wild cousin** of your own line, weaker than your best build, arriving
on a bar you can see: a rival to beat or adopt, never noise.

### Why it is a game now: a goal at every scale
| Scale | Time | The goal | Where it is shown |
| --- | --- | --- | --- |
| Turn | seconds | eat, do not get eaten | the Life's board |
| Life | 3–5 min | win or hold one cell with a build that fits | the Life's purpose line |
| Between Lives | 10 s | pick the next cell | **the one next goal** on the map |
| Session | 15–30 min | the next level and its unlock | the XP bar |
| Line | 2–4 h of play, days with idle | describe the line (level 10, named species) | the line screen |
| Sea | weeks | every line described; then the next era (M4) | the tree |

### The one next goal (*toy*, ~30 lines, a pure function of the cells)
Priority: (1) **Hold**: a cell of yours at C or worse where a build you have would do better; (2) **Take before the
bar fills**; (3) **Take** an open cell, first in a habitat you are already in; (4) **Beat** a wild cousin your best
build outranks; (5) **Improve**. One sentence with its reason, for example "Take Graze in Mud shallows: it is open and
your tentacles + gut gland worm would be S."

*Toy:* an auto-player that only follows the goal reaches level 2 after Life 1, level 5 at Life 4, 7 at Life 10, 9 at
Life 20 and 10 at Life 25, holding 16–17 cells. From Life 25–30 the goal reads "every cell near you is held at its
best": one line runs dry there, which is where the named species and the next line must come in. Whether a hand-played
order beats the goal is not measured; it should (see Q8).

### Ownership
A cell has four states and one colour each: **yours** (gold; §5's "yours = saturation and a gold tag"), **wild cousin**
(grey, named after its one change), **open** (blue), and **no food or no part yet** (dim). Hunters stop being a
mystery: a Hunt cell exists only when a habitat has 500 g of prey above its refuge, and the first hunter there is
either yours or a wild cousin that arrived on that cell's bar.

### The quiet sea (*decided 12 Nov*: "you first, sea later"; these rules are the *proposal* for it)
- **Spread:** your species spread only back into cells you have won by a Life (they refill after a crash). Wild cousins
  do not spread. Wider spread is a tree node ("Drifting larvae"), so the map filling by itself becomes a reward.
- **Bars, not dice:** an open cell in a habitat you live in fills a bar in 36 generations (3 Lives). Then a wild cousin
  takes it: within two part-changes of a species living there, never with a part you have not unlocked, viable, and at
  most B against your best. So the sea never shows you something you could not build, and never beats you by luck.
- *Toy, same seed:* after Life 1 the old rules give 4 cells of yours and 2 wild, and 19 wild by Life 8. The new rules
  give 1 cell, and it stays 1 cell after 96 idle generations. Wild cousins first appear around Lives 10–12.
- **This tightens your round-1 answer:** nothing at all happens in habitats you are not in. If that is too still, the
  bar can also run in habitats next to yours.

### The first fifteen minutes (*proposal*, five Lives of about three minutes)
1. **Life 1:** a tentacle worm grazes the home shallows. One gold cell, three blue ones next door. Level 2: Gut gland.
2. **Life 2:** take a second Graze cell. Level 3: the Burrowing bulb, and the Dig column lights up (the "habitat type"
   unlock you asked for: the bulb is what opens the slope).
3. **Life 3:** the first Dig cell. Level 4: the first evolution point.
4. **Life 4:** the first Hold goal: the unlocks have re-ranked your first cell to C.
5. **Life 5:** a red bar is filling on an open cell: the first wild cousin is coming. Take the cell first, or beat or
   adopt the cousin later.
No hunters before your line knows a hunting part (level 7, about Life 10 in the toy).

### What pulls you to grind a line
(1) Every Life moves the XP bar: eggs × the letter's weight. (2) Every unlock re-ranks the board, so old cells become
new goals. (3) Level 10 names the species, with a card. (4) The next line needs this line's gate build (a worm with
sclerites and a proboscis founds arthropods), so the grind has a destination. Today (4) does not exist in `sim`: N6.

### A line's life (*decided 12 Nov* in outline; the details are *proposal*)
- **Active:** the one you play Lives as. The others hold their cells and earn idle XP.
- **Described at level 10:** the named species card (Ottoia, Sidneyia, Olenoides, Anomalocaris) with the defining trait.
- **It still goes on, without power creep:** a log per line with one tick per habitat kind held at S (10 kinds today).
  A full log is a gold frame, nothing more.
- **Later:** parallel play (M3); retire and release at an era's end, where your lines become the next sea's old life (M4).

### Wild branches, adopt and variants
- A **wild cousin** is v1's "populations evolve by themselves" with a cause and a leash.
- **Adopt stays** (you liked it in the N4 play) and gets a job: it is the second way to win a wild cousin's cell (play
  as it, lay 10 eggs, it turns gold), and in R5 the only way to get a **rare** part (Q5). Its N4 failure (a proboscis
  worm with nothing to eat) cannot happen under the leash: a cousin is only born where it has food.
- **Variants** wait for R5: a population whose gene dial has drifted a full pip gets an adjective ("dwarf", "long-gut").
- Purposes become **Take, Beat, Hold, Adopt**, read off the cell's state, so the purpose picker goes.

### P51 judged against three other frames
| Frame | What it is | Verdict |
| --- | --- | --- |
| A. P51, one line, one ladder | a ladder, one goal, wild off until the first unlock, R5 variants early | Right about the ladder and the goal. It does not say what "mine" is or where the goal comes from, and variants before a board would be noise again |
| **B. The slot board** | cells as jobs, ownership per cell, letters against the meta, line levels | **Chosen.** Contains A's ladder; the board computes the goal |
| C. Seas as runs | a sea is a run of 20–30 Lives with an end and a score; progress between seas | Keep as the outer loop at M4. It needs a sea that can be finished, and B gives one: the board runs dry at Life 25–30 |
| D. The sea as the product | an aquarium with levers (v1) | No: "lost and random" |

**What I would cut:** dice; free spread; the absolute letter; hunter builds offered where there is no prey; the
placement preview's top rows and the holders list (the grid replaces both); the purpose picker; patch notes beyond
three ranked lines.

### The next steps
| Step | Question | Contents | Change in `clade/` |
| --- | --- | --- | --- |
| **N4 fix and the quiet sea** · 1 | Does a sea that waits feel alive? | stuck capsules, the crush hint, no hunter build without prey; claimed-cell spread; bars and the leash; refuge per tile | patch: `sim/wild.ts` (about 70 of 125 lines rewritten), `sim/sea.ts` spread (~15), `sim/hunt.ts` (~8), `data/sea.ts` |
| **N5 The board** · 2 | Do I know what to do next? | the job grid over the map; the one next goal; letters against the meta; Take, Beat, Hold, Adopt; three-line notes; the waste loop if you say so | new `sim/cells.ts` (~50), `sim/goal.ts` (~60), `ui/Board.svelte` (~150); patch `sim/fitness.ts` (~25); the tier tests rewritten |
| **N6 The line** · 2 | Do I want the next level? | XP from eggs and held cells; levels 1–3 fixed; the tree; gates cross in `sim`; the named species; the arthropod line | new `data/tree.ts` (~80); `sim/line.ts` 40 → ~90; `sim/hatch.ts` (~30); `ui/Line.svelte` 68 → ~160; four balance tests |
| **N7 The other lines** · 1 | Do lines play differently? | trilobite and swimmer: gates, trees (mostly shared nodes), named species; a tool that beats burrow | data, plus ~40 lines |
| **L1 The look** · 1–2 | Is the one I built the one I see? | plans, stamps, channels, the contact sheet and its checks | rewrite of creature drawing: `view/body.ts` + `body-parts.ts` (523 lines) → ~400 |

New saved state (naming it, because "nothing derived is saved"): the set of claimed cells and one bar value per open
cell. Both are choices and timers, not derived values.

---

## Q1. The living sea, and the land later

### The model today, in closed form (*measured* against `sea.ts`, `fitness.ts`, `hunt.ts`)
Per generation: `next = pop + 0.8 × eaten × brood/upkeep − 0.32 × pop`, with `eaten = 1.4 × pop × reach × density`,
and a stock regrows by `r × (ceiling − stock)` (r = 0.15 mats, 0.10 detritus). Write κ for a build's value at full
food divided by break-even (0.286). Then:

- **The letter is R\*.** One build on one stock settles where `stock / ceiling = 1/κ`. Each letter is ×1.5 in κ, so D
  holds only at a full stock, C at 67 %, B at 44 %, A at 30 %, S at 20 %. Check on the real sea: a lone tentacle worm
  (κ = 1.30) settles at 2 359 g with mats at 0.76 of the ceiling; 1/1.30 = 0.77.
- **Growth at full food** is `1 + 0.32 (κ − 1)` per generation: D 1.00, C 1.16, B 1.40, A 1.76, S 2.30. Mud builds
  with κ of 47–63 grow ×16–21 a generation.
- **Who wins a shared cell.** The loser shrinks by `1 − 0.32 (1 − κ₂/κ₁)` a generation: one letter apart ×0.893 (half
  gone in 6 generations), two letters ×0.822 (3.5), three ×0.775 (2.7). So a Life (12 generations) is enough to see a
  one-letter win. This is also why "a higher letter always wins its slot" holds exactly.
- **The bottom of the web always settles.** The pair's Jacobian has trace `2 − rκ` and determinant
  `1 − rκ + 0.32 r (κ − 1)`. For mats and κ between 1.16 and 7.37 the eigenvalues are complex with modulus under 1:
  damped swings (C 0.894 with a 52-generation period, B 0.85 / 30, A 0.78 / 22, S 0.66 / 18). Above κ = 1/r the stock
  is wiped to `r × ceiling` every generation and the population sits there, stable (eigenvalue 0.68): that is every
  mud digger today, with stocks measured at 0.10–0.29 of the ceiling.
- **Only hunters make lasting swings.** *Measured,* midgame preset, generations 240–400: prey in a rock shallows runs
  2 620 → 232 → 2 413 → 222 g while hunters run 197 → 826 → 91, period about 20 generations. With wild buds off, the
  hunters die out everywhere and every habitat's variation falls to 0.04 or less. So in N4 the swings you liked depend
  on the dice re-seeding hunters.
- **The trough has no floor that scales.** Hunters stop below 100 g of prey in total, whatever the area (657–6 144
  tiles in a real sea).

### Dynamics: the smallest web that swings without collapsing (*proposal*)
Producer stock, eater, hunter, with three rules, two of them new:
1. The hunter's take saturates with prey density (exists: `D / (1 + D/2)`).
2. **A refuge per tile, by substrate** (new; replaces the 100 g floor): hunters cannot reach the first 0.15 g a tile
   on sand, 0.30 on mud, 0.45 on rock. The trough is bounded by construction, and "rock hides more" is a rule a player
   can learn.
3. **A hunter needs spare prey to arrive** (new): 500 g above the refuge.

*Toy,* midgame preset, 1 000 generations: prey swings 854–2 268 g against hunters 166–413, and 1 078–4 141 against
169–568; no holder is lost. Under the old rules in the same toy the prey are pinned at the floor (100–2 364 g).
- **Do not cap intake or births.** I tried a plateau and removed it: under hunters the food stays rich, capped builds
  tie, and a thriftier build then out-breeds the "S" build, so the letter lies. The N4 flood came from spread and dice.
- **Who swings:** weak hunters cycle; an S hunter takes the capped share every generation and gives a steady harvest.
  In the toy every habitat held by your S hunters goes flat. *Idea:* that is the right shape: stability is what
  mastery buys, and the swings live at the frontier, where the leashed wild hunters are.

### Interconnection: a waste loop (*proposal*, question 1)
Detritus stops having a fixed ceiling. Its inflow is marine snow (0.05 g a tile), mat slough (3 % of the mats) and the
dead (80 % of deaths, plus 30 % of every kill as scraps). A band keeps 30 % and the rest sinks one band down.
- *Toy:* below the shallows detritus starts at 0.5 g a tile (snow only). After 30 Lives it is about 5 in the sandy
  shallows, 3.6 on the sand and rock slopes and 1.2 in the deep; mud is eaten down to 0.6–1.0. So the habitat ladder
  (shallows, slope, deep) gets a cause: **the slope is fed by the shallows' mats, the deep by what dies on the slope.**
  Honest limit: at these numbers only one of the four deep cells opens (the mud one); the other three stay "too thin".
  The deep needs a part or a retune, not just patience.
- It needs the letters against the meta: with a moving food level there is no "full food" to rank against.
- No new stock: only detritus's inflow changes. Cost ~25 lines in `sim/sea.ts`.
- **A bug class it exposes:** a loop is only safe if `waste share × grams born per gram eaten < 1`. Today that is
  0.8 × 0.8 = 0.64, but a Brood pouch with its upkeep ranked to 0 makes 1.6 g per gram eaten: mass from nothing. Cap
  `brood / upkeep` at 1.25, or stop upkeep ranks at 1.

### Representation: keep the graph
| Option | What it would buy | Verdict |
| --- | --- | --- |
| Tiles with layers (v1) | real fronts and patches | No. 5 376 tiles × layers, and causes nobody can name |
| A coarse field under the graph | gradients across habitats | Not in the sea. One field (moisture) may earn it on land |
| Distributions inside a habitat | "where in the habitat" | Yes, as paint: derive from the entry border and the population's age |
| A slow automaton for the ground | succession, creeping mats | Yes, run only on events (an eruption, an ash fall): about 1 ms each (estimate) |
| Event-driven sim steps | skipping quiet time | Not needed, see Speed |
| Detail where the camera looks | living paint | Exists (N4 F) |

**Texture at zero sim cost** (*proposal*, R7 or L1): each habitat gets a fixed threshold map, one value per tile, made
once from a frozen reaction–diffusion pattern. A tile shows mats when the stock's share of its ceiling is above the
tile's value. A stock at 76 % then shows 76 % cover in organic patches that shrink and grow along the same contours;
biasing the map by distance from the entry border makes a new arrival sweep across as a front. Nothing is saved.

### Stability tests (*proposal*, ~40 lines, ~150 ms of `npm run check`)
1. **A formula test:** for every stock and letter, the modulus `√(1 − rκ + 0.32 r (κ − 1))` is under 1, and a retune
   of the regrow or breeding rate that would start period doubling (κ above 16 for mats, 24 for detritus, outside the
   wiped regime) fails the test by name.
2. **A trough test:** the hunter web's attractor is a cycle, so eigenvalues do not certify it. Run the presets on three
   seeds for 160 generations; assert no holder is lost and each prey's minimum stays above its refuge.

### Evolving by itself
The sea takes single steps: a wild cousin is one or two part-changes from a living species, has to be viable, and
arrives on a bar (in theory terms, an adaptive walk under strong selection and rare mutation). Gene dials drift in
place (Q5). The sea never crosses a gate, never uses a part you have not unlocked and never reaches S. Those three
"nevers" are what keeps "your Lives bring the big changes" true.

### Discoveries, each with one cause
| Discovery | Trigger in state | The note |
| --- | --- | --- |
| Carcass bloom | a population over 2 kg loses half in one generation; the waste loop does the rest | "The tentacle worms crashed; their dead feed the slope." |
| Shell bed | an armoured species holds a cell at S for 30 generations: the habitat's refuge rises | "Sclerite worms made a shell bed in Rock shallows." |
| Ash fall | a timed event: mats ceiling ×0.5 for 12 generations in two habitats, then ×1.2 | "Ash fell on the north shallows." |
| A hunter arrives | a Hunt cell's bar fills | "A wild proboscis worm took Hunt in Sand shallows." |

A player learns the rules as a tier list through one reason line per letter: "B: no gut gland. Best here: tentacles +
gut gland." At most three notes per return, ranked: lost, slipped, new.

### Speed
*Measured:* 960 generations of the real sea in 165–279 ms, so 0.17–0.29 ms a generation, and 160 generations in
27–46 ms against the 100 ms limit. The 5 s budget buys 17 000–29 000 generations. `clade/` has no away-time yet; at 12
generations an hour (*proposal*) 8 h is 96 generations, about 25 ms. No closed forms or event skipping are needed and
everything stays exact. *Toy:* 96 generations in 34–42 ms, 1 000 in 162–446 ms, with the meta refreshed once per Life.

### The land later
One engine: land habitats are new kinds on the same graph, with at most two more stocks (water, litter; 4 in total).
Hazards are **hunters without a body**: drying takes a share each generation and a cuticle guards against it, exactly
as armour guards against a claw, so `hunt.ts`'s guard maths is reused. Succession (lava, bare, moss, forest) is the
ground automaton above, driven by the plant stock through the same threshold-map trick.

**Lean:** the three rules, the waste loop and the two tests. **Cost:** ~100 lines, +0 stocks, +0.02 ms a generation,
inside N4 fix and N5. **Change:** patches to `sea.ts`, `hunt.ts`, `wild.ts`. **Step:** N4 fix, N5; paint in L1 or R7.

---

## Q2. Zoom levels
| Level | It is | Its own decision |
| --- | --- | --- |
| Inside the ground | a kind of board (the tunnel board is already this) | where to dig |
| Board (a patch) | a **view**, sampled from the habitat: food from the stock's share, hunters from the populations | the Life's turns |
| Habitat | **the simulation**: stocks and populations | which cell to take |
| Sea or island | a count over habitats: the board of cells | the next goal; the line |
| Era or continent | chapters | which sea comes next (M4) |

The rule: one source of truth, the habitat. Going down is sampling (a pure function of state and a seed); going up is
counting (eggs become grams, plus at most one event). A level earns its place only through its own decision, so
"soil" and "continent" are not simulations. Opus's lean holds.

**Lean:** as above. **Cost:** none. **Change:** none. **Step:** a rule for every step.

---

## Q3. One organism engine

**The grammar** (*toy*): a body is an **axis** of modules. A module has a width and may carry **laterals**. A lateral is
a **stamp** (a leg, a flap, a bristle) or **another axis** (a branch). Two switches cover the kingdoms:

| | Module count | Laterals | Seen | Examples in the toy |
| --- | --- | --- | --- | --- |
| Animals | fixed by the plan and the size gene | mirrored stamps | from above, head right | worm, arthropod, trilobite, swimmer |
| Modular life | grows with age | alternate, and they are axes | from the side, growing up | alga, sponge, fungus |

- **The plan is a map from position to identity** (what biology calls a Hox map): `t` from tail to head gives the
  width, whether this stretch is head or trunk, and what a trunk segment carries. A worm's plan carries nothing; an
  arthropod's carries a leg on every segment; a swimmer's carries flaps that peak two thirds along.
- **Development is a function:** `grow(plan, genes, parts, age) → axis`, pure and never saved.
- **Allometry:** the head's share of the length scales as length^−0.25, so a size-4 animal looks adult at the same
  zoom. The same exponent sets upkeep in Q5 (Kleiber's law), so the size gene has one meaning in the look and the sea.
- **Defining traits are what no part can add or remove:** the worm's ringed trunk and front socket, the arthropod's
  jointed legs and head shield, the trilobite's three lobes and cheek spines, the swimmer's flaps and stalked eyes, the
  alga's holdfast and blades, the sponge's tubes with openings, the fungus's stalk and cap. The feeding accent sits on
  the front of an animal and on every tip of a modular body.
- *Toy:* seven lines from about 130 lines of generator; 0.02 ms a sprite. It is programmer art: it proves the pipeline
  and the checks, not the final look.

**Lean:** this grammar, plans as data. **Cost:** `data/plans.ts` ~80 lines, `view/sprite.ts` ~200. **Change:** a
rewrite of creature drawing (the vector joint chain in `view/body.ts` and `body-parts.ts`, 523 lines); the board's
`Creature` interface stays. **Step:** L1.

---

## Q4. Drawing it

- **Three sizes, two renders.** The map icon (8–12 px) is its own render of the same plan with fewer modules, not a
  shrunk board sprite. The portrait is the board sprite at an integer scale. The toy shows all three.
- **Channels** as in §5: line = silhouette, gait and base ramp; feeding = the front stamp in its accent; defence = back
  plates; senses = the one white pixel; speed = tail fan; size = 12, 16, 20, 24 px; yours = a gold pixel.
- **Gaits are functions of (segment, phase):** a travelling wave for the worm, legs out of step along the body for
  arthropods and trilobites, a flap wave for the swimmer, sway for modular life (the toy's "Gaits" box).
- **What is hand-made:** the stamps (about 40 text glyphs: 27 parts at two sizes, many shared) and each plan's numbers.
  What is generated: everything else.

**Check 1, silhouettes** (*toy*, overlap = shared ÷ joined pixels at the best alignment):

| | Between lines, board | Between lines, icon | Builds within one line |
| --- | --- | --- | --- |
| Range | 0.28–0.78 | 0.36–0.84 | 0.79–0.90 (worm 0.63–0.65) |
| Worst pairs | arthropod–swimmer 0.78, trilobite–swimmer 0.76, worm–arthropod 0.72 | trilobite–fungus 0.84, arthropod–swimmer 0.82 | |

The honest finding: any two compact bodies of the same length overlap about 0.7–0.8 whatever is drawn (a disc and a
square of equal area already overlap 0.8). So §5's "overlap under a set share" cannot be a fixed number near 0.6.
*Proposal:* the check becomes two-sided: **every build must be closer to its own line than to any other.** Today the
arthropod, trilobite and swimmer pass narrowly and the worm fails (a tail fan changes a thin body more than a row of
legs changes its outline). That is your "arthropod looks like a worm" as a number, and the fix is in the plans: each
line owns an aspect ratio and one thing that sticks out.

**Check 2, every part changes pixels** (*toy*): all nine parts change at least 4 pixels on the board. Two warnings: the
eye is exactly at the limit (4), and bristles change 0 pixels on the trilobite's icon. The check found a real clash
while I built it: a tail fan on a swimmer changed nothing, because the plan already draws one.

**The palette:** a three-tone ramp per line is 21 colours for seven lines, and the palette holds 37 entries against a
budget of about 32. *Proposal:* two tones per line plus the shared ink and paper.

**Retro Diffusion** (*to verify:* I ran no RD calls in this pass). It earns a place where art is fixed and authored:
named-species cards (one portrait per described species), ground textures per habitat kind (10), era and title art,
and reference sheets from which stamps are redrawn by hand as text glyphs. Always quantised to the palette. It does
not earn a place in creature sprites: they must be assembled from plan and stamps, or "the one I built is the one I
see", the channels and both checks are lost. That agrees with Opus's lean and with your "code-generated will still beat
anything else".

**Lean:** the contact sheet with both checks in `npm run check`. **Cost:** ~240 lines and 1–2 sessions, plus drawing
stamps. **Change:** new files; the palette gains line ramps. **Step:** L1.

---

## Q5. Genetics, rethought

**Three heritable things, three readings** (*proposal*):
| | It is | You get it by | It reads as |
| --- | --- | --- | --- |
| Part | a tool: there or not | unlocking it on the line | a stamp on the body |
| Gene | a dial, 1–5, on a trade-off | founding with it; then it drifts | pips |
| Rare | a part that breaks one trade-off | adopting the wild cousin that carries it | a marked stamp |

- **A gene is a dial whose two ends each win somewhere.** Three at R5 (the budget is 10): size, gut, brood (many small
  eggs or few large).
- **Size, by Kleiber.** Upkeep per gram scales as mass^−0.25 and so does pace. Sizes 1–5 are 1–16 g, so the largest has
  twice the κ of the smallest (about 1.7 letters: it holds at half the food) and half the speed (it loses the race for
  an open cell and recovers from a crash half as fast). Big wins the settled cell, small wins the open or hunted one.
  Today `BASE_UPKEEP` rises from 1 to 1.6 with size, which makes bigger strictly worse per gram in the sea: a dial
  with one good end.
- **How a dial moves without you.** Each Life, a population's mean moves by `heritability × slope`, where the slope is
  the change in log value per pip (two `score` calls), plus a random step that shrinks as 1/N. Large populations sit
  on their cell's optimum; small ones wander. This is your "populations should drift towards what their patch demands"
  (P49).
- **How the Life steers it.** Your eggs carry the dials of the body you grew, so a founding sets the start; the sea
  then pulls it toward the local optimum at a pace you can see.
- **Reading it:** one arm of five pips per gene: filled pips for the population's mean, a tick for this cell's optimum,
  a ghost pip for where it is heading. One glance says "this population wants to be bigger here".
- **Variants:** a population a full pip from its founder gets an adjective. That is v1's "see populations change", with
  a cause.
- **Rares stay exciting** by being trade-off breakers (a hook that beats armour) and by a pity timer: with a 5 % chance
  per filled bar and a guarantee at the 30th, the expected wait is `(1 − 0.95³⁰) / 0.05` ≈ 16 bars.

**Lean:** three dials, selection plus drift, pips with the optimum ticked. **Cost:** ~150 lines (`sim/genes.ts` ~70,
pips ~50, size terms in `fitness.ts` ~15), 2 `score` calls per population per Life, 2 sessions. **Change:** patch;
`BASE_UPKEEP` is replaced by the Kleiber term. **Step:** R5.

---

## Q6. Skills, trees and balance without a bot

**Three layers:** the **build** (parts and dials; chosen per Life), the **line** (levels; hours), the **tree of life**
(gates between lines; days). *Decided 12 Nov:* a ladder, then a small tree.

**The worm line** (*proposal*): level 2 Gut gland, level 3 Burrowing bulb, then one point per level from 4 to 10
(7 points) for 12 nodes in three branches of four, each node needing the one before it:

| Branch | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| Feed | Bristles (mud ×2) | Proboscis (opens Hunt) | Gut rank | Crush (verb: shells) |
| Guard | Sclerites (armour) | Brace (verb) | Deep burrow (more refuge) | Hooked spines |
| Brood | Brood pouch | Drifting larvae (wider spread) | Banked clutch | Twin clutch |

The thirteenth node is free at level 10: the named species and its defining trait. Seven points finish one branch and
three nodes elsewhere, so two worm lines differ. The arthropod's gate (sclerites + proboscis) needs Feed 2 and Guard 1:
three of the seven points, which makes the gate a choice. Other lines reuse most nodes (N7).

**Four balance tests on data** (*proposal*; closed form or exhaustive; under 50 ms together):
1. **The sign-change rule:** every part's worth (the change in log value from adding it) is positive in at least one
   habitat kind and not positive in at least one. *Measured* today: Gut gland +0.4 to +0.9 everywhere (fails), Eye −0.7
   to −0.2 everywhere (fails), Gill and Sclerites 0.0 everywhere without hunters (fail); Bristles (+0.7 on mud only),
   Tentacles, Bulb and Pouch pass. That is 80 `score` calls.
2. **No dominant build:** count distinct winners per cell kind. *Measured:* four winners over ten kinds, all with the
   Gut gland. Require that no part is in every winner.
3. **Counters:** every guard is beaten by at least one tool, and no tool beats every guard. *Measured:* nothing beats
   burrow (fails). Let the digger beat it (N7).
4. **No single best order:** list every legal order of spending the seven points (1 890 orders, 18 end states), score
   each on three map presets by XP per Life in closed form, and require that the best one differs between presets or
   that the top three are within 10 %.

**The curves.** A Life gives `eggs × weight` XP (weights 1–6). The game's `xpAt` reaches level 10 at 1 250 XP: about
11 Lives at a steady C, and 5 Lives in the toy, where the first build reads S (level 3 after Life 1). Too fast. The
toy's curve (120, 300, 550, 900, 1 400, 2 100, 3 000, 4 200, 5 800) gives level 10 at Life 25. Costs that grow like level² keep one level every 2–3 Lives; geometric
costs would force a reset, so keep them for the step between eras. Idle XP at 0.05 × weight per held cell per
generation gives about 430 XP for 15 cells over 8 h: two Lives' worth. All of this is yours to tune by feel.

**Lean:** the table and the four tests. **Cost:** `data/tree.ts` ~80 lines, tests ~100, inside N6. **Change:**
`sim/line.ts` (points already buy ranks; they buy nodes too). **Step:** N6, N7.

---

## Q7. Minigames from maths toys (*ideas*, all M3 or later)
| Toy | Your one lever | The loop | A failure you can read | Suits | Comes back as |
| --- | --- | --- | --- | --- | --- |
| Boids | the school's heading | stay tight or spread to feed | the school splits, stragglers are eaten | swimmers, later fish | eggs per survivor |
| Reaction–diffusion | where you graze the pattern | eat spots, leave seed | the pattern dies where you overgrazed | grazers on mats | eggs; the mats' share |
| L-systems | which bud grows this turn | height for light, or width for reach | shaded branches die | algae, plants | spores; a canopy event |
| Colony automata | where a polyp is added | grow without smothering | crowded cells die | sponges, corals | eggs; a reef event |
| Slime-mould networks | which food to link | a short network or a safe one | a starved branch withdraws | fungi | links between habitats |
| Lenia | none that fails readably | | | paint only | nothing |

Each is a new kind of Life for a new clade, returns eggs and at most one event, and waits for M3.

**Lean:** park all six. **Cost:** none now. **Step:** M3.

---

## Q8. Decisions and fun
Three real choices per Life: **where** (the cell), **what** (the build; later the dials), **how** (grow or lay, and the
turns). Between Lives: the next cell, and a tree point at a level-up. What makes the best answer depend on the sea:
- letters against the meta are per cell (four different winners over ten habitat kinds today; more once test 1 passes);
- hunters make guards worth their cost only where they are;
- your own cells live off each other: a Hunt cell taxes the Graze and Dig cells beside it (*toy:* two Dig cells of
  yours fall to F because your own hunters eat the diggers), and with the waste loop what dies above feeds the cell below.

"I just auto every time" applies to the goal too. Following it must be good and not best: the goal ignores what a
Life costs, what the tree is about to unlock, and bars two Lives away. Test 4 is where "not best" gets checked.

**Lean:** no extra system; the board, the tree and the meta carry the choices. **Step:** N5, N6.

---

## Limits touched
- **"Letters rank the build, at full food"** (11 Nov) is replaced by letters against the meta (*decided 12 Nov*).
  `fitness` stays the only source of letters; "a higher letter always wins its slot" still holds, because food cancels
  in the ratio.
- **Saved state** grows by the claimed cells and the bars.
- **Stocks** stay at 2 in the sea. **Genes:** 3 of 10 at R5. **Speed:** unchanged to within measurement.
