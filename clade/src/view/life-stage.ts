// The ported board layers and input. One transient scene lives until Back to the map.
import 'pixi.js/unsafe-eval';
import { AlphaFilter, Application, Container, Graphics } from 'pixi.js';
import { NODES, TURNS } from '../data/life';
import { KIT, type KitId } from '../data/kit';
import * as E from '../sim/economy';
import * as K from '../sim/kit';
import * as L from '../sim/life';
import * as T from '../sim/tree';
import { pickMutation } from '../sim/mutation';
import { edible, huntHint, useVerb } from '../sim/verbs';
import type { Build, PartId, VerbId } from '../sim/records';
import { Hud } from '../ui/life/hud';
import { feel } from '../ui/life/feel';
import { Body } from './body';
import { Camera } from './camera';
import { Floor } from './floor';
import { Fx } from './fx';
import { Hunter } from './hunter';
import { Marks } from './marks';
import { play } from './playback';
import { S, centre, dirAngle, dress, screen } from './scene';
import { C, PAL, type Ramp } from './shade';
import { startTweens } from './tween';

export class LifeStage {
  private app = new Application();
  private observer?: ResizeObserver;
  private stopTweens?: () => void;
  private disposed = false;
  private initialized = false;
  private ended = false;
  private sceneReady = false;
  private beatAt = 0;
  get busy() { return !this.sceneReady || S.busy; }
  /** The mutation offer is modal: the board waits until a part is picked or passed. */
  get offering() { return this.life.phase === 'play' && !!this.life.mutationOffer?.length; }
  private key = (e: KeyboardEvent) => {
    if (e.repeat || this.offering || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === ' ' && e.target instanceof HTMLButtonElement) return;
    if (e.key === 'w' || e.key === ' ') { e.preventDefault(); void this.act(() => L.stay(this.life)); }
    if (e.key === 'l') void this.act(() => E.lay(this.life));
    if (e.key === 'm') void this.act(() => E.grow(this.life));
    if (e.key === '0') S.cam.reset();
    const v = L.verbs(this.life)['123456'.indexOf(e.key)];
    if (v) void this.verb(v);
  };

  constructor(readonly life: L.Life, private complete: () => void, private changed: () => void,
    private clock: () => boolean = () => false) {}

