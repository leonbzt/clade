# PixiJS half of the stack test (slice 08)

Throwaway, and done: PixiJS won the stack test (5 Nov), and this code moved into [`game/`](../../game/), where the
real build goes on. Kept as the record. The mud flats Life from `toys/life2`, in TypeScript with PixiJS 8.22 and Vite, phone first.
Spec: [docs/slices/08-stack-test.md](../../docs/slices/08-stack-test.md). Notes: [docs/playtests/09-stack-test.md](../../docs/playtests/09-stack-test.md).

Same rules, board, fixed worm (gut gland and sclerites) and feel list as the Godot half. Different on purpose: the look.
You asked for a free interpretation (5 Nov), so it isn't the placeholder shapes. It's the 2D low-poly look you picked in the look
toy: flat facets lit by one sun from the upper left, one palette, a dark teal outline, a low-res canvas scaled up crisp.

## Play it
- **On your phone:** the private page https://claude.ai/artifact/EmQkbFhyV8LLhx5CYe7Jm8 (one self-contained file, 647 KB).
- **On desktop, from the repo:** `npm run dev`, then open `http://localhost:5173/spikes/pixi-life/`. Edits to the code show at
  once (hot reload). On the phone over Wi-Fi: `npm run dev -- --host` and the LAN address it prints.

Tap a lit tile to move (in mud you tunnel up to 3 tiles). Drag to pan, pinch or mouse wheel to zoom.
Wait, Moult and Lay are the buttons; on desktop also W or Space, M, L, and 0 resets the zoom.

## Tune the feel (the five values)
Press **Feel** (top right, or the `` ` `` key). Five sliders change the game live: glide time (seconds per tile), squash,
particles, shake (screen pixels) and zoom speed. One more under **Look**: pixel size (screen pixels per art pixel).
Values stay in your browser. **Copy values** puts them on the clipboard to paste into the chat; to make them the
defaults for everyone, they go in `DEFAULTS` in `src/feel.ts`.

## Tests
9 cases, the same checks as the Godot half's 37. They moved to `game/tests/` with the code.

## Build
```
npx vite build spikes/pixi-life
node spikes/pixi-life/inline.mjs
```
The first makes `dist/` (one 605 KB script, 180 KB gzipped, with the fonts in the stylesheet); the second folds it into one page,
`dist/clade-mud-flats.html`. Give it a path to also write the page's inside for hosts that add their own skeleton
(that's how the phone page was made).

## Files
- `src/rules/`: the port of `toys/life2-data.ts`, `life2-habitats.ts`, `life2-sim.ts` (no DOM, no Pixi). Every action
  records events that the view plays back, as in the Godot half. The map is turned a quarter (8 × 11).
- `src/main.ts`: the app, the layers, input, and the event playback with feel.
- `src/view/`: `shade.ts` (palette, sun, faceted shapes), `floor.ts` (the seafloor mesh, boulders, food, caustics, the
  mudslide's murk), `worm.ts` (you and the rival as segment chains), `hunter.ts` (Anomalocaris), `marks.ts` (lit tiles,
  strike marks), `fx.ts` (bits, puffs, shed skins, clutches, marine snow), `camera.ts`, `tween.ts`.
- `src/ui/`: `hud.ts` (the DOM around the board), `dev.ts` (the sliders). `src/style.css`: the pixel UI in Pixelify.
- `window.__pixi` is a small hook for the browser check (the AI drives the build with real taps and reads the state).
