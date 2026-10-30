# Status

Updated 2026-10-31: **slice 11d is specced** ([slices/11d-real-biomass.md](slices/11d-real-biomass.md)); no code
changed this session. Slice 11 part C is committed (`1ea4861`, `npm run check` passed).

## Done
- Committed part C with the 30–31 Oct doc edits (`1ea4861`).
- P28 settled (your calls in `docs/systems.md`); P29 added (growth curve, real units, currencies).
- Spec `docs/slices/11d-real-biomass.md`: A = one map of places (no regions, connected pieces, majors and
  hover-only patches); B = plants and litter in grams (production peaks at full size, turnover to litter, a ledger);
  C = animals in grams (body mass, mass^0.75 burn, keep), Biomass as real grams, real units, hectares, productivity.

## Decided (31 Oct, in brief.md)
- P28: regions go (c3); patches are hover only; the name goes on the big piece; borders parked.
- 10 m tiles; the currency stays Biomass (real grams); "best" = share, with efficiency shown beside it.
- Hectares and productivity per area ride with 11d.

## Next
1. Build 11d part A (`/kickoff build slice 11d part A`), check, play.
2. Then parts B and C, each checked before the next. Then 12a and 12b.

## Open
- Part B's growth curve (production = grow × C × (2x − x²), turnover to litter) is an AI change: you asked, haven't
  confirmed (P29 a).
- Rest of P29 b (turnover times, home range, C:N food quality) and c (guild currencies): later.
- Headlines 4–14/h after 30 min, 34–42/h over the first hour.
- Your 30 Oct notes: names, more animals, trees and fruits; the springtail refound bug.
- Hiding (P25 e). Slugs die out on seed 4. Parked: P17 e/f, P23, P21 f, P20, P19 b; delete `toys/`?
