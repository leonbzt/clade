# The whole game: the build brief

10 Nov 2026. Written by Claude (Fable) after the user's two rounds of answers. The why is in
[whole-game.md](whole-game.md); this file is the how. A build session needs this file and its step spec, nothing else
by default. *Decided* items carry their date; everything else is a *proposal* until the user says so.

## 0. How to work
- **First session (clerical, no code):** re-cut `ROADMAP.md` from step 7 using §8 (the user approved the route on
  10 Nov; show them the diff first); rewrite `docs/status.md`; mark slice 23's spec as re-cut (its parts land in N4,
  R5, R7 and R8); propose the `CLAUDE.md` wording for the new folder. Then spec N0.
- **Every build session:** one step, one spec, one play question, and a "not in this step" list. End with a
  screenshot sheet and three lines of status, not a review round.
- **Fable again only once:** after the user's notes on the N4 play test.

## 1. Decided on 10 Nov (the user)
- **Rebuild the core in a fresh folder** and port what play has tuned. Today's `game/` stays playable until the new
  game passes the play test after N4.
- **Only opened lineages live in the sea.** Wild branches of your own species fill open slots. A thin early game is
  fine "if there are fast unlocks"; the "earlygame needs good onboarding".
- **The body just grows** in a Life. **Enforce** replaces picking a part at each moult; at most one mutation event
  per Life. The early-food and late-egg decisions the user liked must survive (§4).
- Also asked for: the sea's structure rethought, keeping the base (§3); the drawing rethought (§5); itch (§9).

## 2. The start: a worm with a past
**Call: begin the release at the worm, but make the worm a node with a parent.**
- **In the grand scheme the root is the first cell.** Sponges, jellies, algae, plants, fungi and bacteria descend
  from no worm, so a worm root can never reach "all branches".
- **The worm is still the right place to begin playing.** The Cambrian explosion was a stock of small worms radiating
  into a world that older life had already furnished. That is the release, and it is true: the explosion, played.
- **The game is chapters, and each chapter is one founder radiating into an open world.** Chapter 1 (the release):
  the worm in the Cambrian sea. Later: the shore (algae become plants, arthropods follow) and a prologue (the first
  cell: mats, the eukaryote made by a bond). The same loop at the largest scale, barren to lush every time.
- **Old life and new life.** In the release sea the mats, algae, sponges and jellies are *old life*: older branches of
  the same trunk, wild, the baseline (the user: plants "should be the baseline"). Everything that descends from your
  worm is *new life*. So "everything descends from your first worm" (whole-game §12) means every animal you can play.
- **What it costs now:** two fields (`parent`, `chapter`) and one drawing: the tree shows a faded trunk running from
  the worm down to "the first cell", with the old-life branches as silhouettes. Nothing else is built.
- **Why not start earlier now:** the proven fun is the animal Life. A cell has no eggs, no drawings and no board of
  its own, so it is a new verb, and no new verb should come before the first release. If the prologue later plays
  well it can become the new player's start, because chapters are data.
- The onboarding gain of "start as the simplest thing" is kept: the root worm is a gut with a mouth and nothing else.
- *Idea:* the first threats are old life (stinging anemones and jellies were there first), so no hunter is needed
  before you evolve one.

## 3. The sea
Keep the base: the island, a shallow sea, stocks and populations, generations, shocks. Change the geometry and add
capacity. This is not v1's tile simulation: tiles are ground and paint, never rules.

| Layer | What it is | Changes | Its job |
|---|---|---|---|
| **Ground** | a tile grid around the island; each sea tile has a depth band (tide flat, shallows, slope, deep edge), a substrate (sand, mud, rock, later reef) and an exposure (sheltered, open) | rarely: eruption, river mud, reef growth, burrowing | what a place is; the map you look at |
| **Habitats** | connected tiles of one kind, found by flood fill; each has a name, an area and neighbours | when the ground under them changes | the sim's unit; the board of slots |
| **Populations** | stocks and species counts per habitat | every generation | the rules |
| **Living paint** | sprites sampled from the populations, wandering their habitat by simple steering; mats and reef painted over tiles in proportion to stocks | every frame, view only | "it feels alive"; the rules never read it |

- **Depth × substrate × exposure** is how real sea floors are classed, and the island gives the causes: river mouths
  lay mud, lava flows lay rock, the lee side is sheltered. About 10–16 habitats with irregular neighbours, so the map
  is no longer a ring. The shelf is wide and fills the screen; unvisited habitats are fogged (discovery).
