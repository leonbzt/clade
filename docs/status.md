# Status

- **11 Nov 2026 · M2, N3 A–C done on `n3-the-screens`.** Checkpoint: **`N3 C: add deterministic clutch cards and heir builds`**, after B at `6aa99ad` (N2 merge still pending). [N3 spec](slices/n3-the-screens.md).
- **Your calls (decisions.md, 11 Nov):** pick one of three for the mutation; a level gives a point (an evolution tree later, parked); Codex builds N3 with a breakpoint per part. Token rules stand: you test by playing, one phone-size look run per step, no review round.
- **Verified:** `npm run check` passes (5.9 s); fourteen clutch tests, existing gameplay checks and one 390 × 844 browser run. [Notes](playtests/n3-the-screens.md). C is rules only; hatching/card UI is D/E and mutation UI is F. The three-Life play question remains open.
- **Claude handoff:** C's kind/part pools, per-rank family weights, mutation-first card totals and independent heir builds are the review surface; no review round per part. The existing result's transient Lay-floater overlap is noted for E. **Next:** start a fresh build session for N3 D, hatching, on this branch.

## N3 progress
- A done: original XP curve, derived points, carried-part spending capped at rank 3, job text, funded midgame preset; checks and phone look pass; next: B.
- B done: one seeded size-3 offer, weighted common parts for empty places, free pick/pass, immediate activation and upkeep, mutation/eggsAfter snapshots; checks and phone look pass; next: C.
- C done: seeded gain/swap/lose clutch, equal gain/lose kind weights, per-rank Enforce family weights, mutation first within the 2/3-card total, independent heir builds; checks and phone look pass; next: D.
- D done: `hatch` keeps the parent or founds a child (reused if the line has the build, named part + clade), awards XP at the played letter; `finish` settles through it once; checks and phone look pass; next: E.
- E done: hatching screen replaces the result card: eggs face down, tap to open (kind, place, part, effect, signed upkeep, heir's letter here), Hatch this one or Keep the parent, then the XP bar and points; checks and phone look pass; next: F.
- F done: at size 3 three cards over the board (part, place, effect, upkeep) and Pass; the board, keys and dev buttons wait while it's open; picking costs no turn; the HUD shows "Mutation: X" in gold and marks it in Enforce; checks and phone look pass; next: G.
- G done: the game opens on *first worm*, framed on your habitats (**home** recentres); the dev bar sits behind **dev**; your habitats are gold with letters, neighbours Colonise allows show your best letter and one reason, the rest name only; labels never overlap (yours, then targets, then area); the card lists yours here and **Colonise from a neighbour** per sender; checks and phone look pass; next: H.
