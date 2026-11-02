# Mycelarium (research, 2 Nov 2026)

## Summary
- The game is **Mycelarium** by PLAN KAPKAN (developer and publisher; "PLAN KAPKAN LLC"). It is on Steam, Windows only, single-player. The full release is planned for **3 Nov 2026**, so it is not out yet. A free demo is out (Demo 2.0 on 30 Oct 2026).
- It is a "meditative incremental game": you grow a fungal network in a **side-view cross-section** (forest strip on top, soil below). I confirmed the view from the store screenshots.
- Verb: **slingshot-style aiming**. You pull back, release, and a new hypha line shoots out. A cost label is shown (e.g. "91 cm  -3 WATER"). Automation, mushrooms and upgrades are layered on top.
- Growth looks like thin white vector polylines with branch nodes, not a cell grid (judged from screenshots only). Soil has food pockets, water pockets, hard soil and impassable stone.
- No hard fail and no ending. Demo players say it is chill, but the goal is unclear, it gets repetitive, and it has little replay value after the upgrade tree.
- There are no user reviews and no press yet. Everything about reception comes from the demo feedback thread (about 15 of 40 comments read).
- Not verified: how branching is implemented, the engine, the automation and prestige details, the team size.

## 1. Identity
- Steam page: Mycelarium, app 5181520, planned release 3 Nov 2026, tags include Incremental, Idler, Automation, Underground, Pixel Graphics, 2D, Procedural Generation. https://store.steampowered.com/app/5181520/Mycelarium/
- The Steam API lists platform as Windows only, developer and publisher PLAN KAPKAN, 12 languages, 6 screenshots, 1 trailer, demo app 5371480. https://store.steampowered.com/api/appdetails?appids=5181520&l=english
- Steam news, 30 Oct 2026, "DEMO 2.0": unlocks the Repeller mushroom (against the Hedgehog), new visuals, a save system, balance tweaks. Release "hoped" for 3 Nov. https://store.steampowered.com/feeds/news/app/5181520
- The demo's date is unclear. SteamDB reportedly gives 8 Oct 2026 (seen only in a search snippet; the page returned 403). A demo feedback thread from 20 Oct exists, so the demo was out by then. https://steamdb.info/app/5371480/history/
- **Name clash:** an itch.io page "mycelarium" by fixgritt (Windows, Farm Jam 2025: Forest Frontier) is a fungus farm on a single tree, with a patch dated 6 Oct 2025. I could not open it (403) and could not link it to PLAN KAPKAN. Treat it as a different or earlier game. https://fixgritt.itch.io/mycelarium

