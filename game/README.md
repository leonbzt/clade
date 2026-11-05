# Clade, the game

The real build, in TypeScript, PixiJS 8 and Vite (Svelte 5 for screens). It started from the stack test's PixiJS half
(`spikes/pixi-life/`, 5 Nov): the mud flats Life with a worm, its rival and Anomalocaris, in the 2D low-poly look.

- **Play:** `npm run dev`, then `http://localhost:5173/game/` (on the phone over Wi-Fi: `npm run dev -- --host`).
  The island first: tap a habitat, pick a niche, start the Life. Tap a lit tile to move; drag to pan; pinch or wheel to
  zoom. Keys: W or Space (wait/lurk), M (moult), L (lay), 1–3 (verbs), 0 (camera).
- **Feel:** the **Feel** button (or `` ` ``) opens the five feel values as live sliders, plus the pixel size. Defaults are in
  `src/ui/feel.ts`.
- **Check:** `npm run check` (types and `tests/`). **See it:** `npm run look` (cloud sessions; screenshots in `.shots/`).
- **Itch build:** `npm run build:game` makes `game/dist/clade.html`, one self-contained page.

Layout: `src/sim` (rules, no DOM: `life` the Life, `verbs`, `hunt` the predator Life, `threat` the board's hunter,
`garden` the living garden, `door` the one door between them, `clutch`, `island`, `save`, `share`), `src/data` (numbers,
parts, boards, natives), `src/view` (Pixi: floor and textures, creatures, marks, fx, camera; `shade.ts` holds the palette;
`islandmap.ts` the map on a 2D canvas), `src/ui` (the HUD, the dev panel, the Svelte screens: `Meta`, `Clutch`, `Menu`),
`src/main.ts` (wiring and the flow), `src/playback.ts` (a turn's events with feel). `window.__game` is the hook
`scripts/look.mjs` uses (it also exposes the save, for setting up looks).
