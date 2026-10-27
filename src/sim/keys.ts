// Key innovations: a Legendary trait gene grows out of the best variant of its lineage (the base species and the
// ones founded from it) and opens a tree node. A pity clock keeps the pacing: it starts when the lineage is first
// founded and runs faster the more precursor genes the lineage's best shown variant carries.
import { AXIS_INDEX, KEY, KEYS, type Key, type Precursor } from '../data/genes';
import { SPECIES_INDEX } from '../data/species';
import { TREE } from '../data/tree';
import { rand } from './rng';
import { EV, type State } from './state';
import { type Profile } from './fit';
import { copyGenome, defOf, show, stratumOf, variantFor, variantName, type Genome } from './variants';

export const hasPrecursor = (g: Genome, p: Precursor) =>
  p.trait ? g.traits.includes(p.trait) : g.axes[AXIS_INDEX[p.axis!]] >= p.min!;

/** The lineage's species: the base species of the key and every species founded from it. */
export const lineage = (s: State, key: Key) => s.species.flatMap((x, sp) => (x.base === SPECIES_INDEX[key.species] ? [sp] : []));

/** The lineage's shown variant with the most precursors (most tiles on a tie), and how many it carries. */
export function bestCarrier(s: State, key: Key): { v: number; k: number } {
  const sps = lineage(s, key);
  let best = { v: -1, k: -1, tiles: -1 };
  s.variants.forEach((x, v) => {
    if (!x.alive || !x.shown || !sps.includes(x.sp)) return;
    const k = key.precursors.filter((p) => hasPrecursor(x.genome, p)).length;
    if (k > best.k || (k === best.k && x.tiles > best.tiles)) best = { v, k, tiles: x.tiles };
  });
  return { v: best.v, k: Math.max(0, best.k) };
}

/** For the tree screen: each precursor, whether the best variant carries it, and that variant's name. */
export function keyProgress(s: State, key: Key) {
  const { v } = bestCarrier(s, key), g = v >= 0 ? s.variants[v].genome : null;
  return { best: v >= 0 ? variantName(s, v) : null, items: key.precursors.map((p) => ({ text: p.text, met: !!g && hasPrecursor(g, p) })) };
}

/** Advance each key's pity clock; when it fires, the gene appears in the best carrier and its neighbours. */
export function keyInnovations(s: State, P: Profile[], dt: number) {
  for (const key of KEYS) {
    const sps = lineage(s, key);
    if (s.innovations[key.gene] !== undefined || s.species[sps[0]].at < 0) continue;
    const { v: best, k } = bestCarrier(s, key);
    if (best < 0) continue;
    const t = (s.keyClock[key.gene] ?? 0), step = (KEY.speed[k] * dt) / 60, [w0, w1] = key.window;
    s.keyClock[key.gene] = t + step;
    if (t < w0) continue;
    const tiles = sps.reduce((a, sp) => a + s.count[sp], 0), factor = Math.min(2, Math.max(0.5, tiles / KEY.popRef));
    if (t + step < w1 && rand(s) >= KEY.rate * (t - w0) * factor * step) continue; // the last check before w1 forces it
    arrive(s, P, key, best);
  }
}

function arrive(s: State, P: Profile[], key: Key, from: number) {
  const x = s.variants[from], sp = x.sp, n = s.w * s.h, k = stratumOf(s, sp), mine: number[] = [];
  for (let i = 0; i < n; i++) if (s.occ[k * n + i] === from && !s.dying[k * n + i]) mine.push(i);
  if (!mine.length) return;
  const g = copyGenome(x.genome);
  g.traits = [...g.traits, key.gene].sort();
  const v = variantFor(s, sp, g, P);
  if (v < 0) return;
  const i0 = mine[Math.floor(rand(s) * mine.length)], x0 = i0 % s.w, y0 = (i0 / s.w) | 0;
  for (let dy = -KEY.patch; dy <= KEY.patch; dy++) for (let dx = -KEY.patch; dx <= KEY.patch; dx++) {
    const xx = x0 + dx, y = y0 + dy, slot = k * n + y * s.w + xx;
    if (xx < 0 || y < 0 || xx >= s.w || y >= s.h) continue;
    if (s.occ[slot] >= 0 && s.variants[s.occ[slot]].sp === sp) { s.occ[slot] = v; s.lastCode[slot] = EV.mutated; s.lastTick[slot] = s.tick; }
  }
  s.innovations[key.gene] = s.tick;
  s.keyFrom[key.gene] = { sp, form: variantName(s, v) };
  show(s, v);
}

/** Where a species branched off, for the tree: the species it was founded from, or, for a clade's first species,
 * the species whose variant grew the key gene that opened its node (or a node above it). */
export function stemOf(s: State, sp: number): { sp: number; form: string } | null {
  const x = s.species[sp];
  if (x.parent >= 0) return { sp: x.parent, form: x.form };
  let node = TREE.find((n) => n.species === defOf(s, sp).id);
  while (node) {
    const key = KEYS.find((k) => k.node === node!.id);
    if (key && s.keyFrom[key.gene]) return s.keyFrom[key.gene];
    node = TREE.find((n) => n.id === node!.parent);
  }
  return null;
}
