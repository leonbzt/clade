// Toy 4 data: tuning, genes, combos, skill levels and goals. Throwaway toy (slice 02).

export const W = 56, H = 36, CELL = 14;

export const T = {
  tickMs: 100,
  genTicks: 400, // a generation: drops refill and a gene offer appears
  ventRadius: 15,
  crackShare: 0.1,
  crackMoisture: 0.3,
  sandCols: 5, // the last columns are beach
  sandMoisture: 0.45,
  ashPockets: 7, // 2×2 rich ash; covering one gives a drop
  ashMoisture: 0.15,
  lichenPatches: 5,
  lichenRadius: 3.5,
  dampAt: 0.5, // hint numbers count neighbours at least this damp
  uptake: 0.03,
  evap: 0.012,
  evapDry: 0.02,
  dryUptake: 0.5,
  rain: 0.4,
  brownAt: 0.08,
  reviveAt: 0.3,
  growth: 0.01,
  spreadChance: 0.025,
  phases: { wet: 450, warn: 100, dry: 200 },
  dewChance: 0.0002,
  dewWarnBoost: 4,
  sporeChance: 0.0002,
  itemLife: 150,
  dewSplash: 3,
  dewWater: 0.6,
  drops: { start: 3, perGen: 2, cap: 6, range: 3 },
  reveal: 2,
  sense: 1, // hidden ash glints within reveal + sense of the colony
  lichen: { spread: 0.0005, maxMoisture: 0.5, take: 4, takeChance: 0.02 },
  surround: 5, // green moss neighbours needed to take a lichen tile
  surroundChance: 0.03,
  overgrowEvery: 5,
  collectRadius: 1.3, // tiles, when sliding
};

export type Mods = {
  spread: number; evap: number; hold: number; growth: number;
  dropsPerGen: number; dropRange: number; reveal: number; sense: number; surround: number;
  dewMul: number; dewWater: number;
  turf: boolean; cloud: boolean; overgrow: boolean; mist: boolean; autoDew: boolean;
};

export function baseMods(): Mods {
  return {
    spread: 1, evap: 1, hold: 1, growth: 1,
    dropsPerGen: T.drops.perGen, dropRange: T.drops.range, reveal: T.reveal, sense: T.sense, surround: T.surround,
    dewMul: 1, dewWater: T.dewWater,
    turf: false, cloud: false, overgrow: false, mist: false, autoDew: false,
  };
}

export type Gene = { id: string; name: string; up: string; down: string; apply: (m: Mods) => void };
export const GENES: Gene[] = [
  { id: 'rhizoids', name: 'Rhizoids', up: 'loses 25% less water', down: 'spreads 20% slower',
    apply: (m) => { m.evap *= 0.75; m.spread *= 0.8; } },
  { id: 'cushion', name: 'Cushion growth', up: 'holds 50% more water', down: 'spreads 25% slower',
    apply: (m) => { m.hold *= 1.5; m.spread *= 0.75; } },
  { id: 'wind', name: 'Wind spores', up: 'drops reach 3 tiles further', down: 'loses 15% more water',
    apply: (m) => { m.dropRange += 3; m.evap *= 1.15; } },
  { id: 'capsule', name: 'Stalked spore capsule', up: '+1 drop per generation', down: 'grows 20% slower',
    apply: (m) => { m.dropsPerGen += 1; m.growth *= 0.8; } },
  { id: 'creeping', name: 'Creeping shoots', up: 'spreads 60% faster', down: 'loses 30% more water',
    apply: (m) => { m.spread *= 1.6; m.evap *= 1.3; } },
  { id: 'acid', name: 'Acid tips', up: 'takes lichen with 4 moss around, not 5', down: 'grows 20% slower',
    apply: (m) => { m.surround -= 1; m.growth *= 0.8; } },
  { id: 'scout', name: 'Long rhizoids', up: 'reveals 2 tiles further', down: 'spreads 15% slower',
    apply: (m) => { m.reveal += 2; m.spread *= 0.85; } },
  { id: 'dew', name: 'Dew catchers', up: 'twice the dew, 50% more water from it', down: 'holds 20% less water',
    apply: (m) => { m.dewMul *= 2; m.dewWater *= 1.5; m.hold *= 0.8; } },
];

export type Combo = { name: string; needs: [string, string]; text: string; apply: (m: Mods) => void };
export const COMBOS: Combo[] = [
  { name: 'Turf mat', needs: ['rhizoids', 'cushion'], text: 'lichen can no longer take your brown moss',
    apply: (m) => { m.turf = true; } },
  { name: 'Spore cloud', needs: ['wind', 'capsule'], text: 'each drop seeds a plus of 5 tiles',
    apply: (m) => { m.cloud = true; } },
  { name: 'Overgrow', needs: ['creeping', 'acid'], text: `every ${T.overgrowEvery} lichen tiles taken give a drop`,
    apply: (m) => { m.overgrow = true; } },
  { name: 'Morning mist', needs: ['scout', 'dew'], text: 'collecting dew reveals 2 tiles around it',
    apply: (m) => { m.mist = true; } },
];

/** The character skill. Levels come from tiles covered. */
export const SKILL = {
  name: 'Spreading',
  xp: [0, 40, 120, 300, 700],
  perks: ['', 'reveals 1 tile further', '+1 drop per generation', 'dew collects itself', 'senses ash 2 tiles further'],
  apply(level: number, m: Mods) {
    if (level >= 2) m.reveal += 1;
    if (level >= 3) m.dropsPerGen += 1;
    if (level >= 4) m.autoDew = true;
    if (level >= 5) m.sense += 2;
  },
};

export const GOALS = [
  { id: 'beach', text: 'Reach the beach' },
  { id: 'ash', text: 'Find 3 ash pockets' },
  { id: 'lichen', text: 'Take 25 lichen tiles' },
] as const;
export type GoalId = (typeof GOALS)[number]['id'];
