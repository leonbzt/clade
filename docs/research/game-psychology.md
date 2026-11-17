# Game psychology for Clade

17 Nov 2026. Research for the user's ask ("research game psychology and how the game could benefit"). Every
application below is an *idea* (CLAUDE.md rule 3) and none is the plan. Before the closed test, an idea becomes the
plan only by the user's call. Sources were cited from memory in a five-minute pass and **not re-fetched in this
session**: check one before relying on its details.

## Summary
- Clade already has most of the right pulls (§7 of the direction). The research mostly says **which to protect** and
  **which to keep honest**: competence (letters that move for a reason), autonomy (builds, which job, which variant),
  curiosity (silhouettes, unfound species), and a short Life as a session.
- Three gaps stand out: **no session end** (a Life ends, but there's no "come back to this" hook that isn't a timer),
  **the first five minutes** (no onboarding spec yet), and **loss** (beaten cells and dying lines need framing so
  they read as the web answering, not as punishment).
- Things to avoid: daily-login streaks, energy timers, paid or random rewards that crowd out the ones the player
  earned, and offline gains capped low enough to make the player come back on a schedule.

## 1. Self-determination theory: competence, autonomy, relatedness
**The finding.** Intrinsic motivation rests on three needs: competence, autonomy and relatedness (Deci & Ryan 2000,
*American Psychologist* 55(1)). In games, satisfying them predicts enjoyment and wanting to keep playing
(Ryan, Rigby & Przybylski 2006, *Motivation and Emotion* 30; Przybylski, Rigby & Ryan 2010, *Review of General
Psychology* 14(2)). Rewards that feel controlling can crowd out intrinsic motivation (Deci, Koestner & Ryan 1999,
*Psychological Bulletin* 125(6); the overjustification effect, Lepper, Greene & Nisbett 1973).
**For Clade:**
- *Competence = the letter moves, with a cause.* Every tier change carries one cause line ("no upkeep in mud: S").
  This is already the voice (tastes, 4 Nov); the research says it's the core of competence feedback, so it should
  never be cut for space. A Life's end screen should show *what your build did* (food eaten per node, the node that
  paid most), not just totals.
- *Autonomy = real choices, never one best.* The "no best, no dead" test (direction §4) is an autonomy guarantee: keep
  it as a test. In B0, a tree where one node path always wins removes autonomy, so the playtest should ask "did two
  builds feel viable?".
- *Relatedness, without multiplayer:* earlier Lives staying on as the meta and other inhabitants (fifth round wish) is
  relatedness to your own past. A short named history on a card ("your third Life took this cell") gives it cheaply.
- *Avoid controlling rewards:* no "log in to keep your streak". Rewards come from what the player did in the sim.

## 2. Flow and difficulty: the Life as a match
**The finding.** Flow comes when challenge matches skill, with clear goals and immediate feedback
(Csikszentmihalyi 1990, *Flow*). Fun is learning a pattern; when nothing's left to learn, boredom follows
(Koster 2004, *A Theory of Fun for Game Design*).
**For Clade:**
- *The Life's pressure should rise as the creature grows* (bigger body, bigger rivals, hunters in its window), so
  difficulty follows skill within one Life, the way a roguelite run does.
- *New patterns, not bigger numbers:* each new line should bring one new mechanic (moult, shell, dash, burrow:
  direction §4). That's the "learn a new pattern" fuel; a line that's only a stat change gets boring fast.
- *Immediate feedback:* when a node pays (a dash catches prey), show it in the moment: a small stamp, a number.

## 3. Curiosity and discovery: the information gap
**The finding.** Curiosity is a feeling of deprivation from a known gap in knowledge; a gap that looks small and
closable pulls hardest (Loewenstein 1994, *Psychological Bulletin* 116(1)).
**For Clade:**
- *Silhouettes on unfound species cards are exactly an information gap.* Show the gap's size: "2 dial steps from
  *Nereis*" makes it closable. A card's shape, habitat and one hint line ("lives where the mud meets rock") are enough.
