// What the board shows for one slot: its icon, name, size bar, use, holder, trend and what feeds it. Shared by the
// Regions tab and the slot icons on the map.
import { TIERS } from '../data/genes';
import { ZONE } from '../data/palette';
import { ROLES } from '../data/roles';
import { SPECIES } from '../data/species';
import { groupName, slotAt } from '../sim/slots';
import type { State } from '../sim/state';

export type SlotView = {
  role: number;
  icon: string;
  name: string;
  row: 'lead' | 'eat' | 'hunt';
  bar: number; // size against the role's largest on the island, 0–1
  use: number;
  holder: number;
  who: string; // the holder: its leading species here
  color: string;
  tier: { name: string; color: string } | null;
  yours: boolean;
  open: boolean;
  big: boolean;
  trend: string;
  fed: string; // "← Springtails"
  fedTitle: string;
};

export const groupColor = (g: number) => (g >= 0 ? ZONE[SPECIES[g].id] ?? '#f0e6c8' : 'transparent');

export function slotView(s: State, p: number, r: number): SlotView {
  const sl = slotAt(s, p, r), role = ROLES[r];
  let max = 0;
  for (let q = 0; q < s.regions.length; q++) max = Math.max(max, slotAt(s, q, r).size);
  const sp = sl.sp >= 0 ? s.species[sl.sp] : null;
  return {
    role: r, icon: role.icon, name: role.name, row: role.row, bar: max > 0 ? sl.size / max : 0, use: Math.min(1, sl.use),
    holder: sl.holder, who: sl.holder < 0 ? '' : sp && sp.base === sl.holder && sp.parent >= 0 ? sp.name : groupName(sl.holder),
    color: groupColor(sl.holder), tier: sl.v >= 0 && sl.tier > 0 ? TIERS[sl.tier] : null, yours: sl.yours,
    open: sl.open, big: sl.big, trend: sl.trend > 0 ? '↑' : sl.trend < 0 ? '↓' : '→',
    fed: sl.feeder >= 0 ? `← ${groupName(sl.feeder)}` : '',
    fedTitle: sl.feeder >= 0 ? `fed by ${groupName(sl.feeder)}${sl.fedBy >= 0 ? ` (${ROLES[sl.fedBy].name.toLowerCase()} here)` : ''}` : '',
  };
}

/** A place's three board rows. */
export const rowsOf = (s: State, p: number): SlotView[] => s.board.rows[p]?.filter((r) => r >= 0).map((r) => slotView(s, p, r)) ?? [];
