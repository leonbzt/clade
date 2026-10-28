// Animals on the map, drawn every frame in art pixels (one tile = 12 px): snails with a fading slime trail, swarms of
// hopping springtails, scuttling beetles. Visitors wait at their landmark under a bobbing gold marker; the animal you
// follow gets a ring. The specimen painters draw the same animals big, for the species card.
import { NUM } from '../data/numbers';
import { ANIMAL_PAL, PAL } from '../data/palette';
import { TREE } from '../data/tree';
import { tileOf } from '../sim/agents';
import type { Agent, State } from '../sim/state';
import { defOf } from '../sim/variants';
import { zoneColor } from './overlays';
import { hash2, Painter, seeded, type Tint } from './pixels';

const T = NUM.map.tile;
type Ctx = CanvasRenderingContext2D;

// Slime trails live in the view only: a few recent spots per snail.
const trails = new Map<number, { x: number; y: number; t: number }[]>();
const TRAIL_MS = 6000;

function px(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function snail(ctx: Ctx, x: number, y: number, face: number, c: [string, string, string], shell: boolean) {
  px(ctx, x - 2, y, 5, 1, shell ? '#c8b898' : c[0]); // foot
  px(ctx, x + 2 * face, y - 1, 1, 1, shell ? '#c8b898' : c[0]); // head
  px(ctx, x + 3 * face, y - 2, 1, 1, PAL.textDim); // feeler
  if (shell) {
    px(ctx, x - 1 - (face < 0 ? 0 : 1), y - 2, 3, 2, c[0]);
    px(ctx, x - (face < 0 ? 0 : 1), y - 3, 2, 1, c[1]);
    px(ctx, x - (face < 0 ? 0 : 1), y - 2, 1, 1, c[2]);
  } else px(ctx, x - 1, y - 1, 3, 1, c[1]);
}

function swarm(ctx: Ctx, a: Agent, x: number, y: number, time: number, c: [string, string, string]) {
  const dots = Math.min(6, Math.max(2, Math.ceil(a.n / 4)));
  for (let k = 0; k < dots; k++) {
    const ox = Math.round((hash2(a.id, k) - 0.5) * 7), oy = Math.round((hash2(a.id, k, 1) - 0.5) * 5);
    const hop = (time / 700 + hash2(a.id, k, 2)) % 1 < 0.12 ? -2 : 0;
    px(ctx, x + ox, y + oy + hop, 1, 1, hop ? c[2] : c[0]);
  }
}

function insect(ctx: Ctx, x: number, y: number, face: number, time: number, c: [string, string, string], beetle: boolean) {
  const step = Math.floor(time / 160) % 2;
  if (beetle) {
    px(ctx, x - 1, y - 1, 3, 2, c[0]);
    px(ctx, x - 1 + (face > 0 ? 2 : 0), y - 1, 1, 1, c[2]);
    px(ctx, x - 2, y - step, 1, 1, c[1]); px(ctx, x + 2, y - 1 + step, 1, 1, c[1]);
  } else {
    px(ctx, x - 1, y, 3, 1, c[0]);
    px(ctx, x - 2 * face, y - step, 1, 1, c[1]); // tail bristles
    px(ctx, x + face, y - 1, 1, 1, c[2]);
  }
}

/** Every animal, plus visitor markers and the ring around the one you follow. */
export function drawAnimals(ctx: Ctx, s: State, time: number, follow: number) {
  const now = performance.now();
  for (const a of s.agents) {
    const id = defOf(s, a.sp).id, c = ANIMAL_PAL[id] ?? ANIMAL_PAL.snail, x = a.x * T, y = a.y * T, face = a.tx >= a.x ? 1 : -1;
    if (id === 'snail' || id === 'slug') {
      let tr = trails.get(a.id);
      if (!tr) trails.set(a.id, (tr = []));
      const last = tr[tr.length - 1];
      if (!last || Math.hypot(last.x - x, last.y - y) >= 2) tr.push({ x, y, t: now });
      while (tr.length && now - tr[0].t > TRAIL_MS) tr.shift();
      for (const p of tr) { ctx.globalAlpha = 0.35 * (1 - (now - p.t) / TRAIL_MS); px(ctx, p.x - 1, p.y, 2, 1, '#d8e8ec'); }
      ctx.globalAlpha = 1;
      snail(ctx, x, y, face, c, id === 'snail');
    } else if (a.n > 1 || id === 'springtail') swarm(ctx, a, x, y, time, c);
    else insect(ctx, x, y, face, time, c, id === 'beetle');
    if (a.id === follow) {
      ctx.strokeStyle = PAL.gold; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x) - 5.5, Math.round(y) - 5.5, 11, 11);
    }
  }
  if (Math.random() < 0.01) for (const id of trails.keys()) if (!s.agents.some((a) => a.id === id)) trails.delete(id);
  for (const [node, i] of Object.entries(s.visitors)) {
    const n = TREE.find((t) => t.id === node)!, x = (i % s.w) * T + T / 2, y = ((i / s.w) | 0) * T, bob = Math.round(Math.sin(time / 250) * 2);
    if (n.arrive!.at === 'beach') { px(ctx, x - 6, y + 6, 12, 3, '#6a4a30'); px(ctx, x - 6, y + 6, 12, 1, '#8a6a48'); }
    px(ctx, x - 1, y - 10 + bob, 3, 5, PAL.gold); px(ctx, x - 1, y - 3 + bob, 3, 2, PAL.gold);
  }
}

