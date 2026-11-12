// The home map, read-only: where your species live, which neighbours you can colonise, and the light fog.
import { TARGET_REASON, YOUR_LINE } from '../data/lines';
import { ceiling, reach } from '../sim/fitness';
import { colonise } from '../sim/found';
import type { Habitat } from '../sim/habitats';
import { isLifeBuild } from '../sim/life';
import type { Letter, Species, World } from '../sim/records';
import { bestFit, ranksOf } from './tiers';

export const isYours = (s: Species) => s.lineage === YOUR_LINE;
const lives = (h: Habitat, s: Species) => (h.pops[s.id] ?? 0) > 0;

/** Your species living here, each with its letter in its best stocked slot. */
export function yoursHere(world: World, hab: Habitat) {
  return world.species.filter((s) => isYours(s) && lives(hab, s)).map((species) => {
    const best = bestFit(species.build, ranksOf(world, species.lineage), hab, world);
    return { species, letter: (best?.fit.letter ?? 'F') as Letter, slot: best?.slot.name ?? 'no food' };
  });
}

/** Your species in a neighbouring habitat that Colonise allows here, best first. */
export function senders(world: World, hab: Habitat) {
  const near = hab.neighbours.map((id) => world.habitats[id]);
  return world.species.filter((s) => isYours(s) && isLifeBuild(s.build) && near.some((n) => lives(n, s)))
    .map((species) => ({ species, from: near.find((n) => lives(n, species))!, purpose: colonise(world, hab, species) }))
    .filter((s): s is typeof s & { purpose: NonNullable<typeof s.purpose> } => s.purpose !== null)
    .sort((a, b) => b.purpose.fit.full - a.purpose.fit.full);
}

/** One line on the map's label: the habitat's richest food, and whether this species reaches it. */
export function reasonFor(world: World, hab: Habitat, species: Species): string {
  const food = ceiling(hab, 'detritus') > ceiling(hab, 'mats') ? 'detritus' : 'mats';
  return TARGET_REASON[food][reach(species.build, ranksOf(world, species.lineage), food, hab) > 0 ? 'reached' : 'missing'];
}

export type HomeLabel =
  | { kind: 'yours'; letters: Letter[] }
  | { kind: 'target'; letter: Letter; reason: string }
  | { kind: 'fog' };

export function homeLabel(world: World, hab: Habitat): HomeLabel {
  const mine = yoursHere(world, hab);
  if (mine.length) return { kind: 'yours', letters: mine.map((m) => m.letter) };
  const best = senders(world, hab)[0];
  if (!best) return { kind: 'fog' };
  const holder = best.purpose.holder;
  return { kind: 'target', letter: best.purpose.fit.letter, reason: holder ? `${holder.species.name} holds it` : reasonFor(world, hab, best.species) };
}

/** Labels never overlap: yours first, then targets, then the larger habitat; the rest hide. Boxes are screen px. */
export function visibleLabels(boxes: { id: number; rank: number; x: number; y: number; w: number; h: number }[]): Set<number> {
  const kept: typeof boxes = [];
  for (const b of [...boxes].sort((a, c) => c.rank - a.rank)) {
    if (kept.every((k) => Math.abs(k.x - b.x) * 2 >= k.w + b.w || Math.abs(k.y - b.y) * 2 >= k.h + b.h)) kept.push(b);
  }
  return new Set(kept.map((b) => b.id));
}
