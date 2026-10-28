// Animals as data: the same species entry as plants (name, needs as bands, trait genes, a blurb) plus a body: what
// it eats, what it leaves behind, how it moves and breeds. In the sim every animal is an individual (agents.ts); a
// swarm is one agent that stands for a small group. Food goes through stocks, plant cover and tags, so animals never
// name each other: a new animal or a new food cycle is a new entry here.
// Energy is 0–1 (a full store). Rates are per second.
import type { LayerId, StratumId } from './fields';
import type { SpeciesDef, Trait } from './species';

/** Body numbers that genes can change (×). */
export type BodyStat = 'speed' | 'gain' | 'upkeep' | 'life' | 'young' | 'escape' | 'range';

export type Food =
  | { stock: LayerId; rate: number; gain: number } // eats a stock: units per member per second, energy per unit
  | { plants: StratumId; rate: number; gain: number } // grazes cover (× the plant's palatability), energy per cover
  | { prey: string; rate: number; gain: number }; // hunts agents with this tag: tries per second, energy per member eaten

export type AnimalBody = Record<BodyStat, number> & {
  tag: string; // what others hunt it as
  group: number; // 1: one animal; more: a swarm that splits in two at this size
  bite: number; // members a hunter takes from a swarm at once
  sight: number; // tiles it looks around for food
  breedAt: number; // energy it needs before it breeds
  diet: Food[]; // the first is its main food; the others give `range` × as much
  makes: Partial<Record<LayerId, number>>; // per unit of food eaten: dung and frass
  corpse: number; // litter left when it dies, per member
  yield: number; // biomass per unit of food eaten
  cap: number; // a safety net per species; food should be the real limit
  size: number; // px on the map
};

type AnimalEntry = Pick<SpeciesDef, 'id' | 'name' | 'short' | 'needs' | 'tolerance' | 'blurb'> & { traits: Trait[]; body: AnimalBody };

/** The plant numbers don't apply to animals; they stay at 0. */
const animal = (d: AnimalEntry): SpeciesDef => ({
  id: d.id, name: d.name, short: d.short, needs: d.needs, tolerance: d.tolerance, traits: d.traits, blurb: d.blurb,
  stratum: 'ground', seeds: 0, hold: 0, yield: 0, life: d.body.life, grow: 0, reserve: 1, litter: 0, makes: {}, animal: d.body,
});

const band = (a: number, b: number, c: number, d: number) => [a, b, c, d] as const;

const snailBody: AnimalBody = {
  tag: 'snail', group: 1, bite: 1, size: 3, speed: 0.15, life: 700, upkeep: 0.004, gain: 1, young: 2, escape: 1, range: 0.5,
  sight: 3, breedAt: 0.85, corpse: 0.02, yield: 0.6, cap: 400,
  diet: [{ plants: 'ground', rate: 0.2, gain: 0.075 }, { stock: 'litter', rate: 0.001, gain: 2 }],
  makes: { nitrogen: 0.05 },
};

const springtailBody: AnimalBody = {
  tag: 'tiny-hexapod', group: 24, bite: 4, size: 1, speed: 0.35, life: 400, upkeep: 0.004, gain: 1, young: 4, escape: 1, range: 0.5,
  sight: 3, breedAt: 0.75, corpse: 0.002, yield: 0.5, cap: 300,
  diet: [{ stock: 'litter', rate: 0.00012, gain: 55 }, { plants: 'under', rate: 0.0006, gain: 8 }],
  makes: { nitrogen: 0.4 },
};

