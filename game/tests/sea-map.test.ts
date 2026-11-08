import { afterEach, describe, expect, it, vi } from 'vitest';
import { freshSeaSave, serializeSeaSave } from '../src/sim/sea-save';
import { launchPatches } from '../src/sim/sea-life';
import { release, step } from '../src/sim/sea';
import { feedsAs } from '../src/sim/feeding';
import { historyRows, linePatches, markerCounts, patchAtPoint, speciesColour, speciesKey } from '../src/view/sea-map-data';
import { makeMap } from '../src/view/sea-map';

afterEach(() => vi.unstubAllGlobals());
describe('living map projections', () => {
  it('maps resized pointer coordinates and rejects outside/zero bounds', () => {
    const s = freshSeaSave(1, 0).sea, r = { left: 17, top: 21, width: 351, height: 223 };
    for (const p of s.patches) for (const t of p.tiles) {
      const x = r.left + (t % s.isl.w + 0.5) / s.isl.w * r.width;
      const y = r.top + (Math.floor(t / s.isl.w) + 0.5) / s.isl.h * r.height;
      expect(patchAtPoint(s, r, x, y)).toBe(p.id);
    }
    expect(patchAtPoint(s, r, r.left + r.width, r.top)).toBe(-1);
    expect(patchAtPoint(s, { ...r, width: 0 }, 0, 0)).toBe(-1);
  });
  it('keeps empty markers empty, caps decoration, and separates spread from access', () => {
    const s = freshSeaSave(2, 0);
    for (let i = 0; i < 4; i++) step(s.sea);
    expect(markerCounts(s.sea)).toEqual([]);
    release(s.sea, 0, 'worm', 'burrower', 50);
    s.continuation = { patch: 0, species: 'line:worm:burrower', plan: 'worm', role: 'burrower', eggs: 50 };
    const distant = s.sea.patches.find((p) => !launchPatches(s).includes(p.id))!;
    release(s.sea, distant.id, 'worm', 'burrower', 50);
    expect(linePatches(s.sea, s.continuation.species)).toEqual([0, distant.id]);
    expect(launchPatches(s)).toEqual([0, ...s.sea.patches[0].nb]);
    for (const p of s.sea.patches) p.pop.fill(1000);
    expect(markerCounts(s.sea).reduce((n, m) => n + m.count, 0)).toBeLessThanOrEqual(200);
  });
  it('keeps stable species keys and classifies hunters by tools including legacy bodies', () => {
    const s = freshSeaSave(3, 0).sea;
    const worm = s.species.find((sp) => sp.id === 'line:worm:predator')!;
    worm.parts = ['proboscis'];
    const swimmer = s.species.find((sp) => sp.id === 'line:swimmer:grazer')!;
    swimmer.parts = ['arms'];
    const legacy = { ...worm, id: 'legacy:unknown:predator', name: 'Unknown resident', plan: undefined, line: false };
    s.species = [swimmer, legacy, worm]; s.patches[0].pop = new Float64Array([100, 100, 100]);
    expect(feedsAs(worm).hunt).toBe(0); expect(feedsAs(swimmer).hunt).toBe(1);
    expect(markerCounts(s).filter((m) => m.patch === 0).map((m) => m.count)).toEqual([1, 2, 2]);
    expect(speciesKey(legacy)).toContain('Unknown resident');
    expect(speciesKey(worm)).not.toBe(speciesKey(swimmer));
    expect(speciesColour(worm)).toEqual(speciesColour({ ...worm }));
  });
  it('reads only recorded history rows through ring wrap', () => {
    const s = freshSeaSave(1, 0).sea, p = s.patches[0];
    expect(historyRows(s, p)).toEqual([{ gen: 0, values: [p.hist[0], p.hist[1], 0, p.hist[3]] }]);
    for (let i = 0; i < 65; i++) step(s);
    const rows = historyRows(s, p);
    expect(rows).toHaveLength(60); expect(rows[0].gen).toBe(6); expect(rows[59].gen).toBe(65);
    expect(rows[59].values[0]).toBeCloseTo(p.mats, 4);
  });
  it('draws every overlay and decorative frame without changing sea/save/RNG', () => {
    const s = freshSeaSave(4, 0); release(s.sea, 0, 'worm', 'burrower', 30);
    const before = serializeSeaSave(s);
    const context = new Proxy({}, { get: () => () => {}, set: () => true });
    const canvas = () => ({ width: 0, height: 0, getContext: () => context, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 240 }) });
    vi.stubGlobal('document', { createElement: canvas });
    vi.stubGlobal('getComputedStyle', () => ({ fontFamily: 'sans-serif', borderLeftWidth: '3px', borderRightWidth: '3px', borderTopWidth: '3px', borderBottomWidth: '3px' }));
    const map = makeMap(canvas() as unknown as HTMLCanvasElement);
    map.setSea(s.sea);
    for (const p of s.sea.patches) for (const t of p.tiles) {
      const x = 3 + (t % s.sea.isl.w + 0.5) / s.sea.isl.w * 384;
      const y = 3 + (Math.floor(t / s.sea.isl.w) + 0.5) / s.sea.isl.h * 234;
      expect(map.patchAt(x, y)).toBe(p.id);
    }
    expect(map.patchAt(1, 1)).toBe(-1);
    map.mark(launchPatches(s), 0, 0, [0]); map.pulse(0, [255, 255, 255]);
    for (const view of ['holder', 'mats', 'oxygen', 'hunters'] as const) {
      map.setView(view); map.updateHerds(); for (let i = 0; i < 5; i++) map.draw();
    }
    expect(serializeSeaSave(s)).toBe(before);
  });
  it('numbers empty eligible neighbours in every overlay while retaining clutch, selection and line cues', () => {
    const s = freshSeaSave(4, 0), labels: { text: string; colour: string }[] = [];
    const context = new Proxy({ fillStyle: '' }, {
      get: (target, key) => key === 'fillText' ? (text: string) => labels.push({ text, colour: target.fillStyle }) : key in target ? Reflect.get(target, key) : () => {},
      set: (target, key, value) => Reflect.set(target, key, value),
    });
    const canvas = () => ({ width: 0, height: 0, getContext: () => context });
    vi.stubGlobal('document', { createElement: canvas });
    vi.stubGlobal('getComputedStyle', () => ({ fontFamily: 'sans-serif' }));
    const map = makeMap(canvas() as unknown as HTMLCanvasElement); map.setSea(s.sea);
    map.mark(launchPatches(s), null, null, []); map.draw();
    expect(labels.map((l) => l.text)).toEqual(s.sea.patches.map((p) => `${p.id + 1}`));
    s.continuation = { patch: 0, species: 'line:worm:burrower', plan: 'worm', role: 'burrower', eggs: 3 };
    const ids = launchPatches(s), distant = s.sea.patches.find((p) => !ids.includes(p.id))!.id;
    const selected = ids[1];
    map.mark(ids, selected, 0, [distant]);
    for (const view of ['holder', 'mats', 'oxygen', 'hunters'] as const) {
      labels.length = 0; map.setView(view); map.draw();
      expect(labels).toEqual(s.sea.patches.filter((p) => ids.includes(p.id) || p.id === distant).map((p) => ({
        text: `${p.id === distant ? '•' : ''}${p.id + 1}`,
        colour: p.id === 0 ? '#ffe033' : p.id === selected || p.id === distant ? '#ffffff' : '#68e8bd',
      })));
    }
    expect(markerCounts(s.sea)).toEqual([]);
  });
});
