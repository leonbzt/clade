# Research digest (part 1)

Written 5 Nov from the seven research files. All AI findings; nothing here is *decided*. **Caveat for every track:** the
shared web-fetch budget (about 100 pages an hour) ran out mid-pass in all seven, so several primary sources are unread and
some lines are marked unverified ([K], [mem], [unverified], **unread**) in their files. Treat those as "check before it ships".

## What matters most
1. **Gaps you can play pull; waiting doesn't** ([R1](../research/pull-and-filling.md)). No source credits "see what changed" as a
   reason to return. Rain World, Desktop Dungeons, Path of Achra, Mewgenics pull with named, playable options (a slugcat, a
   class). Grids turn into chores when a slot needs RNG luck or a count-grind (OSRS drops, Melvor mastery) or upkeep before play.
   This matches playtest 08 exactly.
2. **Playing the predator is untested design, not researched fact** ([R4](../research/predators-and-ghosts.md)). No postmortem on
   grid play as the hunter. What's solid: readable hunters have few rules and show intent a turn ahead (Into the Breach, Pac-Man),
   with relief after pressure; the Life's hunt / mark / strike / rest already has this shape. "Your build chases you" works with
   no server: replay your own saved bodies, with a generated fallback (Super Auto Pets).
3. **The garden needs a self-limit, or one winner takes the row** ([R5](../research/garden-models.md)). The cure is negative
   frequency dependence: growth falls as your own share rises, or a kill-the-winner hit by share². It has a closed-form
   equilibrium, so offline catch-up can jump to it. Predator-prey needs a refuge or a predator self-limit, or it crashes.
4. **The Cambrian in the toys is a composite** ([R2](../research/cambrian-world.md)): archaeocyath reefs had gone before the Burgess
   animals lived; Burgess animals were partly swept into deeper water. **22 corrections** to `real:` lines and species, 6
   substantive. Hurdia and Peytoia were probably sediment sifters, not predators; the 16,000-lens eye is *Echidnacaris*, not
   *Anomalocaris*; herbivory was rare (the real base is plankton and detritus); mats were already retreating. No study of
   Cambrian volcanic-island faunas was found.
5. **Eight eras fit, with a chess piece each** ([R3](../research/eras-and-tree.md)): trilobite, nautiloid, eurypterid, placoderm,
   tetrapod, amniote. Reef builders change every era.
6. **Readable creatures: silhouette first, a simpler drawing at map size** ([R6](../research/creature-readability.md)), one palette,
   one non-black outline, one light direction across all parts; a tint by role on the map.
7. **Stay on the web** ([R7](../research/community-and-release.md)). Godot 4 can't export C# to the web and its web export has costs;
   share codes and links are trivial in JS. For about 100 people: an itch.io web build, a small Discord opened once a loop is
   playable, a copy-species code, and a dated same-seed challenge. Evidence for this scale is weak.

## What contradicts the current plan (`docs/design/big-picture.md`, P38)
- **§6 and §7 lead with change and news.** R1 says the open, playable niche should be the garden's headline, not "what changed".
- **§3 "nobody picks a role from a menu".** R1: choosing a class or character is the strongest pull seen. Worth a call: pick a
  role to play, or keep role as a result of what you ate.
- **P38 (a) "replicator growth" doesn't stop a single winner** by itself (it's Lotka–Volterra); it needs a self-limit term (R5).
- **§10 "capped habitats and roles help"** with one winner: a cap limits the total, not the leader's share (R5). The toy's
  `slots: 3` limits the count but is a cliff at rank 4.
- **§4:** `src/sim/garden.ts` has slots per plant layer, not per role; role caps exist only in the toy (R5).
- **§6 "swings":** the toy's swings come from noise and shocks, not from the model (R5).
- **§8 "oxygen does the nudging":** the weakest-constrained driver. Extinction filters and land plants are better era triggers;
  the burrowing-oxygenates-mud story behind §6.5 is questioned (Cribb et al. 2023) (R3).
- **§9 "plants are the baseline":** a Cambrian sea has algae, mats and plankton, no plants (R3).
- **The toy's predators** (Peytoia, Hurdia in mud and basin) need replacing with Anomalocaris-like hunters, Sidneyia or Ottoia (R2).
- **§6.3 "the same body doll" on the map:** sources favour a simpler drawing at map size (R6).
