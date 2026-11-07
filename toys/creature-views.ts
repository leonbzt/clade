// Toy 18: a region of the one canvas, tied to a DOM cell; the comparison with today's hand-written animals; the crowd of 50.
// One Pixi renderer at the game's own pixel size, so the toy shows what the game would show.
import { AlphaFilter, Container, Graphics } from 'pixi.js';
import { Arthropod } from '../game/src/view/arthropod';
import { C, PAL } from '../game/src/view/shade';
import { Swimmer, Wiwaxia } from '../game/src/view/swimmer';
import { Worm, type BodySlot, type Creature } from '../game/src/view/worm';
import type { PartId as GamePart } from '../game/src/data/life';
import { LINEAGES, PARTS, STARTERS, FROM_DATA, type LineageId, type PartId } from './creature-data';
import { allSlots, fits, newBuild, type Build } from './creature-model';
import { Body, RAMPS } from './creature-body';

/** Graphics that can draw everything in one colour, for the silhouette test. */
export class Pen extends Graphics {
  mono: number | null = null;
  override fill(style?: any, alpha?: number) { return this.mono === null ? super.fill(style, alpha) : super.fill({ color: this.mono, alpha: style?.alpha ?? 1 }); }
  override stroke(style?: any) { return this.mono === null ? super.stroke(style) : super.stroke({ ...style, color: this.mono }); }
}

export class Region {
  root = new Container();
  world = new Container();
  bg = new Graphics();
  sh = new Pen();
  g = new Pen();
  above = new Graphics();
  w = 1; h = 1; zoom = 1; cx = 0; cy = 0;
  private clip = new Graphics();
  private shLayer = new Container();

  constructor(parent: Container, public el: HTMLElement, private ground: number) {
    this.shLayer.addChild(this.sh);
    this.shLayer.filters = [new AlphaFilter({ alpha: 0.3, resolution: 0.5 })];
    this.world.addChild(this.shLayer, this.g, this.above);
    this.root.addChild(this.bg, this.world, this.clip);
    this.root.mask = this.clip;
    parent.addChild(this.root);
  }
  /** Lay out to the DOM cell. */
  fit(stage: DOMRect) {
    const r = this.el.getBoundingClientRect(), b = 2;
    this.root.position.set(r.left - stage.left + b, r.top - stage.top + b);
    this.w = Math.max(1, r.width - 2 * b); this.h = Math.max(1, r.height - 2 * b);
    this.clip.clear().rect(0, 0, this.w, this.h).fill(0xffffff);
    this.paintBg();
  }
  paintBg(colour = this.ground) { this.bg.clear().rect(0, 0, this.w, this.h).fill(colour); }
  /** Put world point (cx, cy) in the middle, at this zoom. */
  look(zoom: number, cx = 0, cy = 0, pop = 1) {
    this.zoom = zoom; this.cx = cx; this.cy = cy;
    this.world.scale.set(zoom * pop);
    this.world.position.set(this.w / 2 - cx * zoom * pop, this.h / 2 - cy * zoom * pop);
  }
  toWorld(sx: number, sy: number) { return { x: this.cx + (sx - this.w / 2) / this.zoom, y: this.cy + (sy - this.h / 2) / this.zoom }; }
  setMono(on: boolean, colour = PAL.ink) { this.g.mono = on ? colour : null; this.shLayer.visible = !on; }
  clear() { this.g.clear(); this.sh.clear(); this.above.clear(); }
  show(on: boolean) { this.root.visible = on; }
}

/** Either body, on a little path. Today's classes and the general body offer the same fields. */
interface Actor { c: Creature | Body; phase: number; speed: number; rx: number; ry: number }
const walk = (a: Actor, dt: number, cx = 0, cy = 0) => {
  a.phase += dt * a.speed;
  a.c.head.x = cx + Math.sin(a.phase) * a.rx; a.c.head.y = cy + Math.sin(a.phase * 2) * a.ry;
  a.c.moving.v = 0.7; a.c.update(dt);
};
const draw = (c: Creature | Body, g: Graphics, sh: Graphics) => (c as Creature).draw(g, sh, () => false);
const slot = (kind: BodySlot['kind'], part: string, seg = 0, side = 'front'): BodySlot => ({ kind, side, seg, part: part as GamePart });
const pair = (seg: number, part: string): BodySlot[] => [slot('side', part, seg, 'left'), slot('side', part, seg, 'right')];
const TRILO = RAMPS.trilo;

interface Row { label: string; today: () => Creature; lineage: LineageId; colour: 'you' | 'rival' | 'own'; slots: BodySlot[]; parts: Record<string, PartId> }
const ROWS: Row[] = [
  { label: 'Worm', today: () => new Worm(PAL.you), lineage: 'worm', colour: 'you', slots: [slot('head', 'eye'), ...pair(0, 'gill'), ...pair(1, 'chaetae'), slot('tail', 'sclerite')], parts: { crown0: 'eye', side0: 'gill', side2: 'bristles', tail0: 'spine' } },
  { label: 'Rival worm → Bristle worm', today: () => new Worm(PAL.rival, true, 0.85), lineage: 'bristle', colour: 'rival', slots: [], parts: {} },
  { label: 'Wiwaxia', today: () => new Wiwaxia(), lineage: 'wiwaxia', colour: 'own', slots: [], parts: {} },
  { label: 'Arthropod', today: () => new Arthropod(PAL.you, 1.2), lineage: 'arthropod', colour: 'you', slots: [slot('head', 'claw'), slot('head', 'eye'), ...pair(0, 'spine'), ...pair(1, 'gill'), ...pair(2, 'leg'), slot('tail', 'spine')], parts: { front0: 'claw', crown0: 'eye', side0: 'spine', side2: 'gill', side4: 'leg', tail0: 'spine' } },
  { label: 'Trilobite', today: () => new Arthropod(TRILO, 1.1, true), lineage: 'trilobite', colour: 'own', slots: [slot('head', 'eye'), ...pair(0, 'spine'), ...pair(1, 'gill')], parts: { crown0: 'eye', side0: 'spine', side2: 'gill' } },
  { label: 'Anomalocaris (your swimmer)', today: () => new Swimmer(PAL.you), lineage: 'anomalocaris', colour: 'you', slots: [], parts: {} },
];

