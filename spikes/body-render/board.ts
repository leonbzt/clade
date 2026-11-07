// A spike: six ways of drawing one real board, the same animals walking the same paths; and a sheet of more animals. Throwaway.
import { AlphaFilter, Application, BufferImageSource, Container, Graphics, Rectangle, RenderTexture, Sprite, Text, Texture, TilingSprite, UPDATE_PRIORITY } from 'pixi.js';
import { HABITATS } from '../../game/src/data/habitats';
import { COLS, ROWS } from '../../game/src/data/life';
import * as L from '../../game/src/sim/life';
import { Arthropod } from '../../game/src/view/arthropod';
import { BH, BW, Floor } from '../../game/src/view/floor';
import { preyBody } from '../../game/src/view/preyview';
import { C, PAL, SHADOW } from '../../game/src/view/shade';
import { Swimmer } from '../../game/src/view/swimmer';
import type { BodySlot, Creature } from '../../game/src/view/worm';
import { Worm } from '../../game/src/view/worm';
import { Body } from '../../toys/creature-body';
import { LINEAGES, type LineageId, type PartId } from '../../toys/creature-data';
import { newBuild } from '../../toys/creature-model';
import { beasts } from './beasts';
import { StylePen, cozy, mixC, outlineFilter } from './looks';
import { causticPixels, paintFloor } from './pixel-floor';
import { Paint, paintBody } from './pixel-paint';
import { bakePolyFloor, polyBody } from './polyplus';

const q = new URLSearchParams(location.search), view = q.get('view') ?? 'board', round2 = q.get('round') === '2', still = q.has('still'), hab = (q.get('hab') ?? 'mud') as keyof typeof HABITATS;
const PW = BW * 2, PH = BH * 2, GAP = 8, TOP = 36;
const app = new Application();
await app.init({ antialias: false, background: 0x14110d, resolution: 1, width: view === 'board' ? PW * 3 + GAP * 2 : 1240, height: view === 'board' ? (PH + TOP) * 2 + GAP : 960, preference: 'webgl' });
document.getElementById('stage')!.append(app.canvas);

const life = L.newLife(11, 'worm', HABITATS[hab]);
life.tiles.forEach((t) => { t.seen = true; });

/** Who walks. Shared, so every board shows the same moment. */
interface Spec { lineage: LineageId; size: number; parts: Record<string, PartId>; colour: 'you' | 'rival' | null; today: () => Creature; speed: number }
const slot = (kind: BodySlot['kind'], part: string, seg = 0, side = 'front'): BodySlot => ({ kind, side, seg, part: part as never });
const today = (make: () => Creature, size: number, slots: BodySlot[] = []) => () => { const c = make(); c.setBody(size, slots, false); return c; };
const CAST: Spec[] = [
  { lineage: 'arthropod', size: 3, parts: { front0: 'claw', side4: 'gill' }, colour: 'you', today: today(() => new Arthropod(PAL.you, 1.2), 3, [slot('head', 'claw'), slot('side', 'gill', 2, 'left'), slot('side', 'gill', 2, 'right')]), speed: 34 },
  { lineage: 'bristle', size: 2, parts: {}, colour: 'rival', today: today(() => new Worm(PAL.rival, true, 0.85), 2), speed: 26 },
  { lineage: 'anomalocaris', size: 3, parts: {}, colour: null, today: today(() => new Swimmer(PAL.hunter), 3), speed: 30 },
  { lineage: 'trilobite', size: 2, parts: {}, colour: null, today: () => preyBody('trilobite'), speed: 20 },
  { lineage: 'worm', size: 2, parts: {}, colour: 'rival', today: () => preyBody('worm'), speed: 18 },
  { lineage: 'wiwaxia', size: 2, parts: {}, colour: null, today: () => preyBody('wiwaxia' as never), speed: 10 },
  { lineage: 'trilobite', size: 1, parts: {}, colour: null, today: () => preyBody('trilobite'), speed: 22 },
  { lineage: 'worm', size: 1, parts: {}, colour: 'rival', today: () => preyBody('worm'), speed: 20 },
];
interface Walker { x: number; y: number; to: [number, number] | null; tile: number; wait: number; spec: Spec; moving: boolean }
const walkable = life.tiles.map((t, i) => (t.t !== 'rock' ? i : -1)).filter((i) => i >= 0);
const centre = (i: number): [number, number] => [(i % COLS + 0.5) * C, (Math.floor(i / COLS) + 0.5) * C];
function walkers(n: number): Walker[] { return Array.from({ length: n }, (_, k) => { const tile = walkable[(k * 13 + 5) % walkable.length], [x, y] = centre(tile); return { x, y, to: null, tile, wait: (k % 8) * 0.4, spec: CAST[k % CAST.length], moving: false }; }); }
function stepWalker(w: Walker, dt: number) {
  w.moving = false;
  if (w.wait > 0) { w.wait -= dt; return; }
  if (!w.to) {
    const opts = [w.tile - 1, w.tile + 1, w.tile - COLS, w.tile + COLS].filter((i) => i >= 0 && i < life.tiles.length && life.tiles[i].t !== 'rock' && Math.abs((i % COLS) - (w.tile % COLS)) <= 1);
    if (!opts.length) return;
    w.tile = opts[Math.floor(Math.random() * opts.length)]; w.to = centre(w.tile);
  }
  const dx = w.to[0] - w.x, dy = w.to[1] - w.y, d = Math.hypot(dx, dy), s = w.spec.speed * dt;
  if (d <= s) { w.x = w.to[0]; w.y = w.to[1]; w.to = null; w.wait = Math.random() < 0.35 ? 0.8 + Math.random() * 1.2 : 0; } else { w.x += (dx / d) * s; w.y += (dy / d) * s; }
  w.moving = true;
}

