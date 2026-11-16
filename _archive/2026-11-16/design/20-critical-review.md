# Critical review: slice 20 and the equipped creature

8 Nov 2026. Review base `94d79dc`; branch `codex/slice20-critical-review`.
Requested scope: critically review 20A and 20B/C, and equipment, places and body parts in the larger game.
Read [AGENTS.md](../../AGENTS.md), [status](../status.md), [slice 20](../slices/20-join-the-bodies.md),
the [20A contract](20a-body-part-contract.md), relevant production paths and the existing body references.
This is a design/source review. There is no 20A implementation yet; gameplay remains at `13b1ccb`.
Findings distinguish specification gaps from accepted design risks. They are not new user decisions.

## Assessment

**Keep six equipment places and one occupied choice per place. Do not treat the current contract as proof
that the resulting building and growth loop is good.** It accounts for all 27 parts and makes the major
losses explicit. Its strongest work is preservation: legacy meanings, exact pending eggs, last-lay
equipment, no free restoration and one settlement owner. Those requirements should survive.

The weak point is the intersection of fixed places, family locks, one-copy effects and three active verbs.
Together they can leave an apparently open body with few useful changes, make an upgrade unavailable,
and make a newly won clutch card provide nothing new. The equipment screen can expose those constraints;
a better drawing cannot repair their reward value.

20A is suitable for isolated definitions and explicit edge-case fixtures. 20B/C need a more concrete
integration contract before runtime cutover. Recommend a short specification follow-up and then staged
implementation, not another architecture or art investigation.

## Findings, in priority order

### 1. High: anatomical validity is not permission to start with a build

The contract requires body/family/variant/verb validation and exact new share codes, while launch permits
only defaults, starter action parts and one carried part. A legal adult can have several passive parts
earned across moults. Importing that adult as a merely valid six-place build would bypass the starter
allowance. Conversely, an injured last-lay snapshot with an empty locked row must remain valid evidence;
requiring every saved build to contain defaults would resurrect parts or reject legitimate results.

These requirements are individually present, but their validation contexts and serialized shape are not
yet explicit. The old design path rebuilds starters from verbs and one form
([share.ts](../../game/src/sim/share.ts), `designProblem`); it does not validate arbitrary place records.
The current [pending record](../../game/src/sim/sea-save.ts) also has no size field. A literal last-lay
portrait needs its size, or an explicitly illustrative size, as well as equipment. A later moult must not
silently change what that portrait claims to show.

**Smallest clarification:** distinguish legal anatomy, a permitted starter, a single offered moult change
and an immutable lay snapshot. Reuse the place/effect definitions with those specific checks; no generic
rule framework. Specify which fields preserve size, placement, variants and installation order, and which
are intentionally normalized for a new Life. New code imports must pass starter eligibility, including
the rule permitting a shared carried part; claimed provenance is not permission for extra equipment.

**Checks:** an adult with gill+gut+pouch cannot directly become a free starter; a laid build with missing
locked legs round-trips without refill; a size-3 lay followed by size-4 growth keeps the chosen portrait
meaning; code round-trip reproduces the offered starter and its starvation order. Resolve this at the
20A/20C boundary before a live editor launches builds.

### 2. High: resident agreement needs a transport and behaviour boundary

The slice promises agreement between player, equipment, result and known residents. Production passes
only kind/species/name/food to prey and rivals. `boardForPatch` forwards equipment only to the hunter;
`Prey` has no build, and `main.ts` creates prey/rival bodies from kind alone. Relevant paths:
[habitats.ts](../../game/src/data/habitats.ts), [door.ts](../../game/src/sim/door.ts),
[hunt.ts](../../game/src/sim/hunt.ts), [main.ts](../../game/src/main.ts).

Behaviour remains separate too. Prey sensing/armour come from `PREY[kind]`, movement follows its flee rule,
and sea oxygen losses affect every species without consulting `blood` or `gill`
([prey.ts](../../game/src/data/prey.ts), [sea.ts](../../game/src/sim/sea.ts)). A compound-eyed or blue-blooded
portrait therefore does not currently imply those player effects on a resident or population. This is an
existing abstraction, not a 20A regression. Equipment makes the discrepancy more visible.

**Smallest clarification:** carry the tagged representative build through the detached board snapshot,
prey/rival records and renderer. Specify resident drawing size and honest legacy appearance when placement
is unknowable. Preserve AI/sea rules unless a particular new effect is explicitly approved. Label effects
as Life effects where appropriate; do not promise full player/NPC/ecology equivalence. No second complete
Life simulation per resident is needed.

