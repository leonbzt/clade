# Tech and art (proposals)

## Stack (built in slice 01)

| Part      | Choice                                     | Status                                         |
| --------- | ------------------------------------------ | ---------------------------------------------- |
| Language  | TypeScript                                 | In use                                         |
| Build     | Vite                                       | In use. `toys/*.html` are extra pages          |
| Menus     | Svelte 5                                   | In use, still unconfirmed by you               |
| Logic     | Plain TS in `src/sim/`, no DOM, seeded RNG | In use; a fixed 10 ticks/s; commands in, state out |
| Landscape | Canvas 2D, pixel art painted by code (`src/view/`) | **2D decided 26 Oct.** PixiJS only if speed needs it |
| Saves     | localStorage, later cloud sync             | Not built yet                                  |

Mobile later: Capacitor for the stores, a PWA for installing. Calculate offline progress on resume, render only
while visible, cap the frame rate. Q9 (portrait vs. a layout that fits both) is still open.

## The look you described (playtest 01)

- **Menus:** old-school pixel UI like OSRS and Idle Obelisk Miner. That means 9-slice panels, a pixel font, chunky
  icons and a tight palette.
- **World:** either Stardew-style 2D pixel art, or OSRS-style low-res, low-poly models.

Both are a good fit for code-generated art:
- **The tile grid is the pixel art.** A cellular automaton colony maps one-to-one onto pixel tiles, so the sim and the
  look line up.
- **Low-res 3D:** render Three.js into a small target (e.g. 320×180) and scale it up with nearest-neighbour. Use flat
  shading and a limited palette. That's how the OSRS-like look is usually faked cheaply.
- **Plants** come from L-systems or space colonization, drawn in pixels (see minigames.md (archived)).

## Art with little manual work

Stylised art made by code, not painted. Claude makes the terrain, plants, animals, motion and UI. You give the
direction: mood references, the palette, and "does this feel right?" on screenshots. Against "programmer art": a
tight palette (5–8 colours per biome), consistent silhouettes, one lighting mood. Icons: Kenney (CC0) or
game-icons.net (needs attribution).

## Art spikes (one session each, before committing; Q7)

1. **Pixel 2D (PixiJS):** pixel UI panel, a Stardew-like tile island, one moss colony spreading as pixel tiles.
2. **Low-res low-poly 3D (Three.js):** the same island as an OSRS-like diorama in a small render target, with the
   same pixel UI on top.

Judge both in the browser, with the same colony spreading. Then pick.
