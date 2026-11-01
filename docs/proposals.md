# Proposals (open)

AI proposals waiting for your call or a spec. **At most three open at a time.** Each names the milestone it serves,
gives options with an AI lean, and asks at most three questions. When you decide, your call goes to
[decisions.md](decisions.md) (and [vision.md](vision.md)), and the proposal leaves this file. Anything without a
milestone goes to [ideas.md](ideas.md) as one line.

Numbers continue from P33. P1–P33 in full are archived (`_archive/2026-11-01/systems.md`, reads blocked). Only the
open parts needed for M1 are kept here; the rest is parked in ideas.md.

## P32. Nitrogen by the gram, the rot chain, and one clock *(M1 step 1; decided 1 Nov, needs its spec)*
Your calls are in decisions.md (1 Nov). Kept here as the source for the slice 11e spec; it leaves once that spec exists.
- **Why it's fragile now:** nitrogen isn't tied to grams. Plants take a fixed rate whatever they grow, fungus makes
  0.006 whatever it eats, and one unit is 5000 g/m² (real plant-available N is 1–5 g/m²). So fungus is nearly all
  the nitrogen, and any change to litter swings the whole web (P30 a cut litter, fungus died, ferns crashed). Real
  old ecosystems get ~90% of plant N from recycling; young volcanic islands are N-poor and new inputs decide.
- **a. Nitrogen follows the grams.** Options: **a1 (AI lean)** each species has a tissue N share; plants take
  production × share (no N, no growth); litter carries the N of what fell; decay frees it and a share `leak` is lost;
  fungus speeds decay instead of making N; fixers add N per gram made; dung returns the food's N minus what the body
  keeps; bodies carry theirs into litter; an N ledger like the grams one. Hotspots can't come from nothing. A few
  multiplies per slot. **a2** only uptake tied to production, fungus as now. **a3** retune rates, no structure.
- **b. Rot chain.** Standing litter = litterfall ÷ decay; real floors hold 1–3 years of fall. **b1** litter decay from
  the clock (d), so litter holds a few "years" of fall again. **b2** fungus as a decay boost (litter → threads →
  springtails). **b3** eaters' `full` and fungus's need in years of litterfall, not absolute units, so they rescale
  when rates change. Lean: b1 + b3 now, b2 with a1.
- **c. Real values** (rough, from memory; the researcher can source them). Per m²: standing g · production g/yr ·
  tissue N. Cyano crust 10–50 · 20–100 · 3–6%, fixes 0.1–1 g N/yr. Lichen 50–500 · 10–50 · 1–3%, fixes 0.1–1.
  Moss 100–1000 · 50–300 · ~1%, litter k 0.1–0.3/yr. Liverwort 50–300 · 50–200 · 1.5–2%. Club moss 100–500 · 50–150
  · 1–1.5%. Fern 200–1000 · 200–800 (fronds ~1×/yr) · 1.5–2.5%, k 0.3–1/yr. Fungus threads 10–100, turnover 5–20/yr,
  3–6%. Soil N: available 1–5 g, total 100–1000 g. Rain 0.1–1 g N/yr; a gull colony ~5 (Surtsey); leak in N-poor
  land ≤10–20% of what's freed. Springtails 10⁴–10⁵ per m², snails 1–50; snail life 1–5 yr, springtail months.
  Soil on young lava ~1 cm per 100–1000 years.
- **d. One clock, three tempos.** Every rate in data in real units (per year), and the sim divides by a game clock:
  ratios stay real and one knob speeds a whole group. One clock can't fit all: with a year ≈ 8 min, a fern forest
  (decades) takes hours and soil (centuries) never comes. So three tempos, each one multiplier in the dev panel:
  **life** (moving, eating, breeding: days), **cycle** (growth, turnover, litter, nitrogen: years), **ground** (soil,
  humus, succession: centuries). Balance lives where tempos meet (grazing vs regrowth, soil vs plants), so an eater's
  yearly intake stays in cycle units and only its behaviour is in life.
- **e. Today's pace on that clock:** `renew` 6%/min ≈ moss turnover 0.5/yr, so a year ≈ 8 min. Then litter decay
  should be ~0.0006–0.002/s (now 0.01, 5–15× fast) and a full crust fixes ~0.001 g N/m²/s.
- **f. Small fixes:** fewer headlines (they doubled with the 2% floor: a higher bar or a per-habitat cooldown);
  bristletails on dry crusts first, litter second; a sim line for nitrogen by source and litter in years of fall.
- **Open:** a1, a2 or a3; three tempos or one; the year's length; the leak share.

## P33 a. Tempos, checked *(M1 step 1, or after M1: open call 2 in the roadmap)*
Two real clocks and a view speed (from P32 d).
- **Cycle:** every gram and nitrogen flow (eating, births, deaths, tree growth).
- **Ground:** slow stores (soil, humus). Speeding them means a smaller store, and the flows across the seam carry
  one visible factor, so the ledger stays honest.
- **Life:** movement and behaviour only. Foraging and hunting rates are set per year, so the life knob changes no
  yearly flow (a test: life ×2 keeps the yearly flows within ~5%).
- Trees on cycle: a stand takes 1–3 h, fine for an idle game.
- **Open (yours):** the clock in slice 11e, or after M1? *AI lean: after M1*, with "a year ≈ 8 min" as a display
  conversion until then (reasons in the roadmap).

## P33 c. Species from the sim *(M1: decide before the 12a spec)*
From your 1 Nov call: no split-and-place by the player.
- **No buying and no split-and-place.** Three sim routes, each a headline, the new species wild at first:
  **drift** (groups in separate habitat pieces drift apart), **key** (a variant meets a recipe and rolls it),
  **partnership** (two species overlap long enough, e.g. lichen from fungus and cyano).
- You pick any species to start a run from; runs are how you steer toward a recipe.
- Authored: the real tree, recipes and odds; never which species or where.
- **Today's introductions become sim routes:** land plants (bought) → a key; fungi (bought) → part of the starting
  set; lichens (bought) → a partnership; ferns (bought on a layer gate) → a key on the vascular line; animals
  (arrivals) → life coming ashore (P33 e, now parked in ideas.md; until then arrivals stay as they are).
- **Open (yours, ≤3):** which routes M1 needs (AI lean: key only; drift waits for 12b as you said, partnership
  later); do arrivals stay (AI lean: yes for M1); the starting set at home.
