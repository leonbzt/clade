# Slice 18: the body toy

**Milestone:** M2, step 3 (from `ROADMAP.md`)
**Question:** Is the creature I built the one I see, and does it still feel like mine when it becomes a new lineage?
**Builds on:** "the animal or creature you see and build is qctually the one drawn fells important, and also see your impact"; "generalized bodys and creation"; "like running an arthropods
with claws and 10 legs, it would be a crab, and become a base crab" (decisions.md, 6 Nov); [full-version.md](../design/full-version.md) §3–5; [R6's drawing checklist](../research/creature-readability.md).

## In
A throwaway page, `toys/creature.html`, with no rules and no Life: only bodies, built and watched. Nothing goes into `game/` yet; it may import the drawing helpers from `game/src/view/shade.ts`. All numbers are *proposal*.

- **One general body.** A spine of segments with data for length, stiffness, width along the body, and head and shell shape. A gait is one small function: ripple, legs, flaps, creep. One draw path for all.
- **Six lineages as data:** Worm, Bristle worm, Wiwaxia, Arthropod, Trilobite, Anomalocaris. Today's hand-written worm, arthropod and swimmer stand beside them for comparison.
- **About 10 parts on slots,** on any base with that slot kind: claw, eye, leg, spine, plate, gill, bristles, tentacles, flap, tail fan. Each one changes the outline, and all of them scale across sizes 1–5.
- **The screen.**
  - A big drawing with its slots showing. Tap a slot, pick a part, and the creature changes at once. A size slider runs 1–5.
  - The same creature at board size, walking a small strip of real tiles after your taps.
  - The same creature at map size, in a simpler form: its body and one signature part.
  - A one-colour switch for the silhouette test.
- **Recipes.** Four, authored, made of body parts: Arthropod + head claws + many legs → a crab-like Cambrian crusher · Arthropod + plates + enrolment → Trilobite · Worm + legs + spines → Lobopod · Bristle worm + scales + spines → Wiwaxia. The toy's arthropod gets enough side slots for this; today's game has only 4.
  - A hint shows how close you are, and your build should already look close to the new animal. A "Become" button stands in for playing well.
  - A new lineage is a fresh start that feels like a "branded" upgrade (6 Nov): a short staged change to a cleaner, stronger version of what you built.
  - **A switch for how parts go in:** integrated (drawn in, no slot) · default start (a removable part it begins with) · one integrated, the rest default. Other parts go to a list.
  - A small family-tree card: parent and child side by side, the new name such as "Rockplate", and "Gained: …".
- **Cost shown:** data lines per lineage, code lines per gait, and draw time with 50 creatures on screen.

## Out
- Parts doing anything, move rules, verbs, the body screen in the game, lineage records in the sim: steps 4–5.
- Lineage XP, the tree screens, real recipe conditions, rare genes, hatching: step 6.
- The other lineages and algae: step 7.
- The hunt or other interactions playing out on the map: `ideas.md`, step 9 at the earliest.
- Anchored bodies (brachiopod, sponge), shells with a jet: `ideas.md`, after release.
- Pixelated creatures, hand-drawn bases: `ideas.md`, if code-drawn bodies fall short.
- Planted feet: only if cheap inside the legs gait; otherwise `ideas.md`.

## Done when
- [ ] In play: you build two different creatures on one base and can tell them apart at board size and in one colour, saying "that's the one I built".
- [ ] The six lineages come from one body and one draw path, and you judge them against today's drawings: as good or better, or say what's missing.
- [ ] You make the crusher and a trilobite from your own builds. Each looks like a real new animal and an upgrade of what you built, and you pick a way for parts to go in.
- [x] You add no drawing code for a new lineage: Lobopod and the crusher come from data alone, or the report says what code they needed.
- [x] A verdict on the drawing side of 6–10 or about 15 lineages. Rules are priced later (full-version.md §6).
- [x] A model test, `game/tests/creature.test.ts`, in under 1 s: every part on every allowed slot at every size draws without error; recipes match; all three ways of putting parts in lose no parts.
- [x] `npm run check` passes. A toy column in `docs/design/tradeoffs.md`.
- [x] Your playtest notes are in `docs/playtests/18-body-toy.md`.

## Size check
- New systems: one, the general body. If the answer is yes, it replaces the per-animal view classes at step 5. No new stock, stat or gene.
- Touches sim structure? No, `game/` is untouched. Part names are copied, not linked.
- Fits one or two sessions; the drawing quality is the unknown. Order: spine and three gaits first, then parts, then recipes, with a look at each. If it runs long, recipes become part b.

**Risks.** A single spine may look blander than today's hand-written animals; side-by-side comparison shows this at once, and the fallback is a few separate rigs. Many parts may turn to mush at board size, so board size may need fewer drawn parts, as R6's checklist suggests.

## Answered (6 Nov)
- A crab-like Cambrian crusher now, real crabs later: "crab similar thing would be cute, cambrian crusher later crabs would be cool."
- Recipes name their parts, authored: "recipe naming parts to fuse is cool"; "i think authered is easierst mainly." Overarching rules are parked in `ideas.md`.

## Open questions (three at most)
1. How parts go into the new base: integrated, default start, or a mix. You're "not sure", so the toy's switch lets you feel it. AI's lean: one integrated, the rest default start.

## Built (6 Nov), played the same day
Your verdict: "the core would work", with the slot model and style still weird. Next: [body-approach.md](../design/body-approach.md), P46.

Measured; the three other "Done when" items are yours. Names and numbers are *proposals*.

- **Cost:** 6–8 data lines a lineage, 5 code lines a gait, 442 shared lines (body 234, parts 206). Today's classes: 80–195 lines each.
- **New lineages:** Lobopod and Crusher needed no code. A test fails if the drawing code ever names an animal.
- **Draw time, the same 50 animals, one headless software-GL run on this machine:** new 8.2–8.9 ms of commands and 16.5–17.7 ms for the whole frame; today 5.1–5.6 and 11.0–11.5. So about 1.6× today. Loaded with parts: 11.2 and 21.6. Nothing is optimised, and no real GPU or phone was measured.
- **Tests:** 10 pass in about 0.5 s. `npm run check` takes 9.7 s, close to the 10 s budget.
- **Verdict on the drawing side (*proposal*):** about 15 is within reach, with roughly two or three small additions. Three hard cases tried as throwaway records: the hyolith reads from data alone. Opabinia needs a snout part and more than two eyes. Pikaia reads as a lumpy worm, so it needs a smooth skin. Arthropod-like and worm-like entries should stay data; the others on the list are not tried. Rules may still set the limit (full-version.md §6).

**Changes from the spec:** an 11th part, Roll-up tail, because the trilobite recipe needs it. "Scales" are the Plate part. Side slots are mirrored pairs. All slots are open at every size. Added a second switch, for whether your extra parts go to the list or stay on the body.

**Missing:** today's worm dims under mud; the general body doesn't. In one colour, map forms of one lineage look alike, because map size shows one signature part.
