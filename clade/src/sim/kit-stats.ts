// A kit body's six stats (B0 round two). CONTRACT (17 Nov): the signature is fixed; the body is part A's work.
// It imports data only, so `life-body.ts` can read it.
import { KIT, WORM_KIT, type KitState, type StatId } from '../data/kit';
import { PARTS } from '../data/parts';
import type { Place, Stats } from './records';

/** `KIT.base` plus the `adds` of every rung climbed. A part on a lost place adds nothing; a trait always adds. */
export function kitStats(kit: KitState, lost: readonly Place[]): Stats {
  const stats: Stats = { ...KIT.base };
  for (const id of kit.order) {
    const node = WORM_KIT.find((n) => n.id === id)!;
    if (node.kind === 'part' && lost.includes(PARTS[node.id].place)) continue;
    for (const rung of node.rungs.slice(0, kit.rungs[id] ?? 0)) {
      for (const stat of Object.keys(rung.adds) as StatId[]) stats[stat] += rung.adds[stat]!;
    }
  }
  return stats;
}
