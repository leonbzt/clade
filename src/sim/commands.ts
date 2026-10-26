// Everything the player can do. The UI only changes the game through these.
import { NUM } from '../data/numbers';
import { SPECIES, SPECIES_INDEX } from '../data/species';
import { TREE, type Req } from '../data/tree';
import { type State } from './state';
import { allStats, fit } from './stats';
import { strength } from './tick';

export type Result = { ok: true; msg?: string } | { ok: false; reason: string };
const fail = (reason: string): Result => ({ ok: false, reason });

export function unlockedSpecies(s: State): string[] {
  return TREE.filter((n) => n.species && s.reached.includes(n.id)).map((n) => n.species!);
}

export function coverCount(s: State, speciesId: string): number {
  const sp = SPECIES_INDEX[speciesId];
  let n = 0;
  for (let i = 0; i < s.occ.length; i++) if (s.occ[i] === sp) n++;
  return n;
}

export function foundingCost(s: State, speciesId: string): number {
  const n = s.foundings[speciesId], F = NUM.founding;
  return n === 0 ? 0 : Math.round(F.base * F.growth ** (n - 1));
}

export function found(s: State, speciesId: string, i: number): Result {
  const sp = SPECIES_INDEX[speciesId];
  if (!unlockedSpecies(s).includes(speciesId)) return fail('Evolve it first.');
  const cost = foundingCost(s, speciesId);
  if (s.biomass < cost) return fail(`Needs ${cost} biomass.`);
  const st = allStats(s);
  if (fit(s, st[sp], sp, i) <= 0) return fail(`${SPECIES[sp].name} can't live here.`);
  const occ = s.occ[i];
  if (occ === sp) return fail(`${SPECIES[sp].name} is already here.`);
  if (!canTake(s, st, sp, i)) return fail(`${SPECIES[occ].name} hold this tile too well.`);
  s.biomass -= cost;
  s.foundings[speciesId]++;
  const x0 = i % s.w, y0 = (i / s.w) | 0, r = NUM.founding.patch;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = x0 + dx, y = y0 + dy, j = y * s.w + x;
    if (Math.abs(dx) + Math.abs(dy) > r || x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
    if (s.occ[j] !== sp && fit(s, st[sp], sp, j) > 0 && canTake(s, st, sp, j)) { s.occ[j] = sp; s.growth[j] = 0.3; }
  }
  return { ok: true };
}

/** Can this species be founded or spread onto this tile right now? */
export function canFoundAt(s: State, speciesId: string, i: number, st = allStats(s)): boolean {
  const sp = SPECIES_INDEX[speciesId];
  return s.occ[i] !== sp && fit(s, st[sp], sp, i) > 0 && canTake(s, st, sp, i);
}

/** Founding works on empty tiles, or where the new species is stronger than the one already there. */
function canTake(s: State, st: ReturnType<typeof allStats>, sp: number, i: number): boolean {
  const occ = s.occ[i];
  return occ < 0 || strength(s, st, sp, i) > strength(s, st, occ, i, s.growth[i]);
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
  if (req.kind === 'soil') {
    for (let i = 0; i < s.soil.length; i++) if (s.soil[i] >= req.depth) have++;
    return { text: `Tiles with soil ${req.depth}+`, have, need: req.tiles, met: have >= req.tiles };
  }
  have = coverCount(s, req.species);
  const name = SPECIES[SPECIES_INDEX[req.species]].name;
  return { text: `${name} tiles`, have, need: req.tiles, met: have >= req.tiles };
}

export function canEvolve(s: State, nodeId: string): Result {
  const node = TREE.find((n) => n.id === nodeId);
  if (!node) return fail('No such node.');
  if (s.reached.includes(nodeId)) return fail('Already reached.');
  if (node.parent && !s.reached.includes(node.parent)) return fail('Reach its parent first.');
  if (!node.reqs.every((r) => reqStatus(s, r).met)) return fail('Requirements not met.');
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