- *Unknown jobs on the board:* show an empty job as "?" with its food, not as hidden. The player sees the gap.
- *Variants on the map:* a variant that's "close to a real species" could glow faintly, turning the map scan into a
  hunt with a target (the user's "looking at the map its own core gameplay loop").

## 4. Collection and completion
**The finding.** Collecting satisfies a need for completion, mastery and identity (McIntosh & Schmeichel 2004,
*Leisure Sciences* 26(1)). People speed up as they near a goal (the goal-gradient effect: Hull 1932; Kivetz,
Urminsky & Zheng 2006, *Journal of Marketing Research* 43(1)). Starting a card with some progress already given makes
completion more likely (the endowed progress effect, Nunes & Drèze 2006, *Journal of Consumer Research* 32(4)).
**For Clade:**
- *Species cards as a visible, finite set per clade* ("Annelids 3/9"). Finite matters: the goal gradient only works
  when the end is visible.
- *Endowed progress:* the first line's card set starts with the colonist species already found (1/9, not 0/9).
- *The goal gradient on the tree:* show "one variant away" on the nearest species; that's when the player leans in.
- *Don't over-reward collecting* (see §1): cards open the next line, which is a real use, not a badge.

## 5. "One more run": closure, near-goals and the peak-end rule
**The finding.** Unfinished tasks stay on the mind (the Zeigarnik effect, 1927; its replication is mixed, so treat it
as a design heuristic). A memory of an experience is set mostly by its peak and its end (Kahneman, Fredrickson et al.
1993, *Psychological Science* 4(6); Fredrickson & Kahneman 1993, *JPSP* 65(1)).
**For Clade:**
- *End each Life on a high, then show the next goal:* the clutch reveal (the variant your build made) is the peak; put
  it last, and then one line with the next goal ("this cell needs one more letter to hold against the crab"). That
  line is the "one more run" hook, and it's honest because it's a real goal in the sim.
- *Short Lives keep "one more" cheap:* if a Life is about 3 to 5 minutes, one more is an easy yes. Measure Life length in
  the B0 playtest.
- *Show the build you'd try next:* "your clutch leans *speed*; next Life opens the dash node". A plan in mind is an
  open task.

## 6. Idle and incremental motivation
**The finding.** Idle games mix active play with progress while away; players enjoy delegated play and returning to
gains (Fizek 2018, "Interpassivity and the joy of delegated play in idle games", *Transactions of DiGRA* 3(3);
Alharthi et al. 2018, "Playing to Wait: A Taxonomy of Idle Games", CHI 2018). Designers tune growth curves so each new
upgrade arrives about when the last one stops feeling new (Pecorella, "Idle Games: The Mechanics and Monetization of
Self-Playing Games", GDC 2015; and his "The Math of Idle Games" posts on the Kongregate blog).
**For Clade:**
- *The garden while away is the idle half:* the return screen should be a story with causes ("while you were away:
  the crab took cell 3; your worms boomed in the mud"), not just totals. That's the "web answering you" pull.
- *Never punish being away:* no rot or decay that makes players come back on a schedule. A beaten cell is fine
  (that's the sim), but the catch-up budget (8 h) should never be the reason to log in.
- *Hybrid idle (tastes, 2 Nov):* early lines need attention and later ones run themselves; an auto-run door (direction
  §5) fits here and matches the literature's "active early, idle later" arc.
- *Pacing:* a steep line curve (seventh round) works when each level opens a named thing (see
  `progression-games.md`: OSRS and Melvor levels unlock something specific).

## 7. Short sessions on mobile
**The finding.** Mobile play happens in short, interrupted sessions; designs that save state constantly and make a
session's goal fit its length keep players (Hodent 2017, *The Gamer's Brain*, on attention and memory limits).
**For Clade:**
- *One Life is one session.* It must save and resume mid-Life with no loss (a phone call ends it otherwise).
- *A 30-second session should be worth it too:* check the garden, adopt a variant, start a Life later. The map loop
  is the short-session loop; the Life is the long one.
- *Readable at a glance:* the return screen's first line is the most important news (tastes: "important news stands
  out").

## 8. Onboarding
**The finding.** Tutorials help most in complex games and least in simple ones; learning by doing beats text
(Andersen et al. 2012, "The impact of tutorials on games of varying complexity", CHI 2012). Players' attention and
working memory are small; teach one thing at a time, in context (Hodent 2017).
**For Clade:**
- *The first Life teaches by play:* walk, eat, grow, lay, one prompt at a time, each shown only when it's needed.
  No text page.
- *Fast unlocks at the start* (tastes, 2 Nov) fit: the first Life's tree should open a node within a minute.
- *Hide systems until they matter:* rivals, letters and variants each appear the first time they apply, with one line.
  The first time a letter shows, explain it ("S means your build is top in this job now").
- *A closed-test check:* watch where strangers stop or ask "what do I do?"; that's the onboarding to-do list.

## 9. Loss and frustration
**The finding.** Losses weigh about twice as much as equal gains (Kahneman & Tversky 1979, *Econometrica* 47(2)).
**For Clade:**
- *A beaten cell or an extinct line is a loss,* and the user wants these swings (tastes: "species dying out").
  Framing helps: always give a cause and a counter ("the crab beat you: shell beats bite. A guard variant would hold").
  A loss with a next step reads as a challenge.
- *Never lose a card or a line level:* permanent things stay permanent (the progression map already says this).

## 10. Ethics: engagement without dark patterns
**The finding.** Game dark patterns include grinding to fill time, "playing by appointment", daily rewards that punish
absence, and pre-delivered content (Zagal, Björk & Lewis 2013, "Dark Patterns in the Design of Games", FDG 2013).
Randomised paid rewards are linked to problem gambling (King & Delfabbro 2018, *Addiction* 113(11); Zendle & Cairns
2018, *PLOS ONE* 13(11)). Near-misses raise the urge to keep going even when there's no skill involved (Clark et al.
2009, *Neuron* 61(3)).
**For Clade:**
- *Random variants are fine; selling them isn't.* Variant hunting is variable reward, which is the same pull as loot.
  It's honest while it's free, tied to the sim and never sold. If Clade is ever monetised, no paid randomness.
- *No appointment play:* no timers that waste progress if missed; no daily streak.
- *No fake near-misses:* "one step from *Nereis*" must be true in the model, never shown to tease.
- *A natural stopping point:* the end of a Life is one. The return screen can say "your garden runs while you're
  away" so the player feels free to leave.

## Top five, for a later step (*ideas*, for `ideas.md` if the user wants them)
1. A Life's end: clutch reveal last (the peak), then one next-goal line (B0 playtest can try this cheaply).
2. Cards show the gap's size ("2 steps from *Nereis*") and a finite count per clade, starting at 1.
3. The return screen as a story with causes, first line the biggest news.
4. Each loss carries a cause and a counter.
5. The first Life teaches one verb at a time, by play.

## Sources
Deci & Ryan 2000; Ryan, Rigby & Przybylski 2006; Przybylski, Rigby & Ryan 2010; Deci, Koestner & Ryan 1999; Lepper,
Greene & Nisbett 1973; Csikszentmihalyi 1990; Koster 2004; Loewenstein 1994; McIntosh & Schmeichel 2004; Hull 1932;
Kivetz, Urminsky & Zheng 2006; Nunes & Drèze 2006; Zeigarnik 1927; Kahneman et al. 1993; Fredrickson & Kahneman 1993;
Fizek 2018; Alharthi et al. 2018; Pecorella, GDC 2015; Hodent 2017; Andersen et al. 2012; Kahneman & Tversky 1979;
Zagal, Björk & Lewis 2013; King & Delfabbro 2018; Zendle & Cairns 2018; Clark et al. 2009. Full details inline above.
