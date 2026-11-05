// The five feel values you tune in the dev panel, plus one look value. Kept in this browser between visits.
export const FEEL_SPEC = [
  { key: 'glideTime', label: 'Glide time', min: 0.03, max: 0.6, step: 0.01, unit: 's/tile', hint: 'seconds per tile when you move' },
  { key: 'squash', label: 'Squash', min: 0, max: 0.8, step: 0.01, unit: '', hint: 'stretch on the move, squash on landing' },
  { key: 'particles', label: 'Particles', min: 0, max: 60, step: 1, unit: '', hint: 'bits when you eat' },
  { key: 'shake', label: 'Shake', min: 0, max: 40, step: 0.5, unit: 'px', hint: 'how hard a strike shakes the camera' },
  { key: 'zoomSpeed', label: 'Zoom speed', min: 0.2, max: 3, step: 0.05, unit: '×', hint: 'pinch and mouse wheel' },
] as const;
export const LOOK_SPEC = [
  { key: 'pixel', label: 'Pixel size', min: 1, max: 5, step: 1, unit: 'px', hint: 'screen pixels per art pixel (look, not feel)' },
] as const;

export type FeelKey = (typeof FEEL_SPEC)[number]['key'] | (typeof LOOK_SPEC)[number]['key'];
export type Feel = Record<FeelKey, number>;
export const DEFAULTS: Feel = { glideTime: 0.16, squash: 0.3, particles: 14, shake: 10, zoomSpeed: 1, pixel: 2 };

const KEY = 'clade-pixi-feel';
function load(): Feel {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return { ...DEFAULTS }; }
}
export const feel: Feel = load();
const listeners: (() => void)[] = [];
export const onFeel = (f: () => void) => listeners.push(f);
export function setFeel(k: FeelKey, v: number) {
  feel[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(feel)); } catch { /* private mode: values last this visit */ }
  listeners.forEach((f) => f());
}