- **Area matters.** A stock's ceiling scales with area: big habitats are steady, small ones fragile and quick to take.
- **Slots** per habitat: one per food present and way of eating it. A slot's capacity is the food it yields.
- **Engineering repaints tiles**, so habitats and slots emerge: reef grows on rock where filterers thrive; burrowers
  turn mat-bound sand into stirred mud (the real Cambrian substrate revolution); the volcano lays new rock.
- **The Life board is a zoom into one tile:** generated from the habitat's kind, stocks, residents and features. The
  same habitat state and seed give the same board.
- **The sea step,** per habitat and generation: (1) *regrow* stocks toward their ceiling; (2) *eat*: when food is
  short, split it by population × fitness; (3) *breed and die*: eaten × brood ÷ upkeep, less base deaths; (4) *hunt*:
  the commonest prey most, and only the prey above a refuge per tile (sand 0.15 g, mud 0.30, rock 0.45); (5) *spread*:
  only your species, only into a cell you have won (`World.claimed`), where the newcomer would grow at today's food, by
  border length; (6) *bars*: an open cell in a habitat you live in waits 36 generations (`World.bars`), then a wild
  cousin within two legal changes of a species living there takes it, B at most; no dice (*built 15 Nov, the N4 fix;
  numbers tuned by play*); (7) *engineer*; (8) *news*: for any change over about 30%, name the largest term.
- **Swings:** the lag between a food and its eaters gives one overshoot, then the sea settles (measured, N1). Lasting
  swings wait for N4's hunters (*decided 11 Nov*); seasons are parked.
- **Cost:** 16 habitats × 8 species × 160 generations is milliseconds. v1's island generator and habitat finder may be
  ported (`CLAUDE.md` rule 8 allows it when a spec carries them).

## 4. The Life's economy
The user liked "boosting food early in life and egg production later". That is an engine-building arc, and it becomes
the spine of the Life instead of a side effect of part picks.
- **Surplus food has three uses:** *Grow* (the moult: bigger, planned parts switch on), *Enforce*, *Lay*.
- **Every part belongs to one family with one Enforce effect:** *Feed* (more from one food kind), *Guard* (a strike
  or hazard hurts less), *Brood* (more eggs per food). Three colours on the Body screen.
- **Enforce pays every turn for the rest of the Life.** So early Feed is an investment, late Brood is the cash-out,
  and Guard answers this board's hunter. The button says when it pays back ("pays back in 4 turns").
- **Each Enforce costs more than the last,** and a part goes at most one rank above the line's permanent rank.
- **The arc the player feels:** feed up, then grow and guard, then brood. Juvenile, adult, parent.
- **It steers the clutch:** the families you enforced come up more often in the cards.
- *Idea:* **Shed** a part for this Life to save upkeep; it marks "lose this part" in the clutch.
- **The fail test:** if the same Enforce order wins on every board, the boards are not asking different things.

## 5. The look contract
**The method: a creature is data (a plan plus stamps), every adaptation has a fixed visual channel, and coherence is
held by tests and one contact sheet, not by taste in the moment.** A coding model cannot judge a picture well, but it
can follow a grammar and pass a check; the user's eye is spent on one sheet per session.

1. **The grammar.** A *plan* per clade: a spine (segment count, width profile, gait) with six sockets along it. A
   *stamp* per part: a small pixel glyph written as text in the data, with palette letters and a repeat rule for
   serial parts (legs, bristles, plates repeat per segment, as in life). Any part composes with any body, with no
   art per pair. The AI writes and diffs stamps; the user can fix one by hand in seconds:
   ```
   spine_long: [ "..a..",      a = armour light, b = armour dark
                 "..a..",
                 ".bab." ]     repeat: every segment, socket: back
   ```
2. **One channel per thing the player must read.**

   | Read this | From this | Rule |
   |---|---|---|
   | Which line | silhouette, gait, base hue | every plan passes the silhouette test |
   | How it feeds | the front, one accent colour | green grazer, brown burrower, red hunter, blue filterer |
   | Defence | outline and back | soft: thin same-hue outline; shell: dark outline and a shine pixel; spines break the outline |
   | Senses | the eye highlight | the brightest pixel on the body; none means blind |
   | Speed | limbs and tail | count and length; fins and flaps |
   | Size (gene) | sprite scale | 12, 16, 20 or 24 px |
   | Rank, Enforce | the part itself | +1 px and brighter; pulses while enforced |
   | Yours or wild | saturation and a gold tag | wild is slightly greyed |

   A player can then read a stranger's build from its picture: thick outline, no eye, many legs, red accent.
