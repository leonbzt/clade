// Slice 20A: the body/part contract as data (docs/design/20a-body-part-contract.md). Six named places, one choice
// each; a choice is one part or one explicit variant. No logic here; the rules are in sim/body.ts. The runtime still
// uses data/life.ts slots until the 20C cutover.
import type { PartId, PlanId, StyleId } from './life';

export type PlaceId = 'front' | 'eyes' | 'limbs' | 'sides' | 'back' | 'tail';
export const PLACES: PlaceId[] = ['front', 'eyes', 'limbs', 'sides', 'back', 'tail']; // also the tear order
export const PLACE_NAMES: Record<PlaceId, string> = { front: 'Front', eyes: 'Eyes', limbs: 'Limbs', sides: 'Sides', back: 'Back', tail: 'Tail' };

/** A place's content: one part, or a two-part variant (base first). Absent = empty. */
export type Row = PartId[];
export type Rows = Partial<Record<PlaceId, Row>>;

const ART: PlanId[] = ['arthropod', 'trilobite'];
const ALL: PlanId[] = ['worm', 'arthropod', 'trilobite', 'swimmer'];
/** Where each part may sit on its own, per body. Variants (below) add the two-part rows. */
export const HOMES: Record<PartId, [PlanId[], PlaceId[]][]> = {
  claw: [[ART, ['front']]],
  shield: [[ART, ['back']]],
  eye: [[['worm', 'arthropod', 'trilobite'], ['eyes']]],
  spine: [[ART, ['sides', 'tail']]],
  leg: [[ART, ['limbs']]],
  digger: [], // only inside walking/digging limbs
  rake: [[ART, ['front']]],
  gill: [[ALL, ['sides']]],
  gut: [[ALL, ['back', 'sides']]],
  pouch: [[ALL, ['tail', 'sides']]],
  proboscis: [[['worm'], ['front']]],
  tentacles: [[['worm'], ['front']]],
  bulb: [[['worm'], ['tail']]],
  arms: [[['swimmer'], ['front']]],
  spikes: [[['swimmer'], ['front']]],
  lenses: [[['swimmer'], ['eyes']]],
  flap: [[['swimmer'], ['limbs']]],
  fan: [[['swimmer'], ['tail']]],
  chaetae: [[['worm'], ['sides']]],
  sclerite: [[['worm'], ['sides', 'tail']]],
  compound: [[ART, ['eyes']]],
  enrol: [[ART, ['tail']]],
  blood: [[ART, ['back', 'sides']]],
  hook: [[['worm'], ['front']]],
  deep: [[['worm'], ['tail']]],
  symbiont: [[['worm'], ['back', 'sides']]],
  progenesis: [[ALL, ['back', 'sides', 'tail']]],
};

export interface Variant { name: string; row: Row; place: PlaceId; bodies: PlanId[] }
export const VARIANTS: Variant[] = [
  { name: 'Walking/raking limbs', row: ['leg', 'rake'], place: 'limbs', bodies: ART },
  { name: 'Walking/digging limbs', row: ['leg', 'digger'], place: 'limbs', bodies: ART },
  { name: 'Spined shield', row: ['shield', 'spine'], place: 'back', bodies: ['trilobite'] },
];
/** An upgrade replaces its predecessor in the same place and keeps its capability, not its upkeep. */
export const UPGRADE_OF: Partial<Record<PartId, PartId>> = { compound: 'eye', hook: 'proboscis', deep: 'bulb', spikes: 'arms' };

export interface Lock { family: string; rows: Row[] }
export interface BodyDef { defaults: [PlaceId, Row][]; locks: Partial<Record<PlaceId, Lock>>; unsupported: PlaceId[] }
const WALKING: Lock = { family: 'walking', rows: [['leg'], ['leg', 'rake'], ['leg', 'digger']] };
export const BODIES: Record<PlanId, BodyDef> = {
  worm: { defaults: [['tail', ['bulb']]], locks: {}, unsupported: ['limbs'] },
  arthropod: { defaults: [['limbs', ['leg']]], locks: { limbs: WALKING }, unsupported: [] },
  trilobite: {
    defaults: [['limbs', ['leg']], ['back', ['shield']]], unsupported: [],
    locks: { limbs: WALKING, back: { family: 'cephalic armour', rows: [['shield'], ['shield', 'spine']] } },
  },
  swimmer: {
    defaults: [['front', ['arms']], ['limbs', ['flap']]], unsupported: [],
    locks: { front: { family: 'grasping', rows: [['arms'], ['spikes']] }, limbs: { family: 'swimming', rows: [['flap']] } },
  },
};
/** The row that pays part of the upkeep while it's whole: 1 food off the total. */
export const ALLOWANCE: Partial<Record<PlanId, PartId>> = { arthropod: 'leg', trilobite: 'leg', swimmer: 'flap' };

/** Quick presets: the exact starting design (defaults included). Swimmers have one, their defaults. */
export type PresetId = StyleId | 'hunter';
export const PRESETS: Record<PlanId, Partial<Record<PresetId, Rows>>> = {
  worm: {
    sweeper: { front: ['tentacles'], sides: ['chaetae'], tail: ['bulb'] },
    digger: { eyes: ['eye'], tail: ['bulb'] },
    tank: { front: ['proboscis'], sides: ['sclerite'], tail: ['bulb'] },
  },
  arthropod: {
    sweeper: { limbs: ['leg', 'rake'] },
    digger: { eyes: ['eye'], limbs: ['leg', 'digger'] },
    tank: { front: ['claw'], limbs: ['leg'], sides: ['spine'] },
  },
  trilobite: {
    sweeper: { limbs: ['leg', 'rake'], back: ['shield'] },
    digger: { eyes: ['eye'], limbs: ['leg', 'digger'], back: ['shield'] },
    tank: { front: ['claw'], limbs: ['leg'], back: ['shield', 'spine'] },
  },
  swimmer: { hunter: { front: ['arms'], limbs: ['flap'] } },
};

/** Which places a strike from each side can reach. Back is struck from the front while it holds armour. */
export const STRUCK: Record<PlaceId, ('front' | 'flank' | 'back')> = { front: 'front', eyes: 'front', limbs: 'flank', sides: 'flank', back: 'flank', tail: 'back' };
export const GUARDS: PartId[] = ['shield', 'spine', 'sclerite'];
export const BODY_RULE = { maxVerbs: 3, codePrefix: 'CLADE2-' };
