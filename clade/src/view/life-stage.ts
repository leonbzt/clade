// The ported board layers and input. One transient scene lives until Back to the map.
import 'pixi.js/unsafe-eval';
import { AlphaFilter, Application, Container, Graphics } from 'pixi.js';
import { NODES, TURNS } from '../data/life';
import * as E from '../sim/economy';
import * as L from '../sim/life';
import { pickMutation } from '../sim/mutation';
import { useVerb } from '../sim/verbs';
import type { PartId, VerbId } from '../sim/records';
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
import { C, PAL } from './shade';
import { startTweens } from './tween';

export class LifeStage {
  private app = new Application();
  private observer?: ResizeObserver;
  private stopTweens?: () => void;
  private disposed = false;
  private initialized = false;
  private ended = false;
  private sceneReady = false;
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

  constructor(readonly life: L.Life, private complete: () => void, private changed: () => void) {}

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
      lay: () => void this.act(() => E.lay(this.life)), verb: (v) => void this.verb(v), enforce: (p) => void this.enforce(p) });
    const cam = new Camera(world, app.canvas, (x, y) => this.tap(x, y), (x, y) => { marks.hover = S.busy ? -1 : this.tileAt(x, y); });
    cam.shakeAmt = feel.shake; cam.zoomSpeed = feel.zoomSpeed;
    const you = new Body(this.life), hunter = new Hunter();
    const rivals = this.life.rivals.map((r) => {
      const b = new Body({ ...this.life, build: { ...r.build, clade: r.build.clade === 'arthropod' || r.build.clade === 'trilobite' ? r.build.clade : 'worm' }, size: 5, lost: [], mutation: null }, PAL.rival);
      const c = centre(L.at(r.x, r.y)); b.place(c.x, c.y, -Math.PI / 2); return b;
    });
    Object.assign(S, { app, floor, fx, marks, cam, hud, hunter, you, rivals, life: this.life, busy: false });
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
    app.ticker.add((tk) => {
      const dt = Math.min(0.05, tk.deltaMS / 1000);
      you.update(dt); rivals.forEach((r) => r.update(dt)); hunter.update(dt);
      floor.tick(dt); marks.tick(dt); fx.tick(dt); cam.tick(dt); hud.tick(dt);
      shadows.clear(); bodies.clear(); above.clear();
      rivals.forEach((r) => r.draw(bodies, shadows)); you.draw(bodies, shadows, inMud); hunter.draw(above, shadows);
    });
    this.sync(true); hud.info('Tap a lit tile to move. Drag to pan; pinch or wheel to zoom.');
    window.addEventListener('keydown', this.key);
    Object.assign(window, { __game: {
      get life() { return S.life; }, get busy() { return S.busy; }, tile: (i: number) => screen(centre(i)),
      move: (i: number) => this.act(() => L.move(this.life, i)), wait: () => this.act(() => L.stay(this.life)),
      grow: () => this.act(() => E.grow(this.life)), enforce: (p: PartId) => this.enforce(p),
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
  }
  async act(action: () => unknown, offer = false) {
    if (this.disposed || !this.initialized || S.busy || this.life.phase !== 'play' || this.offering !== offer) return;
    S.busy = true; S.marks.dests.clear(); S.marks.hover = -1;
    this.life.events = []; action();
    S.hud.refresh(this.life, false, true); this.changed();
    try { await play(this.life.events.slice()); }
    finally { if (!this.disposed) { S.busy = false; this.sync(); S.hud.info(this.life.lines.slice(-2).join(' ')); } }
    if (!this.disposed && (this.life.phase as L.Life['phase']) === 'over' && !this.ended) { this.ended = true; this.complete(); }
  }
  addFood() { return this.act(() => { this.life.food += 10; }); }
  mutate(part: PartId | null) { return this.act(() => pickMutation(this.life, part), true); }
  endSeason() {
    return this.act(() => {
      this.life.turn = TURNS; this.life.phase = 'over'; this.life.cause = 'season';
      L.emit(this.life, { k: 'over', cause: 'season' });
    });
  }
  private verb(v: VerbId) { return this.act(() => useVerb(this.life, v)); }
  private enforce(p: PartId) { return this.act(() => E.enforce(this.life, p)); }
  private tileAt(x: number, y: number) {
    const tx = Math.floor(x / C), ty = Math.floor(y / C); return L.inB(tx, ty) ? L.at(tx, ty) : -1;
  }
  private tap(x: number, y: number) {
    if (S.busy || this.offering) return;
    const i = this.tileAt(x, y); if (i < 0) return;
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
