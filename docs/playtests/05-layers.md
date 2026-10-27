# Playtest 05: readable layers (27 Oct)

Your notes from chat, condensed.

**Liked**
- It looks different and feels a lot more dynamic. A good first start that needs refinement.
- Water stays concentrated around the vents (maybe a good thing). There are two healthy, diverse spots around them.

**Big issues**
- **Everything is very jumpy.** Some stocks should be larger. Litter, for example, swings a lot.
- **Few layers of organisms, and no real canopy.**
- **The island feels small.** Maybe a higher resolution and a larger map.

**Idea, saved for later:** a rough overview and a detailed, animated view of a tile. Maybe chunks of tiles become a
higher-level unit: a landscape view from far away, and only up close do you see the local ground and biomes.

## AI notes for the next session (causes to check, not decided)
- **Jumpy tiles:** a plant vanishes at once when it dies (cover goes straight to 0), and lifespans are short
  (2–7 min), so single tiles flip often (~2.8% of tiles per minute). Gradual dieback, longer lives for big plants,
  and drawing by cover would smooth it.
- **Jumpy litter:** a death drops its whole litter on one tile in one go, into a small stock that fungi eat fast.
  Spreading it over the neighbours, slower rates, and stocks with more room would smooth it.
- **Small island:** 40×24 tiles, about 60% land. A bigger map is cheap for the sim (it runs fine far larger).
- **Two hotspots:** only the vents make water. Rain, a wetter windward side, or streams would spread the life out.
- **Your chunk idea fits the biomes:** biomes detected per chunk instead of per tile would also stop labels flickering.
