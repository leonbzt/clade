// Small pure reads of a build, shared by fitness and the hunt so neither imports the other's module.
import { PARTS } from '../data/parts';
import { MASS_BY_SIZE, PART_EFFECT } from '../data/sea';
import type { Build, PartId } from './records';

export const partsOf = (b: Build): PartId[] => Object.values(b.parts).filter((p): p is PartId => p !== undefined);
export const sizeOf = (b: Build) => Math.max(1, Math.min(MASS_BY_SIZE.length - 1, Math.round(b.genes.size)));
export const bodyMass = (b: Build): number => MASS_BY_SIZE[sizeOf(b)];
/** Food per meal: the gut gene plus a Gut gland. The bite term of both grazing reach and hunting reach. */
export const biteOf = (b: Build, ids = partsOf(b)) => Math.max(0, b.genes.gut) + (ids.includes('gut') ? PART_EFFECT.gutFood : 0);
/** A hunting tool commits the build to prey (N4 A): it eats no mats or detritus in the sea. */
export const huntsWith = (b: Build, ids = partsOf(b)) => ids.some((p) => PARTS[p].hunts);
/** Two builds with the same clade, parts and genes are the same body in the sea. */
export const buildKey = (b: Build) =>
  `${b.clade}|${Object.entries(b.parts).filter(([, p]) => p).sort().map(([k, p]) => `${k}:${p}`).join(',')}|${b.genes.size}|${b.genes.gut}`;
