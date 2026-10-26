// Garden model, level 1 (systems S20): each released species grows logistically toward its share of each niche.
// Kept behind three functions so a richer model can replace it later.
import { NUMBERS } from '../data/numbers';
import type { NicheId } from '../data/niches';
import { hexKey } from './hex';
import { islandCells, nicheCellCount } from './island';
import type { Garden, GardenSpecies } from './types';

const R = NUMBERS.release;
const FILL_START = R.fillStart;
// growth rate so the fill goes from fillStart to fillSnap in about fillTime
const logit = (f: number) => Math.log(f / (1 - f));
const RATE = (logit(R.fillSnap) - logit(FILL_START)) / R.fillTime;

export function addSpecies(g: Garden, sp: Omit<GardenSpecies, 'fill'>): void {
  g.species.push({ ...sp, fill: 0 });
}

/** Starts the fill after the dispersal animation. */
export function startFill(g: Garden): void {
  for (const sp of g.species) if (sp.fill === 0) sp.fill = FILL_START;
}

export function stepGarden(g: Garden, dt: number): void {
  for (const sp of g.species) {
    if (sp.fill <= 0 || sp.fill >= 1) continue;
    sp.fill += RATE * sp.fill * (1 - sp.fill) * dt;
    if (sp.fill >= R.fillSnap) sp.fill = 1;
  }
  g.biomass += gardenIncome(g) * dt;
}

export function gardenIncome(g: Garden): number {
  return g.species.reduce((sum, sp) => sum + sp.biomassPerSec * sp.fill, 0);
}

/** Which island cells each species covers right now: cell key → species index. */
export function coveredCells(g: Garden): Map<string, number> {
  const out = new Map<string, number>();
  g.species.forEach((sp, i) => {
    for (const c of islandCells()) {
      const n = Math.round(sp.share[c.niche] * nicheCellCount(c.niche) * sp.fill);
      if (c.order < n && !out.has(hexKey(c))) out.set(hexKey(c), i);
    }
  });
  return out;
}

export function nicheCover(g: Garden, niche: NicheId): number {
  return g.species.reduce((sum, sp) => sum + sp.share[niche] * sp.fill, 0);
}
