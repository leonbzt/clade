// Ground textures, made once at start: grey detail maps (sand grain and ripples, silt with burrow holes, pitted
// basalt, vent crust) that tile, and that each facet tints with its shade. Low-poly facets with real texture, like
// an old 3D RPG: the facet gives the light, the texture gives the material.
import { Texture } from 'pixi.js';
import { hash } from './shade';

const N = 64;
export type TexId = 'sand' | 'mud' | 'basalt' | 'vent' | 'mat';

/** Tileable value noise with `cells` cells across the texture. */
function noise(x: number, y: number, cells: number, seed: number) {
  const s = N / cells, gx = x / s, gy = y / s, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const v = (i: number, j: number) => hash(((i % cells) + cells) % cells, ((j % cells) + cells) % cells, seed);
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  return (v(x0, y0) * (1 - sx) + v(x0 + 1, y0) * sx) * (1 - sy) + (v(x0, y0 + 1) * (1 - sx) + v(x0 + 1, y0 + 1) * sx) * sy;
}

/** Pits or pebbles: `n` round spots that wrap at the edges, darkened inside with a lit rim toward the sun. */
function spots(px: Float32Array, n: number, rMin: number, rMax: number, depth: number, seed: number, rim = 0.12) {
  for (let k = 0; k < n; k++) {
    const cx = hash(k, 1, seed) * N, cy = hash(k, 2, seed) * N, r = rMin + hash(k, 3, seed) * (rMax - rMin);
    for (let dy = -Math.ceil(r) - 1; dy <= Math.ceil(r) + 1; dy++) for (let dx = -Math.ceil(r) - 1; dx <= Math.ceil(r) + 1; dx++) {
      const d = Math.hypot(dx, dy), x = (((Math.round(cx) + dx) % N) + N) % N, y = (((Math.round(cy) + dy) % N) + N) % N;
      if (d <= r) px[y * N + x] *= 1 - depth * (1 - (d / r) * 0.4);
      else if (d <= r + 1 && dx + dy > 0) px[y * N + x] *= 1 + rim; // the rim on the far side catches the light
    }
  }
}

function make(id: TexId): Float32Array {
  const px = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const g = hash(x, y, 41) - 0.5; // per-pixel grain
    let v = 1;
    if (id === 'sand') {
      const wob = 2.2 * Math.sin((2 * Math.PI * y * 2) / N), ph = (2 * Math.PI * (4 * (x + wob) + y)) / N;
      const sn = Math.sin(ph), ripple = sn > 0.55 ? 0.12 : sn < -0.4 ? -0.16 : 0; // lit crests, shaded troughs
      v = 0.9 + g * 0.14 + ripple + (noise(x, y, 4, 42) - 0.5) * 0.1;
      if (hash(x, y, 43) > 0.985) v += 0.16; // shell grit
    } else if (id === 'mud') {
      v = 0.9 + g * 0.06 + (noise(x, y, 4, 44) - 0.5) * 0.18 + (noise(x, y, 16, 45) - 0.5) * 0.06;
    } else if (id === 'basalt') {
      v = 0.88 + g * 0.18 + (noise(x, y, 8, 46) - 0.5) * 0.22;
      if (hash(x, y, 47) > 0.992) v += 0.35; // glints of crystal
    } else if (id === 'vent') {
      const n1 = noise(x, y, 8, 48), crack = Math.abs(n1 - 0.5) < 0.05 ? -0.25 : 0;
      v = 0.86 + g * 0.1 + (noise(x, y, 4, 49) - 0.5) * 0.24 + crack;
    } else if (id === 'mat') {
      v = 0.86 + g * 0.2 + (noise(x, y, 16, 50) - 0.5) * 0.3;
    }
    px[y * N + x] = v;
  }
  if (id === 'mud') spots(px, 7, 0.8, 1.6, 0.55, 51, 0.15); // burrow holes
  if (id === 'basalt') spots(px, 22, 0.6, 2.2, 0.45, 52); // gas pits
  if (id === 'sand') spots(px, 5, 0.6, 1.1, -0.12, 53, 0); // pale pebbles
  if (id === 'vent') spots(px, 10, 1, 2.6, -0.22, 54, 0); // pale bacterial film
  return px;
}

const cache = new Map<TexId, Texture>();
export function tex(id: TexId): Texture {
  let t = cache.get(id);
  if (t) return t;
  const px = make(id), cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const cx = cv.getContext('2d')!, img = cx.createImageData(N, N);
  for (let k = 0; k < N * N; k++) {
    const v = Math.round(Math.max(0, Math.min(1, px[k])) * 255), o = k * 4;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = v; img.data[o + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  t = Texture.from(cv);
  t.source.style.addressModeU = 'repeat'; t.source.style.addressModeV = 'repeat';
  t.source.style.scaleMode = 'nearest';
  cache.set(id, t);
  return t;
}
