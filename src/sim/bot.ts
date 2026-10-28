// A simple greedy player: evolves when it can, founds each species on its best takeable tile, splits off a variant
// that carries a key, and otherwise founds a new species from the first variant that allows it. Used by `npm run sim` and the dev panel. A ruler, not a balance bot.
import { KEYS } from '../data/genes';
import { TREE } from '../data/tree';
import { canEvolve, canFoundAt, canFoundSpecies, evolve, found, foundSpecies, placement, suggestName, unlockedSpecies } from './commands';
import { buildProfile, fit, profiles, type Profile } from './fit';
import { keyCarrier } from './keys';
import { SEA, type State } from './state';
import { step } from './tick';
import { speciesIndex } from './variants';

/** Land tiles by how well this profile fits them, best first. */
function bestTiles(s: State, p: Profile): number[] {
  return [...s.terrain.keys()].filter((i) => s.terrain[i] !== SEA)
    .map((i) => [i, fit(s, p, i)] as const).filter(([, f]) => f > 0).sort((a, b) => b[1] - a[1]).map(([i]) => i);
}

export function botTick(s: State, log?: (line: string) => void) {
  const t = () => (s.tick / 600).toFixed(1) + 'm';
  for (const n of TREE) if (canEvolve(s, n.id).ok) { evolve(s, n.id); log?.(`${t()} evolve ${n.id}`); }
  for (const id of unlockedSpecies(s)) {
    if (s.foundings[id] !== 0) continue;
    const sp = speciesIndex(s, id), P = profiles(s);
    for (const i of bestTiles(s, buildProfile(s, sp, s.species[sp].genome))) if (canFoundAt(s, id, i, P) && found(s, id, i).ok) { log?.(`${t()} found ${id}`); break; }
  }
  if (s.tick % 100 === 0) {
    const door = KEYS.map((k) => ({ k, v: keyCarrier(s, k) })).find((d) => d.v >= 0 && canFoundSpecies(s, d.v).ok);
    const v = door?.v ?? s.variants.findIndex((x, k) => canFoundSpecies(s, k).ok && x.alive);
    const at = v >= 0 ? placement(s, `v:${v}`) : null;
    if (at) {
      const name = suggestName(s, v);
      for (const i of bestTiles(s, at.p).filter(at.ok).slice(0, 40)) if (foundSpecies(s, v, i, name).ok) {
        log?.(`${t()} ${door ? `door ${door.k.node}` : 'species'} ${name}`); break;
      }
    }
  }
  step(s);
}
