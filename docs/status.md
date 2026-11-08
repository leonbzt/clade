# Status

Updated 8 Nov 2026 (Claude). Branch `slice-20a-model` (from `main`), 20A committed as `b34e9cc`. The long Codex-era
status is at `git show 8b5b202:docs/status.md`.

**Milestone:** M2. Step 4, [slice 19](slices/19-join-the-sea.md): built, human checks open. Step 5,
[slice 20](slices/20-join-the-bodies.md): **20A model built**, 20B (equipment view) and 20C (cutover) next.

**Done (8 Nov, this session):** the [20A contract](design/20a-body-part-contract.md) as a pure model, runtime untouched.
- `game/src/data/body.ts`: six places, homes per part, three variants, upgrades, defaults/locks, allowance, presets.
- `game/src/sim/body.ts`: anatomy/build checks, stats (upkeep, range, speed, tunnel, sense, oxygen, food, clutch),
  verbs with the ceiling (walking Dash free), `startBuild` (defaults → carried → design, conflicts listed),
  `changesFor`/`legalOffers`/`rareOffer`/`moultBuild`.
- `game/src/sim/body-hurt.ts`: `strikeOn` by side, whole-row `loseRow`, `shed`, frozen `snapshot`/`parseBuild`,
  `CLADE2-` `encodeDesign`/`decodeDesign`, `nextTrait`/`traitFits`. `share.ts` now exports its b64/sum helpers.
- `game/tests/body.test.ts`: 18 fixtures, all groups except the sea save version and neighbour-following (20C).
- `npm run check`: passes in ~7.9 s, but `garden.test.ts:65` (old garden step budget, 0.1 ms) fails ~1 run in 3.

**Decided:** nothing new this session.

**Next:**
1. 20B: port the painter, fix the head poke, equipment preview in the launch flow (not launching yet).
2. 20C: switch runtime to `Build` (parts, feeding, offers, drawing, saves, reset) in one change; play it.

**Open:**
- AI readings of the contract, for your OK (all in code, easy to change): a starter that extends a default row keeps
  its install position; a variant needs its base (rake can't repair empty walking limbs); spined shield is T only;
  any offer that changes nothing is filtered (fixes the ~8% empty swimmer rewards); offering a predecessor when you
  hold its upgrade is a duplicate.
- Flaky `garden.test.ts` timing budget under the parallel check: loosen or drop it (the garden is the archive's).
- P47 (start era, game words, stat bars), P46 (body shape effects). Slice 19 checks: unaided next-patch discovery,
  3–5 Lives, a real phone; founding-map labels; code terms in the UI.
