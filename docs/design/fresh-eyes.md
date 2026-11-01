# Fresh-eyes review (26 Oct)

An outside game designer's view, written without reading systems.md, minigames.md, slices or code.
Only brief.md (idea + pillars) and playtests/02-toys.md were read. This is input, not a decision.
**[O]** = opinion. **[F]** = fact or near-fact. Unmarked lines are opinion.

## 1. The core

**One sentence:** pick a species, place its patch on the island grid, watch it spread and compete by simple local
rules, and spend what its territory earns to evolve it into the next node, which you place again while the old one stays.

- The "one thing you do" is **placing**. Where and what. Everything else is the show or the payoff.
- Why: your toy notes say the same thing three times. Growth looks great, decisions feel weak.
  Growth was the mechanic, so there was nothing to decide. Make growth the *reward* and placement the *decision*.
- Placement serves both core feelings with one verb. The map filling up is "growing the ecosystem".
  New traits that change how your patches spread are "growing the species".
- It sits right on your taste: Terra Nil (restore by placing), Carcassonne (adjacency scoring), Go (territory),
  cellular automata (spread). Those four are one game. Most of the rest of your list is not.
- Idle fits naturally: spread and income run while you're away; you come back to new space and new choices.

## 2. Cut, defer, risks

**Defer until after the first itch release [O]:**
- Parallel species slots, each with its own minigame. One map, one species line at a time first.
- Two zoom levels (colony and garden). It doubles the UI. One map, maybe a detail popup.
- A gene pool screen. A trait list on the species card is enough.
- Horizontal resources per guild. Start with biomass only; add a second currency when a choice needs it.
- Roaming cute animals. Lovely, but it's art and AI work. Add as decoration late.
- Most kingdoms. Plants to the first release, grazers as the one animal guild.

**Keep, but in tiny form:** relationships as adjacency rules (grazer next to grass = bonus, shade kills moss).
Pressure as CA competition for cells. Succession as "this cell type unlocks after that one".

**Biggest risks:**
1. **Two games that drift apart.** An upgrade-menu idle game and a spatial sim. If the menus don't change the map
   and the map doesn't feed the menus, players play one and ignore the other.
2. **Emergence vs. hand-curated pacing.** A free CA makes curves hard to tune. Fix: the economy reads only simple
   aggregates (cells held, neighbours of type X). Never let income depend on fragile sim details.
3. **The tree of life as a content and research sink.** Curate one fixed path of ~20–30 nodes. "A lot of freedom" later.
4. **Scope by minigame.** Every distinct minigame is a small game to design, juice, balance and automate.
5. **The map fills, then the game stalls.** You need a ceiling-breaker: new terrain from succession, disturbance
   (fire, eruption), or new layers. Forest-fire disturbance is a natural fit here.
6. **Readability of layered grids.** Your own note. Max two visible layers at once, with toggles.

## 3. IdleOn-style variety, cheaply

**[F]** Most IdleOn systems are not distinct gameplay. They're upgrade screens with a twist: a new currency,
a new unlock rule, a new kind of bonus. The few real minigames are small and simple. That's the cheap path.

**Realistic cost per mechanic, solo dev with AI help, part time [O]:**
- *Menu mechanic* (new currency + upgrade list + one twist, e.g. a collection book or "statues"): 0.5–2 days.
- *Small active minigame* (timing bar, 6×6 minesweeper, connect-the-flow puzzle) with juice and an
  automation upgrade: 3–7 days.
- *Sim-based minigame* (boids, ant trails, Physarum) turned from toy into a game with real decisions: 2–4 weeks.
- Add ~30% on top of each for balance and its knock-on effect on other systems. This cost compounds.

**Cheap mapping to life [O]:** timing bar = pollination or a predator strike. Hidden info = soil survey before
placing. Connect-the-flow = mycorrhizal or root networks. Draft = choosing mutations at evolve time
(a draft of 3 is cheap; a full deckbuilder is not). Boids, ant trails, Physarum = visuals for animal and fungus
patches, not mechanics.

**Structure so each new one is cheap:**
- One `Mechanic` interface: `id`, initial state, `tick(dt, ctx)`, `offline(dt, ctx)`, unlock condition, panel view.
- One **stat pipeline**: named stats, each = base + additive + multiplicative modifiers, every modifier tagged with
  its source. Mechanics only *emit modifiers*; they never touch each other directly. This also gives you a free
  "why is this number" tooltip.
- One **currency registry** and one **unlock registry** (conditions as data: `{cellsHeld: {moss: 50}}`).
- Content in typed TS data files (`satisfies`), not JSON. The AI can edit them and the compiler checks ids.
- A generic upgrade-list panel. 80% of menu mechanics should be "this panel + a data file + one function".

## 4. Build order to a first itch.io release

Sizes are part-time hobby weeks [O]. Each milestone ends with a playtest note.

