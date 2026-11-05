// The screens outside a Life (slice 13): which one is open, and the hooks main gives them. The garden itself stays a
// plain object (the rules mutate it); `tick` tells the screens to read it again.
import type { Role } from '../data/garden';
import type { HabitatId } from '../data/habitats';
import type { PlanId, VerbId } from '../data/life';
import type { Card } from '../sim/clutch';
import type { News } from '../sim/garden';
import type { Island, Spot, SpotId } from '../sim/island';
import type { Save } from '../sim/save';

export const ui = $state({
  open: false, hab: null as HabitatId | null, niche: null as Role | null,
  away: null as null | { gens: number; news: News[] }, tick: 0,
  notice: null as null | { title: string; text: string },
  clutch: null as null | { cards: Card[]; hab: HabitatId; role: Role; plan: PlanId; eggs: number; tier: string },
});
export const ctx = {
  save: null as unknown as Save, isl: null as unknown as Island, spots: null as unknown as Record<SpotId, Spot>,
  start: (_hab: HabitatId, _niche: Role, _verbs: VerbId[], _plan: PlanId) => {},
  skip: () => {},
  keep: (_card: number) => {},
};
export const bump = () => { ui.tick++; };
