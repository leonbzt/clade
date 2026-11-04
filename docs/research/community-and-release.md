# R7: Reaching ~100 on Discord; sharing without a server; web or Godot

Summary
- LIMITATION: the fetch budget ran out mid-pass (100/hour, shared). Reddit is blocked. Gaps are listed at the end.
- No source gives a postmortem of a small web idle game reaching about 100 Discord members. The Discord advice found is generic, and the numbers come from big or marketing sources. Treat it as weak.
- What the sources agree on: keep the server small, give members a reason to stay, tie it to a dated event (a beta weekend), and let players shape the game.
- itch.io: a web build is a first-class listing (zip upload, played in an iframe). Followers and tags feed discovery. Featuring is manual and opaque.
- Wikis: players argue Discord knowledge is not searchable and a wiki is cheaper for the dev. Evolve (a web idle game) keeps its wiki on GitHub.
- Sharing with no server works: URL or copy-paste codes, a date-based shared seed, a result text pasted into a Discord channel or an itch comment thread. Free serverless tiers exist if a shared store is needed.
- Web vs Godot: this goal favours staying web. Godot 4 cannot export C# to the web, and its web export has costs. Nothing found says Godot helps reach 100 people.
- Nothing found contradicts big-picture.md. P42's claim that Melvor Idle is on Steam and phones is only weakly checked (see below).

## Reaching about 100 on Discord
- Evidence quality: the only first-hand source is Descenders (a funded game with 4,000+ members at announcement), so its scale is not comparable. https://discord.com/blog/how-we-used-discord-to-build-a-dream-community-for-our-game-descenders
- Descenders tactics (first-hand, but a Discord-run blog): Discord from the start of the project; free beta access for joining the server plus a short form; early screenshots and videos only in the server; team roles picked by bot commands that unlock channels; weekly team contests with small prizes; separate bug, feature and showcase channels; volunteers translated text. Same URL.
- Descenders added a seed-based level mode about 3 weeks after release, from a request made within the first week. The only seed-related item found in the Discord sources. Same URL.
- Mike Rose, GDC 2019 (a talk summary, publisher view): run the heavy Discord push only a few weeks before launch because members tire of a long meta-game; closed beta of 3 to 5 days over one weekend for urgency; one server per game; start small, a huge elaborate setup is too much to run. His 5,000-signup target is for Steam games, not this scale. https://howtomarketagame.com/2019/03/19/gdc-2019-building-a-community-for-your-game-from-scratch/
- FirstLook blog: 50 to 100 real members in months 1 and 2; a few hundred active members beat a large dead server; weekly dev log; let members vote on names and designs; track active members, not joins. It is marketing content with no measured results (the page itself shows none), so it is weak evidence. https://firstlook.gg/blog/from-discord-to-steam-launch-community
- Uncertain: I found no source on how many players in a web game convert to Discord members. Do not assume a rate.

## Timing of a first release
- No source found gives data on "when". What exists: Rose says weeks, not months, of Discord hype before a launch; SuperWEIRD's devs (Luden.io) say they avoided big jams like Ludum Dare because games get buried. https://80.lv/articles/how-this-indie-dev-kept-their-game-on-the-front-page-of-itch-for-an-entire-month
- Same source: they used itch.io as a place to test before committing to Steam, and said they should have shown multiplayer earlier for testing and feedback.
- itch.io's own advice: finish the page before launch, not in the last hours; offer "follow" and "add to collection" to people who are not ready. https://itch.io/blog/88453/tips-and-tricks-to-help-your-itchio-launch
- Inference (mine, not sourced): a playable loop plus a share mechanism matters more than polish for the first drop, since the 100 are mostly early testers.

## itch.io
- HTML5 games: upload a zip with index.html; it runs in an iframe on the project page. Limits: at most 1,000 files, 500 MB total extracted, 200 MB per file. A Mobile Friendly checkbox exists. https://itch.io/docs/creators/html5
- Followers get your new games and devlog posts in their feed and by email (unless they turn it off), and sale emails. itch says followers can help a new project's placement. https://itch.io/docs/accounts/followers
- Tags are described as a major discovery source. https://itch.io/blog/88453/tips-and-tricks-to-help-your-itchio-launch
- SuperWEIRD (80.lv interview, one game): visibility tiers are New, New & Popular and Featured, split by genre. Featuring is manual and the criteria a "black box". Their month on the front page came mostly from being featured. They treated tags, thumbnail and banner as things to test, and asked friends to click the page at launch. They had no hard numbers. Players stayed over an hour on itch but only minutes on CrazyGames. https://80.lv/articles/how-this-indie-dev-kept-their-game-on-the-front-page-of-itch-for-an-entire-month
- The comments section can double as a free scoreboard (see below).

