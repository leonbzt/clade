# TierZoo and its fandom wiki: what Clade can borrow (8 Nov 2026)

Research input only. Everything labelled **idea** is for the user to accept or drop (the user owns the design).

## Full export (added 8 Nov, later the same day)
- [`tier-zoo-data/wiki.json`](tier-zoo-data/wiki.json): all 1,181 article pages as `{title, content, wikitext}`
  (5.9 MB), exported through the wiki's official MediaWiki API with a patched WikiFandomScraper
  (Otis-Laboratory). Wiki text is CC BY-SA: fine for reference; don't copy it into the game.
- [`tier-zoo-data/infoboxes.json`](tier-zoo-data/infoboxes.json): the 791 animal infoboxes (tier, INT/PWR/DEF/MOB/HP/STL
  0–100, time period, taxonomy). Tier letters: A 203, B 174, S 117 (+12 S+), C 98, D 63, F 42. The list is top-heavy.
- Checked against the export: Trilobite C (Cambrian) / F (Devonian, Permian), DEF 85, MOB 10; Opabinia B; Haikouichthys A,
  MOB 70, HP 12; Hallucigenia C; Sponge B; Tardigrade F. **Anomalocaris is S (current)**, PWR 70, DEF 80, MOB 55, which
  settles the conflict in section 4. Wiwaxia, Marrella and Pikaia have no pages.

## Terms, read first-hand (8 Nov)
From the export; each page is `https://tier-zoo.fandom.com/wiki/<Title>`. Fan-written, uneven, often joking.
What Clade could take from it: [design/tierzoo-concepts.md](../design/tierzoo-concepts.md).
- **The devs** (The Developers, Nerf): secretive; "can't directly change anything about the species themselves
  (this is entirely guided by the evolution mechanism)"; they patch the world instead: overworld settings, supervolcano,
  plague, meteor. **Overworld forces** = natural disasters that "challenge players and nerf some of them in that region".
- **Updates and expansions**: eras with patch numbers; the Cambrian Explosion is "patch 1.1.1", an "open beta", marine only
  ("the devs hadn't released the terrestrial expansion pack yet"). The update list grades minor, important and turning-point updates.
- **Balance patch** = mass extinction ("a mass redistribution of the meta"). **Banned** = extinct (99.9% of all builds).
  How a ban happens: the player base shrinks (low survival, few respawns, oppression) → "endangered" ratings → lower tiers →
  rebound or ban.
- **Tiers**: player-made, "not recognized by the game developers"; by usefulness "in specific environments"; the server
  matters; not static; usage and exploits move ranks.
- **Stats**: seven base stats (Intelligence, Power, Defense, Mobility, Health, Perception, Stealth; the infobox shows six,
  0–100). "Specced into by a guild or class using Evolution Points". Hidden stats (Stamina, Range, Intimidation, Resolve) only
  through abilities. **Base Stat Total** ranks builds (Sperm Whale S/435). Player-made builds: total capped at 400, at most 7
  abilities, and "anything above 3 costs a stupid amount of evolution points". Bigger means more HP and less stealth.
- **Weight classes**: size scales power, defence and mobility, and decides which loot is worth eating.
- **EXP → Evolution Points**: EXP comes from loot (quality and weight class matter) and quests. The **main quest is to
  reproduce**, with more EXP for raising young. Level-ups give EP, spent in the "Creature Editor" on traits, abilities,
  resistances and even new builds, guilds and clans. A mutation becomes permanent "if enough players within a guild" carry it;
  some mutations hurt (a fifth leg "severely lowers your survival chances").
- **Traits and trait trees** (Traits, Skill Tree): "several thousands", in trees that "branch out or fold back to a single point".
  Examples: Slash → Claws → Short Claw → Claw → Robust Claw → Long Claw; Bite → Bite Force → Lock / Destroy Armor / Crush Bones /
  Bleed; Venom → Damage types / Disruption (paralysis) / Pain. Mobility tree: Skeleton → Musculature → Legs, Fins, Wings or Burrow
  → Jump → Leap. The Chemistry tree has two paths folding into Dual Chamber → Fire Blast.
