// Seeded clutch rolls, adapted from game/src/sim/clutch.ts to the N3 gain/swap/lose rules.
import { CLUTCH } from '../data/clutch';
import { PARTS, PLACES } from '../data/parts';
import type { resultOf } from './economy';
import type { Build, PartId, Place, Ranks, Species } from './records';
import { seeded, type Rng } from './rng';

export type CardKind = keyof typeof CLUTCH.kinds;
export interface Card { kind: CardKind; part: PartId; place: Place }
type Result = NonNullable<ReturnType<typeof resultOf>>;

export const clutchSize = (eggs: number) => eggs <= 0 ? 0 : eggs < CLUTCH.largeAt ? CLUTCH.small : CLUTCH.large;

export function clutchWeight(enforced: Ranks, part: PartId): number {
  const ranks = (Object.keys(enforced) as PartId[]).reduce((total, id) =>
    total + (PARTS[id].family === PARTS[part].family ? enforced[id] ?? 0 : 0), 0);
  return CLUTCH.baseWeight * CLUTCH.enforced ** ranks;
}

function pick<T>(pool: T[], weight: (entry: T) => number, rng: Rng): T {
  let roll = rng() * pool.reduce((total, entry) => total + weight(entry), 0);
  for (const entry of pool) {
    roll -= weight(entry);
    if (roll < 0) return entry;
  }
  return pool[pool.length - 1];
}

/** Counts include the sure mutation. Other cards are independent rolls, as in the original clutch. */
export function rollClutch(result: Result, species: Species, seed: number): Card[] {
  const count = clutchSize(result.eggs), cards: Card[] = [];
  if (!count) return cards;
  if (result.mutation && result.eggsAfter > 0) cards.push({ kind: 'gain', ...result.mutation });

  const pools: Record<CardKind, Card[]> = { gain: [], swap: [], lose: [] };
  for (const part of Object.values(PARTS)) {
    if (part.rare || !part.plans.includes(species.build.clade)) continue;
    const carried = species.build.parts[part.place];
    if (carried === part.id || cards.some((card) => card.part === part.id)) continue;
    const kind = carried === undefined ? 'gain' : 'swap';
    pools[kind].push({ kind, part: part.id, place: part.place });
  }
  for (const place of PLACES) {
    const part = species.build.parts[place];
    if (part) pools.lose.push({ kind: 'lose', part, place });
  }

  // Pick the kind before its part: a larger gain pool must not make gains more likely than losses.
  const kinds = (Object.keys(pools) as CardKind[]).filter((kind) => pools[kind].length);
  const rng = seeded(seed);
  while (cards.length < count && kinds.length) {
    const kind = pick(kinds, (k) => CLUTCH.kinds[k], rng);
    const card = pick(pools[kind], (c) => clutchWeight(result.enforced, c.part), rng);
    cards.push({ ...card });
  }
  return cards;
}

/** Apply exactly one change to an independent heir build; the parent's form and genes stay intact. */
export function heirBuild(build: Build, card: Card): Build {
  const heir = { ...build, parts: { ...build.parts }, genes: { ...build.genes } };
  if (card.kind === 'lose') delete heir.parts[card.place];
  else heir.parts[card.place] = card.part;
  return heir;
}
