// Slice 18: the body toy's model. Every part draws on every allowed slot at every size; recipes match; no way in loses a part;
// the drawing code knows no animal by name, so a new lineage is data alone.
import { describe, expect, it } from 'vitest';
import type { Graphics } from 'pixi.js';
import { FROM_DATA, LINEAGES, PARTS, RECIPES, STARTERS, type LineageId, type PartId } from '../../toys/creature-data';
import { allSlots, become, fits, newBuild, partsIn, progress, signatureOf, SIZE_MAX, SIZE_MIN, MODES, type Build } from '../../toys/creature-model';
import { Body } from '../../toys/creature-body';
import { drawMapForm } from '../../toys/creature-parts';
import { lineageLines } from '../../toys/creature-cost';
import bodySrc from '../../toys/creature-body.ts?raw';
import partsSrc from '../../toys/creature-parts.ts?raw';
import gaitSrc from '../../toys/creature-gait.ts?raw';

const ALL = [...STARTERS, ...FROM_DATA] as LineageId[];
const PART_IDS = Object.keys(PARTS) as PartId[];

/** A stand-in for Graphics: it checks every number and tracks how far the drawing reaches. */
class Pen {
  calls = 0; bad = 0; x0 = 1e9; x1 = -1e9; y0 = 1e9; y1 = -1e9;
  private see(xs: number[]) {
    this.calls++;
    for (let k = 0; k < xs.length; k++) {
      if (!Number.isFinite(xs[k])) this.bad++;
      else if (k % 2) { this.y0 = Math.min(this.y0, xs[k]); this.y1 = Math.max(this.y1, xs[k]); } else { this.x0 = Math.min(this.x0, xs[k]); this.x1 = Math.max(this.x1, xs[k]); }
    }
    return this;
  }
  poly(p: number[]) { return this.see(p); }
  moveTo(x: number, y: number) { return this.see([x, y]); }
  lineTo(x: number, y: number) { return this.see([x, y]); }
  rect(x: number, y: number, w: number, h: number) { return this.see([x, y, x + w, y + h]); }
  circle(x: number, y: number, r: number) { return this.see([x - r, y - r, x + r, y + r]); }
  fill() { return this; }
  stroke() { return this; }
  setTransform() { return this; }
}

function drawn(b: Build, walk = true) {
  const body = new Body(b), pen = new Pen(), sh = new Pen();
  body.place(0, 0, 0.4);
  Object.assign(body, { t: 1 });
  if (walk) { body.moving.v = 1; body.stretch.v = 0.4; for (let k = 0; k < 4; k++) { body.head.x += 3; body.head.y += k % 2; body.update(0.05); } } else body.update(0);
  body.draw(pen as unknown as Graphics, sh as unknown as Graphics);
  return { pen, sh, body };
}

describe('the general body', () => {
  it('draws every part on every allowed slot at every size, on every lineage', () => {
    let draws = 0;
    for (const id of ALL) for (const s of allSlots(LINEAGES[id])) for (const part of PART_IDS) {
      if (!fits(part, s.kind)) continue;
      for (let size = SIZE_MIN; size <= SIZE_MAX; size++) {
        const { pen, sh } = drawn(newBuild(id, size, { [s.id]: part }));
        expect(pen.bad + sh.bad, `${id} ${s.id} ${part} size ${size}`).toBe(0);
        expect(pen.calls).toBeGreaterThan(0);
        draws++;
      }
    }
    expect(draws).toBeGreaterThan(1000);
  });

  it('has a place on some lineage for every part, and every lineage draws at map size', () => {
    for (const part of PART_IDS) expect(ALL.some((id) => allSlots(LINEAGES[id]).some((s) => fits(part, s.kind)))).toBe(true);
    for (const id of ALL) for (const part of PART_IDS) {
      const pen = new Pen();
      drawMapForm(pen as unknown as Graphics, new Body(newBuild(id, 3)), part, 5, 5, 1);
      expect(pen.bad).toBe(0);
    }
  });

  it('gets bigger with size, and each part changes the outline of a bare worm', () => {
    const span = (b: Build) => { const { pen } = drawn(b, false); return [pen.x0, pen.x1, pen.y0, pen.y1]; };
    for (const id of ALL) { const a = span(newBuild(id, 1)), z = span(newBuild(id, 5)); expect(z[1] - z[0], id).toBeGreaterThan(a[1] - a[0]); }
    for (const part of PART_IDS) {
      const s = allSlots(LINEAGES.worm).find((q) => fits(part, q.kind))!, was = span(newBuild('worm', 3)), now = span(newBuild('worm', 3, { [s.id]: part }));
      expect(now.some((v, k) => Math.abs(v - was[k]) > 0.3), part).toBe(true);
    }
  });

  it('turns a loose spine and keeps a stiff one straight', () => {
    const bent = (id: LineageId) => {
      const body = new Body(newBuild(id, 3));
      body.place(0, 0, 0);
      for (let k = 0; k < 30; k++) { body.head.x += 1; body.update(0.03); }
      for (let k = 0; k < 8; k++) { body.head.y += 1; body.update(0.03); }
      const J = body.segs(), a = J[1].a, z = J[J.length - 1].a;
      return Math.abs(Math.atan2(Math.sin(a - z), Math.cos(a - z)));
    };
    expect(bent('worm')).toBeGreaterThan(0.3);
    expect(bent('arthropod')).toBeLessThan(0.05);
  });

  it('names no animal in its drawing code: a new lineage is data alone', () => {
    for (const id of ALL) for (const src of [bodySrc, partsSrc, gaitSrc]) expect(src.includes(`'${id}'`), id).toBe(false);
    for (const id of ALL) expect(lineageLines(id), id).toBeLessThanOrEqual(9);
  });
});

