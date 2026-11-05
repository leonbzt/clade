# Playtest 09: the stack test (slice 08)

The slice: [slices/08-stack-test.md](../slices/08-stack-test.md). Two builds of the mud flats Life; you play both and pick.

## Godot half (5 Nov, AI build session)
Build: [`spikes/godot-life/`](../../spikes/godot-life/README.md), Godot 4.7.2 stable (the latest 4.x), GDScript, Compatibility renderer.

**In it:** the mud flats board and its rival, the worm with a fixed body (gut gland, sclerites), move and tunnel, eat, moult
(pick one of 3–4 parts), lay, the mudslide, and the hunter (arrive, hunt, mark, strike, rest). Feel: glide with stretch and
landing squash, eat bursts with a floating +food, stock bars that tick pip by pip, pulsing strike marks with an arrow, camera
shake and a red flash on a hit, pan, pinch and wheel zoom. Portrait layout with thumb-sized buttons; on desktop the same
column sits in the middle. Pixelify, one frame colour.

**Where to play:** on the phone, the private page https://claude.ai/artifact/MG9hUEo96KYvYqew9x95GQ (the engine is split into
three parts there because of the host's file limit; it ran locally, but the AI couldn't open the hosted page itself, so if it
shows an error, use the next route). Locally: `npm run dev -- --host`, then `/spikes/godot-life/build/web/index.html`.
Android: the APK was sent in the session's chat (not committed).

**Measured** (headless Chromium, software WebGL, so on the slow side):
| | |
| --- | --- |
| Web download | `index.wasm` 39.5 MB (10.1 MB gzipped), `index.pck` 0.1 MB, `index.js` 0.3 MB. The wasm is Godot's stock engine, the same for any game. |
| Load to the first board | desktop 1.3 s · CPU slowed 4× (a phone stand-in) 4.9 s · plus 20 Mbps 21 s · plus 8 Mbps 45 s (uncompressed) |
| With gzip (estimate) | about 9 s at 20 Mbps and 15 s at 8 Mbps on a phone |
| Android APK | 26.5 MB, arm64 only |
| Tests | 37 checks of the ported rules, about 10 ms headless |
| Export | web 4 s, Android 9 s |

Open question 2 (is the load fine for itch?): borderline. 10 MB gzipped is fine; 40 MB raw on mobile data is not. Whether itch
serves the wasm compressed is not checked yet. A custom engine build without 3D would shrink it (not tried).

**Workflow log**
- *Easy:* getting Godot into the cloud (one download, templates trimmed to web and Android); headless import, tests and
  exports are one command each and take seconds. Porting the rules was close to line by line. Tweens with `await`,
  particles, the camera and touch input are built in. The five feel values are `@export_range` sliders. Driving the web
  build in headless Chromium with taps, a pinch and screenshots worked, so the AI could see what it made.
- *Fought:* Pixelify's "fl" ligature showed as an A again (fixed in the theme with ligatures off). The first camera fit ran
  before the layout existed. GDScript's `:=` fails on untyped values, and names like `log`, `ease` and `sign` clash with
  built-ins; both only show up when the script loads. GDScript runs longer than TypeScript: the rules went from 358 to 591
  lines, `main.gd` is 425, so two files break the ~400-line rule (left, since this is throwaway).
- *Android:* Google's SDK host is blocked in the cloud, so there was no `apksigner`. Worked around with a stub SDK and a
  stand-in signer built from apksig on Maven Central (v2 signature, verifies). On your machine the normal route is the SDK
  from Android Studio; then the editor exports with one click.
- *Not seen by the AI:* the real editor (the scene and theme were written as text and load cleanly, but nobody has looked at
  them in the editor yet) and a real phone.
- *Needs your hands:* tuning the five values, opening it on the phone, judging the feel.

**AI choices for you to judge**
- The board is the toy's map turned a quarter (8 × 11), so it fills a phone held upright; tiles are about a third bigger.
- R2's fixes: the hunter is Anomalocaris (not Peytoia), the mud flats and mat lines are corrected, "shell bed" for brachiopod bed.
- Moulting: tap a part; it goes in the first free slot it fits (no parts screen). The body is drawn 1.5× the toy's pixels so a
  hatchling shows on a phone.

**Your notes** (5 Nov)
- "everything seems a lot smoother for the animation and board but the look in general is really rough and looks more like
  from a template."
- "i feel more freedom for ai is also good."
- Not noted yet: the feel values you settled on, how tuning in the inspector went, the phone.

