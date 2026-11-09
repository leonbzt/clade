// The inherited body beside the grown rows. Damage only touches the latter.
import { PLACES, type Rows } from '../data/body';
import type { PartId } from '../data/life';
import * as B from './body';

export interface Plan { rows: Rows; origin?: string; branched: boolean }
export interface PlanChange extends B.Change { bud: boolean; planned: Rows; branches: boolean }
export const sameRow = (a?: B.Change['row'], b?: B.Change['row']) =>
  (a?.length ?? 0) === (b?.length ?? 0) && (a ?? []).every((p, k) => p === b?.[k]);
export const samePlan = (a: Rows, b: Rows) => PLACES.every((p) => sameRow(a[p], b[p]));
export const planBuild = (b: B.Build, rows: Rows): B.Build =>
  ({ ...b, rows, order: PLACES.filter((p) => rows[p]?.length), buds: undefined, lost: undefined });

/** Buds have no stats: every stat still reads only `rows`. */
export function withBuds(b: B.Build, rows: Rows): B.Build {
  const buds: Rows = {};
  for (const p of PLACES) if (rows[p]?.length && !sameRow(rows[p], b.rows[p])) buds[p] = [...rows[p]!];
  return { ...b, buds };
}

/** Defaults remain working under a variant bud. Signature parts are already grown. */
export function larva(full: B.Build): { build: B.Build; growth: Plan } {
  let planned = structuredClone(full);
  for (const part of Object.keys(full.ranks ?? {}) as PartId[]) {
    if (!B.ranked(full, part, 'signature') || B.has(planned, part)) continue;
    const choices = B.changesFor(planned, part);
    const c = choices.find((c) => !c.was) ?? choices[0];
    if (c) planned = c.build;
  }
  let grown: B.Build = { ...B.defaultBuild(full.body), ranks: full.ranks };
  for (const place of PLACES) {
    const row = planned.rows[place];
    if (row?.every((p) => B.defaultBuild(full.body).rows[place]?.includes(p) || B.ranked(full, p, 'signature'))) grown = B.setRow(grown, place, [...row]);
  }
  return { build: withBuds(grown, planned.rows), growth: { rows: structuredClone(planned.rows), branched: false } };
}

/** Validate changes against the whole plan, including all waiting verbs. */
export function changesFor(b: B.Build, growth: Plan, part: PartId): PlanChange[] {
  const full = planBuild(b, growth.rows);
  const bud = PLACES.find((p) => growth.rows[p]?.includes(part) && !sameRow(growth.rows[p], b.rows[p]));
  const choices = bud ? [{ place: bud, row: growth.rows[bud]!, was: growth.rows[bud] ?? null, build: full }] : B.changesFor(full, part);
  return choices.flatMap((c) => {
    const planned = bud ? growth.rows : c.build.rows;
    const next = withBuds(B.setRow(b, c.place, [...c.row]), planned);
    if (B.anatomyProblems(b.body, next.rows).length) return [];
    const before = B.verbs(b), after = B.verbs(next);
    return [{ ...c, was: b.rows[c.place] ?? null, build: next, bud: !!bud, planned,
      branches: !bud && !!growth.rows[c.place]?.length,
      lost: before.filter((v) => !after.includes(v)), gained: after.filter((v) => !before.includes(v)), upkeep: B.upkeep(next) }];
  });
}

export const budParts = (b: B.Build) => PLACES.flatMap((p) => {
  const row = b.buds?.[p];
  return row?.length ? [row[row.length - 1]] : [];
});
