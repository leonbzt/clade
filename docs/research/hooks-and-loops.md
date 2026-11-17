# Hooks and loops: what makes short runs repeatable (research, 17 Nov)

## Summary
- Best-supported hooks: competence and autonomy (SDT), visible progress toward a near goal (goal gradient, endowed progress), and fast, blame-free restarts. Slot-machine talk (variable ratio, near miss) is real in labs, thin for games.
- Roguelites mostly keep builds unsolved with random offers (pick 1 of 3, shop rerolls), synergy rules and difficulty ladders. Meta-progression is split: Hades-style power vs Slay the Spire-style variety and difficulty.
- Change 1 (build persistence): evidence favours a mix. Persist the pool of options and a small pre-run kit; rebuild the rest inside the run from offers. Persistent power alone fills the "solved" gap badly.
- Change 2 (auto-advancing beat): has a real precedent (OSRS 0.6 s tick, NecroDancer beat). Warnings: stress at the worst moment, loss of think time, and mastery tricks that become required.
- Change 3 (stat-gated, multi-action nodes): well precedented (OSRS level gates plus success chance, Diablo breakpoints). Hard gates reward knowing the number, so they feed "solved" unless the gate is hidden, random or traded off.
- Weak spots: no primary source on the "restart urge", on Super Auto Pets/IdleOn/Brotato design intent, or on verbs like ambush, lure, hide. See the last section.

