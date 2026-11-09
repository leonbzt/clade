// Share codes: since the 20C cutover a `CLADE2-` code is a starting design (body, starter parts and their places,
// sim/body-hurt.ts). Old `CLADE-` codes are simply invalid (decided 8 Nov). Here: the code's text helpers, and the
// starting design a line's representative build gives.
import { BODIES, BODY_RULE, PLACES, type Rows } from '../data/body';
import { PARTS, type PartId, type PlanId } from '../data/life';
import { countedVerbs, isStarterPart, startBuild, type Build, type LinePool } from './body';

export const sum = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).slice(-4).padStart(4, '0');
export const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

/**
 * The starting design an adult build stands for: its rows of starter parts (or of a line's pool) and the body's
 * defaults, without the rest; the newest rows go first while the verb ceiling is exceeded. Always passes the starter check.
 */
export function designOf(b: Build, line?: LinePool): { body: PlanId; rows: Rows } {
  const D = BODIES[b.body], rows: Rows = {}, ok = (p: PartId) => (line ? line.parts.includes(p) : isStarterPart(p));
  for (const place of PLACES) {
    const row = b.rows[place], def = D.defaults.find(([p]) => p === place)?.[1];
    if (row?.every((p) => ok(p) || def?.includes(p))) rows[place] = [...row];
    else if (def) rows[place] = [...def]; // a lost or passive row on a locked place falls back to its default
  }
  for (const place of [...b.order].reverse()) {
    const res = startBuild(b.body, rows, line);
    if (!res.problems.length && countedVerbs(res.build).length <= BODY_RULE.maxVerbs) break;
    const def = D.defaults.find(([p]) => p === place)?.[1];
    if (def) rows[place] = [...def]; else delete rows[place];
  }
  return startBuild(b.body, rows, line).problems.length ? { body: b.body, rows: Object.fromEntries(D.defaults.map(([p, r]) => [p, [...r]])) } : { body: b.body, rows };
}
export const designName = (d: { rows: Rows }) => PLACES.flatMap((p) => d.rows[p] ?? []).map((p) => PARTS[p].name).join(', ');
