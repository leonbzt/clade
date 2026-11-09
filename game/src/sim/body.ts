// Slice 20A: the equipped body as a pure model. A build is one choice per place; every number a Life needs comes from
// it, and the four checks (anatomy, starter, moult change, lay snapshot) use the same definitions. No DOM, no RNG.
// Since 21A a build carries its line's ranks, and the starter check reads the line's pool.
import {
  ALLOWANCE, BODIES, BODY_RULE, HOMES, PLACES, PLACE_NAMES, UPGRADE_OF, VARIANTS, type PlaceId, type Row, type Rows,
} from '../data/body';
import { NODES, PARTS, PLANS, RULE, type NodeId, type PartId, type PlanId, type VerbId } from '../data/life';
import { ENHANCED, type RankId, type Ranks } from '../data/lineages';

/** `ranks`: the line's upgrades at launch (21A), carried through moults and into the lay snapshot. */
export interface Build { body: PlanId; size: number; rows: Rows; order: PlaceId[]; lost?: PlaceId[]; buds?: Rows; ranks?: Ranks }
/** What a line lets a starting build use: its pool of parts and its ranks. */
export interface LinePool { parts: readonly PartId[]; ranks?: Ranks }

const same = (a?: Row, b?: Row) => !!a && !!b && a.length === b.length && a.every((p, k) => p === b[k]);
const name = (p: PartId) => PARTS[p].name;
const nameRow = (r: Row) => VARIANTS.find((v) => same(v.row, r))?.name ?? name(r[0]);

// ---- anatomy ----
/** Every row a body may hold at a place: single parts and variants, narrowed by the place's lock. */
export function rowsAt(body: PlanId, place: PlaceId): Row[] {
  const D = BODIES[body];
  if (D.unsupported.includes(place)) return [];
  if (D.locks[place]) return D.locks[place]!.rows;
  const singles = (Object.keys(HOMES) as PartId[]).filter((p) => HOMES[p].some(([b, ps]) => b.includes(body) && ps.includes(place))).map((p) => [p]);
  return [...singles, ...VARIANTS.filter((v) => v.place === place && v.bodies.includes(body)).map((v) => v.row)];
}
export const legalRow = (body: PlanId, place: PlaceId, row: Row) => rowsAt(body, place).some((r) => same(r, row));
/** The places a part can take on a body, alone or in a variant. */
export const homesOf = (body: PlanId, part: PartId) => PLACES.filter((p) => rowsAt(body, p).some((r) => r.includes(part)));
export const partsOf = (rows: Rows): PartId[] => PLACES.flatMap((p) => rows[p] ?? []);
export const has = (b: { rows: Rows }, id: PartId) => partsOf(b.rows).includes(id);

/** Legal anatomy: rows fit the body, its places and locks; no part twice. Empty rows are fine, locked ones too. */
export function anatomyProblems(body: PlanId, rows: Rows): string[] {
  const out: string[] = [], seen = new Set<PartId>();
  for (const place of PLACES) {
    const row = rows[place];
    if (!row || !row.length) continue;
    if (!row.every((p) => Object.hasOwn(PARTS, p))) { out.push(`${PLACE_NAMES[place]}: unknown part`); continue; }
    if (!legalRow(body, place, row)) out.push(`${PLACE_NAMES[place]} can't hold ${row.map(name).join(' + ')}`);
    for (const p of row) { if (seen.has(p)) out.push(`${name(p)} twice`); seen.add(p); }
  }
  return out;
}
export function buildProblems(b: Build): string[] {
  const out = anatomyProblems(b.body, b.rows), occupied = PLACES.filter((p) => b.rows[p]?.length);
  if (!(b.size >= 1 && b.size <= RULE.maxSize)) out.push('size out of range');
  if (b.order.length !== occupied.length || !occupied.every((p) => b.order.includes(p))) out.push('install order mismatch');
  return out;
}

