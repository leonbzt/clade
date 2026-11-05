// The screens outside a Life (slice 13): which one is open, and the hooks main gives them. The garden itself stays a
// plain object (the rules mutate it); `tick` tells the screens to read it again.
import type { Role } from '../data/garden';
import type { HabitatId } from '../data/habitats';
import type { PartId, PlanId, VerbId } from '../data/life';
import type { News } from '../sim/garden';
import type { Island, Spot, SpotId } from '../sim/island';
import type { Pending, Save } from '../sim/save';

export const ui = $state({
  open: false, hab: null as HabitatId | null, niche: null as Role | null,
  away: null as null | { gens: number; news: News[] }, tick: 0,
  notice: null as null | { title: string; text: string },
  menu: false,
  clutch: null as null | Pending,
});
export const ctx = {
  save: null as unknown as Save, isl: null as unknown as Island, spots: null as unknown as Record<SpotId, Spot>,
  start: (_hab: HabitatId, _niche: Role, _verbs: VerbId[], _plan: PlanId, _form?: PartId) => {},
  skip: () => {},
  keep: (_card: number) => {}, // a card's index, or -1 to take none and keep what you have
  code: (_hab: HabitatId, _role: Role) => '', paste: (_code: string) => '',
  exportSave: () => '', importSave: (_text: string) => '', reset: () => {}, backup: () => '',
};
export const bump = () => { ui.tick++; };
