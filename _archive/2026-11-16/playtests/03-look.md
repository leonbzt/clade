# Playtest 03: the look toy (3 Nov, uncommitted on `v2`)

The toy: [slices/02-look.md](../slices/02-look.md), `toys/look.html`.

Your notes:
- **Overall:** "I like it a lot. I really like the general direction but a lot of things still need to be worked
  out a lot." "Both approaches are really good."
- **2D vs 3D:** "I like the 3D more for the plants but overall the 2D low poly is more coherent." "The world and
  underground feels better 2D but the plants feel better 3D."
- **Width:** 3D best at 480; 2D at 320 or 480.
- **The panel:** the home island look is liked; the matchup "kind of"; the attributes "with colours and clear look
  a lot"; the little card is liked. The attributes could still lead into a chromosome view like v1 (the gene view,
  decided with P39).
- **Wanted:** "a more OSRS-like font and maybe a little less colours in the menus."
- **Asked:** "How much extra work is 3D in general?" (answer: P41)

~~The call: a mix~~ (first round). Then P41 (a) went into the toy as a third look, "2D + 3D plants" (a small
software 3D renderer for the plants, a sun shadow map, a grass top), with three fonts and calm menus.

Round 2 (3 Nov):
- **"I think I like 2D low poly most for now, it's least buggy and weird and the shadows make sense to use them."**
  It's "still buggy", but "2D + 3D plants was very glitchy".
- **3D:** "overall very glitchy and does weird things so I think it's maybe bad. If it could be stable it were great."
- **Fonts:** none of Tiny5, Silkscreen, VT323; **Pixelify** most. **Menus: calm** best.
- **Asked:** "What tech stack would be best to make a game like this? Also combined with the home island view?"
  (answer: P42)

**The call: (a), 2D low-poly, for now.** Pixelify, calm menus.
- **The main 2D bug:** "the outlines of the plants look weird and have gaps (the yellow one)". (AI: the dotted
  yellow line is the selected plant's shadow outline, dotted on purpose; for the stand.)

AI notes from the build (3 Nov):
- 3D bugs fixed while testing: the shadow box was never applied (no plant shadows), z-fighting on the grass, the
  lava glow culled, shadow acne on the island. The 2D renderer hit none of these.
- Rough spots: hints are sparse; the upright herb's leaves stack; 3D shadows are softer than 2D.
- `npm run check`: types pass; the known flaky 8 h offline test fails (520–600 ms vs 500), as listed in status.md.
