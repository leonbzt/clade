// The hatching screen's numbers: a finished Life's clutch, and for each card its heir's letter here and upkeep.
import { PARTS } from '../../data/parts';
import { heirBuild, rollClutch, type Card } from '../../sim/clutch';
import { resultOf } from '../../sim/economy';
import { partUpkeep } from '../../sim/fitness';
import { coloniseJudgement } from '../../sim/found';
import type { Letter, World } from '../../sim/records';
import { ranksOf } from '../../sim/sea';
import type { Colonisation } from './colonise';

export interface Offer { card: Card; letter: Letter; upkeep: number; replaces: string | null }

/** Deterministic from the Life's seed: the same session always shows the same cards. */
export function clutchOf(world: World, session: Colonisation) {
  const result = resultOf(session.life), hab = world.habitats.find((h) => h.id === session.habitat);
  if (!result || !hab) return null;
  const parent = session.species, ranks = ranksOf(world, parent.lineage);
  const played = coloniseJudgement(world, hab, parent, result.eggs);
  const offers: Offer[] = rollClutch(result, parent, session.life.seed).map((card) => {
    const heir = { ...parent, build: heirBuild(parent.build, card) };
    const old = card.kind === 'swap' ? parent.build.parts[card.place] ?? null : null;
    const upkeep = card.kind === 'lose' ? -partUpkeep(card.part, ranks)
      : partUpkeep(card.part, ranks) - (old ? partUpkeep(old, ranks) : 0);
    return { card, letter: coloniseJudgement(world, hab, heir, result.eggs).fit?.letter ?? 'F', upkeep,
      replaces: old ? PARTS[old].name : null };
  });
  return { eggs: result.eggs, letter: played.fit?.letter ?? 'F', offers };
}