- **Abilities**: special effects, some unique to a build, some open to any build. Examples: Hemolymph (arthropod HP scales with
  oxygen); Shell ("wards off all non-piercing attacks", weak to blunt force); Bony Plating (negates crits, stores EXP);
  Autotomy (lose HP to dodge a game over); Regeneration; Colonial.
- **Moves**: "actions a build can perform based on which Traits and Abilities they have"; offensive (Bite, Sting, Thrash) and
  defensive (Guard, Evade); mostly normal or poison type. **Signature moves** belong to one build or group (Water Gun, Discharge).
- **Debuffs**: "always negative", from chance, battle "or a change in the overworld"; they lower stats or disable abilities;
  some abilities negate them. **Status effects**: Bleeding, Poison/Venom (drain), Paralysis (mobility). **Starvation**
  when there's no loot. **Resistances** are passives that cut damage or debuff chance (cold, heat, poison, acid, radiation).
- **Damage vs covering**: Cambrian page: armour was enough early; spikes (pierce) beat armour; slash and crush are stopped by
  chitin. Paleozoic tier list: trilobite armour was "immune to grappling" until jawed fish brought Bite. Exoskeleton and scales
  resist different damage types.
- **Archetypes**: Build Types (Tank, Generalist, Intelligence, Stealth; generalists do best "when the game is undergoing rapid
  balance patches"; tanks need area denial, not just defence). Play-styles (Forager, Predator, Filter Feeder, Parasite,
  Support, Builder, Eusocial) "determine how useful different stats are". Combat styles: Rushdown, Spacing, Projectile,
  Grappling. Scavengers get less EXP but less competition.
- **Groups and names**: Faction (Arthropod) > Guild (about a family, with its own **gamertag**) > Clan > Build; **mains** are
  the players committed to a build. A guild can change its gamertag: Therapsids became Mammals when the last non-mammal one was
  eliminated.
