// The stat pipeline: base stats plus trait modifiers, each tagged with its source. Also fit and tiers.
import { NUM } from '../data/numbers';
import { SPECIES, type StatKey } from '../data/species';
import { BEACH, SEA, type State } from './state';

export type Stats = Record<StatKey, number>;
export type StatLine = { value: number; parts: string[] };

const STAT_KEYS: StatKey[] = ['spread', 'vigor', 'yield', 'soilBuild', 'moistMin', 'moistIdeal', 'soilMin'];

/** Every stat with the list of what changed it, for "why is this number" readouts. */
export function statLines(s: State, sp: number): Record<StatKey, StatLine> {
  const def = SPECIES[sp], owned = new Set(s.traits[def.id]);
  const out = {} as Record<StatKey, StatLine>;
  for (const key of STAT_KEYS) {
    let value = def.base[key];
    const parts = [`base ${fmt(value)}`];
    const traits = def.traits.filter((t) => owned.has(t.id));
    for (const t of traits) for (const m of t.mods) if (m.stat === key && m.add) { value += m.add; parts.push(`${t.name} ${m.add > 0 ? '+' : ''}${fmt(m.add)}`); }
    for (const t of traits) for (const m of t.mods) if (m.stat === key && m.mul) { value *= m.mul; parts.push(`${t.name} ×${m.mul}`); }
    out[key] = { value, parts };
  }
  return out;
}

export function stats(s: State, sp: number): Stats {
  const lines = statLines(s, sp), out = {} as Stats;
  for (const key of STAT_KEYS) out[key] = lines[key].value;
  return out;
}

export function allStats(s: State): Stats[] {
  return SPECIES.map((_, i) => stats(s, i));
}

export function moistureAt(s: State, i: number): number {
  return s.moisture[i] + s.soil[i] * NUM.soil.water;
}

/** How well a species fits a tile, 0–1. Zero means it can't live there. */
export function fit(s: State, st: Stats, sp: number, i: number): number {
  const def = SPECIES[sp], soil = s.soil[i];
  if (s.terrain[i] === SEA || soil < st.soilMin) return 0;
  if (def.soilMax !== undefined && soil >= def.soilMax) return 0;
  const m = moistureAt(s, i);
  if (m < st.moistMin) return 0;
  const span = Math.max(0.05, st.moistIdeal - st.moistMin);
  let f = m >= st.moistIdeal ? 1 - (m - st.moistIdeal) * def.wetFalloff : 0.25 + (0.75 * (m - st.moistMin)) / span;
  if (s.terrain[i] === BEACH) f *= def.salt;
  if (def.soilMax !== undefined) f *= 1 - (0.6 * soil) / def.soilMax;
  return Math.max(0, Math.min(1, f));
}

export function tierOf(f: number): string | null {
  if (f <= 0) return null;
  return NUM.tiers.find(([, min]) => f >= min)![0];
}

function fmt(v: number): string {
  return Math.abs(v) >= 0.1 ? String(+v.toFixed(2)) : String(+v.toPrecision(2));
}
