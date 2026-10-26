// Placeholder look: palette and sizes for the island and patch views. The art spikes replace this.

export const PALETTE = {
  sea: '#56616a',
  seaFoam: '#6d7880',
  lava: '#1c1b1c',
  lavaEdge: '#2a2829',
  lavaDamp: '#3b4650', // wet-looking lava near the vent
  beach: '#3e3833',
  beachEdge: '#4a433d',
  moss: '#8c9c6c', // grey-green garden moss
  mossEdge: '#7a8a5c',
  colony: '#6fa04a', // a green colony tile
  colonyDamp: '#7fb356',
  brown: '#8b6b3e',
  recovering: '#8a8f48',
  steam: '#e9edf0',
  spore: '#d8e0b8',
  warning: '#d9a441',
  dry: '#c98a3a',
  rain: '#7fa7c9',
  // type specimen
  thread: '#79a84f',
  threadDry: '#a3a253',
  leaf: '#5f9a3f',
  leafDry: '#8f9a45',
  rhizoid: '#7a5a3a',
  hair: '#f2f2ea',
  seta: '#a2553a',
  capsule: '#7b3e2a',
  ground: '#3a3330',
};

export const VIEW = {
  patchHexSize: 22,
  islandHexSize: 13,
  sporeParticles: 70,
  toastSeconds: 6, // real seconds a message stays up
  previewRefresh: 1, // real seconds between "+1 generation" previews
  maxFrameSeconds: 1, // real time per frame is capped at this (a slept tab does not jump), before the speed multiplier
};
