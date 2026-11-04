// The run's look (slice 02, 2D low-poly): the Teal palette as ramps, dark → light, and the view's few numbers.
export type RampId = 'sky' | 'leaf' | 'earth' | 'stone' | 'water' | 'warm' | 'rare' | 'ink';

export const PALETTE: Record<RampId, string[]> = {
  sky: ['#0d2830', '#174752', '#276b75', '#4f9e9b'],
  leaf: ['#10301f', '#1d5631', '#358a3a', '#6cc644', '#c4ef6a'],
  earth: ['#100d12', '#221a20', '#3a2b2b', '#5f4636', '#937154'],
  stone: ['#283540', '#53636d', '#94a3a8'],
  water: ['#176a96', '#5ccbe8'],
  warm: ['#cc311f', '#ff8a1e', '#ffe14a'],
  rare: ['#f59be0'],
  ink: ['#05090b'],
};

export const LOOK = {
  k: 0.5, // low-res pixels per world pixel (the canvas is upscaled without smoothing)
  mossZoom: 2, // moss is drawn ×2 around the stand
  shade: [0.42, 0.74], // light below these: two steps darker, one step darker (dithered)
  skyBands: [90, 180], // world y where the sky turns one step lighter
  composeMs: 80, // the scene is composed at most this often (the overlays every frame)
};