3. **Real life by numbers.** A *look sheet* per clade and per real species, written by the researcher agent with
   sources: counts, ratios, what attaches where ("seven pairs of back spines as long as the body is tall"). The
   numbers go into the plan. **Counts, proportions and attachments are real; colour is the game's** (Cambrian colours
   are almost all unknown). Cards say "reconstruction".
4. **Coherence rules.** One palette of about 32 colours in ramps, used by index only. One light, top-left, three tones
   through one shading function. One pixel grid: integer scales only, sprites mirrored or redrawn, never rotated.
   Ground is muted, creatures are saturated. Red is reserved for danger, gold for yours.
5. **Three sizes from one build:** a map icon (8–12 px: silhouette, hue, accent), the board sprite, and the portrait,
   which is the board sprite at an integer scale.
6. **Motion.** A gait is a function on the spine (worm wave, arthropod scuttle, flap swim). At 16 px, motion tells
   clades apart as much as shape does.
7. **Checks the builder runs.** (a) `npm run look` makes one contact sheet: every clade × three builds × three sizes
   on a board background, and the same sheet as black silhouettes. (b) Two clades' silhouettes overlap less than a set
   share. (c) No colour literal outside the palette file. (d) Every part changes a minimum number of pixels: an
   adaptation you cannot see does not ship.
8. **How the user steers:** mark the sheet ("legs too thin", "reads as a slug") and edit stamps directly.

**When:** the palette file and reserved colours from N0, so new screens are born coherent. The grammar is step L1,
after the N4 play test and before any new lineage is drawn.

## 6. Contracts
A sketch: names may change, the shape may not without the user's call.
```ts
interface Clade   { id; parent: Id | null; chapter: number; gate: PartId[]; plan: PlanId; mechanic: Id; endpoint?: Recipe; debated?: boolean }
interface Part    { id; place: Place; pool: 'shared' | CladeId; family: 'feed' | 'guard' | 'brood' | 'move' | 'sense';
                    upkeep: number; opens?: Food[]; defence?: DefenceKind; beats?: DefenceKind[]; verb?: VerbId; stamp: StampId }
interface Build   { clade: CladeId; parts: Partial<Record<Place, PartId>>; genes: { size: number; gut: number } }
interface Species { id; lineage: LineageId | null /* null = wild */; parent: SpeciesId | null; build: Build; name: string; born: number }
interface Habitat { id; kind: HabitatKind; area: number; neighbours: Id[]; stocks: Record<Food, number>; pops: Record<SpeciesId, number> }
interface Lineage { id; clade: CladeId; xp: number; ranks: Record<PartId, number>; job: JobId }
stats(build, ranks)   → { bite, thrift, defence, speed, senses, brood }            // derived
slots(habitat, world) → Slot[]                                                    // derived: food × way of eating it
fitness(build, ranks, slot, habitat, world) → { intake, upkeep, survival, value, letter, reasons: [string, string, string] }  // pure
```
**The one curve** (numbers by feel, in data, each with a comment naming its term):
```
intake   = sum over the slot's foods of reach(food) × share of stock     reach is 0 when the food is locked for this build
upkeep   = base(size) + part upkeeps − lean ranks
survival = product over hunters and hazards here of 1 − threat × (1 − guard)
value    = intake ÷ upkeep × survival × brood        letter = value at full food on a ×1.5 ladder from break-even (D)
```
*Changed 12 Nov (decided):* from N5 the letter is this build's value ÷ the best known build's value for that slot in
that habitat, on the same ×1.5 steps (S from 0.8). See [maths-pass.md](maths-pass.md) Q0 and Q1.
**Laws, kept as tests:**
1. Only `fitness` makes a tier letter. The sea, the preview, the tier card and the Life's richness all call it.
2. Nothing derived is saved: no role, slot, tier or link in a save file.
3. Monotone: more upkeep never raises fitness; a food removed drives its eaters down; a hunter added lowers its
   prey's survival term.
4. Every wild species has a parent species. Every clade but the root has a parent.
5. Budgets as a data test: at most 6 stats, 10 genes, 4 stocks.
6. Speed: 160 generations in under 100 ms; `npm run check` under 10 s.
7. `sim` imports nothing from view or ui. The sea never imports the Life: a verb module takes a board and a build and
   returns eggs and witnessed events.
8. The Life board is a pure function of habitat state and seed.
9. Colours by palette index only; integer scales only. Files under 400 lines.

