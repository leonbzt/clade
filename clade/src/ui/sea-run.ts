// The sea lives while you do (N4 C): going back to the map after hatching runs `LIFE_GENS` generations. Their reports
// and news stay here in the UI, like the history frames; never in World (law 2).
import { LIFE_GENS } from '../data/sea';
import { news, popsOf, type Headline, type Pops } from '../sim/news';
import type { Species, World } from '../sim/records';
import { step, type StepReport } from '../sim/sea';
import { remember, type Frame } from './history';

/** `frames`: the populations after each generation, for the replay; `species`: every species seen, the gone included. */
export interface SeaRun { before: Pops; reports: StepReport[]; news: Headline[]; frames: Pops[]; species: Species[] }

export function runLife(world: World, history: Frame[], generations = LIFE_GENS): { history: Frame[]; run: SeaRun } {
  const before = popsOf(world), reports: StepReport[] = [], frames: Pops[] = [], seen = new Map(world.species.map((s) => [s.id, s]));
  for (let i = 0; i < generations; i++) {
    reports.push(step(world));
    frames.push(popsOf(world));
    for (const s of world.species) seen.set(s.id, s);
    history = remember(history, world);
  }
  return { history, run: { before, reports, news: news(world, before, reports), frames, species: [...seen.values()] } };
}
