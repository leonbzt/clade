# N2 · the Life · Session 2

11 Nov 2026 · `n2-the-life` · E–G · [review sheet](n2-sheet/index.html) · [deterministic results](n2-sheet/play-results.json).

The Life screen and Colonise loop are playable. The old floor, camera, creature drawing, shadow, marks, effects and
playback are ported; the HUD reads the new Grow, Enforce and Lay rules. Creature places follow growth and losses.
Dev species are registered with their ancestors before founding. No sea generation passes during a Life.

## Three normal Lives

Seed 3, **First worm**, one shared sea, Life counts 1–3. No dev food or forced endings. The bounded route in
`scripts/dev/n2-play.ts` uses normal actions and revealed food; it prioritises feed, then brood, then guard/sight.
The browser follows the same decisions through the Life controls' action path, including animated playback.

| Habitat | Species | Enforced | Eggs → heads | Health at season end |
| --- | --- | --- | --- | --- |
| Lee mud flats | Grazer worm | tentacles, pouch, sclerites | 86 → 172 | 3/3 |
| Stream mud shallows | Digger worm | bulb, pouch, eye | 60 → 120 | 2/3 |
| Northwest sand slope | Digger worm | bulb only | 20 → 40 | 3/3 |

All three colonies appeared in their launch habitat, at generation 0. Results show the sea's three fitness reasons
and its growth judgement. A separate starvation run verified death, retaining three eggs and founding six heads.
A zero-egg result founds no population. Going back destroys the Life view and its keyboard/ticker hooks.

## Do the boards ask for different Enforce choices?

A small comparison, **not an optimal-strategy search**: the same digger, seed, habitat and Life count, with three
priority orders. The route waits for the next requested part to switch on before buying later parts, so these
numbers include that policy's costs. Each comparison starts from First worm.

| Digger's order | Mud flat | Mud shallows | Sand slope |
| --- | --- | --- | --- |
| Feed → brood → sight | 26 eggs, died | 60 eggs | 20 eggs |
| Brood → feed → sight | 15 eggs, died | 66 eggs | 0 eggs, died |
| Sight → feed → brood | 32 eggs | 66 eggs | 0 eggs, died |

The best order among these differs: sight first on the flat, brood/sight first in the shallows, feed first on the
slope. The sparse slope punishes delaying food and sheds later parts; the grazer's flat Life supports repeated
laying. This supports the slice's question provisionally. Whether the feel matches the old Life still needs the
user's judgement. The flat's 86 eggs is much larger than the spec's illustrative 10–18; no numbers were rebalanced.

## Visual review

The sheet contains eight generated starts: seeds 1 and 3 rock deep, sand slope and mud shallows; seed 2 sand flat;
seed 3 mud flat. There are 360 × 844 and 1280 × 900 captures, Enforce lists, results, each colony and the map after
three Lives. Starts can be compared side by side in the HTML sheet. Food counts are recorded with the samples.

The hit and enforced-block captures use a labelled fixture: a front strike on an exposed worm, then a front
strike after normal Grow and Sclerites Enforce. The real strike rule and playback run in both cases; these are
separate from the three normal Lives. The block spends one enforced guard rank. The dev food button adds ten
without advancing a turn; End the season reaches the normal result flow.

The first 360 px result overflow was fixed and every result now has a viewport-bounds assertion. The existing
map labels remain crowded on a 360 px overview; cards show exact populations. The Life controls scroll when all
three Enforce rows are visible. The port keeps its old drawing colours in `view/shade.ts` until L1, as specified.

## Reproduce

- `node scripts/dev/n2-review.mjs`: three deterministic Lives and nine order comparisons; writes `play-results.json`.
- `W=360 H=844 npm run look -- /clade/ scripts/look/n2-sheet.json`: phone captures and browser assertions.
- `W=1280 H=900 npm run look -- /clade/ scripts/look/n2-sheet.json`: desktop captures and browser assertions.
- Copy the resulting `n2-board-*`, `n2-life-*`, `n2-map-three-lives`, `n2-hit` and `n2-block` PNGs from `.shots/`
  into the corresponding `phone/` or `desktop/` sheet folder before running the other size.

Type checks, simulation/UI integration tests, import laws and the final `npm run check` are recorded in status.

## Your notes (11 Nov, a short first play)

- "the base currently still plays well and the new maps feel really cool and its nice that they are different and
  feel like the habitat youre in."
- "its cool that the enforce show the payoff times"; the UI is clear and looks "very professional and nice".
- **Main issue: too little choice.** "the current setups only had one enforce option and no body view, so it felt like
  there was less choice and strategy involved"; "no feeling of equipping or crafting like an rpg, no body parts
  selection."
- Bars: "i liked to bigger well visible food health and oxygen bars better."
- "where did the planned extra species go?" (Grazer and Digger worm are in the map bar's Build list, not in a preset.)
- Old-Life feel verdict: more testing to come.
