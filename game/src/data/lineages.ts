// Slice 21A: lineages as data. Per lineage its body, name, named end point, starting parts, a level table and the
// recipe that opens it; the XP curve; the upgrade records points buy. No logic here; the rules are in sim/lineage.ts.
// Every number is a first draft to tune by feel (docs/slices/21-the-climb.md).
import { PARTS, PART_IDS, PLAN_IDS, type PartId, type PlanId } from './life';

/** A recipe: a laid build of `from` holding all `parts`, at `tier` or better, opens the lineage. */
export interface Recipe { from: PlanId; parts: PartId[]; tier: string }
export interface Lineage {
  body: PlanId; name: string; endPoint: string;
  start: PartId[]; // the line's pool at the start (launcher and moult offers); body defaults are always allowed
  levels: Partial<Record<number, PartId>>; // a part that joins the pool at that level
  recipe: Recipe | null;
}

export const LINEAGES: Record<PlanId, Lineage> = {
  worm: {
    body: 'worm', name: 'Worm', endPoint: 'Ottoia', recipe: null,
    start: ['bulb', 'tentacles', 'chaetae', 'eye', 'gut'], levels: { 2: 'gill', 3: 'proboscis', 4: 'sclerite', 6: 'pouch' },
  },
  arthropod: { // the lobopod's stand-in until step 7
    body: 'arthropod', name: 'Arthropod', endPoint: 'Sidneyia', recipe: { from: 'worm', parts: ['sclerite', 'proboscis'], tier: 'B' },
    start: ['leg', 'rake', 'digger', 'claw', 'eye'], levels: { 2: 'gill', 3: 'spine', 4: 'shield', 5: 'flap', 6: 'gut', 7: 'pouch' },
  },
  trilobite: {
    body: 'trilobite', name: 'Trilobite', endPoint: 'Olenoides', recipe: { from: 'arthropod', parts: ['shield', 'digger'], tier: 'B' },
    start: ['leg', 'rake', 'digger', 'shield', 'eye'], levels: { 2: 'gill', 3: 'claw', 4: 'spine', 6: 'gut', 7: 'pouch' },
  },
  swimmer: { // the ladder's Opabinia step folded in: an arthropod with flaps and a compound eye
    body: 'swimmer', name: 'Swimmer', endPoint: 'Anomalocaris', recipe: { from: 'arthropod', parts: ['compound', 'flap'], tier: 'B' },
    start: ['arms', 'flap'], levels: { 2: 'gill', 3: 'lenses', 4: 'spikes', 6: 'gut', 7: 'pouch' },
  },
};
export const LINEAGE_IDS: PlanId[] = PLAN_IDS;

/**
 * XP from a Life: eggs × the tier's weight. `xpAt[n]` is the total XP for level n. Headlines: level 2 after one good
 * Life (about 18 eggs at B), level 5 after about six Lives, the cap at 10 (the named end point).
 */
export const LINE_RULE = {
  tierWeight: { F: 1, D: 2, C: 3, B: 4, A: 5, S: 6 } as Record<string, number>,
  xpAt: [0, 0, 60, 130, 210, 300, 420, 570, 750, 970, 1250],
  cap: 10, pointsPerLevel: 1, species: 6, // saved species kept per line; the oldest drops
};

/** The extra a part gives when Enhanced, in its own unit (sense tiles, food, oxygen, speed, tunnel, range). */
export const ENHANCED: Partial<Record<PartId, number>> = { eye: 2, gut: 1, gill: 1, flap: 1, chaetae: 1, leg: 1 };
/** What the Enhanced number adds to, in the screens' words. */
export const ENHANCED_WHAT: Partial<Record<PartId, string>> = { eye: 'sight', gut: 'food a meal', gill: 'oxygen', flap: 'swim', chaetae: 'tunnel', leg: 'range' };

export type RankId = 'lean' | 'enhanced' | 'signature';
export type Ranks = Partial<Record<PartId, RankId[]>>;
/**
 * An upgrade points buy. Rank 1 is one of Lean or Enhanced; rank 2 Signature (needs either, where the part has one)
 * makes it a built-in like the walking leg: no upkeep, and its verb sits outside the ceiling. Later skill-tree nodes
 * are more records of this kind.
 */
export interface Upgrade { id: string; part: PartId; rank: RankId; cost: number; needs: RankId[]; excludes: RankId[]; does: string }
export const UPGRADES: Upgrade[] = PART_IDS.flatMap((part): Upgrade[] => {
  const P = PARTS[part], out: Upgrade[] = [];
  if (P.upkeep > 0) out.push({ id: `${part}.lean`, part, rank: 'lean', cost: 1, needs: [], excludes: ['enhanced'], does: `${P.name}: −1 upkeep` });
  if (ENHANCED[part]) out.push({ id: `${part}.enhanced`, part, rank: 'enhanced', cost: 1, needs: [], excludes: ['lean'], does: `${P.name}: +${ENHANCED[part]} ${ENHANCED_WHAT[part] ?? 'to its effect'}` });
  if (P.upkeep > 0 || P.verb) out.push({ id: `${part}.signature`, part, rank: 'signature', cost: 2, needs: out.map((u) => u.rank), excludes: [],
    does: `${P.name}: a built-in: no upkeep${P.verb ? ', its verb outside the ceiling' : ''}` });
  return out;
});
