# Step W1: the wide toy

**Roadmap step:** 13 (from `ROADMAP.md`) · 2 builder sessions · the model in `clade/src/model/`, the page in `toys/`
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
- `board.test.ts` (15 tests, **skipped until part A**, then all run): the rules of part A below.

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

## Done when
- [ ] In play: from one worm on the Lee mud flats you take cells, watch named species arrive, adopt variants until
      your worm is a named species, find the air breather and hold a cell on the shore. You can say why one
      species holds a cell and another does not.
- [ ] `npm run check` passes with no skipped board test.
- [ ] Your playtest notes are in `docs/playtests/w1-the-wide-toy.md`.

## Size check
- New systems (one at most): the organism model. It replaces records, fitness and hunt in W2; nothing is added
  beside them.
- Budgets touched: 6 foods across the island, 4 stocks a habitat at most (tested); 6 stats; 3 dials a line; 6
  mutations a clade. A fifth dial axis or a seventh stat is your call.
- Fits its sessions? Part A is the larger (about 300 lines against 15 tests). Part B is a page.

## Open questions (none blocks part A)
1. **Hunting reads light.** A hunter here costs a 3 g worm about a tenth of its value, so guard matters less than
   size and ground. Doubling `LAWS.hunt.pressure` empties two more hunt cells. Lean: play first, then tune.
2. **Gaps the roster leaves** (the ratchets in `data.test.ts`): the lee reef has no hunter at its climax, nothing
   grazes the salt flat, sand and mud flats carry no producer, 16 of 76 sea and shore cells have one candidate.
   Lean: W3 fills them with species, not with rules.
3. **`nextGoal` puts Adopt first** (it is free and the variant leaves). The maths pass had it after Beat. Lean:
   first; say if the board then nags.
