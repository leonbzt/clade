// What the board shows for a habitat's loadout: six cards (the three plant layers, then grazer, recycler, hunter),
// each filled (the holder's picture, name and tier), open (an empty frame, glowing when big) or locked (nothing of
// that kind here). Sizes in grams with a word; the bar shows how full the slot is. Shared by the Habitats tab and the
// loadout cards on the map.
import { TIERS } from '../data/genes';
import { GEAR, SIZE_STEPS, SIZE_WORDS } from '../data/habitats';
import { ZONE } from '../data/palette';
import { ROLES } from '../data/roles';
import { SPECIES } from '../data/species';
import { groupName, slotAt } from '../sim/slots';
import type { State } from '../sim/state';
import type { Slot } from '../sim/tally';
import { lookOf, type VariantLook } from '../view/look';
import { areaM2, grams } from '../data/units';

/** One role under a card, or the card's own role. */
export type RoleView = {
  role: number;
  name: string;
  holder: number;
  who: string; // the holder: its leading species here
  color: string;
  tier: { name: string; color: string } | null;
  yours: boolean;
  open: boolean;
  big: boolean;
  size: string; // "40 g/min · 5 g/m² per min · large"
  hold: number; // the bar: the holder's share, then the other eaters', 0–1
  other: number;
  trend: string;
  fed: string; // "fed by Springtails (springtail hunter here)"
};

export type GearView = RoleView & {
  k: number;
  slot: string; // "Grazer"
  glyph: string;
  shape: 'lead' | 'eat' | 'hunt';
  locked: boolean;
  look: VariantLook | null;
  rank: string; // "2nd largest grazer slot on the island"
  roles: RoleView[]; // what's under an animal card
};

export const groupColor = (g: number) => (g >= 0 ? ZONE[SPECIES[g].id] ?? '#f0e6c8' : 'transparent');

/** "40 g/min · 5 g/m² per min · large": the size in grams, per m² of its habitat, and a word from fixed steps, the
 * same everywhere. */
export function sizeText(s: State, sl: Slot): string {
  const flow = ROLES[sl.role].kind !== 'lead', steps = SIZE_STEPS[flow ? 'flow' : 'stock'], m2 = areaM2(s.habitats[sl.place]?.tiles ?? 0);
  const dense = m2 ? ` · ${grams(sl.grams / m2)}/m²${flow ? ' per min' : ''}` : '';
  return `${grams(sl.grams)}${flow ? '/min' : ''}${dense} · ${SIZE_WORDS[steps.filter((x) => sl.grams >= x).length]}`;
}

function roleView(s: State, p: number, r: number): RoleView {
  const sl = slotAt(s, p, r), sp = sl.sp >= 0 ? s.species[sl.sp] : null, use = Math.min(1, sl.use), hold = sl.holder >= 0 ? Math.min(use, sl.share) : 0;
  return {
    role: r, name: ROLES[r].name, holder: sl.holder, who: sl.holder < 0 ? '' : sp && sp.base === sl.holder && sp.parent >= 0 ? sp.name : groupName(sl.holder),
    color: groupColor(sl.holder), tier: sl.v >= 0 && sl.tier > 0 ? TIERS[sl.tier] : null, yours: sl.yours, open: sl.open, big: sl.big,
    size: sizeText(s, sl), hold, other: use - hold, trend: sl.trend > 0 ? '↑' : sl.trend < 0 ? '↓' : '',
    fed: sl.feeder >= 0 ? `fed by ${groupName(sl.feeder)}${sl.fedBy >= 0 ? ` (${ROLES[sl.fedBy].name.toLowerCase()} here)` : ''}` : '',
  };
}

const ORD = ['', '', '2nd ', '3rd '];
const ordinal = (n: number) => ORD[n] ?? `${n}th `;

/** A habitat's six loadout cards. */
export function loadout(s: State, p: number): GearView[] {
  return GEAR.map((g, k) => {
    const r = s.board.gear[p * GEAR.length + k], shape = g.plant ? 'lead' : g.id === 'hunter' ? 'hunt' : 'eat';
    const base = { k, slot: g.name, glyph: g.glyph, shape, roles: [] as RoleView[], rank: '', look: null } as const;
    if (r < 0) return { ...base, role: -1, name: g.name, holder: -1, who: '', color: 'transparent', tier: null, yours: false, open: false, big: false,
      size: '', hold: 0, other: 0, trend: '', fed: '', locked: true };
    const sl = slotAt(s, p, r);
    let rank = 1;
    for (const h of s.habitats) {
      const q = h.shown && h.id !== p ? s.board.gear[h.id * GEAR.length + k] : -1;
      if (q >= 0 && slotAt(s, h.id, q).grams > sl.grams) rank++;
    }
    const under = g.plant ? [] : ROLES.flatMap((x, q) => (g.kinds!.includes(x.kind) && slotAt(s, p, q).exists ? [roleView(s, p, q)] : []));
    return { ...base, ...roleView(s, p, r), locked: false, look: sl.v >= 0 && s.variants[sl.v]?.alive ? lookOf(s, sl.v) : null,
      rank: `${ordinal(rank)}largest ${g.name.toLowerCase()} slot on the island`, roles: under.sort((a, b) => slotAt(s, p, b.role).grams - slotAt(s, p, a.role).grams) };
  });
}
