// W1's contract: the organism model. A build is a point in its clade's dial space; a real species is a named point.
// Nothing here names a clade or a species: rows live in data/roster/. These shapes change only on the user's call.

export type Id = string;
export type Realm = 'sea' | 'shore' | 'land';
export type Ground = 'sand' | 'mud' | 'rock'; // on land: sand is the strand, mud is soil, rock is lava
/** Where a clade feeds: on a ground, or in the open water above it (as far as the kind has any). */
export type Range = Ground | 'water';
export type FoodId = 'mats' | 'plankton' | 'detritus' | 'greens' | 'seeds' | 'litter';
/** What a clade eats: a food stock, other populations, or light (a producer). */
export type Diet = FoodId | 'prey' | 'light';
/** A job is one cell of a habitat: the producer's place, one per food stock, and two hunts (prey, then the hunter). */
export type JobId = FoodId | 'light' | 'hunt' | 'hunt2';
export type GuardKind = 'shell' | 'spines' | 'hiding' | 'fleeing' | 'toxin';
/** Law 7. `water` lives under water, `diving` feeds there on held breath, `tide` sits out low tide shut,
 *  `salt` stands salt spray, `dry` holds water in air. A habitat kind needs one of each group it lists. */
export type AdaptationId = 'water' | 'diving' | 'air' | 'tide' | 'salt' | 'walking' | 'clinging' | 'rooted' | 'dry';
/** The five shared axes (*decided 15 Nov*). A clade shows `size` and at most two more, under its own words. */
export type DialId = 'size' | 'bite' | 'guard' | 'speed' | 'brood';
export type StatId = 'bite' | 'guard' | 'speed' | 'senses' | 'brood';
export type Letter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type Grade = 'drafted' | 'researched' | 'measured' | 'hand';
export type Trait = 'mass' | 'diet' | 'realm' | 'guard' | 'dials';

/** One dial of a clade. `size` is log10 of grams; the others are stat points added to the clade's base. */
export interface DialSpec { id: DialId; min: number; max: number; word: string }

export interface Clade {
  id: Id; ott: number /* 0 until W3 looks it up */; parent: Id | null /* the tree comes in W3 */;
  name: string; plan: Id;
  life: 'forage' | 'hunt' | 'dig' | null; // null: a board piece (a producer or sessile life)
  diet: Diet[]; ground: Range[]; adaptations: AdaptationId[];
  guard: GuardKind | null; beats: GuardKind[];
  base: Record<StatId, number>; // stat points before dials, 0–4
  makes?: Partial<Record<FoodId, number>>; // a producer only: grams per tile at full light (law 5)
  mechanic: Id; // read by the Life from W2 on; card text in W1
  dials: DialSpec[]; // size first; three at most
  mutations: Id[]; // six at most
}

/** The genome: this and no more. */
export interface Build { clade: Id; dials: Partial<Record<DialId, number>>; mutations: Id[] }

export interface Named {
  id: Id; ott: number; name: string; common: string; build: Build;
  home: string; // where it really lives: card text, never a rule
  src: Record<Trait, Grade>;
}

/** look: yours to collect, no rule. push: a dial past its range, at an upkeep cost. key: an adaptation. */
export interface Mutation {
  id: Id; kind: 'look' | 'push' | 'key'; name: string; does: string;
  dial?: DialId; by?: number; cost?: number; grants?: AdaptationId;
}

export interface Food { id: FoodId; name: string; verb: string; tough: number; gut?: number }

export interface HabitatKind {
  id: Id; name: string; realm: Realm; ground: Ground;
  light: number; // 0–1: what a producer's yield is multiplied by
  water: number; // 0–1: how much open water stands above the ground, for clades that feed in it
  deaths: number; // law 1's other side: the share lost a generation to waves, drying and cold
  edge: boolean; // the tide line: where air breathing shows up
  needs: AdaptationId[][]; // law 7: one of each group
  base: Partial<Record<FoodId, number>>; // grams per tile with no producer
}

/** A population on a job, as the laws read it. */
export interface Pop { build: Build; job: JobId; grams: number }
/** One habitat as the laws read it. W2 fills this from the game's Habitat. */
export interface Site { kind: HabitatKind; area: number; pops: Pop[] }

/** The six stats, derived and never stored. `thrift` comes from mass alone. */
export interface Stats { bite: number; thrift: number; defence: number; speed: number; senses: number; brood: number }

export interface Fitness {
  intake: number; upkeep: number; survival: number; value: number; letter: Letter;
  /** Grams this build would stand at on the job, and how many animals that is. */
  grams: number; heads: number;
  /** The hunters here that eat it, worst first. */
  by: Build[];
  reasons: [string, string, string]; // intake, upkeep, survival: one cause each
}