const makeBody = (s: Spec) => new Body(newBuild(s.lineage, s.size, s.parts), s.colour === 'you' ? PAL.you : s.colour === 'rival' ? PAL.rival : null, 0);
const nearest = (o: { scaleMode?: string } = {}) => ({ scaleMode: 'nearest', ...o }) as never;

/** An animal painted by the pixel painter into its own little texture, with its shadow as the same picture. */
class PixelActor {
  b: Body; sprite: Sprite; shadow: Sprite; P: Paint; side: number; held: number; hx = 0; hy = 0;
  private src: BufferImageSource;
  constructor(public w: Walker, private art: number, parent: Container, shadows: Container, public fps: number) {
    this.b = makeBody(w.spec); this.b.ramp = cozy(this.b.ramp); this.b.place(w.x, w.y, 0);
    this.side = Math.ceil((this.b.L + this.b.R * 2 + this.b.u() * 4) * art * 2 + 8) & ~1;
    this.P = new Paint(this.side, this.side);
    this.src = new BufferImageSource({ resource: this.P.out, width: this.side, height: this.side, ...nearest() });
    const tex = new Texture({ source: this.src });
    this.sprite = new Sprite(tex); this.shadow = new Sprite(tex); this.shadow.tint = 0x1a1030;
    parent.addChild(this.sprite); shadows.addChild(this.shadow);
    this.held = Math.random() / fps;
  }
  tick(dt: number, always = false) {
    const { b, w, art } = this;
    b.head.x = w.x; b.head.y = w.y; b.moving.v += ((w.moving ? 0.8 : 0) - b.moving.v) * Math.min(1, dt * 8); b.update(dt);
    this.held += dt;
    if (always || this.held >= 1 / this.fps) {
      this.held = 0;
      this.hx = Math.floor(w.x * art); this.hy = Math.floor(w.y * art);
      this.P.clear(); paintBody(this.P, b, this.side / 2 - this.hx, this.side / 2 - this.hy, art); this.P.finish(0); this.src.update();
    }
    const x = Math.floor(w.x * art) - this.side / 2, y = Math.floor(w.y * art) - this.side / 2, lift = b.lin.lift * art;
    this.sprite.position.set(x, y); this.shadow.position.set(x + Math.round(lift * SHADOW.x), y + Math.round(lift * SHADOW.y));
  }
}

