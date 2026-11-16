# Playtest 04: the stand, part 1a (3 Nov, uncommitted on `v2`)

The slice: [slices/03-stand.md](../slices/03-stand.md), the run in the app.

Your notes:
- **Overall:** "looks okay but still really rough." "this is a solid foundation but i don't like it as a final
  product."
- **The shade:** "shadow is interesting now and makes everything a lot more readable."
- **Glitches:** "there is still a lot of glitching and flashing going on definetly."
- **The outline:** "the yellow outline still looks bad."
- **Fonts:** "give me some more pixel fonts or could you make one thats similar to the osrs one."
- **The core play:** "the core play of growing the trees is still not really fun to play, maybe three at once it too
  much? maybe it could be more puzzle style with tiles or settler or something strategic. a little strategy game
  could work really well."

AI notes from the build (3 Nov):
- A compose (scene redraw) went from 24 ms to about 8 ms (herb, about 1,700 live parts per sapling at the end of
  year 1); the bodies are now rasterised straight into palette-index layers. The moss view takes about 4 ms.
- Herb saplings reach the top of the view in year 1 of 4.
- Flashing, not yet isolated. Suspects: glints blink at random (2.5 Hz), leaf colours step with light every tick,
  the shade dither crawls as the light grid changes, the outline re-traces at every compose (about 12 a second).
- Fonts: `toys/fonts.html` shows 11 free pixel fonts in the run's UI lines.
- `npm run check`: types pass; the known 8 h offline test fails (567 ms vs 500).
