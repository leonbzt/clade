# Step W1: the wide toy

**Roadmap step:** 13 (from `ROADMAP.md`) · 5 builder sessions (A and B built 16 Nov; C, D, E are round two) · the model in `clade/src/model/`, the page in `toys/`
**Question:** Is a derived web of real species a board I want to climb and look through, and can I tell species
apart? Under it: do the laws flatten species into a mass and a diet?
**Builds on:** [direction.md](../design/direction.md) §4 (the model, the laws, the data tests), §5 (colonists,
variants), §7. Your calls of 15 Nov: the model is a real tested module in `clade/src/model/` and the toy is a thin
page over it; dials are five shared axes under each clade's own words; in the toy the shore opens by a rare
"breathes air" variant and the land stays shut. A builder reads this page and the files it names, nothing else.

Everything below the calls is a *proposal* (the architect's, 16 Nov) until you have played it. All numbers are
starting values in `clade/src/data/roster/`, tuned by feel.

## In
- **The model** (written and tested by the architect): types, 38 clades, 43 named species (all traits *drafted*),
  10 mutations, 24 habitat kinds, 29 known links, the laws as pure functions.
- **The board rules** (part A): 14 places, one holder a cell, a Life as one tap, colonists and variants on bars,
  fading, the one next goal, the name of a build.
- **The page** (part B): a Board tab to play and a Roster tab to look through (cards, derived eats and eaten-by,
  the coverage table), a dev panel.

## Out
- The Life itself, saving, catch-up, Pixi, the map picture: the game has them; W2 wires the model in.
- Land animals and who comes ashore after you (W4; direction §11.1). The land shows its producers only.
- XP, levels, the clutch, the tree as the unlock map (W5). `ott` and `parent` stay 0 and null (W3).
- Wild species vary or spread; producers colonising on a bar (W4). → `ideas.md`.

## Contract (the architect wrote this before any build)
**Shapes that change only on your call:** `clade/src/model/types.ts` (all of it) and the exported signatures and
interfaces of `clade/src/model/board.ts`.

**The laws** (`clade/src/model/laws.ts`, numbers in `data/roster/laws.ts`). One curve:
`value = intake ÷ (upkeep + losses)`; a build grows where `appetite × value > 1` (letter D; ×1.5 a letter).
1. *Size:* upkeep a gram falls as mass^0.15; losses rise as mass^0.2. Each stat point and push mutation costs upkeep.
2. *Food:* intake = stock × ground fit × bite against toughness × gut against the food's gut size.
3. *Hunt:* prey sits in a size window under the hunter (a bite point doubles its top). Two hunt cells a habitat:
   `hunt`, and `hunt2` for whoever eats the hunter.
4. *Guard:* a guard point leaves ×0.75 of the take; a counter (`beats`) leaves all; fleeing is beaten by more speed.
   Each hunter here that eats you adds to your losses; brood points divide them.
5. *Producers:* the `light` cell's holder adds its stocks to the ground's. A food cell exists from 14 g a tile.
6. *Transfer:* a hunt cell exists from 500 g of prey above the refuge; a hunter stands at 15% of what it reaches.
7. *Realm:* a kind lists groups of adaptations; a build needs one of each. A key mutation counts.

**Tests** (`clade/tests/model/`; a builder never edits them):
- `rules.test.ts` (passing): no clade, species or mutation id in `model/`; the model imports only itself and
  `data/roster`; no dice, no clock; files under 400 lines; the budgets (3 dials, 6 mutations, 6 stats, 4 stocks);
  a species is a point inside its clade; grades on every trait.
- `laws.test.ts` (passing): one test a law, directions only.
- `data.test.ts` (passing): sign change for every dial; no dead; no best; known links ≥ 85%; coverage with three
  ratchet lists (`EMPTY`, `THIN`, `BARE`) that may only shrink; a chain of three in sea and shore; transfer; realm.
- `board.test.ts` (19 tests, passing since part C) and `board-lines.test.ts` (5; **3 tests fail until part D is
  finished**: the C7 goal test, Hold, and the line goal), with `board-help.ts`: the rules of round two below. The
  architect ran all of them against a scratch build of the rules (16 Nov, seed 7): 57 pass, the model tests in 4 s.
- `data.test.ts`, added 16 Nov (passing): `FLAT_MOST` (dials whose best step moves no cell by a tenth: 43 of 54),
  `UNDER` (species a sister outreads everywhere), both ratchets; the toy's lines start unnamed and grow in its sea.

## Build brief (one part per builder session, in order)
### Part A: the board rules
- **Touch:** `clade/src/model/board.ts` (bodies only; split helpers into `clade/src/model/board-*.ts` if it passes
  350 lines). `clade/src/data/roster/toy.ts` only to add a number this brief names.
- **Don't touch:** `types.ts`, `laws.ts`, every other file in `data/roster/`, every test, the exported names and
  shapes in `board.ts`, anything in `clade/src/sim`, `view`, `ui`, and `game/`.
- **Behaviour** (numbers are `TOY` in `data/roster/toy.ts`; every judgement is a call to `laws.ts`):
  1. **Cells.** A place has one cell for each job in `jobsAt(siteOf(place))`, in that order. After every step a cell
     whose job is gone is removed (its holder with it, one news line); a new job gets an open cell.
  2. **Start** (`newBoard`). Generation 0. Each place's `light` cell holds the best producer that grows there
     (`candidates('light', …, SPECIES)[0]`, letter not F), wild. No animals. `heir` as given, `main` its clade.
  3. **Reach.** You can live at `HOME`, in a place where you hold a cell, or next to one.
  4. **Options.** For each cell in reach, `fit = fitness(heir, job, site)`. No option if the letter is F, or if you
     hold another cell in that place (one cell of yours a place). Open cell: `take`. Wild holder: `beat` if
     `fit.value` is higher than the holder's. Your holder with another build than the heir: `improve` if higher.
     Sorted best value first.
  5. **A Life** (`live`). Not an option: return false, change nothing. Else the heir holds the cell (yours, grams
     from `fitness`, `bar`, `variantBar` and `variants` 0, no variant), one news line, then `TOY.lifeGens` steps.
  6. **A step**, in this order: `gen` +1; colonists; variants; grams and fading; cells (rule 1).
  7. **Colonists.** An open food or hunt cell runs a bar only in a **sea** place in reach by rule 3 without `HOME`
     (where you hold a cell, or next to one if `TOY.barsNextDoor`), and only while it has a candidate: a species
     of `SPECIES` that is not of your clade, holds no cell in this place, and does not read F. The one that comes is
     among the best `TOY.pick`, picked by a hash of the seed, the place and the job. `coming` returns it and
     `TOY.colonistBar − bar`. The bar goes up 1 a step; at `TOY.colonistBar` it arrives as a wild holder. A place
     takes one colonist a step, the first cell in order; the others wait at one generation left. No candidate: the
     bar is 0 and `coming` is null. `light` cells never run a bar. A wild holder never spreads, varies or beats you.
  8. **Variants.** In each cell you hold, `variantBar` goes up 1 a step. At `TOY.variantBar` it resets, `variants`
     goes up, and a variant of the **heir** shows there for `TOY.variantStay` generations: one `DIAL_STEP` on one of
     the clade's dials (inside its range; the hash picks dial and direction, the other way if that leaves the
     range), or, every `TOY.rare`-th variant of that cell, one mutation of the clade's list the heir lacks (a `key`
     first and only where `kind.edge`; else the hash picks; none left: a dial step). `what` says it in the clade's
     word ("burrows deeper", "smaller", "breathes air"). When its time is up: if its value there is higher than the
     holder's it takes the cell (still yours, `fade` kept, the heir unchanged), else it goes. One news line either way.
  9. **Adopt.** A variant in a cell of yours becomes the heir and that cell's holder. No time passes.
  10. **Grams and fading.** Each step a holder's grams are `fitness(...).grams`, cells in order. A holder that
      reads F counts `fade` up, else it is 0; at `TOY.fade` the cell opens and the news gives the place and the
      first reason that fails.
  11. **The name** (`nameOf`). The species of the build's clade whose dials are all within half a `DIAL_STEP` of the
      build's and whose mutations the build has; the nearest if several; else null.
  12. **The next goal** (`nextGoal`), first that applies: `adopt` (a variant of yours whose value in its cell is
      higher than the heir's there, or that carries a key the heir lacks) · `hold` (a cell of yours is fading and
      `improve` is an option there) · `race` (a `take` whose cell has someone coming; fewest generations left) ·
      `take` (best value) · `beat` (widest margin) · `improve` (widest margin) · `wait`. One sentence that names
      the place and one reason: "Take Dig the mud in Mud slope before the lugworm arrives in 9 generations."
  13. **News.** One line a cause, with the place's name; the last `TOY.news` are kept. Same seed, same taps, same
      board: no `Math.random`.
