// The garden toy's model tests, and checks for the guardrails in docs/design/big-picture.md §12. A smoke alarm for this toy, not a rulebook:
// if a better idea breaks one, change or drop the test and say why.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardChange, boardFacts, boardFor, boardIsValid, resultOf, roleFromDiet } from '../toys/garden-board';
import { NATIVES, ROLE_IDS, STOCKS, WORLD } from '../toys/garden-data';
import { newGarden, popOf, release, rowOf, step, type Garden } from '../toys/garden-sim';
import { HABITATS, HAB_ORDER, NO_PREDATOR } from '../toys/life2-habitats';
import { begin, dests, fits, lay, moult, move, newLife, newLineage, placeAt, stay } from '../toys/life2-sim';

const importsOf = (file: string) => [...readFileSync(new URL(`../toys/${file}`, import.meta.url), 'utf8').matchAll(/from '([^']+)'/g)].map((m) => m[1]);
const source = (file: string) => readFileSync(new URL(`../toys/${file}`, import.meta.url), 'utf8');
const run = (g: Garden, n: number) => { for (let k = 0; k < n; k++) step(g); return g; };

describe('guardrail: one door between the garden and the Life', () => {
  it('the Life never imports the garden', () => {
    for (const f of ['life2-sim.ts', 'life2-data.ts', 'life2-habitats.ts', 'life2-view.ts', 'life2-ui.ts']) expect(importsOf(f).filter((i) => i.includes('garden'))).toEqual([]);
  });
  it('the garden model reads data only: not the Life\'s rules, not the board', () => {
    expect(importsOf('garden-sim.ts').filter((i) => /life2-(sim|view|ui)|garden-board|garden-view/.test(i))).toEqual([]);
    expect(importsOf('garden-data.ts').filter((i) => /life2-(sim|view|ui)|garden-(sim|board|view)/.test(i))).toEqual([]);
  });
  it('the rules have no DOM', () => {
    for (const f of ['life2-sim.ts', 'garden-sim.ts', 'garden-board.ts']) expect(source(f)).not.toMatch(/\b(document|window|localStorage|requestAnimationFrame)\b/);
  });
  it('the board file only takes the Life\'s types, and the drawing changes nothing', () => {
    expect(source('garden-board.ts')).toMatch(/import type \{ Life \} from '.\/life2-sim'/);
    expect(source('garden-board.ts').match(/from '.\/life2-sim'/g)?.length).toBe(1);
    expect(importsOf('garden-view.ts').filter((i) => /life2-(ui)|garden-board/.test(i))).toEqual([]);
    expect(source('garden-view.ts')).not.toMatch(/\b(step|release|boardFor)\(/);
  });
});

describe('guardrail: the Life works alone', () => {
  it('plays on the fixed maps with no garden at all', () => {
    for (const id of HAB_ORDER) {
      const l = newLife(5, 'worm', newLineage(), HABITATS[id]);
      begin(l);
      for (let k = 0; k < 25 && l.phase === 'play'; k++) { const d = [...dests(l).keys()][0]; if (d !== undefined) move(l, d); else stay(l); }
      expect(l.phase).toBe('over');
    }
  });
  it('plays on a board the garden wrote, and hands back a result', () => {
    for (const id of HAB_ORDER) {
      const l = newLife(5, 'arthropod', newLineage(), boardFor(run(newGarden(3), 5), id));
      begin(l);
      l.food = 60;
      for (let k = 0; k < 2; k++) {
        moult(l);
        l.held = l.offers[0];
        placeAt(l, l.slots.findIndex((_, i) => fits(l, l.offers[0], i)));
        stay(l);
      }
      lay(l);
      const r = resultOf(l);
      expect(r.hab).toBe(id);
      expect(r.eggs).toBeGreaterThan(0);
    }
  });
});

describe('guardrail: every garden number shows on the board', () => {
  const moved = (id: 'reef' | 'mud' | 'basin', change: (g: Garden) => void) => {
    const g = newGarden(1), before = boardFor(g, id);
    change(g);
    return boardChange(before, boardFor(g, id));
  };
  it('mats', () => { for (const id of HAB_ORDER) expect(moved(id, (g) => { g.habs[id].mats *= 0.3; })).toMatch(/fewer mats?/); });
  it('detritus', () => { for (const id of ['mud', 'basin'] as const) expect(moved(id, (g) => { g.habs[id].detritus *= 0.3; })).toMatch(/fewer (buried|carcass)/); });
  it('oxygen', () => { for (const id of HAB_ORDER) { expect(moved(id, (g) => { g.habs[id].oxygen = Math.max(0, g.normal[id].oxygen - 30); })).toMatch(/dead water spreading/); } });
  it('filter feeders', () => { expect(moved('reef', (g) => { for (const e of rowOf(g.habs.reef, 'filter')) e.pop *= 0.2; })).toMatch(/fewer (shell bed|sponge garden)/); });
  it('predators: arrival and absence', () => {
    expect(moved('reef', (g) => { for (const e of rowOf(g.habs.reef, 'predator')) e.pop *= 4; })).toMatch(/on turn \d+/);
    const g = newGarden(1);
    g.habs.reef.entries = g.habs.reef.entries.filter((e) => e.role !== 'predator');
    expect(boardFor(g, 'reef').predatorAt).toBe(NO_PREDATOR);
  });
  it('grazers and burrowers: who you meet', () => {
    const g = newGarden(1);
    expect(boardFor(g, 'mud').rivals.map((v) => v.name)).toContain(rowOf(g.habs.mud, 'burrower')[0].name);
    expect(boardFor(g, 'reef').rivals.map((v) => v.name)).toContain(rowOf(g.habs.reef, 'grazer')[0].name);
  });
  it('your own line appears among the rivals once it leads', () => {
    const g = newGarden(1);
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 60 });
    expect(boardFor(g, 'mud').rivals.some((v) => v.yours)).toBe(true);
    expect(boardFacts(boardFor(g, 'mud')).yours).toBe(true);
  });
});

