# Slice 20A: body/part contract

**Approved 8 Nov** ([calls](../decisions.md#8-nov-slice-20a-contract-review), [later calls](../decisions.md#8-nov-review-of-the-codex-stretch-and-tierzoo)):
A (light upkeep, defaults/locks, verb ceiling) provisionally, open to revision after equipment play; B (one copy per
place, explicit variants) and C (whole-row damage) accepted. The sea save resets at the cutover: no legacy layer, no
conversion. Dash from the default walking row is outside the verb ceiling. Trimmed 8 Nov; the long Codex version is
at `git show fa6baee:docs/design/20a-body-part-contract.md`.
This is the model deliverable of [slice 20](../slices/20-join-the-bodies.md#boundaries-and-build-order). It changes no code.

**Why a contract:** six places can't keep the current slot rules literally. A trilobite has eight old slots, several
bonuses count copies, guards cover one side, a strike removes one copy, and the toy's 11 visual parts don't describe
production's 27. The model below: six choices, a few explicit variants, one copy's bonus per choice. Balance changes.

## A revision: light upkeep and open verb limit

- **Upkeep** = base 1 + nominal costs of occupied choices − body allowance. The allowance is 1 while A/T has `leg` in
  its walking row or S has `flap`, else 0 (W always 0). It follows the current row, not history; losing the row loses
  it. `deep` in mud overrides the total to 0. Previews show the allowance and the whole-build cost.
- **Verb ceiling:** at most three active verbs, fewer allowed. **Dash from the default walking row doesn't count**
  (worm `chaetae` Dash is not a default and counts). Never fill to three, grant a free action or hide one; a
  fourth verb is a visible conflict. A two-verb ceiling stays open for review after play.
- Defaults and family locks stay as listed below. No new part, stat bonus or starting food.

| Starting build, no carried part | Now: upkeep, verbs | New: upkeep, verbs (+ free Dash) |
| --- | --- | --- |
| Defaults only, any body | — | 1 |
| Worm Digger (`bulb` + `eye`) | 2, Dig/Sense | 2, Dig/Sense |
| Arthropod Sweeper (walking/raking) | 3, Graze | 2, Graze + Dash |
| Arthropod Digger (walking/digging + `eye`) | 2, Dig/Sense | 2, Dig/Sense + Dash |
| Swimmer (`arms` + `flap`) | 1, speed 2 | 1, speed 3 |
| Trilobite Tank (walking + spined shield + `claw`) | 3, Brace/Crush | 3, Brace/Crush + Dash; room for a compound eye |

Targets, not measurements. Revisit upkeep, locks and the ceiling after equipment play (start food, Digger, Tank).

## Four bodies and the starting allowance

IDs stay `worm`, `arthropod`, `trilobite`, `swimmer` (the toy's anomalocaris drawing is the swimmer reference).

| Body | Shape; base rules kept | Defaults in install order (nominal upkeep) | Locks; open places |
| --- | --- | --- | --- |
| Worm | Soft rings, ripple. Crawl 1; mud tunnel 3; mud hides from strikes; sense 2; moult +2; never soft | Tail `bulb` (0, Dig) | None; all six open. **Limbs has no worm part yet** (shown as unsupported, not empty) |
| Arthropod | Plated spine, legs. Range 2 straight; mud ends movement; sense 1; moult +3; soft on moult turn | Limbs `leg` (1, +1 range, Dash) | Limbs: walking; five open |
| Trilobite | Broad three-lobed hull. Range 2; mud costs 2; stay-put enrolment intrinsic; sense 2; moult +3; soft | Limbs `leg`; Back `shield` (0, front guard) | Limbs: walking; Back: cephalic armour; four open |
| Swimmer | Long raised hull, flaps. Swim 2 along paths over rock, never vent water; sense 3; moult +3; never soft; ambush/frenzy | Front `arms` (0, capture); Limbs `flap` (1, +1 speed) | Front: grasping; Limbs: swimming; four open |

Families: walking = `leg`, walking/raking, walking/digging; cephalic armour = `shield`, spined shield; grasping =
`arms`, `spikes`; swimming = `flap`. A lock restricts replacement, not damage or starvation. A lost locked row stays
empty until repaired at a moult; base movement and trilobite enrolment survive it, and the painter shows the loss.
Plates, seams, antennae and shape grant nothing.

**Starter allowance:** defaults + the chosen starter action parts + at most one carried clutch part. Empty places
are not free equipment.
1. Install defaults; an identical starter/carried part merges once (one bonus, one cost). Apply variants below.
2. The carried part claims its place first; with several legal places, the player picks. Nothing moves silently.
3. Passive parts (gill, gut, pouch…) come only as the carried part or a moult offer; rares only as a carried rare
   or a rare offer.
4. Verb ceiling as in A. Start food 6, health 3, oxygen 3, lay cost 4, sizes 1–5 and growth costs are unchanged.

## Place and variant semantics

One choice per place, or empty. Size sets how many appendages are drawn, never effect copies or costs.

| Choice/variant | IDs; nominal upkeep | Result |
| --- | --- | --- |
| Walking limbs | `leg`; 1 | +1 range, Dash |
| Walking/raking limbs | `leg` + `rake`; 2 | +1 range, Dash, Graze; one row with raking tips |
| Walking/digging limbs | `leg` + `digger`; 1 | +1 range, Dash, Dig; one row with digging ends |
| Frontal rakes | `rake`; 1 | Graze from Front, leaving Limbs free |
| Spined shield (T Back) | `shield` + `spine`; 1 | Front guard, spine rest effect, Brace; no flank guard |
| Spined grasping arms | `spikes` replaces `arms`; 1 | Capture, plus no armoured/alarmed-prey cut |
| Compound eye (A/T) | `compound` replaces `eye`; 1 | Keeps Sense; passive sense base +20 |
| Hooked proboscis | `hook` replaces `proboscis`; 1 | Keeps reach and Crush; adds normal shell eating |
| Deep burrowing tail | `deep` replaces `bulb`; 0 | Keeps Dig; mud upkeep/egg effects |

Swapping variants shows what's lost (walking/raking → walking/digging loses Graze, gains Dig). One ID can't occupy two
places. Upgrades keep the predecessor's capability without its upkeep or an extra damage buffer; Sense/Crush/Dig on
`compound`/`hook`/`deep` is a rule change accepted in B. `lenses` is the swimmer's predictive eye, not `compound`.

## All 27 existing parts

**W** worm, **A** arthropod, **T** trilobite, **S** swimmer. Access: **V** starter verb, **C** carried clutch part,
**M** common moult offer, **R** rare route. Each ID counts once, also inside a variant. Upkeep is nominal, before the
body allowance. Clutch pools, odds and the rare routes are unchanged.

| ID | Bodies; place / family | Effect, verb; nominal upkeep | Drawing | Access |
| --- | --- | --- | --- | --- |
| `claw` | A/T; Front / crushing | Reach ahead; normal shells; Crush; 1 | Paired front pincers | V/C/M |
| `shield` | A/T; Back / cephalic armour | Guard front; 0 | Plate from Back over the head; front tool stays visible | C/M |
| `eye` | W/A/T; Eyes / sensing | +2 passive sense, Sense; 1 | Simple eyes | V/C/M |
| `spine` | A/T; Sides or Tail; T Back as spined shield | Guards its directions; a blocked strike rests the hunter 3 turns; Brace; 1 | Lateral, rear or shield spines | V/C/M |
| `leg` | A/T; Limbs / walking | +1 range (cap 5, before Dash ×2); Dash; 1 | One paired row | V/C/M/default |
| `digger` | A/T; Limbs / walking-digging | Dig, buried food; +0 on walking's 1 | Digging ends | V/C/M |
| `rake` | A/T; Front, or Limbs as walking/raking | Graze; 1 alone, 2 with walking | Front rakes or raking tips | V/C/M |
| `gill` | all; Sides / respiration | +2 max oxygen (5); 0 | Gill fringe | C/M |
| `gut` | all; Back or Sides / physiology | +2 food per meal, prey too; 1 | Internal tint, inspection inset | C/M |
| `pouch` | all; Tail or Sides / brood | Clutch ×2 × size; 1 | Brood sac | C/M |
| `proboscis` | W; Front | Reach ahead, Crush; shells need hook; 1 | Frontal tube | V/C/M |
| `tentacles` | W; Front | Graze; 1 | Feeding crown | V/C/M |
| `bulb` | W; Tail / burrowing | Dig; 0; no tunnel range | Broad tail | V/C/M/default |
| `arms` | S; Front / grasping | Capture when swimming onto prey; 0 | Paired frontal arms | C/M/default |
| `spikes` | S; Front / grasping upgrade | Capture, no prey-spine cut; 1 | Spines on the arms | C/M |
| `lenses` | S; Eyes | Prey-flight prediction, two-tap aiming; no Sense; 1 | Stalked eyes | C/M |
| `flap` | S; Limbs / swimming | +1 swim speed (before frenzy/ambush, cap 8); 1 | Paired flaps | C/M/default |
| `fan` | S; Tail | Ambush ×3 instead of ×2; 0 | Tail fan | C/R (all) |
| `chaetae` | W; Sides / bristles | +1 mud tunnel step; Dash; 0 | Bristle row | V/C/M |
| `sclerite` | W; Sides or Tail | Guards its directions; Brace; 0 | Lateral or rear scales | V/C/M |
| `compound` | A/T; Eyes / sensing upgrade | +20 passive sense, Sense; 1 | Large compound eyes | C/R (mud) |
| `enrol` | A/T; Tail | Staying put blocks all strikes (no extra on T); 0 | Curling tail joint | C/R (sand) |
| `blood` | A/T; Back or Sides / physiology | No oxygen loss from vents, events, low sea oxygen; 0 | Blue tint, inset | C/R (rock) |
| `hook` | W; Front / proboscis upgrade | Reach, shells, Crush; 1 | Hooked proboscis | C/R (sand) |
| `deep` | W; Tail / burrowing upgrade | Mud: total upkeep 0, +1 egg per lay; Dig; 0 | Buried tail pose | C/R (mud) |
| `symbiont` | W; Back or Sides / physiology | Sulfur mat food ×2 (7 → 14), then gut; 0 | Sulfur patches, inset | C/R (rock) |
| `progenesis` | all; Back, Sides or Tail / physiology | Lay at any size; 0 | Label, inset | C/R (all) |

T's armour lock excludes physiology from Back. Rare timing (second/third moult), habitat order, once-only rare
acquisition and the three common offers are unchanged. A card carries one ID, never the parent's other parts.

## Repeated bonuses and explicit balance proposals

No ranks or repeated copies (B). A duplicate offer is a repair or replacement, never more power; preview says so.

| Repeated effect now | New | Example (same build otherwise) |
| --- | --- | --- |
| Each `leg` +1 range, +1 upkeep | One row: +1 range; cost covered by allowance | Two legs on A: range 4, upkeep 3 → range 3, upkeep 1 |
| Each `flap` +1 speed, +1 upkeep | One row: +1 speed; covered by allowance | Two flaps: speed 4, upkeep 3 → speed 3, upkeep 1 |
| Each `chaetae` +1 tunnel | One +1 | Tunnel 5 → 4 |
| Each `gill` +2 oxygen | One +2 | Max oxygen 7 → 5 |
| Each `gut` +2 per meal, +1 upkeep | One +2 | Two guts on a mat: gain 9, upkeep 3 → 7, upkeep 2 |
| Each `pouch` +size eggs, +1 upkeep | One +size | Size 3: 9 eggs/lay, upkeep 3 → 6, upkeep 2 |
| `eye` + `compound` both | Compound replaces eye | Sense 23 → 21 |
| Guards per side | One mirrored row | Covers both flanks, lost together |

Other changes:
- **Worm Sweeper's default bulb** gives Graze/Dash/Dig at upkeep 2 and splits sea feeding half mats, half rot.
  Removing the bulb is an explicit choice. Other defaults add no sea food source; actual diet is recorded separately.
- **Finite places:** gill and a lateral guard can't share Sides; gut/blood/symbiont/progenesis compete for their
  homes. T loses the gill+gut+blood+pouch combination (Back is locked). W keeps symbiont on Back + gut on Sides.
- **Starter conflicts:** with Dash free, A/T can start with Graze, Dig or Crush plus one more verb. Worm Tank
  (bulb/brace/crush) is full; a carried eye is a visible conflict. Presets show their exact build and any conflict.
- **Armour:** shield moves from head to Back and still guards the front, so A/T can have claw + shield + eyes.
  T gets shield as a free default.

## Directional guard, injury and shedding contract

Strike direction stays relative to facing (front, right, back, left). Resolution order stays: mud hiding (except the
player's lens hunter), Dig, stay-put enrolment, active Brace, matching passive guard, tear/damage. Brace guards all
directions and rests the hunter 3 turns; other blocks rest 1 unless a spine blocked. Hunter arm spines bypass passive
guards only.

| Place | Struck from | Passive guard |
| --- | --- | --- |
| Front (arms/spikes too), Eyes | Front | None |
| Limbs | Left/right | None |
| Sides | Left/right | `spine`/`sclerite` guard both flanks |
| Back: shield / physiology | Front / left-right | Shield: front (+ spine rest if spined) / none |
| Tail | Back | `spine`/`sclerite` guard the rear |

- A bypassed guard tears first. Otherwise tear the last occupied eligible row in the order Front, Eyes, Limbs,
  Sides, Back, Tail; the strike preview shows it. A normal guard isn't consumed. No eligible row: 1 health damage.
  A tear does not absorb damage (changed 9 Nov: every unblocked hit costs 1 health); softness adds 1. Empty locked places absorb nothing.
- A tear removes the **whole choice**: its effects, verbs, upkeep and any allowance (walking/raking loses Dash,
  Graze and range together). Physiology rows can be torn like any other.
- Starvation sheds the newest installed surviving choice, then costs health. Install order: defaults (table order),
  carried part, starter parts, moult choices; an upgrade makes its row newest. Nothing is restored for free. Losing
  a gill clamps oxygen to the new maximum.

**Moults** pay once, grow one size, allow at most one part change and end no turn. Offers need a legal placement
and a legal verb set; previews show losses and new upkeep. Filter illegal offers from one common-pool shuffle (first
three legal, no reroll); rares keep habitat order without an extra draw. **Finish growth without a part** is always
available: size, cost and softness apply, nothing installs, `rareGot` stays unset.

## Saves, snapshots and codes

**The sea save resets at the cutover** (*decided 8 Nov*): bump `SEA_SAVE_VERSION`; an older save is discarded and a
fresh sea starts. No legacy semantics, conversion or v3 pending results. Builds record place and variant, not a flat
list (frontal rake and walking/raking have different coverage).

Four checks, all from the same place/part definitions (no rule framework):

| Check | Used for | Rule |
| --- | --- | --- |
| Legal anatomy | Any stored build | Parts fit body, places and families; no duplicate IDs; rows may be empty, locked ones too |
| Starter | Launch screen, presets, share codes | Legal anatomy + the starter allowance + verb ceiling |
| Moult change | One offer | Legal anatomy after exactly one change + verb ceiling |
| Lay snapshot | Eggs, results, residents | Legal anatomy, frozen at the lay |

- **Lay snapshots keep their size:** each lay stores size, places/variants and injured (empty) rows. Later damage,
  growth or reloads never rewrite it, and an empty locked row isn't refilled. Latest lay supplies the result
  portrait; cumulative eggs supply release; the strongest release sets the line's representative, latest on ties.
- **Residents carry their representative snapshot for drawing only.** Sea rules stay aggregate per body/diet line;
  no per-resident Life effects.
- **Share codes** (`CLADE2-`) encode a starting design: body, starter parts and their places. No carried part, no
  animals, no launch access. Decoding runs the starter check; anything else is an invalid code. Old `CLADE-` codes
  are simply invalid (*decided 8 Nov*: no codes exist outside the user's).
- A malformed import changes no active save; keep the startup write block, backup/export and storage retry.

## One-part continuation and local forms

A continuation's trait is **none** or **one chosen part** with its source (patch, body/diet line, Life).
- A positive result settles once and records the chosen compatible card, or none. It follows continuation to the
  clutch patch or a neighbour. A zero-egg result keeps the previous trait. A pending result's card can't launch.
- Changing launch body keeps the stored trait; show the incompatibility and allow leaving it behind for this Life.
  Compatible local forms are an explicit alternative to the trait, never an extra part.
- A card carries one part; a variant's required default is shown and costed. No adult build is inherited.

## Fixtures (before any runtime switch)

| Group | Evidence |
| --- | --- |
| Definitions | All 27 IDs, four bodies, six unique places, ≥3 open places, legal costed defaults, a legal home for every part on every listed body, worm Limbs unsupported |
| Starters/variants | Every preset on each body; carried part × body × preset conflicts shown; no free passives; no double defaults/bonuses; Dash outside the ceiling; Tank + compound legal; fourth verb rejected |
| Bonuses | The before/after examples above; size doesn't multiply; allowance once, lost with its row; four default-only builds cost 1; `deep` override; mat/bloom/prey food; clutch sizes |
| Injury | Four directions × four facings; guards and bypass; whole-row loss; softness; every row can be lost; starvation order; no free restoration; oxygen clamp |
| Growth | Full/locked bodies, no fitting offer, replacement/downgrade previews, duplicate repair, finish without a part, rare only after a real install |
| Saves/codes | v4 round trip; older version starts fresh; lay snapshot unchanged after injury, growth and reload; empty locked row stays empty; code round trip; adult build rejected as a starter code; malformed input leaves state unchanged |
| Continuation | Part follows to a neighbour; zero eggs/extinction keep it; no card clears it; body change keeps it stored |

Equipment drawing, head joins at sizes 1–5, board performance and player/phone checks belong to 20B/20C.
**Built 8 Nov:** `game/src/data/body.ts`, `game/src/sim/body.ts`, `game/src/sim/body-hurt.ts`, fixtures in
`game/tests/body.test.ts`. Sea save version and the part following to a neighbour are tested at the 20C cutover.