## 7. The first fifteen minutes
One new thing per Life; no text before it is needed; two lines at most per beat.
1. **No menu.** You are a soft worm on a mat-covered board. One verb (graze). A short Life: eat, grow, lay.
2. **Hatching:** two cards. Then the map: "your worm holds the grazer slot in the Lee shallows: tier C", with the
   three reasons.
3. **Life 2:** Enforce appears (Feed first). An old-life threat appears.
4. **Life 3:** a neighbour with buried food: "needs digging". The first locked reward teaches adapting.
5. **About 8 minutes:** the first gate. The tree opens for the first time: the faded trunk below, the branches above.
6. **About 12 minutes:** a wild branch takes a slot you left open; the first patch note in tier talk. Displace or
   adopt.
7. **Leaving and coming back:** patch notes and a banked clutch.

## 8. Build order
**From N4 on, the order and several rules changed on 12 Nov:** read [maths-pass.md](maths-pass.md) (its summary and Q0's
step table) with this section. Letters now rank against the meta, the sea waits for the player, and the steps after N4
are N4 fix, N5 The board, N6 The line, N7 The other lines, L1.

| Step | What | Sessions |
|---|---|---|
| **N0** | The ground: terrain kinds, the habitat finder, names, a bare zoomable map, the palette file | 1 |
| **N1** | The core: §6's records, `fitness`, slots, the sea step, tier cards, the placement preview, dev presets | 2 |
| **N2** | The Life, ported, with Grow, Enforce and Lay; a purpose per Life; eggs found a population | 2 |
| **N3** | The screens: home map, hatching, the line view, the tree with its trunk | 2 |
| **N4** | Who eats whom; wild branches; displace and adopt; patch notes with a cause | 2 |
| | **Play N0–N4 as a whole. Closed test (§9).** | |
| **L1** | The look contract in code: plans, stamps, channels, the contact sheet | 1–2 |
| **R5, R6** | Genes and variants, banked clutches; gates from real traits | 2–3 |
| **A** | The alpha pass: §7's onboarding, saving, a light UI pass. **Public alpha (§9).** | 2–3 |
| **R7–R9** | Sea features and engineering; lineages to 6–8; the shore. Each a public update | 4–6 |
| **R10, R11** | Art and UI polish; the release | 3–4 |

**Port list** (from file names and sizes only; verify before moving). *As they are:* the Life engine, hunter,
threats, verbs, body, grid, rng and island files in `sim`; `data/life` and `data/body`; the floor, camera, effects
and tween files in `view`; their tests. *Port, then rework in L1:* the creature drawing (`view/body*`, `shade`,
`textures`, `data/body-look`). *Write fresh:* the sea, lineage, plan and save files, `data/sea`, `data/lineages`,
all of `ui`, the map view, `main`. *Drop:* buds, plans as a second record, the egg-to-tier table, "new ground 50%".
*Check first:* `sim/garden`, `data/garden`, `sim/door` (I could not tell their job from the name).

## 9. Itch
Feedback is worth most when it can still change the design and least when you already know the answer. A stranger on
itch gives a prototype one visit, so the public page should wait until the game can use that visit.
- **Closed test, right after N4** (about 9 sessions in). An unlisted itch page (a draft link or a password) for three
  to five Discord people. Watch one or two of them play. One question: does a stranger know what is theirs and what
  to do next, without help? No polish needed.
- **Public alpha, after step A** (about 15 sessions in), marked as a prototype. Three conditions: it saves and
  catches up offline; the onboarding carries a stranger through three Lives to a held slot; there is about an hour of
  content with a visible next goal (a second and third lineage).
- **Do not wait** for the map features, eight lineages or the shore. Those are better chosen with the feedback, and
  each one is then a devlog and a reason for players to come back.
- **Ask three things on the end screen:** What did you think was yours? What did you want to do next? Where did you
  stop, and why?

## 10. Where build sessions drift
These come from this repo's own history (the brief, §1 and §11), not from a benchmark.
- **Inheriting the last shape.** If today's `game/` and this file disagree, this file wins. If this file and play
  disagree, the user decides.
- **Adding instead of cutting.** A step that seems to need a new record, stock, stat or screen stops and writes one
  line in `docs/ideas.md`.
- **Re-deriving what play tuned.** Port the Life's numbers; do not rebalance them during the port.
- **Options where a call exists.** No option lists in a spec for anything this file settles.
- **Taste by guesswork.** Looks and the patch-note voice follow §5 and examples, and the user marks the sheet.
- **Spec and review overhead.** One spec per step, no review round per part; the play question is the review.
