// Slice 20B: what the equipment view shows, as plain functions over the 20A model: each place's state, the starter
// choices at a place with their trade-off, the build's numbers. No DOM; Equip.svelte draws it.
import { BODIES, BODY_RULE, PLACES, PLACE_NAMES, PRESETS, type PlaceId, type PresetId, type Row, type Rows } from '../data/body';
import { PARTS, VERBS, type PartId, type PlanId, type VerbId } from '../data/life';
import * as B from '../sim/body';

export type PlaceState = 'held' | 'bud' | 'empty' | 'locked' | 'unsupported';
export interface PlaceView { place: PlaceId; name: string; state: PlaceState; holds: string; lock?: string }
export interface Option {
  row: Row | null; name: string; does: string; upkeep: number; verb?: string;
  current: boolean; gained: VerbId[]; lost: VerbId[]; upkeepAfter: number; problems: string[]; build: B.Build;
}

const rowName = (r: Row) => B.describeRow(r);
export const rowUpkeep = (r: Row) => r.reduce((n, p) => n + PARTS[p].upkeep, 0);
export const verbName = (v: VerbId) => VERBS[v].name;

/** The design a preset or a role starts from; defaults if there is none. */
export function startDesign(body: PlanId, preset?: PresetId): Rows {
  const p = preset && PRESETS[body][preset];
  return structuredClone(p ?? B.defaultBuild(body).rows);
}
export const presetsOf = (body: PlanId) => Object.keys(PRESETS[body]) as PresetId[];

export function places(body: PlanId, b: B.Build): PlaceView[] {
  const D = BODIES[body];
  return PLACES.map((place) => {
    const row = b.rows[place], lock = D.locks[place]?.family, name = PLACE_NAMES[place];
    if (D.unsupported.includes(place)) return { place, name, state: 'unsupported', holds: `no ${body} part yet` };
    if (b.buds?.[place]?.length) return { place, name, state: 'bud', holds: `${rowName(b.buds[place]!)} bud`, lock };
    if (row?.length) return { place, name, state: 'held', holds: rowName(row), lock };
    return { place, name, state: lock ? 'locked' : 'empty', holds: lock ? `needs ${lock} parts` : 'empty', lock };
  });
}

/** Rows a starting build may put at a place: the line's pool (starter parts without a line) and the place's default. */
export function starterRows(body: PlanId, place: PlaceId, line?: B.LinePool): Row[] {
  const def = BODIES[body].defaults.find(([p]) => p === place)?.[1] ?? [];
  return B.rowsAt(body, place).filter((r) => r.every((p) => (line ? line.parts.includes(p) : B.isStarterPart(p)) || def.includes(p)));
}
/** A design that passes the starter check for this line, or null. */
export const legalFor = (body: PlanId, rows: Rows, line?: B.LinePool) => (B.startBuild(body, rows, line).problems.length ? null : rows);

/** Every choice at a place, each with what it does to the whole build. */
export function optionsAt(body: PlanId, design: Rows, place: PlaceId, line?: B.LinePool): Option[] {
  if (BODIES[body].unsupported.includes(place)) return [];
  const now = B.startBuild(body, design, line), was = now.build.rows[place], before = B.verbs(now.build);
  const rows: (Row | null)[] = [...starterRows(body, place, line)];
  if (!BODIES[body].locks[place]) rows.push(null);
  return rows.map((row) => {
    const next: Rows = { ...design };
    if (row) next[place] = [...row]; else delete next[place];
    const res = B.startBuild(body, next, line), after = B.verbs(res.build);
    const verb = row?.map((p) => B.verbOf(p)).filter(Boolean).map((v) => verbName(v!)).join(', ');
    return {
      row, name: row ? rowName(row) : 'Empty', does: row ? [...new Set(row.map((p) => PARTS[p].does))].join(' ') : 'Nothing here; no upkeep.',
      upkeep: row ? row.reduce((n, p) => n + B.partUpkeep(res.build, p), 0) : 0, verb: verb || undefined,
      current: row ? !!was && was.length === row.length && was.every((p, k) => p === row[k]) : !was?.length,
      gained: after.filter((v) => !before.includes(v)), lost: before.filter((v) => !after.includes(v)),
      upkeepAfter: B.upkeep(res.build), problems: res.problems.filter((p) => !now.problems.includes(p)), build: res.build,
    };
  });
}

/** The build's numbers, in the words the cards use. */
export function numbers(b: B.Build) {
  const all = B.verbs(b), counted = B.countedVerbs(b), parts = B.nominal(b), off = B.allowance(b);
  return {
    verbs: all.map((v) => (counted.includes(v) ? verbName(v) : `${verbName(v)} (free)`)),
    ceiling: `${counted.length} of ${BODY_RULE.maxVerbs} verbs`,
    upkeep: B.upkeep(b),
    upkeepSum: `1 base + ${parts} parts${b.ranks ? ' (ranked)' : ''}${off ? ` − ${off} ${b.body === 'swimmer' ? 'swimming' : 'walking'} allowance` : ''}${b.rows.tail?.includes('deep') ? ' · 0 while on mud (Deep Burrow)' : ''}`,
    move: b.body === 'swimmer' ? `swim ${B.swimSpeed(b)}` : b.body === 'worm' ? `crawl 1, tunnel ${B.tunnel(b)}` : `range ${B.range(b)}`,
    sense: B.sense(b), oxygen: B.oxygenMax(b), clutch: B.clutch({ ...b, size: 3 }),
  };
}

/** The places a part could go on this body, for highlighting. */
export const homes = (body: PlanId, part: PartId) => B.homesOf(body, part);
