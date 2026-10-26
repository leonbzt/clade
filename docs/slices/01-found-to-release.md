# Slice 01: Found to release

**Question:** do founding, growing, adapting and the first release feel good and clear in about 12 minutes, with
placeholder art?

The playtest should answer three things:
1. Does the growth split stay live, or do you set it once and forget it? (critic note 2 in
   [first-30-min.md](../first-30-min.md))
2. Does a gene pool pick feel like it matters, i.e. does the type specimen visibly change?
3. Does the first release feel like it pays?

**Source:** acts 1–4 of [first-30-min.md](../first-30-min.md), the beats from 0:00 to 14:00. Where this page and the
beat sheet disagree, this page wins.

## In scope

- **Setup:** Vite + TypeScript + Svelte for menus (from [tech-art.md](../tech-art.md)). The logic is plain TS with no
  DOM (`src/core/`), all numbers and content live in `src/data/`, and the UI is in `src/ui/`. Files stay under ~400 lines.
- **Island view, placeholder 2D** (SVG or canvas): a bare island, a steam vent in the lava field (the fixed home) and the beach. The
  art spikes replace this view later, so keep it thin.
- **Act 1, found:** the cold open line, then one button: **Found here**. The species card: an editable name, the type
  specimen, and the home "Steam vent: warm and damp at the centre, dry lava around".
- **Act 2, grow:** a hex patch around the vent, damp near it and drier further out. The colony grows on a tick, and
  a three-way split decides where its energy goes: Spread (new tiles), Cushion (water), Spores (genes). Dry spells are
  warned ahead; the outer tiles dry first, turn brown and stop, and rain revives them. Nothing dies.
- **Gene pool:** each generation offers 3 variants with one mutation each. Favouring one costs genes and raises that
  trait's frequency, and the home nudges drought traits up by itself. A trait counts as common at ≥ 50%; then it
  works and shows on the type specimen (a simple procedural drawing).
- **Photosynthesis skill:** gains XP from growth. Level 2 makes generations run by themselves, with up to 3 variants
  queued.
- **Tree:** three nodes. Land plants is the start, Mosses is the target, and Vascular plants is shown locked ("needs
  soil"). Mosses needs 3 precursors: rhizoids, surviving drying out, and a stalked spore capsule. After that the
  leafy shoot appears as a mutation; it's the biggest change to the type specimen. Once it's common, Mosses is
  reached and you get one codex card. (The peristome comes later, for True mosses, not in this slice.)
- **Fit:** bronze, silver or gold for the lava field and the beach, from traits. It's shown on the species card.
- **Release:** a greyed-out preview, updated live, unlocks at Mosses. The release screen lists kept / reset /
  gained, with "now" vs. "+1 generation". Release plays a dispersal animation across the island, patches fill in to
  the fit tier's share, and biomass per second ticks in the top bar and collects itself. In the garden view you can
  tap the moss to open its card. After that the slot shows "Found your next species" as disabled.
- **Core interface:** `step(dt)` drives everything, so the garden model can be replaced later (systems S20).
- **Dev panel:** speed ×1 / ×10 / ×100, skip 1 or 10 min, add genes, jump to "Mosses reached", reset, live numbers,
  and `window.dev.dump()`.
- **Content in data:** about 6 traits (3 of them Mosses precursors), the leafy shoot, 3 nodes, 2 niches and the
  codex text. All timers and rates go in one numbers file. Pacing is tuned later by feel, so keep the numbers rough.

## Out of scope

- Acts 5–7 go to slice 02: the soil edge, Thin soil, run 2, standing rules, the incumbent line and the slot teaser.
- The gulls (session 2), save and offline progress (`settle()`), slot 2, guild resources, bundles, seasons, tending
  moments, sound.
- Final art and the 2D-vs-3D choice (Q7); polish beyond placeholder. Desktop browser first, but nothing that blocks
  a portrait layout later (Q9).
- The curve model (a separate small task) and pacing work beyond "about 12 minutes".

## Before building

- Codex text comes from [research/moss-facts.md](../research/moss-facts.md). Lines whose source is marked [M]
  (from memory) or missing ship marked `[unverified]`.

## Done when

- [x] `npm run dev` runs, and `npm run check` (typecheck + tests) passes, printing only failures.
- [ ] At ×1 speed, without the dev panel, you can play from the cold open to biomass ticking in about 10–15 minutes.
      *(Not timed yet. A scripted perfect player reaches Mosses at ~7 min.)*
- [x] Every beat of acts 1–4 is there, including the three feel checks: the specimen changes after a pick, the
      release spreads across the island, and the island has two colours afterwards.
- [x] Core tests: the release preview equals the actual gain, and dry spells never remove tiles.
- [ ] No numbers or content are hard-coded outside `src/data/`. *(Game numbers, text and colours are; placeholder
      animation details such as particle paths and specimen geometry still sit in `src/ui/`.)*
- [x] You've played it, and notes answering the three questions are in `docs/playtests/01-found-to-release.md`.

## Built beyond the spec (AI choices, 26 Oct; change freely)

- Water evaporates slowly, and browned tiles take ~35 s to green up after rain. Without this, a split set once did as
  well as reacting to warnings.
- Each gene pool offer has a Pass button. Before Photosynthesis 2 the next generation waits for a pick; after it, up to
  3 offers queue.
- Panels open by generation: tree at 4, fit at 5, release preview at 6. The beach is capped at bronze (a poor fit).
- Soil building is left off the release screen's "you gain" list (it's slice 02).