// ---- what the build does ----
export const ranked = (b: { ranks?: Ranks }, p: PartId, r: RankId) => !!b.ranks?.[p]?.includes(r);
/** A part's upkeep on this build: Signature makes it free, Lean takes 1 off (not below 0). */
export const partUpkeep = (b: Build, p: PartId) => (ranked(b, p, 'signature') ? 0 : Math.max(0, PARTS[p].upkeep - (ranked(b, p, 'lean') ? 1 : 0)));
/** The extra an Enhanced part gives, if the build holds it. */
const boost = (b: Build, p: PartId) => (ranked(b, p, 'enhanced') && has(b, p) ? ENHANCED[p] ?? 0 : 0);
/** A part's verb; an upgrade keeps its predecessor's. */
export const verbOf = (p: PartId): VerbId | undefined => PARTS[p].verb ?? (UPGRADE_OF[p] && PARTS[UPGRADE_OF[p]!].verb);
const freeDash = (b: Build) => ALLOWANCE[b.body] === 'leg' && !!b.rows.limbs?.includes('leg');
/** Active verbs in install order. */
export function verbs(b: Build): VerbId[] {
  const out: VerbId[] = [];
  for (const place of b.order) for (const p of b.rows[place] ?? []) { const v = verbOf(p); if (v && !out.includes(v)) out.push(v); }
  return out;
}
/** Verbs outside the ceiling: Dash from the walking row, and a Signature part's verb. */
const freeVerb = (b: Build, v: VerbId) => (v === 'dash' && freeDash(b)) || partsOf(b.rows).some((p) => verbOf(p) === v && ranked(b, p, 'signature'));
export const countedVerbs = (b: Build) => verbs(b).filter((v) => !freeVerb(b, v));
/** The allowance row pays up to 1 of its own upkeep: a leaner leg leaves less to pay. */
export const allowance = (b: Build) => (ALLOWANCE[b.body] && has(b, ALLOWANCE[b.body]!) ? Math.min(1, partUpkeep(b, ALLOWANCE[b.body]!)) : 0);
export const nominal = (b: Build) => partsOf(b.rows).reduce((n, p) => n + partUpkeep(b, p), 0);
export const upkeep = (b: Build, onMud = false) => (has(b, 'deep') && onMud ? 0 : RULE.baseUpkeep + nominal(b) - allowance(b));
export const range = (b: Build) => Math.min(RULE.maxRange, PLANS[b.body].range + (b.rows.limbs?.includes('leg') ? 1 + boost(b, 'leg') : 0));
export const swimSpeed = (b: Build) => PLANS[b.body].range + (has(b, 'flap') ? 1 + boost(b, 'flap') : 0); // before frenzy and ambush
export const tunnel = (b: Build) => RULE.tunnel + (has(b, 'chaetae') ? RULE.bristleTunnel + boost(b, 'chaetae') : 0);
export const sense = (b: Build) => PLANS[b.body].sense + (has(b, 'eye') ? RULE.eyeSense + boost(b, 'eye') : 0) + (has(b, 'compound') ? RULE.compoundSense : 0);
export const oxygenMax = (b: Build) => RULE.oxygen + (has(b, 'gill') ? RULE.gillOxygen + boost(b, 'gill') : 0);
export const mealBonus = (b: Build) => (has(b, 'gut') ? RULE.gutFood + boost(b, 'gut') : 0);
export const foodOf = (b: Build, node: NodeId) => NODES[node].food * (node === 'bloom' && has(b, 'symbiont') ? 2 : 1) + mealBonus(b);
export const clutch = (b: Build, onMud = false) => (has(b, 'pouch') ? 2 : 1) * b.size + (has(b, 'deep') && onMud ? 1 : 0);
export const reach = (b: Build) => has(b, 'claw') || has(b, 'proboscis') || has(b, 'hook');
export const opensShells = (b: Build) => has(b, 'claw') || has(b, 'hook');
export const digsBuried = (b: Build) => b.body === 'worm' || has(b, 'digger');
export const captures = (b: Build) => has(b, 'arms') || has(b, 'spikes');
export const mature = (b: Build) => b.size >= RULE.adultSize || has(b, 'progenesis');

// ---- placing one part ----
/** The row a part makes at a place, given what's there: merge, variant, upgrade or replacement. Null if it can't go. */
function rowWith(body: PlanId, cur: Row | undefined, part: PartId, place: PlaceId, replace: boolean): Row | null {
  if (cur?.includes(part) || (cur?.length === 1 && UPGRADE_OF[cur[0]] === part)) return cur; // merge, or its upgrade is there
  const legal = (r: Row) => legalRow(body, place, r);
  if (cur?.length) {
    const v = VARIANTS.find((x) => x.place === place && x.bodies.includes(body) && x.row[0] === cur[0] && x.row[1] === part);
    if (v && legal(v.row)) return v.row; // walking → walking/raking, walking/raking → walking/digging
    if (cur.length === 1 && UPGRADE_OF[part] === cur[0] && legal([part])) return [part];
    return replace && legal([part]) ? [part] : null;
  }
  return legal([part]) ? [part] : null;
}
/** Set a row; it becomes the newest install unless `keep` holds its place in the order (a starter extending a default). */
export function setRow(b: Build, place: PlaceId, row: Row | null, keep = false): Build {
  const rows = { ...b.rows }, order = row && keep && b.order.includes(place) ? [...b.order] : b.order.filter((p) => p !== place);
  if (row) { rows[place] = row; if (!order.includes(place)) order.push(place); } else delete rows[place];
  const next: Build = { ...b, rows, order }, lost = (b.lost ?? []).filter((p) => p !== place);
  if (lost.length) next.lost = lost; else delete next.lost;
  return next;
}

