// The two UI joints: launch a transient Life, then pass only its eggs to the sea.
import { boardFor } from '../../sim/board';
import { colonise, coloniseJudgement, found } from '../../sim/found';
import { resultOf } from '../../sim/economy';
import { newLife, isLifeBuild } from '../../sim/life';
import type { Species, World } from '../../sim/records';
import { ranksOf } from '../../sim/sea';
import { registerSpecies } from '../placement';

export function launch(world: World, habitat: number, species: Species, count: number) {
  const hab = world.habitats.find((h) => h.id === habitat);
  if (!hab || !isLifeBuild(species.build)) return null;
  const purpose = colonise(world, hab, species);
  if (!purpose) return null;
  // Mix the three launch inputs; no clock or unseeded randomness affects a board.
  const seed = (Math.imul(world.seed, 73856093) ^ Math.imul(hab.id + 1, 19349663) ^ Math.imul(count, 83492791)) >>> 0;
  const life = newLife(boardFor(hab, world, seed), structuredClone(species.build), { ...ranksOf(world, species.lineage) }, seed);
  return { life, habitat: hab.id, species: structuredClone(species), purpose: purpose.text, report: null as ReturnType<typeof coloniseJudgement> | null };
}
export type Colonisation = NonNullable<ReturnType<typeof launch>>;

export function finish(world: World, session: Colonisation) {
  const result = resultOf(session.life), hab = world.habitats.find((h) => h.id === session.habitat);
  if (!result || !hab || session.report) return session.report;
  // Dev choices may not live in World yet. Register them and their ancestors before found.
  registerSpecies(world, session.species);
  found(world, hab, session.species, result.eggs);
  session.report = coloniseJudgement(world, hab, session.species, result.eggs);
  return session.report;
}
