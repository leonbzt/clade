// The one fixed palette. Every colour in the game comes from here.

export const PAL = {
  // sea
  seaDeep: '#142a44', sea: '#1d4466', seaLight: '#2b6a8a', foam: '#b6e0e4',
  // beach
  sandDark: '#a3895a', sand: '#c8b07c', sandLight: '#e2cf9c',
  // lava field
  lava0: '#121218', lava1: '#1c1c25', lava2: '#272733', lava3: '#3a3a48', crack: '#09090c',
  vent: '#4a4048', steam: '#dfe4ea',
  // soil, from thin to deep
  soil0: '#33241b', soil1: '#4a3323', soil2: '#64452c', soil3: '#7e5a38',
  // lichen
  lichenGrey: '#8a927a', lichenPale: '#c4c8ac', lichenYellow: '#c4a440', lichenOrange: '#b87436',
  // mosses
  moss0: '#2c4a18', moss1: '#467622', moss2: '#6aa330', moss3: '#a4d650', capsule: '#c86a32', rhizoid: '#6a4428',
  // club mosses
  club0: '#2a4420', club1: '#3e662a', club2: '#5a8a36', club3: '#88b04c', cone: '#d8b648',
  // ferns
  fern0: '#123826', fern1: '#1c5634', fern2: '#2a7444', fern3: '#4fa062', sori: '#8a4e26',
  // ui
  ink: '#140f0b', panelDark: '#271e17', panel: '#3a2d22', panelLight: '#56442f', edge: '#7a6244',
  text: '#f0e6c8', textDim: '#b5a383', gold: '#ecc65a', bad: '#e0644e', good: '#9ad05c',
} as const;

/** Classic tier-list colours. */
export const TIER_COLORS: Record<string, string> = {
  S: '#ff7f7f', A: '#ffbf7f', B: '#ffdf7f', C: '#bfff7f', D: '#7fbfff',
};