**Checks:** two known same-body residents with different Front parts draw differently; their snapshot
does not change with the sea registry; legacy residents receive no new defaults or invented historical
placement. List intentionally simplified NPC effects in the acceptance criteria.

### 3. Medium: mandatory movement consumes action choice and can block an upgrade

With the default walking row present, every arthropod/trilobite has Dash. A three-action ceiling leaves
two other actions even when four equipment places remain unlocked. Of the 20 possible three-verb sets
from six verbs, only the 10 containing Dash can fit that requirement. A two-action ceiling would leave
only one other action. Reducing the ceiling independently would be a large build change.

Concrete case: T Tank has Dash/Brace/Crush. An offered `compound` in empty Eyes adds Sense, giving four
verbs. It cannot be installed as one legal row change; first downgrading the spined shield is a separate
change. The legality filter therefore skips that rare. This follows the accepted rules, but the screen
must explain the limitation. Empty places do not mean spare action capacity.

**Recommendation:** keep the provisional ceiling for the first test. Test default movement, action count
and useful offer access together. Distinguish place occupancy, action capacity and food upkeep in previews.
Do not incidentally add disabled actions, a fourth verb or a second loadout system. If forced Dash crowds
out the desired builds, revisit A with a concrete alternative.

### 4. Medium: preserving offer pools does not preserve growth or clutch rewards

A duplicate is now replacement/repair, not more power, while defaults remain in common moult/clutch pools.
The swimmer's seven common IDs are arms, spikes, lenses, flap, gill, gut and pouch. Arms/flap are already
guaranteed defaults. Either common card adds no effect to an ordinary healthy swimmer starter; it merges
into the default. Conditional on two cards both being common, both overlap defaults with probability
`(2/7)^2 = 4/49`, about 8.2%. This is pool arithmetic, not overall frequency after rarity rolls or a playtest.

At later moults, already-present IDs increasingly occupy the three common offers. Replacement can still
change placement, cost or starvation order, but that is different from a satisfying growth reward. The
existing T `enrol` rare also duplicates intrinsic enrolment; acknowledging it does not make it a meaningful
rare reward. There are only four growth opportunities between sizes 1 and 5.

**Recommendation:** retain the approved pools for the first fixture/play pass, mark already-included
parts and downgrades, and make skip understandable. Count offers that change capability, repair, rearrange
or only change order. If too many rewards are empty, propose a bounded filtering/pool revision with its
RNG implications. Do not silently change rarity odds or compensate with upgrade ranks. Legal offers and
useful offers need different checks.

### 5. Medium: six places are not six equivalent choices

The worm has no legal Limbs part in the mapping, despite its body record saying all six places are open.
Swimmer Eyes has one fitting ID; locked Limbs has only flap. An unlocked-row count is therefore an
inadequate measure of customization. Distinguish unsupported, empty, locked and upgradeable states;
worm Limbs should not look like equipment the player has yet to discover.

T physiology is the sharpest tradeoff: Back armour leaves gill, gut and blood competing for Sides. Each
effect exists, but they cannot combine. That is balance design, not anatomy implied by the labels. A Back
head shield guards Front while Back physiology takes flank damage. Blood/symbiont/progenesis are internal
adaptations, not ordinary external appendages, despite sharing equipment places and being damageable.

**Recommendation:** retain the accepted mapping initially, label internal traits clearly and show guard
directions on selection. Evaluate actual legal builds and moult paths, not just three open places. Do not
add physiology sockets or general component combinations before evidence warrants reopening the accepted
tradeoff. Explicit variants solve a few needed cases; arbitrary bundles would undo the simplification.

### 6. Medium: continuation and the sea can represent different creatures

The chosen clutch card follows the next Life; the strongest release supplies a body/diet line's global
representative. In `release`, new eggs must match or exceed the maximum fitness across all patches to
change that representative. A weaker successful run adds real eggs without putting its appearance on the
population. An equal/stronger run can change that line's appearance and feeding everywhere. High-scoring
legacy builds can remain representative for a long time after stacking is removed; this review does not
claim a particular old score is impossible to beat.

Also, a bulb adds a food source but splits sea feeding effort with grazing. More tools need not improve
performance in a mat-rich patch. This accepted consequence belongs in capability information if the
screen discusses descendant feeding.

**Recommendation:** retain the aggregate bridge, but distinguish the part carried next, the build at last
lay and the population representative where they matter. Result feedback should say when the representative
stays unchanged. Test whether the player can explain why their new creature is not the one drawn throughout
the sea. Do not silently replace representatives or start per-build species in step 5. Step 6 must revisit
identity and inheritance together.

