# R4: Predators and ghosts (5 Nov)

Question: how do grid and turn-based games make hunting fun as the hunter, make prey readable, and turn the player's own build into an opponent, with no server?

## Summary
- Readable pursuit comes from few, learnable rules per hunter plus visible intent: Into the Breach shows every attack a turn ahead, Pac-Man gives each ghost one simple "personality", Alien: Isolation limits its monster so the player can learn it.
- Pressure needs relief: Pac-Man alternates chase and scatter, Alien: Isolation pulls the alien back when tension peaks. The current toy predator (hunt, mark, strike, rest) already has this shape.
- **Hunter-side fun: I found no primary source** (postmortem, talk) on grid or turn-based play as the predator. Only Pac-Man's frightened-ghost flip is documented as a role swap. Treat "predator is fun" as untested design, not researched fact.
- Player-built opponents are common and mostly asynchronous snapshots: Super Auto Pets and Backpack Battles fight your saved build against other players' saved builds; Forza Drivatars learn from play; Mario Kart ghosts are recordings.
- Server-free works when the opponent is data the game already has: your own past Lives, your lineage's best body, a stored replay. Sources show the server only adds "other people", not the mechanic.
- Fallbacks matter: Super Auto Pets uses AI-generated teams when no player team exists at that turn.
- Nemesis: the pull is in remembered, named history, not clever AI. Cut features are a warning against complexity (the faction morale layer was dropped).
- Uncertain: how SAP and Backpack Battles store and match builds (no developer source found); Souls phantom internals (not covered by the sources I could open).

## Details: readable hunters and prey
- Into the Breach: "players always know where the enemy are attacking next so each turn they have a chance to disrupt them"; designers say the worst case is having "no options whatsoever to resolve". https://gamedeveloper.com/design/reimagining-failure-in-strategy-game-design-in-i-into-the-breach-i- (full GDC talk: https://gdcvault.com/play/1025772/-Into-the-Breach-Design, not opened). Fits the toy's "marks a strike" turn.
- Pac-Man: four ghosts with distinct chase styles (Blinky persistent, Pinky cuts off, Inky unpredictable, Clyde wanders); scatter gives "a welcome but brief rest"; forced reversals are a cue that the mode changed; eating an energizer flips hunters to prey. https://www.gamedeveloper.com/game-platforms/feature-the-i-pac-man-i-dossier
- Alien: Isolation: a macro director plus a micro behaviour tree; the director knows where you are but the alien must "figure it out for itself"; menace rises with proximity and line of sight, and the director pulls the alien back after a peak; behaviours unlock on player actions, never on deaths; the alien cannot be killed but can be scared off. https://www.gamedeveloper.com/design/the-perfect-organism-the-ai-of-alien-isolation
- Junk Fish (Stalker, Brute, Fiend): each monster has one detection method (immediate senses, scent trail) that players learn and exploit. Not grid or turn-based, but the same "learnable rule" lesson. https://www.teamjunkfish.com/post/design-blog-05-monsters
- Roguelike scent tracking (hunters follow a decaying trail) is a documented cheap technique: https://drwjf.github.io/roc/notes/scent.html (not opened in detail; confirm before relying on it).

## Details: your build as the opponent
- Super Auto Pets: arena opponents are other players' teams from a database on the same turn, "AI-generated teams" if none exist; all battles asynchronous. https://superautopets.wiki.gg/wiki/The_Basics and https://en.wikipedia.org/wiki/Super_Auto_Pets
- Backpack Battles: opponents are saved builds, "semi-randomly" chosen, similar rank gets harder fights; modified runs are kept out of the pool; the fight is automatic. https://en.wikipedia.org/wiki/Backpack_Battles ; PC Gamer: the opponent "made that build hours ago, maybe". https://pcgamer.com/games/arrange-your-items-to-optimize-your-fights-in-asynchronous-autobattler-backpack-battles
- Forza Drivatar: behaviour learned from a player's driving is saved as a driving avatar, later moved to the cloud so others race it; Horizon 2 stresses aggression and shortcut-taking. https://news.xbox.com/en-us/2014/09/30/games-forza-horizon-2-drivatars/
- Mario Kart ghosts: a recording of one run; semi-transparent, harmless; saved locally in Time Trial; staff ghosts ship as the baseline; links can trade them. https://www.mariowiki.com/Ghost_Data
- Souls: bloodstains and messages were made "very opaque" on purpose so players draw their own conclusions; hidden presence creates "paranoia". https://gamedeveloper.com/design/how-i-dark-souls-i-multiplayer-mechanics-are-invading-other-worlds (quotes are from other developers in that article, not FromSoftware).
- Nemesis (Shadow of Mordor): inspired by sports as "systems which generate stories", with enemies that remember past encounters. https://mcvuk.com/monoliths-nemesis-system-inspired-by-real-world-sports/ . A richer faction morale layer was scrapped for a simpler domination mechanic. https://www.gameinformer.com/b/news/archive/2015/01/20/shadow-of-mordor-s-nemesis-system-was-once-a-bit-more-complicated.aspx

## What works without a server
- A ghost is just stored data from a past run (Mario Kart). For Clade: the Life already ends in a body plus parts (`finish` stores `best` per plan per habitat), so a past body can be replayed as a rival or predator in a later Life with no network.
- A snapshot plus a fallback generator (SAP) is the pattern: use your own history first, a generated opponent when the history is empty.
- Store a build (data) rather than input recordings if the board is deterministic by seed; the toy sim uses a seeded rng, so either is possible. I found no source comparing the two; this is my inference.

## Ideas for Clade
- **idea** The chasing predator is a past body of your own predator line, built from its saved parts, whose strike sides and guards you can read before it marks a strike.
- **idea** Give each predator one learnable trait (cuts off, tracks scent, wanders) shown when it arrives, and keep the hunt/strike/rest rhythm as the scatter-style relief.
- **idea** When no own history exists yet, generate the rival body from the habitat tier list (the SAP fallback), so the board is never empty.