/** The Animals view: a wash, and each tile with animals in its main species' colour, stronger with more of them. */
export function animalsView(ctx: Ctx, s: State) {
  ctx.fillStyle = 'rgba(10, 8, 6, 0.55)';
  ctx.fillRect(0, 0, s.w * T, s.h * T);
  const per = new Map<number, Map<number, number>>();
  for (const a of s.agents) {
    const i = tileOf(s, a), m = per.get(i) ?? new Map<number, number>();
    m.set(a.sp, (m.get(a.sp) ?? 0) + 1); per.set(i, m);
  }
  for (const [i, m] of per) {
    let sp = -1, most = 0, all = 0;
    for (const [k, c] of m) { all += c; if (c > most) { most = c; sp = k; } }
    ctx.globalAlpha = Math.min(1, 0.35 + all / 5);
    ctx.fillStyle = zoneColor(s, sp);
    ctx.fillRect((i % s.w) * T, ((i / s.w) | 0) * T, T, T);
  }
  ctx.globalAlpha = 1;
}

/** The nearest animal to a point (in tiles), within `r` tiles, or null. */
export function animalAt(s: State, x: number, y: number, r = 0.9): Agent | null {
  let best: Agent | null = null, bd = r * r;
  for (const a of s.agents) {
    const d = (a.x - x) ** 2 + (a.y - y) ** 2;
    if (d < bd) { bd = d; best = a; }
  }
  return best;
}

/** A big drawing of an animal on a strip of soil, for the species card. */
export function animalSpecimen(species: string, traits: string[], size: number, tint: Tint): HTMLCanvasElement {
  const p = new Painter(size, size), c = ANIMAL_PAL[species] ?? ANIMAL_PAL.snail, r = seeded(7), g = size - 4, m = size / 2;
  for (let x = 0; x < size; x++) for (let y = size - 3; y < size; y++) p.set(x, y, (x * 3 + y) % 4 ? PAL.soil1 : PAL.soil0);
  p.setTint(tint);
  const k = size / 48;
  if (species === 'snail' || species === 'slug') {
    p.line(m - 14 * k, g, m + 14 * k, g, species === 'snail' ? '#c8b898' : c[0]);
    p.line(m - 14 * k, g - 1, m + 12 * k, g - 1, species === 'snail' ? '#b8a888' : c[0]);
    p.line(m + 13 * k, g - 1, m + 16 * k, g - 6 * k, PAL.textDim);
    if (species === 'snail') {
      const rad = Math.round(8 * k), cy = g - rad - 1;
      p.disc(m - 2 * k, cy, rad, traits.includes('thick') ? c[1] : c[0]);
      for (let t = 0; t < 14; t += 0.2) p.set(m - 2 * k + Math.cos(t) * t * 0.55 * k, cy + Math.sin(t) * t * 0.55 * k, c[1]);
      p.set(m - 4 * k, cy - rad + 2, c[2]);
    } else p.line(m - 12 * k, g - 2, m + 10 * k, g - 2, c[1]);
  } else if (species === 'springtail') {
    for (let n = 0; n < 5; n++) {
      const x = 6 + r() * (size - 12), y = g - 2 - r() * 10 * k;
      p.line(x, y, x + 3 * k, y, c[0]); p.set(x + 3 * k, y - 1, c[2]); p.set(x - 1, y + 1, c[1]);
    }
  } else if (species === 'beetle') {
    const w = Math.round(9 * k), h = Math.round(5 * k), cy = g - h - 2;
    for (let y = -h; y <= h; y++) for (let x = -w; x <= w; x++) if ((x * x) / (w * w) + (y * y) / (h * h) <= 1) p.set(m + x, cy + y, c[0]);
    p.line(m - w, cy, m + w, cy, c[1]);
    p.set(m + 3 * k, cy - h + 1, c[2]); p.set(m + 4 * k, cy - h + 1, c[2]);
    for (const dx of [-5, 0, 5]) { p.line(m + dx * k, cy + h, m + dx * k - 2, g, c[1]); }
    p.disc(m + w + 2, cy, Math.max(1, Math.round(2 * k)), c[0]);
  } else {
    p.line(m - 10 * k, g - 3, m + 8 * k, g - 3, c[0]); p.line(m - 9 * k, g - 4, m + 6 * k, g - 4, c[1]);
    for (const dy of [-2, 0, 2]) p.line(m - 10 * k, g - 3, m - 16 * k, g - 3 + dy * k, c[1]);
  }
  return p.toCanvas();
}