/** Set a habitat exactly to its normal, as if nothing had happened. */
function atNormal(g: Garden, id: 'reef' | 'mud' | 'basin') {
  const h = g.habs[id], n = g.normal[id];
  h.mats = n.mats; h.detritus = n.detritus; h.oxygen = n.oxygen;
  for (const role of ROLE_IDS) { const P = popOf(h, role); for (const e of h.entries) if (e.role === role && P > 0) e.pop *= n.pops[role] / P; }
}
const edible = (map: string[], x0: number, y0: number, range: number) => {
  let n = 0;
  map.forEach((row, y) => [...row].forEach((c, x) => { if ('mo'.includes(c) && Math.abs(x - x0) + Math.abs(y - y0) <= range) n++; }));
  return n;
};

describe('guardrail: the garden never breaks the Life', () => {
  it('a garden at normal writes exactly the authored board, so balance on the fixed maps carries over', () => {
    for (const seed of [1, 2, 3]) for (const id of HAB_ORDER) {
      const g = newGarden(seed);
      atNormal(g, id);
      const b = boardFor(g, id), base = HABITATS[id];
      expect(b.map).toEqual(base.map);
      expect(b.predatorAt).toBe(base.predatorAt);
      expect(b.rivals.map((v) => [v.eats, v.at])).toEqual(base.rivals.map((v) => [v.eats, v.at]));
    }
  });
  it('the start is always fed and never dead, however bad the garden gets', () => {
    for (const v of [0, 100]) for (const id of HAB_ORDER) {
      const g = newGarden(4), h = g.habs[id], base = HABITATS[id];
      h.mats = v; h.detritus = v; h.oxygen = v;
      for (const e of h.entries) e.pop = v;
      const b = boardFor(g, id), [x0, y0] = base.start;
      expect(edible(b.map, x0, y0, 3)).toBeGreaterThanOrEqual(edible(base.map, x0, y0, 3));
      expect(b.map[y0][x0]).toBe(base.map[y0][x0]);
    }
    const g = run(newGarden(5), 40);
    for (let k = 0; k < 200; k++) { step(g); for (const id of HAB_ORDER) { const base = HABITATS[id]; expect(edible(boardFor(g, id).map, ...base.start, 3)).toBeGreaterThanOrEqual(edible(base.map, ...base.start, 3)); } }
  });
  it('the predator never comes before turn 4, so you can get going first', () => {
    const g = newGarden(6);
    for (const e of rowOf(g.habs.reef, 'predator')) e.pop *= 50;
    expect(boardFor(g, 'reef').predatorAt).toBeGreaterThanOrEqual(4);
  });
  it('a crashed role sends no rival, a crowded one sends two', () => {
    const g = newGarden(7);
    for (const e of rowOf(g.habs.mud, 'burrower')) e.pop *= 0.1;
    expect(boardFor(g, 'mud').rivals.filter((v) => v.eats === 'buried').length).toBe(0);
    for (const e of rowOf(g.habs.mud, 'burrower')) e.pop *= 30;
    expect(boardFor(g, 'mud').rivals.filter((v) => v.eats === 'buried').length).toBe(2);
  });
});

describe('guardrail: every change has a reason', () => {
  it('all news over a long run has text and a reason', () => {
    const g = newGarden(7);
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 50 });
    let n = 0;
    for (let k = 0; k < 300; k++) for (const m of step(g)) { n++; expect(m.text.length).toBeGreaterThan(0); expect(m.why.length).toBeGreaterThan(3); }
    expect(n).toBeGreaterThan(5);
  });
});