## PixiJS half (5 Nov, AI build session)
Build: [`spikes/pixi-life/`](../../spikes/pixi-life/README.md), PixiJS 8.22, TypeScript, Vite; the screen around the board is HTML and CSS.

**In it:** the same Life as the Godot half: the mud flats, its rival, the fixed worm, move and tunnel, eat, moult (pick a
part), lay, the mudslide, the hunter (arrive, hunt, mark, strike, rest). Feel: the same list (glide with stretch and landing
squash, eat bursts and a floating +food, pips that tick one by one, pulsing marks with an arrow, shake and a red flash, pan,
pinch and wheel zoom), and the five values as sliders in a dev panel (the **Feel** button), live, kept in the browser.
**The look is different on purpose** (your call, 5 Nov: "dont keep the simple shapes, feel free to do a free interpretation").

**Where to play:** on the phone, the private page https://claude.ai/artifact/EmQkbFhyV8LLhx5CYe7Jm8 (one 647 KB file).
Locally: `npm run dev`, then `/spikes/pixi-life/`.

**Measured** (headless Chromium, software WebGL; same throttling as the Godot half):
| | Godot | PixiJS |
| --- | --- | --- |
| Download | 39.5 MB wasm (10.1 MB gzipped) | 647 KB, one page (210 KB gzipped) |
| Load to the first board: desktop | 1.3 s | 0.2 s |
| CPU slowed 4× (a phone stand-in) | 4.9 s | 0.7 s |
| plus 20 Mbps / 8 Mbps | 21 s / 45 s | 0.6 s / 0.8 s |
| Frame rate | not measured | 60 fps (software WebGL) |
| Tests | 37 checks, about 10 ms headless | the same checks in 9 vitest cases, 0.2 s; inside `npm run check` (8.3 s in all) |
| Build | web 4 s, Android 9 s | web 1 s; no Android (a store build would need a wrapper like Capacitor, not tried) |
| Code | rules 591 lines, `main.gd` 425, view about 700 | rules 383, `main.ts` 318, view 870 and UI 200 (the view holds the new look) |

Open question 2 (load for itch) has an easy answer here: under a second.

**Workflow log**
- *Easy:* one `npm install`; the rules port was close to a copy of the toy's TypeScript, so it kept its length (358 → 383 lines
  with the events; GDScript grew to 591). Type errors show at once in the editor and `npm run check`; hot reload shows a change
  without a rebuild. The AI drove the page in headless Chromium with real taps, a two-finger pinch and screenshots, and
  played a whole Life to its end, so it saw what it made. The low-res look was two lines (a canvas resolution below 1 and
  `image-rendering: pixelated`). The page ran under a strict CSP with Pixi's `unsafe-eval` module.
- *Built by hand* (what Godot has built in): tweens (a 46-line tweener on Pixi's ticker), particles (part of `fx.ts`), the
  dev panel instead of an inspector (64 lines), the camera with pinch (104 lines; the Godot half wrote its own input too).
  Text and menus are HTML rather than Pixi, which kept them crisp and quick to style.
- *Fought:* Pixi 8's drawing API (shape first, then fill) took one look at the docs; overlapping shadows doubled up until
  they went through one alpha filter. Readability needed the screenshots: buried, you were nearly invisible; lit tiles
  merged into a pattern of crosses; the hunter read as a torpedo. Each was fixed after looking. Pixelify's "2" reads like
  an 8 at small sizes (in both halves; a look-topic note).
- *Not seen by the AI:* a real phone, and the hosted page itself (it ran locally inside a copy of the host's skeleton and
  CSP).
- *Needs your hands:* tuning the five values, the phone, judging the feel and the look.

**AI choices for you to judge**
- The look: 2D low-poly from the look toy, read freely: the seafloor is one faceted mesh (sand, mud basins, rock) lit by one
  sun, boulders cast shadows, caustic light drifts over it, marine snow falls. Pixel size 2 (a slider under Look).
- The creatures: you and the rival are chains of segments that trail around corners when tunnelling and ripple as they
  crawl; your parts show on the body (the gut gland glows amber through it, sclerites are pale plates). Buried, you show
  dim with a silt outline. The hunter swims above the floor (its shadow shows the height), its flaps ripple, its arms
  uncurl to strike, its eyes dim while it rests.
- Moulting leaves your old skin behind for a moment (priapulids do moult); laid clutches stay on the board as amber eggs.
- As in the Godot half: the board turned a quarter, R2's names, a picked part goes in the first free slot.

**Your notes** (5 Nov)
- "pixi is good enough stay with this for itch." The pick; the five values aren't tuned yet.