describe('recipes', () => {
  /** The cheapest build that meets a recipe, plus extras if there's room. */
  const buildFor = (id: string, extra: PartId[] = []) => {
    const r = RECIPES.find((q) => q.id === id)!, b = newBuild(r.from, 3), slots = allSlots(LINEAGES[r.from]);
    const want = [...(Object.entries(r.needs) as [PartId, number][]).flatMap(([p, n]) => Array<PartId>(n).fill(p)), ...extra];
    for (const p of want) { const s = slots.find((q) => !b.parts[q.id] && fits(p, q.kind)); if (s) b.parts[s.id] = p; }
    return { r, b };
  };

  it('matches its parts and only on its own base', () => {
    for (const r of RECIPES) {
      const empty = progress(newBuild(r.from, 3), r);
      expect(empty.ready).toBe(false); expect(empty.have).toBe(0);
      const { b } = buildFor(r.id), p = progress(b, r);
      expect(p.ready, r.id).toBe(true); expect(p.have).toBe(p.need);
      expect(progress({ ...b, lineage: r.to }, r).ready).toBe(false);
    }
  });

  it('never loses a part, in any of the three ways in, with extras or without', () => {
    const sorted = (l: PartId[]) => [...l].sort().join();
    for (const r of RECIPES) for (const m of MODES) for (const keep of [false, true]) for (const extra of [[], ['gill', 'eye', 'spine', 'fan'], ['spine', 'spine', 'spine', 'spine', 'spine', 'spine']] as PartId[][]) {
      const { b } = buildFor(r.id, extra), res = become(b, r, m.id, keep);
      expect(sorted([...res.fused, ...res.onSlots, ...res.kept]), `${r.id} ${m.id}`).toBe(sorted(partsIn(b)));
      expect(res.build.lineage).toBe(r.to);
      expect(progress(res.build, r).have, `${r.id} ${m.id} keeps the recipe parts`).toBe(progress(b, r).have);
      const { pen } = drawn(res.build);
      expect(pen.bad).toBe(0);
    }
  });

  it('puts them in the way the switch says', () => {
    for (const r of RECIPES) {
      const { b } = buildFor(r.id), need = Object.values(r.needs).reduce((a, n) => a + (n ?? 0), 0);
      expect(become(b, r, 'integrated').fused.length).toBe(need);
      expect(become(b, r, 'default').fused.length).toBe(0);
      expect(become(b, r, 'default').onSlots.length).toBe(need);
      const mix = become(b, r, 'mix');
      expect(mix.fused).toEqual([r.signature]); expect(mix.onSlots.length).toBe(need - 1);
      const open = allSlots(LINEAGES[r.to]).filter((s) => !mix.build.fused.some((u) => u.slot === s.id));
      expect(Object.keys(mix.build.parts).every((id) => open.some((s) => s.id === id))).toBe(true);
    }
  });

  it('names the form from its base and extras', () => {
    const t = RECIPES.find((r) => r.id === 'trilobite')!;
    expect(become(buildFor('trilobite').b, t, 'mix').build.name).toBe('Rockplate');
    expect(become(buildFor('trilobite', ['spine', 'spine']).b, t, 'mix').build.name).toBe('Thornplate');
  });

  it('marks a body on the map by what it carries', () => {
    expect(signatureOf(newBuild('worm', 3))).toBe(LINEAGES.worm.sig);
    expect(signatureOf(newBuild('arthropod', 3, { front0: 'claw', side0: 'leg' }))).toBe('claw');
    expect(signatureOf(newBuild('worm', 3, { side0: 'gill', side1: 'gill', crown0: 'eye' }))).toBe('gill');
  });
});