/** Low poly: each animal has its own shapes; those not close to you hold them for a few frames and slide. */
class PolyActor {
  b: Body; g = new StylePen(); sh = new Graphics(); held: number; px = 0; py = 0;
  held2 = Math.random() / 10;
  constructor(public w: Walker, parent: Container, shadows: Container, public every: number, private art = 0) {
    this.b = makeBody(w.spec); this.b.ramp = cozy(this.b.ramp); this.b.place(w.x, w.y, 0); parent.addChild(this.g); shadows.addChild(this.sh); this.held = Math.floor(Math.random() * every);
  }
  tick(dt: number) {
    const { b, w } = this;
    b.head.x = w.x; b.head.y = w.y; b.moving.v += ((w.moving ? 0.8 : 0) - b.moving.v) * Math.min(1, dt * 8); b.update(dt);
    const art = this.art; // steady: every animal at 10 fps, its head always on a whole pixel
    if (art) this.held2 += dt;
    if (art ? this.held2 >= 0.1 : ++this.held >= this.every) { this.held = 0; this.held2 = 0; this.g.clear(); this.sh.clear(); polyBody(b, this.g, this.sh); this.px = w.x; this.py = w.y; }
    const dx = art ? Math.round(w.x * art) / art - this.px : w.x - this.px, dy = art ? Math.round(w.y * art) / art - this.py : w.y - this.py; this.g.position.set(dx, dy); this.sh.position.set(dx, dy);
  }
}

/** The cheapest way: each animal painted once at load into a small sheet, 16 headings by 4 steps. A stiff body, but nothing is computed while it plays. */
const DIRS = 16, FRAMES = 4; let bakeMs = 0;
const baked = new Map<string, { tex: Texture[]; side: number; lift: number }>();
function bake(s: Spec, art: number, style: 'pixel' | 'poly') {
  const key = `${s.lineage}|${s.size}|${s.colour}|${art}|${style}`, have = baked.get(key); if (have) return have;
  const t0 = performance.now(), probe = makeBody(s), side = Math.ceil((probe.L + probe.R * 2 + probe.u() * 4) * art * 2 + 8) & ~1, tex: Texture[] = [], P = new Paint(side, side);
  const pen = new StylePen(), sh = new Graphics(), scene = new Container(); scene.filters = [outlineFilter()]; scene.filterArea = new Rectangle(0, 0, side, side); scene.addChild(pen); pen.scale.set(art); pen.position.set(side / 2, side / 2);
  for (let d = 0; d < DIRS; d++) {
    const b = makeBody(s); b.ramp = cozy(b.ramp); b.place(0, 0, (d / DIRS) * Math.PI * 2); b.treadmill = 16; b.moving.v = 0.8; b.update(0.05);
    for (let f = 0; f < FRAMES; f++) {
      if (style === 'pixel') { P.clear(); paintBody(P, b, side / 2, side / 2, art); P.finish(0); tex.push(new Texture({ source: new BufferImageSource({ resource: P.out.slice(), width: side, height: side, ...nearest() }) })); }
      else { pen.clear(); sh.clear(); polyBody(b, pen, sh); const rt = RenderTexture.create({ width: side, height: side, resolution: 1, scaleMode: 'nearest', antialias: false }); app.renderer.render({ container: scene, target: rt, clear: true }); tex.push(rt); }
      b.update(0.09);
    }
  }
  scene.destroy({ children: true }); sh.destroy();
  const out = { tex, side, lift: probe.lin.lift * art }; baked.set(key, out); bakeMs += performance.now() - t0; return out;
}
class BakedActor {
  sprite = new Sprite(); shadow = new Sprite(); sheet; dir = 0; t = Math.random(); held = 0;
  constructor(public w: Walker, private art: number, parent: Container, shadows: Container, style: 'pixel' | 'poly') {
    this.sheet = bake(w.spec, art, style); this.shadow.tint = 0x1a1030; parent.addChild(this.sprite); shadows.addChild(this.shadow);
  }
  tick(dt: number) {
    const { w, art, sheet } = this; this.t += dt; this.held += dt;
    if (w.to && this.held > 0.05) { this.held = 0; const want = ((Math.atan2(w.to[1] - w.y, w.to[0] - w.x) / (Math.PI * 2)) * DIRS + DIRS) % DIRS, turn = ((Math.round(want) - this.dir + DIRS + DIRS / 2) % DIRS) - DIRS / 2; this.dir = (this.dir + Math.sign(turn) + DIRS) % DIRS; }
    const t = sheet.tex[this.dir * FRAMES + (w.moving ? Math.floor(this.t * 10) % FRAMES : 0)]; this.sprite.texture = t; this.shadow.texture = t;
    const x = Math.floor(w.x * art) - sheet.side / 2, y = Math.floor(w.y * art) - sheet.side / 2;
    this.sprite.position.set(x, y); this.shadow.position.set(x + Math.round(sheet.lift * SHADOW.x), y + Math.round(sheet.lift * SHADOW.y));
  }
}

