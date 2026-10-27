# Layered environmental sims: readability, placement, explanation, biome emergence

Researched 2026-10-27. Method: web search + page fetches. Several primary sources (Don Hopkins' Will Wright notes, Eco wiki, DF wiki, Terra Nil wiki) were blocked or rate-limited, so those entries rest on search snippets or secondary reviews and are marked **[uncertain]**. No dev talk found for Terra Nil, Equilinox, Eco UI or Ecosystem (2022); those rows lean on reviews/wikis/forums.

## Summary (10 lines)
1. Games that stay readable show ONE layer at a time (ONI: 16 overlays on hotkeys; SimCity 2000: 9 map types; Eco: per-plant "potential yield" layers). Nobody shows 5 layers at once.
2. The best placement preview collapses all layers into one number or colour for the thing you hold: Terra Nil's "+N tiles" (red = net loss), Islanders' +/- points, Eco's per-crop potential-yield layer (white / red / clear).
3. Explanation lives in the object, not the map: Planet Zoo's animal panel names the failing need; Eco's soil sampler reports below / within / above a plant's range.
4. Complaints cluster on hidden rules: Reus 1 (no synergy info until planted, "need a crib sheet"), Eco (hidden 5x5 plot averaging and overcrowding, plants die with no clear cause), SimEarth ("often difficult to understand the relationship between actions and events").
5. Biomes in shipped games are either authored regions tied to the player's tools (Reus, Equilinox, Terra Nil) or generated once from layered thresholds (Dwarf Fortress). I found no shipped game that detects named biomes live from changing conditions, which is Clade's bet. Treat it as unproven ground.
6. Locality helps: Reus 2 reviewers say synergies mostly involve 4 neighbours or one biome, which "turns one giant puzzle into more manageable chunks".
7. Equilinox is the inverse of Clade: its dev refused natural spread because it merged biomes, filled the map with grass and crashed the economy. Spread needs caps, per-tile limits and visible cause.
8. Noita's designer: complex simulation can "be in the way of more interesting gameplay"; the test is whether players understand what is happening.
9. Late-revealed rules punish earlier placements and feel unfair (Terra Nil critique, Reus). Show the rules before the commitment.
10. Open items: the Wright talk content, Eco's UI, Equilinox requirement display, Terra Nil handbook were not verified.

## Per-game table

| Game | Layers / state per tile | Shown at once | Placement good/bad | Why-did-it-fail | Biome / zone formation | Complaints |
|---|---|---|---|---|---|---|
| Terra Nil | Tile types (wasteland, grass, forest, river, marsh, ash...), power, water, temperature/humidity (late) | Not documented; mostly the tile surface plus a highlighted radius | Number above the building = tiles it will restore, net of cost; red = costs more than it returns; affected tiles highlighted in a radius | Sparse handbook; no clear diagnostic. Out-of-resources ends the level with no undo | Building upgrades turn restored tiles into biomes (wetland, meadow, forest); animals need counts of tiles nearby (deer: many grass; beaver: ~20 river + 10 forest) | Late-revealed mechanics punish earlier choices; "stabbing around in highlighted regions"; some random maps can't reach a perfect score; guidance both "too hand-holdy" and "too sparse" depending on reviewer |
| Reus 1 / 2 | Per patch: resource type + synergy tags; biome per giant | Planet view with resource icons | Reus 1: no synergy info until planted. Reus 2 reviews do not mention a preview (uncertain) | Reus 2 vendor/review claims "visual indicators highlight thriving biotica, broken synergies" | Biomes are authored by giant (forest, swamp, desert, then Wetlands, Tundra, Grasslands in DLC) | Reus 1: IGN "needlessly complex and unintuitive system of synergies"; PCGamesN "wiki page open or a crib sheet". Reus 2: UI "unintuitive, clunky" (aggregator, weak source), visual clutter on dense planets |
| SimCity 2000 / SimEarth | SC2000: 9 map data types (zones, traffic, power, water, pollution, land value, crime...) [names uncertain] | One data layer in the map window; optional "Show City in Window" overlays it on the view | Query tool shows zoning/land value per tile | SC2000 query tool; SimEarth gives numeric panels | SimEarth: biomes follow climate; life added when parameters hit thresholds (critic claim) | SimEarth: "difficult to understand the relationship between a player's actions and events"; "more admired than played"; CGW wanted more SimCity-style visual feedback |
| Oxygen Not Included | Gas, liquid, heat, power, germs, light, decor, plants... | One overlay at a time (16 listed), each on a hotkey | Build preview plus overlay for the relevant system | Overlay shows the quantity; designer says figuring things out is the fun | Rooms overlay: enclosed rooms become typed rooms by contents | Colorblind palettes added to several overlays (Rooms palette was a compromise); learning curve |
| Eco | Temperature, moisture, N/P/K nutrients, salinity per area; plant has ideal and extreme ranges | Map layers one at a time (temperature, moisture, per-crop "potential yield") | Layer coloured white (best) / red (growable) / clear (no) per crop | Soil sampler: below / within / above range; overcrowding counted | World biomes generated at start | Hidden 5x5-plot averaging, overcrowding counts grass; plants "turn grey and die" with unclear cause; sampler overcrowding reading disputed; slow growth (~20-24 h) looks like failure |
| Equilinox | Species needs (biome, soil/fertility, space) [thin sources] | n/a | Player places; no auto spread | Animals sicken / die when unhappy (details of UI not verified) | Player-authored biomes; plants raise fertility | Player complaint that species don't spread; dev says auto-spread would merge biomes and break the economy |
| Timberborn | Water depth (2D grid, neighbour levelling), moisture (separate 2D, spills and weakens with distance, sharper uphill), contamination | Water drawn in world; flow shown by texture | n/a | Behaviour tied to scale and elevation; dev admits exploits left unfixed | n/a | Irrigation/levee behaviour confusing in community threads |
| Dorfromantik / Islanders | Edge types / adjacency | Whole board | Dorfromantik: top 3 tiles visible, edge match scored on placement, undo allowed. Islanders: +/- score popup before placing, can move building to compare | Quests are counting rules ("deer wants forest of N trees") | Quests unlock biomes/tiles | Islanders: preview highlight is subtle, outcome sometimes unclear; no moving after placing |
| Niche | 100+ genes in slots; 4 biomes | Gene slots on animal | n/a | Gene on top = dominant; genes tied to skills (walking, swimming, fertility) | Four authored biomes | Reviewers found it more educational than fun; no evidence on opacity found |
| Noita | Per-pixel materials | Everything | n/a | Emergent | n/a | Designer: simulation can get in the way; "will they understand what's going on?" |
| Dwarf Fortress | Elevation, rainfall, drainage, temperature, vegetation, salinity | Map modes in embark | n/a | Wiki tables | Biome = lookup on layer thresholds at world generation | Known bug: different biome layers overhead cause odd results (evil rain over good biome) [wiki snippet] |

## Details and sources

### Terra Nil
- Three phases: terraform with buildings, upgrade into biomes, recycle and leave. Wind turbines need stone tiles; toxin scrubbers prepare soil. https://en.wikipedia.org/wiki/Terra_Nil
- Placement: a number over the held building estimates tiles restored, already net of cost; red means it uses more resources than it returns. https://itemlevel.net/terra-nil-complete-beginners-guide/ . A review says affected tiles are highlighted in a clear radius while spread greenery is "somewhat random" (via search snippet of a Terra Nil review; I could not open the page).
- Animals need tile counts nearby (deer: many grass; beavers ~20 river + 10 forest). Missed spots are fixed later by rain. Same guide.
- Critique (Adrian Hon): game previews yields, which helps, but "I was just stabbing around in highlighted regions"; running out of resources ends the level with no undo; late mechanic reveals "make you regret your choices". https://adrianhon.substack.com/p/terra-nil
- Mixed reviews on hand-holding vs sparse handbook; harsher difficulties make overextending a restart; some random maps cannot reach a perfect score. https://pcgamer.com/terra-nil-review , https://gameinformer.com/review/terra-nil/a-new-approach-to-saving-the-world , https://purenintendo.com/review-terra-nil-nintendo-switch/ (all read through search summaries, not opened).
- RPS called the puzzle element "an unavoidable punishment"; Hardcore Gamer called it the "most clever and unique hook" (as quoted on Wikipedia).
- Not found: any dev talk on overlay or rule-communication design.

### Reus / Reus 2
- Reus 1 symbiosis: each resource boosts output next to a specific other; wrong placement can cut a town's output sharply. The interface "doesn't tell you what plant you're about to plant nor its symbioses till it's in the soil"; "you'd need a wiki page open". https://www.pcgamesn.com/indie/reus-pc-review
- IGN: "needlessly complex and unintuitive system of synergies and transmutations". https://en.wikipedia.org/wiki/Reus_(video_game)
- A later review says the player can pause and look over synergies for a resource (from a search snippet, source not opened) so the first game may have had some lookup.
- Reus 2: "synergies aren't random or hidden. The game tells you exactly how things interact"; clutter when heavily developed; "takes time to reveal full depth". https://www.keengamer.com/articles/reviews/pc-reviews/reus-2-review-a-brilliant-game-that-rewards-creative-planet-building-and-strategic-thinking-pc
- Most synergies concern 4 neighbours or the same biome, so "one giant puzzle" becomes "manageable chunks"; tracking gets hard with variety. https://turnbasedlovers.com/review/reus-2-impressions
- Aggregator (auto-generated, weak): UI "unintuitive, clunky, overwhelming", tutorial weak, relies on tooltips. https://vaporlens.app/app/1875060/reus_2.md
- Reus 2 DLC: Grasslands where stress builds per placement and fire spreads; Wetlands mixing water and land. https://store.steampowered.com/app/1875060/Reus_2 (via search summary).
- Not found: a dev postmortem or devlog on the synergy UI.

### SimCity / SimEarth (Will Wright)
- SimCity 2000 map window has 9 data types; layers depend on the map chosen; "Show City in Window" overlays data on the city so you find where the effect is. Base colours: undeveloped brown, forest green, water blue, developed black, rubble yellow. https://www.ludo.guide/guide/simcity-2000/section-5-7-the-map-window-mpa . Query tool for per-tile zone/land value (SC2000 first to include it): https://www.irt.org/foldoc/SimCity%202000.htm [via search snippet].
- Wright's 1996 Stanford talk "Interfacing to Microworlds": tension between illusion of reality and "opening the hood"; topics include granularity of interaction, time control, collapsing and filtering of data. https://hci.stanford.edu/seminar/abstracts/95-96/960426-wright.html . Hopkins' notes (https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d) returned 403, so I could not verify what Wright said about maps. **[uncertain]**
- Secondhand quote: the real model is in the player's head, the game is "a compiler" for it (Rossignol, This Gaming Life; not verified). One summary: SimAnt too simple, SimEarth too complex, SimCity 2000 "just right" (HN thread https://news.ycombinator.com/item?id=34573406 , secondhand).
- SimEarth: display panels with gas percentages to three decimals; "somewhat mystifying"; species thrive or die "for no clear reason"; CGW wanted SimCity-like visual feedback. https://en.wikipedia.org/wiki/SimEarth
- SimCity 2013 GlassBox: Resources, Units, Maps, Globals; grass grows "only where there's soil, water and nutrients" as map rules; units write to maps (pollution). Rule-based separation is a good model for Clade's layers, but the article says nothing on visualization. https://gamedeveloper.com/design/gdc-2012-breaking-down-em-simcity-em-s-glassbox-engine

### Oxygen Not Included
- 16 overlays, each with a hotkey (F1 Oxygen, F2 Power, F3 Temperature, F4 Materials ... F10 Farming, F11 Room); some unlock with research. https://oxygennotincluded.wiki.gg/wiki/Overlay
- Colorblind alternates added to Crop, Power, Rooms, Germ, Harvest overlays; Rooms palette optimised for common rooms only. https://oxygennotincluded.wiki.gg/wiki/Versions/AP-417610 (via search summary)
- Designer: "a big part of the fun is the sense of figuring things out"; hand-holding "would kill that first joyful moment". https://www.gamedeveloper.com/design/behind-the-design-of-hit-sim-game-i-oxygen-not-included-i-
- Not verified: tooltip contents, overlay-design talk.

### Eco (Strange Loop Games)
- Per plant: ideal range and wider extreme range for temperature, moisture, salinity; outside extreme = no growth/reproduction; inside extreme but outside ideal = reduced efficiency; below nutrient minimum = half growth speed. Wiki pages (403 on direct fetch; read via search snippets) https://wiki.play.eco/en/Template:TreeDetails , https://wiki.play.eco/en/Agriculture . Numbers inconsistent across templates **[uncertain]**.
- Land condition is taken per 5x5 plot, not per tile (wiki snippet). Soil Sampler reports whether values are below, within or above a plant's needs. https://wiki.play.eco/en/Soil_Sampler (snippet).
- Per-crop "PotentialYield" map layers: white = best, red = growable but less ideal, clear = unsuitable. Player complaints: overcrowding counts grass/bushes/trees, the sampler can flag overcrowding wrongly, crops take 20-24 h so slow growth looks like failure, plants die with no clear cause. https://steamcommunity.com/app/382310/discussions/0/2650805184970378491 (the "4% per block" detail from another search snippet was NOT confirmed).
- Wiki on soil moisture: depends on rainfall, proximity to water, biome and whether there are trees/plants in the 5x5; "players are still trying to figure out how these affect soil moisture". https://wiki.play.eco/en/Soil_Moisture (snippet). A shipped game whose own wiki admits the mechanic is not understood is a direct anti-pattern.

### Equilinox
- Species have needs; unhappy animals get ill or die; points buy species and genetic changes; ~10 biomes, 120+ species. https://www.gamepressure.com/games/equilinox/z455fd (via snippet). Steam ~93% positive, ~3000 reviews. https://steampulse.org/game/853550
- Dev reply on why species do not spread: player-controlled by design; animals give DP (a sheep becomes a family of 4-6) so spread = free income; disliked species would invade and kill others; in a test, after ~5 minutes "biomes merged, grass filled the map, and most trees and animals died out". https://steamcommunity.com/app/853550/discussions/0/1744480967009603065/?ctp=4
- Not found: how requirements are displayed.

### Timberborn
- Water is a 2D tile-neighbour height model despite a 3D world; hard dam values avoided because of oscillation; flow readable via water texture; moisture is a separate 2D system that spills from water tiles, weakens with distance, drops much faster uphill. Dev left known exploits as-is. https://www.gamedeveloper.com/design/deep-dive-timberborn-s-water-mechanics
- Not found: the overlay/moisture UI.

### Dorfromantik / Islanders
- Dorfromantik: only the top of a 40-tile stack is placed, top 3 visible; edge matches score on placement; water/rail cannot dead-end; undo allowed; counting quests ("deer wants forest of 50 trees") because others "weren't as intuitive and easy-to-communicate"; effects kept calm. https://en.wikipedia.org/wiki/Dorfromantik , https://www.gamedeveloper.com/disciplines/sparking-joy-through-tile-placement-in-idyllic-village-builder-i-dorfromantik-i-
- Not found: documented placement preview visual (ghost tile). Do not assume.
- Islanders: potential points shown before placement; you can move the building to compare; +/- popup; negative interactions (park near brickyard -3); subtle highlight sometimes unclear; no moving after. https://en.wikipedia.org/wiki/Islanders_(video_game) , https://www.nintendoworldreport.com/review/58076 (via snippet)

### Planet Zoo (extra)
- Welfare analysis view colours animals red to green; opening an animal's menu "tells you exactly why they're unhappy and which plants need removing or adding"; needs grouped in categories (food, water, space, terrain/plants, social, enrichment) so you fix the red category first. Forum/blog level sources, not official. https://godisageek.com/?p=227579 , https://www.itechguides.com/planet-zoo-2-how-to-keep-animals-happy-and-healthy/

### Civilization VI (extra, thin)
- Adjacency lens appears only when placing a district that has adjacency; bonus numbers shown on candidate tiles. Community notes bonuses can change later so you must plan. https://www.keengamer.com/articles/guides/a-guide-to-civilization-6-district-placement-strategy/ (snippet only; lens detail from a Steam thread via search).

### Niche, Noita, Dwarf Fortress, Ecosystem
- Niche: dominance shown by position (top gene dominant); genes tied to skills; five processes (selection, sexual selection, gene flow, drift, mutation); inheritance abstract but "catches the basic principle"; ~300 biology teachers use the educational version. https://www.thenakedscientists.com/node/198834 . 100+ genes, 4 biomes; reviewer found it generic and leaning to learning. https://en.wikipedia.org/wiki/Niche_(video_game)
- Noita (Purho): "The simulation can, in fact, be in the way of more interesting gameplay"; "will they understand what's going on?" https://www.gamedeveloper.com/game-platforms/road-to-the-igf-nolla-games-i-noita-i-
- Dwarf Fortress: biome is a lookup on elevation, rainfall, drainage, temperature, salinity at world-gen; temperature itself derives from latitude, elevation, moisture. https://dwarffortresswiki.org/index.php/Biome (snippet only, page was rate-limited) **[uncertain]**; https://en.wikipedia.org/wiki/Dwarf_Fortress
- Ecosystem (Slug Disco): evolving swimming lifeforms with random brains, player forces traits via tools; only store text found, no readability reviews. https://store.steampowered.com/app/1133120/Ecosystem/
- Not researched: Spore, Viridi, The Garden Path, Before We Leave (low value or no good sources found).

## Transferable patterns

1. **One layer at a time, plus a cheap "tile card".** ONI, SimCity and Eco all use hotkeyed single layers. Never blend more than two.
2. **Layer = the question you are asking.** Eco's per-crop potential-yield layer answers "where can this species live?" and beats showing raw layers. Terra Nil and Islanders collapse everything to one number.
3. **Preview with the held item.** Show the net result (+N / -N, red when negative) and the affected radius as you hover. Islanders' flaw: preview was too subtle.
4. **Name the failing factor.** Planet Zoo and Eco's sampler: three-state per factor (below / ok / above), grouped by category, fix the red one.
5. **Ranges with a soft shoulder.** Eco's ideal vs extreme ranges give a graded outcome, easy to draw as a bar with two bands.
6. **Counting rules read well.** Dorfromantik's "forest of N trees" and Terra Nil's "N grass tiles" are the intuitive way to state a biome/habitat condition.
7. **Keep interactions local.** Reus 2's neighbours-only synergy keeps puzzle readable; Eco's hidden 5x5 averaging did the opposite.
8. **Spread needs a visible limit.** Equilinox's dev found free spread merges biomes and floods the economy; if species spread, show caps and rates.
9. **Colourblind-safe palettes from the start** (ONI patched them late).
10. **Reveal rules before commitment**; offer undo/rewind (Terra Nil had none on resource failure; Dorfromantik allows undo).

## Anti-patterns
- Hidden averaging windows or multipliers the sampler does not show (Eco).
- Rules only learnable after placing (Reus 1).
- Failure with delayed effect and no timeline cue (Eco 24 h crops looking dead).
- Cause chains too long to trace; "species die for no clear reason" (SimEarth).
- Many numeric panels with no visual story (SimEarth gas percentages).
- Wiki-admitted unknown mechanics.
- Visual clutter at full density (Reus 2); biome art that hides the data.
- Over-simulating: Purho's warning.
- Late rule reveals that punish earlier placement (Terra Nil).

## Use in Clade (all **proposal**)
- **proposal:** Single-layer overlay switcher (hotkeys; 1 layer + species-suitability layer), plus a hover tile card listing each layer's value with a 3-state marker per species need.
- **proposal:** Held-species placement preview = one suitability colour (like Eco's white/red/clear) on every tile, with a hover breakdown "N 2/3 ok, shade too high" naming the worst factor.
- **proposal:** Per-species needs drawn as bars with an ideal band and a survivable band (Eco's model).
- **proposal:** When something dies or stalls, a "cause" line on the tile or species card that names the factor (Planet Zoo style) and a short history of the last change.
- **proposal:** Named regions (biomes) detected from conditions: show the criteria as counting rules ("N tiles with moisture > X and canopy > Y") and highlight the region outline when hovered, with a "nearly" state showing which rule is missing. No source shows a shipped game doing this live, so test it in a toy first.
- **proposal:** If species spread, show growth edges as ghosted tiles with a per-turn cap, and avoid hidden multi-tile averaging; keep interaction to the 4/8 neighbours.
- **proposal:** Colourblind-safe palette check before adding a fourth overlay.
