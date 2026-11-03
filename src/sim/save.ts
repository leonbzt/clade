// Saves and offline. The island comes back from its seed plus the soil; habitats are found again (deterministic), and
// the garden is stored per patch. Offline runs the same 1 s step in a loop, capped at 8 h.
import { ECONOMY } from '../data/garden';
import { refreshStocks, type Entry } from './garden';
import { gameStep, gramsBySpecies, type Game, type News, type Sprout } from './game';
import { findHabitats } from './habitats';
import { kindOf, makeIsland } from './island';
import { seeded } from './rng';
import { makeNatives, type Species } from './species';
import type { FormId } from '../data/genes';
import { NICHE_AT } from '../data/niches';

export const SAVE_KEY = 'clade.v2.save';
const VERSION = 1;

interface SaveV1 {
  v: number; at: number; seed: number; t: number; soil: number[];
  life: [number, number, number, number][]; // patch, layer, species, grams
  species: Species[]; biomass: number; sprouts: Sprout[]; sproutClock: number; nextSprout: number;
  forms: Record<FormId, boolean>; firsts: Record<string, true>; news: News[]; founder: number;
  run: Game['run'];
}

export function toSave(g: Game, now: number): string {
  const life: SaveV1['life'] = [];
  g.garden.life.forEach((L, p) => L.slots.forEach((slot, l) => slot?.forEach((e) => life.push([p, l, e.sp, Math.round(e.g * 10) / 10]))));
  const s: SaveV1 = {
    v: VERSION, at: now, seed: g.seed, t: g.garden.t, soil: Array.from(g.isl.soil, (x) => Math.round(x * 1e5) / 1e5), life,
    species: g.species.filter((x) => !x.native), biomass: g.biomass, sprouts: g.sprouts, sproutClock: g.sproutClock,
    nextSprout: g.nextSprout, forms: g.forms, firsts: g.firsts, news: g.news, founder: g.founder, run: g.run,
  };
  return JSON.stringify(s);
}

export function fromSave(json: string): { game: Game; at: number } | null {
  let s: SaveV1;
  try { s = JSON.parse(json); } catch { return null; }
  if (!s || s.v !== VERSION) return null;
  const isl = makeIsland(s.seed);
  isl.soil.set(s.soil);
  for (let i = 0; i < isl.kind.length; i++) isl.kind[i] = kindOf(isl, i);
  const hab = findHabitats(isl), species = [...makeNatives(), ...s.species];
  const life = hab.patches.map((p) => ({
    slots: [0, 1, 2].map(() => null as Entry[] | null), cap: [0, 0, 0], light: [1, 1, 1], water: p.water, nutrient: p.soil,
  }));
  // Slots come from the kinds; entries from the save.
  hab.patches.forEach((p, k) => { for (let l = 0; l < 3; l++) life[k].slots[l] = nicheAt(p.kind, l) ? [] : null; });
  for (const [p, l, sp, g] of s.life) life[p]?.slots[l]?.push({ sp, g, w: 0 });
  const game: Game = {
    seed: s.seed, isl, hab, garden: { t: s.t, life }, species, biomass: s.biomass, sprouts: s.sprouts, sproutClock: s.sproutClock,
    nextSprout: s.nextSprout, forms: s.forms, firsts: s.firsts, news: s.news, yours: 0, founder: s.founder, run: s.run,
    rng: seeded(s.seed * 31 + s.t),
  };
  refreshStocks(game.garden, hab, species);
  return { game, at: s.at };
}

const nicheAt = (kind: number, layer: number) => NICHE_AT[kind][layer] >= 0;

export interface Away {
  seconds: number; biomass: number; areaBefore: number; areaAfter: number; lost: string[]; sprouts: number; news: News[];
}

/** Your lines' area in tiles, over all patches. */
export function yourArea(g: Game): number {
  let a = 0;
  g.hab.patches.forEach((p) => {
    const L = g.garden.life[p.id];
    L.slots.forEach((slot, l) => {
      if (!slot || L.cap[l] <= 0) return;
      let mine = 0;
      for (const e of slot) if (!g.species[e.sp].native) mine += e.g;
      a += p.tiles.length * Math.min(1, mine / L.cap[l]);
    });
  });
  return a;
}

/** Run the garden for the time you were away (capped), and say what happened. */
export function catchUp(g: Game, seconds: number): Away {
  const n = Math.max(0, Math.min(ECONOMY.offlineCap, Math.floor(seconds)));
  const before = gramsBySpecies(g), b0 = g.biomass, a0 = yourArea(g), sp0 = g.nextSprout, t0 = g.garden.t;
  for (let k = 0; k < n; k++) gameStep(g);
  const after = gramsBySpecies(g);
  const lost = [...before.keys()].filter((id) => !after.has(id)).map((id) => g.species[id].name);
  return {
    seconds: n, biomass: g.biomass - b0, areaBefore: a0, areaAfter: yourArea(g), lost, sprouts: g.nextSprout - sp0,
    news: g.news.filter((x) => x.t > t0),
  };
}
