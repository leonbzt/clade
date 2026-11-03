// Grow toy (slice 00b): the tree's rules. One body for the whole run: winter drops the leaves and lays down wood,
// spring re-leafs the crown's outer shell, wood carries height, and a cut re-sprouts below. No DOM.

import { T, gene, type Genes } from './grow-data';
import { addBud, newPlant, thicken, type Plant } from './grow-sim';
import { cut, cutPreview } from './grow-verbs';
import type { Rng, World } from './grow-world';

export function newTree(genes: Genes, spot: number, world: World | null, rng: Rng): Plant {
  const p = newPlant(genes, spot, world, rng, 'tree');
  p.canGrow = carries;
  return p;
}

/** A tip may grow one more segment only if every stem below it can carry the length above (thickness caps height). */
export function carries(p: Plant, tip: number): boolean {
  if (p.nodes[tip].kind !== 'shoot') return true;
  let above = gene(p.genes, 'internode');
  for (let i = tip; p.nodes[i].parent >= 0; i = p.nodes[i].parent) {
    const n = p.nodes[i];
    if (n.len && above > T.tree.carry * n.thick) return false;
    above += n.len;
  }
  return true;
}

/** How much more stem the trunk's base can carry, for the HUD. */
export function trunkRoom(p: Plant): number {
  const base = p.nodes[1];
  let top = 0;
  for (const n of p.nodes) if (!n.dead && n.kind === 'shoot' && n.len) top = Math.max(top, depthAlong(p, n));
  return Math.max(0, T.tree.carry * base.thick - top);
}
const depthAlong = (p: Plant, n: Plant['nodes'][number]) => {
  let d = 0;
  for (let m = n; m.parent >= 0; m = p.nodes[m.parent]) d += m.len;
  return d;
};

/** Winter: every living segment lays down wood with its load, then the leaves fall. The frame and buds stay. */
export function winter(p: Plant) {
  const load = new Float32Array(p.nodes.length), th = gene(p.genes, 'thickness');
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead || n.state === 'bud') continue;
    load[i] += n.leaf > 0 || n.kind === 'root' ? 1 : 0;
    if (n.len) n.wood += T.tree.wood * th * Math.sqrt(load[i]) * (n.kind === 'root' ? 0.5 : 1);
    if (n.parent >= 0) load[n.parent] += load[i];
  }
  for (const n of p.nodes) if (n.kind === 'shoot') n.leaf = 0;
  thicken(p);
}

/** Spring: a new season; leaves come back on the crown's outer shell (near the stems' ends), the tips and buds grow on. */
export function spring(p: Plant) {
  p.season++;
  const leaf = gene(p.genes, 'leaf'), toEnd = new Float32Array(p.nodes.length).fill(Infinity);
  for (let i = p.nodes.length - 1; i > 0; i--) {
    const n = p.nodes[i];
    if (n.dead || n.kind !== 'shoot' || !n.len) continue;
    if (toEnd[i] === Infinity) toEnd[i] = 0; // nothing grows on from it: a stem's end
    if (toEnd[i] <= T.tree.shell) n.leaf = leaf;
    toEnd[n.parent] = Math.min(toEnd[n.parent], toEnd[i] + 1);
  }
  thicken(p);
}

/** Does a cut here wake buds, or will a new shoot sprout from the stump? */
export function treeCutPreview(p: Plant, world: World, i: number) {
  const c = cutPreview(p, world, i);
  return { ...c, sprout: c.wakes === 0 && p.nodes[i].parent > 0 };
}

/** Cut: the branch and all above it go; the dormant buds just below wake, or a new shoot sprouts from the stump. */
export function treeCut(p: Plant, world: World, i: number) {
  const { sprout } = treeCutPreview(p, world, i), at = p.nodes[i].parent, n = p.nodes[i];
  cut(p, world, i);
  if (sprout) {
    const side = p.rng() < 0.5 ? 1 : -1, ang = (gene(p.genes, 'angle') * Math.PI) / 180;
    addBud(p, at, n.heading + side * ang * 0.5, 'shoot', 'tip', side);
  }
}
