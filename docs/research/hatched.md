# Hatched (procedural creatures): research, 2 Nov 2026

## Summary
- The only "Hatched" with code-made creatures is by Sublime Orange LLC (solo dev, 3D, Unity). Steam app 4975780, Steam release planned Q1 2027. A free browser demo (itch.io) has been out since 2026-10-15.
- It is NOT a breeder. It is an action roguelite: 20-minute runs, one life, a different creature each run, evolve after each boss. No genome, inheritance, mutation or idle part is described in any public source.
- Creatures are assembled from a library of body parts ("body, head, the rest"), with IK legs, physics-chain snakes and a shader pass. The dev's own short Bluesky videos are all we have: no talk, no write-up.
- Body-to-stats is undocumented. The dev frames builds as player-picked attacks and abilities that grow matching parts (wings, quills, leaves).
- Very new and tiny (Bluesky account 25 followers, no Steam reviews), so there are no real reviews to learn from.
- Low fit for Clade's genes -> body -> stats question. Useful only for "parts that fit any body" and "show the choice on the body".
- If the user meant a breeder, it is probably another game; I found none called Hatched (see "Other titles").

## 1. Identity (verified)
- Steam page: Sublime Orange LLC is developer and publisher; Action/Indie/RPG; Windows, macOS, SteamOS+Linux; "Q1 2027"; tags include Procedural Generation, Character Customization, Animals, Third Person. https://store.steampowered.com/app/4975780/Hatched/
- Steam API gives the same data plus website hatchedgame.com. https://store.steampowered.com/api/appdetails?appids=4975780&l=english
- Press kit: self-published; also a free web version on itch.io; "a different creature every run". http://hatchedgame.com/presskit/
- itch.io (read via search-result summaries only; direct fetch gives 403): "in development", Unity (HTML5), "no generative AI used", desktop browsers only. https://sublimeorange.itch.io/hatched
- Bluesky bio "Solo dev"; account created 2026-10-02; demo announced 2026-10-15. https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=hatchedgame.bsky.social

## 2. Core loop and verbs
- "Run. Fight. Eat. Repeat." Hatch small, fight, eat what you kill, level up; each boss kill grants an evolution that you steer. https://store.steampowered.com/app/4975780/Hatched/
- Verbs: move, attack, eat, pick abilities and relics, choose an element (exploit enemy weaknesses), spend bones on ability upgrades (pierce, chain, attack speed, area). Same page.
- No breeding, hatching choice, collection or idle loop is described anywhere. "Hatched" only names the start of a run.

## 3. How creatures are generated (what is public)
- Dev claims: "not 3D models, no rigs, no animation files, just math"; "endless creatures, one equation". Feed: https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=hatchedgame.bsky.social&limit=40&filter=posts_no_replies
- Staged build: "Step 1: the body. Step 2: the head. Step 3: the rest." https://bsky.app/profile/hatchedgame.bsky.social/post/3mz4v2qqrbk2p
- "A giant library of body parts, and every part has to work on every body." Asked which combination broke most, the dev answered "the snakes", which move very differently. https://bsky.app/profile/hatchedgame.bsky.social/post/3mz6qcshozc24
- Locomotion: legs by inverse kinematics, feet pinned until a step fires; snakes are physics chains; "bones" added after a "just Spore" comment. Posts 3mzbzvizjec2w, 3mzc2rw45qs2w, 3my4nluwvc22a (same profile URL pattern).
- Looks: "with shaders off, every creature falls apart" into basic shapes. Post 3mz7k2jrzck2w.
- Growth: "every attack you pick grows a new part" (leaves, quills, wings); a creature also gains parts during one run. Posts 3myzyoamql22w, 3mz2xuw45j22p.
- Not public: genome or parameter layout, gene -> part mapping, colour logic, inheritance, mutation, body -> stats rules. Do not assume them.
- Stats: only hints, a "Strength vs Speed" duel post (2026-10-25) and a speed-per-hit skill with no cap (2026-10-13). Same feed.

## 4. Progression and economy
- 100+ abilities, run-altering relics, element choice, bones as upgrade currency, boss -> next evolution, achievements and leaderboards. https://store.steampowered.com/app/4975780/Hatched/
- Starter creature is random per run; in the demo some starters are weak. Unknown: meta-progression, unlocks, rarity.

## 5. Praise and criticism
- No Steam reviews or discussions yet. https://steamcommunity.com/app/4975780/discussions/
- Second-hand itch.io comments (search summary): "promising"; wish to pick the starting creature (dev: planned for the full game); one ability judged weak; carnivore/plantvore food abilities should grant XP rather than heal. https://itch.io/t/7282597/hatched-a-creature-evolution-roguelite-play-in-your-browser
- Dev-reported critiques: "it's just Spore" and "not funny" (own posts 2026-10-18/19 and 10-28). Reach is small (6 to 22 likes per post). Same Bluesky feed.

## Other titles named Hatched / nearby (not verified beyond a listing)
- "Hatched!" by MMM (itch.io, "curate the hatching process to create animals") and "Hatched!" by Manisha W / Lazernaut (HTML5): pages blocked, no evidence of procedural genomes. https://moddisms.itch.io/hatchedegg
- Everything is Crab (evolution roguelite, 2026) is the likeliest mix-up for "evolving creatures"; Voidling Bound (DNA splicing, hatching, Steam 9 Jun 2026) for breeding. Neither researched here. https://store.steampowered.com/app/2004680

## Takeaways for Clade
- Borrow the staged assembly (body -> head -> appendages). Cheap first version: one body parameter set plus 3 to 5 slots, each with 3 to 4 variants, drawn on shared anchor points.
- "Every part must fit every body" is the real cost. Fix it with an attachment contract (anchor, size, facing) before adding variants. Their snake case shows locomotion types are the breaker; keep one body plan per clade at first.
- Show choices on the body (parts grow as you pick). In Clade the heir pick should preview the sprite diff against the parent.
- A style pass holds random parts together (their shaders). For pixel art: one palette, one outline rule, one light direction applied after composing.
- Avoid copying their stats model: it is undocumented and driven by picked abilities, not the body. Define Clade's part -> stat table yourself (each part adds explicit modifiers).
- Avoid weak random starters (their first complaint); broods of 3 with a pick already fix that. Skip IK and 3D locomotion; idle sprites need none.

## Ideas for Clade
- **idea** Heir picker shows the parent sprite next to each of the 3 kids with changed parts outlined.
- **idea** Part slots with a shared anchor spec so new variants can be added without touching old ones.
- **idea** One final "cohesion pass" (palette snap and outline) over every generated body.