// ---- the starter check ----
export const isStarterPart = (p: PartId) => !!PARTS[p].verb && !PARTS[p].rare;
export function defaultBuild(body: PlanId): Build {
  const rows: Rows = {};
  for (const [place, row] of BODIES[body].defaults) rows[place] = [...row];
  return { body, size: 1, rows, order: BODIES[body].defaults.map(([p]) => p) };
}
/**
 * A starting build from a design (the starting rows, defaults included). Defaults go in first, then the design's rows.
 * With a line, its pool says which parts may start and its ranks ride along; without one (codes, previews), only
 * starter parts. Conflicts are listed, never resolved: the build that comes back is still the best legal one.
 */
export function startBuild(body: PlanId, design: Rows, line?: LinePool): { build: Build; problems: string[] } {
  const problems: string[] = [], D = BODIES[body];
  let b = defaultBuild(body);
  if (line?.ranks && Object.keys(line.ranks).length) b.ranks = structuredClone(line.ranks);
  for (const place of PLACES) {
    const want = design[place], cur = b.rows[place], def = D.defaults.find(([p]) => p === place)?.[1];
    if (want) for (const p of want) if (!def?.includes(p) && !(line ? line.parts.includes(p) : isStarterPart(p)))
      problems.push(line ? `${name(p)} is not unlocked for this line yet` : `${name(p)} is passive: it comes only as a moult`);
    if (same(want, cur)) continue;
    if (!want) {
      if (cur) { if (D.locks[place]) problems.push(`${PLACE_NAMES[place]} must hold ${D.locks[place]!.family} parts`); else b = setRow(b, place, null); }
      continue;
    }
    if (!legalRow(body, place, want)) { problems.push(`${PLACE_NAMES[place]} can't hold ${want.map(name).join(' + ')}`); continue; }
    const twice = want.find((p) => PLACES.some((q) => q !== place && b.rows[q]?.includes(p)));
    if (twice) { problems.push(`${name(twice)} is already in your build`); continue; }
    b = setRow(b, place, [...want], true);
  }
  problems.push(...anatomyProblems(body, b.rows), ...verbProblems(b));
  return { build: b, problems };
}
export const verbProblems = (b: Build) => (countedVerbs(b).length > BODY_RULE.maxVerbs ? [`${countedVerbs(b).length} verbs: at most ${BODY_RULE.maxVerbs}`] : []);

// ---- the moult change ----
export interface Change { place: PlaceId; row: Row; was: Row | null; build: Build; lost: VerbId[]; gained: VerbId[]; upkeep: number }
/** Every legal way to install a part at a moult: one change, legal anatomy, verb ceiling. Never a copy of a part you have. */
export function changesFor(b: Build, part: PartId): Change[] {
  if (has(b, part)) return [];
  const out: Change[] = [];
  for (const place of homesOf(b.body, part)) {
    const row = rowWith(b.body, b.rows[place], part, place, true);
    if (!row || same(row, b.rows[place])) continue;
    const next = setRow(b, place, row);
    if (anatomyProblems(b.body, next.rows).length || verbProblems(next).length) continue;
    const before = verbs(b), after = verbs(next);
    out.push({ place, row, was: b.rows[place] ?? null, build: next, lost: before.filter((v) => !after.includes(v)), gained: after.filter((v) => !before.includes(v)), upkeep: upkeep(next) });
  }
  return out;
}
/** Common offers: the first `n` of a shuffled pool that have a legal change. Rares: the first in habitat order. */
export const legalOffers = (b: Build, pool: PartId[], n = 3) => pool.filter((p) => changesFor(b, p).length).slice(0, n);
export const rareOffer = (b: Build, rares: PartId[]) => rares.find((p) => changesFor(b, p).length) ?? null;
/** A moult: one size, and one change or none. `rareGot` is set only when a rare part really goes in. */
export function moultBuild(b: Build, change: Change | null): { build: Build; rare: PartId | null } {
  const next = change ? change.build : b, part = change?.row.find((p) => !change.was?.includes(p)) ?? null;
  return { build: { ...next, size: Math.min(RULE.maxSize, b.size + 1) }, rare: part && PARTS[part].rare ? part : null };
}
export const describeRow = nameRow;