## Wikis
- r/incremental_games thread, May 2023 (replies only; the post image text was not available): a wiki stores facts, Discord keeps people engaged; Discord content is not indexed by search engines; wikis go stale too; Discord mods are unpaid fans; one commenter said running a Discord means leading a community and they would rather publish a wiki. https://axebps-redlib.hf.space/r/incremental_games/comments/13cqc6d/the_problem_with_the_wikidiscord_issue
- Evolve (web idle game, 1.3k GitHub stars) hosts its game at github.io, keeps a GitHub wiki, and links Reddit and Discord only in the game footer. https://github.com/pmotschmann/Evolve
- Antimatter Dimensions has a Fandom wiki and a Steam page (exists in search results). The dev interview says it uses its own Discord and r/incremental_games and mentions a suggestions channel too large to curate; it says nothing about how the community grew. https://www.incrementaldb.com/community/interview/31
- Uncertain: I did not verify wiki traffic or who runs these wikis. Inference: the species and tier data in `src/data` could generate wiki pages later, but that is far from M1.

## Sharing species or tier lists with no server (or a cheap one)
- Zero server, copy-paste: a text line on the clipboard, pasted into Discord or itch comments. Example in a Godot daily-run game: "[Spell Cascade Daily 02/21] ... | 5:23 | 42 kills" plus the page URL; the itch comments were used as the leaderboard. The author reports no results. https://dev.to/yurukusa/your-indie-game-doesnt-need-a-leaderboard-server-heres-what-i-built-instead-kha
- Same source: a daily seed comes from the date, so every player gets the same run and scores are comparable with no login. Streak is two localStorage keys.
- Another daily roguelike ("works like Wordle") shares results as emojis; no numbers given. https://www.dev.to/chr15m/i-made-a-daily-roguelike-game-that-works-like-wordle-3pea
- Descenders added seed-based levels on community request (see above), so seed sharing has precedent in a game with a community.
- URL hash or export string: livecodes documents compressing state into a shareable URL; Clade's species and tier data are small and fit in a code or link. https://livecodes.io/docs/tutorials/creating-shareable-urls (this is a tool's docs, not a game example)
- Discord webhooks need no bot, only a POST to a URL containing id and token. The token in client code would be public, so anyone could post to that channel. The page does not mention CORS or rate limits, so I could not confirm a browser can post directly. https://docs.discord.com/developers/resources/webhook
- Cheap shared store, if a real leaderboard is wanted: Cloudflare Workers free plan allows 100,000 requests a day and 10 ms CPU per request (page updated Oct 29, 2026). https://developers.cloudflare.com/workers/platform/limits/ . Workers KV free: 100,000 reads, 1,000 writes a day, 1 GB. https://developers.cloudflare.com/kv/platform/pricing/ . Supabase free: 500 MB, 2 active projects, pauses after 1 week of inactivity. https://supabase.com/pricing
- Discord Activities are web apps in an iframe inside Discord, using the Embedded App SDK. Not checked: whether it fits an idle game. https://docs.discord.com/developers/activities/overview

## Web or Godot
- Godot 4 cannot export C# projects to the web (use GDScript, or Godot 3). https://raw.githubusercontent.com/godotengine/godot-docs/master/tutorials/export/exporting_for_web.rst
- Godot 4.3+ has a single-thread web export, compatible with itch.io, Poki and CrazyGames, but it cannot use threads and is slower. Multi-thread needs cross-origin isolation headers. Same file.
- Web audio limits (no audio effects, reverb or procedural audio in the default web mode), Safari WebGL 2.0 issues, and mobile web is "at a premium". Same file.
- I could not fetch real size or load-time numbers (the fetch budget ran out); Godot forum threads about long web load times exist but were not read. https://forum.godotengine.org/t/why-html5-loading-time-with-godot-is-so-long/142532
- Lean: stay web. Reasons: (1) the community goal is about one-click play and links (itch.io page, share URL); a native Godot desktop build adds a download step, and the Godot web build has the costs above; (2) a pasteable share code and hash URL are trivial in JS; (3) P42's measured cost, a sim rewrite in GDScript, delays M1 for no audience gain. Godot's remaining case is the 3D look, which this research does not cover.
- P42 check: its "web idle games ship on Steam and phones as wrapped web apps (Melvor)" is plausible. Search results show Melvor Idle Version 1.0 "on PC and Mobile" (Jagex), but I did not read the page for how it is built. https://www.jagex.com/news/melvor-idle-version-1-0-launches-on-pc-and-mobile . I did not verify the Cookie Clicker claim.

## Not found or not checked
- Reddit threads (blocked); r/incremental_games posting rules; Cookie Clicker and Kittens Game community histories; Godot web load-time numbers; the Melvor origin article; the "5 lines of code" dev.to article (budget).

## Ideas for Clade
- **idea**: Add a "Copy species" button producing a short text line plus a compressed code that a URL hash can import, so players paste builds into Discord with no server.
- **idea**: Run a dated weekly "same seed" challenge (seed from the date) with a copied result line, posted in one Discord channel and the itch comments.
- **idea**: Put an itch.io web build and a small Discord (welcome, feedback, share-your-species) up only when a playable loop exists, with the Discord link in the game footer as Evolve does.