interface Opt { name: string; sub: string; floor: 'real' | 'poly' | 'pixel'; bodies: 'real' | 'poly' | 'steady' | 'pixel' | 'bakedPixel' | 'bakedPoly'; art: number; show: number }
const OPTS2: Opt[] = [
  { name: 'Low poly, steady', sub: "today's floor; all animals at 10 fps, on whole pixels", floor: 'real', bodies: 'steady', art: 1, show: 2 },
  { name: 'Low poly, steady, chunkier', sub: "today's floor; the same at 16 px a tile", floor: 'real', bodies: 'steady', art: 2 / 3, show: 3 },
  { name: 'Pixels, 24 px a tile', sub: "today's floor; animals painted at 10 fps", floor: 'real', bodies: 'pixel', art: 1, show: 2 },
  { name: 'Pixels, 16 px a tile', sub: "today's floor; animals painted at 10 fps", floor: 'real', bodies: 'pixel', art: 2 / 3, show: 3 },
  { name: 'Baked pixels, 16 px', sub: 'less movement: 16 headings, 4 steps, a stiff body', floor: 'real', bodies: 'bakedPixel', art: 2 / 3, show: 3 },
  { name: 'Baked low poly, 16 px', sub: 'less movement: 16 headings, 4 steps, a stiff body', floor: 'real', bodies: 'bakedPoly', art: 2 / 3, show: 3 },
];
const OPTS1: Opt[] = [
  { name: 'Today', sub: 'the real floor and animal classes', floor: 'real', bodies: 'real', art: 1, show: 2 },
  { name: 'Low poly, improved', sub: 'clean facets, warm light, one pixel of outline, baked floor', floor: 'poly', bodies: 'poly', art: 1, show: 2 },
  { name: 'Low poly, improved, chunkier', sub: 'the same at 16 px a tile', floor: 'poly', bodies: 'poly', art: 2 / 3, show: 3 },
  { name: 'Pixels, 24 px a tile', sub: 'painted natively; animals at 10 fps; cast shadows', floor: 'pixel', bodies: 'pixel', art: 1, show: 2 },
  { name: 'Pixels, 16 px a tile', sub: 'the same, closer to classic pixel art', floor: 'pixel', bodies: 'pixel', art: 2 / 3, show: 3 },
  { name: 'Mix: low-poly world, pixel animals', sub: 'can a swap work later?', floor: 'poly', bodies: 'pixel', art: 1, show: 2 },
];
const pixelCaustic = (() => { const n = 64, src = new BufferImageSource({ resource: causticPixels(n), width: n, height: n, ...nearest() }); return new Texture({ source: src }); })();

