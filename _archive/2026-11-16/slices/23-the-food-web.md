# Slice 23: The food web

> **Re-cut, 10 Nov: do not build this spec.** The core is rebuilt in `clade/` (ROADMAP steps 7–17, build brief
> [§8](../design/whole-game-build.md)). Its parts land elsewhere: A (who eats whom) in N4; B (genes and variants) in
> R5; C (wild branches) in N4 and its features in R7; D (lineages) in R8. Part 0 is moot: from N0, `npm run check`
> covers only `clade/`. Kept as a source for those steps' specs.

**Milestone:** M2, old step 7 (re-cut 10 Nov)
**Question:** Does the sea become a food web you adapt to? Algae feed grazers and grazers feed hunters, by simple rules.
Variants emerge where the sea selects them. Each of 10 lineages starts a branch.
**Builds on:** decisions.md: 6 Nov (algae as a living food layer; may pass the 4 stocks), 7 Nov (an empty map; every animal
is a lineage), 9 Nov (P49 drift, P50 A features, and slice 23 rounds 1–2: genes, the rules for who eats whom, the roster,
sessile features, wild branches as a lean). full-version.md §5 and §7.
**Today (code):**
- Each patch has one food stock (mats), plus rot and oxygen.
- There are 12 sea species: 4 bodies × 3 roles.
- Hunters (arms or spikes) eat every non-hunter.
- Fit is set by releases and never changes after that.
- The hungry cross borders, so populations sort themselves by numbers. Nothing inside them drifts.

**Before building** *(proposal)*: the whole-game pass (9 Nov) may change parts B–D. Parts 0 and A hold either way.

## In (parts in order)
- **0. Check time.** Trim the slowest tests, so `npm run check` drops back to about 8 s.
- **A. Algae and who eats whom.** Three algae stocks:
  - microbial mats (sand and mud; burrowers churn them up)
  - plankton bloom (in the water, fed by rot; booms and crashes)
  - crust and seaweed (rock; slow; grows toward reefs)

  Parts decide which algae a body can reach: rake → mats, tentacles or filter → bloom, claw → crust.

  One rule replaces the layers: an animal eats another if it has a hunting tool, its gut leans to meat, and the prey is
  smaller than it. It takes the commonest prey most. Until part B adds the gene, size comes from the body plan.

  Each patch card shows its strongest food links, and the news says when a link appears or breaks.
- **B. Genes and variants.** Parts are tools: they give verbs, cost upkeep, and you pick them in a Life. Genes are body
  settings: they give no verbs, and the sea selects them. Two genes come first:
  - Size (HP): eaten less and takes bigger prey, but needs more food and has fewer young.
  - Gut: leans plant ↔ meat.

  Your Life sets the starting values: the size you laid at, and what you ate. How variants arise:
  - A big population now and then buds a few mutants, each one gene step away. The four sea rules decide which survive.
  - Each line holds at most 3 variants.
  - A variant that holds a patch for about 10 generations gets a name, and a headline gives the cause.
  - You launch from a patch as its local variant.

  Words: variant (genes differ) < species (parts differ) < clade. A guild is what an animal does. A lineage is your line.
- **C. Wild branches and features** (lean b). Opening a lineage lets wild populations of it appear. Sessile life appears as
  features when its clade opens:
  - sponges from the start
  - tube worms with the bristle worm
  - brachiopod beds with the hyolith
  - reefs from sponges plus crust
  - eocrinoids later

  P50's events come too: an algal meadow, a carcass fall, and a vent with sulfur mats. Each feature or event is one data
  row (what it needs, its chance, how long it lasts, its effect on stocks, its tiles), with a map icon and a headline that
  gives its cause. Before this part, the researcher checks the Cambrian versions and the tree.
- **D. Lineages, 4 → 10.** Each new one starts a branch:
  - Bristle worm: the first recipe; starts the growers.
  - Wiwaxia: molluscs.
  - Hyolith: a filter feeder. Plankton drifts across the board, and you shut your lid when a hunter comes.
  - Lobopod: legs; comes before the arthropod.
  - Opabinia: a swimming hunter; comes before Anomalocaris.
  - Marrella: small, fast prey.

  Each needs its body data, its look, one move, a recipe built from real traits, and its sea species. D also includes a
  save migration and a tree screen that fits 10 lineages on a phone.

## Out
- Pace and other genes (Colour, Brain, Dispersal), until B has been played (ideas.md).
- The lineage run: what's yours and what it gives you, parallel lines, character slots. These go to the whole-game pass.
- Stretch: the arrow worm, Hurdia and Cambroraster · step 8: the shore crawler, Pikaia as a hint at vertebrates · later eras:
  Mollisonia, Canadaspis, cnidarians, jellies, coral reefs.
- Playable sessile Lives, rare layouts (P50 B), seasons, a less linear map, tracking use per Life (ideas.md).
- Drawn hunts and generation cards (step 9) · balance (step 10).

## Done when
- [ ] The map shows algae, features and wild branches. A patch card shows its food links, its variants and their genes.
- [ ] A Life launched from a patch starts as the local variant, and a mid-size hunter gets eaten by a bigger one.
- [ ] 10 lineages, each with its own move and look, and you can tell yours apart on the map.
- [ ] 8 h catch-up still takes about 5 s, and `npm run check` passes in under 10 s.
- [ ] Your notes are in `docs/playtests/23-the-food-web.md` (play after B, and again after D).

## Size check
- **New systems:** algae (6 Nov), genes and variants (9 Nov), features and wild branches (9 Nov). Lineages are content.
  About 8 sessions.
- **Budgets:** 5 stocks (algae passes the 4, your pick); 2 of the 10 genes.
- **Sim structure:** yes. `sea.ts` splits into algae, eating, variants and features. Species slots go from 12 to about 90
  (10 lineages × 3 roles × 3 variants), so saves need migrating. The step needs measuring (0.3–0.6 ms today at 12).
- **If it slips:** cut Opabinia, then the bristle worm, then the algae down to two kinds.

## Open questions
1. Should the build wait for the whole-game pass? (AI lean: build 0 and A now, B–D after it.)
2. Should Gut replace the role (grazer, burrower or hunter) in a species' identity, so the guild is read from gut and tools?
   (AI lean: yes, in part B.)
