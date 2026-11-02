# Slice 04: A calmer map and the early line

**Question:** with a calmer, prettier map and a run of quick early unlocks, do the first ~15 minutes pull you in, and
can you read the island at a glance?

Builds on slice 03 (git tag `slice-03`). Offline progress isn't needed for feel testing; the dev panel is enough.

## In scope

**Dev panel works.** The backtick is a dead key on German keyboards, so the panel never opened. Fix it: the
physical key left of 1 (`Backquote`), F2, and a **Dev** button in the top bar.

**Decluttering and art**
- **Ground cover:** each species dyes the ground under it, dithered pixel by pixel with soft, organic edges. Zones
  read as areas, not as a field of sprites.
- **Fewer sprites:** crusts (cyanobacteria, lichens) are mostly ground cover with a few details. Mosses and
  liverworts show sprites on only some tiles. Tall plants stay sprites, but sparser.
- **Zoom:** whole island ↔ close-up (mouse wheel or + / − buttons; drag to pan). Zoomed out is calm; zoomed in shows
  every sprite.
- **Zones view:** a flat map of who holds what (one colour per species), next to the Soil view.

**The early line: quick unlocks, then a gate.** The island starts bare; nothing wild on it.

| Node | Gives | Rough timing |
| --- | --- | --- |
| Life (start) | — | 0:00 |
| Cyanobacteria | a dark crust on damp rock and the beach; weak, gets pushed aside | free, 0:00 |
| Land plants (gate) | — | ~0:30 |
| Liverworts | flat green ribbons; need it very wet (the vents) | ~1:00 |
| Mosses | damp ground; the first real soil | ~2:00 |
| Fungi (gate) | — | ~3:00 |
| Lichens | **the unlock:** a fungus living with cyanobacteria (needs a cyanobacteria crust). Opens dry lava, builds soil there | ~4:00 |
| Vascular plants (gate) | — | ~8–10:00 |
| Club mosses / Ferns | as in slice 03 | ~10–20:00 |

- Each new species gets 2 traits, each with an upside and a downside, shown on the sprite.
- Every node has a fact line. *(Built: written from general knowledge, not checked against sources yet; a fact-check
  pass is open.)*

## Out of scope
- Save and offline progress, traits as choices (adapting), biomes (next slice), the sea line, animals, sound.

## Done when
- [x] `npm run check` passes; `npm run curve` shows the first five unlocks within ~5 minutes (bot: Lichens at
  2.8 min, Vascular at 5.3, Ferns at 10.8; all six species still coexist at 40 min).
- [ ] The dev panel opens on your keyboard. *(Fixed: the key left of 1, F2, or the Dev button. Please confirm.)*
- [ ] You've played it: notes in `docs/playtests/04-calm-map.md`. Is the map calm and readable? Do the early
  unlocks pull you in?

## Built beyond the spec (AI choices, 26 Oct; change freely)
- **Niches for the early species.** In the first curve run, liverworts and cyanobacteria died out. Now liverworts
  hold the wettest vents (mosses fall off faster when waterlogged), and cyanobacteria hold the salty beach (they
  tolerate salt; lichens barely do).
- Vascular plants cost 1500 (was 800), so the gate doesn't come at 5 minutes for a human.
- Dev URL options added: `?view=zones`, `?zoom=3`. `npm run curve` now prints (vitest hid console output).
- Fixed a hang: the map's setup re-ran on every zoom or pan change; it now runs once.
