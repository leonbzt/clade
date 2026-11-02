// Island making: the coast, then the landmarks by seed, then the wind and the base values and statuses they leave
// behind. Only the shapes are code (a point, a stream line, a stretch of coast, a tube); the effects are data.
import { type LayerId, type StatusId } from '../data/fields';
import { THEMES } from '../data/islands';
import { LANDMARKS, type LandmarkKind } from '../data/landmarks';
import { NUM } from '../data/numbers';
import { rand } from './rng';
import type { State } from './state';

export const SEA = 0, BEACH = 1, LAVA = 2, CRACK = 3, VENT = 4, SPRING = 5, STREAM = 6, CAVE = 7;

const between = (s: State, [a, b]: readonly [number, number]) => a + Math.floor(rand(s) * (b - a + 1));
const dist = (s: State, i: number, j: number) => Math.hypot((i % s.w) - (j % s.w), ((i / s.w) | 0) - ((j / s.w) | 0));
const isRock = (t: number) => t === LAVA || t === CRACK;

/** Makes the island, by its theme (home's row keeps today's numbers). Spacing between landmarks scales with the map. */
export function buildIsland(s: State) {
  const I = NUM.island, T = THEMES[s.theme], { w, h } = s, n = w * h, k0 = w / 96;
  // A smaller island gets fewer landmarks, by area (at least one); a theme's own counts stand as they are.
  const count = (kind: LandmarkKind): readonly [number, number] => T.counts[kind] ?? (k0 === 1 ? LANDMARKS[kind].count
    : [Math.max(1, Math.round(LANDMARKS[kind].count[0] * k0 * k0)), Math.max(1, Math.round(LANDMARKS[kind].count[1] * k0 * k0))]);
  // A wobbly ellipse: a few waves around the coast make bays and points.
  const wob = [0, 1, 2, 3].map(() => rand(s) * 6.28);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i % w, y = (i / w) | 0, a = Math.atan2(y - h / 2, x - w / 2);
    const edge = 1 + 0.1 * Math.sin(2 * a + wob[0]) + 0.08 * Math.sin(3 * a + wob[1]) + 0.06 * Math.sin(5 * a + wob[2]) + 0.04 * Math.sin(9 * a + wob[3]);
    r[i] = Math.hypot((x + 0.5 - w / 2) / (w * I.radius), (y + 0.5 - h / 2) / (h * I.radius)) / edge;
    s.terrain[i] = r[i] > 1 ? SEA : rand(s) < I.crackShare * T.crack ? CRACK : LAVA;
  }
  const toSea = seaDistance(s);
  const add = (kind: LandmarkKind, tiles: number[], terrain: number) => {
    if (!tiles.length) return;
    for (const i of tiles) { s.terrain[i] = terrain; s.mark[i] = s.landmarks.length; }
    s.landmarks.push({ kind, name: '', tiles, at: tiles[Math.floor(tiles.length / 2)] });
  };

  // Beaches: stretches of the coast, spread around the island.
  const nb = between(s, count('beach')), a0 = rand(s) * 6.28;
  for (let k = 0; k < nb; k++) {
    const a = a0 + (k * 6.28) / nb + (rand(s) - 0.5) * 0.8, span = 0.2 + rand(s) * 0.25;
    const tiles: number[] = [];
    for (let i = 0; i < n; i++) {
      if (s.terrain[i] === SEA || toSea[i] > 2) continue;
      const d = Math.atan2(((i / w) | 0) - h / 2, (i % w) - w / 2) - a;
      if (Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < span) tiles.push(i);
    }
    add('beach', tiles, BEACH);
  }

  // Vents: the first sits left of centre (the obvious first home); the others spread out inland.
  const vents: number[] = [];
  const nv = between(s, count('vent'));
  for (let k = 0; k < nv; k++) {
    const i = k === 0 ? Math.floor(h * 0.5) * w + Math.floor(w * 0.38)
      : pick(s, (j) => r[j] < 0.6 && isRock(s.terrain[j]) && vents.every((v) => dist(s, j, v) >= 16 * k0));
    if (i < 0) continue;
    vents.push(i); s.vents.push(i);
    add('vent', [i], VENT);
  }

  // Springs, each with a stream that wanders toward the sea.
  const springs: number[] = [];
  const ns = between(s, count('spring'));
  for (let k = 0; k < ns; k++) {
    const i = pick(s, (j) => r[j] > 0.25 && r[j] < 0.7 && isRock(s.terrain[j])
      && vents.every((v) => dist(s, j, v) >= 10 * k0) && springs.every((v) => dist(s, j, v) >= 14 * k0));
    if (i < 0) continue;
    springs.push(i);
    const line = walk(s, i, Math.atan2(((i / w) | 0) - h / 2, (i % w) - w / 2), 0.5, 45, (t) => isRock(t));
    add('spring', line, STREAM);
    s.terrain[i] = SPRING;
  }

  // Lava tubes: short, nearly straight tunnels in the open lava field.
  const nc = between(s, count('cave'));
  for (let k = 0, tries = 0; k < nc && tries < 30; tries++) {
    const i = pick(s, (j) => r[j] < 0.75 && isRock(s.terrain[j]) && vents.every((v) => dist(s, j, v) >= 6 * k0));
    if (i < 0) break;
    const line = walk(s, i, rand(s) * 6.28, 0.25, 5 + Math.floor(rand(s) * 4), (t) => isRock(t));
    if (line.length < 4) continue;
    add('cave', line, CAVE);
    k++;
  }

  nameLandmarks(s);
  applyEffects(s, toSea);
}