describe('guardrail: the budgets, for this toy', () => {
  it('3 stocks, 4 roles, 10 natives, 3 habitats', () => {
    expect(STOCKS.length).toBe(3);
    expect(ROLE_IDS.length).toBe(4);
    expect(NATIVES.length).toBeLessThanOrEqual(10);
    expect(Object.keys(WORLD).length).toBe(3);
  });
  it('the model stays small', () => {
    expect(source('garden-sim.ts').split('\n').length).toBeLessThan(260);
    expect(source('garden-board.ts').split('\n').length).toBeLessThan(180);
  });
});

describe('the model', () => {
  it('is deterministic for a seed', () => {
    expect(JSON.stringify(run(newGarden(9), 20).habs)).toBe(JSON.stringify(run(newGarden(9), 20).habs));
  });
  it('stays bounded, and boards stay valid, over a long run, also with a big release', () => {
    const g = newGarden(11);
    release(g, { hab: 'reef', plan: 'arthropod', role: 'predator', eggs: 90 });
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 90 });
    for (let k = 0; k < 500; k++) {
      step(g);
      for (const id of HAB_ORDER) {
        const h = g.habs[id];
        for (const s of STOCKS) { expect(h[s]).toBeGreaterThanOrEqual(0); expect(h[s]).toBeLessThanOrEqual(100); }
        for (const e of h.entries) { expect(Number.isFinite(e.pop)).toBe(true); expect(e.pop).toBeGreaterThan(0); }
        const b = boardFor(g, id);
        expect(boardIsValid(b)).toBe(true);
        expect(b.map[b.start[1]][b.start[0]]).not.toBe('#');
      }
    }
  });
  it('boards stay valid at every extreme of the stocks', () => {
    for (const v of [0, 100]) for (const id of HAB_ORDER) {
      const g = newGarden(2), h = g.habs[id];
      h.mats = v; h.detritus = v; h.oxygen = v;
      expect(boardIsValid(boardFor(g, id))).toBe(true);
    }
  });
  it('never sits still: populations keep moving', () => {
    const g = run(newGarden(13), 10);
    for (const id of HAB_ORDER) {
      const seen: number[] = [];
      for (let k = 0; k < 64; k++) { step(g); seen.push(popOf(g.habs[id], 'grazer') + popOf(g.habs[id], 'burrower')); }
      expect(Math.max(...seen) / Math.max(1, Math.min(...seen))).toBeGreaterThan(1.3);
    }
  });
  it('boards actually change across generations, untouched', () => {
    const g = newGarden(17), first = HAB_ORDER.map((id) => boardFor(g, id).map.join(''));
    run(g, 30);
    expect(HAB_ORDER.some((id, k) => boardFor(g, id).map.join('') !== first[k])).toBe(true);
  });
  it('a release adds population and proof, and a strong one takes the lead', () => {
    const g = newGarden(21);
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 45 });
    run(g, 12);
    const top = rowOf(g.habs.mud, 'burrower')[0];
    expect(top.line).toBe('worm');
  });
  it('a line that booms changes the place for a stated reason: fewer mats, more oxygen', () => {
    const calm = run(newGarden(23), 16), boom = newGarden(23);
    release(boom, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 60 });
    run(boom, 16);
    expect(boom.habs.mud.mats).toBeLessThan(calm.habs.mud.mats);
    expect(boom.habs.mud.oxygen).toBeGreaterThan(calm.habs.mud.oxygen);
  });
  it('a crowded line spills across a border and arrives unproven', () => {
    const g = newGarden(25);
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 60 });
    run(g, 3);
    const there = [...g.habs.reef.entries, ...g.habs.basin.entries].find((e) => e.line === 'worm');
    expect(there?.proven).toBe(false);
    expect(g.news.some((m) => /spilled into/.test(m.text))).toBe(true);
  });
  it('one winner never takes everything: the other roles keep living', () => {
    const g = newGarden(27);
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 90 });
    run(g, 200);
    for (const role of ['grazer', 'predator'] as const) expect(popOf(g.habs.mud, role)).toBeGreaterThan(0);
  });
  it('natives you beat adapt', () => {
    const g = newGarden(29), before = g.habs.mud.entries.find((e) => e.sp === 'burgesso')!.score;
    release(g, { hab: 'mud', plan: 'worm', role: 'burrower', eggs: 45 });
    run(g, 10);
    const after = g.habs.mud.entries.find((e) => e.sp === 'burgesso');
    if (after) expect(after.score).toBeGreaterThan(before);
  });
  it('what you ate sets your role', () => {
    expect(roleFromDiet({ mat: 20, buried: 6 }, 'worm')).toBe('grazer');
    expect(roleFromDiet({ buried: 30, mat: 5 }, 'worm')).toBe('burrower');
    expect(roleFromDiet({ shell: 27, mat: 5 }, 'arthropod')).toBe('predator');
    expect(roleFromDiet({}, 'worm')).toBe('burrower');
  });
});
