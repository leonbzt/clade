// Test helpers: a build from rows (install order = place order), and a Life's rows swapped in place.
import { PLACES, type Rows } from '../src/data/body';
import type { PlanId } from '../src/data/life';
import type { Build } from '../src/sim/body';
import type { Life } from '../src/sim/life';

export const bld = (body: PlanId, rows: Rows, size = 1): Build => ({ body, size, rows, order: PLACES.filter((p) => rows[p]) });
export const setRows = (l: Life, rows: Rows) => { l.build = { ...l.build, rows, order: PLACES.filter((p) => rows[p]) }; };
export const addRows = (l: Life, rows: Rows) => setRows(l, { ...l.build.rows, ...rows });
