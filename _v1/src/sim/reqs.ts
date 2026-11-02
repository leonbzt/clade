// Tree node requirements: what each one needs, how far you are, and the latch that keeps them met.
import { FIELDS } from '../data/fields';
import { KEYS } from '../data/genes';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { TREE, type Req, type TreeNode } from '../data/tree';
import { type State } from './state';

export type ReqStatus = { text: string; have: number; need: number; met: boolean };

/** Tiles of every species built on this base species (yours and the template's). */
export function baseCount(s: State, defId: string): number {
  const b = SPECIES_INDEX[defId];
  return s.species.reduce((a, x, sp) => a + (x.base === b ? s.count[sp] : 0), 0);
}

export function reqStatus(s: State, req: Req): ReqStatus {
  let have = 0;
  if (req.kind === 'layer') {
    const v = s.layers[req.layer];
    for (let i = 0; i < v.length; i++) if (v[i] >= req.min) have++;
    return { text: `Tiles with ${FIELDS[req.layer].name.toLowerCase()} ${req.min}+`, have, need: req.tiles, met: have >= req.tiles };
  }
  if (req.kind === 'key') {
    const key = KEYS.find((k) => k.id === req.gene)!;
    have = s.innovations[req.gene] !== undefined ? 1 : 0;
    return { text: `${key.name} appears in one of your variants`, have, need: 1, met: have >= 1 };
  }
  have = baseCount(s, req.species);
  const def = SPECIES[SPECIES_INDEX[req.species]];
  return { text: def.animal ? `${def.name} on the island` : `${def.name} tiles`, have, need: req.tiles, met: have >= req.tiles };
}

/** A door's requirements other than its key: met (or latched). */
export const othersMet = (s: State, n: TreeNode) =>
  s.ready.includes(n.id) || n.reqs.every((r) => r.kind === 'key' || reqStatus(s, r).met);

/** Requirements latch: once a node's are all met, they stay met, so a storm can't take a gate away. */
export function checkReady(s: State) {
  for (const n of TREE) {
    if (s.ready.includes(n.id) || s.reached.includes(n.id)) continue;
    if (n.reqs.every((r) => reqStatus(s, r).met)) s.ready.push(n.id);
  }
}
