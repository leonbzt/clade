import type { TraitId } from '../data/traits';
import type { NodeId } from '../data/tree';
import type { NicheId, Tier } from '../data/niches';

export type Phase = 'intro' | 'arrival' | 'colony' | 'dispersal' | 'garden';

export interface Hex {
  q: number;
  r: number;
}

export interface Tile extends Hex {
  ring: number; // distance from the vent
  dampness: number; // 1 at the vent, lower further out
  covered: boolean;
  brown: boolean; // dried out: produces nothing until rain. Never removed.
  recovery: number; // 0..1, energy share while it greens up again after rain
}

export interface Split {
  spread: number;
  cushion: number;
  spores: number;
}

export type WeatherState = 'calm' | 'warning' | 'dry' | 'rain';

export interface Weather {
  state: WeatherState;
  nextSpellAt: number; // colony time
  spellStart: number; // colony time of the current or last spell
  stress: number; // 0..peak
  spells: number; // spells started so far
}

export interface Offer {
  id: number;
  variants: TraitId[];
}

export interface GenePool {
  open: boolean;
  freq: Record<TraitId, number>;
  generation: number; // generations completed
  timer: number; // seconds into the current generation
  offers: Offer[]; // first is shown
  favours: number; // favours made, sets the cost
  nextOfferId: number;
}

export interface Colony {
  age: number; // colony time
  tiles: Tile[];
  split: Split;
  energy: number; // total produced, for stats
  spreadStore: number; // energy waiting to buy the next tile
  water: number;
  weather: Weather;
}

export interface Skill {
  xp: number;
  level: number;
}

export interface GardenCell extends Hex {
  niche: NicheId;
  order: number; // fill order for this niche (0 fills first)
}

export interface GardenSpecies {
  name: string;
  traits: TraitId[]; // common at release
  fit: Record<NicheId, Tier>;
  share: Record<NicheId, number>; // target share of each niche
  fill: number; // 0..1, logistic growth toward the shares
  biomassPerSec: number; // at full fill
}

export interface Garden {
  species: GardenSpecies[];
  biomass: number;
}

export interface GameEvent {
  t: number;
  text: string;
}

export interface Reveal {
  tree: boolean;
  fit: boolean;
  releasePreview: boolean;
}

export interface GameState {
  t: number; // total sim seconds
  phase: Phase;
  phaseTime: number; // seconds in the current phase
  rng: number; // seeded RNG state
  speciesName: string;
  genes: number;
  colony: Colony | null;
  genePool: GenePool;
  skill: Skill;
  reached: NodeId[];
  traitsFound: TraitId[]; // every trait ever common, kept on release
  reveal: Reveal;
  garden: Garden;
  events: GameEvent[]; // newest last
  codexOpen: NodeId | null; // a codex card waiting to be read
}
