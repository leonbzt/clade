// Animals as data: the same species entry as plants (name, needs as bands, trait genes, a blurb) plus a body: what
// it eats, what it leaves behind, how it moves and breeds. In the sim every animal is an individual (agents.ts); a
// swarm is one agent that stands for a small group. Food goes through stocks, plant cover and tags, so animals never
// name each other: a new animal or a new food cycle is a new entry here.
// Grams (bodies.ts): a member stands for `stands` real animals per m² of tile, so its body is MASS × stands × the
// tile's m². It burns B × upkeep × stands × mass^0.75 g/s, eats up to `appetite` × that, keeps `keep` of what it eats
// and drops the rest as dung (litter). Its store e (0–1) holds up to `store` × its body. Rates are per second.
// Nitrogen (nitrogen.ts): a body is ANIMAL_N of its grams; dung carries the food's nitrogen minus what it keeps, and
// what it burns goes back to the soil.
import { ofFall, type StratumId } from './fields';
import type { SpeciesDef, Trait } from './species';

/** Body numbers that genes can change (×). */
export type BodyStat = 'speed' | 'gain' | 'upkeep' | 'life' | 'young' | 'escape' | 'range';

export type Food =
  // eats litter: it feeds fully where the litter is at `full` (layer units, default ofFall(0.03)), less below
  | { stock: 'litter'; share?: number; keep?: number; full?: number }
  | { plants: StratumId; share?: number; keep?: number } // grazes a stratum (× the plant's palatability and cover)
  | { prey: string; rate: number; keep?: number }; // hunts agents with this tag: tries per second
// `share`: the part of its appetite this food can fill (default 1; side foods also × `range`). `keep`: the share of
// the grams it keeps (default ANIMAL.keep).

export type AnimalBody = Record<BodyStat, number> & {
  tag: string; // what others hunt it as
  group: number; // 1: one animal; more: a group (family, swarm) that splits in two at this size
  kin: string; // what a group is called: family, swarm, troop ('' for single animals)
  stands: number; // real animals one member stands for, per m² of tile
  store: number; // a full store, × the body mass (a single animal needs ~3 to make a young as big as itself)
  appetite: number; // grams eaten per second at most, × the burn
  pace: number; // ticks between updates, like a metabolism: fast animals react often, slow ones rarely
  bite: number; // members a hunter takes from a swarm at once (at most; it takes what it can eat)
  sight: number; // tiles it looks around for food
  breedAt: number; // store it needs before it breeds
  diet: Food[]; // the first is its main food; the others give `range` × as much
  cap: number; // groups, a safety net per species; food should be the real limit
  size: number; // px on the map
};

type AnimalEntry = Pick<SpeciesDef, 'id' | 'name' | 'short' | 'needs' | 'tolerance' | 'blurb'> & { traits: Trait[]; body: AnimalBody };

/** Nitrogen in an animal's live grams (~30% dry, ~10% of that nitrogen). */
export const ANIMAL_N = 0.025;

/** The plant numbers don't apply to animals; they stay at 0. */
const animal = (d: AnimalEntry): SpeciesDef => ({
  id: d.id, name: d.name, short: d.short, needs: d.needs, tolerance: d.tolerance, traits: d.traits, blurb: d.blurb,
  stratum: 'ground', seeds: 0, hold: 0, yield: 0, life: d.body.life, grow: 0, renew: 0, reserve: 1, makes: {}, animal: d.body, n: ANIMAL_N,
});

const band = (a: number, b: number, c: number, d: number) => [a, b, c, d] as const;

const snailBody: AnimalBody = {
  tag: 'snail', group: 12, kin: 'family', stands: 20, store: 2, appetite: 30, pace: 4, bite: 1, size: 3, speed: 0.15, life: 700,
  upkeep: 1, gain: 1, young: 2, escape: 1, range: 0.5, sight: 3, breedAt: 0.85, cap: 80,
  diet: [{ plants: 'ground' }, { stock: 'litter', share: 0.13 }],
};

