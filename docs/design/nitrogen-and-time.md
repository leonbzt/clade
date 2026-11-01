# Nitrogen by the gram, and the clock (P32, P33 a)

Moved from proposals.md on 1 Nov, once slice 11e was specced. **Your calls (decisions.md, 1 Nov):** a1, b1 + b2 now,
c as a start, a year ≈ 8 min; the three-tempo clock waits until after slice 12 or later. Slice 11e builds a, b and f
without the clock ([slices/11e-close-out-the-sim.md](../slices/11e-close-out-the-sim.md)).

## P32. Nitrogen by the gram, the rot chain, and one clock
- **Why it's fragile now:** nitrogen isn't tied to grams. Plants take a fixed rate whatever they grow, fungus makes
  0.006 whatever it eats, and one unit is 5000 g/m² (real plant-available N is 1–5 g/m²). So fungus is nearly all
  the nitrogen, and any change to litter swings the whole web (P30 a cut litter, fungus died, ferns crashed). Real
  old ecosystems get ~90% of plant N from recycling; young volcanic islands are N-poor and new inputs decide.
- **a1 (decided). Nitrogen follows the grams.** Each species has a tissue N share; plants take production × share
  (no N, no growth); litter carries the N of what fell; decay frees it and a share `leak` is lost; fungus speeds
  decay instead of making N; fixers add N per gram made; dung returns the food's N minus what the body keeps; bodies
  carry theirs into litter; an N ledger like the grams one. Hotspots can't come from nothing. A few multiplies per
  slot. (Not chosen: a2 only uptake tied to production; a3 retune rates, no structure.)
- **b. Rot chain.** Standing litter = litterfall ÷ decay; real floors hold 1–3 years of fall. **b1** litter decay from
  the clock, so litter holds a few "years" of fall again (without the clock: a retune to the year). **b2** fungus as
  a decay boost (litter → threads → springtails). **b3** eaters' `full` and fungus's need in years of litterfall, not
  absolute units, so they rescale when rates change.
- **c. Real values** (rough, from memory; the researcher can source them). Per m²: standing g · production g/yr ·
  tissue N. Cyano crust 10–50 · 20–100 · 3–6%, fixes 0.1–1 g N/yr. Lichen 50–500 · 10–50 · 1–3%, fixes 0.1–1.
  Moss 100–1000 · 50–300 · ~1%, litter k 0.1–0.3/yr. Liverwort 50–300 · 50–200 · 1.5–2%. Club moss 100–500 · 50–150
  · 1–1.5%. Fern 200–1000 · 200–800 (fronds ~1×/yr) · 1.5–2.5%, k 0.3–1/yr. Fungus threads 10–100, turnover 5–20/yr,
  3–6%. Soil N: available 1–5 g, total 100–1000 g. Rain 0.1–1 g N/yr; a gull colony ~5 (Surtsey); leak in N-poor
  land ≤10–20% of what's freed. Springtails 10⁴–10⁵ per m², snails 1–50; snail life 1–5 yr, springtail months.
  Soil on young lava ~1 cm per 100–1000 years.
- **e. Today's pace:** `renew` 6%/min ≈ moss turnover 0.5/yr, so a year ≈ 8 min. Then litter decay should be
  ~0.0006–0.002/s (was 0.01, 5–15× fast) and a full crust fixes ~0.001 g N/m²/s.
- **f. Small fixes:** fewer headlines (they doubled with the 2% floor: a higher bar or a per-habitat cooldown);
  bristletails on dry crusts first, litter second; a sim line for nitrogen by source and litter in years of fall.

## Later: the clock with three tempos (P32 d, P33 a; after slice 12 or later)
- Every rate in data in real units (per year), and the sim divides by a game clock: ratios stay real and one knob
  speeds a whole group. One clock can't fit all: with a year ≈ 8 min, a fern forest (decades) takes hours and soil
  (centuries) never comes.
- **Cycle:** every gram and nitrogen flow (eating, births, deaths, tree growth). **Ground:** slow stores (soil,
  humus); speeding them means a smaller store, and the flows across the seam carry one visible factor, so the ledger
  stays honest. **Life:** movement and behaviour only; foraging and hunting rates are set per year, so the life knob
  changes no yearly flow (a test: life ×2 keeps the yearly flows within ~5%).
- Balance lives where tempos meet (grazing vs regrowth, soil vs plants). Trees on cycle: a stand takes 1–3 h.
