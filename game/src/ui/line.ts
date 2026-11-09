// Slice 21B: what the line screens show, as plain functions: the level track, a part's ranks in words, the parts a
// place can take, the lines after a Life, the recipe hints. No DOM; Hatch.svelte and LineView.svelte draw it.
import { PLACES, type PlaceId, type Rows } from '../data/body';
import { ENHANCED, ENHANCED_WHAT, LINEAGES, LINEAGE_IDS, LINE_RULE, type Ranks } from '../data/lineages';
import { PARTS, type PartId, type PlanId } from '../data/life';
import * as B from '../sim/body';
import { levelOf, type Gain, type Line } from '../sim/lineage';

/** A build to draw from saved rows. */
export const asBuild = (body: PlanId, rows: Rows, ranks?: Ranks): B.Build =>
  ({ body, size: 1, rows, order: PLACES.filter((p) => rows[p]?.length), ...(ranks ? { ranks } : {}) });

/** The XP bar at `xp`: the level, how far into it, and the size of the step (0 at the cap). */
export function bar(xp: number) {
  const level = levelOf(xp), lo = LINE_RULE.xpAt[level], hi = level >= LINE_RULE.cap ? lo : LINE_RULE.xpAt[level + 1];
  return { level, into: Math.round(xp - lo), step: hi - lo, pct: hi > lo ? Math.min(1, (xp - lo) / (hi - lo)) : 1 };
}

/** The level track: each level, the part it unlocks, whether the line has it, and the end point at the cap. */
export const track = (plan: PlanId, line: Line) => Array.from({ length: LINE_RULE.cap }, (_, k) => ({
  n: k + 1, part: LINEAGES[plan].levels[k + 1] ?? null, reached: levelOf(line.xp) >= k + 1,
  end: k + 1 === LINE_RULE.cap ? LINEAGES[plan].endPoint : null,
}));

/** A part's ranks in words: "Lean: upkeep 2 → 1", "Enhanced: +2 sight", "Signature: built in, no upkeep". */
export function rankText(p: PartId, ranks?: Ranks): string[] {
  const rs = ranks?.[p] ?? [], P = PARTS[p];
  return rs.map((r) => r === 'lean' ? `Lean: upkeep ${P.upkeep} → ${Math.max(0, P.upkeep - 1)}`
    : r === 'enhanced' ? `Enhanced: +${ENHANCED[p]} ${ENHANCED_WHAT[p] ?? ''}`.trim()
    : 'Signature: built in, no upkeep');
}
/** A part's effect with its ranks, for info lines. */
export const partText = (p: PartId, ranks?: Ranks) => [PARTS[p].does, ...rankText(p, ranks)].join(' · ');

/** The line's parts that can sit at a place on this body. */
export const partsAt = (plan: PlanId, line: Line, place: PlaceId): PartId[] =>
  line.parts.filter((p) => PARTS[p].plans.includes(plan) && B.homesOf(plan, p).includes(place));

/** Upkeep per held place, after ranks: the small number on each slot. */
export function slotUpkeep(b: B.Build): Partial<Record<PlaceId, number>> {
  const out: Partial<Record<PlaceId, number>> = {};
  for (const place of PLACES) if (b.rows[place]?.length) out[place] = b.rows[place]!.reduce((n, p) => n + B.partUpkeep(b, p), 0);
  return out;
}

/** The lines the XP bar reveals as it passes each level, then the rest of the gain. */
export function levelLines(g: Gain): { at: number; text: string }[] {
  const out: { at: number; text: string }[] = [];
  for (let n = g.from + 1; n <= g.level; n++) {
    const p = LINEAGES[g.plan].levels[n];
    out.push({ at: n, text: `Level ${n}: +${LINE_RULE.pointsPerLevel} point${p && g.unlocked.includes(p) ? ` · unlocked ${PARTS[p].name}` : ''}${n === LINE_RULE.cap ? ` · your line became ${LINEAGES[g.plan].endPoint}` : ''}` });
  }
  return out;
}
export function afterLines(g: Gain): string[] {
  const byLevel: PartId[] = [];
  for (let n = g.from + 1; n <= g.level; n++) { const p = LINEAGES[g.plan].levels[n]; if (p && g.unlocked.includes(p)) byLevel.push(p); }
  const out = g.unlocked.filter((p) => !byLevel.includes(p)).map((p) => `Kept card: ${PARTS[p].name} joins your line's parts`);
  if (g.species) out.push(`New species: ${g.species}`);
  if (!g.xp) out.push('No eggs, no XP: the line waits for the next Life.');
  return out;
}

/** The lineages a line's laid build can open, and how. */
export const childrenOf = (plan: PlanId) => LINEAGE_IDS.filter((id) => LINEAGES[id].recipe?.from === plan);
export function recipeText(id: PlanId): string {
  const r = LINEAGES[id].recipe!;
  return `Lay as your ${LINEAGES[r.from].name.toLowerCase()} line holding ${r.parts.map((x) => PARTS[x].name.toLowerCase()).join(' and ')}, tier ${r.tier} or better.`;
}
export const aAn = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
