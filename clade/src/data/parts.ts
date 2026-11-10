// Copied from game/src/data/life.ts (names, upkeep, does) and body.ts (homes). One part table for sea and Life.
// `place`/`pool` are the primary home; `homes` preserves every old placement restriction for N2.
import type { Part, PartId, Place, PlanId } from '../sim/records';

export const PLACES: Place[] = ['front', 'eyes', 'limbs', 'sides', 'back', 'tail'];
const ART: PlanId[] = ['arthropod', 'trilobite'];
const ALL: PlanId[] = ['worm', 'arthropod', 'trilobite', 'swimmer'];
export const PARTS: Record<PartId, Part> = {
  claw: { id: 'claw', place: 'front', pool: 'shared', family: 'feed', stamp: 'claw', name: 'Crushing claw', upkeep: 1, verb: 'crush', does: 'Opens shell beds. Grabs food ahead without moving.', homes: [[ART, ['front']]], beats: ['armour'] },
  shield: { id: 'shield', place: 'back', pool: 'shared', family: 'guard', stamp: 'shield', name: 'Head shield', upkeep: 0, does: 'Blocks strikes from the front.', homes: [[ART, ['back']]], defence: 'armour' },
  eye: { id: 'eye', place: 'eyes', pool: 'shared', family: 'sense', stamp: 'eye', name: 'Eye', upkeep: 1, verb: 'sense', does: 'See hidden food 2 tiles further.', homes: [[['worm', 'arthropod', 'trilobite'], ['eyes']]] },
  spine: { id: 'spine', place: 'sides', pool: 'shared', family: 'guard', stamp: 'spine', name: 'Spine', upkeep: 1, verb: 'brace', does: 'Blocks strikes on this side; the hunter backs off 3 turns.', homes: [[ART, ['sides', 'tail']]], defence: 'spines' },
  leg: { id: 'leg', place: 'limbs', pool: 'shared', family: 'move', stamp: 'leg', name: 'Walking leg', upkeep: 1, verb: 'dash', does: '+1 tile of movement.', homes: [[ART, ['limbs']]] },
  digger: { id: 'digger', place: 'limbs', pool: 'shared', family: 'feed', stamp: 'digger', name: 'Digging limb', upkeep: 0, verb: 'dig', does: 'Eat buried food in mud.', homes: [], opens: ['detritus'] },
  rake: { id: 'rake', place: 'front', pool: 'shared', family: 'feed', stamp: 'rake', name: 'Raking limbs', upkeep: 1, verb: 'graze', does: 'Sweep mats into your mouth.', homes: [[ART, ['front']]], opens: ['mats'] },
  gill: { id: 'gill', place: 'sides', pool: 'shared', family: 'guard', stamp: 'gill', name: 'Gill', upkeep: 0, does: '+2 maximum oxygen.', homes: [[ALL, ['sides']]] },
  gut: { id: 'gut', place: 'back', pool: 'shared', family: 'feed', stamp: 'gut', name: 'Gut gland', upkeep: 1, does: '+2 food from every meal.', homes: [[ALL, ['back', 'sides']]] },
  pouch: { id: 'pouch', place: 'tail', pool: 'shared', family: 'brood', stamp: 'pouch', name: 'Brood pouch', upkeep: 1, does: 'Bigger clutches: +1x per pouch.', homes: [[ALL, ['tail', 'sides']]] },
  arms: { id: 'arms', place: 'front', pool: 'swimmer', family: 'feed', stamp: 'arms', name: 'Grasping arms', upkeep: 0, does: 'Catch prey you swim onto.', homes: [[['swimmer'], ['front']]] },
  spikes: { id: 'spikes', place: 'front', pool: 'swimmer', family: 'feed', stamp: 'spikes', name: 'Arm spines', upkeep: 1, does: 'Catch armoured prey without being cut.', homes: [[['swimmer'], ['front']]], beats: ['armour', 'spines'] },
  lenses: { id: 'lenses', place: 'eyes', pool: 'swimmer', family: 'sense', stamp: 'lenses', name: 'Compound eyes', upkeep: 1, does: 'See where prey will flee: tap once to aim, again to go.', homes: [[['swimmer'], ['eyes']]] },
  flap: { id: 'flap', place: 'limbs', pool: 'shared', family: 'move', stamp: 'flap', name: 'Swimming flaps', upkeep: 1, does: '+1 speed.', homes: [[['swimmer'], ['limbs']], [['arthropod'], ['sides']]] },
  fan: { id: 'fan', place: 'tail', pool: 'swimmer', family: 'move', stamp: 'fan', name: 'Tail fan', upkeep: 0, rare: true, does: 'An ambush triples your move instead of doubling it.', homes: [[['swimmer'], ['tail']]] },
  proboscis: { id: 'proboscis', place: 'front', pool: 'worm', family: 'feed', stamp: 'proboscis', name: 'Proboscis', upkeep: 1, verb: 'crush', does: 'Grabs food ahead without moving.', homes: [[['worm'], ['front']]] },
  chaetae: { id: 'chaetae', place: 'sides', pool: 'worm', family: 'move', stamp: 'chaetae', name: 'Bristles', upkeep: 0, verb: 'dash', does: 'Tunnel 1 tile further through mud.', homes: [[['worm'], ['sides']]] },
  sclerite: { id: 'sclerite', place: 'sides', pool: 'worm', family: 'guard', stamp: 'sclerite', name: 'Sclerites', upkeep: 0, verb: 'brace', does: 'Blocks strikes on this side.', homes: [[['worm'], ['sides', 'tail']]], defence: 'armour' },
  tentacles: { id: 'tentacles', place: 'front', pool: 'worm', family: 'feed', stamp: 'tentacles', name: 'Tentacles', upkeep: 1, verb: 'graze', does: 'Sweep mats into your mouth.', homes: [[['worm'], ['front']]], opens: ['mats'] },
  bulb: { id: 'bulb', place: 'tail', pool: 'worm', family: 'feed', stamp: 'bulb', name: 'Burrowing bulb', upkeep: 0, verb: 'dig', does: 'Dig fast through any ground.', homes: [[['worm'], ['tail']]], opens: ['detritus'], defence: 'burrow' },
  compound: { id: 'compound', place: 'eyes', pool: 'shared', family: 'sense', stamp: 'compound', name: 'Compound eye', upkeep: 1, rare: true, does: 'See all hidden food.', homes: [[ART, ['eyes']]] },
  enrol: { id: 'enrol', place: 'tail', pool: 'shared', family: 'guard', stamp: 'enrol', name: 'Enrolment', upkeep: 0, rare: true, does: 'If you stay put, every strike glances off.', homes: [[ART, ['tail']]], defence: 'armour' },
  blood: { id: 'blood', place: 'back', pool: 'shared', family: 'guard', stamp: 'blood', name: 'Blue blood', upkeep: 0, rare: true, does: 'Dead water and low oxygen cost you no oxygen.', homes: [[ART, ['back', 'sides']]] },
  hook: { id: 'hook', place: 'front', pool: 'worm', family: 'feed', stamp: 'hook', name: 'Hooked proboscis', upkeep: 1, rare: true, does: 'Opens shell beds. Grabs food ahead without moving.', homes: [[['worm'], ['front']]], beats: ['armour'] },
  symbiont: { id: 'symbiont', place: 'back', pool: 'worm', family: 'feed', stamp: 'symbiont', name: 'Sulfur symbionts', upkeep: 0, rare: true, does: 'Sulfur mats feed you double.', homes: [[['worm'], ['back', 'sides']]] },
  deep: { id: 'deep', place: 'tail', pool: 'worm', family: 'feed', stamp: 'deep', name: 'Deep burrow', upkeep: 0, rare: true, does: 'In mud: no upkeep, +1 egg per lay.', homes: [[['worm'], ['tail']]], opens: ['detritus'], defence: 'burrow' },
  progenesis: { id: 'progenesis', place: 'back', pool: 'shared', family: 'brood', stamp: 'progenesis', name: 'Progenesis', upkeep: 0, rare: true, does: 'Lay at any size.', homes: [[ALL, ['back', 'sides', 'tail']]] },
};
