# How bodies, slots and species should work (6 Nov)

The answer to your notes on the body toy ([playtest 18](../playtests/18-body-toy.md)). Everything here is a *proposal* until you call it. Numbers are measured unless marked; you can rerun them at `/spikes/body-render/`.

## 1. Short version
- **The core holds, the slot model doesn't.** One spine and data give animals that look alive. Two legs in one slot isn't a small bug. It happens because a body has two systems drawing in the same place.
- **Fix: six places, the same on every animal, each holding one thing.** A lineage is a body shape plus which places are already filled. It's your own idea of "slots stay similar through evolution". It's also simpler than the toy.
- **Performance isn't a wall.** Movement and light are almost free. The cost is rebuilding every shape on the CPU each frame, and there are known ways down, up to 50× cheaper. Pick the style by how it looks, not by cost.

## 2. What is expensive in an animation
50 animals, one main-thread frame on this machine, software graphics: 24.8 ms in all.

| Step | ms | Share | Notes |
|---|---|---|---|
| Movement: joints following, gait | 0.1 | under 1% | The part that makes them "look like animals" |
| Light: one angle per facet, about 94 facets an animal | 0.2 | 1% | Turning it off saves nothing |
| Building the shapes in our code | about 10 | 40% | About 3.5 in a hot test loop; about 10 in real frames |
| Pixi recording the shapes | about 3 | 14% | |
| Pixi cutting them into triangles and sending them | about 11 | 45% | Done again every frame |
| The GPU drawing pixels | not seen | | Not visible here. With few pixels per animal it's unlikely to be the limit, but it's unmeasured |

**3D or flat?** We aren't really 3D. We draw 2D triangles, and "height" is used once, to pick a shade. Real 3D would move the work: the CPU only moves joints and the GPU does shapes and light, so it can be cheap per animal. But it would mean a new floor, a new look and a new toolchain, for no measured need.

**Why flat is cheaper, if it is:** only because it has fewer shapes. A flat animal might have 30–40 shapes against 126 today, so perhaps a third of the cost *(estimate)*. The saving comes from the count, not from being flat, and the ways below save more without touching the look.

## 3. What each way of drawing costs
Whole frame, ms. "4× slower" throttles the CPU as a stand-in for a phone; it is not a real phone.

| 50 animals | This machine | 4× slower | Look |
|---|---|---|---|
| Today's classes, Pixi Graphics | 16.4 | 61.1 | Today's |
| New body, Pixi Graphics | 24.8 | 85.7 | The toy |
| New body, one triangle buffer | 8.3 | 30.8 | Same to the eye at board size |
| New body, baked sprites | 0.5 | 1.6 | Same to the eye in a still; loses bending and shows 8 facings |

