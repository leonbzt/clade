// The type specimen: a simple procedural drawing built from the common traits.
// Each layer has its own seed, so adding a trait never reshuffles the others.
import { nextRandom } from '../core/rng';
import type { TraitId } from '../data/traits';
import { PALETTE as P } from '../data/view';

export type Shape =
  | { kind: 'path'; d: string; stroke: string; width: number; fill?: string }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot: number; fill: string };

const GROUND = 96;
const MID = 60;

function rng(seed: number) {
  let s = seed;
  return () => {
    const [v, n] = nextRandom(s);
    s = n;
    return v;
  };
}

function wiggle(r: () => number, x0: number, y0: number, dx: number, dy: number, steps: number, jitter: number): string {
  let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`;
  let x = x0;
  let y = y0;
  for (let i = 0; i < steps; i++) {
    x += dx + (r() - 0.5) * jitter;
    y += dy + (r() - 0.5) * jitter;
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

export function drawSpecimen(traits: TraitId[]): Shape[] {
  const has = (t: TraitId) => traits.includes(t);
  const dry = has('dryingOut');
  const leafy = has('leafyShoot');
  const dense = has('tufts');
  const out: Shape[] = [];
  const threadColour = dry ? P.threadDry : P.thread;
  const leafColour = dry ? P.leafDry : P.leaf;
  const tips: { x: number; y: number; a: number }[] = [];

  // ground
  out.push({ kind: 'path', d: `M8,${GROUND} L112,${GROUND}`, stroke: P.ground, width: 2 });

  // rhizoids: brown threads into the rock
  if (has('rhizoids')) {
    const r = rng(11);
    for (let i = 0; i < 9; i++) {
      const x = MID - 22 + i * 5.5 + (r() - 0.5) * 3;
      out.push({ kind: 'path', d: wiggle(r, x, GROUND, (r() - 0.5) * 2, 3, 5, 2.5), stroke: P.rhizoid, width: 0.8 });
    }
  }

  // creeping shoots: long runners along the ground with buds
  if (has('creeping')) {
    const r = rng(23);
    for (const side of [-1, 1]) {
      out.push({ kind: 'path', d: wiggle(r, MID, GROUND - 2, side * 9, -0.2, 5, 2), stroke: threadColour, width: 1.6 });
      for (let i = 1; i <= 4; i++) {
        out.push({ kind: 'ellipse', cx: MID + side * i * 10, cy: GROUND - 4, rx: 2.2, ry: 1.6, rot: 0, fill: leafColour });
      }
    }
  }

  // protonema: the thread-like first stage, always there
  {
    const r = rng(5);
    const n = dense && !leafy ? 16 : 9;
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1) - 0.5) * 2.4;
      const x0 = MID + (r() - 0.5) * 10;
      const steps = 6;
      const dx = Math.sin(a) * 6;
      const dy = -Math.cos(a) * 4;
      const d = wiggle(r, x0, GROUND - 1, dx, dy, steps, 3);
      out.push({ kind: 'path', d, stroke: threadColour, width: 1.4 });
      const end = d.split(' ').pop()!.replace('L', '').split(',').map(Number);
      if (!leafy) tips.push({ x: end[0], y: end[1], a });
    }
  }

  // leafy shoots: upright stems with leaf pairs, the biggest change
  if (leafy) {
    const r = rng(41);
    const n = dense ? 9 : 5;
    for (let i = 0; i < n; i++) {
      const x = MID - (n - 1) * 3.2 + i * 6.4 + (r() - 0.5) * 2;
      const h = 30 + r() * 16 - Math.abs(i - (n - 1) / 2) * 3;
      const lean = (r() - 0.5) * 6;
      const top = { x: x + lean, y: GROUND - h };
      out.push({ kind: 'path', d: `M${x.toFixed(1)},${GROUND} Q${(x + lean * 0.3).toFixed(1)},${(GROUND - h / 2).toFixed(1)} ${top.x.toFixed(1)},${top.y.toFixed(1)}`, stroke: leafColour, width: 1.4 });
      const pairs = 6;
      for (let k = 1; k <= pairs; k++) {
        const f = k / (pairs + 0.5);
        const cx = x + lean * f * f;
        const cy = GROUND - h * f;
        const size = 4.2 - f * 1.8;
        for (const side of [-1, 1]) {
          const rot = side * (dry ? 25 : 55);
          out.push({ kind: 'ellipse', cx: cx + side * size * 0.8, cy, rx: size, ry: size * 0.38, rot, fill: leafColour });
        }
      }
      tips.push({ x: top.x, y: top.y, a: lean / 20 });
    }
  }

  // hair points: clear tips
  if (has('hairPoints')) {
    for (const t of tips) {
      const dx = Math.sin(t.a) * 4;
      const dy = -Math.cos(t.a) * 4;
      out.push({ kind: 'path', d: `M${t.x.toFixed(1)},${t.y.toFixed(1)} l${dx.toFixed(1)},${dy.toFixed(1)}`, stroke: P.hair, width: 0.8 });
    }
  }

  // stalked spore capsule: a seta with a capsule on top
  if (has('capsule')) {
    const r = rng(67);
    const count = leafy ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const x = MID + (i === 0 ? 4 : -9) + (r() - 0.5) * 2;
      const base = leafy ? GROUND - 30 : GROUND - 4;
      const h = 34 + r() * 8;
      const tx = x + 6 + r() * 3;
      const ty = base - h;
      out.push({ kind: 'path', d: `M${x.toFixed(1)},${base} Q${(x + 1).toFixed(1)},${(base - h * 0.6).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`, stroke: P.seta, width: 1.1 });
      out.push({ kind: 'ellipse', cx: tx + 2, cy: ty - 1, rx: 4.5, ry: 2.4, rot: -30, fill: P.capsule });
    }
  }

  return out;
}