export const ANIMALS: SpeciesDef[] = [
  animal({
    id: 'snail', name: 'Land snails', short: 'Snail', tolerance: { salty: 0.4 },
    needs: { water: band(0.3, 0.5, 1, 1.3) },
    blurb: 'Slow grazers that rasp at mosses and crusts with a tongue full of tiny teeth. They need it damp, and carry their shelter on their back.',
    traits: [
      { id: 'thick', name: 'Thick shell', up: 'half as easy to catch', down: 'moves 20% slower', mods: [{ body: 'escape', mul: 0.5 }, { body: 'speed', mul: 0.8 }] },
      { id: 'slime', name: 'Sealing slime', up: 'lives 0.1 drier', down: 'costs 10% more to keep', mods: [{ need: 'water', low: -0.1 }, { body: 'upkeep', mul: 1.1 }] },
    ],
    body: snailBody,
  }),
  animal({
    id: 'slug', name: 'Slugs', short: 'Slug', tolerance: { salty: 0.2 },
    needs: { water: band(0.38, 0.6, 1, 1.3) },
    blurb: 'Snails that lost their shell. Quicker and cheaper to build, but they dry out fast and have nowhere to hide.',
    traits: [
      { id: 'slime', name: 'Sealing slime', up: 'lives 0.1 drier', down: 'costs 10% more to keep', mods: [{ need: 'water', low: -0.1 }, { body: 'upkeep', mul: 1.1 }] },
      { id: 'quick', name: 'Quick breeder', up: '50% more young', down: 'lives 30% shorter', mods: [{ body: 'young', mul: 1.5 }, { body: 'life', mul: 0.7 }] },
    ],
    body: { ...snailBody, tag: 'snail', speed: 0.22, young: 3, upkeep: 0.0045, escape: 1.3, life: 500 },
  }),
  animal({
    id: 'springtail', name: 'Springtails', short: 'Springtail', tolerance: { salty: 0.5 },
    needs: { water: band(0.22, 0.42, 1, 1.3) },
    blurb: 'Tiny six-legged animals that eat rot and fungus threads. A forked tail snaps them away from danger. Among the first animals on any new land.',
    traits: [
      { id: 'cuticle', name: 'Hard skin', up: 'lives 0.1 drier', down: '15% fewer young', mods: [{ need: 'water', low: -0.1 }, { body: 'young', mul: 0.85 }] },
      { id: 'furcula', name: 'Long spring', up: 'half as easy to catch', down: 'gains 10% less', mods: [{ body: 'escape', mul: 0.5 }, { body: 'gain', mul: 0.9 }] },
    ],
    body: springtailBody,
  }),
  animal({
    id: 'bristletail', name: 'Bristletails', short: 'Bristletail', tolerance: { salty: 0.5 },
    needs: { water: band(0.12, 0.3, 0.8, 1.1) },
    blurb: 'The first true insects: wingless, quick, with three bristles at the tail. They graze crusts and rot on dry rock.',
    traits: [
      { id: 'scales', name: 'Slippery scales', up: 'a third harder to catch', down: 'moves 10% slower', mods: [{ body: 'escape', mul: 0.66 }, { body: 'speed', mul: 0.9 }] },
    ],
    body: { ...springtailBody, group: 1, size: 2, speed: 0.6, young: 2, breedAt: 0.8, cap: 300,
      diet: [{ stock: 'litter', rate: 0.0012, gain: 3.5 }, { plants: 'ground', rate: 0.05, gain: 0.1 }] },
  }),
  animal({
    id: 'beetle', name: 'Ground beetles', short: 'Beetle', tolerance: { salty: 0.5 },
    needs: { water: band(0.1, 0.25, 0.85, 1.2) },
    blurb: 'Shiny night hunters that run down springtails, crack snails with strong jaws, and scavenge when hunting is poor. They wash up on driftwood.',
    traits: [
      { id: 'legs', name: 'Long legs', up: 'runs 30% faster', down: 'costs 15% more to keep', mods: [{ body: 'speed', mul: 1.3 }, { body: 'upkeep', mul: 1.15 }] },
      { id: 'jaws', name: 'Snail jaws', up: 'gets 80% more from snails', down: 'gains 10% less', mods: [{ body: 'range', mul: 1.8 }, { body: 'gain', mul: 0.9 }] },
    ],
    body: {
      tag: 'beetle', group: 1, bite: 1, size: 3, speed: 0.5, life: 900, upkeep: 0.004, gain: 1, young: 1, escape: 1, range: 0.5,
      sight: 5, breedAt: 0.85, corpse: 0.02, yield: 2, cap: 120,
      // Ground beetles also scavenge: rot and dead things keep them going between catches.
      diet: [{ prey: 'tiny-hexapod', rate: 0.1, gain: 0.04 }, { prey: 'snail', rate: 0.05, gain: 0.6 }, { stock: 'litter', rate: 0.0008, gain: 4 }],
      makes: { nitrogen: 0.3 },
    },
  }),
];

/** Numbers for all animals. */
export const ANIMAL = {
  stress: 1.5, // upkeep × (1 + stress × (1 − fit))
  restAt: 0.95, // energy above which it rests instead of eating
  rest: 0.6, // upkeep while resting
  think: 1.5, // seconds between looking around for a better spot
  look: 8, // tiles it samples each time
  crowd: 3, // no breeding with this many of its own species on the tile
  adultAt: 0.08, // share of its life before it can breed
  mutate: 0.05, // chance a newborn (or a split-off swarm) carries a mutation, if its parent's variant is shown
  youngEnergy: 0.35, // a newborn's store
  breedCost: 0.2, // per young (a swarm pays it once)
  minGrazed: 0.03, // a plant grazed below this cover dies
  wound: 0.4, // health a plant loses per cover grazed
  repeat: 180, // seconds between repeat arrivals of an adopted species
  repeatBelow: 2, // they come only while the species has fewer than this × its arrival group
  founders: 4, // a split's founder group
  log: 5, // events each animal remembers
  obits: 40, // deaths remembered, for the card of an animal you followed
};
