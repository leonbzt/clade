// Living paint (N4 F, view only; law 7: no rule reads it). Per habitat and species, clamp(round(log2 heads), 1, 8)
// small capsules in the role's accent (grazer green, burrower brown, hunter red), yours with a gold pixel. They wander
// inside their habitat's tiles by simple steering; hunters drift toward prey and prey veer away. L1 swaps in icons.
// Pixi comes in as a type only, so the counts are testable without a canvas.
import type { Graphics } from 'pixi.js';
import { ACCENT, P, rgb } from '../data/palette';
import { LIVING } from '../data/sea';
import { huntsWith, partsOf } from '../sim/build';
import { bodyMass } from '../sim/fitness';
import type { Habitats } from '../sim/habitats';
import type { Id, World } from '../sim/records';
import { PARTS } from '../data/parts';
import { isYours } from './home';
import { bestFit, ranksOf } from './tiers';

export type Role = 'grazer' | 'burrower' | 'hunter';
export interface Want { habitat: number; species: Id; n: number; role: Role; yours: boolean }

const roleOf = (world: World, s: World['species'][number], h: World['habitats'][number]): Role =>
  bestFit(s.build, ranksOf(world, s.lineage), h, world)?.slot.role
    ?? (huntsWith(s.build) ? 'hunter' : partsOf(s.build).some((p) => PARTS[p].opens?.includes('detritus')) ? 'burrower' : 'grazer');

/** How many capsules each population gets: at most `LIVING.total`, the biggest counts trimmed first, yours kept. */
export function capsuleCounts(world: World): Want[] {
  const wants: Want[] = [];
  for (const h of world.habitats) for (const s of world.species) {
    const grams = h.pops[s.id] ?? 0;
    if (!(grams > 0)) continue;
    const n = Math.max(1, Math.min(LIVING.most, Math.round(Math.log2(grams / bodyMass(s.build)))));
    wants.push({ habitat: h.id, species: s.id, n, role: roleOf(world, s, h), yours: isYours(s) });
  }
  let sum = wants.reduce((a, w) => a + w.n, 0);
  wants.sort((a, b) => Number(b.yours) - Number(a.yours) || b.n - a.n);
  while (sum > LIVING.total) {
    const big = wants.reduce((m, w) => (w.n > m.n || (w.n === m.n && !w.yours) ? w : m), wants[0]);
    if (big.n > 1) { big.n--; sum--; } else { sum -= wants.pop()!.n; } // all at one: the last (not yours) goes
  }
  return wants;
}

interface Capsule {
  key: string; habitat: number; role: Role; yours: boolean;
  x: number; y: number; a: number; tx: number; ty: number; pause: number;
  alpha: number; dying: boolean; flash: number;
}

const keyOf = (habitat: number, species: Id) => `${habitat}:${species}`;
const COLOR = { grazer: rgb(ACCENT.grazer), burrower: rgb(ACCENT.burrower), hunter: rgb(ACCENT.hunter) };

export class LivingPaint {
  private caps: Capsule[] = [];
  private tiles: number[][] = []; // per habitat id
  private of: Int32Array = new Int32Array(0);
  private w = 1;

  constructor(private g: Graphics) {}

  setGround(hab: Habitats, w: number) {
    this.of = hab.of; this.w = w; this.caps = [];
    this.tiles = hab.list.map((h) => h.tiles);
  }

  /** Match the capsules to the populations: new ones fade in (at `from` if given, else anywhere inside), extras fade out. */
  sync(wants: Want[], from?: (w: Want) => { x: number; y: number } | null) {
    const live = new Map<string, Capsule[]>();
    for (const c of this.caps) if (!c.dying) (live.get(c.key) ?? live.set(c.key, []).get(c.key)!).push(c);
    for (const w of wants) {
      const key = keyOf(w.habitat, w.species), have = live.get(key) ?? [];
      live.delete(key);
      for (const c of have) { c.role = w.role; c.yours = w.yours; }
      for (const c of have.slice(w.n)) c.dying = true;
      for (let k = have.length; k < w.n; k++) {
        const at = from?.(w) ?? this.spot(w.habitat);
        this.caps.push({ key, habitat: w.habitat, role: w.role, yours: w.yours, x: at.x, y: at.y, a: Math.random() * 6.28,
          tx: at.x, ty: at.y, pause: Math.random(), alpha: 0, dying: false, flash: 0 });
      }
    }
    for (const gone of live.values()) for (const c of gone) c.dying = true;
  }

