// The sea save (v6: inherited plans; v5 lines and species are retained). Builds are 20A lay
// snapshots. JSON columns follow the saved species registry, never the current content order.
import { ROLE_IDS } from '../data/garden';
import { HAB_ORDER } from '../data/habitats';
import { SEA as WATER } from '../data/island';
import { NODES, PART_IDS, PLAN_IDS, type PlanId } from '../data/life';
import { PLACES, type Rows } from '../data/body';
import { PLAYER_SPECIES, SEA, lineId, type Diet, type Species } from '../data/sea';
import { parseBuild } from './body-hurt';
import { anatomyProblems, verbProblems, type Build } from './body';
import { planBuild, type Plan } from './plan';
import { makeIsland } from './island';
import { freshLines, validLines, type Lines } from './lineage';
import type { Pending, Save } from './save';
import { finite, integer, oneOf, record, rngState, text, validPending, validProgress } from './save-validation';
import { newSea, step, type Sea, type SeaPatch } from './sea';
import { tell, type Headline } from './sea-news';

export const SEA_SAVE_VERSION = 6;
export interface Continuation { patch: number; species: string; plan: Pending['plan']; role: Pending['role']; eggs: number }
/** A finished Life waiting to settle: `build` is the latest lay's snapshot (none without eggs). */
/** `growth`: the frozen plan and its source species, saved with the clutch. */
export interface SeaPending extends Pending { patch: number; place?: number; species: string; build?: Build; diet?: Diet; growth?: Plan }
export interface SeaSave extends Omit<Save, 'v' | 'garden' | 'pending' | 'forms'> {
  v: typeof SEA_SAVE_VERSION; sea: Sea; news: Headline[]; pending?: SeaPending; continuation?: Continuation;
  lines: Lines; // one per open lineage (21A)
}

const floats = ['pop', 'fit', 'peak', 'low'] as const;
const ints = ['came', 'fromNb', 'falling'] as const;
type WirePatch = Omit<SeaPatch, typeof floats[number] | typeof ints[number] | 'lost' | 'hist'>
  & Record<typeof floats[number] | typeof ints[number] | 'lost' | 'hist', number[]>;

export function freshSeaSave(seed: number, now: number): SeaSave {
  return { v: SEA_SAVE_VERSION, seed, at: now, sea: newSea(seed), news: [], best: {}, lives: 0, unlocks: {}, lines: freshLines() };
}

export function serializeSeaSave(s: SeaSave): string {
  const { isl: _isl, of: _of, moved: _moved, patches, ...sea } = s.sea;
  return JSON.stringify({ ...s, sea: { ...sea, patches: patches.map((p) => ({ ...p,
    pop: Array.from(p.pop), fit: Array.from(p.fit), peak: Array.from(p.peak), low: Array.from(p.low), lost: Array.from(p.lost),
    came: Array.from(p.came), fromNb: Array.from(p.fromNb), falling: Array.from(p.falling), hist: Array.from(p.hist),
  })) }, news: s.news.map((n) => ({ ...n, sp: s.sea.species[n.sp].id })) });
}

const numbers = (v: unknown, length: number, valid: (x: unknown) => boolean): v is number[] =>
  Array.isArray(v) && v.length === length && v.every((x) => valid(x));
const stock = (v: unknown) => finite(v, 0, 100);
const patchRef = (v: unknown, count: number) => integer(v, 0, count - 1);

function validSpecies(v: unknown): v is Species {
  return record(v) && text(v.id) && text(v.name) && oneOf(v.role, ROLE_IDS) && typeof v.line === 'boolean'
    && (v.plan === undefined || oneOf(v.plan, PLAN_IDS)) && numbers(v.colour, 3, (n) => integer(n, 0, 255))
    && (v.line ? oneOf(v.plan, PLAN_IDS) && v.id === lineId(v.plan, v.role) : !v.id.startsWith('line:')) && validBuild(v);
}

