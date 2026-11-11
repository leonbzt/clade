// UI snapshots only: a rolling 160-generation window, including both endpoints. Never attached to World.
import type { Habitat } from '../sim/habitats';
import type { World } from '../sim/records';

export interface Frame {
  generation: number;
  habitats: Record<number, Pick<Habitat, 'stocks' | 'pops'>>;
}

export function remember(history: Frame[], world: World): Frame[] {
  const frame: Frame = {
    generation: world.generation,
    habitats: Object.fromEntries(world.habitats.map((h) => [h.id, { stocks: { ...h.stocks }, pops: { ...h.pops } }])),
  };
  return [...history.filter((f) => f.generation < world.generation && f.generation >= world.generation - 160), frame];
}