  /** A burst of light on one population's capsules (the replay's buds). */
  flash(habitat: number, species: Id) {
    for (const c of this.caps) if (c.key === keyOf(habitat, species)) c.flash = 1;
  }

  /** A random point inside one of the habitat's tiles. */
  spot(habitat: number) {
    const t = this.tiles[habitat] ?? [0], i = t[Math.floor(Math.random() * t.length)];
    return { x: (i % this.w) + 0.2 + 0.6 * Math.random(), y: Math.floor(i / this.w) + 0.2 + 0.6 * Math.random() };
  }

  private inside(c: Capsule, x: number, y: number) {
    const tx = Math.floor(x), ty = Math.floor(y);
    return tx >= 0 && ty >= 0 && tx < this.w && this.of[ty * this.w + tx] === c.habitat;
  }

  tick(dt: number, cam: { x: number; y: number; z: number }) {
    dt = Math.min(dt, 0.1);
    for (const c of this.caps) this.steer(c, dt);
    this.caps = this.caps.filter((c) => !(c.dying && c.alpha <= 0));
    this.draw(cam);
  }

  private nearest(c: Capsule, hunter: boolean, range: number) {
    let best: Capsule | null = null, bd = range * range;
    for (const o of this.caps) {
      if (o.habitat !== c.habitat || o.dying || (o.role === 'hunter') !== hunter) continue;
      const d = (o.x - c.x) ** 2 + (o.y - c.y) ** 2;
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  private steer(c: Capsule, dt: number) {
    c.alpha = Math.max(0, Math.min(1, c.alpha + (c.dying ? -1 : 1) * LIVING.fade * dt));
    c.flash = Math.max(0, c.flash - dt);
    let dx = c.tx - c.x, dy = c.ty - c.y, speed = LIVING.wander;
    const prey = c.role === 'hunter' ? this.nearest(c, false, LIVING.sight) : null;
    const threat = c.role !== 'hunter' ? this.nearest(c, true, LIVING.fear) : null;
    if (prey) { dx = prey.x - c.x; dy = prey.y - c.y; speed = LIVING.chase; c.pause = 0; }
    else if (threat) { dx = c.x - threat.x; dy = c.y - threat.y; speed = LIVING.flee; c.pause = 0; }
    else if (c.pause > 0) { c.pause -= dt; return; }
    else if (dx * dx + dy * dy < 0.25) { const s = this.spot(c.habitat); c.tx = s.x; c.ty = s.y; c.pause = Math.random() * 1.5; return; }
    const want = Math.atan2(dy, dx), turn = Math.atan2(Math.sin(want - c.a), Math.cos(want - c.a));
    c.a += Math.max(-LIVING.turn * dt, Math.min(LIVING.turn * dt, turn));
    const nx = c.x + Math.cos(c.a) * speed * dt, ny = c.y + Math.sin(c.a) * speed * dt;
    if (this.inside(c, nx, ny)) { c.x = nx; c.y = ny; return; }
    const s = this.spot(c.habitat); c.tx = s.x; c.ty = s.y; // the edge: turn toward somewhere else inside
    if (threat) c.a += Math.PI / 2;
  }

  private draw(cam: { x: number; y: number; z: number }) {
    const g = this.g, len = Math.max(4, Math.min(12, cam.z * 1.1)), wid = Math.max(2, Math.round(len * 0.42));
    g.clear();
    for (const c of this.caps) {
      if (c.alpha <= 0.01) continue;
      const sx = cam.x + c.x * cam.z, sy = cam.y + c.y * cam.z, hx = (Math.cos(c.a) * len) / 2, hy = (Math.sin(c.a) * len) / 2;
      g.moveTo(sx - hx, sy - hy).lineTo(sx + hx, sy + hy).stroke({ width: wid + 2, color: rgb(P.ink), alpha: c.alpha * 0.8, cap: 'round' });
      g.moveTo(sx - hx, sy - hy).lineTo(sx + hx, sy + hy).stroke({ width: wid, color: c.flash > 0 ? rgb(P.paper) : COLOR[c.role], alpha: c.alpha, cap: 'round' });
      if (c.yours) g.rect(Math.round(sx + hx * 0.6) - 1, Math.round(sy + hy * 0.6) - 1, 2, 2).fill({ color: rgb(P.gold), alpha: c.alpha });
    }
  }
}