const springtailBody: AnimalBody = {
  tag: 'tiny-hexapod', group: 200, kin: 'swarm', stands: 2400, store: 1, appetite: 8, pace: 2, bite: 6, size: 1, speed: 0.35,
  life: 400, upkeep: 0.042, gain: 1, young: 24, escape: 1, range: 0.5, sight: 3, breedAt: 0.75, cap: 120,
  // Mainly fungus threads (real: springtails graze hyphae), rot as a side dish: litter → fungi → springtails → hunters.
  diet: [{ plants: 'under' }, { stock: 'litter', share: 0.78, full: ofFall(0.1) }],
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
    needs: { water: band(0.42, 0.62, 1, 1.3) },
    blurb: 'Snails that lost their shell. Cheaper to keep and less picky: liverworts, fungus and fresh rot in wet seeps. But they dry out fast and have nowhere to hide.',
    traits: [
      { id: 'slime', name: 'Sealing slime', up: 'lives 0.1 drier', down: 'costs 10% more to keep', mods: [{ need: 'water', low: -0.1 }, { body: 'upkeep', mul: 1.1 }] },
      { id: 'quick', name: 'Quick breeder', up: '50% more young', down: 'lives 30% shorter', mods: [{ body: 'young', mul: 1.5 }, { body: 'life', mul: 0.7 }] },
    ],
    // A small wet niche: cheaper than a snail, and fungus and fresh rot on the side.
    body: { ...snailBody, tag: 'snail', stands: 8, appetite: 10, pace: 3, speed: 0.22, young: 3, upkeep: 1.13, escape: 1.3, life: 500, range: 0.7,
      diet: [{ plants: 'ground' }, { plants: 'under', share: 0.53 }, { stock: 'litter', share: 0.36, full: ofFall(0.02) }] },
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
    body: { ...springtailBody, group: 10, kin: 'troop', stands: 500, store: 2.5, appetite: 5, upkeep: 0.28, bite: 2, size: 2, speed: 0.6,
      young: 2, breedAt: 0.8, cap: 60,
      diet: [{ stock: 'litter', full: ofFall(0.1) }, { plants: 'ground', share: 1.25 }] },
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
      tag: 'beetle', group: 1, kin: '', stands: 29, store: 3, appetite: 2.7, pace: 1, bite: 1, size: 3, speed: 0.5, life: 900,
      upkeep: 0.71, gain: 1, young: 1, escape: 1, range: 0.5, sight: 5, breedAt: 0.85, cap: 40,
      // Ground beetles also scavenge: rot and dead things keep them going between catches.
      diet: [{ prey: 'tiny-hexapod', rate: 0.1 }, { prey: 'snail', rate: 0.05 }, { stock: 'litter' }],
    },
  }),
];

/** Numbers for all animals. */
export const ANIMAL = {
  // The burn: B × upkeep × stands × mass^0.75 g/s per member. Real mass^0.75 makes a springtail burn 12× a snail's
  // grams per gram; the species' `upkeep` slows the small ones back to one game pace (a full store lasts ~250 s).
  B: 0.0095,
  keep: { plants: 0.3, prey: 0.8 }, // the share of what it eats that it keeps (plants and litter, prey)
  stress: 1.5, // burn × (1 + stress × (1 − fit))
  restAt: 0.95, // store above which it rests instead of eating
  rest: 0.6, // burn while resting
  think: 1.5, // seconds between looking around for a better spot
  settledSlow: 3, // a settled group (fed, calm, not crowded) updates this many times less often
  calmAfter: 30, // seconds after a hunter came by before a group counts as calm again
  merge: 0.5, // two groups of one variant on a tile merge while together under this share of the split size
  disperse: [4, 10] as [number, number], // tiles the half that splits off walks away before it settles
  handling: 8, // seconds a hunter rests after a full catch (0.2 of its store); less for less
  refuge: 0.6, // thick ground cover cuts a hunter's chance by up to this share
  hunters: 2, // a hunter doesn't hunt on a tile with this many of its kind (territory)
  look: 8, // tiles it samples each time
  moveBelow: 0.3, // it moves on when it keeps less than this share of what full food would give
  crowd: 3, // no breeding with this many of its own species on the tile
  adultAt: 0.08, // share of its life before it can breed
  mutate: 0.05, // chance a newborn carries a mutation, if its parent's variant is shown (a group: per young)
  budMax: 0.1, // a group's chance per breeding that its young bud off as a mutant line
  youngEnergy: 0.2, // a newborn's store (single animals; the parent pays it and the young's body)
  minGrazed: 0.03, // a plant grazed below this cover dies
  wound: 0.4, // health a plant loses per full cover grazed
  repeat: 180, // seconds between repeat arrivals of an adopted species
  repeatBelow: 2, // they come only while the species has fewer members than this × its arrival
  founders: 4, // a split's founder group (members; at least half a group)
  log: 5, // events each animal remembers
  obits: 40, // deaths remembered, for the card of an animal you followed
};
