// What 50 animals cost, by way of drawing. Same animals, sizes, parts and paths in every mode. Main-thread time only: GPU work isn't seen here.
import { AlphaFilter, Application, Container, Graphics, RenderTexture, Sprite, Texture, UPDATE_PRIORITY, Rectangle } from 'pixi.js';
import { C, PAL } from '../../game/src/view/shade';
import type { Creature } from '../../game/src/view/worm';
import { newBuild } from '../../toys/creature-model';
import { Body } from '../../toys/creature-body';
import { ROWS, rng } from './animals';
import { NullPen, TriPen } from './tri-pen';

type Mode = 'math' | 'mathToday' | 'stagger2' | 'stagger4' | 'stagger6' | 'today' | 'graphics' | 'triangles' | 'baked';
const ZOOM = 1.875, W = 1000, H = 640;
export interface Result { mode: Mode; n: number; commands: number; frame: number; tris: number; polys: number; bake?: string }
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function crowd(n: number, today: boolean) {
  const r = rng(7);
  return Array.from({ length: n }, (_, k) => {
    const row = ROWS[k % ROWS.length], size = 1 + Math.floor(r() * 5), withParts = r() < 0.5, cx = (r() - 0.5) * (W / ZOOM - C * 2), cy = (r() - 0.5) * (H / ZOOM - C * 2), phase = r() * 6, speed = 0.4 + r() * 0.4;
    let c: Creature | Body;
    const build = newBuild(row.lineage, size, withParts ? row.parts : {});
    if (today && row.today) { const t = row.today(); t.setBody(size, withParts ? row.slots : [], false); c = t; } else c = new Body(build, row.own ? null : PAL.you, 0);
    (c as Creature).place(cx, cy, 0);
    return { c, build, phase, speed, cx, cy, key: `${row.lineage}/${size}/${withParts}`, own: row.own };
  });
}
const walkTo = (a: { c: Creature | Body; phase: number; speed: number; cx: number; cy: number }, dt: number) => {
  a.phase += dt * a.speed;
  a.c.head.x = a.cx + Math.sin(a.phase) * C * 0.9; a.c.head.y = a.cy + Math.sin(a.phase * 2) * C * 0.5;
  a.c.moving.v = 0.7; a.c.update(dt);
};

/** One atlas per kind of animal: 8 facings × 4 walking frames, so the sun stays put. */
function bake(app: Application, list: ReturnType<typeof crowd>) {
  const CELL = 128, FACE = 8, STEP = 4, atlases = new Map<string, Texture[]>(), t0 = performance.now();
  for (const a of list) {
    if (atlases.has(a.key)) continue;
    const rt = RenderTexture.create({ width: CELL * FACE, height: CELL * STEP, resolution: 0.5, scaleMode: 'nearest' });
    const frames: Texture[] = [], body = new Body(a.build, a.own ? null : PAL.you, 0);
    const root = new Container(), sh = new Graphics(), g = new Graphics();
    sh.alpha = 0.3; root.addChild(sh, g);
    for (let f = 0; f < FACE; f++) for (let s = 0; s < STEP; s++) {
      body.treadmill = 7; body.moving.v = 0.7; body.place(0, 0, (f / FACE) * Math.PI * 2); body.update(0.11 * (s + 1));
      sh.clear(); g.clear(); body.draw(g, sh);
      root.scale.set(ZOOM); root.position.set(f * CELL + CELL / 2, s * CELL + CELL / 2);
      app.renderer.render({ container: root, target: rt, clear: f === 0 && s === 0 });
      frames.push(new Texture({ source: rt.source, frame: new Rectangle(f * CELL, s * CELL, CELL, CELL) }));
    }
    root.destroy({ children: true });
    atlases.set(a.key, frames);
  }
  return { atlases, ms: performance.now() - t0, face: FACE, step: STEP, texels: (CELL / 2) ** 2 * FACE * STEP * 4 };
}