class Panel {
  root = new Container(); scene = new Container(); floorHost = new Container(); shadows = new Container(); animals = new Container();
  baked: BakedActor[] = []; rt: RenderTexture | null = null; real: { c: Creature; w: Walker }[] = []; poly: PolyActor[] = []; pix: PixelActor[] = [];
  floor: Floor | null = null; g = new Graphics(); sh = new Graphics(); caustic: TilingSprite | null = null; t = 0; on = true;
  constructor(public o: Opt, x: number, y: number) {
    this.root.position.set(x, y); app.stage.addChild(this.root);
    const W = Math.round(BW * o.art), H = Math.round(BH * o.art);
    if (o.floor === 'real') { this.floor = new Floor(); this.floor.set(life); this.floorHost.addChild(this.floor.root); }
    else if (o.floor === 'poly') this.floorHost.addChild(new Sprite(bakePolyFloor(app, life, o.art)));
    else { const f = paintFloor(life, o.art); this.floorHost.addChild(new Sprite(new Texture({ source: new BufferImageSource({ resource: f.out, width: f.W, height: f.H, ...nearest() }) }))); }
    if (o.floor !== 'real') { this.caustic = new TilingSprite({ texture: pixelCaustic, width: W, height: H }); this.caustic.alpha = 0.05; this.caustic.blendMode = 'add'; }
    this.shadows.alpha = 0.3;
    this.scene.addChild(this.floorHost, this.shadows, this.animals); if (this.caustic) this.scene.addChild(this.caustic);
    if (o.bodies === 'real') { this.scene.scale.set(o.art); this.shadows.filters = [new AlphaFilter({ alpha: 0.3, resolution: 1 })]; this.shadows.alpha = 1; this.shadows.addChild(this.sh); this.animals.addChild(this.g); }
    const poly = o.bodies === 'poly' || o.bodies === 'steady';
    if (poly) { this.animals.filters = [outlineFilter()]; if (o.bodies === 'steady') this.animals.filterArea = new Rectangle(0, 0, BW, BH); }
    if (poly || o.bodies === 'real' || o.floor === 'real') { // the world in a low-res picture
      if (o.bodies !== 'real') this.floorHost.scale.set(o.art);
      this.rt = RenderTexture.create({ width: W, height: H, resolution: 1, scaleMode: 'nearest', antialias: false });
      const s = new Sprite(this.rt); s.scale.set(o.show); this.root.addChild(s);
      if (poly) { this.shadows.scale.set(o.art); this.animals.scale.set(o.art); }
    } else { this.scene.scale.set(o.show); this.root.addChild(this.scene); const m = new Graphics().rect(0, 0, PW, PH).fill(0xffffff); this.root.addChild(m); this.root.mask = m; }
    const name = new Text({ resolution: 2, text: o.name, style: { fontSize: 26, fontWeight: 'bold', fill: 0xe8dcc0 } }), sub = new Text({ resolution: 2, text: o.sub, style: { fontSize: 20, fill: 0xb8ac90 } });
    name.scale.set(0.5); sub.scale.set(0.5); name.position.set(0, -TOP + 1); sub.position.set(0, -TOP + 17); (this.root.parent as Container).addChild(name, sub);
    name.position.set(x, y - TOP + 1); sub.position.set(x, y - TOP + 17);
  }
  setCast(list: Walker[]) {
    const { o } = this;
    for (const p of this.pix) { p.sprite.destroy(); p.shadow.destroy(); }
    for (const p of this.poly) { p.g.destroy(); p.sh.destroy(); }
    for (const p of this.baked) { p.sprite.destroy(); p.shadow.destroy(); }
    this.pix = []; this.poly = []; this.real = []; this.baked = [];
    if (o.bodies === 'real') this.real = list.map((w) => { const c = w.spec.today(); c.place(w.x, w.y, 0); return { c, w }; });
    if (o.bodies === 'poly') this.poly = list.map((w, k) => new PolyActor(w, this.animals, this.shadows, k < 3 ? 1 : 4));
    if (o.bodies === 'steady') this.poly = list.map((w) => new PolyActor(w, this.animals, this.shadows, 1, o.art));
    if (o.bodies === 'bakedPixel' || o.bodies === 'bakedPoly') this.baked = list.map((w) => new BakedActor(w, o.art, this.animals, this.shadows, o.bodies === 'bakedPixel' ? 'pixel' : 'poly'));
    if (o.bodies === 'pixel') this.pix = list.map((w) => new PixelActor(w, o.art, this.animals, this.shadows, 10));
  }
  tick(dt: number) {
    if (!this.on) return;
    this.t += dt;
    if (!still) this.floor?.tick(dt);
    if (!still && this.caustic && Math.floor(this.t * 6) !== Math.floor((this.t - dt) * 6)) this.caustic.tilePosition.set(Math.floor(this.t * 6) * 1, Math.floor(this.t * 6) * -1);
    if (this.o.bodies === 'real') {
      this.g.clear(); this.sh.clear();
      for (const a of this.real) { a.c.head.x = a.w.x; a.c.head.y = a.w.y; a.c.moving.v += ((a.w.moving ? 0.8 : 0) - a.c.moving.v) * Math.min(1, dt * 8); a.c.update(dt); a.c.draw(this.g, this.sh, () => false); }
    }
    for (const a of this.poly) a.tick(dt);
    for (const a of this.pix) a.tick(dt);
    for (const a of this.baked) a.tick(dt);
    if (this.rt) app.renderer.render({ container: this.scene, target: this.rt, clear: true });
  }
}

