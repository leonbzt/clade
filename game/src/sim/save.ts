// The save (slice 13; versioned saves and the copy code are slice 15): the island's seed, the garden, when it last ran,
// and your best tiers. Kept in the browser. Offline: the generations you missed run when you come back (capped at 8 h).
import { MODEL } from '../data/garden';
import { catchUp, newGarden, type Garden, type News } from './garden';

export const SAVE_KEY = 'clade.m1.save';
export const SAVE_VERSION = 1;
export interface Save { v: number; seed: number; at: number; garden: Garden; best: Record<string, string>; lives: number }

export function freshSave(seed: number, now: number): Save { return { v: SAVE_VERSION, seed, at: now, garden: newGarden(seed), best: {}, lives: 0 }; }

export function parseSave(json: string | null): Save | null {
  if (!json) return null;
  try { const s = JSON.parse(json) as Save; return s && s.v === SAVE_VERSION && s.garden?.habs ? s : null; } catch { return null; }
}

/** Run the garden up to now: whole generations since `at`, and keep the remainder for next time. */
export function advance(s: Save, now: number): { gens: number; news: News[] } {
  const r = catchUp(s.garden, now - s.at);
  s.at += r.gens * MODEL.genMs;
  if (now - s.at > MODEL.awayCap * MODEL.genMs) s.at = now; // capped: the rest of the time is lost
  return r;
}