## 2. Core loop and verbs
- You start with one mushroom and spread mycelium through the soil. You collect food pockets, connect water reservoirs, and build toward a "self-sustaining underground empire". Source: Steam page above.
- Growth is **aimed with a slingshot control**. Screenshot 4 shows an arrow from a hypha tip with the label "91 cm -3 WATER". So growth costs water by length, and the cost is previewed. Screenshot: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/5181520/4793dc9d8bf5190672f5e96a3cc11b93a79c3302/ss_4793dc9d8bf5190672f5e96a3cc11b93a79c3302.1920x1080.jpg
- You can also place nodes (a player thread mentions "node on right click"), grow sideways, build surface mushrooms and parasitize trees. Demo threads: https://steamcommunity.com/app/5181520/discussions/ (inferred from thread titles, so the details are unverified).
- Automatic: mycelium keeps decomposing leaves into food. The page says falling leaves decay into food, and a player mentions "leaf mulching" as the renewable food source. Mushrooms "automate production" (the page's wording only; the mechanism is unclear).
- Threat: a wandering Hedgehog eats mushrooms, and the Repeller mushroom counters it. Players found it annoying in the demo.
- HUD (screenshots): food (about 7 to 50), total length in cm, water, and a star counter (unlabelled, my guess is points or spores).

## 3. Simulation and look
- Camera: side view with the ground line near mid-screen. A parallax pixel-art forest sits above, a brown soil band below, and mushrooms stand on the ground line. Screenshot 1 (late game) is a dense, spidery white network with hub nodes.
- Mycelium is drawn as thin white jagged polylines with dots at nodes. Branching looks fractal, and long straight shots come off the slingshot. It does not look like a tile grid, but this is from images only. https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/5181520/18be89fa639e1902785468b346965166807e619f/ss_18be89fa639e1902785468b346965166807e619f.1920x1080.jpg
- Soil features are blobs: blue water pools, dark patches (hard soil or stone, unclear which), and tiny stones and food specks. The page lists "hard soil and impassable stone" and an endless procedural world.
- Physics: only the aim-and-shoot arc seems to be involved. I found no evidence of soil physics or fluid simulation.
- The numbers I could read (upgrades "range, width, water efficiency, node cost, budding chance, soil penetration") suggest growth is a rule set with tunable parameters, which echoes Clade's "genes as program parameters". This is my inference, not a stated design.

## 4. Progression
- Upgrades: range, width, water efficiency, node cost, budding chance, soil penetration. Mutations unlock specialized mushrooms. Wind-carried spores seed far-away growth points. Source: Steam page.
- Incremental parts: automation, an upgrade tree, an endless world. I found no prestige or rebirth mention (not verified either way).
- Goal: none stated. A demo player asked whether the aim is "merely to get all the unlocks". The developer says more animals, mushroom types and soil levels are coming in the full game.
- Session length: demo players report 15 minutes to 4.6 hours. Two say the demo ends just before meaningful progress. https://steamcommunity.com/app/5181520/discussions/0/590691669351034080/

## 5. Reception (demo only)
- Praise: "very chill", cozy, compared to 1990s educational games, long sessions (up to 4.6 h), "шикарная игра" ("great game") from a 100-minute player. Source: same thread, https://steamcommunity.com/app/5181520/discussions/
- Criticism: unclear goal; mycelium size has no visible effect; repetitive biome, visuals and music (asked for seasons and biomes that change with distance); no way to jump the camera to far edges; early food starvation; tutorial gaps (sideways growth and re-growing from one node not explained, https://steamcommunity.com/app/5181520/discussions/0/572679490124131325/); the Hedgehog took predator mushrooms; a resolution bug (fixed).
- Press and Steam reviews: none found (0 user reviews, 1 curator review with no text visible). The YouTube demo video "Hedgehogs Stole My Mushrooms" exists but I could not read it. https://www.youtube.com/watch?v=4QZeCl9SDyk

## 6. Takeaways for Clade's side-view run
1. **Borrow the picture.** A thin ground line, a soil band and thin white-line growth make a readable body from nothing but polylines. A first version needs no cell grid: a tree of segments with a length, a thickness and a cost.
2. **Borrow the cost preview.** The aim arrow with "cm and water" turns every action into a visible trade. If a Clade run has any player action (pick a branch, a root dive), show the cost before the commit.
3. **Avoid a hidden effect.** Players could not see what size or upgrades did. Clade's stats (reach, roots, toughness, spread, growth, upkeep) should read straight off the grown body and be shown next to it at the season end.
4. **Avoid no-end sessions.** Mycelarium's main complaint is no goal and thin replay. Clade's season end plus the brood of 3 and the heir pick is exactly the structure it lacks. Keep that choice sharp.
5. **Avoid unexplained verbs.** Players missed sideways growth and node rules. Teach each verb once, in the first run.
6. **Keep threats light.** The Hedgehog adds pressure but annoyed demo players. In Clade, a weather or herbivore event per season is safer than a roaming enemy.
- Simplest first version: a single Canvas 2D side view, 2 or 3 soil resource blobs (water, nutrient, rock) and one growth program (a small L-system with angle, length, branch chance, thickness). Stats are computed from segment sums. No player aiming is needed; the player picks only the heir.

## Ideas for Clade
- **idea** Draw the run as white-line growth on a dark soil band with a ground line and a surface strip; resource pockets are blobs, and the body costs water by length.
- **idea** Show a stat readout that updates live as the body grows, so size always visibly maps to a stat.
- **idea** Offer an optional "aim one shot" verb during the run, with a cost preview, only if pure auto-growth feels dead in playtests.
