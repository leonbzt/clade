// Saves (slice 13; versioned in slice 15): the island's seed, the garden, when it last ran, your best tiers, forms and
// unlocks. Kept in the browser. Old versions migrate step by step; a save that can't be read is kept as a backup.
// Offline: the generations you missed run when you come back (capped at 8 h).
import { MODEL } from '../data/garden';
import type { PartId } from '../data/life';
import { catchUp, newGarden, type Garden, type News } from './garden';

export const SAVE_KEY = 'clade.m1.save', BACKUP_KEY = 'clade.m1.backup';
export const SAVE_VERSION = 2; // 1: slice 13 · 2: forms and unlocks (slices 12, 14)
export interface Save {
  v: number; seed: number; at: number; garden: Garden; best: Record<string, string>; lives: number;
  forms: Record<string, PartId>; unlocks: Record<string, boolean>;
}

export function freshSave(seed: number, now: number): Save {
  return { v: SAVE_VERSION, seed, at: now, garden: newGarden(seed), best: {}, lives: 0, forms: {}, unlocks: {} };
}

/** Each step takes a save of version k to k + 1. */
const MIGRATE: Record<number, (s: Record<string, unknown>) => void> = {
  1: (s) => { s.forms ??= {}; s.unlocks ??= {}; },
};

/** Read a save: the save, or why not ('none', 'newer' for a save from a later version, 'broken'). */
export function parseSave(json: string | null): { save: Save | null; problem: 'none' | 'newer' | 'broken' | null } {
  if (!json) return { save: null, problem: 'none' };
  let s: Record<string, unknown>;
  try { s = JSON.parse(json); } catch { return { save: null, problem: 'broken' }; }
  if (!s || typeof s.v !== 'number' || !(s.garden as Garden)?.habs) return { save: null, problem: 'broken' };
  if (s.v > SAVE_VERSION) return { save: null, problem: 'newer' };
  while ((s.v as number) < SAVE_VERSION) { const m = MIGRATE[s.v as number]; if (!m) return { save: null, problem: 'broken' }; m(s); s.v = (s.v as number) + 1; }
  return { save: s as unknown as Save, problem: null };
}

/** Run the garden up to now: whole generations since `at`, and keep the remainder for next time. */
export function advance(s: Save, now: number): { gens: number; news: News[] } {
  const r = catchUp(s.garden, now - s.at);
  s.at += r.gens * MODEL.genMs;
  if (now - s.at > MODEL.awayCap * MODEL.genMs) s.at = now; // capped: the rest of the time is lost
  return r;
}