/** Tiles to the nearest sea tile (8 neighbours). */
function seaDistance(s: State): Int32Array {
  const n = s.w * s.h, d = new Int32Array(n).fill(1e6), queue: number[] = [];
  for (let i = 0; i < n; i++) if (s.terrain[i] === SEA) { d[i] = 0; queue.push(i); }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % s.w, y = (i / s.w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy, j = ny * s.w + nx;
      if (nx < 0 || ny < 0 || nx >= s.w || ny >= s.h || d[j] <= d[i] + 1) continue;
      d[j] = d[i] + 1; queue.push(j);
    }
  }
  return d;
}

/** A random tile that passes the test, or -1. */
function pick(s: State, ok: (i: number) => boolean): number {
  for (let k = 0; k < 600; k++) {
    const i = Math.floor(rand(s) * s.w * s.h);
    if (ok(i)) return i;
  }
  return -1;
}

/** A wandering line of tiles from `i`, heading roughly along `a`, while the terrain passes `ok`. */
function walk(s: State, i: number, a: number, wiggle: number, max: number, ok: (t: number) => boolean): number[] {
  const out = [i];
  let x = (i % s.w) + 0.5, y = ((i / s.w) | 0) + 0.5;
  while (out.length < max) {
    a += (rand(s) - 0.5) * wiggle;
    x += Math.cos(a); y += Math.sin(a);
    const tx = Math.floor(x), ty = Math.floor(y), j = ty * s.w + tx;
    if (tx < 0 || ty < 0 || tx >= s.w || ty >= s.h || !ok(s.terrain[j])) break;
    if (j !== out[out.length - 1]) out.push(j);
  }
  return out;
}

function nameLandmarks(s: State) {
  const left: Partial<Record<LandmarkKind, string[]>> = {};
  for (const m of s.landmarks) {
    const pool = (left[m.kind] ??= shuffle(s, [...LANDMARKS[m.kind].names]));
    m.name = pool.shift() ?? LANDMARKS[m.kind].name;
  }
}

function shuffle<T>(s: State, a: T[]): T[] {
  for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(rand(s) * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; }
  return a;
}

