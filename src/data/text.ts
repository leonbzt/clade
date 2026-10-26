// Player-facing text. Functions take the numbers they show.

export const TEXT = {
  coldOpen: 'A new island. Nothing lives here yet.',
  sporeArrives: 'A spore drifts in on the wind and settles by a steam vent.',
  foundHere: 'Found here',
  defaultName: 'Vent tuft',
  letItGrow: 'Let it grow',

  card: {
    title: 'Your species',
    specimen: 'Type specimen',
    home: 'Home',
    fit: 'Fit',
    renameHint: 'Tap the name to rename',
    close: 'Close',
  },

  split: {
    title: 'Energy',
    spread: 'Spread',
    spreadHint: 'new tiles',
    cushion: 'Cushion',
    cushionHint: 'holds water',
    spores: 'Spores',
    sporesHint: 'genes',
  },

  bar: {
    goal: 'Goal',
    genes: 'Genes',
    water: 'Water',
    cover: 'Cover',
    biomass: 'Biomass',
    perSec: '/s',
  },

  weather: {
    warning: (s: number) => `Dry spell in ${s} s`,
    dry: 'Dry spell: the outer tiles are drying out',
    rain: 'Rain: the brown tiles revive',
  },

  goals: {
    cover: (n: number, goal: number) => `Cover ${goal} tiles (${n}/${goal})`,
    mosses: 'Reach Mosses',
    release: 'Release your moss',
    next: 'Found your next species',
  },

  genePool: {
    title: 'Gene pool',
    generation: (n: number) => `Generation ${n}`,
    next: (s: number) => `Next generation in ${s} s`,
    waiting: 'Pick a variant to start the next generation',
    queueFull: 'Queue full: pick a variant',
    variant: (v: string) => `Variant with ${v}`,
    favour: (cost: number) => `Favour · ${cost} genes`,
    pass: 'Pass',
    common: 'common',
    queued: (n: number) => `${n} queued`,
  },

  skill: {
    name: 'Photosynthesis',
    level: (n: number) => `Level ${n}`,
    max: 'max',
  },

  tree: {
    title: 'Tree of life',
    reached: 'reached',
    precursors: (n: number, of: number) => `Precursors ${n} of ${of}`,
    innovation: 'Key innovation',
    locked: (why: string) => `${why} ✗`,
    soilNote: 'The island has no soil yet.',
  },

  release: {
    title: 'Release',
    locked: 'Unlocks at Mosses',
    previewLine: (bps: string, pct: number) => `Release now: ~${bps} biomass/s, ~${pct}% of the lava`,
    open: 'Release…',
    keep: 'You keep',
    reset: 'Resets',
    gain: 'You gain',
    keepItems: (level: number, node: string, traits: number) => [
      `Photosynthesis level ${level}`,
      `The ${node} node`,
      `Every trait found (${traits})`,
    ],
    resetItems: ['Genes', 'The colony in this slot'],
    gainItem: 'Biomass per second, forever',
    now: 'Now',
    plusOne: '+1 generation',
    releaseNow: 'Release now',
    wait: 'Wait a generation',
    skip: 'Skip',
    dispersing: 'Spores lift from home and drift across the island…',
  },

  garden: {
    slotTitle: 'Slot 1',
    nextSpecies: 'Found your next species',
    tapHint: 'Tap the moss to see its card',
  },

  codex: {
    title: 'Codex',
    unverified: '[unverified]',
    sources: 'Sources',
    close: 'Close',
  },

  events: {
    genePoolOpens: 'Goal met: the gene pool opens.',
    homeNudge: 'The dry edge favours drought traits.',
    becameCommon: (name: string) => `${name} is now common.`,
    autoGenerations: 'Photosynthesis level 2: generations now run by themselves.',
    levelUp: (n: number) => `Photosynthesis level ${n}.`,
    treeOpens: 'The tree of life opens. Goal: reach Mosses.',
    fitShows: 'Fit now shows on the species card.',
    keyInnovation: (name: string) => `A new mutation: ${name}!`,
    reached: (node: string) => `${node} reached!`,
    released: 'Released. The garden grows by itself.',
  },
};