/** An optional lay snapshot: legal anatomy of the record's own body. */
function validBuild(v: Record<string, unknown>): boolean {
  return (v.build === undefined || (parseBuild(v.build) !== null && (v.plan === undefined || (v.build as Build).body === v.plan)))
    && (v.growth === undefined || (record(v.growth) && record(v.growth.rows) && v.plan !== undefined
      && typeof v.growth.branched === 'boolean' && (v.growth.origin === undefined || text(v.growth.origin))
      && Object.entries(v.growth.rows).every(([k, r]) => oneOf(k, PLACES) && Array.isArray(r) && r.every((x) => oneOf(x, PART_IDS)))
      && !anatomyProblems(v.plan as PlanId, v.growth.rows as Rows).length
      && !verbProblems(planBuild({ body: v.plan as PlanId, size: 1, rows: {}, order: [], ranks: (v.build as Build | undefined)?.ranks }, v.growth.rows as Rows)).length))
    && (v.diet === undefined || (record(v.diet) && Object.entries(v.diet).every(([key, n]) => (key === 'prey' || Object.hasOwn(NODES, key)) && finite(n))));
}

/** Validate before constructing typed arrays: typed-array coercion must not repair invalid imports. */
function readSea(value: unknown, seed: number): Sea | null {
  if (!record(value) || !integer(value.gen) || !rngState(value.r) || !Array.isArray(value.species)
    || value.species.length > 256 || !value.species.every(validSpecies) || !Array.isArray(value.patches)
    || !value.patches.length || value.patches.length > 1024 || !Array.isArray(value.patchCrashes)) return null;
  const saved = value.species, ids = saved.map((sp) => sp.id), S = ids.length, N = value.patches.length;
  if (new Set(ids).size !== S || !PLAYER_SPECIES.every((sp) => ids.includes(sp.id))) return null;
  if (value.patchCrashes.length % 2 || !value.patchCrashes.every((v, k) => k % 2 ? patchRef(v, N) : integer(v, 0, value.gen as number))) return null;
  const isl = makeIsland(seed), of = new Int32Array(isl.w * isl.h).fill(-1);
  for (let id = 0; id < N; id++) {
    const p = value.patches[id];
    if (!record(p) || p.id !== id || !oneOf(p.ground, HAB_ORDER) || !finite(p.x, 0, isl.w - 1) || !finite(p.y, 0, isl.h - 1)
      || typeof p.outer !== 'boolean' || !finite(p.rich, 0.01, 10) || !stock(p.mats) || !stock(p.rot) || !stock(p.oxygen)
      || !integer(p.shocked, 0, 1) || !finite(p.preyPeak) || typeof p.preyFalling !== 'boolean') return null;
    if (!Array.isArray(p.tiles) || !p.tiles.length || p.tiles.length > of.length
      || !p.tiles.every((t) => integer(t, 0, of.length - 1) && isl.kind[t] === WATER && of[t] === -1 && (of[t] = id) === id)) return null;
    if (!Array.isArray(p.nb) || p.nb.length > N - 1 || new Set(p.nb).size !== p.nb.length
      || !p.nb.every((q) => patchRef(q, N) && q !== id) || !numbers(p.nbW, p.nb.length, (w) => finite(w, Number.EPSILON, 1))
      || (p.nb.length > 0 && Math.abs(p.nbW.reduce((a, b) => a + b, 0) - 1) > 1e-9)) return null;
    if (!floats.every((k) => numbers(p[k], S, finite)) || !numbers(p.lost, S * 4, finite)
      || !numbers(p.came, S, (n) => integer(n, -2, N - 1)) || !numbers(p.fromNb, S, (n) => integer(n, -1, N - 1))
      || !numbers(p.falling, S, (n) => integer(n, 0, 1)) || !numbers(p.hist, SEA.history * 4, finite)) return null;
    if (!record(p.normal) || !['mats', 'rot', 'oxygen'].every((k) => stock((p.normal as Record<string, unknown>)[k]))
      || !finite(p.normal.prey) || !finite(p.normal.hunters)) return null;
  }
  const raw = value.patches as WirePatch[];
  if (raw.some((p) => p.nb.some((q) => !raw[q].nb.includes(p.id)))) return null;
  // Canonical order makes content reordering harmless, including every memory column and loss stride.
  const species = [...saved].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0), order = species.map((sp) => ids.indexOf(sp.id));
  const patches: SeaPatch[] = raw.map((p) => ({ ...p,
    pop: Float64Array.from(order, (k) => p.pop[k]), fit: Float64Array.from(order, (k) => p.fit[k]),
    peak: Float64Array.from(order, (k) => p.peak[k]), low: Float64Array.from(order, (k) => p.low[k]),
    lost: Float64Array.from(order.flatMap((k) => p.lost.slice(k * 4, k * 4 + 4))),
    came: Int32Array.from(order, (k) => p.came[k]), fromNb: Int32Array.from(order, (k) => p.fromNb[k]),
    falling: Uint8Array.from(order, (k) => p.falling[k]), hist: Float32Array.from(p.hist),
  }));
  return { gen: value.gen, r: value.r as number, species, patches, isl, of,
    patchCrashes: value.patchCrashes as number[], moved: new Float64Array(N * S) };
}

