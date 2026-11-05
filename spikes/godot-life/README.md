# Godot half of the stack test (slice 08)

Throwaway. The mud flats Life from `toys/life2`, in Godot 4.7.2 (GDScript, Compatibility renderer), phone first.
Spec: [docs/slices/08-stack-test.md](../../docs/slices/08-stack-test.md). Notes: [docs/playtests/09-stack-test.md](../../docs/playtests/09-stack-test.md).

## Play it
- **In the editor:** open this folder in Godot 4.7 (Project Manager > Import > `project.godot`), press F5.
- **Web build on desktop or your phone:** the export is committed in `build/web/`. From the repo root:
  `npm run dev -- --host`, then open `http://<your computer's LAN address>:5173/spikes/godot-life/build/web/index.html`
  on the phone (same Wi-Fi). It's single-threaded, so no special headers are needed.
- **Android:** `build/android/clade-life.apk` is made by the export below (not committed; it's 26 MB).

Tap a lit tile to move (in mud you tunnel up to 3 tiles). Drag to pan, pinch or mouse wheel to zoom.
Wait, Moult and Lay are the buttons; on desktop also W, M, L, and 0 resets the zoom.

## Tune the feel (the five values)
Select **Main** in the scene tree; the inspector shows a **Feel** group with sliders:
`glide_time` (seconds per tile), `squash`, `particle_count`, `shake` (screen pixels), `zoom_speed`.
- To keep a value: change it in the inspector with the game stopped, then save the scene (Ctrl+S).
- To try values live: run the game (F5), then in the Scene panel pick **Remote**, select **Main**, and drag the sliders.
  Live changes are lost when the game stops; copy the ones you like back.

## Tests
`godot --headless --path spikes/godot-life -s res://tests/test_rules.gd` runs 37 checks of the ported rules in about 10 ms.

## Export
```
godot --headless --path spikes/godot-life --export-release "Web" build/web/index.html
godot --headless --path spikes/godot-life --export-release "Android" build/android/clade-life.apk
```
Web needs the 4.7.2 export templates; Android also needs the Android SDK path and a keystore in the editor settings
(see the workflow log for the cloud workaround).

## Files
- `rules/data.gd`, `rules/life.gd`: the port of `toys/life2-data.ts`, `life2-habitats.ts`, `life2-sim.ts` (no nodes).
  The map is the toy's, turned a quarter (8 × 11) to fill a phone held upright.
- `main.gd` + `main.tscn`: input, camera, playing each turn's events back. `view/`: the board, you, the hunter, the HUD.
- `theme.tres`: the calm menus (Pixelify, one frame colour). `assets/fonts/`: Pixelify Sans (OFL).
