# Slice 22 play notes

9 Nov 2026, Codex build checks. Player notes still needed.

- 22A: deterministic two-Life test regrows four inherited buds by size 5 for 10 food, versus 18 for four new picks.
- Model checks cover fill/branch, tears and the frozen lay, Signature, the plan verb ceiling, kept-card placement,
  affordability and v5 → v6 migration. Existing ordinary-food founding test passes on seeds 1–3 with affordable picks.
- 22A browser smoke: launch a larva with an eye bud, regrow it for 2 food, return to play.
- 22B at 360 × 844: inspected the larva on the board and in Body, its faded slots, and the launcher with bud icons.
  The offer puts buds first, shows 2-food regrowth beside 3/4-food new parts, greys out unaffordable parts, and charges
  only the balance after the moult payment. An affordable swap shows its replaced row and new-species consequence.
- Hatching: a Gill fills a free place and says “Worm 2 grows”; a Sulfur symbiont replaces a held row and saves
  “Worm 3 (sulfur symbionts)”. Both show old → new on their slots. The close-up reports “5 of 5 places”.
- The browser check launches the saved branch again and verifies its inherited parts are buds beside the default bulb.
- Fixed the hatching crash exposed by Svelte's reactive row proxies; regression test plus both browser paths pass.
- No browser page errors. The dev server's lone 404 is `/favicon.ico`, confirmed separately; game assets load.

Your play is still needed to judge whether regrowth stops the sense of starting over and leaves enough food to make
interesting changes. 21C also still needs your full play before roadmap step 6 is ticked.