## The larger design

| Concept | Job now | Explicit limit |
| --- | --- | --- |
| Body/lineage | Shape, base movement and characteristic defaults/families | A drawing record alone does not implement future prey rules or progression |
| Equipment place | Stable choice and damage unit with visible placement | Not one literal organ or an equally useful option on every body |
| Part/variant | An adaptation's effects, cost and appearance | Small explicit variants; internal traits need honest presentation |
| Verbs | Consequences of current equipment | Ceiling, not target count or independent skill inventory |
| Moult | Growth and one offered change in this Life | Distinct from prelaunch experimentation |
| Clutch choice | One carried adaptation for continuation | Temporary bridge, not adult-build inheritance |
| Sea line | Body/diet population with a representative | Not a separate persistent population for each custom creature |

The key player promise is connecting a choice to a visible body, a useful action and an understandable
consequence next run. Equipment can deliver the first two in step 5. It cannot alone deliver the species
identity promised by the eventual hatching/tree/recipe loop.

For the paper A-to-T transition check, consider A with walking/digging Limbs, claw Front, blood Back,
gill Sides and pouch Tail: Dash/Dig/Crush is legal. Imposing T's Back shield displaces blood; Sides is
occupied. Shared places do not make a transition lossless. This is a destination-body compatibility example,
not a proposed recipe. Step 6 needs an explicit keep/replace decision. Old toy recipes asking for four
`leg` copies also cannot be copied into the single-row model: decorative leg count is not four acquired
adaptations. Keep gameplay IDs distinct from drawing anchors and future recipe predicates, without building
a recipe engine now.

Keep equipment interaction small: patch/body/preset, inspect one place or part, preview the change, start.
Reuse that preview for moult offers. Put habitat and total upkeep beside the body; explain conflicts inline.
A flat catalogue of all 27 parts would imply availability they do not have. Distinguish starter, carried
and later-offer access. Prioritize Front, then Limbs/Tail for recognition, consistent with the recorded
body playtest. Preserve the large creature and board-size comparison; avoid an art overhaul.

## Smallest implementation path

1. Clarify starter/snapshot validation and the resident boundary; distinguish unsupported worm Limbs.
   This need not reopen accepted one-copy or row-damage decisions.
2. Stage 20A pure definitions/helpers and fixtures, including the cases above. Leave runtime slots, v3,
   offers and UI untouched. Summarize legal starters, costs and reachable offer changes.
3. Stage 20B painter and equipment preview against the model without enabling new launches. Check sizes,
   head joins, injuries, Front differences and phone-width interaction. No new framework.
4. Prepare 20C tagged v4 data, code eligibility, lay snapshots, continuation and resident transport. Switch
   runtime parts, feeding, offers, rendering and adapters at the verified shared boundary already required
   by the slice. 20B is not an independently shippable runtime port.
5. Run existing checks/build/smoke and actual play before tuning A or adding bodies. Compare two builds,
   Tank offered compound, duplicate rewards, a whole-row injury, last-lay injury/reload, neighbour continuation
   and a weaker release retaining the representative. Record useful choices, first eggs, survival/eggs and
   understood next-run time. Phone checks remain open if unavailable.

No additional design call is needed merely to stage the already-authorized pure model. Changing locks,
verb policy, pools, physiology capacity or aggregate identity requires a concrete proposal and user call.
Resolve the specification gaps before dependent runtime work.

## Verification and handoff

- Inspected production parts, starters/effects, growth, combat, feeding, clutch, sharing, pending/settlement,
  validation, representative selection and resident rendering inputs. Toy reads were limited to relevant
  model/body/part references; the completed performance/style audit was not repeated.
- A deterministic Node check transpiled only `data/life.ts` in memory with installed TypeScript: exactly
  27 contract IDs with matching production body restrictions; four approved default costs equal 1; common
  pools W 9, A 10, T 10, S 7; no worm Limbs part; Tank+compound yields four actions. An initial harness
  assertion failed because arrays came from different VM realms; corrected comparison and full rerun passed.
- Checked local document links/anchors and whitespace/diff scope. No gameplay, save files, dependencies or
  accepted decisions changed. No full gameplay suite, browser run, balance benchmark or phone playtest is
  claimed for this documentation-only review.
- Next session: clarify the two high-priority boundaries, then continue the bounded 20A model task.
  Preserve accepted calls unless the user chooses a revision. Slice 19's player discovery, ordinary-Life
  and real-phone checks remain open.
