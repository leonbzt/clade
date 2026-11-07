// Feeding comes from the inherited tools, not the food a parent happened to find.
import { PARTS, type PartId } from '../data/life';
import type { Species } from '../data/sea';

export function feeding(parts: readonly PartId[]) {
  const verbs = new Set(parts.map((p) => PARTS[p].verb));
  const hunt = parts.includes('arms') || parts.includes('spikes'), dig = verbs.has('dig') || parts.includes('deep');
  const rot = dig || verbs.has('crush') || parts.includes('hook');
  const mats = verbs.has('graze') || parts.includes('symbiont') || (!hunt && !rot);
  const sources = Number(mats) + Number(rot) + Number(hunt);
  return { mats: Number(mats) / sources, rot: Number(rot) / sources, hunt: Number(hunt) / sources, dig };
}

/** Older saves did not record builds. Keep their IDs and use a bounded, body-compatible starting design. */
export function partsOf(sp: Species): PartId[] {
  if (sp.parts) return sp.parts;
  if (sp.plan === 'swimmer' || sp.id === 'legacy:anomalocaris:predator') return ['arms'];
  if (sp.role === 'predator') return sp.plan === 'worm' || sp.id === 'legacy:ottoia:predator' ? ['proboscis'] : ['claw'];
  if (sp.role === 'burrower') return sp.plan === 'arthropod' || sp.plan === 'trilobite' ? ['digger'] : ['bulb'];
  return sp.plan === 'worm' ? ['tentacles'] : ['rake'];
}
export const feedsAs = (sp: Species) => feeding(partsOf(sp));
