// Roles for the slot board, made from the species data: a slot is a place plus a role. Groups are base species
// (snails and slugs are separate; a slug species you made still counts as a slug). Names and icons are authored here;
// which roles exist follows the data, so a new species brings its own roles.
// - Leads, one per stratum with plants: the major there.
// - Food links, one per thing that's eaten: each plant as cover, litter (animals eat it, fungi break it down), and
//   each animal as prey. A link shows in a place once its food is produced there.
import { STRATA, type StratumId } from './fields';
import { SPECIES } from './species';

/** Groups are the base species (index into SPECIES); food index LITTER is the litter. */
export const GROUPS = SPECIES.length;
export const LITTER = GROUPS;

/** lead: plants of one stratum. graze: one plant's cover. litter: litter, eaten by animals. decompose: litter, broken
 * down by plants (fungi). hunt: one animal's young. */
export type RoleKind = 'lead' | 'graze' | 'litter' | 'decompose' | 'hunt';
/** Which of a place's three board rows the role competes for. */
export type Row = 'lead' | 'eat' | 'hunt';

export type Role = {
  id: string;
  name: string;
  icon: string; // a glyph for the board
  kind: RoleKind;
  row: Row;
  stratum: number; // leads: the stratum (index into STRATA); -1 otherwise
  food: number; // a group, or LITTER; -1 for leads
};

const LEAD: Record<StratumId, { name: string; icon: string }> = {
  under: { name: 'Under ground', icon: '✱' },
  ground: { name: 'Ground cover', icon: '▲' },
  herb: { name: 'Herb layer', icon: '♠' },
};
/** Food-link names that aren't just "<short> grazer" or "<short> hunter". */
const NAMES: Record<string, string> = {
  cyano: 'Crust grazer', snail: 'Snail eater', slug: 'Slug eater',
};
const ICON: Record<RoleKind, string> = { lead: '▲', graze: '●', litter: '≈', decompose: '✲', hunt: '◆' };

function makeRoles(): Role[] {
  const out: Role[] = [];
  STRATA.forEach((st, k) => {
    if (SPECIES.some((d) => !d.animal && d.stratum === st)) out.push({ id: `lead:${st}`, ...LEAD[st], kind: 'lead', row: 'lead', stratum: k, food: -1 });
  });
  SPECIES.forEach((d, g) => {
    if (!d.animal) out.push({ id: `graze:${d.id}`, name: NAMES[d.id] ?? `${d.short} grazer`, icon: ICON.graze, kind: 'graze', row: 'eat', stratum: -1, food: g });
  });
  out.push({ id: 'litter', name: 'Litter eater', icon: ICON.litter, kind: 'litter', row: 'eat', stratum: -1, food: LITTER });
  out.push({ id: 'decompose', name: 'Decomposer', icon: ICON.decompose, kind: 'decompose', row: 'eat', stratum: -1, food: LITTER });
  SPECIES.forEach((d, g) => {
    if (d.animal) out.push({ id: `prey:${d.id}`, name: NAMES[d.id] ?? `${d.short} hunter`, icon: ICON.hunt, kind: 'hunt', row: 'hunt', stratum: -1, food: g });
  });
  return out;
}

export const ROLES: Role[] = makeRoles();

/** Can a group take this role? Leads: plants of the stratum. Litter eaters are animals, decomposers plants. Grazers
 * and hunters: animals. */
export function canHold(r: Role, g: number): boolean {
  const d = SPECIES[g];
  if (r.kind === 'lead') return !d.animal && STRATA.indexOf(d.stratum) === r.stratum;
  if (r.kind === 'decompose') return !d.animal;
  return !!d.animal;
}

/** "the island's best slug eater" */
export const bestName = (r: Role) => r.name.toLowerCase();
