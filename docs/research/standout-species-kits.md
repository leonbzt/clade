# Standout species, kit depth (research, 17 Nov)

Kit-depth material for the strongest six of the 15 candidates in PR #3 (`new-species-candidates.md`). **Ideas, not
the plan:** nothing joins the roster here. Parts are mapped onto the kit's six places (`clade/src/data/kit.ts`:
front, head, limbs, sides, back, tail), with at most 2 traits, rungs that add stats only, and a verb from the
existing six (graze, dash, dig, sense, brace, crush) where one fits; a new verb is flagged against the budget of 8.

**Grade:** ✓ = on the page PR #3 cites (Wikipedia, read 17 Nov); ~ = known biology, check before a card uses it.

## The pick, and why
| # | Species | Why it plays | Fits a line? |
|---|---|---|---|
| 1 | Peacock mantis shrimp | one huge part (the club) with a clean 3-rung ladder; Crush made spectacular | new crustacean line, next to shore crabs |
| 2 | Snapping (pistol) shrimp | a ranged stun with no contact; a partner (goby) as a trait | same line as 1: two builds of one clade |
| 3 | Geography cone | a slow snail that kills fish: the strongest "build beats body" story | periwinkle line's relative (`periwinkle-kit-sources.md`) |
| 4 | Palolo worm | the spawn branch made literal: the tail leaves to breed | ragworm line's relative; anchors the `epitoky` trait |
| 5 | Mudskipper | the land crosser that plays: walks, breathes air, leaps | a fish line; key adaptation "air" (direction §6 realms) |
| 6 | Hawaiian bobtail squid | a volcanic island's own; hiding as a build (light vs shadow) | a cephalopod line |