- **Character select screen**: a taxonomy you drill down ("many choices will be made before you ultimately reach your desired
  build"). Locked **Cryptids** unlock through a strange task with a specific build plus a status effect.
- **Spawning screen**: "certain areas will be locked off depending on what build you are"; green, yellow and red areas by
  difficulty; marine builds spawn in aquatic servers; the abyss is region-locked.
- **Servers, zones, habitats, DLC**: servers are continents and oceans (removed servers are old supercontinents). Zones are by
  altitude and depth (sunlight, twilight, midnight, abyss). Habitats differ in amount and type of loot. DLCs are joke maps
  (Lunar, Asteroid, Space, Mars) with new skills ("space breath").
- **Team comps / Mutualism**: species teams ranked F to S (egret + buffalo as "tank healer").

## Access caveat (the original second-hand pass, below)
- Every direct fetch of `tier-zoo.fandom.com` (main page, `/wiki/*`, `api.php`, `?action=raw`) returned **HTTP 402**.
  TV Tropes returned 403 and web.archive.org is blocked. So I could not crawl, list all pages or read any page verbatim.
- What follows comes from **search-tool summaries of wiki pages** (second-hand paraphrase, with a few quoted
  phrases), plus Wikipedia and Know Your Meme, which I did read directly. Numbers and tiers below are as
  reported by those summaries; the wiki is fan-written, inconsistent in places, and some pages are months old.
- Quotes are the tool's quoted phrases, kept short. Nothing here was invented; where summaries disagreed, I say so.

## TL;DR for Clade
- The metaphor is cheap and crisp: **animal = build, habitat = server, era = expansion, extinction = balance patch,
  extinct = "banned"**. Clade already has a game; it needs only the *voice*, not the whole mapping.
- Best fit for Clade, by value/cost: (1) era-change **patch notes** with causes, (2) **tier letter per niche** shown
  on the patch/map with a one-line reason, (3) **counter/"how it fell"** lines on creature cards, (4) trade-off
  tooltips phrased as "spent points on X, so low Y".
- The wiki's recurring story is **"X dominated, got countered, specced into defence, became F tier"**. That is
  a ready-made tier-list explanation template ("why did it change?") that matches Clade's existing "crashes always have a cause".
- Skip: a full stat sheet per animal (7 stats vs Clade's 6-stat budget), hidden stats, a full wiki-style dex.
- IP: copy the genre (tier list, patch notes, builds), not the brand, the "Outside" name, page text or the character-select layout.

## 1. Framing and vocabulary (how "Outside" maps biology to a game)
Sources: [Wikipedia: TierZoo](https://en.wikipedia.org/wiki/TierZoo), [Know Your Meme](https://knowyourmeme.com/memes/people/tierzoo),
[wiki Tiers](https://tier-zoo.fandom.com/wiki/Tiers), [Banned](https://tier-zoo.fandom.com/wiki/Banned),
[Nerf](https://tier-zoo.fandom.com/wiki/Nerf), [Updates](https://tier-zoo.fandom.com/wiki/Updates).
- Channel: educational series by Patrick "Patch" Lacey, since 2017; animals are "players", habitats the "servers" of a game
  called "Outside" (Wikipedia). Wikipedia's only named term is "builds"; it does not list "spec" or "meta" (the wiki does use them).
- KYM: animals as "class builds", Earth as an MMORPG; stat blocks INT/PWR/DEF/HP; caption style imitates patch notes
  ("Dev: Increases Oxygen Level Arthropods").
- Wiki mapping (per search summaries):
  - **Build** = species/clade. **Guild** = large group (Arthropod, Fish). **Clan** = sub-group inside a guild. **Quasi-guild** = group with no living relatives.
  - **Expansion** = geologic era (Hadean ... Anthropocene), numbered (e.g. Ediacaran 0.3.9, Cambrian 1.1, Ordovician 1.2, Paleogene 3.1). Alpha/beta/open beta labels for early eras.
  - **Banned** = extinct/wiped out. **Balance patch** = mass extinction ("mass redistribution of the meta"); Permian-Triassic listed as a balance patch, 96% of marine builds removed (the wiki's figure).
  - **Nerf** = a change that lowers a build's viability, usually via extinction event. Devs cannot edit species, only patch the world indirectly.
  - **Servers** = continents/biomes (Europe, Africa; special: Pangea, Lunar, Abyss).
  - **Meta** = the currently viable set; wiki Category:Meta also lists terms Grappler, Rushdown, Projectile, Loot, Mutualism, Parasitoidism.
  - **Cryptids** = locked fan-content builds (hidden from character select).
- Crispest framings for Clade: "banned", "nerf" (as an event, with a cause), "meta rebounded", "mains" (a lineage that
  keeps playing one body), "spec into defence", "respawn rate" for clutch size.
- Weakest/least transferable: hidden stats, Intimidation vs Resolve, "Loot" bags, the PvE/PvP split (no PvE page found).

## 2. Tier list methodology
Sources: [Tiers](https://tier-zoo.fandom.com/wiki/Tiers), [S](https://tier-zoo.fandom.com/wiki/S_tier), [F](https://tier-zoo.fandom.com/wiki/F_tier),
[B](https://tier-zoo.fandom.com/wiki/B_tier), [Wikipedia](https://en.wikipedia.org/wiki/TierZoo), [KYM](https://knowyourmeme.com/memes/people/tierzoo).
- Tiers are "player-made", not dev-defined: a rank by *usefulness and viability in specific environments*. No official E tier.
  Tiers shift as builds are nerfed, buffed or removed.
- S: dominates the meta. A: strong, viable, short of S. B: above average, "most builds you see" (typical). C: average, held back by weak stats/abilities/game plan.
  D: rarely good; for experiments, learning, trolling. F: almost never played well; if player count hits zero, banned.
- Tiers are **per environment and per guild**: separate pages/lists exist (Snake Tier List, Worm Tier List, Characins, jellyfish
  S/C/D/F by species). So "tier per niche" is native to the source.
- No first-party formal methodology found. The channel's first video ranked the cane toad S tier (KYM). A Reddit commenter in
  r/Entomology called criteria "largely inconsistent" (one user, anecdotal): treat TierZoo as editorial, not a formula.
- What a rank mixes (as the pages describe it): stats, abilities, game plan (matchups), ease of play for beginners, how
  many builds can counter it, and population/survival. That is close to what Clade's sim already measures (share of
  patch, survival, crashes).
- Wiki self-inconsistency: Trilobite is "low C" on the Cambrian page but F after the Devonian; Anomalocaris appears both as S
  tier and as banned. Tiers are *time-stamped*, which is the useful idea: a tier is only meaningful "in this expansion".

## 3. Stats, traits and named trade-offs
Sources: [Stats](https://tier-zoo.fandom.com/wiki/Stats), [Template Page](https://tier-zoo.fandom.com/wiki/Template_Page),
[Health](https://tier-zoo.fandom.com/wiki/Health), [Human](https://tier-zoo.fandom.com/wiki/Human),
[Grappler](https://tier-zoo.fandom.com/wiki/Grappler), [Rushdown](https://tier-zoo.fandom.com/wiki/Rushdown),
[Projectile](https://tier-zoo.fandom.com/wiki/Projectile), [PvP](https://tier-zoo.fandom.com/wiki/Player_vs_Player).
- Base stats (the wiki says seven; the Stats page lists Intelligence, Power, Defense, Mobility; infobox adds Health, Stealth).
  Pages disagree on the seventh. Values are 0-100 (Human: INT 100, PWR 50, DEF 20, MOB 80, HP 40, STL 10, S+).
- "Hidden" stats reachable only through abilities: Stamina, Range, Intimidation, Resolve (passive: Charisma).
- Defense vs Health: defense negates attacks, health tanks them (Health page).
- Four combat styles: **Rushdown** (many small hits), **Spacing** (damage from outside reach), **Projectile**
  (ranged, struggles vs rushdown), **Grappler** (lock down to zero). A rock-paper-scissors skeleton.
- Trade-off lines the wiki states (per summaries): Jumping Spider pays Power/Defense for Mobility and accuracy; Dromaeosaurs
  spent Health/Defense for Mobility/Power; Giant Anteater's claws cost speed; Narwhal buys cold resistance with Mobility;
  Steller's Sea Cow high Defense (blubber) but weak Power/Stealth/Mobility; Moa gains Defense by losing Hollow Bones.
- Reproduction: K-strategy = "percentage over number" with few respawns and Parental Care (Banned page); Chicken's fast respawn "backfired"
  because humans farmed it (Chicken page). r vs K exists as a trade-off but I found no dedicated page.
- Archetype words in use: tank (high DEF/HP, e.g. trilobite), glass cannon (power for health), grappler (Opabinia), mobility main
  (Haikouichthys), "beginner pick" (easy to play).

## 4. Early marine builds, eras and what made them rise or fall
Sources: [Cambrian Explosion](https://tier-zoo.fandom.com/wiki/The_Cambrian_Explosion), [Ediacaran](https://tier-zoo.fandom.com/wiki/Ediacaran),
[Ordovician](https://tier-zoo.fandom.com/wiki/The_Ordovician_Expansion), [Silurian](https://tier-zoo.fandom.com/wiki/The_Silurian_Expansion),
[Devonian](https://tier-zoo.fandom.com/wiki/The_Devonian_Expansion), [Carboniferous](https://tier-zoo.fandom.com/wiki/The_Carboniferous_Expansion).
- **Ediacaran** (0.3.9): mostly stationary builds (cnidarians, segmented worms, Xenacoelomorpha); most "removed during
  the End-Ediacaran Extinction to give more place for Cambrian Builds". Ediacaran sponge listed with "?" (unconfirmed).
- **Cambrian Explosion** (1.1, "open beta", marine only): dominant guild Arthropods, which "invested heavily in DEF".
  Low tiers (Archaeocyaths, Small Shelly Fauna) were "forgotten" or deleted as new builds appeared fast.
- **Anomalocaris** ([page](https://tier-zoo.fandom.com/wiki/Anomalocaris)): first build to reach top tier, per summary; armour plus grappling
  tendrils; the author hedges on its tier because of the feeding debate (apex predator vs bottom feeder). Summaries disagree on
  its stats (one says high Mobility, weak INT/Stealth; another says high Power/Defense) and on banned vs S: treat as uncertain.
- **Trilobite** ([page](https://tier-zoo.fandom.com/wiki/Trilobite)): INT 10, PWR 40, DEF 85, HP 70 (as reported); C tier in Cambrian.
  Strength: shell, "very easy to play, making it a great beginner pick". Weakness: weak senses, only defence is curling
  (ball roll is useless if surprised); players learned to flip them. Devonian: F, "wasted all of their points on shell aesthetics". Eliminated at Permian-Triassic.
- **Opabinia** ([page](https://tier-zoo.fandom.com/wiki/Opabinia)): B tier, among the first grappler builds; the trunk gave range grab; thrived when the meta was
  defence heavy, then fell out after heavy losses and "Opabinia mains would start to spec into heavier defenses", which the wiki
  says became the F-tier Tardigrade. (Lore joke; real phylogeny does not say this: Opabinia is a stem-group euarthropod relative.)
- **Haikouichthys** ([page](https://tier-zoo.fandom.com/wiki/Haikouichthys)): A tier, the Cambrian meta's only mobility build (MOB 70, HP 12), schools, camera eyes that see through camouflage; ancestor of vertebrates.
- **Hallucigenia** (C): spikes instead of shell; defensive but no offence or speed, so others "simply ignore it".
- **Ordovician** (1.2): "first major wave of nerfs on most dominant builds" (an "extinction event"); meta rebounded with
  nautiloids (shells for defence) and filter feeders (sponges, corals). Cameroceras: removed apex cephalopod lacking Ink Screen.
- **Silurian**: short expansion; sea scorpion Jaekelopterus apex. **Devonian**: "Age of Fishes"; placoderms peak then banned at its end; first amphibians.
- **Sponge**: B tier, "upper mid-tier because they simply aren't worth the effort to fight". Jellyfish: Box S, Lion's Mane C, Upside Down D, Immortal F ([Sponge](https://tier-zoo.fandom.com/wiki/Sponge), [Cnidaria](https://tier-zoo.fandom.com/wiki/Cnidaria)). Worm list: Hammerhead Flatworm S; Fire Worm, Giant Tube Worm B ([Worm Tier List](https://tier-zoo.fandom.com/wiki/Worm_Tier_List)). Mollusc coverage: [Bivalves](https://tier-zoo.fandom.com/wiki/Bivalves) (later dominance after trilobites go).
- Pattern across eras: **defence-heavy meta -> grapplers/openers counter it -> everyone specs defence -> sessile/filter builds and
  tanks win the long run -> mass extinction resets**. Concrete causal chains, good for explaining a tier shift in one line.
- Real-science check (useful for a biology-literate audience): a 2023 biomechanics paper finds *Anomalocaris*
  appendages suit soft prey and speed, not shelled trilobites ([PMC10320336](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10320336/));
  radiodonts are a diverse group (predators, sifters, filter feeders) ([PMC7353989](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7353989/)).
  So the "anomalocarid eats trilobites" meme is contested: Clade should not hard-code it.

## 5. Page structure worth studying
Sources: [Template Page](https://tier-zoo.fandom.com/wiki/Template_Page), [Human](https://tier-zoo.fandom.com/wiki/Human),
[Tardigrade](https://tier-zoo.fandom.com/wiki/Tardigrade), [Character Select Screen](https://tier-zoo.fandom.com/wiki/The_Character_Select_Screen).
- Infobox: species/classification, base-stat block (INT, PWR, DEF, MOB, HP, STL), **Tier** (with era, e.g. "S (current)"),
  abilities, then **Pros / Cons** sections. Per-expansion sub-sections give tier history.
- Typical content: strengths, weaknesses, matchups ("bad vs the weakest builds"), history by expansion.
- Character select = a dex: vertebrate/invertebrate guild tables, locked "cryptid" entries.
- Each tier has its own page with example builds; guilds have their own tier list.
- Good copyable shape (generic, not their text): *Tier now / Stats / Plays like / Strong vs / Weak vs / What changed*.

## 6. Voice and humor (short samples, from summaries)
- Deadpan mock-authority; real biology stated as patch notes (KYM, Wikipedia).
- "A nerf is when the developers decide to decrease the viability of a build." (Nerf)
- "Their fast respawn rate kind of backfired on them due to Humans using the factory farming strategy." (Chicken)
- "Opabinia mains would start to spec into heavier defenses." (Opabinia)
- "very easy to play, making it a great beginner pick" (Trilobite)
- Tardigrade F tier yet "survived every major ban wave" (forum note): the joke that bad stats can still outlive the meta.

## 7. How Clade could use this (all *idea*, ranked by value / cost)
Context (corrected by the main session): built today are crashes with causes, per-patch populations and four bodies
(worm, arthropod, trilobite, swimmer). Planned: a rank per niche and the lineage ladder (step 6, with Wiwaxia, Opabinia
and Anomalocaris). The six-place bodies with upkeep are specified in slice 20A but not built yet.
1. **Patch-notes feed for era shifts and crashes** (value high, cost low). *idea*: a headline in the sea hooks
   styled "Patch 1.2: a predator wave nerfed armoured sweepers; filter feeders rebounded", always with a cause. Text only, uses existing crash data.
2. **Tier letter per niche, with a one-line "why"** (high / low-med). *idea*: show S-F for the incumbent per patch/niche,
   derived from share + survival, never hand-set. The reason line reuses the causal-chain pattern in section 4. Tier is time-stamped ("this season").
3. **Counters as a three-way skeleton** (high / medium). *idea*: ambush/grapple beats armour beats rakers beats swarmers, shown as
   "Strong vs / Weak vs" on a creature card. Fits the six-place model (guards vs strike). Keep it to 3-4 archetypes, not a matchup table.
4. **Trade-off tooltips in "spent X, so low Y" voice** (medium / low). *idea*: part tooltips like "Shell: +guard, -speed, upkeep +1".
   Uses 20A nominal costs already defined; zero new systems.
5. **Creature card / dex entry** (medium / medium). *idea*: Tier now, build, plays like, strong vs, weak vs, history. Generated from data.
   Risk: stat sheet per animal conflicts with the 6-stat budget; keep it derived, not a new data table.
6. **"Mains" and "banned" language** (medium / low). *idea*: "banned" = went extinct in all patches, "mains" = your line's streak. Flavour only.
7. **A guild/era page as the tree-of-life context** (low-med / medium). *idea*: expansions as named eras the player unlocks; only if the era arc is already planned.
- Do not do: hidden stats (Stamina/Resolve), PvP/PvE modes, a real wiki, per-animal numeric stat blocks, dozens of guilds.
  Feature-creep risks: the dex and the counter matrix each become a content treadmill (27 parts x 4 bodies already is a lot).
- Biology caution: TierZoo's tiers are jokes with lore (Opabinia to Tardigrade). For a biology-literate audience, label anything
  fanciful as such; prefer the real causal chains (Cambrian predators vs armour, Ordovician rebound, Permian wipeout).

## Open gaps
- No direct read of wiki pages; section 4 stats and tiers are second-hand. If the user needs exact figures, open the pages
  linked above in a browser (the 402 block is on automated fetches).
- Not found: any "r vs K" page, PvE page, a formal ranking formula, or any Cambrian-era "mollusc" build page (Bivalves page exists but not read).
