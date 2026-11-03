// The bridge between the garden and a run: start a run from a sprout on a patch (its holders stand beside you, its
// water is the plot's moisture), and release the final body. No DOM.
import { FORMS } from '../data/genes';
import { NICHE_AT } from '../data/niches';
import { halfYear } from './garden';
import { release, startRun, type Game } from './game';
import { newRun, finalBody, type Beside, type Run } from './run/run';
import type { Species } from './species';

/** The holders of a patch per layer, canopy first, with their cover (grams ÷ capacity). */
export function besideOf(g: Game, patch: number): Beside[] {
  const life = g.garden.life[patch], out: Beside[] = [];
  for (let l = 2; l >= 0; l--) {
    const slot = life.slots[l];
    if (!slot || life.cap[l] <= 0) continue;
    let total = 0, best = slot[0];
    for (const e of slot) { total += e.g; if (!best || e.g > best.g) best = e; }
    if (best) out.push({ layer: l, name: g.species[best.sp].name, cover: total / life.cap[l] });
  }
  return out;
}

/** Pay, take the sprout, make the run. Returns the run or an error text. */
export function beginRun(g: Game, sproutId: number, patch: number): Run | string {
  const err = startRun(g, sproutId, patch);
  if (err) return err;
  const s = g.run!.sprout, p = g.hab.patches[patch], layer = FORMS[s.form].layer;
  const moisture = Math.min(1.2, p.water * halfYear(g.garden.t));
  return newRun(s.form, s.genes, p.kind, NICHE_AT[p.kind][layer], moisture, besideOf(g, patch), g.seed * 1009 + s.id * 7919 + g.garden.t);
}

/** The run's end: the final body becomes a species in the patch. */
export function endRun(g: Game, r: Run, name: string | null): Species {
  const b = finalBody(r);
  return release(g, b.raw, b.genes, name);
}