**Left out:** horseshoe crab (great card, thin verbs: it digs and spawns, which the worm already does); flightless
cormorant (a loss, not a part; better as a mutation "look" or a story card); bearded fireworm (its stinging
bristles overlap the ragworm's `venom` trait: fold in there); solar sea slug (one passive trait, benefit debated ✓);
frogfish and seahorse (strong, but a fish line already gets the mudskipper); bloodworm, chiton, cuttlefish (good
relatives, kept for their lines later).

## 1. Peacock mantis shrimp, *Odontodactylus scyllarus* ✓
- **Front:** the **dactyl club** (raptorial second maxilliped). Rungs: *club* → *spring-loaded club* (saddle spring
  and latch ~) → *cavitation strike*. Adds bite; verb **crush** (already in the game; the club is crush's best case).
- **Head:** **stalked compound eyes**, 12–16 photoreceptor types, each eye with trinocular vision ✓/~. Adds senses.
- **Limbs:** walking legs and **swimmerets** (pleopods, which also carry the gills ~). Adds speed.
- **Sides:** the **carapace** ~; **Back:** the burrow in rubble (a home it defends ~) as brace. **Tail:** **telson
  and uropods**, used as a shield in fights ~ (adds defence; verb brace).
- **Traits:** *cavitation* (a strike hits twice: prey takes the strike and the bubble's collapse ✓); *pair bond*
  (pairs stay up to 20 years ✓: brood).
- **Ability idea:** Crush that opens shell food in one beat at the top rung (`GATES.shell` work 6 → done).
- **Card:** "Its punch boils the water and flashes light." Keep the numbers: 23 m/s, 10,400 g ✓.

## 2. Snapping shrimp, *Alpheus* ✓
- **Front:** the **snapping claw** (one much larger than the other ✓); the **plunger and socket** that make the jet ~.
  Rungs: *big claw* → *snap* → *stun bubble*. Adds bite. **New verb candidate: Snap** (a ranged stun one tile
  away) — or reuse crush at range; a new verb needs a cut elsewhere (budget 8).
- **Head:** small eyes under a hood ~; poor sight is why it needs the goby ✓. Low senses.
- **Limbs:** walking legs ~; **Back:** the shared **burrow** it digs ✓ (verb dig).
- **Traits:** *goby partner* (the goby watches, the shrimp digs and keeps a feeler on it ✓: +senses while in the
  burrow); *claw swap* (if it loses the snapping claw, the small one grows into a new snapper ~: a shed that
  regrows, fits the kit's shed rule).
- **Card:** "The snap's bubble collapses at over 5,000 K for an instant, louder than a gunshot (218 dB)." ✓ Keep the
  numbers, drop "hotter than the Sun" (PR #3 gap note).

## 3. Geography cone, *Conus geographus* ✓
- **Front:** the **proboscis** with a **radular harpoon tooth**; teeth are single-use and reloaded ✓/~. Rungs:
  *harpoon* → *venom harpoon* → *net mouth* (the false mouth that engulfs a group of fish ✓). Adds bite.
- **Head:** **siphon** that smells prey ✓/~ (senses: it hunts by chemistry, eyes are poor ~). Verb **sense**.
- **Limbs:** the **foot**; slow ~. **Back:** the patterned **shell** ✓ (defence; verb brace). Tail: none (spiral body;
  a place left empty, as PR #3 proposed for radial plans).
- **Traits:** *venom* (conotoxins; shared trait id with the ragworm line); *insulin* (it releases insulin into the
  water so fish go slow ✓: hidden food and slow prey become reachable).
- **Ability idea:** the only slow mover that hunts: low speed, top bite. A clean anti-build to the dash crabs.
- **Card:** "It hunts fish with a harpoon and insulin." ✓

## 4. Palolo worm, *Palola viridis* ✓
- **Front:** **jaws** (eunicid, several pieces ~) for grazing reef rubble; verb graze. **Head:** **antennae** and
  eyespots ~ (senses). **Limbs:** **parapodia** (shared with the ragworm ~). **Back:** the burrow in coral rock ✓ (dig).
- **Tail:** the **epitoke**: the rear body full of eggs or sperm, with its own eyespots, breaks off and swims up ✓.
  Rungs: *gamete segments* → *epitoke with eyes* → *swarm night*. Adds brood.
- **Traits:** *epitoky* (already a `TraitId`: this is its real anchor); *moon clock* (spawns on set nights after the
  October–November full moon ✓: a Life's lay is larger on a timed beat).
- **Ability idea:** a lay that does not end the Life: the tail goes, the head stays and regrows ✓/~. Fits a shed.
- **Card:** "Samoans harvest its swimming tails one night a year." ✓

## 5. Mudskipper, *Periophthalmus* ✓
- **Front:** a wide mouth for grabbing on mud ~. **Head:** eyes on top of the head that **blink by sinking** ✓; high
  senses on land. **Limbs:** **jointed pectoral fins** for walking ("crutching") ✓; verb dash. Rungs: *fins* →
  *crutching* → *leap* (up to 61 cm ✓; a dash over a gap).
- **Sides:** **skin breathing** when wet ✓ (thrift on land). **Back:** dorsal fins raised to signal ~. **Tail:**
  tail flip for the leap ✓. Burrow in mud, eggs in an air pocket the male fills ~ (brood; verb dig).
- **Traits:** *air breathing* (gill chambers keep air ✓: the key adaptation that opens the shore realm, direction
  §6); *territorial* (males fight over burrows ~).
- **Card:** "A fish that walks, blinks and breathes air." ✓

## 6. Hawaiian bobtail squid, *Euprymna scolopes* ✓
- **Front:** **arms and two tentacles** ~; beak ~ (bite). **Head:** large eyes; the **light organ** has its own
  lens and reflector, and may sense light ~ (senses). **Limbs:** **fins** and **jet** from the funnel ~ (verb dash).
- **Sides:** **chromatophores** ~ (defence by not being seen). **Back:** buries in sand by day ✓ (verb dig; it
  coats itself with sand ~). Tail: none.
- **Traits:** *counter-illumination* (bacteria *Aliivibrio fischeri* light its underside to hide its shadow ✓: the
  hunter's strike misses at night); *dawn vent* (it lets out about 95% of the bacteria each dawn and regrows them ✓:
  the trait resets daily, which fits a beat).
- **Ability idea:** hiding as defence, not armour: a strike *misses* instead of *glances*. Needs a rule that reads a
  stat as a miss chance: flag for the architect (no new rule here).
- **Card:** "Bacteria make its light, and it lets them go every morning." ✓

## What this asks of the kit (for the architect, not decided)
- **Empty places:** cone, squid and palolo have no real tail or sides; the kit should allow a place left empty.
- **Verbs:** five of six fit the existing verbs. Only the pistol shrimp wants a new one (Snap, ranged). One new verb
  fits the budget of 8 if nothing else is added.
- **Shed that regrows:** palolo's tail and the shrimp's claw swap both are "lose a part, gain later": the kit's
  shed rule already exists; a regrow rung would be new.
- **Miss vs glance:** the squid's hiding is a second defence kind. Today `defence` only glances. A *proposal*, not a
  change.

## Gaps
- Grades ~ are not checked on a page today: the mantis shrimp's spring and latch, the cone's net mouth detail, the
  squid's sand coat and light-sensing organ, the palolo's regrowth. Check each before a card uses it.
- Sources: the Wikipedia pages PR #3 lists for each species.