/** A smooth random field around 1 (0.7–1.3), so effects fade unevenly. */
function roughness(s: State): Float32Array {
  const n = s.w * s.h;
  let a = Float32Array.from({ length: n }, () => rand(s)), b = new Float32Array(n);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < n; i++) {
      const x = i % s.w, y = (i / s.w) | 0;
      let sum = 0, c = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < s.w && ny < s.h) { sum += a[ny * s.w + nx]; c++; }
      }
      b[i] = sum / c;
    }
    [a, b] = [b, a];
  }
  let lo = 1, hi = 0;
  for (const v of a) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return a.map((v) => 0.7 + (0.6 * (v - lo)) / (hi - lo || 1));
}

/** The prevailing wind, by seed. Rain falls on the windward side and the lee stays drier (returned per tile, added
 * on top of everything else), and salt spray reaches a little way into the windward coast. */
function wind(s: State, toSea: Int32Array): Float32Array {
  const W = NUM.island.wind, n = s.w * s.h, a = rand(s) * 6.28, rain = new Float32Array(n);
  s.windFrom = a;
  const along = (i: number) => ((i % s.w) + 0.5 - s.w / 2) * Math.cos(a) + (((i / s.w) | 0) + 0.5 - s.h / 2) * Math.sin(a);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) if (s.terrain[i] !== SEA) { lo = Math.min(lo, along(i)); hi = Math.max(hi, along(i)); }
  for (let i = 0; i < n; i++) {
    if (s.terrain[i] === SEA) continue;
    const t = (along(i) - lo) / (hi - lo || 1);
    s.windward[i] = t;
    rain[i] = W.lee + (W.windward - W.lee) * t * t * (3 - 2 * t); // smoothstep: each side mostly near its own value
    // Spray: on the coast that faces the wind (fading in from the island's middle), 1 then 2 tiles in.
    s.statuses.salty[i] = W.spray * Math.min(1, Math.max(0, (t - 0.55) / 0.25)) * Math.max(0, 1 - (toSea[i] - 1) / W.sprayIn);
  }
  return rain;
}

/** Base values and statuses: each landmark's effects, fading with distance (the strongest source wins), then the
 * wind's rain on top. */
function applyEffects(s: State, toSea: Int32Array) {
  const I = NUM.island, n = s.w * s.h, caps = new Map<number, number>(), rough = roughness(s), rain = wind(s, toSea), sky = THEMES[s.theme].rain;
  for (let i = 0; i < n; i++) if (s.terrain[i] !== SEA) s.base.water[i] = I.lavaWet * sky;
  for (const m of s.landmarks) {
    const def = LANDMARKS[m.kind];
    for (const [key, [value, reach]] of Object.entries(def.effects)) {
      const target = key in s.base ? s.base[key as LayerId] : s.statuses[key as StatusId];
      const xs = m.tiles.map((i) => i % s.w), ys = m.tiles.map((i) => (i / s.w) | 0), far = Math.ceil((reach + 1) / 0.7);
      for (let y = Math.max(0, Math.min(...ys) - far); y <= Math.min(s.h - 1, Math.max(...ys) + far); y++)
        for (let x = Math.max(0, Math.min(...xs) - far); x <= Math.min(s.w - 1, Math.max(...xs) + far); x++) {
          const j = y * s.w + x;
          if (s.terrain[j] === SEA) continue;
          let d = 1e9;
          for (const i of m.tiles) d = Math.min(d, dist(s, i, j));
          const v = value * Math.max(0, 1 - (d * rough[j]) / (reach + 1)); // rough edges, not circles
          if (v > target[j]) target[j] = v;
        }
    }
    if (def.soilCap !== undefined) for (const i of m.tiles) caps.set(i, def.soilCap);
  }
  for (let i = 0; i < n; i++) {
    if (s.terrain[i] === SEA) continue;
    s.base.water[i] = Math.min(1, Math.max(0, s.base.water[i] + rain[i] * sky));
    if (s.terrain[i] === CRACK) s.base.water[i] = Math.min(1, s.base.water[i] + I.crackWet);
    s.soilCap[i] = caps.get(i) ?? Math.min(1, I.soilCapBase + s.base.water[i]);
    s.layers.water[i] = s.base.water[i];
  }
}