- **Done:** `board.test.ts` runs with 0 skipped and passes; `rules.test.ts` still passes; `npm run check` under
  10 s; one commit "W1 part A: the board rules".
- **Stop and ask if:** a board test cannot pass without touching a file under "Don't touch" (above all "you end up
  holding three places or more": the architect could not run it); a rule here and a test disagree; you need a new
  field on `Board`, `Cell` or `Holder`; anything this brief does not settle.

### Part B: the page
- **Touch:** `toys/wide.html`, `toys/wide.ts` (and `toys/wide-*.ts`, each under 400 lines), one entry in
  `toys/index.html`.
- **Don't touch:** everything under `clade/`. The page holds no rule: it calls `board.ts` and `laws.ts` and draws.
  If it needs a number or a judgement, that is a question, not a line of page code.
- **Behaviour** (plain DOM, phone width 390 px first, the look of `toys/sea.html`):
  1. **Top:** the next goal as one tappable sentence (tapping does it); your heir's name (`nameOf`, else "an
     unnamed ragworm") with its dials as words; generation and Lives.
  2. **Board tab:** the 14 places in three bands (land, shore, sea by depth). A place is a row of its cells. A cell
     shows the job's verb, the holder's common name and letter, gold if yours, grey if wild; an open cell shows
     who is coming and in how many generations, or "open"; a cell out of reach is dim; shore and land cells you
     cannot live in say which adaptation is missing (the first reason). A variant shows as a marked chip on its cell.
  3. **Tap a cell:** a card. The holder (or the comer): name, scientific name, where it really lives, six stat
     bars, the three reasons, "eats" and "eaten by" among the species in this place (from `eats`). Your heir's
     letter here beside it, and one button: Take, Beat, Improve, or why not. On a variant: the two builds side by
     side with what differs, both letters, Adopt.
  4. **News:** the last eight lines under the board.
  5. **Roster tab:** every species as a card row (name, clade, mass, the clade's dials in its words, guard, what
     it beats, grades), filter by realm; tap for the full card with eats and eaten-by over the whole roster. Under
     it the coverage table: habitat kinds down, jobs across, the number of candidates that grow, empty and thin
     cells marked. This tab is W3's tool; keep it free of board state.
  6. **Dev panel** (folded): sliders for the heir's dials; a switch for the line you main (any clade with a
     `life`, a new board); skip 12 or 120 generations; force the next variant; `barsNextDoor`; the seed; reset.
