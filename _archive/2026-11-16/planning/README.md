# Planning the real build

Written 5 Nov. The user wants to turn the toys into the actual game ("i want to go down this route with the actual build"). This
is the kit for doing the research and planning in cloud sessions, which start cold: they see this repo and nothing else.

## For the user: how to run it

**1. Open up the network (once, or research will fail).** At [claude.ai/code](https://claude.ai/code), open your cloud environment's
settings and set **Network access** to **Full**. The default, Trusted, only reaches package registries and GitHub.

**2. Start part 1.** From a terminal in `11_clade` on branch `v2`:
```
claude --cloud "Follow docs/planning/README.md, part 1: run all the research tracks, commit and push, then stop and report."
```
Or at claude.ai/code: pick `leonbzt/clade`, branch `v2`, and paste the same text. It keeps running if you close your laptop.

**3. When it reports, read `docs/planning/research-digest.md`, then in the same session say:**
```
Part 2: run the planning session with me.
```
It's a conversation, on the web or your phone. It asks you questions; answer the way you always do.

**4. If credit is left, start part 3** as separate sessions, one per spike:
```
claude --cloud "Follow docs/planning/README.md, part 3: build spike S1."
```

**5. Bring it home.** Each session pushes its own branch. To continue one locally: `claude --teleport`. To play a spike: `git fetch`,
`git switch <its branch>`, `npm install` if needed, `npm run dev`, then open `/toys/`.

## For every session: the brief

**Who:** a biologist and solo hobby developer, about 3 hours a day. Long-time strategy, RPG and idle player (OSRS, Melvor, IdleOn, Idle
Obelisk Miner, Dark Souls builds). Inspired by TierZoo and r/outside: evolution read as RPG builds and a meta. The goal is a hobby game
with about 100 nerds on Discord. They rarely can imagine the end product up front, so playable things and concrete examples help most.
They write long free-form notes in reply to numbered questions.

**How to work with them:**
- **They own the design.** You're their game designer, biologist friend and critical senior developer. Your ideas are hypotheses until they
  call them. Label everything *decided (date)*, *proposal* or *idea*.
- Earlier projects died from tangled systems and polished AI plans approved before anything was played. Tie advice to what they actually
  played. Prefer the smallest playable thing that answers a question.
- Big calls: 2–4 options with a lean, at most three questions at a time. Be blunt and specific.
- **Think freely.** The plan and the guardrails in `docs/design/big-picture.md` §12 are current thinking, not law. If evidence or a better idea
  says otherwise, say so plainly, including when it's about something already decided. The user decides.

**Read first:** `docs/design/big-picture.md` (the plan) · `docs/playtests/08-garden.md` and `06-life.md` (what playing showed) · `docs/tastes.md` ·
the 4–5 Nov sections of `docs/decisions.md`. Code as needed: `toys/garden*.ts`, `toys/life2*.ts`, `src/sim/garden.ts`. Off limits unless a spec
says otherwise: `_old/`, `_archive/`, `_v1/`.

**What playing showed so far:**
- **Works:** walking for food on a budget, simple impactful choices, growing vs laying vs surviving, the marked predator strikes, rare
  mutations you must pass on ("really compelled to go on"), tier talk ("no upkeep in mud... brought it to s tier"). In the garden: the overview,
  creatures roaming, stock bars, skipping to see changes, variant offers.
- **Doesn't, yet:** "didn't have a big pull to wait and see what changes". What pulled was wanting to play: "really felt sad i couldn't play to
  fill the other niches" and "really wanted to play as a predator". Creatures aren't recognisable yet ("that can come later").

**Environment:** Node 22 and Chrome for Testing (`$CHROME_PATH`) are installed; a hook installs npm dependencies. Commit to your session's branch
and push often. Don't push to `v2` or `main`, don't merge, and don't rewrite the user's docs unless they ask.

## Part 1: research

Run one `researcher` subagent per track, in parallel. Give each its track below plus: "Be thorough: this is the one big research pass, so check
several sources, prefer primary ones, and say what's uncertain. Read the listed files first and don't repeat them." Each writes only its own file in
`docs/research/`. Commit and push after each one finishes. Then write `docs/planning/research-digest.md`, at most one page: the findings that matter most,
and **anything that contradicts the current plan**. Then stop and report.

| Track | File | Question | Read first |
| --- | --- | --- | --- |
| **R1** | `pull-and-filling.md` | In games with short active runs and a persistent world, what brings players back: waiting for change, or gaps they want to fill? How do collection logs, Pokédex-style grids and role rosters create pull, and when do they turn into chores? Look at Mewgenics, Niche, Cogmind, Desktop Dungeons, Rain World, Path of Achra, OSRS, Melvor, IdleOn, with player reviews and forums as evidence. | `docs/research/progression-games.md`, `diverse-evolution-games.md` |
| **R2** | `cambrian-world.md` | What did real Cambrian shallow seas look like, including around volcanic islands if known? Habitats, food webs, trophic roles. A table of about 30 candidate species: role, habitat, body plan, how it moved, how it fed, how sure we are. **Fact-check every `real:` line and species claim** in `toys/life2-data.ts`, `toys/life2-habitats.ts` and `toys/garden-data.ts`, and list corrections. | `docs/research/real-evolution.md` |
| **R3** | `eras-and-tree.md` | The real sequence from the Cambrian until life comes ashore: what changed in the environment (oxygen, substrate, reefs, climate, extinctions) and which new body plans appeared? Which real changes could nudge a free-evolving garden toward the next era? Which groups would move in clearly different ways, like chess pieces? Six to eight eras. | `docs/research/tree-of-life-overview.md`, `real-evolution.md` |
| **R4** | `predators-and-ghosts.md` | How do grid and turn-based games make hunting fun to play as the hunter, and make prey behave readably? How do games turn a player's own build or behaviour into an opponent (Super Auto Pets, Backpack Battles, Souls phantoms, the Nemesis system, racing ghosts)? What works without a server? | `toys/life2-sim.ts` |
| **R5** | `garden-models.md` | What simple models keep many species in an idle game swingy, readable and stable, with fast offline catch-up, and without one winner taking everything? Prior art from games and from ecology (competitive exclusion, trophic cascades, replicator dynamics). Compare with `toys/garden-sim.ts` and `src/sim/garden.ts`. | `docs/research/layer-sim-ecology.md`, `layer-sim-games.md`, `layer-sim-engineering.md`; P38 in `docs/proposals.md` |
| **R6** | `creature-readability.md` | How do you make a creature built from modular parts recognisable at low resolution? Silhouette, palette, size and zoom, procedural pixel art, Spore, Hatched. How do good map views show many small creatures? Must fit the look already chosen: 2D low-res low-poly, Pixelify, calm menus. | `docs/research/hatched.md`, `docs/playtests/03-look.md` |
| **R7** | `community-and-release.md` | How do small web, idle and roguelike games reach a community of about 100 on Discord? Timing of a first release, itch.io, wikis, share codes. How can players share species or tier lists with no server or a very cheap one? Does that goal favour staying on the web or moving to Godot? | `docs/research/reddit-feedback.md`; P42 in `docs/proposals.md` |

## Part 2: the planning session (with the user)

**Goal:** how to bring the Life, the garden, the island view, the tier list and the eras together into the actual build, as an order of work they believe in.

1. Read the brief's files and the research. Start with a one-screen overview in plain words and your biggest doubt, not a long document.
2. Go through the topics below, the ones that matter most first. Offer options with a lean and at most three questions per turn. Use concrete examples, since
   they find it hard to picture the end product. Push back when something seems wrong; ask when something is theirs to decide.
3. Keep `docs/planning/plan.md` up to date as you go, with every item labelled. Log their calls, dated and in their words, in `docs/decisions.md`.
4. End with: the first build milestone as small slices, each with one question and something to play; a draft `ROADMAP.md`; what from `src/` is kept, changed or
   deleted; and what you'd cut. Commit and push.

**Topics:**
- **The pull.** Waiting didn't pull; filling niches did. What's the main goal on the garden screen? What does filling a niche mean? Can every role be played? Does a Life cost anything?
- **Playing a predator,** and "your predator behaviour would later chase you". What's the verb on the board? Are rivals prey? How do other roles play?
- **Body plans.** Which ones next, and how do they move differently? How do parts, rare mutations, materials and stacking fit together?
- **The island view.** Decided: the shallow sea around the volcanic island. How many habitats? How does a patch become a board? Confirm what "the single maps could still split" means. What does zooming feel like?
- **The garden.** Keep the toy's model or adapt `src/sim/garden.ts`? What runs offline, and what does idle give you?
- **Species and the tree.** Release choice, branching, the evolution tree, skills such as Foraging.
- **Era and apex.** Decided: one era-wide rule, and your species can take the slot. What are the rules? How do you take it? The boss? The next era?
- **The look.** Recognisable creatures, feel, what zoom levels need.
- **Code and process.** Svelte or Godot (P42), porting the toys into `src/`, tests, which guardrails to keep.
- **Community and scope.** The smallest version that's a real game at 3 h/day, and when 100 nerds first see it.

*Optional, afterwards:* a fresh session reviews `docs/planning/plan.md` as a harsh senior developer: what will tangle, what's unproven, what to cut.

## Part 3: spikes (optional, one session each)

Throwaway toys that give the planning something to play. In `toys/` only, reusing the Life's code without changing how `toys/garden.html` plays; no changes in `src/`. Check them with
headless Chrome at `$CHROME_PATH` and look at the screenshots. Add a link in `toys/index.html`. At the end, say in a few lines what it tests, how to open it, and what you added beyond the brief.

- **S1, play a predator** (`toys/predator.html`): a Life where you hunt on the same boards, with rivals as prey that flee readably. Then a second mode where your own predator's build hunts you.
- **S2, recognisable creatures** (`toys/creatures.html`): the 10 residents and your plans at board, map and portrait size, drawn from the body doll, so you can tell them apart at a glance. Use `docs/research/creature-readability.md` if it's there.
- **S3, the island map** (`toys/shelf.html`): the existing island (`src/sim/island.ts`) with habitats as areas in the sea around it, creatures roaming, and a click that zooms into a board.
