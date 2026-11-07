// The screens outside a Life: which one is open, and the hooks main gives them. The sea itself stays a
// plain object (the rules mutate it); `tick` tells the screens to read it again.
import type { Role } from '../data/garden';
import type { HabitatId } from '../data/habitats';
import type { PartId, PlanId, VerbId } from '../data/life';
import type { Headline } from '../sim/sea-news';
import type { Species } from '../sim/share';
import type { Island, Spot, SpotId } from '../sim/island';
import type { SeaPending, SeaSave } from '../sim/sea-save';

export const ui = $state({
  open: false, patch: null as number | null, hab: null as HabitatId | null, niche: null as Role | null,
  away: null as null | { gens: number; news: Headline[] }, tick: 0,
  notice: null as null | { title: string; text: string },
  menu: false, saveError: '', design: null as Species | null,
  clutch: null as null | SeaPending,
});
export const ctx = {
  save: null as unknown as SeaSave, isl: null as unknown as Island, spots: null as unknown as Record<SpotId, Spot>,
  start: (_patch: number, _niche: Role, _verbs: VerbId[], _plan: PlanId, _form?: PartId) => {},
  skip: () => {}, retrySave: () => {},
  keep: (_card: number) => {}, // a card's index, or -1 to take none and keep what you have
  code: (_patch: number, _species: string) => '', paste: (_code: string) => '',
  exportSave: () => '', importSave: (_text: string) => '', reset: () => false, backup: () => '',
};
export const bump = () => { ui.tick++; };