  async init(host: HTMLElement) {
    const app = this.app;
    await app.init({ antialias: false, background: PAL.deep, resolution: 1 / feel.pixel, autoDensity: true,
      width: host.clientWidth || 360, height: host.clientHeight || 480, preference: 'webgl' });
    this.initialized = true;
    if (this.disposed) { app.destroy(true, { children: true }); return; }
    host.appendChild(app.canvas);
    this.stopTweens = startTweens(app.ticker);
    const world = new Container(), floor = new Floor(), fx = new Fx(), marks = new Marks();
    const shadows = new Graphics(), shadowLayer = new Container(), bodies = new Graphics(), above = new Graphics();
    shadowLayer.addChild(shadows); shadowLayer.filters = [new AlphaFilter({ alpha: 0.3 })];
    world.addChild(floor.root, fx.under, shadowLayer, marks.g, bodies, above, fx.over); app.stage.addChild(world);
    const hud = new Hud({ wait: () => void this.act(() => L.stay(this.life)), grow: () => void this.act(() => E.grow(this.life)),
      lay: () => void this.act(() => E.lay(this.life)), verb: (v) => void this.verb(v), enforce: (p) => void this.enforce(p),
      spend: (p) => void this.spend(p), point: () => void this.point() });
    const cam = new Camera(world, app.canvas, (x, y) => this.tap(x, y), (x, y) => { marks.hover = S.busy ? -1 : this.tileAt(x, y); });
    cam.shakeAmt = feel.shake; cam.zoomSpeed = feel.zoomSpeed;
    const you = new Body(this.life), hunter = new Hunter();
    // Residents are drawn grown, with a board plan: a swimmer or cell shows as a worm.
    const resident = (build: Build, ramp: Ramp) => new Body({ ...this.life, build: { ...build, clade: build.clade === 'arthropod' || build.clade === 'trilobite' ? build.clade : 'worm' }, size: 5, lost: [], mutation: null, tree: undefined, kit: undefined }, ramp);
    const rivals = this.life.rivals.map((r) => {
      const b = resident(r.build, PAL.rival), c = centre(L.at(r.x, r.y)); b.place(c.x, c.y, -Math.PI / 2); return b;
    });
    if (this.life.board.predator) hunter.stand = resident(this.life.board.predator.build, PAL.hunter);
    Object.assign(S, { app, floor, fx, marks, cam, hud, hunter, you, rivals, caught: new Set<number>(), life: this.life, busy: false });
    this.sceneReady = true;
    floor.set(this.life);
    const start = centre(L.at(this.life.x, this.life.y)); you.place(start.x, start.y, dirAngle(this.life.facing));
    const inMud = (x: number, y: number) => {
      const tx = Math.floor(x / C), ty = Math.floor(y / C);
      return this.life.build.clade === 'worm' && L.inB(tx, ty) && L.tile(this.life, tx, ty).t === 'mud';
    };
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w < 10 || h < 10) return;
      app.renderer.resize(w, h, 1 / feel.pixel); cam.resize(w, h);
    };
    this.observer = new ResizeObserver(resize); this.observer.observe(host); resize();
    this.beatAt = performance.now() + KIT.beatMs;
    app.ticker.add((tk) => {
      const dt = Math.min(0.05, tk.deltaMS / 1000);
      you.update(dt); rivals.forEach((r) => r.update(dt)); hunter.update(dt);
      floor.tick(dt); marks.tick(dt); fx.tick(dt); cam.tick(dt); hud.tick(dt);
      shadows.clear(); bodies.clear(); above.clear();
      rivals.forEach((r, k) => { if (!S.caught.has(k)) r.draw(bodies, shadows); }); you.draw(bodies, shadows, inMud); hunter.draw(above, shadows);
      this.beat();
    });
    this.sync(true); hud.info(`${huntHint(this.life) ?? ''} Tap a lit tile to move. Drag to pan; pinch or wheel to zoom.`.trim());
    window.addEventListener('keydown', this.key);
    Object.assign(window, { __game: {
      get life() { return S.life; }, get busy() { return S.busy; }, tile: (i: number) => screen(centre(i)),
      move: (i: number) => this.act(() => L.move(this.life, i)), wait: () => this.act(() => L.stay(this.life)),
      grow: () => this.act(() => E.grow(this.life)), enforce: (p: PartId) => this.enforce(p),
      task: (x: number, y: number) => this.task(x, y), step: () => this.step(), kit: () => this.life.kit,
      spend: (p: KitId) => this.spend(p), point: () => this.point(),
      mutate: (p: PartId | null) => this.mutate(p),
      lay: () => this.act(() => E.lay(this.life)), verb: (v: VerbId) => this.verb(v),
      get destinations() { return [...L.dests(S.life).keys()]; }, fps: () => app.ticker.FPS,
    } });
  }

  private sync(instant = false) {
    const l = this.life;
    S.floor.refresh(); dress(S.you, l); S.hunter.resting = l.pred?.state === 'rest';
    if (l.pred?.state !== 'strike') S.marks.marks = [];
    S.marks.entry = !l.pred && l.phase === 'play' && l.board.predatorAt !== null ? L.at(...l.board.entry) : -1;
    const wait = S.busy || this.offering;
    S.marks.dests = wait ? new Map() : L.dests(l); S.hud.refresh(l, instant, wait); this.changed();
    S.marks.prey = wait || l.phase !== 'play' ? [] : edible(l).map((i) => L.at(l.rivals[i].x, l.rivals[i].y));
  }
  async act(action: () => unknown, offer = false, automatic = false) {
    if (this.disposed || !this.initialized || S.busy || this.life.phase !== 'play' || this.offering !== offer) return;
    if (this.life.kit) {
      if (!automatic) K.setTask(this.life, null);
      this.beatAt = performance.now() + KIT.beatMs;
    }
    S.busy = true; S.marks.dests.clear(); S.marks.prey = []; S.marks.hover = -1;
    this.life.events = []; const result = action();
    S.hud.refresh(this.life, false, true); this.changed();
    try { if (!this.life.kit || result !== false) await play(this.life.events.slice()); }
    finally { if (!this.disposed) { S.busy = false; this.sync(); S.hud.info(this.life.lines.slice(-2).join(' ')); } }
    if (!this.disposed && (this.life.phase as L.Life['phase']) === 'over' && !this.ended) { this.ended = true; this.complete(); }
  }
  addFood() { return this.act(() => { this.life.food += 10; }); }
  mutate(part: PartId | null) { return this.act(() => pickMutation(this.life, part), true); }
  endSeason() {
    return this.act(() => {
      this.life.turn = this.life.kit ? L.season(this.life) : TURNS; this.life.phase = 'over'; this.life.cause = 'season';
      L.emit(this.life, { k: 'over', cause: 'season' });
    });
  }
  private verb(v: VerbId) { return this.act(() => useVerb(this.life, v)); }
  private enforce(p: PartId) { return this.act(() => E.enforce(this.life, p)); }
  private spend(p: KitId) {
    if (this.life.kit) return this.act(() => K.spend(this.life, p));
    return this.act(() => T.spend(this.life, p as PartId));
  }
  private point() {
    if (this.life.kit) return this.act(() => K.buyPoint(this.life));
    return this.act(() => T.buyPoint(this.life));
  }
  task(x: number, y: number) {
    if (!this.life.kit || this.busy || this.offering || !L.inB(x, y)) return;
    const i = L.at(x, y);
    if (this.life.pred?.state === 'strike') {
      if (L.dests(this.life).has(i)) return this.act(() => L.move(this.life, i));
      return;
    }
    if (i === L.at(this.life.x, this.life.y) && !this.life.tiles[i].node) {
      K.setTask(this.life, null); return;
    }
    if (K.setTask(this.life, i)) return this.step();
  }
  step() {
    if (this.life.kit) return this.act(() => K.stepTask(this.life), false, true);
  }
  private beat() {
    if (!this.life.kit || this.disposed || this.busy || this.offering || this.life.phase !== 'play'
      || this.life.pred?.state === 'strike' || performance.now() < this.beatAt) return;
    if (this.life.kit.task !== null) void this.step();
    else if (this.clock()) void this.act(() => L.stay(this.life), false, true);
  }
  private tileAt(x: number, y: number) {
    const tx = Math.floor(x / C), ty = Math.floor(y / C); return L.inB(tx, ty) ? L.at(tx, ty) : -1;
  }
  private tap(x: number, y: number) {
    if (S.busy || this.offering) return;
    const i = this.tileAt(x, y); if (i < 0) return;
    if (this.life.kit && this.life.pred?.state !== 'strike') { void this.task(...L.xy(i)); return; }
    if (L.dests(this.life).has(i)) void this.act(() => L.move(this.life, i));
    else {
      const t = this.life.tiles[i];
      S.hud.info(!L.known(t) ? 'Mud: hidden food. Worms tunnel through it.' : t.node
        ? `${NODES[t.node].name} · ${L.foodOf(this.life, t.node)} food${L.lockOf(this.life, t.node) ? ` · ${L.lockOf(this.life, t.node)}` : ''}`
        : `${t.t} · out of reach this turn`);
    }
  }
  destroy() {
    this.disposed = true; window.removeEventListener('keydown', this.key); this.observer?.disconnect();
    if (this.sceneReady) S.hud.destroy();
    this.stopTweens?.();
    if (this.initialized) this.app.destroy(true, { children: true });
    Reflect.deleteProperty(window, '__game');
  }
}