| # | Build | Question it answers | Size |
|---|---|---|---|
| M0 | Grid, place a patch, CA spread, two species competing | Is placing and watching spread fun for 5 minutes? | 1 wk |
| M1 | Biomass, one upgrade list, evolve to next node, old patch stays | Does "evolve, place again, the old one stays" make me want one more? | 1–2 wk |
| M2 | 3 adjacency relationships, succession unlocks, one disturbance | Do placement choices become real decisions (Carcassonne feel)? | 2 wk |
| M3 | Save, offline progress, dev panel with time skip, curve script | Is coming back after 8 hours rewarding? | 1 wk |
| M4 | Grazers as one animal guild + one small active minigame that automates | Does variety add or distract? | 2 wk |
| M5 | Content to ~1 hour active + a few days idle, art pass, juice, itch page | Do strangers come back on day 2? | 3–4 wk |

About 2.5–3 months part time. Release after M5 even if it feels small. Feedback beats polish.

## 5. Keep the vision, stay doable

- Write the one-sentence core on the first line of status.md. Every feature must change *what* you place or
  *what the map does*. If it does neither, it goes on the later list.
- One new system per milestone. Never two.
- Toys get a 2-day timebox. If it isn't fun by then, keep the notes and drop it.
- Let the sim be your art. CA, L-systems and reaction-diffusion look beautiful and cost no hand-drawn assets.
- Fixed small palette (e.g. 16–32 colours), one tile size, one pixel font. Consistency reads as quality.
- Specs give a goal and a feel, not beats. Lock first-session timings only after the loop is fun.
- Every active mechanic ships with its automation upgrade. That's how "attention first, idle later" stays true.
- Delete more than you add after each playtest.

## 6. Tech and architecture

- **Sim/view split.** `sim/` is pure TS with no DOM, canvas or time calls. `view/` reads state and draws.
  Input becomes commands (`place`, `buy`, `evolve`) that the sim applies. This makes saves, tests and offline trivial.
- **Fixed tick** (e.g. 5–10 sim ticks per second), render on `requestAnimationFrame`, interpolate visuals only.
- **Determinism.** Seeded PRNG (sfc32 or mulberry32) stored in the save. No `Math.random` in `sim/`.
  Grid in typed arrays (`Uint8Array` per layer). Same seed + same commands = same state; test it with a hash.
- **Offline progress [O].** Run the same sim in batched ticks, capped (e.g. 8–24 h), with a summary screen.
  **[F]** A 64×64 grid is ~4k cells; tens of thousands of ticks of simple rules run in well under a second in JS.
  If it gets heavy, run the CA coarse and the economy from aggregates.
- **Saves.** Versioned JSON with a list of migration functions. Autosave every ~30 s and on `visibilitychange`.
  Export/import as a text string. **[F, as far as I know]** itch serves many HTML games from a shared domain, so
  prefix your storage keys with a unique game id. Players clear browser data; the export string is your backup.
- **Numbers.** Plain JS numbers until something passes ~1e15. Don't add a big-number library on day one.
- **Rendering [O].** Canvas 2D or PixiJS for the map, plain DOM + CSS for menus (`image-rendering: pixelated`,
  pixel font). DOM menus are far cheaper to build and edit than canvas menus.
- **Testing feel.** Dev panel: speed ×10/×100, time skip, grant resources, unlock all, show stat sources.
  A headless script that plays a fixed "reasonable" policy and prints time-to-each-unlock is your curve model.
  It's a ruler, not a balance bot. Vitest for: determinism, save round-trip, migrations, offline = online.

## 7. Where I think you're wrong [O]

- **Too much decided too early.** Steam vents, seabirds in session 2, a release at 12 minutes, peristome order:
  these are content beats for a loop that doesn't exist yet. They anchor the design before the toy is fun.
- **"Lots of minigames for the diversity of life."** Feasible only if most are menus. IdleOn is years of one
  developer's full-time work. Plan for 1–2 real minigames in the first release.
- **Your taste list is too long to all fit.** Liking a mechanic isn't a reason to include it. Pick the ones that are
  one game together: placement, territory, CA spread, plus one small skill minigame. Park deckbuilding and
  auto-battlers; each is its own game.
- **"Directing growth" is the wrong target.** Steering a growth sim in real time is fiddly and weak (your patch toy
  shows it). Discrete choices on a beautiful sim feel better than continuous steering of it.
- **"Hand-curated" and "a lot of freedom on the tree of life" pull against each other.** Choose curated first.
- **Low-poly 3D is a trap for this project.** A grid sim, pixel menus and solo art all point to 2D. Decide it now.
- **Docs vs. code.** A lot of structure exists (brief, slices, research) and no code *(AI note: wrong. Slice 01
  and four toys exist; the reviewer wasn't allowed to read them)*. The next truth comes from M0,
  not from the next doc.
