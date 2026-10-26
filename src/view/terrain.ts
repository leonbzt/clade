// The ground layer: sea, beach and lava drawn once per pixel, then soil dithered in as it builds.
// Coastlines come from a smoothed tile mask plus noise, so they read organic instead of blocky.
// Soil grows in organic blotches because each pixel has a fixed threshold from noise.
import { NUM } from '../data/numbers';
import { PAL } from '../data/palette';
import { BEACH, SEA, VENT, CRACK, type State } from '../sim/state';
import { hash2, makeCanvas, noise, rgba32 } from './pixels';

const T = NUM.map.tile;
const SOIL = [PAL.soil0, PAL.soil1, PAL.soil2, PAL.soil3].map((c) => rgba32(c));
const SOIL_DARK = [PAL.soil0, PAL.soil0, PAL.soil1, PAL.soil2].map((c) => rgba32(c));

export class TerrainLayer {
  readonly canvas: HTMLCanvasElement;
  private img: ImageData;
  private px: Uint32Array;
  private base: Uint32Array; // the ground without soil
  private threshold: Float32Array; // soil shows on a pixel once the tile's soil passes this
  private shade: Uint8Array; // which soil shade a pixel uses
  private lastBands: Int8Array;

  constructor(private s: State) {
    const W = s.w * T, H = s.h * T;
    this.canvas = makeCanvas(W, H);
    this.img = new ImageData(W, H);
    this.px = new Uint32Array(this.img.data.buffer);
    this.base = new Uint32Array(W * H);
    this.threshold = new Float32Array(W * H).fill(9);
    this.shade = new Uint8Array(W * H);
    this.lastBands = new Int8Array(s.w * s.h).fill(-1);
    this.paintBase();
  }

  /** Bilinear sample of a 0/1 tile mask at a pixel, measured between tile centres. */
  private field(x: number, y: number, on: (t: number) => boolean): number {
    const s = this.s, u = x / T - 0.5, v = y / T - 0.5, x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    const at = (tx: number, ty: number) => {
      tx = Math.max(0, Math.min(s.w - 1, tx)); ty = Math.max(0, Math.min(s.h - 1, ty));
      return on(s.terrain[ty * s.w + tx]) ? 1 : 0;
    };
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }

  private paintBase() {
    const s = this.s, W = s.w * T, H = s.h * T;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x, tx = (x / T) | 0, ty = (y / T) | 0, t = s.terrain[ty * s.w + tx];
      const wob = (noise(x, y, 5, 21) - 0.5) * 0.45, fine = hash2(x, y, 1);
      const land = this.field(x, y, (k) => k !== SEA) + wob;
      const rock = this.field(x, y, (k) => k !== SEA && k !== BEACH) + wob;
      let c: string;
      if (land < 0.5) {
        c = land > 0.4 ? PAL.foam : land > 0.22 ? PAL.seaLight : noise(x, y, 22, 4) > 0.74 ? PAL.sea : PAL.seaDeep;
      } else if (rock < 0.5) {
        const n = noise(x, y, 7, 5);
        c = land < 0.58 ? PAL.sandDark : n > 0.6 ? PAL.sandLight : PAL.sand;
        if (fine > 0.985) c = PAL.sandDark;
        this.setSoilPixel(p, x, y, fine);
      } else {
        const n = noise(x, y, 10, 6);
        c = n > 0.62 ? PAL.lava2 : n > 0.32 ? PAL.lava1 : PAL.lava0;
        if (fine > 0.988) c = PAL.lava3;
        if (Math.abs(noise(x, y, t === CRACK ? 6 : 12, 7) - 0.5) < (t === CRACK ? 0.04 : 0.012)) c = PAL.crack;
        if (t === VENT) {
          const d = Math.hypot(x - (tx + 0.5) * T, y - (ty + 0.5) * T) + fine;
          if (d < 3.5) c = PAL.crack;
          else if (d < 6) c = PAL.vent;
        } else this.setSoilPixel(p, x, y, fine);
      }
      this.base[p] = rgba32(c);
    }
  }

  private setSoilPixel(p: number, x: number, y: number, fine: number) {
    this.threshold[p] = 0.15 + 0.7 * noise(x, y, 3, 11) + 0.15 * fine;
    this.shade[p] = noise(x, y, 4, 13) > 0.5 ? 1 : 0;
  }

  /** Repaints only the tiles whose soil band changed. Cheap enough to call every few ticks. */
  update(force = false) {
    const s = this.s, W = s.w * T;
    let dirty = false;
    for (let i = 0; i < s.w * s.h; i++) {
      const band = Math.min(40, Math.floor(s.soil[i] * 12));
      if (!force && band === this.lastBands[i]) continue;
      this.lastBands[i] = band; dirty = true;
      const f = s.soil[i] / 3, deep = Math.min(3, Math.floor(s.soil[i]));
      const x0 = (i % s.w) * T, y0 = ((i / s.w) | 0) * T;
      for (let y = y0; y < y0 + T; y++) for (let x = x0; x < x0 + T; x++) {
        const p = y * W + x;
        this.px[p] = f * 1.25 > this.threshold[p] ? (this.shade[p] ? SOIL[deep] : SOIL_DARK[deep]) : this.base[p];
      }
    }
    if (dirty) this.canvas.getContext('2d')!.putImageData(this.img, 0, 0);
  }
}
