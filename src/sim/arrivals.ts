// Arrivals: an animal turns up at a landmark once its habitat is there (its node's requirements) and waits there to
// be adopted. After that a few more arrive now and then while the species is still small, as on real islands; it
// keeps a line that dies out by bad luck from being gone for good.
import { ANIMAL } from '../data/animals';
import { TREE, type TreeNode } from '../data/tree';
import { spawn } from './agents';
import { buildProfile, fit, profiles, type Profile } from './fit';
import { rand } from './rng';
import { type State } from './state';
import { speciesIndex, variantFor } from './variants';

const placeOf = (s: State, i: number) => s.landmarks[s.mark[i]]?.name ?? 'the shore';

/** A tile of a landmark of the arrival's kind where the species can live, picked by the rng among the third with
 * the most edible plants nearby (luck brings the log ashore near some food); -1 if there's none. */
function landing(s: State, n: TreeNode): number {
  const sp = speciesIndex(s, n.species!), p = buildProfile(s, sp, s.species[sp].genome), P = profiles(s);
  const tiles = s.landmarks.filter((m) => m.kind === n.arrive!.at).flatMap((m) => m.tiles).filter((i) => fit(s, p, i) > 0)
    .map((i) => ({ i, g: greenNear(s, P, i) })).sort((a, b) => b.g - a.g);
  const top = tiles.slice(0, Math.max(1, Math.ceil(tiles.length / 3)));
  return tiles.length ? top[Math.floor(rand(s) * top.length)].i : -1;
}

/** Plant cover × palatability within 6 tiles. */
function greenNear(s: State, P: Profile[], i: number): number {
  const n = s.w * s.h, x0 = i % s.w, y0 = (i / s.w) | 0;
  let g = 0;
  for (let y = Math.max(0, y0 - 6); y <= Math.min(s.h - 1, y0 + 6); y++)
    for (let x = Math.max(0, x0 - 6); x <= Math.min(s.w - 1, x0 + 6); x++)
      for (let k = 0; k * n < s.occ.length; k++) {
        const slot = k * n + y * s.w + x, v = s.occ[slot];
        if (v >= 0) g += s.cover[slot] * P[v].stats.palatable;
      }
  return g;
}

/** Each second: visitors show up where their node is ready, and adopted species get the odd newcomer. */
export function arrivals(s: State, dt: number) {
  for (const n of TREE) {
    if (!n.arrive) continue;
    const sp = speciesIndex(s, n.species!);
    if (!s.reached.includes(n.id)) {
      if (s.visitors[n.id] !== undefined || !s.ready.includes(n.id) || (n.parent && !s.reached.includes(n.parent))) continue;
      const i = landing(s, n);
      if (i < 0) continue;
      s.visitors[n.id] = i;
      s.log.push({ tick: s.tick, kind: 'arrival', sp, text: `${n.arrive.text.replace('{place}', placeOf(s, i))} Adopt them on the tree.` });
      continue;
    }
    s.arriveClock[n.id] = (s.arriveClock[n.id] ?? 0) + dt;
    if (s.arriveClock[n.id] < ANIMAL.repeat) continue;
    s.arriveClock[n.id] = 0;
    if (s.count[sp] >= n.arrive.n * ANIMAL.repeatBelow) continue;
    const i = landing(s, n), v = i >= 0 ? variantFor(s, sp, s.species[sp].genome) : -1;
    if (v < 0) continue;
    spawn(s, v, i, Math.ceil(n.arrive.n / 2), 'arrived on the island');
    s.log.push({ tick: s.tick, kind: 'arrival', sp, text: `More ${s.species[sp].name.toLowerCase()} arrived at ${placeOf(s, i)}.` });
  }
}

/** Adopting an arrival: its animals step off at the landmark. */
export function adopt(s: State, n: TreeNode): string | null {
  const i = s.visitors[n.id], sp = speciesIndex(s, n.species!);
  if (i === undefined) return 'It hasn’t arrived yet.';
  const v = variantFor(s, sp, s.species[sp].genome);
  if (v < 0) return 'No room for another variant.';
  spawn(s, v, i, n.arrive!.n, 'arrived on the island');
  delete s.visitors[n.id];
  s.foundings[s.species[sp].id] = 1;
  if (s.species[sp].at < 0) s.species[sp].at = s.tick;
  return null;
}
