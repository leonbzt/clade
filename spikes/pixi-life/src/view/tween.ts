// A small tweener on the Pixi ticker: tween numbers on any object and await the end. Pixi has none built in.
import type { Ticker } from 'pixi.js';

export type Ease = (t: number) => number;
export const ease = {
  linear: (t: number) => t,
  sineIn: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t: number) => Math.sin((t * Math.PI) / 2),
  sineInOut: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  quadOut: (t: number) => 1 - (1 - t) * (1 - t),
  quadIn: (t: number) => t * t,
  expoIn: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  backOut: (t: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

interface Job { o: Record<string, number>; from: Record<string, number>; to: Record<string, number>; t: number; dur: number; ease: Ease; done: () => void }
const jobs: Job[] = [];
const waits: { t: number; done: () => void }[] = [];

export function startTweens(ticker: Ticker) {
  ticker.add((tk) => {
    const dt = tk.deltaMS / 1000;
    for (let k = jobs.length - 1; k >= 0; k--) {
      const j = jobs[k];
      j.t = Math.min(j.dur, j.t + dt);
      const p = j.ease(j.dur > 0 ? j.t / j.dur : 1);
      for (const key in j.to) j.o[key] = j.from[key] + (j.to[key] - j.from[key]) * p;
      if (j.t >= j.dur) { jobs.splice(k, 1); j.done(); }
    }
    for (let k = waits.length - 1; k >= 0; k--) {
      waits[k].t -= dt;
      if (waits[k].t <= 0) { const w = waits.splice(k, 1)[0]; w.done(); }
    }
  });
}

/** Tween the numeric fields in `to` from their current values. A new tween on the same object and key wins. */
export function tween<T extends object>(o: T, to: Partial<Record<keyof T, number>>, dur: number, e: Ease = ease.sineInOut): Promise<void> {
  const rec = o as unknown as Record<string, number>, target = to as Record<string, number>;
  for (const j of jobs) if (j.o === rec) for (const key in target) delete j.to[key];
  const from: Record<string, number> = {};
  for (const key in target) from[key] = rec[key];
  return new Promise((done) => jobs.push({ o: rec, from, to: { ...target }, t: 0, dur, ease: e, done }));
}

export const wait = (sec: number) => new Promise<void>((done) => waits.push({ t: sec, done }));
