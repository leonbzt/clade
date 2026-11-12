// The return replay (N4 G, view only): after hatching, the Life's generations play over about `REPLAY.seconds` on the
// map. Capsule counts follow the populations, arrivals walk in across the shared border, buds flash once with their
// name, the lost fade. `skip` jumps to the end. Reads the sea run; changes nothing in World.
import { REPLAY } from '../data/sea';
import type { Species, World } from '../sim/records';
import type { MapView } from '../view/map';
import { capsuleCounts, type Want } from '../view/living';
import type { SeaRun } from './sea-run';

export interface Shout { habitat: number; text: string }

export function replay(view: MapView, world: World, run: SeaRun, shout: (s: Shout) => void, done: () => void) {
  const names = new Map<string, Species>(run.species.map((s) => [s.id, s]));
  const wait = (REPLAY.seconds * 1000) / Math.max(1, run.frames.length);
  let k = 0, timer = 0, over = false;
  view.living.sync(capsuleCounts(world, run.before, run.species));
  const next = () => {
    if (over) return;
    if (k >= run.frames.length) return finish();
    const r = run.reports[k], from = new Map<string, number>(); // arrivals this generation: the biggest move in
    for (const m of [...r.moves].sort((a, b) => a.grams - b.grams)) from.set(`${m.to}:${m.species}`, m.from);
    view.living.sync(capsuleCounts(world, run.frames[k], run.species), (w: Want) => {
      const source = from.get(`${w.habitat}:${w.species}`);
      return source === undefined ? null : view.living.border(w.habitat, source);
    });
    for (const b of r.buds) {
      view.living.flash(b.habitat, b.species.id);
      shout({ habitat: b.habitat, text: `${names.get(b.species.id)?.name ?? b.species.name} buds` });
    }
    k++;
    timer = window.setTimeout(next, wait);
  };
  const finish = () => {
    if (over) return;
    over = true; window.clearTimeout(timer);
    view.living.sync(capsuleCounts(world));
    done();
  };
  timer = window.setTimeout(next, REPLAY.lead * 1000);
  return finish;
}
