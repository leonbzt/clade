// Everything the player can do. The UI only changes the game through these.
import { FIELDS, STRATA } from '../data/fields';
import { NUM } from '../data/numbers';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { TREE, type Req } from '../data/tree';
import { EV, type State } from './state';
import { fit, profiles, type Profile } from './fit';
import { canTake, kill, settle } from './life';

export type Result = { ok: true; msg?: string } | { ok: false; reason: string };
const fail = (reason: string): Result => ({ ok: false, reason });

export function unlockedSpecies(s: State): string[] {
  return TREE.filter((n) => n.species && s.reached.includes(n.id)).map((n) => n.species!);
}

export function coverCount(s: State, speciesId: string): number {
  return s.count[SPECIES_INDEX[speciesId]];
}

export function foundingCost(s: State, speciesId: string): number {
  const n = s.foundings[speciesId], F = NUM.founding;
  return n === 0 ? 0 : Math.round(F.base * F.growth ** (n - 1));
}

const slotFor = (s: State, sp: number, i: number) => STRATA.indexOf(SPECIES[sp].stratum) * s.w * s.h + i;

/** Can this species be founded on this tile right now? */
export function canFoundAt(s: State, speciesId: string, i: number, P: Profile[] = profiles(s)): boolean {
  const sp = SPECIES_INDEX[speciesId], slot = slotFor(s, sp, i);
  return s.occ[slot] !== sp && fit(s, P[sp], i) > 0 && canTake(s, P, sp, slot);
}

export function found(s: State, speciesId: string, i: number): Result {
  const sp = SPECIES_INDEX[speciesId], P = profiles(s), slot = slotFor(s, sp, i);
  if (!unlockedSpecies(s).includes(speciesId)) return fail('Evolve it first.');
  const cost = foundingCost(s, speciesId);
  if (s.biomass < cost) return fail(`Needs ${cost} biomass.`);
  if (fit(s, P[sp], i) <= 0) return fail(`${SPECIES[sp].name} can't live here.`);
  const occ = s.occ[slot];
  if (occ === sp) return fail(`${SPECIES[sp].name} is already here.`);
  if (!canTake(s, P, sp, slot)) return fail(`${SPECIES[occ].name} hold this tile too well.`);
  s.biomass -= cost;
  s.foundings[speciesId]++;
  const x0 = i % s.w, y0 = (i / s.w) | 0, r = NUM.founding.patch;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = x0 + dx, y = y0 + dy, j = y * s.w + x;
    if (Math.abs(dx) + Math.abs(dy) > r || x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
    const sl = slotFor(s, sp, j);
    if (s.occ[sl] === sp || fit(s, P[sp], j) <= 0 || !canTake(s, P, sp, sl)) continue;
    if (s.occ[sl] >= 0) kill(s, sl, EV.taken);
    settle(s, sl, sp, NUM.founding.cover, EV.founded, fit(s, P[sp], j));
    s.count[sp]++;
  }
  return { ok: true };
}

export function buyTrait(s: State, speciesId: string, traitId: string): Result {
  const def = SPECIES[SPECIES_INDEX[speciesId]], trait = def.traits.find((t) => t.id === traitId);
  if (!trait) return fail('No such trait.');
  if (!unlockedSpecies(s).includes(speciesId)) return fail('Evolve it first.');
  if (s.traits[speciesId].includes(traitId)) return fail('Already common.');
  if (s.biomass < trait.cost) return fail(`Needs ${trait.cost} biomass.`);
  s.biomass -= trait.cost;
  s.traits[speciesId].push(traitId);
  return { ok: true };
}

export type ReqStatus = { text: string; have: number; need: number; met: boolean };

export function reqStatus(s: State, req: Req): ReqStatus {
  let have = 0;
  if (req.kind === 'layer') {
    const v = s.layers[req.layer];
    for (let i = 0; i < v.length; i++) if (v[i] >= req.min) have++;
    return { text: `Tiles with ${FIELDS[req.layer].name.toLowerCase()} ${req.min}+`, have, need: req.tiles, met: have >= req.tiles };
  }
  have = coverCount(s, req.species);
  const name = SPECIES[SPECIES_INDEX[req.species]].name;
  return { text: `${name} tiles`, have, need: req.tiles, met: have >= req.tiles };
}

/** Requirements latch: once a node's are all met, they stay met, so a storm can't take a gate away. */
export function checkReady(s: State) {
  for (const n of TREE) {
    if (s.ready.includes(n.id) || s.reached.includes(n.id)) continue;
    if (n.reqs.every((r) => reqStatus(s, r).met)) s.ready.push(n.id);
  }
}

export function canEvolve(s: State, nodeId: string): Result {
  const node = TREE.find((n) => n.id === nodeId);
  if (!node) return fail('No such node.');
  if (s.reached.includes(nodeId)) return fail('Already reached.');
  if (node.parent && !s.reached.includes(node.parent)) return fail('Reach its parent first.');
  if (!s.ready.includes(nodeId) && !node.reqs.every((r) => reqStatus(s, r).met)) return fail('Requirements not met.');
  if (s.biomass < node.cost) return fail(`Needs ${node.cost} biomass.`);
  return { ok: true };
}

export function evolve(s: State, nodeId: string): Result {
  const can = canEvolve(s, nodeId);
  if (!can.ok) return can;
  const node = TREE.find((n) => n.id === nodeId)!;
  s.biomass -= node.cost;
  s.reached.push(nodeId);
  return { ok: true, msg: node.fact };
}

/** Dev: reach every node. */
export function unlockAll(s: State) {
  for (const n of TREE) if (!s.reached.includes(n.id)) s.reached.push(n.id);
}
