# TierZoo concepts for Clade

*Proposal* (Claude, 8 Nov), for M2 steps 5–6, with some for step 9 and later milestones. It comes from a first-hand read of the wiki
export ([research](../research/tier-zoo.md)). Your reactions are in [decisions](../decisions.md#8-nov-review-of-the-codex-stretch-and-tierzoo);
the open questions are in [P47](../proposals.md). Borrow the genre and the frame, not TierZoo's names or text.

**Is the frame free to use?** Yes. "Life is an MMO called Outside" comes from r/outside, and TierZoo built on that shared joke
too. Copyright protects expression, not ideas, frames or game mechanics, and gamer words (build, nerf, patch, tier, meta) are
generic. What isn't free: the names "TierZoo" and "Outside" as a title or brand, copied wiki or video text (the wiki is
CC BY-SA, and fan posts belong to their authors), the channel's characters and recurring bits, and its art. Not legal
advice; check a title before release.

## The frame
**Clade is the open beta of a game whose devs can't touch builds, only the world.** You pick a build, level it with
evolution points along trait trees, and each patch of the sea ranks it per niche. Volcanoes, oxygen and crashes are the
devs' balance patches, always with a cause.

Why it fits: your tastes already say "builds like game characters", "tier talk is the voice of the game" and
"genome → body → stats → niche". TierZoo's own Cambrian page is the patch where "for the first time … players could
directly eliminate one another, using the newly-unlocked upgrades of teeth, digestive tracts, and spines". There, levelling a
body is literal.

## Term map

| TierZoo | Clade today | How to use it |
| --- | --- | --- |
| Build | lineage plus its six-place loadout | Call the loadout a build in the UI |
| Traits in trait trees (Claw → Robust Claw → Long Claw) | parts; 20A's variants/upgrades (eye → compound eye) | The close-up tree is the trait chain per place |
| Moves ("based on which traits … they have") | verbs from parts | Already the rule; show them as moves |
| Signature move | locked built-ins: worm tunnel, trilobite enrol, swimmer ambush, default Dash | Label them; they sit outside the three-move cap (as for Dash, 8 Nov) |
| EXP → Evolution Points; main quest = reproduce | lineage XP, step 6, still open | Earned by eggs and surviving young; spent on the tree |
| A mutation becomes permanent when enough of the guild carries it | locked places; recipes | A part your line keeps carrying becomes signature; enough of them makes a new animal |
| Base stats 0–100, Base Stat Total, build cap 400 | not shown; the body sets the stats | Six read-outs derived from parts; upkeep is the cap |
| Debuffs, status effects, resistances | soft while moulting, torn parts, starving, low oxygen, mud dimming | Name them and show them; gills and shell are resistances |
| Weight classes | sizes 1–5 | Later: a hunter captures prey up to its size class |
| Build types, play-styles, combat styles | sweeper/digger/tank styles; diets; guards, strikes, arms, ambush | Archetypes for strong vs / weak vs |
| Tiers per server and era; endangered → banned | rank per niche (step 6); crashes; extinction | A letter per niche per patch; endangered and banned states |
| Devs, nerfs, balance patches, overworld forces | oxygen, volcano, crashes with causes, sea news | Patch notes with a cause |
| Faction > guild > clan > build; mains; gamertag | body plan > lineage > your line > named form | Names on the tree; a guild takes its ancestor's name when the ancestor is banned |
| Character select (taxonomy drill-down), cryptids | the tree screen with silhouettes | Locked silhouettes; a cryptid is a secret recipe |
| Spawning screen (green/yellow/red, region locks) | sea map, Play next | Colour patches by your build's tier there; later, depth zones locked by parts |
| Servers, zones, expansions, DLC | the island sea; eras in M4 | Depth bands as zones; eras as expansions |
| Team comps, mutualism, colonial | none yet | M3 (sponges, filter feeders) |

## What to take, ranked
1. **Build, moves and signature moves** (step 5, now). Naming, plus the Dash call. Cost: low.
2. **Derived stat block and trade-off tooltips** (step 5 equipment screen). Six bars read from the parts: power, defence,
   mobility, health from size, senses and stealth, with upkeep as the cap. Example: "Spined shield: defence 80 · mobility 10 ·
   upkeep +1". These are read-outs, not new sim stats, so they stay within the 6-stat budget. This is the base for the later
   dex and stat sheets.
3. **Evolution points and trait trees** (step 6). EP comes from the main quest and is spent on per-place trait chains.
   Costs rise, so you can't buy every trait (tastes: "buying every trait isn't it"). Fixation turns a carried part into a
   signature part, and recipes fire when enough are fixed. This is step 6's job anyway; TierZoo gives it a shape.
4. **A tier letter per niche** (step 6, "played well means a rank in that niche"). Derived from population share and trend,
   spread S–F in each patch, and stamped with the sea generation. Endangered and banned are states before and after
   extinction. The wiki's hand-set list is top-heavy (A 203, B 174, S 117): derive the letters, don't hand-set them.
5. **Patch notes with a cause** (step 4 follow-up; sea news exists). Example: "Patch 1.0.14 · The volcano vented; oxygen fell in
   the north shallows. Gill builds buffed, burrowers nerfed to C." Numbered by sea generation.
6. **Strong vs / weak vs, a triangle** (step 6/7). Candidate: grazers out-eat tanks (low upkeep, more mats), tanks shrug off
   hunters (guards, brace), hunters eat grazers. Each edge must be true in the sea model before a card prints it.
   Pierce, shell and crush can carry the combat flavour, following TierZoo's Cambrian logic.
7. **Debuffs as named states** (step 5/9): Soft, Torn, Starving, Low oxygen, Mud-blind. This only makes existing rules readable.
8. **Spawning-screen map** (step 4 follow-up/7): green, yellow or red patches for the selected build, which helps find the next
   patch. Later, depth zones locked by parts would give the map structure that isn't just "going sideways".
9. **Character select, guilds and cryptids** (step 6 tree screen): the tree of life as a select screen you drill into;
   gamertags; secret recipes.

**Later:** a full dex and numeric stat sheets (you: "would be cool in the future"), weight classes, team comps (M3), eras as
expansions (M4). **Skip:** hidden stats (Intimidation, Resolve), elemental types, a PvP/PvE split and the joke lore.

## Start more recent? (open, P47)
- **A. Keep the Cambrian sea for M2, framed as the open beta; later eras become expansions (M4+).** *AI lean.* In the Cambrian,
  eyes, shells, spines and jaws are first unlocked, so the levelling fantasy is literal there. All M1/M2 content is Cambrian,
  and M2 is the release.
- **B. A later sea, e.g. the Devonian "age of fishes"** (jaws, plates, sharks, an armour race). More recognisable, still a sea
  with body parts. Costs new bodies, a new ladder and new art: weeks, and a later release.
- **C. A modern start.** The richest wiki material and instant recognition. But modern species have fixed bodies, so picking
  from a catalogue replaces growing new parts. Needs a full rewrite.
- **Middle ground for A:** get recognisability from archetype labels ("tank", "beginner pick", "grappler") and the tier voice
  instead of familiar animals.
