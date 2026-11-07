# Part C and the gameplay review (7 Nov)

Planning from the user's Part B feedback, the current implementation, and the
[release vision](full-version.md). This is a focused diagnosis and review agenda, not a completed gameplay audit.
The [Part C specification](../slices/19-join-the-sea.md#part-c-implementation-specification) is the next build boundary.
Review timing and design recommendations below are proposals; the adopted [roadmap](../../ROADMAP.md) is unchanged.

## The route to release

| Boundary | What the player should gain |
| --- | --- |
| Step 4, Part C | The living sea as home; see the consequences of a Life and choose the next patch |
| Proposed review, after C and before step 5 | One coherent account of building, inheritance, founding species and strategic progression |
| Step 5, join the bodies | Recognisable custom creatures; large equipment view with visible places and parts; verbs from the build |
| Step 6, after a Life and the climb | Hatching, genes, XP, trees and recipes introduced gradually; earned lineage progression |
| Step 7 | 6–10 distinct lineages, living algae and a richer food chain; stretch animals only if cheap |
| Step 8 | Shore Life and the release's ending/cliffhanger |
| Steps 9–10 | Consistent art/UI, balance, mid-Life saving and release preparation/publishing |
| Later, M3 | Additional kinds of Life and minigames, including filter feeding |

The three remaining body-toy play checks stay open. Use them as inputs to the review and step 5;
Part C does not certify the body toy or finish the release.

## What the Part B feedback means

- **Missing living sea:** `Meta.svelte` still calls the static island renderer. The simulation is already running;
  the visual port is missing. Port the sea toy's patch presentation onto production state, not its old nine-native world.
- **Species open too fast:** `launchBodies` offers all four existing bodies as soon as a successful clutch exists.
  This is the explicitly temporary bridge, not a tuned unlock ladder. Raising tier thresholds would not create
  the intended evolution system. Keep the first founding rewarding; make later species changes earned in steps 5/6.
- **Equipment view:** the user confirmed the large creature with visible slots and parts beside it.
  Current verb cards and a carried-form toggle do not meet that request. Make it a concrete step-5 deliverable,
  with the six-place/body work; do not build a disposable second equipment system in C.

Actual reported feedback and the future play protocol are in [playtest 19](../playtests/19-join-the-sea.md).

## My preliminary design assessment

The Life already has useful RPG foundations: equipment grants actions, slots and upkeep impose costs, and
movement, food, growth, reproduction and danger compete for turns. The weakest connection to the vision is
currently persistent ownership of a build and meaningful species progression. A better map exposes that gap;
it cannot close it on its own.

| Topic | Current evidence | Question and recommended direction for the review |
| --- | --- | --- |
| Genes and inheritance | Moults draw from body-compatible parts, with rare offers during the Life. Clutch cards retain one chosen part per patch/body/diet. There is no lineage gene library or XP tree yet. | Give genes a clear job: inherited possibilities, including reproductive surprises. Let the tree steer the offer pool and moults express it. Avoid a second unrelated layer of stat loot. |
| Founding | First eggs establish a population; body access then opens immediately. | Distinguish founding a population from evolving a new lineage. The latter should follow a recognisable build and a demonstrated playstyle, not just selecting a new body. |
| Ownership across Lives | A carried form is patch/body/diet-specific. Moving to a neighbour need not carry that selected part there. | Decide which traits belong to the continuing line and which belong to a local population. Spatial exploration should not accidentally erase the feeling of inheritance. |
| Species identity in the sea | Builds share body/diet slots. The best clutch supplies representative parts; fitness uses egg performance. | Decide the minimum identity needed for “that is my creature”. Do not promise independent persistence of every build under the current aggregate model. |
| Equipment and body | Starting verbs choose parts in the UI; parts determine the actual actions. The large body screen is absent. | Put the creature first: inspect a part's action, cost and visual effect, then choose it. Carry that identity through the run and result. |
| Strategy and RPG feel | There are real tactical costs, but egg totals dominate rewards and ecological fitness. | Test whether different builds change decisions and suit different patches. More power or more menus alone will not establish strategy. |
| Minigames | The roadmap places additional kinds of Life after this release. | Keep the shared arc—prepare, play, reproduce, change the sea—usable by later minigames. Prove the current Life first; add no minigame framework now. |

Specific risks to test: rare rolls dominating planned builds; reproduction upgrades crowding out other strategies;
recipes becoming a shopping checklist; advanced lineages losing too much customisation to locked places;
and ecological hooks occurring mostly beyond the current clutch's legal neighbours.
These are hypotheses, not observed balance findings from this session.

## When and how to do the general review

**Recommendation: after Part C's connected-loop playtest, before implementing step 5.** Earlier, we would be
judging the sea through missing presentation. After step 6, changing inheritance and species identity would cost more.
If a phone is temporarily unavailable, the review can use desktop play and retain the phone check as explicitly open.

Use one fresh design session. Start with C's actual notes and the release vision. Follow one concrete example
through every screen: choose a patch and build, play and moult, lay, hatch, retain traits, change lineage, see
its population, and choose the next Life. Compare two meaningfully different builds on the same base and
one proposed lineage transition; clearly separate playable evidence from paper designs.

Record a small set of useful numbers: turns/time to first eggs, eggs and survival, choices that changed a route,
time to an understood next run, and points where players could not explain a result. Permanent unlock pacing
must be evaluated again when step 6 exists; Part C's all-bodies bridge cannot measure it.

End with one system-role table, one example progression, a short ranked gap list, and at most three decisions
needed for step 5. Reuse the existing body/slot decisions and P46 rather than reopening the art/framework audit.
Resolve body/identity decisions before step 5; record XP ownership, respec and reward pacing for step 6.
Later checks should test those decisions in play, not repeat the whole general audit.

## Implementation agent and context budget

Recommendation, checked 7 Nov: **one Codex agent using GPT-6.1 Sol at medium reasoning**, in a fresh session.
Part C spans drawing, Svelte state, completed-result feedback and regression checks, so it is more than a small
styling edit. OpenAI's [model-selection guidance](https://developers.openai.com/api/docs/guides/model-selection)
positions Sol medium for complex technical work, and Terra for scoped fixes.
[Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra) has lower listed API token prices and is
a reasonable option for a subsequent isolated visual fix; there is no measured token comparison for this repository.
API prices do not establish this account's subscription usage or limits.

Token count, per-token price and retries are different costs. The practical saving here is a bounded spec,
targeted source reads, one agent, deterministic checks, and no repeated architecture audit. Start with
AGENTS.md, status and slice 19; read this review document only if its design context is needed. Escalate reasoning
only for a concrete unresolved problem. This recommendation does not change the active model or start an agent.
