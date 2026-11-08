// Pure display projections. No writes to the sea or its RNG.
import { SEA, type Species } from '../data/sea';
import { feedsAs } from '../sim/feeding';
import type { Sea, SeaPatch } from '../sim/sea';

/** Stable view-only colour and printed key; saves keep their original colours and identity. */
export const speciesKey = (sp: Species) => `${sp.name} · ${sp.role} · ${sp.id}`;
export function speciesColour(sp: Species): [number, number, number] {
  if (!sp.line) return [...sp.colour];
  let h = 2166136261;
  for (const c of sp.id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return [100 + ((h >>> 0) % 156), 100 + ((h >>> 8) % 156), 100 + ((h >>> 16) % 156)];
}
export function markerCounts(sea: Sea) {
  const out: { patch: number; species: number; count: number }[] = [];
  let room = 200;
  for (const p of sea.patches) for (let k = 0; k < sea.species.length; k++) {
    if (p.pop[k] < 1 || room === 0) continue;
    const hunt = !!feedsAs(sea.species[k]).hunt;
    const count = Math.min(room, hunt ? 1 : 2, Math.ceil(p.pop[k] / (hunt ? 14 : 25)));
    out.push({ patch: p.id, species: k, count }); room -= count;
  }
  return out;
}
export function patchAtPoint(sea: Sea, r: { left: number; top: number; width: number; height: number }, px: number, py: number) {
  if (r.width <= 0 || r.height <= 0) return -1;
  const x = Math.floor((px - r.left) / r.width * sea.isl.w), y = Math.floor((py - r.top) / r.height * sea.isl.h);
  return x >= 0 && y >= 0 && x < sea.isl.w && y < sea.isl.h ? sea.of[y * sea.isl.w + x] : -1;
}
/** Only recorded rows, oldest first. Initial state is row zero; never plot unwritten history. */
export function historyRows(sea: Sea, p: SeaPatch) {
  const n = Math.min(SEA.history, sea.gen + 1);
  return Array.from({ length: n }, (_, i) => {
    const gen = sea.gen - n + 1 + i, row = (gen % SEA.history) * 4;
    return { gen, values: Array.from(p.hist.slice(row, row + 4)) };
  });
}
export function historyPaths(sea: Sea, p: SeaPatch) {
  const rows = historyRows(sea, p), scales = [100, 100, Math.max(40, ...rows.map((r) => r.values[2])), 100];
  return ['Mats', 'Detritus', 'Prey', 'Oxygen'].map((name, c) => ({ name, scale: scales[c], colour: ['#70ce62', '#cc985f', '#ffd23a', '#68c8fa'][c],
    points: rows.map((r, i) => `${2 + i / Math.max(1, rows.length - 1) * 296},${70 - Math.min(1, r.values[c] / scales[c]) * 66}`).join(' ') }));
}
export function linePatches(sea: Sea, species?: string) {
  const k = sea.species.findIndex((sp) => sp.id === species);
  return k < 0 ? [] : sea.patches.filter((p) => p.pop[k] >= 1).map((p) => p.id);
}