function validReference(v: unknown, sea: Sea): v is Continuation {
  if (!record(v) || !patchRef(v.patch, sea.patches.length) || !text(v.species) || !integer(v.eggs)) return false;
  const sp = sea.species.find((sp) => sp.id === v.species);
  return !!sp?.line && sp.plan === v.plan && sp.role === v.role;
}

function validPlace(v: Record<string, unknown>, sea: Sea): boolean {
  return v.place === undefined || (patchRef(v.place, sea.patches.length)
    && (v.place === v.patch || sea.patches[v.patch as number].nb.includes(v.place as number)));
}

type Parsed = { save: SeaSave | null; problem: 'none' | 'broken' | 'newer' | null };
export function parseSeaSave(json: string | null): Parsed {
  if (!json) return { save: null, problem: 'none' };
  try {
    const s: unknown = JSON.parse(json);
    if (!record(s) || !integer(s.v, 1)) return { save: null, problem: 'broken' };
    if (s.v > SEA_SAVE_VERSION) return { save: null, problem: 'newer' };
    if (s.v < 5) return { save: null, problem: 'none' }; // the cutover reset: a fresh sea, no message
    if (s.v === 5 && record(s.pending)) {
      const rows = s.pending.launch ?? (record(s.pending.build) ? s.pending.build.rows : undefined);
      if (rows) s.pending.growth = { rows, branched: false };
      delete s.pending.launch;
    }
    if (!validProgress(s) || !validLines(s.lines)) return { save: null, problem: 'broken' };
    const sea = readSea(s.sea, s.seed as number);
    if (!sea || (s.pending !== undefined && (!validPending(s.pending) || !validReference(s.pending, sea) || !validPlace(s.pending as unknown as Record<string, unknown>, sea) || !validBuild(s.pending as unknown as Record<string, unknown>)))
      || (s.continuation !== undefined && (!validReference(s.continuation, sea) || s.continuation.eggs <= 0))) return { save: null, problem: 'broken' };
    if (!Array.isArray(s.news) || s.news.length > SEA.keepLines) return { save: null, problem: 'broken' };
    const news: Headline[] = [];
    for (const n of s.news) {
      if (!record(n) || !oneOf(n.kind, ['crash', 'boom', 'spread']) || !text(n.sp) || !text(n.cause)
        || !integer(n.gen, 0, sea.gen) || !finite(n.from) || !finite(n.to) || !Array.isArray(n.patches) || !n.patches.length
        || new Set(n.patches).size !== n.patches.length || !n.patches.every((p) => patchRef(p, sea.patches.length))) return { save: null, problem: 'broken' };
      const sp = sea.species.findIndex((sp) => sp.id === n.sp);
      if (sp < 0) return { save: null, problem: 'broken' };
      news.push({ kind: n.kind, sp, cause: n.cause, gen: n.gen, from: n.from, to: n.to, patches: n.patches as number[] });
    }
    // Each field above has been validated; unknown top-level fields are deliberately not copied.
    return { save: { v: SEA_SAVE_VERSION, seed: s.seed as number, at: s.at as number, lives: s.lives as number,
      best: s.best as SeaSave['best'], unlocks: s.unlocks as SeaSave['unlocks'],
      sea, news, pending: s.pending as SeaPending | undefined, continuation: s.continuation as Continuation | undefined,
      lines: s.lines as Lines }, problem: null };
  } catch { return { save: null, problem: 'broken' }; }
}

/** Eight-hour cap is consumed once. Rollback leaves the last simulation timestamp intact. */
export function advanceSeaSave(s: SeaSave, now: number): { gens: number; news: Headline[] } {
  const elapsed = now - s.at, gens = Math.max(0, Math.min(SEA.awayCap, Math.floor(elapsed / SEA.genMs))), news: Headline[] = [];
  for (let k = 0; k < gens; k++) { const events = step(s.sea); tell(s.sea, s.news, events); tell(s.sea, news, events); }
  s.at = elapsed > SEA.awayCap * SEA.genMs ? now : s.at + gens * SEA.genMs;
  return { gens, news };
}
