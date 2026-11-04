# Creature readability at low resolution (R6, 4 Nov 2026)

## Summary
- Evidence is thinner than hoped: the fetch budget ran out mid-pass, so several leads (Wildermyth, Tails of Iron, the pixel-sprite-generator code, strategy-zoom threads beyond one) are unread. Marked **unread** below.
- Silhouette first: design the outline, then check it small, flipped and in one colour. Pokémon and Derek Yu both say this.
- At small sizes colour and a few big clusters carry identity, not detail; each pixel must earn its place.
- Modular parts stay coherent with a style pass after composing: one palette, one non-black outline, one light direction (Wesnoth, Spore, Hatched).
- Spore made parts "deliberately cartoony, abstracted, and simple" and built tools so player builds always look good. Same logic as a cohesion pass.
- Map views with many units: icons work for type but overlap when dense; glows show place not type. No source found on "capped dots that become sprites" (see uncertain).
- Fit: all of this suits 2D low-res low-poly; none of it needs 3D.
- Nothing here contradicts big-picture.md. One tension: §6 says roaming creatures use "the same body doll as yours"; sources suggest a simplified variant at map size.

## Details
- **Silhouette first.** Ian Dean (Creative Bloq): "You could black it out and still know it's Pikachu"; first tip "Design the silhouette first"; a design that only works in full colour at high resolution "isn't robust enough"; test small, large and in motion. https://www.creativebloq.com/art/digital-art/what-artists-can-learn-from-30-years-of-pokemon-character-design
- **Shape language.** Same article: Pikachu = circles plus high-contrast ears; Charizard balances angular wings with a round torso; fire types sharp, water types curved. Useful as a rule that each clade gets one dominant shape feel (journalist's summary, not Game Freak).
- **Squint and flip tests.** Derek Yu: if you squint, "a few large clusters of light and dark should still emerge"; flip horizontally and drop colour to check the shape still reads; details must not obscure basic forms. https://derekyu.com/makegames/pixelart.html
- **Small sprites compromise.** Yu: "The smaller a sprite gets, the less your sprite looks like what it's supposed to represent"; expect e.g. a smaller head to make room for limbs; colour often defines a small character more than the outline does; 16 or 32 colours are common palette sizes; palettes are easy to swap. Same page.
- **Outlines.** Yu: one pixel, no stray pixels; pure black looks cartoony and gives "harsh segmentation"; selective outlining (lighter colour in lit areas) helps. Wesnoth is stricter: "Pure black ... should never be used to outline a sprite", use a darker same-hue outline. https://wiki.wesnoth.org/Creating_Unit_Art
- **Consistency across many artists/parts.** Wesnoth: fixed canvas (72x72), light from the artist's upper right, units face lower right, test sprites on several terrains and next to existing units in-game. Same Wesnoth page. Directly maps to a shared anchor/light rule for parts.
- **Palette discipline.** Wesnoth: at least 4 shades per material, up to 6 for larger surfaces, about 8 for the dominant one; essential shades are white spot, base, dark outline and 2 to 4 darker tones; sharing a palette across a faction signals unity; replacement colours should keep about the same brightness. https://wiki.wesnoth.org/Choosing_your_palette
- **Spore (modular creatures).** Parts were made cartoony and simple because realistic anatomy rigged badly; Quigley: art-directing a procedural game is "a million incompetents", so they built tools so everything players make looks good. Early cells got big cartoon eyes "to make it cute"; the team compromised between a "Cute" and a "Science" camp. https://www.gamedeveloper.com/game-platforms/d-i-c-e-will-wright-the-ymc--i-spore-i-team and https://en.wikipedia.org/wiki/Development_of_Spore
- **Spore artists' tips (Compton, Cimino).** Sink a leg into the body so it does not look pasted on; view a creature from the side to judge balance; think of drawing "as areas of dark and light" rather than line; background creatures are made not to stand out. https://beyondsims.com/2009/08/8409-sporeday-ask-maxis-interview-with-artists-kate-compton-and-john-cimino-answers/
- **Dwarf Fortress (Steam)** draws pixel art for every generated creature; Tarn Adams: "a pixel art challenge to accurately reflect what is stated in the text"; poses limited by inventory and piece matching. The article does not judge readability. https://www.pcgamer.com/new-dwarf-fortress-will-have-graphics-for-its-crazy-randomly-generated-monsters
- **Many units at far zoom (RTS forum, Stardock).** Players: icons "(usually) work really well" but overlap when dense (Planetary Annihilation) and only separate broad types (SupCom); at distance a unit's geometry "only occupies 20 pixels"; base-coloured units blend into structures; colour glow shows location but not type; a big icon with small per-type icons and counts underneath was proposed; tiny counts are unreadable. Forum opinions, not developer docs. https://forums.deadmansdrawgame.com/471443
- **Hatched** (already in hatched.md): "with shaders off every creature falls apart"; take that as support for a final style pass, nothing more.
- **Unread leads:** pixel-sprite-generator (zfedoran, port of Dave Bollinger's pixelrobots; mirrored masks plus outline, recalled not verified) https://github.com/zfedoran/pixel-sprite-generator ; Wildermyth paper-puppet layering; Tails of Iron "little puppets" https://www.gamedeveloper.com/art/-little-puppets-the-storybook-art-of-rat-tastic-action-rpg-i-tails-of-iron-i- ; moddb pixel-art zoom note https://www.moddb.com/games/space-station-continuum/tutorials/pixel-art-screen-resolution-and-zooming .
- **Uncertain / not found:** a primary source on species-level "one sprite stands for N creatures" map views; any hard number for the smallest recognisable creature size (the 16x16 guides found were SEO pages, not used); how Spore thumbnails (Sporepedia icons) were made.
- **Current doll (toys/body-view.ts, glanced):** 14 px grid cells, plant pieces drawn as flat palette rectangles with 1 to 4 px arms and a shared `col(kind, shade)` palette. Already a flat palette; no outline or light rule is visible there.

## Checklist for Clade drawing
**All sizes**
1. One palette for all species; per clade pick one base hue, 4 to 6 shades per material, no pure black (dark same-hue outline).
2. One light direction and one facing rule for every part (e.g. light upper right, creature faces right).
3. A cohesion pass after composing: snap to palette, add outline, same shadow colour.
4. Every part has a distinct silhouette contribution (a bump, a spike, a limb), not only a colour change; test the composed body in solid black.
5. Parts attach by a fixed anchor, sunk slightly into the body (no pasted-on look).
6. Keep one dominant shape feel per clade (round vs angular).

**Portrait (large, about 64 px and up)**
7. All parts, eye, internal shading, 1 px outline; show the diff against the parent here.

**Board (about 14 to 24 px)**
8. Simplify: body mass + 2 to 3 signature parts + eye; drop fine detail; colour does the identifying; keep the outline.
9. Check that rivals and your own line differ by silhouette and hue, not only by hue.

**Map (about 6 to 10 px)**
10. Do not scale the doll down: use a reduced form (body blob + the one signature part in its accent colour), or a plain role-coloured shape.
11. Cap and cluster: show a few creatures plus a count badge; never let sprites overlap into mush.
12. Use integer scales only so pixels stay square.

## Ideas for Clade
- **idea** Each part ships two drawings (board and map), the map one a 3 to 5 px "signature mark", so level of detail is data, not code.
- **idea** A dev-panel "silhouette test" that draws every creature of a habitat in solid black at board size, to catch lookalikes.
- **idea** On the map, tint a creature's small outline by trophic role so grazer, deposit feeder and predator separate before species do.
