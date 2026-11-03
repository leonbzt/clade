# Decisions log

Your calls, dated, in your words where possible. Only explicit calls; AI proposals never go here. v1's log
(25 Oct – 2 Nov) is in `_v1/docs/decisions.md`; its lasting tastes are in [tastes.md](tastes.md).

## 2 Nov, the rebuild direction (after the v1 review)
- **"I'm unsatisfied with the current trajectory":** the project is blowing up, sessions are long from sim runs and
  tests, the vision drifts, several parts are half-baked. Review and plan: [design/rebuild.md](design/rebuild.md).
- **The plan: "I love your reply in general and the new plan."** Breed a line in a run, release it into an idle
  garden, a tier list of builds. Stays idle/incremental.
- **Tier list: niches × tiers, "maybe some light ladder or ladder feeling".**
- **Sim: "I definitely want to check out the patch model"**; keep getting the habitats in detail.
- **Genetics: "love the genetics split with the body determining stats"** (genome → body → stats → niche).
- **Run: "side view grow run is cool for a start".**
- **Rebuild: "sounds fine".**

## 2 Nov, after the research and the sim check
- **Toy first**, then the spec.
- **Commit v1 and move it to `_v1/`** (done: commit `ecaff4f` on `slice-11e`, branch `v2`).
- **The spec replaces the vision; AI drafts a new roadmap.** "Some of my ideas and tastes and vision should still be
  saved somewhere" → [tastes.md](tastes.md).
- **Likes:** the side view and "the feeling you grow everything"; Hatched's staged assembly. "I like the new ideas
  and inputs."
- **A critical review of all collected ideas first** → [ideas.md](ideas.md) (the verdicts are AI's).

## 2 Nov, the roadmap and the ideas review
- **Roadmap draft approved** ("roadmap confirmed").
- **Ideas review: the drops confirmed.** The rest of the verdicts stay AI's.
- **A short spec for the toy** before building it.
- **The toy's verb: not aimed shots** ("it would feel really copied"). **Buds and pruning above ground, mixed with
  hidden soil below (Minesweeper-like), with a switch to turn the verbs off.** "A game-like mechanic similar to this,
  also not required." Spec: [slices/00-grow-toy.md](slices/00-grow-toy.md).
- **The toy spec's open questions:** seeds land at different spots: **in**. Nutrient as the only currency **for the
  verbs**: **yes**. (The first build read this as the only stock, without the spec; corrected below.)

## 2 Nov, after playing the first build ([playtests/00-grow-toy.md](playtests/00-grow-toy.md))
- **Rebuild the toy to match the spec**, from a fresh start. "Fun in principle"; managing growth and roots and
  directing the plant "is something I can imagine going forward with".
- **Generations are too short** → longer seasons.
- **The habitat is shaped by its neighbours and its habitat type** → added to the toy spec.

## 3 Nov, after playtest 2 and P36 ([playtests/00-grow-toy.md](playtests/00-grow-toy.md))
- **"I like the planned rebuild."** Next: a second toy pass, then the calls go into the spec.
- **Plants must feel different: "moss vs herb vs tree should all play different."** Maybe more kingdoms and species.
- **Zoom layers (P36.1):** M1 builds only the side view and the island; later milestones each open a layer.
- **Area (P36.2):** "maybe more complex calculation with biomass and so on, but display as a clear goal."
- **Skills (P36.3):** "active skills, 'shell cracking', 'efficient photosynthesis'… like unlockable perks or ways
  of life." Not OSRS levels; the keys and doors (parts) shown as skills.
- **Toy pass 2: add the tree beside the herb.** **Moss is in M1.** The plant-model research is good
  ([research/plant-models.md](research/plant-models.md)); breeding with dominance is interesting.
- **Slice 00b approved:** the tree runs 8 seasons of 60 s; a good herb season earns a 4th seed.

## 3 Nov, after playtest 3 ([playtests/00-grow-toy.md](playtests/00-grow-toy.md))
- **The toy is done: "I want to go on to the next phase now to see the vision."** → M0 step 2, the spec.
- Kept from toy pass 2 (you liked them): the tree's look, the spring leaves, cutting during winter. Herb and tree
  "play differently".
