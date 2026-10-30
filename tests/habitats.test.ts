import { describe, expect, it } from 'vitest';
import { GEAR, HABITAT_KINDS } from '../src/data/habitats';
import { botTick } from '../src/sim/bot';
import { classify, kindOf, MAJOR, PATCH, remap, updateHabitats } from '../src/sim/habitats';
import { createState, LAVA, type State } from '../src/sim/state';

const K = (id: string) => HABITAT_KINDS.findIndex((d) => d.id === id);
/** A block of w × h land tiles near the island's middle made plain open ground: some soil, dry, sunny, no salt, lava. */
function plain(s: State, w: number, h: number): number[][] {
  const x0 = (s.w >> 1) - (w >> 1), y0 = (s.h >> 1) - (h >> 1), rows: number[][] = [];
  for (let y = 0; y < h; y++) {
    rows.push([]);
    for (let x = 0; x < w; x++) {
      const i = (y0 + y) * s.w + x0 + x;
      s.terrain[i] = LAVA; s.statuses.salty[i] = 0; s.scar[i] = -1;
      s.layers.soil[i] = 0.3; s.layers.water[i] = 0.3; s.layers.shade[i] = 0;
      rows[y].push(i);
    }
  }
  classify(s);
  return rows;
}
/** Deep soil on these tiles (open ground elsewhere in the block), then a window's remap. */
function deep(s: State, rows: number[][], on: (x: number, y: number) => boolean) {
  rows.forEach((r, y) => r.forEach((i, x) => { s.layers.soil[i] = on(x, y) ? 0.8 : 0.3; }));
  classify(s);
  updateHabitats(s, false, remap(s));
}

describe('habitats', () => {
  it("doesn't flip a tile at the edge of a kind", () => {
    const s = createState(1), i = plain(s, 1, 1)[0][0];
    expect(s.hab[i]).toBe(K('open'));
    const at = (water: number, cur: number) => { s.layers.water[i] = water; return kindOf(s, i, cur); };
    expect(at(0.62, K('open'))).toBe(K('open')); // just past the line isn't enough
    expect(at(0.66, K('open'))).toBe(K('wet'));
    expect(at(0.58, K('wet'))).toBe(K('wet')); // and just under it doesn't send it back
    expect(at(0.55, K('wet'))).toBe(K('open'));
  });

  it('keeps its id and name while its tiles move, across a 1-tile gap, and on a split', () => {
    const s = createState(2), rows = plain(s, 12, 12);
    deep(s, rows, (_, y) => y < 8);
    const id = s.place[rows[0][0]], h = s.habitats[id], name = h.name;
    expect([h.kind, h.tier, h.tiles]).toEqual([K('deep'), MAJOR, 96]);
    deep(s, rows, (_, y) => y >= 2 && y < 10); // moved two rows down
    expect(s.place[rows[9][0]]).toBe(id);
    expect([h.alive, h.shown, h.name, h.tiles]).toEqual([true, true, name, 96]);
    deep(s, rows, (x, y) => y >= 2 && y < 10 && x !== 5); // a 1-tile gap is bridged
    expect(s.place[rows[2][0]]).toBe(id);
    expect(s.place[rows[2][11]]).toBe(id);
    deep(s, rows, (x, y) => y >= 2 && y < 10 && (x < 4 || x > 6)); // a split: the bigger part keeps the id
    const left = s.place[rows[2][0]], right = s.place[rows[2][11]];
    expect(right).toBe(id);
    expect(left).not.toBe(id);
    expect([s.habitats[left].tier, s.habitats[left].tiles, h.tiles]).toEqual([PATCH, 32, 40]);
  });

  it('gives every habitat six slots, locked where nothing of the kind lives', () => {
    const s = createState(3);
    for (let k = 0; k < 8 * 600; k++) botTick(s);
    const shown = s.habitats.filter((h) => h.alive && h.shown), gear = (p: number, id: string) => s.board.gear[p * GEAR.length + GEAR.findIndex((g) => g.id === id)];
    expect(s.board.gear.length).toBe(s.habitats.length * GEAR.length);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.every((h) => gear(h.id, 'herb') < 0)).toBe(true); // no herbs yet at 8 minutes
    expect(shown.some((h) => gear(h.id, 'ground') >= 0)).toBe(true);
  }, 60_000);
});
