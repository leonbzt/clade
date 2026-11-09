// Slice 21A: a line's progression across runs. XP from a Life's eggs and tier, levels that give points and unlock
// parts, points that buy ranks, saved species (a laid build plus the kept hatching card), and recipes that open a new
// lineage. Pure; the save holds one Line per open lineage. Numbers in data/lineages.ts.
import { PLACES, type PlaceId, type Rows } from '../data/body';
import { LINEAGES, LINEAGE_IDS, LINE_RULE, UPGRADES, type Ranks, type RankId, type Upgrade } from '../data/lineages';
import { PARTS, PART_IDS, type PartId, type PlanId } from '../data/life';
import { anatomyProblems, changesFor, homesOf, partsOf, startBuild, type Build } from './body';
import { integer, oneOf, record, text, tiers } from './save-validation';
import { designOf } from './share';

export interface Species { name: string; rows: Rows; mutation: PartId | null; life: number; tier: string }
export interface Line { xp: number; points: number; parts: PartId[]; ranks: Ranks; species: Species[] }
export type Lines = Partial<Record<PlanId, Line>>;
/** What a settled Life did to its line, for the return line. */
export interface Gain {
  plan: PlanId; xp: number; xpFrom: number; from: number; level: number; unlocked: PartId[]; title: string | null;
  species: string | null; opened: PlanId[];
}

/** A new line: the lineage's start pool, plus any built-ins its recipe gives (they join the pool at Signature). */
export function newLine(plan: PlanId): Line {
  const parts = [...LINEAGES[plan].start], ranks: Ranks = {};
  for (const p of builtIns(plan)) { if (!parts.includes(p)) parts.push(p); ranks[p] = ['signature']; }
  return { xp: 0, points: 0, parts, ranks, species: [] };
}
/** The recipe's parts that the new body can hold: they become its built-ins. */
export const builtIns = (plan: PlanId): PartId[] => (LINEAGES[plan].recipe?.parts ?? []).filter((p) => homesOf(plan, p).length > 0);
export const freshLines = (): Lines => ({ worm: newLine('worm') });

// ---- XP and levels ----
export const levelOf = (xp: number) => {
  let n = 1;
  while (n < LINE_RULE.cap && xp >= LINE_RULE.xpAt[n + 1]) n++;
  return n;
};
export const xpFor = (eggs: number, tier: string) => (eggs > 0 ? eggs * (LINE_RULE.tierWeight[tier] ?? 1) : 0);
/** XP to the next level, or null at the cap. */
export const toNext = (xp: number) => (levelOf(xp) >= LINE_RULE.cap ? null : LINE_RULE.xpAt[levelOf(xp) + 1] - xp);
export const titleOf = (plan: PlanId, line: Line) => (levelOf(line.xp) >= LINE_RULE.cap ? LINEAGES[plan].endPoint : null);

/** Add XP: each level gained gives points and may unlock a part. Returns the parts unlocked. */
export function addXp(plan: PlanId, line: Line, xp: number): PartId[] {
  const before = levelOf(line.xp);
  line.xp += xp;
  const after = levelOf(line.xp), out: PartId[] = [];
  for (let n = before + 1; n <= after; n++) {
    line.points += LINE_RULE.pointsPerLevel;
    const p = LINEAGES[plan].levels[n];
    if (p && unlock(line, p)) out.push(p);
  }
  return out;
}
/** A part joins the pool; false if it was there already. */
export function unlock(line: Line, p: PartId): boolean {
  if (line.parts.includes(p)) return false;
  line.parts.push(p);
  return true;
}

// ---- upgrades ----
const rankOf = (line: Line, p: PartId) => line.ranks[p] ?? [];
/** The upgrades on offer for a line's parts, each with why it can't be bought (or null). */
export function upgradesFor(plan: PlanId, line: Line): { u: Upgrade; why: string | null }[] {
  return UPGRADES.filter((u) => line.parts.includes(u.part) && PARTS[u.part].plans.includes(plan) && !rankOf(line, u.part).includes(u.rank))
    .map((u) => ({ u, why: whyNot(line, u) }));
}
function whyNot(line: Line, u: Upgrade): string | null {
  const has = rankOf(line, u.part);
  if (u.excludes.some((r) => has.includes(r))) return `has ${u.excludes.find((r) => has.includes(r))}`;
  if (u.needs.length && !u.needs.some((r) => has.includes(r))) return `needs ${u.needs.join(' or ')}`;
  if (line.points < u.cost) return `costs ${u.cost} point${u.cost > 1 ? 's' : ''}`;
  return null;
}
export function buy(plan: PlanId, line: Line, id: string): boolean {
  const o = upgradesFor(plan, line).find((x) => x.u.id === id);
  if (!o || o.why) return false;
  line.points -= o.u.cost;
  line.ranks[o.u.part] = [...rankOf(line, o.u.part), o.u.rank];
  return true;
}

// ---- saved species ----
/** A new species' body: the body the Life launched as (else its laid build) with the kept card put in where it fits,
 * as a starting design of the line's pool. `place` is where the card went (null if it found no place). */