## A. Psychology (evidence for games in one line each)
- **Self-determination theory (competence, autonomy, relatedness).** Games pull by satisfying these needs ([Rochester summary](https://www.rochester.edu/news/printable.php?id=2719), [Ryan, Rigby, Przybylski 2006](https://www.e-teaching.org/materialien/literatur/ryan-rigby-przybylski-2006)). Evidence: four studies, mostly self-report, from the theory's own authors; games differ in how much they satisfy needs. Solid but not independent.
- **Flow.** Challenge and skill in balance gives absorption. Evidence in games is contested: challenge-skill balance effects were small, and a 2016 pacing study found constant balance is not the optimum for flow and enjoyment ([review](https://www.frontiersin.org/articles/10.3389/fpsyg.2018.01682/full), [Baumann et al. 2016](https://www.uni-trier.de/fileadmin/fb1/prof/PSY/PGA/unterlagen/BaumannL%C3%BCrigEngeser_Flow_MOEM_2016.pdf)). Treat "keep them in flow" as a heuristic.
- **Goal gradient.** Effort rises near a reward; in a café card study the gap between purchases shrank about 20% from first to last stamp ([Kivetz et al. 2006, summary](https://business.columbia.edu/insights/chazen-global-insights/goal-gradient-hypothesis-resurrected-purchase-acceleration)). Field evidence is consumer, not games; applying it to games is inference.
- **Endowed progress.** Cards with pre-filled steps were completed more often and faster; the effect depends on perceived completion and the reason given for the head start ([Nunes and Dreze 2006, abstract](https://ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html)). One 2006 paper family; I did not check replications. Secondary "twice the rate" figures are unverified.
- **Variable-ratio rewards.** Unpredictable payout gives high response rates and strong resistance to extinction in animal conditioning ([Reinforcement](https://en.wikipedia.org/wiki/Reinforcement)). That games hook players the same way is a common claim, mostly inference; partly folk wisdom.
- **Near miss.** Near misses on a slot task activated reward regions like wins, more so with perceived control and in problem gamblers; small samples (about 15 to 20) ([Science News](https://www.sciencenews.org/article/gamblers-brains-almost-counts), [Cambridge](https://cam.ac.uk/node/25993); the two sources differ on sample size). Claims that a game's failed runs act this way are asserted, not measured ([Portsmouth essay on Vampire Survivors](https://www.port.ac.uk/news-events-and-blogs/blogs/popular-culture/vampire-survivors-how-developers-used-gambling-psychology-to-create-a-bafta-winning-game)).
- **Loss aversion.** Losses weigh about twice gains in prospect theory; replicated in some samples, disputed as inertia by others and weaker for small stakes ([Wikipedia](https://en.wikipedia.org/wiki/Loss_aversion)). Using it to explain "restart after a bad move" is folk.
- **Zeigarnik / open loops.** The memory advantage for unfinished tasks often fails to replicate; the urge to resume an interrupted task does hold up ([2025 meta-analysis](https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html)). "Cliffhanger = better memory" is folk; "unfinished items pull you back" is supported.

## Mapping table (main deliverable)
Fit = fit for a 3-5 minute 8x11 grid Life. Cost = cost to build.

| Mechanic or principle | Why it pulls | Example game | Source URL | Fit | Cost |
|---|---|---|---|---|---|
| Pick 1 of 3 offers after each win | Autonomy plus fresh builds each run | Slay the Spire | https://en.wikipedia.org/wiki/Slay_the_Spire | High: one pick per moult fits 20 turns | Low |
| Synergy by broad keyword, not specific partner | Many things combo, so offers rarely dead | Balatro | https://lr.sudovanilla.org/r/balatro/comments/1czo9g0/guidelines_for_joker_design | High: tag parts by few keywords | Medium |
| Add/remove pieces from a shared board (prune) | Choosing what to drop is a decision too | Luck be a Landlord | https://pocketgamer.co.uk/luck-be-a-landlord/review/ | Medium: needs a "lose a part" action | Medium |
| Start with commons, rare gets stronger | Never feels unfair, then power ramps | Luck be a Landlord | https://blog.trampolinetales.com/questions-and-danswers/ | High: first moults cheap, later specific | Low |
| Shop between waves, rising reroll cost | Spend or gamble currency each break | Brotato | https://www.gamespress.com/Brotato-10-Release | Medium: moult is the break; no currency yet | Medium |
| Auto-acting build, player chooses upgrades | Fewer inputs, more planning | Vampire Survivors | https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors | High: queued task is the same idea | Medium |
| Short on purpose (designer likes short games) | Low commitment per attempt | Vampire Survivors | https://www.gamesradar.com/games/roguelike/on-steam-alone-i-probably-have-3-000-hours-nobody-loves-vampire-survivors-more-than-its-creator-who-once-thought-nobody-would-play-it-for-more-than-two-hours-and-ironically-says-short-games-rule | High: already 3-5 min | Low |
| Telegraphed enemy attacks, no random hits | Every loss feels like your own fault | Into the Breach | https://gamedeveloper.com/game-platforms/road-to-the-igf-subset-games-i-into-the-breach-i- | High: hunter already telegraphs | Low |
| Beat-locked turns, input window widened | Turns feel rhythmic; leniency cuts stress | Crypt of the NecroDancer | https://gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i- | High: the lean for change 2 | Medium |
| Tick-costed actions, tool tier changes roll speed not odds | Upgrades feel like speed, depth from timing | Old School RuneScape | https://oldschool.runescape.wiki/w/Mining | High: nodes with N actions | Medium |
| Tick manipulation (skill-expression for veterans) | Mastery layer on top of idle | Old School RuneScape | https://oldschool.runescape.wiki/w/Tick_manipulation | Low: needs long play and precise input | High |
| Level-gated nodes with level-scaled success chance | Gate gives a goal, chance gives smooth gains | Old School RuneScape | https://oldschool.runescape.wiki/w/Runite_rocks | High: "needs bite 3" plus odds above it | Low |
| Mastery thresholds with bonuses at set levels | Near-term target inside a long skill | Melvor Idle | https://wiki.melvoridle.com/w/V0.17 | Medium: per-line level already exists | Low |
| Breakpoints (a stat does nothing until a threshold) | Players optimise numbers, "one more point" | Diablo II / III | https://maxroll.gg/d3/resources/attack-speed-breakpoints-explained | Medium: strong pull but solvable | Low |
| Smooth carry-over instead of hard steps | No wasted points | Path of Exile (per its co-creator) | https://diablobytes.com/d2-resurrected/news/2026-07-20-path-of-exile-cocreator-chris-wilson-says-hardcore/ | Medium: counter-pattern to breakpoints | Medium |
| Difficulty ladder, cumulative penalties | Fresh challenge for a known build | Slay the Spire Ascension | https://en.wikipedia.org/wiki/Slay_the_Spire | High: board "heat" levels | Low |
| Optional heat modifiers that raise rewards | Player sets own risk | Hades Pact of Punishment | https://rpgsite.net/feature/10287-hades-pact-of-punishment-heat-modifiers-and-how-to-maximize-your-rewards | High: cheap, opt-in | Low |
| Daily seed, one shared board | Fair comparison; a route puzzle | Spelunky, Caveblazers | https://gamedeveloper.com/design/the-24-hour-ticket-examining-daily-runs- | High: a small seeded board is easy | Low |
| Hand-made templates, random assembly | Authored feel, many boards | Spelunky | https://amara.org/videos/p6MHlmreohsY/en-gb/3101319 | High: 8x11 from templates | Medium |
| Death advances story or progress | Failed run is not wasted | Hades | https://gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death | High: partial credit on death | Low |
| Failed and won runs both earn unlock points | Always moving forward | Slay the Spire | https://en.wikipedia.org/wiki/Slay_the_Spire | High: eggs-on-death or progress | Low |
| Instant restart | Keeps cause and effect close, less frustration | Super Meat Boy | https://gameinformer.com/b/features/archive/2011/01/07/video-game-stress-relievers.aspx | High: Life is short already | Low |
| Day timer forces moving on | "Time to think, can't waste it" | Loop Hero | https://www.gamedeveloper.com/design/postmortem-loop-hero | Medium: 20 turns already limit | Low |
| Hidden information, withheld threats | Imagination fills gaps, tension | Dredge | https://www.gamedeveloper.com/production/leveraging-the-unseen-to-turn-players-worst-fears-against-them-in-dredge | High: hidden food kinds, hidden exclusions | Low |
| Deduce hidden tiles from numbers | Competence from logic, not luck | Minesweeper | https://en.wikipedia.org/wiki/Minesweeper_(video_game) | Medium: needs scouting verb | Medium |
| Carry one thing into the next attempt | Loss still leaves a trace | Into the Breach (one pilot back in time) | https://en.wikipedia.org/wiki/Into_the_Breach | High: one kept trait per Life | Low |
| Pre-filled progress / near-goal bar | Goal gradient, endowed progress | Café card studies | https://business.columbia.edu/insights/chazen-global-insights/goal-gradient-hypothesis-resurrected-purchase-acceleration | High: node work bars, moult bar | Low |

## Change 1: persistent build vs rebuilt each run
- **Supports persistence (small).** Mark Brown's Game Maker's Toolkit episode calls persistent upgrades "the biggest decision" for a roguelike and says unlocks give "something to hold onto" while failing; some games give a feeling of advancement without changing power ([transcript page](https://amara.org/videos/7doGHxwrhRpX/en/3100738); fragments only, I did not read it all). Hades returns you to a hub where currency buys permanent upgrades and offers God Mode that grows stronger after failures ([Wikipedia](https://en.wikipedia.org/wiki/Hades_(video_game))); Kasavin: early goal to "take the pain out of dying and having to restart" ([Game Developer](https://gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death)).
- **Supports rebuilding in-run.** Slay the Spire keeps relics only "for the duration of the game"; failed and won runs earn unlock points, and difficulty rises via Ascension ([Wikipedia](https://en.wikipedia.org/wiki/Slay_the_Spire)). A secondary analysis says Mega Crit implicitly rejected permanent power and unlocks variety, not strength ([blog, low reliability, inference](https://saschb2b.github.io/game-mechanics/games/slay-the-spire/ascension)). Balatro, Luck be a Landlord and Brotato all build from offers each run.
- **Warns.** A forum view: persistent power "blurs self-evaluation" ([Steam thread, one opinion](https://steamcommunity.com/app/2106670/discussions/0/4342111331714355103)). Spore's creature editor had no consequence because "the gameplay effects of the creature parts are unfortunately quite discrete" ([Soren Johnson](https://www.designer-notes.com/spore-my-view-of-the-elephant/)): a loadout screen must change play, not just numbers.
- **Mix in practice.** Into the Breach lets one pilot carry experience into a new timeline ([Wikipedia](https://en.wikipedia.org/wiki/Into_the_Breach)); Dead Cells has permanent upgrades plus per-run random gear ([review, not developer](https://godisageek.com/reviews/dead-cells-review/)). No source tests a "limited slots pre-run + in-run draft" mix directly.

## Change 2: auto-advancing beat with queued tasks
- **Supports.** OSRS runs on a 0.6 s tick; actions cost fixed ticks (barbarian fishing rolls every 5 ticks) ([wiki](https://oldschool.runescape.wiki/w/Tick_manipulation)); pickaxe tier changes the roll interval, not the success chance ([Mining](https://oldschool.runescape.wiki/w/Mining)). NecroDancer: fixed-length turns "felt like moving to a beat"; the designer moved everything onto the beat because the world "feels much more unified" ([Game Developer](https://gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i-)). Vampire Survivors: auto-actions leave the player to choose and build ([Substack](https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors)).
- **Warns.** NecroDancer widened the input window from about 20% to 100% of a beat because players are least accurate when stressed. Loop Hero uses a day timer so the player "can't waste time" but has time to think ([postmortem](https://www.gamedeveloper.com/design/postmortem-loop-hero)). Telegraphed, fully readable turns make fights a puzzle that stays fresh ([Into the Breach interview](https://gamedeveloper.com/game-platforms/road-to-the-igf-subset-games-i-into-the-breach-i-)); a beat removes the unlimited thinking that puzzle depends on. Jagex accepts tick tricks only because of effort and may design content to block them if too strong ([wiki](https://oldschool.runescape.wiki/w/Tick_manipulation)).
- **Gap.** No source tests auto-advancing grid turns on phone-sized boards. Pause or slow-down options are my inference, not sourced.

## Change 3: stat-gated food nodes needing several actions
- **Supports.** OSRS: success chance rises with level inside a hard level gate (runite 17/256 at 85, 19/256 from 97) ([wiki](https://oldschool.runescape.wiki/w/Runite_rocks)). Melvor: bonuses at mastery 80 and 95 ([patch notes](https://wiki.melvoridle.com/w/V0.17)). Diablo breakpoints: "one point below equals zero", yet players build around them ([DiabloBytes](https://diablobytes.com/d2-resurrected/news/2026-07-20-path-of-exile-cocreator-chris-wilson-says-hardcore/), [Maxroll](https://maxroll.gg/d3/resources/attack-speed-breakpoints-explained)). A multi-action work bar is a visible goal gradient (see section A, inference).
- **Warns.** Breakpoints make the optimal stat total known and spreadsheet-able, the "solved" outcome already seen; Path of Exile's Wilson says newer systems carry fractional time to smooth steps (same DiabloBytes page, a summary of his claim). Visible gates plus visible nodes leave no hidden information. Dredge keeps threats unseen on purpose ([Game Developer](https://www.gamedeveloper.com/production/leveraging-the-unseen-to-turn-players-worst-fears-against-them-in-dredge)).
- **Gap.** I found no study of "almost there" for stat gates; the motivation claim rests on goal-gradient field data only.

## Verbs for a foraging or creature minigame (G)
| Verb | Example game | Source URL |
|---|---|---|
| Dig tunnels, drop rocks | Dig Dug | https://en.wikipedia.org/wiki/Dig_Dug |
| Inflate/hold to finish an enemy, release early and it recovers | Dig Dug | https://en.wikipedia.org/wiki/Dig_Dug |
| Reel a catch (optional timing minigame) | Dredge | https://www.gamedeveloper.com/design/trawling-in-the-deep-how-black-salt-games-made-spooky-fishing-rpg-i-dredge-i- |
| Scout or deduce hidden tiles | Minesweeper | https://en.wikipedia.org/wiki/Minesweeper_(video_game) |
| Push your luck (keep or risk gains) | Quacks of Quedlinburg | https://meeplescorner.co.uk/blogs/boardgame-glossary/what-are-push-your-luck-games-everything-you-need-to-know-about-this-board-game-mechanic |
| Risk beyond what is asked for a bonus | Arcade games (McMillen) | https://www.gamedeveloper.com/game-platforms/analysis-mcmillen-on-risk-reward-in-video-games |
| Move on the beat | Crypt of the NecroDancer | https://gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i- |
| Read telegraphs and reposition | Into the Breach | https://en.wikipedia.org/wiki/Into_the_Breach |
| Leap (stamina cost), pray at altars (ability, shorter cooldown) | Hoplite | https://en.wikipedia.org/wiki/Hoplite_(video_game) |
| Route planning through branching map | Slay the Spire | https://en.wikipedia.org/wiki/Slay_the_Spire |
| Draft one of three | Slay the Spire | https://en.wikipedia.org/wiki/Slay_the_Spire |
| Chain jokers into a multiplying engine | Balatro | https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/ |
| Remove a symbol to refine the build | Luck be a Landlord | https://pocketgamer.co.uk/luck-be-a-landlord/review/ |
| Manage oxygen (dive ends at zero, keep one resource) | Dave the Diver | https://en.wikipedia.org/wiki/Dave_the_Diver |
| Carry limit (weight capacity upgrade), stockpile for later | Dave the Diver | https://en.wikipedia.org/wiki/Dave_the_Diver |
| Place landscape cards around a fixed loop | Loop Hero | https://www.gamedeveloper.com/design/postmortem-loop-hero |
| Sail through fog with panic rising at night | Dredge | https://www.gamedeveloper.com/production/leveraging-the-unseen-to-turn-players-worst-fears-against-them-in-dredge |
| Move, auto-attack, pick upgrades | Vampire Survivors | https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors |
| Cancel/shorten actions on the tick (tick manipulation) | Old School RuneScape | https://oldschool.runescape.wiki/w/Tick_manipulation |
| Send a pilot back through time (carry-over) | Into the Breach | https://en.wikipedia.org/wiki/Into_the_Breach |

## Ideas for Clade
- **idea**: Treat the build as two layers: a persistent pool plus 2-3 limited pre-run kit slots (chosen from unlocked parts), and a per-moult 1-of-3 offer inside the Life; unlocks widen options, a heat ladder raises challenge.
- **idea**: Keep gates visible but make the exclusions hidden (learned by play), and let node success chance rise smoothly above the gate (OSRS style) so extra points are never wasted.
- **idea**: On death, keep one small carry-over and a partial egg score, with a one-tap restart, so a bad move costs seconds, not a run.

## Not found or weak
- No primary source on the "restart urge" or perfectionism; only practice articles ([Game Informer 2011](https://gameinformer.com/b/features/archive/2011/01/07/video-game-stress-relievers.aspx), [dotgg](https://dotgg.gg/the-one-more-try-effect-why-instant-restarts-make-browser-games-so-replayable/)). Whether quick restart harms is unsourced.
- Super Auto Pets, TFT, IdleOn, Brotato: no designer talk on hooks found. Only the TFT variance statement ([Riot](https://nexus.leagueoflegends.com/en-au/2019/10/dev-tft-set-1-learnings/)) and a Brotato press release. Melvor design interview not found.
- Slay the Spire GDC 2019 talk is login-gated; I did not read it ([GDC](https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019)). The Hades "meta" and the Spire "variety" readings are partly secondary.
- No sourced example for ambush, lure, hide, route-under-hunter, or "stat-gated node" verbs in small-grid games; Dave the Diver's page does not mention stealth.
- Hades pre-run loadout (weapon aspects, keepsakes) not verified. Dead Cells postmortem not found. Spelunky daily-seed design intent from Derek Yu not found.
- Several figures (near-miss sample size, Nunes and Dreze "twice the rate") come from secondary summaries and disagree or are unverified.
