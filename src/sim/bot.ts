// A simple greedy player: evolves when it can, founds each species on its best takeable tile, and founds a new
// species from the first variant that allows it. Used by `npm run sim` and the dev panel. A ruler, not a balance bot.
import { TREE } from '../data/tree';
import { canEvolve, canFoundAt, canFoundSpecies, evolve, found, foundSpecies, suggestName, unlockedSpecies } from './commands';
import { buildProfile, fit, profiles } from './fit';
import { SEA, type State } from './state';
import { step } from './tick';
import { speciesIndex } from './variants';

/** Land tiles by how well this genome fits them, best first. */
function bestTiles(s: State, sp: number, genome: State['species'][number]['genome']): number[] {
  const p = buildProfile(s, sp, genome);
  return [...s.terrain.keys()].filter((i) => s.terrain[i] !== SEA)
    .map((i) => [i, fit(s, p, i)] as const).filter(([, f]) => f > 0).sort((a, b) => b[1] - a[1]).map(([i]) => i);
}

export function botTick(s: State, log?: (line: string) => void) {
  const t = () => (s.tick / 600).toFixed(1) + 'm';
  for (const n of TREE) if (canEvolve(s, n.id).ok) { evolve(s, n.id); log?.(`${t()} evolve ${n.id}`); }
  for (const id of unlockedSpecies(s)) {
    if (s.foundings[id] !== 0) continue;
    const sp = speciesIndex(s, id), P = profiles(s);
    for (const i of bestTiles(s, sp, s.species[sp].genome)) if (canFoundAt(s, id, i, P) && found(s, id, i).ok) { log?.(`${t()} found ${id}`); break; }
  }
  if (s.tick % 100 === 0) {
    const v = s.variants.findIndex((x, k) => canFoundSpecies(s, k).ok && x.alive);
    if (v >= 0) {
      const x = s.variants[v], name = suggestName(s, v);
      for (const i of bestTiles(s, x.sp, x.genome).slice(0, 40)) if (foundSpecies(s, v, i, name).ok) { log?.(`${t()} species ${name}`); break; }
    }
  }
  step(s);
}
