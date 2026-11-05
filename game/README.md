# Clade, the game

The real build, in TypeScript, PixiJS 8 and Vite (Svelte 5 for screens). It started from the stack test's PixiJS half
(`spikes/pixi-life/`, 5 Nov): the mud flats Life with a worm, its rival and Anomalocaris, in the 2D low-poly look.

- **Play:** `npm run dev`, then `http://localhost:5173/game/` (on the phone over Wi-Fi: `npm run dev -- --host`).
  Tap a lit tile to move; drag to pan; pinch or wheel to zoom. Keys: W or Space, M, L, 0.
- **Feel:** the **Feel** button (or `` ` ``) opens the five feel values as live sliders, plus the pixel size. Defaults are in
  `src/ui/feel.ts`.
- **Check:** `npm run check` (types and `tests/`). **See it:** `npm run look` (cloud sessions; screenshots in `.shots/`).
- **Itch build:** `npm run build:game` makes `game/dist/clade.html`, one self-contained page.

Layout: `src/sim` (rules, events; no DOM), `src/data` (numbers, parts, boards), `src/view` (Pixi: the floor, creatures,
marks, fx, camera, tweens; `shade.ts` holds the look), `src/ui` (the screen around the board, the dev panel, the
styles), `src/main.ts` (wiring and the event playback). `window.__game` is the hook `scripts/look.mjs` uses.
