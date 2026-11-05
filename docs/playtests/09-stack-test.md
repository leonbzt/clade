# Playtest 09: the stack test (slice 08)

The slice: [slices/08-stack-test.md](../slices/08-stack-test.md). Two builds of the mud flats Life; you play both and pick.

## Godot half (5 Nov, AI build session)
Build: [`spikes/godot-life/`](../../spikes/godot-life/README.md), Godot 4.7.2 stable (the latest 4.x), GDScript, Compatibility renderer.

**In it:** the mud flats board and its rival, the worm with a fixed body (gut gland, sclerites), move and tunnel, eat, moult
(pick one of 3–4 parts), lay, the mudslide, and the hunter (arrive, hunt, mark, strike, rest). Feel: glide with stretch and
landing squash, eat bursts with a floating +food, stock bars that tick pip by pip, pulsing strike marks with an arrow, camera
shake and a red flash on a hit, pan, pinch and wheel zoom. Portrait layout with thumb-sized buttons; on desktop the same
column sits in the middle. Pixelify, one frame colour.

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

**Your notes** (after playing)
- Values you settled on: glide_time __ · squash __ · particle_count __ · shake __ · zoom_speed __
- How tuning in the inspector went:
- On the phone:

## PixiJS half
Next session.