- **Baking costs:** 20 ms per kind of animal (68 ms at 4× slower) and 0.5 MB per kind, for 8 facings × 4 frames.
- **At 200 animals:** Graphics 100 ms, triangles 22 ms, baked 1.1 ms.
- **The real count:** today's boards hold about 8 animals (you, a rival, a predator, up to 5 prey). At 4× slower that scales to about 14 ms with Graphics, 10 for today's classes and 5 with triangles *(scaled, not measured; the floor isn't counted)*.

**Your options, in order:**
1. **Keep Pixi Graphics while the look is changing.** Nothing is broken at 8 animals.
2. **Triangle buffer: 3× cheaper.** The toy's drawing code stays as it is. Not a new framework, one class inside Pixi (`spikes/body-render/tri-pen.ts`, about 90 lines). Fans may break on very bent long shapes; not checked at large size.
3. **Cooked shapes, your "static compression":** build each animal's triangles once per build, tied to its joints, and only move the joints each frame. It keeps bending. Probably near 10× *(estimate, not built)*.
4. **Baked sprites, for crowds:** a good fit for distant or background animals. Worms lose their bend, so not for you or anything close.

**Fewer redraws: the same drawing code, a fraction of the work.** Each animal keeps its last shape and slides along with it every frame; only its shape waits. Staggered, so a few animals redraw each frame.

| 50 animals, one run on this machine | Whole frame, ms |
|---|---|
| Every animal redrawn every frame | 27.1 |
| Every 2nd frame (30 fps shape) | 12.8 |
| Every 4th frame (15 fps) | 6.9 |
| Every 6th frame (10 fps) | 4.4 |
| One triangle buffer, every frame, for comparison | 8.4 |

So a shape does not need rebuilding every frame. 10–15 fps shapes can still move smoothly across the screen, and 8–12 fps is how pixel art animates anyway. Natural rule *(proposal)*: you and whatever you're fighting every frame, the rest at 10–15 fps, an animal off screen not at all. Not yet watched on a real board; a body turning hard may look stiff between redraws.

**Skeleton tools (Spine, DragonBones):** made for rigs drawn by hand, not for bodies built from data, and Spine is paid. Way 3 above is the same idea with our own data.

**Another framework? No.** Pixi draws sprites in 0.5 ms. Graphics is just the wrong tool for shapes that change every frame, and any engine would charge for the same work.

## 4. The slot problem
**Why legs land on legs:** the toy has built-in parts and slots, and neither knows about the other. A slot is a spot *on top of* a body, not part of what the body is made of. Hiding "leg" from the picker would fix this one case, but gills under legs and spines through spines would remain.

**The rule that removes it: everything you can see lives in a place, and a place holds one thing.** A built-in part is a filled, locked place.

### Six places, on every animal
| Place | Its job (verbs come from it) | Examples |
|---|---|---|
| **Front** (the weapon slot: you liked this, 6 Nov) | Eat, grab | Claw, tentacles, palps, snout, grasping arms |
| **Eyes** | Sense | Dots, stalks, five eyes |
| **Limbs** | Move, and it sets the gait | None, stubs, jointed legs, flaps |
| **Sides** | Breathe, defend | Gills, bristles, spines |
| **Back** | Armour | Plates, scales, spines |
| **Tail** | Dash, steer, roll up | Spine, fan, roll-up tail |

- **A row is one choice.** You pick Limbs: legs, not four separate legs. The body works out how many from its size. Today's game already does something like this (`game/src/view/arthropod.ts` adds a leg to the row rather than a second one on top).
- **A lineage is its shape, its material and its locked places:**
```
crusher: { shape: …, material: 'plated', locked: { front: 'claw', limbs: 'walk', back: 'plate' } }  // open: eyes, sides, tail
```
- **A species is a lineage plus what's in its open places:** `crusher + stalk eyes + gills`. That is a few short words.

### Why this answers your questions
| You asked | What happens |
|---|---|
| Two pairs of legs | Can't happen: one place, one thing |
| "Slots stay similar through evolution" | The same six, forever. Your body just shows your lineage |
| "All drawn in" and "focus on what you're changing" | Recipe parts become locked. You're left with about three open places |
| "Lock the slots required for the recipe" | Exactly this |
| "The part should look like a part of the new creature" | Parts are drawn in the body's colour and in its **material**: a leg is a stub on soft bodies, jointed on plated ones. The toy already has this for leg, claw and a few others; it needs about 6–8 more variants, not one per lineage |
| "Doesn't stack too much" *(earlier)* | Still open (your call, 6 Nov): power can come from the locked parts, from authored lineage numbers, or both. Either way there are never more than six parts |
| "Can't be changed again" *(earlier)* | Replaced by your call (6 Nov): a locked place keeps its kind and can still improve within it (carapace → spiked or tough carapace). A more advanced lineage can reopen it |
| Does it still feel like mine? | Parts you own stay in place if that place is still open. Your eyes and gills come with you. That can't happen with a different slot list per lineage |
| Lots of species | A sea species is lineage + fills. A mutation swaps one place. If a fill meets a recipe, a new lineage can appear on the map *(idea)*. 15 lineages with about 3 open places and 3–4 options each already gives hundreds of animals, with no art per species |

**The how-parts-go-in switch goes away.** Recipe parts are drawn in, and the rest stay if their place is open, otherwise they go on the list. One open call: stay, or start empty as you suggested (see §7). The toy's second switch already lets you feel this.

**Your finding should steer the art:** you recognised your creature "mainly from front appendage". So Front gets the most art, 5–6 really different ones that read at board size. Tail and Limbs next. Sides and Back can be plain.

### What this costs, critically
- **Less building:** about 6 choices against the toy's roughly 12 slots (each side pair, plus back rows). You can't put a gill just on the third segment. Given your note, I think that's fine, but if you liked placing things exactly, split Sides into fore and hind.
- **High lineages have fewer choices.** The rule "lock at most three" keeps three open. Upgrading within the kind (your call, 6 Nov) is the answer to that: older lineages play like an upgrade system. Needs one extra line per upgrade, and its art.
- **Recipes must only ask for open places.** A test can check this for every lineage.
- **Locked is a strong word for a game about building.** It has to feel like growing up, not losing options. The Become moment and family card carry that, and you liked the card.
- **Some animals don't fit a spine:** jellyfish, sponges, coiled shells. None are on the list now except a later nautiloid, which needs a new skin.
- **The game has to change at step 5:** `BodySlot` has sides and segments. That's a rewrite of how the Life stores parts, already planned as "lineages as data".

### The other ways, and why not
| Way | Good | Bad | Verdict |
|---|---|---|---|
| **Toy as is, hide what's built in** | Smallest change | Different slots per lineage, collisions remain, parts don't carry over | Only if six places fails |
| **All parts removable** | Your note: easiest with many lineages | Lineages look alike; Crusher without its claw isn't one. Duplicates stay possible | No |
| **No lineages, only numbers (like Spore)** | Endless variety, no authoring | Loses named real species and the ladder; in-between shapes tend to look like mush | No |
| **Hand-made art per lineage, parts as stats** | Prettiest, simple code | Art count explodes, and you can't see what you built, which is the point | No; maybe a few hero poses |

**Easy approach for now?** Six places *is* the easy approach: fewer slots, no switch, and positions the body works out itself. It's less work than what's there.

## 5. The style
The light code is the same in both, so "the light seems better" in the old ones comes from what's drawn. My read of the side-by-side:
- **Parts shout.** The yellow disc eyes and long pale spines are bigger and brighter than the body. This is probably most of "clunky". Today's eyes are small dots.
- **Thick limbs.** Added legs use a 2.6-wide line, today's 1.6.
- **Bulkier body edges.** The toy's outline is built from quads, section by section.
- **Black everywhere.** Near-black outline and seams cost softness, and you doubted them too.

**The style sheet** at `/spikes/body-render/` shows the same animals as: today · black outline · dark outline in its own colour · the same with softer light · almost no outline · flat 2D. The "sharp pixels" link shows all of them at twice the resolution with smoothing.

*AI's lean:* dark outline in its own colour, softer light, and quieter parts. The outline and light take a few lines. Sharp or chunky pixels is purely your eye.

### Seven looks, tried (6 Nov)
You asked to brainstorm wider: cozy retro pixels, detailed low poly or a scientific feel, and cuter than bugs. `/spikes/body-render/styles.html` runs seven looks on the same skeleton and data, moving, with a switch for cute proportions.

| Look | 50 animals, every frame, ms | At its own rate, ms | Read |
|---|---|---|---|
| A. Today: facets, chunky | 24.2 | 25.0 (every frame) | The baseline |
| B. Fine low poly: 3× the facets, smooth light, sharp | 84.3 | 84.2 (every frame) | Handsome, soft, and needs a triangle buffer at any count |
| C. Pixels from today's facets, 10 fps | 26.7 | 5.1 | Textured, but noisy at this size |
| D. Pixels from one smooth shape, 10 fps | 19.1 | 3.4 | The cleanest pixel look; thin parts still go to mush at 16 px a tile, 24 holds up |
| E. Soft shapes: smooth outline, flat tones | 19.7 | 19.3 (every frame) | The cutest and most readable; can't be mistaken for pixels |
| F. Paper cut-out, 8 fps | 20.3 | 3.2 | Cozy and unusual; a white edge is loud |
| G. Field-guide plate: ink and wash, 12 fps | 49.8 | 12.3 | The scientific feel, and it comes almost free |

One run on this machine, software GL, as-built proportions, main thread only, no phone tested. Smooth shapes are only about 20% cheaper than facets at the same rate; the big saving is the lower frame rate.

**Cute turned out to be one rule on the data, the same for every lineage:** shorter, rounder, a bigger head, fewer repeats, plus eyes. It works in every look. Limits: a top-down animal has no face, so the eyes sit on top of the head, and they do most of the work. Plated animals become rounder but still read as bugs.

**What the sheet can't show:** these sprites are computed, not hand-placed. They have the look of pixel art without a pixel artist's clean clusters. It also shows animals on empty ground: a pixel animal needs a pixel world, so terrain, plants, food and text would all have to follow. v1's pixel painting may be worth carrying over (CLAUDE.md allows it when a spec names it; not read).

**Other ways to make the art:**
- **AI-generated:** good for concept boards to find the look fast. Weak for the modular body: every part, lineage and frame has to match in style and line up on the joints, and generated images drift. No generation at run time. The workable version: top-down rotation means **one painted image per part**, tied to the joints (look F's method). Light turns with the part, but that's far less art than facings. Steam asks for AI use to be disclosed.
- **A few hand-made pixel parts on the computed body:** a real 8×8 claw or eye placed on the skeleton, snapped to pixels. Probably the best route to real pixel art if D appeals, since Front gets the most art anyway.
- **A true side or 3/4 view,** like most cozy pixel games: gives real faces, but replaces this drawing path and the facing logic. Not recommended now.
- **Shader blobs, real 3D:** not tried; risk on phones or a new everything.

*AI's lean then, replaced below:* D with cute proportions, G on cards, E as the fallback. You answered "not a lot of cute" and asked for a fresh attempt.

### One real board, each style made fresh (6 Nov, slice 18c)
You liked the idea of D but C looked better, and asked what each style could be if built fresh. `/spikes/body-render/board.html` runs one real board with the same animals on the same paths in six ways, for all three habitats. `?view=beasts` shows 16 animals.

**How the pixels are made now.** No triangles and no filter:
1. Each shape goes on a real pixel grid as a height: bars, domes, one-pixel lines. A higher pixel wins.
2. Each pixel takes its light from the shape's own curve, then snaps to one of five colours with a shifted hue.
3. Decided per pixel: seams where plates change, a dark edge where one part overlaps another, lonely pixels removed, an outline only around solid shapes. Thin legs get none, or they turn into bars.
4. Thin things stay exactly one pixel wide at any angle. Animals repaint at 10 fps and slide in whole pixels between.
5. The floor is one height map of the whole board, baked once, with cast shadows marched across it. An animal's shadow is its own picture, tinted and offset.

**The low poly, improved.** Fewer and longer facets, one row per plate, warmer colours, one exact pixel of outline, a calm floor baked once, rocks without sand squares.

Whole frame, main thread, ms. One run per column, software GL, no phone; the 4× column is the same machine throttled:

| Way | 8 animals | 50 animals | 8, 4× slower | 50, 4× slower | Animals redrawn |
|---|---:|---:|---:|---:|---|
| Today | 2.8 | 11.5 | 15.1 | 49.5 | Every frame |
| Low poly, improved, 24 px a tile | 2.3 | 6.9 | 14.3 | 27.1 | Nearest 3 every frame, others every 4th |
| Low poly, improved, 16 px a tile | 2.2 | 9.5 | 14.6 | 24.0 | The same |
| **Pixels, 24 px a tile** | **0.5** | **2.1** | **1.8** | **8.8** | 10 fps |
| Pixels, 16 px a tile | 0.4 | 1.3 | 1.5 | 5.3 | 10 fps |
| Mix: low-poly world, pixel animals | 0.5 | 2.3 | 1.9 | 8.2 | 10 fps |

One animal's paint: 0.05–0.22 ms here, 0.18–0.76 at 4×. Floor bake: 66 ms here, 244 at 4×. Not a fair race on rate: pixels redraw less often, which is part of their look.

**More animals.** The 8 new ones (Pikaia, Opabinia, Hallucigenia, sea scorpion, nautiloid, jawless fish, early fish, first walker) are one data record each. Fish, walker and nautiloid read at once in pixels, so "not only bugs" is reachable with today's skeleton. Limits: radial bodies like jellyfish don't fit it, and the spike's `fin` and `five` eyes exist only in the pixel painter.

| | All pixels | Low-res low poly | Mix (low-poly world, pixel animals) |
|---|---|---|---|
| Cost | Lowest; about a third of low poly at 50 animals | Needs a triangle buffer to get close | Same as pixels |
| Motion | 10 fps stepping is the look, maybe a downside on your own animal | Smooth where it matters | 10 fps animals on a still world |
| Turning | Computed, so clusters are never as clean as hand-drawn | Clean at any angle | As pixels |
| Hand-made art later | Best: stamp a real 8×8 claw into the same buffer | A sprite would stand out unless on the same grid | Works, thing by thing |
| Shadows | Real heights give true cast shadows. Animal shadows move free; floor re-bake is too slow per frame, so a moving sun needs a shader (untested) | Real geometry; a moving sun recolours facets, cost unmeasured | As pixels for animals, as low poly for the floor |
| Work | Everything is repainted: floor, food, marks, effects | Most reuse: today's parts and light | Two painters to keep alive |
| Read on the board | The richest ground; the board feels like a place | Clean, but the floor is plain for now | Holds together better than expected |
| Size limits | Fixed grid; 16 px a tile is mush for plated animals, 24 holds | Scales more freely | As pixels for animals |

*AI's lean, against your "low poly is the way to go":* **all pixels at 24 px a tile,** on the same skeleton and data. You like it a little more, its ground is the best of the six, it is the cheapest by far, and hand-made art drops straight in. The risk to check by eye is 10 fps on your own animal. The choice isn't a one-way door yet: all of these share one skeleton, data, grid and palette, so only the painter changes. It gets expensive once the floor, food and effects are repainted for real.

Field-guide plates come from the same painter with a different last step, and are in the sheet; still parked as an idea for cards. I have only seen stills, and pixel water shimmer reads like cracks in them, so judge that moving.

### Round 2: today's floor, steadier animals, sizes, and AI art (6 Nov)
You liked today's floor, found low poly flickery and asked to choose by what AI generates best. Pages: `board.html?round=2` and `board.html?view=sizes`. Research: [research/ai-sprite-workflows.md](../research/ai-sprite-workflows.md).

Whole frame with 50 animals, today's floor included, main thread, one run, software GL, no phone:

| Way | ms | CPU 4× slower |
|---|---:|---:|
| Low poly, steady, 24 px a tile | 3.4 | 15.6 |
| Low poly, steady, 16 px | 3.5 | 19.0 |
| Pixels, 24 px | 2.6 | 8.3 |
| Pixels, 16 px | 1.4 | 7.0 |
| Baked pixels, 16 px | 0.5 | 2.2 |
| Baked low poly, 16 px | 0.4 | 1.7 |

Baking 12 sheets (16 headings × 4 steps, both styles) took about 0.5 s in all. A baked body is stiff, and bendy worms look kinked.

Flicker, as pixels that change and flip straight back, per frame, two runs on shared paths: low poly as first shown 89–97 (24 px) and 41–45 (16 px); steady 23–26 and 7–8; pixels 27–32 and 12–14. Steady means all animals at 10 fps with the head on a whole pixel, and a fixed outline area.

**What AI generation can do (vendor claims mostly unverified):** no tool found makes parts that combine. Each call gives one finished character, while the six places need parts that fit across species. Sprite tools with animation start at about 32 px, so 16 and 24 px are thin. General image models draw fake pixel art that needs clean-up. Generated 3D has no evidence for trilobite-like bodies.

*AI's lean:* **today's floor, animals code-painted at 24 px a tile, live on the board at 10 fps.** The same recipe gives 12 px baked sheets for maps and the garden, and 48 px for cards and equipment, with no extra art. Image AI stays for concepts and card art. The animal painter is the last call between pixels and steady low poly; both use the same data. This replaces the earlier lean. Costs: it can look mechanical beside hand-drawn art, and whether code-painted art needs AI disclosure on Steam is unclear.

**Your call (7 Nov):** recipes for a code painter, and stop on looks for now. The final style stays open: "between osrs and stardew valley", with 16 px "most my look". See [decisions.md](../decisions.md).

## 6. Next step
*Proposal, 7 Nov, replacing slice 18b as a separate toy:* six places, locked parts and material variants go into step 5, with the painter behind one draw call so the style can still change. The style itself waits for step 9. **Known bug:** on arthropods and the trilobite the front of the body sticks out past the head. In `polyplus.ts` the hull's nose reaches ahead of the shield, whose front edge sits at 0; the fix isn't tried yet, and the other painters need checking too.

## 7. Calls for you
See [proposals.md](../proposals.md), P46.
