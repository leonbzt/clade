# Step N3: The screens

**Milestone:** M2, step 10, N3 (from `ROADMAP.md`) · 2 sessions · in `clade/` · Codex builds it, with a breakpoint
after every part (*decided 11 Nov*)
**Question:** Do I know what I own and what I pick next? From *first worm*, play three Lives with no dev bar: after
each, hatch and pick an heir; then, from the map alone, can you say which species are yours, where they live, and
where to go next and why?
**Builds on:** decisions.md, 11 Nov (N3's mutation event and clutch cards bring the choice; the mutation event is
pick one of three; a level gives a point to spend; Codex builds); [whole-game-build.md](../design/whole-game-build.md)
§2 (the trunk), §4 (Enforce steers the clutch), §6 (laws 2, 4), §7 beats 2 and 5, §10;
[whole-game.md](../design/whole-game.md) §4 (variation, inheritance) and §9 (hatching, line XP, home map rows).

## In (parts in order; each part is one commit and a breakpoint)
**Session 1: the rules, tested, no screen.**
- **A. Line XP and points** (`sim/line.ts`, `data/lines.ts`). Port `game/`'s `LINE_RULE` (tier weights, `xpAt`,
  cap 10): a Life gives eggs × its letter's weight. **Points are derived, not saved** (law 2): `(level − 1) − ranks
  spent`. `spend(lineage, part)` raises one part's rank by 1 (cap `RANK_CAP = 3`, the part carried by a species of
  the line): −1 upkeep (lean, as `fitness` reads it, floored at 0) and +1 Enforce cap (N2's rule). Each line has a
  **job**, a line of text per clade in data (worm: "stirs and grazes the floor"); no rule reads it until R7.
- **B. The mutation offer** (`sim/mutation.ts`, `data/mutation.ts`). Once per Life, the first time the body reaches
  size 3, the Life offers **three parts for empty places**, or pass. The pool: parts whose `plans` include the clade,
  not `rare`, place empty. Weights in data: the board (buried nodes → parts that open detritus, the shadow → guard,
  mat nodes → mat feeders) and ×2 for families enforced this Life. The picked part is on at once, outside the growth
  order, and its upkeep counts; picking ends no turn. The Life's result gains `mutation` and `eggsAfter` (eggs laid
  after the pick). Deterministic from the Life's seed.
- **C. The clutch** (`sim/clutch.ts`, `data/clutch.ts`). `rollClutch(result, species, seed) → Card[]`: no cards at
  0 eggs, 2 cards under 10 eggs, else 3. Kinds **gain** (an empty place), **swap** (another part at a filled place),
  **lose** (drop one part), with gain and lose equally likely. Parts of families enforced this Life weigh ×2 per rank
  enforced. If `eggsAfter > 0`, the mutation is a sure gain card, first. `heirBuild(build, card)`.
- **D. Hatching** (`sim/hatch.ts`). `hatch(world, habitat, parent, card | null, eggs, letter)`: no card keeps the
  parent form and founds it (N2's `found`); a card makes a child `Species` (parent = the played one, same line,
  `born` = generation) and founds it instead. A build the line already has reuses that species. The name: the
  changed part's name + the clade ("Bulb worm"), numbered if taken. The line gains its XP. It replaces N2's
  `finish` joint; the sea still sees only plain numbers (law 7).

**Session 2: the screens, on N2's map.**
- **E. Hatching screen** (`ui/Hatch.svelte`, replaces N2's result card). The judgement line and eggs; the cards
  face down, tap to open; each open card shows kind, part, place, effect and upkeep, and the heir's predicted letter
  here (`fitness`). Pick one or **Keep the parent**. Then the XP bar fills ("+1 point" per level). **Back to the map.**
- **F. The mutation in the Life** (`ui/life/`). At the offer, three cards over the board (part, place, effect,
  upkeep) and **Pass**. The HUD marks the picked part.
- **G. Home map.** The game opens on *first worm* with your worm picked; the dev bar moves behind a **dev** toggle.
  Habitats where a species of yours lives get a gold mark. **Targets:** their neighbours where Colonise allows show
  the best letter of your species there and one reason ("needs digging", "mats here"). Other habitats show only their
  name and no letter (the light fog). The habitat card lists your species here with letters, and **Colonise** from a
  neighbour picks which of yours to send. Labels never overlap: the smaller habitat's label hides (`ideas.md`, 10 Nov).
- **H. Line view** (`ui/Line.svelte`, from the map bar). Name, level, XP bar, points, job; the line's species as a
  small family tree (parent → child, where each lives, its best letter); the parts the line has carried with their
  rank and **+1 rank** while a point is left.
- **I. The tree** (`ui/Tree.svelte`, SVG, from the map bar). The clades from `data/clades.ts`: a faded trunk down to
  *First cell*, old life (mats, algae, sponges, jellies; names in data, no rules) as faded side branches, the worm lit
  with its level, its children as silhouettes with a hint ("sclerite + proboscis · 1 of 2 carried"). Tap a lit node:
  its line view. Nodes are shapes and names; creature art is L1.

## Not in this step
Gene steps (size, gut), banked clutches, names earned by holding a slot: R5. Rare gate cards, new lines, the root's
class pick: R6. Wild branches, displace and adopt, Adapt and Challenge, hunters from the sea: N4. XP from slots held
while away, saving, onboarding text: step A. The job as a rule: R7. Keeping a mutant aside to found elsewhere, a
species' own growth order: `ideas.md`. **Levels as an evolution tree** (verbs, special abilities, part upgrades;
you, 11 Nov): `ideas.md`, R5 or later. Creature art on cards and tree nodes: L1.

## Done when
- [ ] **Play question** (`/clade/`): three Lives from *first worm* with the dev bar closed; hatch after each; say from
  the map which species are yours, where they live and where to go next and why.
- [ ] A few tests: the offer comes once, at size 3, only for empty places, and the same seed gives the same three;
  the clutch is deterministic, has no cards at 0 eggs and leads with the mutation when eggs came after it; keeping
  the parent founds the parent, a card founds a child with `parent` set; points = level − 1 − ranks spent, and
  `spend` stops at the cap and at 0 points; law 2 (no letter, slot or point in `World`).
- [ ] `npm run check` passes in under 10 s; one phone-size look run (`npm run look -- /clade/`).
- [ ] Your notes are in `docs/playtests/n3-the-screens.md`.

## Size check
- **New systems:** one, the clutch and its heir (the mutation offer is its in-Life half). No new record, stock, stat
  or gene: points are derived; the Life's result gains two fields and stays unsaved.
- **If it slips:** I (the tree) goes first, then the label rule, then the payback lines on cards.

## Open questions
None. Answered 11 Nov: pick one of three, a point per level, Codex with breakpoints.

## Build brief (Codex)
Branch `n3-the-screens` from `main` after N2 is merged (or from `n2-the-life` if the merge waits). Read `AGENTS.md`,
`docs/status.md`, this spec, and `whole-game-build.md` §6 and §10. Port from `game/src` by copying (`sim/clutch.ts`,
`sim/lineage.ts`'s level maths, `ui/Hatch.svelte`, `ui/LineView.svelte`, `ui/Tree.svelte`, `ui/XpBar.svelte` as
starting points), never importing `game/`. Files under ~400 lines; data holds no logic.
**Breakpoints, because the session limit is low:** do the parts in order, A to I. After each part: `npm run check`
passes, one commit **"N3 X: …"**, and one line appended under `## N3 progress` in `docs/status.md` ("X done: what
landed; next: Y"). If the limit hits mid-part, leave the work uncommitted and write that line with what is left; the
next session (Codex or Claude) starts from `git status` and that line. If a part needs a call this spec doesn't make,
or a new record, stock, stat or screen, stop and write the question there. Don't rebalance ported numbers.