export async function run(app: Application, mode: Mode, n: number, frames = 160): Promise<Result> {
  const root = new Container(), world = new Container(), shLayer = new Container();
  shLayer.filters = [new AlphaFilter({ alpha: 0.3, resolution: 0.5 })];
  world.scale.set(ZOOM); world.position.set(W / 2, H / 2);
  world.addChild(shLayer); root.addChild(world); app.stage.addChild(root);
  const list = crowd(n, mode === 'today' || mode === 'mathToday');
  const g = new Graphics(), sh = new Graphics(), tg = new TriPen(), ts = new TriPen(), nul = new NullPen();
  let sprites: Sprite[] = [], baked: ReturnType<typeof bake> | null = null, bakeNote: string | undefined;
  if (mode === 'graphics' || mode === 'today') { shLayer.addChild(sh); world.addChild(g); }
  if (mode === 'triangles') { shLayer.addChild(ts.mesh); world.addChild(tg.mesh); }
  if (mode === 'baked') {
    baked = bake(app, list);
    sprites = list.map(() => { const s = new Sprite(); s.anchor.set(0.5); root.addChild(s); return s; });
    bakeNote = `${baked.atlases.size} kinds, ${(baked.ms / baked.atlases.size).toFixed(0)} ms a kind, ${(baked.texels / 1e6).toFixed(1)} MB a kind`;
  }
  // Each animal has its own Graphics. A few are rebuilt each frame; the rest just slide along with their last drawing.
  const every = mode.startsWith('stagger') ? +mode.slice(7) : 0, own = every ? list.map(() => { const q = new Graphics(), w = new Graphics(); shLayer.addChild(w); world.addChild(q); return { q, w, x: 0, y: 0 }; }) : [];
  let tick = 0;
  let cmd = 0, frame = 0, count = 0, t0 = 0, skip = 40;
  const before = () => {
    t0 = performance.now();
    const dt = 1 / 60;
    if (mode === 'math' || mode === 'mathToday') for (const a of list) { walkTo(a, dt); (a.c as Creature).draw(nul as never, nul as never, () => false); }
    else if (mode === 'graphics' || mode === 'today') { g.clear(); sh.clear(); for (const a of list) { walkTo(a, dt); (a.c as Creature).draw(g, sh, () => false); } }
    else if (every) {
      tick++;
      list.forEach((a, k) => {
        walkTo(a, dt);
        const o = own[k];
        if ((k + tick) % every === 0) { o.q.clear(); o.w.clear(); (a.c as Body).draw(o.q, o.w); o.x = a.c.head.x; o.y = a.c.head.y; }
        const dx = a.c.head.x - o.x, dy = a.c.head.y - o.y; o.q.position.set(dx, dy); o.w.position.set(dx, dy);
      });
    }
    else if (mode === 'triangles') { tg.reset(); ts.reset(); for (const a of list) { walkTo(a, dt); (a.c as Body).draw(tg as never, ts as never); } tg.flush(); ts.flush(); }
    else list.forEach((a, k) => {
      walkTo(a, dt);
      const b = a.c as Body, f = ((Math.round((b.heading / (Math.PI * 2)) * baked!.face) % baked!.face) + baked!.face) % baked!.face, s = Math.floor(a.phase * 8) % baked!.step;
      const sp = sprites[k]; sp.texture = baked!.atlases.get(a.key)![f * baked!.step + s]; sp.position.set(W / 2 + a.c.head.x * ZOOM, H / 2 + a.c.head.y * ZOOM);
    });
    if (skip <= 0) cmd += performance.now() - t0;
  };
  const after = () => { if (skip-- <= 0) { frame += performance.now() - t0; count++; } };
  app.ticker.add(before, null, UPDATE_PRIORITY.HIGH);
  app.ticker.add(after, null, UPDATE_PRIORITY.UTILITY);
  while (count < frames) await nextFrame();
  app.ticker.remove(before); app.ticker.remove(after);
  const res: Result = { mode, n, commands: cmd / count, frame: frame / count, tris: tg.tris / Math.max(1, n), polys: tg.polys / Math.max(1, n), bake: bakeNote };
  if (mode !== 'triangles') {
    const count2 = new TriPen(), s2 = new TriPen();
    for (const a of list.slice(0, 50)) if (mode !== 'baked' && !every) (a.c as Creature).draw(count2 as never, s2 as never, () => false);
    const m = Math.min(50, list.length);
    res.tris = count2.tris / m; res.polys = count2.polys / m;
  }
  app.stage.removeChild(root); root.destroy({ children: true });
  return res;
}

export async function runBench(app: Application, say: (r: Result[]) => void) {
  app.renderer.resize(W, H);
  const rows: Result[] = [];
  await run(app, 'graphics', 50, 60); await run(app, 'today', 50, 60); // warm the JIT
  for (const [mode, n] of [['math', 50], ['mathToday', 50], ['today', 50], ['graphics', 50], ['stagger2', 50], ['stagger4', 50], ['stagger6', 50], ['triangles', 50], ['baked', 50], ['graphics', 200], ['triangles', 200], ['baked', 200]] as [Mode, number][]) {
    rows.push(await run(app, mode, n)); say(rows);
  }
  return rows;
}
