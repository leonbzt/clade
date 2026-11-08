// Slice 20A: what happens to a build: strikes by direction, whole-row tears, starvation shedding, the frozen lay
// snapshot, CLADE2- design codes and the one-part continuation trait. Pure; the runtime switches over in 20C.
import { BODY_RULE, GUARDS, PLACES, STRUCK, type PlaceId, type Rows } from '../data/body';
import { PARTS, PLANS, RULE, type PartId, type PlanId } from '../data/life';
import { buildProblems, homesOf, startBuild, type Build } from './body';
import { b64, sum, unb64 } from './share';

export type Side = 'front' | 'right' | 'back' | 'left';
/** What the Life knows at the strike; mud hiding (and the lens hunter's exception) is the caller's. */
export interface StrikeCtx { buried?: boolean; dug?: boolean; stayed?: boolean; braced?: boolean; soft?: boolean; bypass?: boolean }
export interface Hit { kind: 'buried' | 'enrolled' | 'blocked' | 'hit'; guard: PartId | null; tear: PlaceId | null; damage: number; rest: number }

const SIDES: Side[] = ['front', 'right', 'back', 'left'];
/** The side a strike lands on: `dir` is where the hunter stands (0 north, clockwise), relative to your facing. */
export const sideOf = (dir: number, facing: number): Side => SIDES[(dir - facing + 4) % 4];
const reachFrom = (side: Side) => (side === 'front' ? 'front' : side === 'back' ? 'back' : 'flank');
/** The rows a strike from this side can reach. Back is struck from the front while it holds the shield. */
export const struckRows = (b: Build, side: Side) => PLACES.filter((p) => b.rows[p]?.length
  && (p === 'back' && b.rows.back!.includes('shield') ? 'front' : STRUCK[p]) === reachFrom(side));

/** Resolution order: mud, Dig, staying put rolled up, Brace, a passive guard, then a tear or damage. */
export function strikeOn(b: Build, side: Side, c: StrikeCtx = {}): Hit {
  const none = { guard: null, tear: null, damage: 0 };
  if (c.buried || c.dug) return { kind: 'buried', ...none, rest: RULE.restAfterStrike };
  if (c.stayed && (b.body === 'trilobite' || b.rows.tail?.includes('enrol'))) return { kind: 'enrolled', ...none, rest: RULE.restAfterStrike };
  if (c.braced && b.body !== 'swimmer') return { kind: 'blocked', ...none, rest: RULE.restAfterSpine };
  const rows = struckRows(b, side), guardAt = rows.find((p) => b.rows[p]!.some((x) => GUARDS.includes(x)));
  const guard = guardAt ? b.rows[guardAt]!.find((x) => GUARDS.includes(x))! : null;
  if (guardAt && !c.bypass) return { kind: 'blocked', guard, tear: null, damage: 0, rest: b.rows[guardAt]!.includes('spine') ? RULE.restAfterSpine : RULE.restAfterStrike };
  const tear = guardAt ?? rows[rows.length - 1] ?? null;
  return { kind: 'hit', guard: null, tear, damage: (tear ? 0 : 1) + (c.soft ? 1 : 0), rest: RULE.restAfterStrike };
}

/** A tear or a shed removes the whole row: its effects, verbs, upkeep and any allowance. Nothing comes back free. */
export function loseRow(b: Build, place: PlaceId): Build {
  const rows = { ...b.rows };
  delete rows[place];
  return { ...b, rows, order: b.order.filter((p) => p !== place), lost: [...new Set([...(b.lost ?? []), place])] };
}
/** Starving: shed the newest surviving row, or null when there's none left (the Life loses health instead). */
export const shed = (b: Build): { build: Build; place: PlaceId } | null => {
  const place = b.order[b.order.length - 1];
  return place ? { build: loseRow(b, place), place } : null;
};

// ---- the lay snapshot ----
/** Frozen at the lay: size, rows and torn rows. Later damage, growth or reloads never touch it. */
export const snapshot = (b: Build): Readonly<Build> => Object.freeze(structuredClone(b));
/** A stored build back from JSON, or null unless it's legal anatomy. */
export function parseBuild(x: unknown): Build | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  if (typeof o.body !== 'string' || !Object.hasOwn(PLANS, o.body) || typeof o.size !== 'number' || !o.rows || typeof o.rows !== 'object'
    || !Array.isArray(o.order) || (o.lost !== undefined && !Array.isArray(o.lost))) return null;
  const rows: Rows = {};
  for (const [k, v] of Object.entries(o.rows)) {
    if (!(PLACES as string[]).includes(k) || !Array.isArray(v) || !v.every((p) => typeof p === 'string')) return null;
    rows[k as PlaceId] = v as PartId[];
  }
  if (![...o.order, ...((o.lost as unknown[]) ?? [])].every((p) => (PLACES as unknown[]).includes(p))) return null;
  const b: Build = { body: o.body as PlanId, size: o.size, rows, order: o.order as PlaceId[], ...(o.lost ? { lost: o.lost as PlaceId[] } : {}) };
  return buildProblems(b).length ? null : b;
}

// ---- CLADE2- codes: a starting design, nothing else ----
export interface Design { body: PlanId; rows: Rows }
export function encodeDesign(d: Design): string {
  const body = b64(JSON.stringify([d.body, PLACES.flatMap((p) => (d.rows[p] ? [[p, d.rows[p]]] : []))]));
  return `${BODY_RULE.codePrefix}${body}-${sum(body)}`;
}
/** A code back to a design that passes the starter check, or null. */
export function decodeDesign(code: string): Design | null {
  const m = code.trim().match(/^CLADE2-([A-Za-z0-9_-]+)-([0-9a-z]{4})$/);
  if (!m || sum(m[1]) !== m[2]) return null;
  try {
    const f = JSON.parse(unb64(m[1]));
    if (!Array.isArray(f) || f.length !== 2 || !Object.hasOwn(PLANS, f[0]) || !Array.isArray(f[1])) return null;
    const rows: Rows = {};
    for (const e of f[1]) {
      if (!Array.isArray(e) || !(PLACES as unknown[]).includes(e[0]) || !Array.isArray(e[1]) || rows[e[0] as PlaceId]) return null;
      if (!e[1].every((p: unknown) => typeof p === 'string' && Object.hasOwn(PARTS, p))) return null;
      rows[e[0] as PlaceId] = e[1];
    }
    return startBuild(f[0], rows).problems.length ? null : { body: f[0], rows };
  } catch { return null; }
}

// ---- the one-part continuation ----
export interface Trait { part: PartId; patch: string; line: string; life: number }
/** After a Life: a positive result records the chosen card, or none; zero eggs (or extinction) keep the old trait. */
export const nextTrait = (prev: Trait | null, eggs: number, chosen: Trait | null): Trait | null => (eggs > 0 ? chosen : prev);
/** Whether a stored trait can come along on this body. A body change keeps it stored either way. */
export const traitFits = (t: Trait | null, body: PlanId) => !!t && homesOf(body, t.part).length > 0;
