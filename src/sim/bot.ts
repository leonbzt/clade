// A simple greedy player: evolves when it can, founds each species on its best takeable tile, buys traits
// when it has twice their cost. Used by the curve script and the dev panel. A ruler, not a balance bot.
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { TREE } from '../data/tree';
import { buyTrait, canEvolve, evolve, found, unlockedSpecies } from './commands';
import { type State } from './state';
import { fit, stats } from './stats';
import { step } from './tick';

export function botTick(s: State, log?: (line: string) => void) {
  const t = () => (s.tick / 600).toFixed(1) + 'm';
  for (const n of TREE) if (canEvolve(s, n.id).ok) { evolve(s, n.id); log?.(`${t()} evolve ${n.id}`); }
  for (const id of unlockedSpecies(s)) {
    if (s.foundings[id] === 0) {
      const sp = SPECIES_INDEX[id], st = stats(s, sp);
      const tiles = [...s.occ.keys()].map((i) => [i, fit(s, st, sp, i)] as const).filter(([, f]) => f > 0).sort((a, b) => b[1] - a[1]);
      for (const [i, f] of tiles) if (found(s, id, i).ok) { log?.(`${t()} found ${id} fit ${f.toFixed(2)}`); break; }
    }
    for (const tr of SPECIES[SPECIES_INDEX[id]].traits) {
      if (!s.traits[id].includes(tr.id) && s.biomass > tr.cost * 2) { buyTrait(s, id, tr.id); log?.(`${t()} trait ${tr.id}`); }
    }
  }
  step(s);
}
