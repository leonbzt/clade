// Creating a fresh game and a fresh colony.
import { NUMBERS } from '../data/numbers';
import { TEXT } from '../data/text';
import { TRAITS, type TraitId } from '../data/traits';
import { START_NODE } from '../data/tree';
import { hexDistance, hexesWithin } from './hex';
import type { Colony, GameState, GenePool, Tile } from './types';

export function createGenePool(): GenePool {
  return {
    open: false,
    freq: Object.fromEntries(TRAITS.map((t) => [t.id, t.startFreq])) as Record<TraitId, number>,
    generation: 0,
    timer: 0,
    offers: [],
    favours: 0,
    nextOfferId: 1,
  };
}

export function createTiles(): Tile[] {
  const radius = NUMBERS.patch.radius;
  const origin = { q: 0, r: 0 };
  return hexesWithin(radius).map((h) => {
    const ring = hexDistance(h, origin);
    return { ...h, ring, dampness: 1 - ring / (radius + 1), covered: ring === 0, brown: false, recovery: 1 };
  });
}

export function createColony(): Colony {
  const d = NUMBERS.drySpell;
  return {
    age: 0,
    tiles: createTiles(),
    split: { ...NUMBERS.split.start },
    energy: 0,
    spreadStore: 0,
    water: 0,
    weather: { state: 'calm', nextSpellAt: d.firstAt, spellStart: 0, stress: 0, spells: 0 },
  };
}

export function createGame(seed: number = NUMBERS.sim.seed): GameState {
  return {
    t: 0,
    phase: 'intro',
    phaseTime: 0,
    rng: seed,
    speciesName: TEXT.defaultName,
    genes: 0,
    colony: null,
    genePool: createGenePool(),
    skill: { xp: 0, level: 1 },
    reached: [START_NODE],
    traitsFound: [],
    reveal: { tree: false, fit: false, releasePreview: false },
    garden: { species: [], biomass: 0 },
    events: [],
    codexOpen: null,
  };
}

export function setPhase(s: GameState, phase: GameState['phase']): void {
  s.phase = phase;
  s.phaseTime = 0;
}

const MAX_EVENTS = 40;

export function logEvent(s: GameState, text: string): void {
  s.events.push({ t: s.t, text });
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS);
}
