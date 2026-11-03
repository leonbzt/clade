// Small pixel-art helpers: deterministic noise and colours. Carried over from v1 (`_v1/src/view/pixels.ts`).

export function hash2(x: number, y: number, k = 0): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth value noise, 0–1, with features about `scale` pixels wide. */
export function noise(x: number, y: number, scale: number, k = 0): number {
  const fx = x / scale, fy = y / scale, x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hash2(x0, y0, k), b = hash2(x0 + 1, y0, k), c = hash2(x0, y0 + 1, k), d = hash2(x0 + 1, y0 + 1, k);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** '#rrggbb' (× a brightness) to a little-endian RGBA uint32 for ImageData. */
export function rgba32(hex: string, k = 1): number {
  const n = parseInt(hex.slice(1), 16), c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return ((255 << 24) | (c(n & 0xff) << 16) | (c((n >> 8) & 0xff) << 8) | c(n >> 16)) >>> 0;
}