if (q.has('old')) { OPTS2[4] = { name: 'Low poly, as first shown', sub: "nearest 3 every frame, others every 4th, sliding", floor: 'real', bodies: 'poly', art: 1, show: 2 }; OPTS2[5] = { name: 'Low poly chunkier, as first shown', sub: 'the same at 16 px a tile', floor: 'real', bodies: 'poly', art: 2 / 3, show: 3 }; }
const OPTS = round2 ? OPTS2 : OPTS1;
if (view === 'board') {
  const panels = OPTS.map((o, k) => new Panel(o, (k % 3) * (PW + GAP), TOP + Math.floor(k / 3) * (PH + TOP + GAP)));
  let list = walkers(8); for (const p of panels) p.setCast(list);
  let paused = false;
  app.ticker.add(() => { if (paused) return; const dt = Math.min(0.05, app.ticker.deltaMS / 1000); for (const w of list) stepWalker(w, dt); for (const p of panels) p.tick(dt); });
  /** Each way alone: 8 and 50 animals, the whole frame on the main thread. */
  const cost = async () => {
    paused = true; const out: Record<string, number[]> = {};
    for (const p of panels) p.root.visible = false;
    for (const p of panels) {
      p.root.visible = true; out[p.o.name] = [];
      for (const n of [8, 50]) {
        list = walkers(n); p.setCast(list);
        let c = 0, sum = 0, t0 = 0, skip = 30;
        const before = () => { t0 = performance.now(); for (const w of list) stepWalker(w, 1 / 60); p.tick(1 / 60); };
        const after = () => { if (skip-- <= 0) { sum += performance.now() - t0; c++; } };
        app.ticker.add(before, null, UPDATE_PRIORITY.HIGH); app.ticker.add(after, null, UPDATE_PRIORITY.UTILITY);
        while (c < 60) await new Promise((r) => requestAnimationFrame(r));
        app.ticker.remove(before); app.ticker.remove(after);
        out[p.o.name].push(+(sum / c).toFixed(1));
      }
      p.root.visible = false;
    }
    list = walkers(8); for (const p of panels) { p.root.visible = true; p.setCast(list); }
    paused = false;
    document.getElementById('out')!.innerHTML = `<table><tr><th>Way</th><th>8 animals, ms</th><th>50 animals, ms</th></tr>${OPTS.map((o) => `<tr><td>${o.name}</td><td>${out[o.name][0]}</td><td>${out[o.name][1]}</td></tr>`).join('')}</table>`;
    return out;
  };
  document.getElementById('run')!.addEventListener('click', () => void cost());
  /** How long one animal takes to paint: pure JavaScript, nothing drawn. */
  const paintMs = () => { const res: Record<string, number> = {}; for (const s of CAST.slice(0, 4)) { const w = walkers(1)[0]; w.spec = s; const a = new PixelActor(w, 1, new Container(), new Container(), 10); const t = performance.now(); for (let k = 0; k < 300; k++) a.tick(1 / 60, true); res[s.lineage] = +((performance.now() - t) / 300).toFixed(3); a.sprite.destroy(); a.shadow.destroy(); } return res; };
  const floorMs = () => { const t = performance.now(); const f = paintFloor(life, 1); return { ms: +(performance.now() - t).toFixed(1), kb: Math.round(f.out.length / 1024) }; };
  /** Flicker: pixels that change and then flip straight back, on consecutive frames. Floor frozen (?still). */
  const flicker = async (frames = 180) => {
    paused = true; const res = panels.map((p) => ({ name: p.o.name, changed: 0, flip: 0, a: null as Uint8ClampedArray | null, b: null as Uint8ClampedArray | null }));
    for (let f = 0; f < frames; f++) {
      for (const w of list) stepWalker(w, 1 / 60);
      for (let k = 0; k < panels.length; k++) {
        const p = panels[k], r = res[k]; p.tick(1 / 60); if (!p.rt) continue;
        const px = app.renderer.extract.pixels(p.rt).pixels as Uint8ClampedArray, cur = new Uint8ClampedArray(px);
        if (r.a && r.b) for (let i = 0; i < cur.length; i += 4) { const ch = r.b[i] !== cur[i] || r.b[i + 1] !== cur[i + 1] || r.b[i + 2] !== cur[i + 2]; if (ch) { r.changed++; if (r.a[i] === cur[i] && r.a[i + 1] === cur[i + 1] && r.a[i + 2] === cur[i + 2]) r.flip++; } }
        r.a = r.b; r.b = cur;
      }
      if (f % 20 === 0) await new Promise((d) => setTimeout(d));
    }
    paused = false; return res.map((r) => [r.name, Math.round(r.changed / frames), Math.round(r.flip / frames)]);
  };
  Object.assign(window, { __toy: { app, cost, paintMs, floorMs, flicker, bakeMs: () => +bakeMs.toFixed(0) } });
} else if (view === 'sizes') {
  beasts();
  const ids: [LineageId, number, Record<string, PartId>][] = [['worm', 3, {}], ['arthropod', 3, { front0: 'claw', side4: 'gill' }], ['trilobite', 3, {}], ['anomalocaris', 3, {}], ['fish' as LineageId, 3, {}], ['salamander' as LineageId, 3, {}]];
  const SIZES = [8, 12, 16, 24, 48], CW = 232, CH = 134, ticks: ((dt: number) => void)[] = [];
  app.stage.addChild(new Graphics().rect(0, 0, 1240, 960).fill(mixC(PAL.sand[3], 0x8a7a58, 0.2)));
  SIZES.forEach((px, c) => { const t = new Text({ resolution: 2, text: `${px} px a tile`, style: { fontSize: 26, fontWeight: 'bold', fill: 0x2a1f12 } }); t.scale.set(0.5); t.position.set(c * CW + 10, 4); app.stage.addChild(t); });
  ids.forEach(([id, size, parts], r) => SIZES.forEach((px, c) => {
    const art = px / 24, show = 96 / px, b = new Body(newBuild(id, size, parts), null, 0); b.ramp = cozy(b.ramp); b.place(0, 0, 0); b.treadmill = 16; b.moving.v = 0.8;
    const side = Math.ceil((b.L + b.R * 2 + b.u() * 4) * art * 2 + 8) & ~1, P = new Paint(side, side), src = new BufferImageSource({ resource: P.out, width: side, height: side, ...nearest() }), tex = new Texture({ source: src }), s = new Sprite(tex), sh = new Sprite(tex);
    for (const v of [sh, s]) { v.anchor.set(0.5); v.scale.set(show); app.stage.addChild(v); }
    const cx = c * CW + CW / 2, cy = r * CH + 96; s.position.set(cx, cy); sh.tint = 0x1a1030; sh.alpha = 0.26; sh.position.set(cx + Math.max(1, Math.round(b.lin.lift * art * SHADOW.x)) * show, cy + Math.max(1, Math.round(b.lin.lift * art * SHADOW.y)) * show);
    let held = 1; ticks.push((dt) => { b.update(dt); held += dt; if (held < 0.1) return; held = 0; P.clear(); paintBody(P, b, side / 2 + (b.L * art) / 2, side / 2, art); P.finish(0); src.update(); });
  }));
  app.ticker.add(() => { const dt = Math.min(0.05, app.ticker.deltaMS / 1000); for (const t of ticks) t(dt); });
  Object.assign(window, { __toy: { app } });
} else {
  const list = beasts(), CW = 306, CH = 222, sheet = new Container(); app.stage.addChild(sheet);
  const bg = new Graphics().rect(0, 0, 1240, 960).fill(mixC(PAL.sand[3], 0x8a7a58, 0.2)); sheet.addChild(bg);
  const make = (id: LineageId, size: number, parts: Record<string, PartId> | undefined) => { const nb = newBuild(id, size, parts ?? {}); if (id === 'lobopod') { delete nb.parts.back0; delete nb.parts.back2; } const b = new Body(nb, null, 0); b.ramp = cozy(b.ramp); b.place(0, 0, 0); b.treadmill = 16; b.moving.v = 0.8; return b; };
  const ticks: ((dt: number) => void)[] = [];
  list.forEach((a, k) => {
    const x = (k % 4) * (CW + 4) + 6, y = Math.floor(k / 4) * (CH + 4) + 4, card = new Container(); card.position.set(x, y); sheet.addChild(card);
    card.addChild(new Graphics().rect(0, 0, CW, CH).fill({ color: 0x000000, alpha: 0.07 }));
    const t = new Text({ resolution: 2, text: LINEAGES[a.id].name, style: { fontSize: 22, fontWeight: 'bold', fill: 0x2a1f12 } }); t.scale.set(0.5); t.position.set(4, 2); card.addChild(t);
    // Pixels at 24 and 16 a tile, moving
    for (const [art, show, cx, cy] of [[1, 3, 74, 70], [2 / 3, 3, 222, 70]] as const) {
      const b = make(a.id, a.size, a.parts), side = Math.ceil((b.L + b.R * 2 + b.u() * 4) * art * 2 + 8) & ~1, P = new Paint(side, side), src = new BufferImageSource({ resource: P.out, width: side, height: side, ...nearest() }), tex = new Texture({ source: src }), s = new Sprite(tex), sh = new Sprite(tex);
      for (const v of [sh, s]) { v.scale.set(show); v.anchor.set(0.5); card.addChild(v); }
      sh.tint = 0x1a1030; sh.alpha = 0.26; s.position.set(cx, cy); sh.position.set(cx + Math.round(b.lin.lift * art * SHADOW.x) * show, cy + Math.round(b.lin.lift * art * SHADOW.y) * show);
      let held = Math.random() * 0.1;
      const off = (b.L * art) / 2;
      ticks.push((dt) => { b.update(dt); held += dt; if (held < 0.1) return; held = 0; P.clear(); paintBody(P, b, side / 2 + off, side / 2, art); P.finish(0); src.update(); });
    }
    // Low poly, improved
    const pb = make(a.id, a.size, a.parts), rt = RenderTexture.create({ width: 92, height: 62, resolution: 1, scaleMode: 'nearest', antialias: false }), scene = new Container(), g = new StylePen(), shg = new Graphics(); shg.alpha = 0.26;
    g.filters = [outlineFilter()]; scene.addChild(shg, g); scene.position.set(46 + pb.L / 2, 31);
    const vs = new Sprite(rt); vs.scale.set(2); vs.position.set(-16, 124); card.addChild(vs);
    let h2 = Math.random() * 0.066;
    ticks.push((dt) => { pb.update(dt); h2 += dt; if (h2 < 0.066) return; h2 = 0; g.clear(); shg.clear(); polyBody(pb, g, shg); app.renderer.render({ container: scene, target: rt, clear: true }); });
    // A plate: the same painter, finished in ink. Still, and four times the resolution.
    const art = 2.6, pl = make(a.id, a.size, a.parts); pl.update(0.3); const side = Math.ceil((pl.L + pl.R * 2 + pl.u() * 4) * art * 2 + 8) & ~1, P = new Paint(side, side);
    pl.ramp = LINEAGES[a.id] ? pl.ramp : pl.ramp; pl.segs(); paintBody(P, pl, side / 2 + (pl.L * art) / 2, side / 2, art); P.finishPlate(0xe9dfc6);
    const plate = new Sprite(new Texture({ source: new BufferImageSource({ resource: P.out, width: side, height: side }) })); plate.anchor.set(0.5); plate.scale.set(Math.min(1, 132 / ((pl.L + pl.R * 1.6) * art))); plate.position.set(232, 164);
    card.addChild(new Graphics().rect(158, 112, CW - 162, CH - 116).fill(0xe9dfc6), plate);
  });
  const texts = new Text({ resolution: 2, text: 'each card: pixels 24 a tile · pixels 16 a tile · low poly improved · ink plate', style: { fontSize: 22, fill: 0x2a1f12 } }); texts.scale.set(0.5); texts.position.set(8, 912); sheet.addChild(texts);
  app.ticker.add(() => { const dt = Math.min(0.05, app.ticker.deltaMS / 1000); for (const t of ticks) t(dt); });
  Object.assign(window, { __toy: { app } });
}
