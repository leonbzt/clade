// Shared validation for the legacy reader and the staged sea codec. No storage access.
import { ROLE_IDS } from '../data/garden';
import { HAB_ORDER } from '../data/habitats';
import { PART_IDS, PLAN_IDS } from '../data/life';
import type { Pending, Save } from './save';

export const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const finite = (v: unknown, min = 0, max = 1e12): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
export const integer = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): v is number => finite(v, min, max) && Number.isSafeInteger(v);
export const oneOf = <T extends string>(v: unknown, values: readonly T[]): v is T => typeof v === 'string' && values.includes(v as T);
export const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 1000;
export const dictionary = (v: unknown, valid: (value: unknown) => boolean): boolean => record(v) && Object.values(v).every(valid);
export const tiers = ['F', 'D', 'C', 'B', 'A', 'S'];
export const rngState = (v: unknown) => integer(v, -0x80000000, 0xffffffff);
const stocks = (v: Record<string, unknown>) => ['mats', 'rot', 'oxygen'].every((k) => finite(v[k], 0, 100));

export function validProgress(s: Record<string, unknown>): boolean {
  return rngState(s.seed) && integer(s.at) && integer(s.lives)
    && dictionary(s.best, (v) => oneOf(v, tiers)) && dictionary(s.forms, (v) => oneOf(v, PART_IDS))
    && dictionary(s.unlocks, (v) => typeof v === 'boolean');
}

export function validPending(v: unknown): v is Pending {
  return record(v) && oneOf(v.hab, HAB_ORDER) && oneOf(v.role, ROLE_IDS) && oneOf(v.plan, PLAN_IDS)
    && integer(v.eggs) && oneOf(v.tier, tiers) && Array.isArray(v.cards) && v.cards.length <= 6
    && v.cards.every((c) => record(c) && oneOf(c.part, PART_IDS) && oneOf(c.rarity, ['common', 'rare', 'epic'])
      && (c.passed === undefined || typeof c.passed === 'boolean'));
}

export function validLegacy(s: Record<string, unknown>): s is Record<string, unknown> & Save {
  if (!validProgress(s) || (s.pending !== undefined && !validPending(s.pending))) return false;
  const g = s.garden;
  if (!record(g) || !integer(g.gen) || !rngState(g.r) || !record(g.habs) || !record(g.normal) || !Array.isArray(g.news)) return false;
  for (const id of HAB_ORDER) {
    const h = g.habs[id], n = g.normal[id];
    if (!record(h) || !stocks(h) || !Array.isArray(h.entries) || h.entries.length > 256
      || !dictionary(h.flags, (v) => typeof v === 'boolean') || !dictionary(h.leaders, text)) return false;
    if (!h.entries.every((e) => record(e) && text(e.sp) && text(e.name) && oneOf(e.role, ROLE_IDS)
      && finite(e.pop) && finite(e.score) && typeof e.proven === 'boolean' && (e.line === undefined || oneOf(e.line, PLAN_IDS)))) return false;
    if (!record(n) || !stocks(n) || !record(n.pops) || !ROLE_IDS.every((r) => finite((n.pops as Record<string, unknown>)[r]))) return false;
  }
  return g.news.length <= 80 && g.news.every((n) => record(n) && integer(n.gen) && oneOf(n.hab, HAB_ORDER)
    && text(n.text) && text(n.why) && (n.yours === undefined || typeof n.yours === 'boolean'));
}