export function speciesOf(line: Line, laid: Build, mutation: PartId | null, launch?: Rows): { rows: Rows; place: PlaceId | null } {
  const pool = mutation && !line.parts.includes(mutation) ? { ...line, parts: [...line.parts, mutation] } : line; // the card unlocks its part
  const base = launch ? startBuild(laid.body, launch, pool).build : laid;
  const change = mutation ? changesFor(base, mutation)[0] : undefined;
  return { rows: designOf(change ? change.build : base, pool).rows, place: change?.place ?? null };
}
/** Save a species (21B: the launch body plus the kept card; the parts a Life grew stay with that Life). The newest
 * comes first; the oldest drops past the limit. */
export function saveSpecies(line: Line, laid: Build, mutation: PartId | null, life: number, tier: string, launch?: Rows): Species {
  const sp: Species = { name: speciesName(laid.body, line, mutation), rows: speciesOf(line, laid, mutation, launch).rows, mutation, life, tier };
  line.species = [sp, ...line.species].slice(0, LINE_RULE.species);
  return sp;
}
export const nextSpeciesName = (plan: PlanId, line: Line, m: PartId | null) => speciesName(plan, line, m);
const speciesName = (plan: PlanId, line: Line, m: PartId | null) => {
  const n = 1 + Math.max(0, ...line.species.map((sp) => Number(/\d+/.exec(sp.name)?.[0] ?? 0)));
  return `${LINEAGES[plan].name} ${n}${m ? ` (${PARTS[m].name.toLowerCase()})` : ''}`;
};

// ---- recipes ----
const TIER = 'SABCDF';
/** The lineages a laid build opens: its body is the recipe's source, it holds every recipe part, at the tier or better. */
export function recipesMet(lines: Lines, laid: Build, tier: string): PlanId[] {
  const parts = partsOf(laid.rows);
  return LINEAGE_IDS.filter((id) => {
    const r = LINEAGES[id].recipe;
    return !lines[id] && !!r && r.from === laid.body && r.parts.every((p) => parts.includes(p)) && TIER.indexOf(tier) <= TIER.indexOf(r.tier);
  });
}

/** Settle a Life on its line: XP, levels, the kept card's part, the species, any recipe met. */
export function settleLine(lines: Lines, plan: PlanId, eggs: number, tier: string, laid: Build | undefined, kept: PartId | null, life: number, launch?: Rows): Gain {
  const line = lines[plan] ??= newLine(plan), from = levelOf(line.xp), xpFrom = line.xp, xp = xpFor(eggs, tier);
  const unlocked = addXp(plan, line, xp);
  if (eggs > 0 && kept && unlock(line, kept)) unlocked.push(kept);
  const species = eggs > 0 && laid ? saveSpecies(line, laid, kept, life, tier, launch).name : null;
  const opened = eggs > 0 && laid ? recipesMet(lines, laid, tier) : [];
  for (const id of opened) lines[id] = newLine(id);
  return { plan, xp, xpFrom, from, level: levelOf(line.xp), unlocked, title: from < LINE_RULE.cap && levelOf(line.xp) >= LINE_RULE.cap ? LINEAGES[plan].endPoint : null, species, opened };
}

/** The return line: "+72 XP · Worm line level 2 · unlocked Gill". */
export function gainText(g: Gain): string {
  const bits = [`+${g.xp} XP`, `${LINEAGES[g.plan].name} line level ${g.level}${g.level > g.from ? ' (up)' : ''}`];
  if (g.unlocked.length) bits.push(`unlocked ${g.unlocked.map((p) => PARTS[p].name).join(', ')}`);
  if (g.species) bits.push(`new species: ${g.species}`);
  if (g.title) bits.push(`your line became ${g.title}`);
  for (const id of g.opened) bits.push(`your form became a${id === 'arthropod' ? 'n' : ''} ${LINEAGES[id].name.toLowerCase()}: a new lineage`);
  return bits.join(' · ');
}

// ---- the save ----
const rankIds: RankId[] = ['lean', 'enhanced', 'signature'];
export function validLines(v: unknown): v is Lines {
  if (!record(v) || !Object.keys(v).length || !Object.keys(v).every((k) => oneOf(k, LINEAGE_IDS))) return false;
  return Object.entries(v).every(([plan, line]) => record(line) && integer(line.xp) && integer(line.points)
    && Array.isArray(line.parts) && line.parts.every((p) => oneOf(p, PART_IDS)) && new Set(line.parts).size === line.parts.length
    && record(line.ranks) && Object.entries(line.ranks).every(([p, rs]) => oneOf(p, PART_IDS) && Array.isArray(rs) && rs.every((r) => oneOf(r, rankIds)))
    && Array.isArray(line.species) && line.species.length <= LINE_RULE.species && line.species.every((sp) => validSpecies(sp, plan as PlanId)));
}
function validSpecies(sp: unknown, plan: PlanId): boolean {
  return record(sp) && text(sp.name) && integer(sp.life) && oneOf(sp.tier, tiers) && (sp.mutation === null || oneOf(sp.mutation, PART_IDS))
    && record(sp.rows) && Object.entries(sp.rows).every(([k, r]) => oneOf(k, PLACES) && Array.isArray(r) && r.every((p) => oneOf(p, PART_IDS)))
    && !anatomyProblems(plan, sp.rows as Rows).length;
}
