// Test helpers: a build from rows (install order = place order), and a Life's rows swapped in place.
import { PLACES, type Rows } from '../src/data/body';
import type { PlanId } from '../src/data/life';
import type { Build } from '../src/sim/body';
import { newLife, oxygenMax, presetBuild, reveal, type Life } from '../src/sim/life';

export const bld = (body: PlanId, rows: Rows, size = 1): Build => ({ body, size, rows, order: PLACES.filter((p) => rows[p]) });
export const setRows = (l: Life, rows: Rows) => { l.build = { ...l.build, rows, order: PLACES.filter((p) => rows[p]), buds: {} }; l.growth.rows = structuredClone(rows); };
export const addRows = (l: Life, rows: Rows) => setRows(l, { ...l.build.rows, ...rows });

/** Arrange a grown body for the existing feeding, verb and damage tests. Birth itself is tested in plan.test.ts. */
export function grownLife(...args: Parameters<typeof newLife>): Life {
  const l = newLife(...args), full = args[3] ?? presetBuild(l.plan);
  l.build = structuredClone(full); l.growth.rows = structuredClone(full.rows);
  l.oxygen = oxygenMax(l); reveal(l);
  return l;
}