- **Done:** `npm run dev`, `/toys/wide.html` plays from a fresh board to a cell on the shore with no console
  error; one `npm run look -- /toys/wide.html` screenshot at phone width looked at; `npm run check` unchanged;
  one commit "W1 part B: the page".
- **Stop and ask if:** the page needs something `board.ts` or `laws.ts` does not export; a card needs a field the
  rows lack; the board does not fit a phone without a second level of navigation.

## Round two (16 Nov): radiate, rivals, lines
**Your calls (16 Nov)**, after your first play ([notes](../playtests/w1-the-wide-toy.md)): fix the toy before W2 · a
better-reading wild species comes for a held cell, yours included, on a bar you can watch, and you get a Hold goal
(this changes rule 7's "never beats you") · progression is radiate, then a new line, with species cards to collect.
The rules below are *proposals* under those calls. Part A's rules stand where no rule here replaces them.

**Measured** (two seeds, 1 500 generations, the goal followed): of about 215 goals 90 were Adopt and 62 Wait; Beat and
Hold never came; the line held 6 of 59 cells and the heir never became a named species. One dial step moves a value
4 to 5%, so a variant's effect cannot be seen as a letter. So: variants walk to a real species and the card says how
far; Adopt is only for what would not happen by itself; the heir goes and each cell's population is its own build.

### Part C: populations radiate
- **Touch:** `clade/src/model/board.ts`, `board-goal.ts`, new `clade/src/model/board-*.ts` (each under 400 lines).
  The `heir` field leaves `Board` (the one shape change; `newBoard(seed, start = START)` keeps its signature).
- **Don't touch:** as part A, and `toys/` (the page reads `board.heir` and will not run until part E; expected).
- **Rules:**
  - **C0 No heir.** `newBoard` sets `main`, `lines` and `starts` from its start build; `cards` is empty. Reach
    (rule 3) counts the cells of all your lines. Colonists (rule 7) are never of a clade in `lines`.
  - **C1 Founder** (`founder(board, place, job, line = main)`). Of the line's holders in this place or next to it,
    and `starts[line]`: the build with the highest value in this cell. Null if that reads F.
  - **C2 Options** (`options(board, line = main)`; part D adds a rule, below). For each cell in reach: `from` is its founder, `fit` the
    founder's fitness. No option without a founder. Open: `take`. Wild holder: `beat` if `fit.value` is higher.
    Holder of this line: `improve` if higher and `from` has every key mutation the holder has. Holder of another
    line of yours: none. A line may hold any number of cells in a place. A Life (rule 5) founds a copy of `from`.
  - **C3 Variants** are made from the cell's own holder, in every cell of yours; bar, count and stay as rule 8. Every
    `TOY.rare`-th is a mutation the holder lacks (rule 8's pick). Else one `DIAL_STEP` nearer the cell's destination
    on the dial farthest from it in steps (ties: the clade's dial order); nothing shows when every dial is within
    half a step (the count still goes up). No destination: rule 8's hash step. It takes the cell by itself only if
    its value there is higher than the holder's.
  - **C4 Destination** (`destination`). Null unless you hold the cell. A holder that `nameOf` names: that species.
    Else, of the species of the holder's clade that do not read F here when given the holder's mutations: the
    best-reading one whose card you lack, or the best-reading if you have them all.
  - **C5 Adopt.** The variant becomes that cell's holder (yours, `fade` kept). Nothing else changes; no time passes.
  - **C6 Cards.** At the end of a step, each holder of yours that `nameOf` names and whose id is not in `cards` adds
    it, with one news line (the species' common name and the place).
  - **C7 The goal** (part D changes which Improve it names, below), first that applies: `hold` (part D; never before) · `adopt` · `race` · `take` · `beat` ·
    `improve` · `line` (part D) · `wait`. Adopt only for a variant that (a) carries a key mutation no holder of
    its line has, or (b) is nearer its cell's destination than the holder, that card is not won, its value is not
    higher than the holder's, and no other cell of the line with the same destination is nearer. `line` is null
    on every goal but a line goal.
- **Done:** `board.test.ts` runs with 0 skipped and passes; `board-lines.test.ts` is still skipped; `rules.test.ts`
  passes; `npm run check`; one commit "W1 part C: populations radiate".
- **Stop and ask if:** a test fails on the data and not on a rule (the architect could not run them; above all
  "four cells or more", "Adopt is no longer every other goal" and the rare-variant test); a rule and a test
  disagree; you need a field or a number this brief does not name.

### Part D: rivals and lines (D1–D3 are built, uncommitted; it stopped on the data 16 Nov; this finishes it)
**Your call (16 Nov): the quiet sea, and a line that lives on rock comes second.** Done by the architect, in data
and the laws (a builder changes neither): `TOY.barsNextDoor` is false, so wild species arrive only in a place where
you hold a cell; `LINES` runs periwinkles, urchins, shore crabs, octopuses, lugworms; `candidates` skips the species
that could never do the job (the same boards, a step 2.4× faster).

**Measured** (the built part D, then a scratch build of the rules below; the goal followed): before, the board
stopped at goal 26 (8 cells, 1 card in 200 goals) because every cell in reach was full, and the goal looped (Adopt a
step toward a card, then Improve undid it: 136 of 200 goals). After, on eight seeds in 150 goals: two lines live by
goal 25 to 28, 4 to 7 of the 9 cards, all five lines open by goal 65 to 97; no goal names one cell more than 6 times.

- **Touch:** `clade/src/model/board.ts`, `board-goal.ts`, `board-*.ts` (each under 400 lines).
- **Don't touch:** `laws.ts`, `types.ts`, everything in `data/roster/`, every test and `board-help.ts`, `toys/`.
- **Keep what is built** (D1 `rivalOf` and the rivals phase, D3 `nextLine`, `setMain`, lines opening). The builder's
  three calls stand: a rival also comes for a wild holder's cell; an arriving rival holds the species' own build
  object (as colonists do: `candidates` tells species apart by it); the line goal takes the first line in the order
  they opened.
- **Rules to build** (each is held by a test; `asked` and `keepsWalk` in `board-help.ts` write two of them out):
  - **C2, added: no line hunts itself.** No option on `hunt` or `hunt2` in a place where a population of the same
    line holds the other of the two.
  - **C7, changed: what the goal names.** `options` is unchanged and still lists every Improve. The goal *names* an
    Improve only if (a) the founder's letter there is higher than the holder's, and (b) it keeps the walk: it is not
    the case that the cell's `destination` is a card you lack and the holder is fewer dial steps from it than the
    founder. The `improve` goal is the widest margin among the named ones. `wait` comes only when no line of yours
    has a Take, a Beat or a named Improve.
  - **D2 Hold, replaced.** A cell of yours with a rival where one tap *ends the challenge*: its variant reads higher
    than its holder and the rival's value there is under `TOY.challenge` × the variant's (Adopt); or an Improve
    there keeps the walk (b; no letter needed) and the rival's value is under `TOY.challenge` × the founder's. The
    fewest generations left first; the sentence names the rival, the generations and the tap.
  - **D3 the line goal, changed.** It fires when the line you main has no Take, Beat or named Improve and another
    line of yours has one: the first such line in the order they opened, and the cell of its best-reading one.
  - **Speed.** In the rivals phase find the places where bars run once a step, not once a cell.
- **Done:** both board test files run with 0 skipped and pass; `rules.test.ts` passes; `npm run check` (about 10 s:
  the model tests take 4 s of it; if it is over, say so in status and do not chase it); one commit "W1 part D:
  rivals and lines" with the architect's uncommitted files in it (`laws.ts`, `toy.ts`, the tests, the docs).
- **Stop and ask if:** a board test fails on the data after the rules above are in (the architect's scratch build
  passed all of them, so first check the rule against this text); board.ts cannot stay under 400 lines by
  splitting; you need a field, an export or a number this brief does not name.

### Part E: the page
- **Touch:** `toys/wide.html`, `toys/wide*.ts`. **Don't touch:** everything under `clade/`. The page holds no rule.
- **Behaviour** (changes to part B):
  1. **Top:** the goal (a `line` goal's tap calls `setMain`); your open lines as chips (tap to main one), the next
     line as "sea urchins at 2 cards" (`nextLine`); your cards as named chips. No heir line.
  2. **A cell of yours** shows its population's name, or "3 steps to King ragworm" (`destination`); a won card is
     marked. A held cell with a running rival shows who comes and in how many generations, in red if it is yours.
  3. **Its card:** the population's build; "Founded from here: letter" for the line you main with Take, Beat,
     Improve or why not (out of reach · the first reason it reads F · "your population here reads higher" ·
     "another line of yours holds it" · "this line already hunts here"). The rival, with its letter against yours.
  4. **A variant:** the two builds' three reasons side by side, the changed lines marked; one value bar with the
     letter marks and both values on it; the variant's own mutations with what each does (`MUTATION[m].does`);
     "takes the cell by itself in N generations" or "leaves in N unless you adopt"; Adopt.
  5. **Words:** thrift reads "thrift (from size)"; mutations never read "none" for a build that has one.
  6. **Dev panel:** the dial sliders go (there is no heir). Keep: the first line (any clade, a new board), skips,
     force a variant, the seed, reset, and the `barsNextDoor` switch (off: the quiet sea; on: the sea you played). Add: force the rival bars one short. Use `reach`; delete `reachOf`.
- **Done:** `/toys/wide.html` plays from a fresh board to a card and a second line with no console error; one look
  run at phone width; `npm run check` unchanged; one commit "W1 part E: the page".
- **Stop and ask if:** the page needs a judgement `board.ts` or `laws.ts` does not export.

## Done when
- [x] Round one played (16 Nov): the board, the cards and the goal read well; variants, the one cell a place and
      the missing progression did not. Notes in `docs/playtests/w1-the-wide-toy.md`.
- [x] Round two, in play (16 Nov: liked; rivals and Hold not reported; notes in `docs/playtests/w1-round-two.md`): your populations spread over a place and grow into named species you collect; you see a
      rival come for a cell and hold it or lose it; a card opens a second line and you play both. You can say what
      a variant changed.
- [ ] `npm run check` passes with no skipped board test.
- [x] Your notes on round two are in `docs/playtests/w1-round-two.md`.

## Size check
- New systems (one at most): the organism model. It replaces records, fitness and hunt in W2; nothing is added
  beside them.
- Budgets touched: 6 foods across the island, 4 stocks a habitat at most (tested); 6 stats; 3 dials a line; 6
  mutations a clade. A fifth dial axis or a seventh stat is your call.
- Fits its sessions? Part A is the larger (about 300 lines against 15 tests). Part B is a page.

## Open questions (none blocks part D)
1. **Hunting reads light.** A hunter here costs a 3 g worm about a tenth of its value, so guard matters less than
   size and ground. Doubling `LAWS.hunt.pressure` empties two more hunt cells. Lean: play first, then tune.
2. **Gaps the roster leaves** (the ratchets in `data.test.ts`): the lee reef has no hunter at its climax, nothing
   grazes the salt flat, sand and mud flats carry no producer, 16 of 76 sea and shore cells have one candidate.
   Lean: W3 fills them with species, not with rules.
3. **`nextGoal` puts Adopt first** (it is free and the variant leaves). The maths pass had it after Beat. Lean:
   first; say if the board then nags.
4. **Dials are flat** (16 Nov): for 43 of 54 clade dials the best single step moves no cell by a tenth, and a bigger
   sister outreads the Common ragworm everywhere. Four sweeps of the laws' numbers left that at 43 to 46 or broke the
   coverage ratchets, so it is the formulas (smooth between a few thresholds), not the numbers. Lean: a second cut
   of the laws as its own architect pass, with W3's rows; round two makes steps add up to a species meanwhile.
5. **`TOY.challenge` is 1.25, not a full letter.** At ×1.5 two of about 30 held cells had a rival; at ×1.2 four to
   eleven. Lean: 1.25 and tune by feel.
6. **A card can cost value**: the Common ragworm's steps read worse, so only Adopt wins it, one step every two
   Lives. The goal no longer undoes that walk (16 Nov). Lean: fine for the toy; the laws' second cut is the cure.
7. **Half the goals are Wait** (53 to 116 of 150, measured): the walks above, and from goal 70 to 110 on the toy's
   nine cards are won and nothing is left. Lean: expected of a toy this small; say if it is dull before that.
8. **A near relative has nowhere to live** (lugworms beside ragworms: the same food on the same ground, measured).
   The tree as the unlock map opens near relatives first. Lean: W5's question (direction §11.5), not the toy's.