export class Compare {
  regions: Region[] = [];
  private cells: { row: Row; today: boolean; big: boolean; region: Region; actor: Actor }[] = [];
  size = 3;
  withParts = false;

  constructor(private layer: Container, private host: HTMLElement) {
    for (const row of ROWS) {
      const phase = Math.random() * 6, div = document.createElement('div');
      div.className = 'cmp'; div.style.display = 'grid'; div.style.gap = '4px';
      host.appendChild(div);
      for (const [today, big] of [[true, true], [false, true], [true, false], [false, false]] as const) {
        const el = document.createElement('div');
        el.className = 'cell';
        el.innerHTML = `<span class="cap">${big ? (today ? row.label + ': today' : 'New body') : today ? 'Today, board' : 'New, board'}</span>`;
        div.appendChild(el);
        const region = new Region(layer, el, PAL.sand[1]);
        this.regions.push(region);
        this.cells.push({ row, today, big, region, actor: { c: this.makeBody(row, today), phase, speed: 0.42, rx: 15, ry: 8 } });
      }
    }
    this.apply();
  }

  private makeBody(row: Row, today: boolean): Creature | Body {
    if (today) { const c = row.today(); c.place(0, 0, 0); return c; }
    const colour = row.colour === 'own' ? null : row.colour === 'you' ? PAL.you : PAL.rival;
    return new Body(newBuild(row.lineage, this.size), colour, 0);
  }

  /** The size or the parts changed: the same change on both sides. */
  apply() {
    for (const c of this.cells) {
      if (c.today) (c.actor.c as Creature).setBody(this.size, this.withParts ? c.row.slots : [], false);
      else (c.actor.c as Body).setBuild(newBuild(c.row.lineage, this.size, this.withParts ? c.row.parts : {}));
    }
  }

  tick(dt: number, mono: boolean) {
    for (const c of this.cells) {
      const r = c.region;
      r.look(c.big ? Math.min(r.w / (60 + 10 * this.size), r.h / (30 + 6 * this.size)) : 1.875);
      r.setMono(mono); r.clear();
      walk(c.actor, dt);
      draw(c.actor.c, r.g, r.sh);
    }
  }
}

/** Fifty creatures at board size, so the cost is measured rather than guessed. */
export function randomBuild(): Build {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)], ids = [...STARTERS, ...FROM_DATA], lineage = pick(ids), parts: Record<string, PartId> = {};
  for (const s of allSlots(LINEAGES[lineage])) {
    if (Math.random() < 0.45) parts[s.id] = pick((Object.keys(PARTS) as PartId[]).filter((p) => fits(p, s.kind)));
  }
  return newBuild(lineage, 1 + Math.floor(Math.random() * 5), parts);
}

export type CrowdMode = 'new' | 'today' | 'loaded';

/** `new` and `today` draw the same fifty: same animals, sizes and parts. `loaded` is the new body with 45% of its slots full. */
export class Crowd {
  region: Region;
  mode: CrowdMode = 'new';
  ms = 0; frame = 0;
  private actors: (Actor & { cx: number; cy: number })[] = [];
  private seats = Array.from({ length: 50 }, (_, k) => ({ row: ROWS[k % ROWS.length], size: 1 + Math.floor(Math.random() * 5), parts: Math.random() < 0.5, x: Math.random() - 0.5, y: Math.random() - 0.5, phase: Math.random() * 6, speed: 0.4 + Math.random() * 0.4 }));

  constructor(layer: Container, el: HTMLElement) { this.region = new Region(layer, el, PAL.sand[1]); this.fill(); }

  private make(q: Crowd['seats'][number]): Creature | Body {
    if (this.mode === 'loaded') return new Body(randomBuild(), PAL.you, 0.4);
    if (this.mode === 'new') return new Body(newBuild(q.row.lineage, q.size, q.parts ? q.row.parts : {}), PAL.you, 0);
    const c = q.row.today(); c.setBody(q.size, q.parts ? q.row.slots : [], false); return c;
  }

  fill() {
    const W = this.region.w / 1.875, H = this.region.h / 1.875;
    this.actors = this.seats.map((q) => {
      const cx = q.x * (W - C * 2), cy = q.y * (H - C * 2), c = this.make(q);
      (c as Creature).place(cx, cy, 0);
      return { c, phase: q.phase, speed: q.speed, rx: C * 0.9, ry: C * 0.5, cx, cy };
    });
  }

  tick(dt: number, mono: boolean) {
    const r = this.region;
    r.look(1.875); r.setMono(mono); r.clear();
    const t0 = performance.now();
    for (const a of this.actors) { walk(a, dt, a.cx, a.cy); draw(a.c, r.g, r.sh); }
    this.ms += (performance.now() - t0 - this.ms) * 0.05;
  }
}
