// The screens outside a Life: which one is open, and the hooks main gives them. The sea itself stays a
// plain object (the rules mutate it); `tick` tells the screens to read it again.
import type { Role } from '../data/garden';
import type { HabitatId } from '../data/habitats';
import type { PartId, PlanId } from '../data/life';
import type { PlaceId, Rows } from '../data/body';
import type { Build, Change } from '../sim/body';
import type { Design } from '../sim/body-hurt';
import type { Headline } from '../sim/sea-news';
import type { Island, Spot, SpotId } from '../sim/island';
import type { Gain } from '../sim/lineage';
import type { SeaPending, SeaSave } from '../sim/sea-save';
import type { Spread } from '../sim/sea-life';

export const ui = $state({
  open: false, patch: null as number | null, hab: null as HabitatId | null, niche: null as Role | null,
  away: null as null | { gens: number; news: Headline[] }, tick: 0,
  feedback: null as null | { patch: number; species: string; eggs: number; gain?: string },
  notice: null as null | { title: string; text: string },
  menu: false, saveError: '', design: null as Design | null, // a pasted CLADE2- design
  clutch: null as null | SeaPending,
  placing: false,
  replay: null as Spread | null, replayFrame: -1,
  gain: null as null | Gain, // 21B: the line's XP after hatching
  line: null as null | PlanId, // 21B: a line's close-up
  /** The body view during a Life: no options = inspection; else the moult's changes (`part` null = grow without one). */
  body: null as null | { build: Build; upkeep: number; moultSize: number; options: { part: PartId | null; change: Change | null }[] },
});
export const ctx = {
  save: null as unknown as SeaSave, isl: null as unknown as Island, spots: null as unknown as Record<SpotId, Spot>,
  start: (_patch: number, _plan: PlanId, _design: Rows) => {},
  buy: (_plan: PlanId, _upgrade: string) => {}, devXp: (_xp: number) => {}, devOpenAll: () => {},
  skip: () => {}, retrySave: () => {},
  keep: (_card: number) => {}, // a card's index, or -1 to take none and keep what you have
  place: (_patch: number) => {},
  continueGain: () => {}, skipReplay: () => {},
  pick: (_part: PartId | null, _place?: PlaceId) => {}, // a moult choice, from the body view
  code: (_patch: number, _species: string) => '', paste: (_code: string) => '',
  exportSave: () => '', importSave: (_text: string) => '', reset: () => false, backup: () => '',
};
export const bump = () => { ui.tick++; };
