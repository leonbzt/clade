# Slice 20A: body/part compatibility contract

**Reviewed 8 Nov 2026: A approved provisionally as revised; B/C accepted. Ready for staged pure model/fixtures.**
Preparation base: `13b1ccb` (`feat: expose next-patch navigation`); review branch `codex/slice20a-review`.
This is the model-contract deliverable of [slice 20](../slices/20-join-the-bodies.md#boundaries-and-build-order).
It preserves the running game. No runtime model, save version, offers, drawing or balance changes here.
Slice 19's remaining player/phone checks remain open.

## Review first

The six-place decision cannot preserve the current slot rules literally. A trilobite has eight old slots;
several bonuses count copies, guards cover an individual side, and a strike can remove one copy. The toy's
eleven visual parts do not describe production's 27 gameplay parts. This contract proposes the smallest
bounded model: six choices, explicit combined variants only where needed, one copy's bonus per choice,
and recoverable legacy builds. It does **not** claim unchanged balance.

Review calls are recorded in the [decision log](../decisions.md#8-nov-slice-20a-contract-review).
All three calls are settled for the staged model; A remains explicitly open to balance revision:

| Review group | Proposal and review state | Concrete cost/tradeoff |
| --- | --- | --- |
| A: revised rule approved provisionally | Retain defaults/locks; include basic built-ins in base upkeep 1 through one explicit leg/flap allowance; extra tools pay normally | Default-only upkeep is 1 on every body; extra tools can raise it; three verbs remains a provisional ceiling, with fewer allowed and a possible lower ceiling open |
| B: six choices and bonuses — accepted | One effect copy per place; retain walking/raking and walking/digging variants; upgrades retain the predecessor's capability | Repeated-copy builds lose stacking in **new** Lives; some mixed passive/action builds need replacement choices; A's allowance applies to nominal component costs |
| C: damage and compatibility — accepted | Mirrored rows cover both flanks and are lost as a whole; keep old build semantics alongside new place records in a versioned save | One row guards more broadly but one injury can remove more anatomy; old conflicting designs need a visible resolution before launching |

A–C are now recorded user calls. A's approved lighter-upkeep rule supersedes the original paid-default
proposal; the part tables retain nominal costs and the explicit body allowance supplies effective upkeep.
The already selected one-part continuation and built-in lineage strength remain as recorded in
[decisions](../decisions.md#8-nov-part-c-navigation-and-the-next-body-phase). Equipment/board and persistence
cutover still follow the bounded stages in the slice. This review implements no runtime changes.

## Review assessment (8 Nov)

**Review complete: A's concrete lighter-upkeep revision is approved for now; B/C are accepted.** The user
explicitly wants A open to revision and raised a possible lower verb limit. Three remains a provisional
ceiling, with fewer allowed; no hard two-verb cap was selected. The amended rule is specified below.

- **A — lighter upkeep and family locks:** approved provisionally after revision. The original fully paid
  defaults would raise A Digger upkeep from 2 to 3 and S from 1 to 2. The approved allowance keeps those
  costs at 2 and 1 while adding the default movement effects; A Sweeper becomes cheaper (3 → 2).
  T gains a front guard alongside its existing stay-put enrolment. These are intentional starting-balance
  changes, not evidence that bodies are equally viable. Default actions must appear in presets and the
  three-verb check. The worm's optional bulb changes a Sweeper's sea feeding to half mats/half rot.
- **B — one effect copy and explicit variants:** accepted as proposed; see the
  [decision log](../decisions.md#8-nov-slice-20a-contract-review). This gives the six visible choices
  a direct mechanical meaning without adding ranks or a second equipment system. Walking/raking and walking/digging
  preserve the central combinations; retained upgrade actions avoid an improvement removing the old tool's
  action. Accepting this also accepts lost stacking and finite-place conflicts: oxygen 7 becomes 5 for two old
  gills versus one new row, and a size-3 double-pouch build's 9 eggs become 6. T's armour lock prevents the old
  gill+gut+blood combination. Preserve those old builds as legacy evidence rather than claiming a lossless map.
- **C — whole-row damage and versioned compatibility:** accepted as proposed. One bilateral row should have one
  visible injury state. The broader flank guard is a benefit; losing both flanks or both walking/raking tools
  in one tear is the cost. Fixed tear priority and a prospective-loss preview make the change explainable.
  Keeping legacy semantics until a new representative legitimately replaces them is necessary to avoid
  changing existing feeding, pending releases or saved results during migration. It adds a real compatibility
  burden; stage tagged pure data/fixtures first, then switch runtime and its adapters together.

The numeric comparisons and existing damage/feeding/offer rules were checked against `data/life.ts`,
`sim/life.ts`, `sim/hunt.ts`, `sim/threat.ts`, `sim/verbs.ts` and `sim/feeding.ts`. This supports the stated
differences; it does not establish the new model's balance or performance. No additional part, socket,
progression rule or release scope is proposed. No new source defect needs a separate implementation here.

This review changes documentation only: accepted A–C calls, this contract, the slice and handoff. Verify
local links/anchors, 27-ID/four-body coverage, upkeep arithmetic, consistency and diff scope.
Next, use a fresh session for the pure definitions and focused fixtures listed below;
runtime integration, save cutover, player balance and phone checks remain later work.

## A revision: light upkeep and open verb limit

**User direction:** “maybe only light starting upkeep, otherwise sounds okay for now but document that
this is open to revision. maybe there shoud be less than 3 verbs possible.” Defaults/family locks are
acceptable provisionally. The follow-up “approve for now” accepts the concrete rule below, while retaining
its explicit revision points. No hard two-verb limit was selected.

**Approved provisional rule:**

- Include the ordinary built-in components in the body's base upkeep 1. Keep all parts' nominal costs
  below for comparison, but apply one explicit body allowance: subtract 1 when an A/T walking choice
  includes `leg`, or when S has `flap`; subtract 0 for W. All other built-ins already have nominal cost 0.
  Formula: base 1 + nominal occupied-choice costs − that body's allowance. `deep` in mud still overrides
  the total to 0. Show the allowance and final whole-build cost in equipment/moult previews.
- The allowance belongs to the body's current ordinary component, not acquisition history. It applies
  within walking/raking or walking/digging and after legal repair, once only. Extra components such as
  rake/spine/eye/claw, including carried choices, pay their normal costs. No discount applies when the
  leg/flap is absent; base upkeep remains 1. Damage still removes the whole row's effects with no free restoration.
- Retain the four listed default loadouts and family locks. Occupied places remain the sole source
  of equipment effects; the allowance changes food cost only. No new part, stat bonus or starting food.
- Keep three as a **provisional maximum**, allowing fewer whenever the equipped build yields fewer.
  Do not fill to three, grant a free action or hide an equipped part's action. A hard two-verb ceiling is
  open for later review: A Digger's walking/digging + eye yields Dash/Dig/Sense, and T Tank yields
  Dash/Brace/Crush. Lowering the ceiling now would make those builds illegal unless their choices/rules
  were also revised. Such a change needs an explicit review of the affected B capabilities and presets.

| Starting build, no carried part | Superseded paid-default proposal | Approved upkeep, including base |
| --- | --- | --- |
| Defaults only, any current body | W 1; A/T/S 2 | 1 |
| Worm Digger (`bulb` + `eye`) | 2 | 2 |
| Arthropod Sweeper (walking/raking) | 3 | 2 |
| Arthropod Digger (walking/digging + `eye`) | 3 | 2 |
| Swimmer (`arms` + `flap`) | 2 | 1 |
| Trilobite Tank (walking + spined shield + `claw`) | 4 | 3 |

These are approved target costs, not implemented measurements. The later part/variant tables retain
nominal component costs; apply this allowance once to obtain effective whole-build upkeep. The defaults,
examples and fixture requirements below use that rule. Upkeep, defaults/locks and the verb ceiling remain
balance choices open to revision after equipment playtesting; review starting-food pressure, action clarity
and at least the affected Digger/Tank builds. No hard two-verb ceiling or verified balance is implied.

## Evidence and implementation boundary

The cause is a representation mismatch, not missing art alone. The relevant production dependencies are:

| Source | Contract evidence |
| --- | --- |
| [data/life.ts](../../game/src/data/life.ts) | All 27 IDs, body restrictions, costs, verbs, existing base numbers |
| [sim/life.ts](../../game/src/sim/life.ts) | Slot allocation, repeated effects, first-fitting replacement, three displayed verbs, newest-part starvation, last-lay build |
| [sim/verbs.ts](../../game/src/sim/verbs.ts), [hunt.ts](../../game/src/sim/hunt.ts), [threat.ts](../../game/src/sim/threat.ts) | Active actions, capture, flank-specific guards/tears, softness and rest |
| [habitats.ts](../../game/src/data/habitats.ts), [clutch.ts](../../game/src/sim/clutch.ts) | Current common/rare offers and card pools |
| [sea-life.ts](../../game/src/sim/sea-life.ts), [sea.ts](../../game/src/sim/sea.ts), [feeding.ts](../../game/src/sim/feeding.ts) | Continuation, once-only settlement, best representative and actual tool-based feeding |
| [sea-save.ts](../../game/src/sim/sea-save.ts), [sea-migration.ts](../../game/src/sim/sea-migration.ts), [share.ts](../../game/src/sim/share.ts) | v3 arrays, preserved legacy input, old seven-field design codes |
| [creature-data.ts](../../toys/creature-data.ts), [creature-model.ts](../../toys/creature-model.ts) | Drawing reference only: built-ins and slots currently overlap; prototype recipes are not production rules |

Smallest next implementation after review: stage pure definitions, compatibility/preview helpers and focused
fixtures without changing `Life.slots` or the v3 codec. Do not port prototype recipes, introduce a generic
mechanics framework, or make production import toy entry points. The eventual runtime switch must include
the saving, feeding and result adapters in the same verified checkpoint. Planned checks are below.

## Four bodies and the starting allowance

Stable IDs remain `worm`, `arthropod`, `trilobite`, `swimmer`. `swimmer` uses the toy's anomalocaris drawing
as a reference; it is never renamed in saves or codes. Shape/material/gait data select the current rules:

| Body | Shape/material/gait | Base rules retained | Built-in choices, in initial installation order; nominal upkeep | Locked family; open places |
| --- | --- | --- | --- | --- |
| Worm | Flexible soft rings; ripple | Crawl 1; connected-mud tunnel 3; mud hides from ordinary strikes; sense 2; moult extra 2; no moult softness | Tail: `bulb`, upkeep 0, Dig | No family lock; all six open. The bulb is a default that may be explicitly replaced |
| Arthropod | Stiff plated spine; walking legs | Base range 2 straight; mud ends movement; sense 1; moult extra 3; soft for moult turn | Limbs: `leg`, upkeep 1, +1 range and Dash | Limbs: walking family; five open |
| Trilobite | Broad plated three-lobed hull; walking legs | Base range 2 straight; mud costs 2; stay-put enrolment is intrinsic; sense 2; moult extra 3; soft for moult turn | Limbs: `leg`, upkeep 1, +1 range and Dash; Back: `shield`, upkeep 0, front guard | Limbs: walking; Back: cephalic armour; four open |
| Swimmer | Long raised hull; flap gait | Base swim 2 along paths over rock, never vent water; sense 3; moult extra 3; no moult softness; existing ambush/frenzy | Front: `arms`, upkeep 0, capture; Limbs: `flap`, upkeep 1, +1 speed | Front: grasping family; Limbs: swimming family; four open |

Walking admits `leg`, walking/raking and walking/digging variants. Cephalic armour admits `shield` and
spined shield. Grasping admits `arms` and `spikes`; swimming admits `flap`. A family may currently have
only one ordinary member: repair/replacement is legal and finishing growth without a part is always legal.
No new part ID, rare default, free ordinary eye, tail fan or second hidden leg row is added.
Plates, seams, antennae and body shape alone grant no guard, sensing or other bonus.

All defaults occupy the same places used by equipment and drawing. Their nominal costs are listed above;
the approved body allowance includes basic built-ins in base upkeep 1, so all four default-only builds cost
1. Equipment effects still come only from occupied choices. Locking restricts replacement, not damage or starvation.
An injured locked row stays empty until legally repaired at a moult; no automatic refill. Existing base
movement and trilobite enrolment survive loss of equipment. The painter must show lost rows rather than
drawing the original built-in over an empty place.

The starter allowance remains the current chosen starter action set (at most three distinct verbs), one
explicit compatible carried part, and these listed defaults. Empty rows are not extra free equipment:

1. Install defaults, then merge an identical starter/carried part into that choice once. Do not pay twice
   or add a second bonus. Apply the declared variants below when applicable.
2. The chosen carried part reserves its place before optional starter action parts. If there are several
   allowed places, show the selection; do not move another chosen part silently to make it fit.
3. Ordinary passive parts are available only as a carried choice or moult offer. Rare parts only as a
   legitimate carried choice or rare offer. No starter budget buys arbitrary gills, guts or pouches.
4. Default verbs count toward the same three-active-verb limit. An overlap consumes no additional verb.
   A fourth distinct verb or a competing place is a visible conflict that must be resolved before launch.
   Never take the first three and hide the rest. Show the same check on a moult preview.
5. Show exact whole-build upkeep: base 1 + nominal occupied-choice costs − one body allowance while A/T
   has `leg` or S has `flap`. Otherwise allowance is 0; no acquisition-history discount. Start food 6,
   health 3, oxygen 3, lay cost 4, sizes 1–5 and growth costs remain unchanged. `deep` in mud overrides the total.

Examples without a carried part: worm Digger = `bulb` + `eye`, upkeep 2, Dig/Sense, as now. Arthropod Sweeper
= walking/raking Limbs, upkeep 2 including base, Graze/Dash (old upkeep 3). Arthropod Digger = walking/digging Limbs
+ `eye`, upkeep 2, Dash/Dig/Sense (old upkeep 2, Dig/Sense). Swimmer starts with arms/flaps, upkeep 1 and
speed 3 before frenzy/ambush (old arms-only upkeep 1 and speed 2). Trilobite Tank = walking Limbs, spined
shield Back and claw Front, upkeep 3, Dash/Brace/Crush (old spine/claw upkeep 3, Brace/Crush).
These are group A's approved provisional costs and starting effects, subject to the stated playtest review.

## Place and variant semantics

Each place holds one choice or is empty. Size controls only how many appendages are drawn, never the
number of effect copies or upkeep payments. Variants are a short explicit list, not arbitrary bags of parts:

| Choice/variant | Existing IDs represented; nominal component upkeep before body allowance | Result |
| --- | --- | --- |
| Walking limbs | `leg`; 1 | +1 range, Dash |
| Walking/raking limbs | `leg` + `rake`; 2 | +1 range, Dash and Graze; draw one walking row with raking tips |
| Walking/digging limbs | `leg` + `digger`; 1 | +1 range, Dash and Dig; draw one walking row with digging ends |
| Frontal rakes | `rake`; 1 | Graze; draw frontal feeding appendages, leaving Limbs for walking/digging |
| Spined shield (trilobite Back only) | `shield` + `spine`; 1 | Front guard with spine rest effect and Brace; one shield with spines, no flank guard from this placement |
| Spined grasping arms | `spikes` supersedes `arms`; 1 | Keep capture, prevent the existing armoured/alarmed-prey cut |
| Compound eye (arthropod/trilobite) | `compound` supersedes `eye`; 1 | Keep Sense; passive sense is base +20, not base +22 |
| Hooked proboscis | `hook` supersedes `proboscis`; 1 | Keep reach and Crush; also unlock normal shell eating |
| Deep burrowing tail | `deep` supersedes `bulb`; 0 | Keep Dig; add mud upkeep/egg effects |

Replacing walking/raking with walking/digging explicitly loses Graze and gains Dig; replacing it with
walking loses Graze and lowers upkeep by 1. Installing `rake` on Front instead of Limbs is a placement
choice, not a second free copy. The same ID cannot occupy both places. A carried `leg` overlapping a
walking variant is satisfied once; a carried `rake` can form walking/raking or occupy Front as selected.
Taking a `leg` offer on a walking/raking row may explicitly downgrade it to walking; show the loss.

The three superseding rare upgrades and `spikes` keep their predecessor's capabilities without adding
predecessor upkeep or a hidden extra damage buffer. Currently `compound`, `hook` and `deep` have no active
verb in `PARTS`; gaining Sense/Crush/Dig is an explicit rule change accepted in B. `spikes` already captures
without a separate `arms` copy. `lenses` is the swimmer's predictive eye, not the grazer `compound` ID.

## All 27 existing parts

Abbreviations: **W** worm; **A** arthropod; **T** trilobite; **S** swimmer. Body restrictions remain those of
production `PARTS`, further constrained by the locked families above. **V** means available through the
current starter-verb mapping, **C** as a compatible carried clutch/local form, **M** a common moult offer,
**R** the existing rare route. A default is separately identified in the body table. All common parts
remain in common clutch pools; no new odds or habitat pool changes are proposed.

Effects below describe the approved target model. Each ID contributes at most once, including within a
variant. Upkeep entries are nominal component food per world turn before the single body allowance and
`deep`'s override. Every row follows the injury/shed rules below; coverage means both guarding (only if
stated) and eligibility to be torn, not automatic protection.
The final column is a mapping candidate for old arrays, **never permission to discard a conflicting entry**.

| ID | Bodies; place / family | Effect and verb; nominal upkeep | Visual treatment | Access; legacy mapping |
| --- | --- | --- | --- | --- |
| `claw` | A/T; Front / crushing | Reach ahead; normal shells; Crush; 1 | Paired front pincers | V/C/M; old head → Front |
| `shield` | A/T; Back / cephalic armour | Guard front; no verb; 0 | Cephalic plate extending from Back over head; retains visible front tool | C/M; old head → Back |
| `eye` | W/A/T; Eyes / sensing | +2 passive sense, Sense; 1 | Body-coloured simple eyes | V/C/M; old head → Eyes |
| `spine` | A/T; Sides or Tail / spine; T Back / cephalic armour upgrade | Guard placement's directions; blocked spine strike rests hunter 3 turns; Brace; 1 | Paired lateral spines, rear spine or spined shield | V/C/M; old side → Sides, old tail → Tail; arrays without side need placement review |
| `leg` | A/T; Limbs / walking | +1 range before range cap 5 and Dash multiplier; Dash; 1 | One paired walking row; size changes drawing count | V/C/M/default; old side → walking Limbs |
| `digger` | A/T; Limbs / walking-digging | Buried-food permission and Dig; 0 added to walking's 1 | Digging ends on the walking row | V/C/M; old side → walking/digging Limbs; the required leg is a shown new default, not evidence from old data |
| `rake` | A/T; Front / raking, or Limbs / walking-raking | Graze; 1 alone or 2 with walking | Front rakes or one walking row with rake tips | V/C/M; old side → either displayed candidate; never silently replace claw/legs |
| `gill` | W/A/T/S; Sides / respiration | +2 maximum oxygen (total 5); no verb; 0 | Paired gill fringe | C/M; old side → Sides |
| `gut` | W/A/T/S; Back or Sides / physiology | +2 food per meal, including prey; no verb; 1 | Internal gland tint/inspection inset; no invented external limb | C/M; old side → Back or Sides |
| `pouch` | W/A/T/S; Tail or Sides / brood | Clutch multiplier 2 × size; no verb; 1 | Visible brood sac(s), one effect copy | C/M; old side/tail → Sides/Tail |
| `proboscis` | W; Front / proboscis | Reach ahead and Crush; normal shells still require hook; 1 | Extensible frontal tube | V/C/M; old head → Front |
| `tentacles` | W; Front / tentacles | Graze; 1 | Frontal feeding crown | V/C/M; old head → Front |
| `bulb` | W; Tail / burrowing | Dig; 0; does not itself increase tunnel range | Broad burrowing tail | V/C/M/default; old tail → Tail |
| `arms` | S; Front / grasping | Capture on swimming onto prey; no verb; 0 | One paired frontal arm assembly | C/M/default; old head → Front |
| `spikes` | S; Front / grasping upgrade | Capture and protection from the 1-health prey-spine cut; no verb; 1 | Spines on the same grasping arms | C/M; old arms+spikes → spined arms candidate, not two upkeep/effect copies |
| `lenses` | S; Eyes / predictive | Existing prey-flight prediction and two-tap aiming; no Sense verb or new passive-sense bonus; 1 | Stalked compound eyes | C/M; old head → Eyes |
| `flap` | S; Limbs / swimming | +1 swim speed before frenzy/ambush and cap 8; no verb; 1 | One row of paired flaps, count drawn from size | C/M/default; old side → Limbs |
| `fan` | S; Tail / fan | Ambush multiplier 3 instead of 2; no verb; 0 | Broad tail fan | C/R (all habitats); old tail → Tail |
| `chaetae` | W; Sides / bristles | +1 connected-mud tunnel step before Dash; Dash; 0 | One paired bristle row | V/C/M; old side → Sides |
| `sclerite` | W; Sides or Tail / sclerites | Guard placement's directions; Brace; 0 | Lateral scale row or rear scales | V/C/M; old side/tail → Sides/Tail |
| `compound` | A/T; Eyes / sensing upgrade | +20 passive sense and retained Sense; 1 | Enlarged compound eyes replacing simple eyes | C/R (mud); old head → Eyes; eye+compound is a legacy conflict, not a lossless merge |
| `enrol` | A/T; Tail / enrolment | Staying put blocks all strikes; no verb; 0 | Curling tail joint; affects enrolment pose | C/R (sand); old tail → Tail; on T this duplicates its intrinsic rule, with no extra bonus |
| `blood` | A/T; Back or Sides / physiology | Prevent oxygen loss from vent water, habitat event and low sea oxygen; no verb; 0 | Blue internal tint plus label/inset | C/R (rock); old side → Back or Sides; T armour lock excludes Back |
| `hook` | W; Front / proboscis upgrade | Reach, normal shell permission and retained Crush; 1 | Hook on frontal proboscis | C/R (sand); old head → Front |
| `deep` | W; Tail / burrowing upgrade | In mud total upkeep 0 and +1 egg per lay; retained Dig; 0 | Deep-burrowing tail/buried pose | C/R (mud); old tail → Tail |
| `symbiont` | W; Back or Sides / physiology | Sulfur mat base food ×2 (7 → 14), then gut bonus; no verb; 0 | Internal sulfur-coloured patches plus label/inset | C/R (rock); old side → Back or Sides |
| `progenesis` | W/A/T/S; Back, Sides or Tail / physiology | May lay at any size; no verb; 0 | Developmental trait label/inspection inset; small-body appearance, no invented limb | C/R (all habitats); old side/tail → an explicitly chosen open place; T armour excludes Back |

Rare moult timing stays at the current second/third-moult threshold; the habitat list order and once-only
rare acquisition/passing rule remain. Common offers retain the three-offer bound. Clutch rarity/tier odds,
cross-habitat epic route and guaranteed passed rare card remain unchanged. A card carrying an upgrade
represents that one ID/choice, not all the parent's parts. A valid legacy card is never rerolled during migration.

## Repeated bonuses and explicit balance proposals

Accepted in B: **no ranks or repeated copies in new six-place builds**. This keeps a place one
choice and avoids hidden per-appendage stats. A duplicate offer is replacement/repair, not a power increase;
show this before commitment. Different homes for one ID do not allow two copies. Superseding upgrades
cannot coexist with their predecessors in another place. Existing arrays keep their old meaning.

| Current repeated effect | Approved target effect | Before → after example (otherwise same build) |
| --- | --- | --- |
| Each `leg`: +1 range and +1 upkeep | One walking-row bonus, +1 range; nominal 1 covered by A/T allowance | Two legs on A: range 4, upkeep 3 → one row: range 3, upkeep 1 |
| Each `flap`: +1 speed and +1 upkeep | One flap-row bonus; nominal 1 covered by S allowance | Two flaps: speed 4, upkeep 3 → speed 3, upkeep 1 before frenzy/ambush |
| Each `chaetae`: +1 tunnel, no upkeep | One +1 tunnel bonus | Two bristles: tunnel 5 → tunnel 4; worm's sand crawl stays 1 even with Dash |
| Each `gill`: +2 oxygen, no upkeep | One +2 oxygen bonus | Two gills: max oxygen 7 → 5 |
| Each `gut`: +2 per meal and +1 upkeep | One +2 food bonus | Two guts on a mat: gain 9, upkeep 3 → gain 7, upkeep 2 |
| Each `pouch`: +size eggs and +1 upkeep | One +size egg bonus | Size 3, two pouches: 9 eggs/lay, upkeep 3 → 6 eggs/lay, upkeep 2 |
| Each `eye`/`compound`: +2/+20 sense and +1 upkeep | One sensing choice; compound replaces eye | Old single grazer head cannot hold both, but valid saved arrays may: A eye+compound means sense 23 → compound choice sense 21; preserve that old array as legacy |
| Repeated guards or boolean traits | One choice; effects do not multiply | Two side sclerites can be torn separately now → one mirrored row covers both flanks but is lost together |

Other reviewed changes:

- **Action-preserving upgrades (accepted in B):** compound/hook/deep gain Sense/Crush/Dig; existing range/recharge/food
  numbers for these actions stay as defined in `VERBS`/`verbs.ts`. Hook's Crush can open an adjacent carcass
  at any size with the existing +4 bonus, where old hook alone only offered normal forward reach.
- **Default feeding matters:** a worm Sweeper now retaining its default bulb has Graze/Dash/Dig and
  upkeep 2, versus Graze/Dash and upkeep 2 now. Its new representative equipment splits sea effort between
  mats and rot (one half each), versus mats only. Removing the bulb is an explicit alternative. Other new
  defaults (leg, shield, flap) do not themselves add a sea food source. Actual diet is still recorded separately.
- **Finite places constrain combinations:** gill and lateral guard cannot share Sides; gut/blood/symbiont/
  progenesis compete for their declared homes; T's Back armour leaves fewer physiological combinations.
  For example, T can currently carry gill+gut+blood+pouch across side/tail slots; with Back locked it must
  choose gill, gut or blood on Sides, while keeping pouch on Tail. No effect is deleted, but that combination
  is unavailable in a new build. W can use symbiont on Back and gut on Sides, retaining double bloom food
  followed by +2, or trade one for gills. These are real build restrictions for review.
- **Starter conflicts:** default Dash plus Graze/Dig/Crush would be four verbs on A/T; require a changed
  selection, never a hidden fourth action. Worm Tank's bulb/brace/crush uses all three; carrying an eye
  creates a visible fourth-verb conflict unless a starter/default is replaced. Quick presets must show
  the exact build and any conflict; do not silently trim their advertised pair of actions.
- **Armour placement:** shield moves from head to Back but still guards front. This allows claw + shield
  + eyes together on A/T, unlike the old one-head-slot body. T receives shield as a new free-upkeep default.
- **Damage is by row (accepted in C):** bilateral coverage, simultaneous loss of both flanks, shared Front/Eyes
  exposure and bundled variant loss are intentional directional-combat changes, specified next.

Upkeep and the verb ceiling remain explicit balance revision points after equipment playtesting. Adding
ranks, extra physiology sockets or arbitrary component stacks would require a separate model proposal.

## Directional guard, injury and shedding contract

Strike direction stays relative to facing: front, right, back, left. Keep the current resolution order:
mud hiding (except the player's lens-equipped hunter), Dig, stay-put enrolment, active Brace, matching
passive guard, tear/damage. Brace guards every direction and causes the current three-turn hunter rest;
ordinary blocks retain the current one-turn rest unless a spine blocked. Hunter arm spines bypass passive
guards, not mud/Dig/enrolment/Brace. No new vertical/dorsal strike direction is added.

| Occupied place/variant | Can be struck from | Passive guard |
| --- | --- | --- |
| Front, including arms/spines | Front | None; arm spines protect capture, not predator strikes |
| Eyes | Front | None |
| Limbs, including paired variants | Left/right | None |
| Sides | Left/right | `spine` or `sclerite` guards both flanks; all other choices have no guard |
| Back with shield/spined shield | Front | Front; spined shield also has spine rest effect |
| Back with physiology | Left/right | None; internal traits remain damageable equipment |
| Tail | Back | `spine` or `sclerite` guards rear; enrolment is resolved earlier if staying put |

When a passive guard is bypassed by hunter spines, tear that guard first. Otherwise tear the last occupied
eligible row in this fixed order: Front, Eyes, Limbs, Sides, Back, Tail. This replaces old slot-array ordering,
not installation order; show the prospective lost row in the strike preview. A normal guard is not consumed.
No eligible part means 1 health damage; a tear absorbs that base damage. Softness adds 1 health damage to
an unblocked hit whether or not a row was torn, as now. Empty locked places provide no damage buffer.

Tearing removes the **whole choice** and all its effects, verbs and nominal upkeep. Recompute the body
allowance too: losing `leg`/`flap` removes its allowance, leaving base upkeep 1 plus surviving paid tools.
A walking/raking tear loses Dash, Graze and +1 range at once; a torn spined shield loses Brace and the
shield. This is harsher than
losing one old leg/rake copy. A Sides guard protects both flanks where one old side copy protected only
its own flank, but a bypass removes that entire protection. A non-guard gut in Back can absorb a flank
strike, as an old gut could absorb its assigned side's strike; the inset explains its loss without drawing
an external organ. `blood`, `symbiont` and `progenesis` are not immortal traits hidden outside equipment.

Starvation still costs the newest installed surviving choice, then health if none remains. Record row
installation order: defaults in body-table order, carried choice, chosen starter parts, then moult choices.
A merge/upgrade makes that row the newest once; no duplicate order entries. Locked rows can be shed.
Removal never restores the predecessor/default for free. Clamp current oxygen to the reduced maximum
when losing gills; do not refill oxygen on replacement except the normal starting fill. The three-verb
check runs before installation, not after a hidden fourth action has been accepted.

Moulting still pays once, grows one size, grants at most one committed part change, and ends no turn.
Offers must have at least one fitting placement/replacement with a legal final verb set; preview all losses
and resulting upkeep. Filter illegal offers without increasing the three common/one rare offer bound.
Use one existing common-pool shuffle, then take the first three legal candidates; do not reroll to fill
empty offers. For rares, retain habitat order and show the first eligible legal candidate without an extra
random draw. Keep the rare eligibility state if no rare was installed. Explicit **Finish growth without
a part** returns to play with the size/cost/softness already applied, installs nothing and does not set `rareGot`. It is
always available, including when no offer fits. No invisible replacement, swallowed choice or dead end.

## Save, legacy build and design-code boundary

Use an explicit **v4 sea save** for the eventual semantic change. This document does not change
`SEA_SAVE_VERSION`. A tagged legacy `PartId[]` and a tagged six-place build must remain distinguishable;
never make v3 arrays mean new rows simply by adding optional fields. New choices must record placement
and variant, not only flatten to a list (e.g. frontal rake versus walking/raking has different coverage).
Validate body/family restrictions, duplicate IDs, allowed variants, active verbs and counts before use.

Conversion policy accepted in C, for eventual cutover:

1. Preserve the exact imported v3 JSON as recoverable migration input, including any existing v1/v2
   `legacy.json`. Keep the current v1/v2 migration path and then apply the v3→v4 boundary; do not replace
   the oldest recoverable input with a guessed reconstruction. Migration does not roll RNG or advance time.
2. Copy seed, timestamps, RNG, species IDs/order associations, patch graph, populations, fitness, history,
   progress, forms, continuation and pending results with their original meaning. Never seed animals at
   launch or rescale fitness because a part contract changed. Current parse/export/storage protection remains.
3. Tag existing species/pending arrays as **legacy slot-build semantics**. Retain original order, repeats,
   mixed parts and recorded diet. Do not add defaults, collapse repeats/upgrades or reinterpret their feeding
   through the new action aliases. Existing residents continue using the old feeding interpretation until
   legitimately replaced by a new representative build. Unknown residents remain honestly generic/sea-only.
4. Old arrays do not record slot directions. Even a simple mapping cannot reconstruct exact injury coverage.
   Show a preview as a migration proposal, with unresolved placements and any bonus/cost changes. Before
   launching from an old code/form, the player confirms a legal new starting design and sees every conflict.
   Resolve only that starting design; retain the source data/export. Unchosen parts are not a new inventory.
   Repeated `leg,leg`, `eye,compound`, incompatible locks and full physiology places must not be auto-dropped.
5. Old pending results retain their exact eggs, already-rolled cards, last-lay array if present and diet.
   They block launch until settled through the existing single owner. Settlement releases the exact eggs
   once using the legacy representative/feeding path and performs the existing two generations once.
   If an old pending result lacks parts, retain the existing documented body-compatible fallback, not an
   inferred full adult build or a new default-filled parent. Injuries after laying never rewrite its snapshot.
6. New last-lay snapshots contain exact six-place choices/variants and injury state as of that lay, before
   later damage. Keep terminal appearance separately if needed. Latest lay supplies equipment as now;
   cumulative actual eggs supply release. The strongest successful release supplies the aggregate body/diet
   representative, latest wins ties; a weaker release does not downgrade it. It can remain a legacy build.
7. A malformed/newer import changes no active save. Retain the current unread-startup-save write block,
   recoverable backup/export and visible storage retry. No personal browser storage is used for fixtures.

For codes, retain the current `CLADE-` seven-field decoder as a legacy design decoder. It still grants no
population, eggs, visitors or launch access. Decode and compatibility validation are separate: valid but
conflicting old codes report their parts/places/verbs rather than becoming corrupt or silently trimmed.
Publish new exports in a distinct versioned envelope (`CLADE2-`) containing the exact starting
choices/variants/placements and carried-part provenance needed to reproduce the offered build. Keep the
checksum/validation approach; reject unknown versions. The old format cannot faithfully encode every new
variant or placement. Never export an approximate verb-only design as though it were the equipped one.

## One-part continuation and local forms

New continuation records need three distinguishable trait states: **legacy/unknown**, **explicitly none**,
or **one chosen part with source clutch identity** (patch, body/diet line and settled Life). Missing data
must not make an explicit no-part choice resurrect a saved local form.

- A positive result settles once and records the selected compatible card, or explicitly none if no card
  was chosen. It follows continuation to the clutch patch or a direct neighbour. A zero-egg result retains
  the previous continuation and trait. Keep completion saved before terminal playback and settlement atomic
  with release/pending removal; a pending result's unresolved choice cannot become a launchable trait.
- For legacy/unknown only, look up the exact continuation source patch/body/diet form, then the existing
  documented habitat/role fallback, and accept evidence only if compatible with that continuation's body.
  Check the selected launch body's compatibility separately. Record that this was a legacy
  local-form fallback, not proof of the parent's full build. No evidence means no inherited trait.
- Changing launch body does not erase the stored trait or silently replace it with the target patch's
  form. Show incompatibility or place/verb conflicts. Allow explicitly leaving it behind for this Life.
  Compatible local forms remain an explicit alternative to the continuing trait, never an additional part.
- Superseding a default with its upgrade supplies one choice. Choosing a clutch card carries that one
  part only; any required ordinary default in its variant is shown and costed. It does not inherit an adult
  row's accumulated equipment. Keep old local forms even if not selected for this launch.
- Sea identities remain aggregate body/diet lines. Equipment determines capabilities; eaten food records
  diet. No independent persistent species for each build, new lineage gate, recipe or XP system is implied.

## Verification plan and review exit

This checkpoint needs documentation link/anchor, 27-ID/four-body coverage, source-consistency and diff
checks. No gameplay tests or browser play are claimed for a documentation-only change.

After the review, before any runtime switch, stage deterministic pure fixtures for:

| Fixture group | Required evidence |
| --- | --- |
| Definitions | Exactly all 27 production IDs and four body IDs; six unique places; at least three open places; legal/costed defaults; every part has a legal home on every listed body |
| Starters/variants | All current presets on each body; carried part × body × preset conflicts visible; no free passive fills; no duplicate defaults/bonuses; walking/raking coexist; capture/sensing/crush/dig preserved by declared upgrades; fourth verb rejected |
| Bonuses | Numeric before/after examples above; size does not multiply bonuses; nominal costs sum once with one current-component body allowance; four default-only builds cost 1; loss/repair/variants/overlap never double-discount; `deep` override; mat/bloom/prey food; clutch sizes; legacy arrays retain their old semantics |
| Injury | Four directions × four facings; guards and bypass priority; Eyes/Front and mirrored rows; whole variant loss; softness; every locked/default/physiological row can be lost; starvation order; no free restoration; gill oxygen clamp |
| Growth | Full/locked bodies, no fitting common/rare offer, replacement and downgrade previews, duplicate repair, skip with growth/cost retained, rare passing only after a real install and lay; no phase trap |
| Persistence | v1/v2/v3→v4 and v4 round trip; repeat/mixed/unknown builds, nested backups, unchanged population/RNG/graph/progress; old/new pending reload and exact once-only settlement; last-lay build after later injury |
| Continuation/codes | Chosen part follows neighbour; zero eggs/failure/extinction retain it; no-card clears the new trait; legacy exact-source fallback; incompatible body retains stored forms; old codes decode/conflict visibly; exact new-code round trip; malformed imports leave active state unchanged |
| Integration | Equipment/board/result/resident agreement; feeding adapters in the runtime cutover; existing sea regressions, `npm run check`, `npm run build:game`, updated disposable-profile `scripts/sea-smoke.mjs` |

Equipment drawing, head joins at sizes 1–5, real board performance comparison and player/phone checks
belong to 20B/20C and remain open. Do not check off the whole slice's contract criterion until rules are
approved and their staged fixtures exist. Do not repeat the completed art/performance audit for this review.

**Next action:** in a fresh implementation session, stage the approved pure body/part definitions,
compatibility/preview helpers and focused fixtures. Keep `Life.slots`, runtime offers/feeding, the v3 codec
and UI unchanged at this checkpoint. Test definitions, starters/variants/conflicts, allowance arithmetic,
injury/shedding and legal replacement/skip projections; retain existing regressions and save a verified
handoff. Persistence/code round trips and integrated equipment/board checks follow in their dependent
stages. No runtime body integration is authorized by this review. Revisit A's costs/locks/verb ceiling
after equipment playtesting; accepted calls need not be re-asked to stage their model.
