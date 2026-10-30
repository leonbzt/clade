import { describe, expect, it } from 'vitest';
import { GEAR, HABITAT_KINDS } from '../src/data/habitats';
import { botTick } from '../src/sim/bot';
import { classify, kindOf, updateHabitats } from '../src/sim/habitats';
import { createState, STREAM, type State } from '../src/sim/state';

const K = (id: string) => HABITAT_KINDS.findIndex((d) => d.id === id);
/** Land tiles of a region (any with r < 0) made plain open ground: some soil, dry, sunny, no salt, no stream. */
function plain(s: State, r: number, n: number): number[] {
  const out = [...s.region.keys()].filter((i) => s.region[i] >= 0 && (r < 0 || s.region[i] === r) && s.terrain[i] !== STREAM && s.statuses.salty[i] < 0.1).slice(0, n);
  for (const i of out) { s.layers.soil[i] = 0.3; s.layers.water[i] = 0.3; s.layers.shade[i] = 0; }
  classify(s);
  return out;
}

describe('habitats', () => {
  it("doesn't flip a tile at the edge of a kind", () => {
    const s = createState(1), i = plain(s, -1, 1)[0];
    expect(s.hab[i]).toBe(K('open'));
    const at = (water: number, cur: number) => { s.layers.water[i] = water; return kindOf(s, i, cur); };
    expect(at(0.62, K('open'))).toBe(K('open')); // just past the line isn't enough
    expect(at(0.66, K('open'))).toBe(K('wet'));
    expect(at(0.58, K('wet'))).toBe(K('wet')); // and just under it doesn't send it back
    expect(at(0.55, K('wet'))).toBe(K('open'));
  });

  it('keeps its id and name while its tiles move', () => {
    const s = createState(2), r = s.regions.findIndex((g) => g.tiles > 300), deep = r * HABITAT_KINDS.length + K('deep');
    const land = plain(s, r, 120);
    const soil = (tiles: number[], v: number) => tiles.forEach((i) => { s.layers.soil[i] = v; });
    soil(land.slice(0, 80), 0.8); classify(s); updateHabitats(s, false);
    const h = s.habitats[deep], name = h.name;
    expect(h.shown).toBe(true);
    soil(land.slice(0, 15), 0.2); soil(land.slice(80, 100), 0.8); classify(s); updateHabitats(s, false);
    expect(s.habitats[deep]).toBe(h);
    expect([h.id, h.shown, h.name, h.tiles]).toEqual([deep, true, name, 85]);
  });

  it('gives every habitat six slots, locked where nothing of the kind lives', () => {
    const s = createState(3);
    for (let k = 0; k < 8 * 600; k++) botTick(s);
    const shown = s.habitats.filter((h) => h.shown), gear = (p: number, id: string) => s.board.gear[p * GEAR.length + GEAR.findIndex((g) => g.id === id)];
    expect(s.board.gear.length).toBe(s.habitats.length * GEAR.length);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.every((h) => gear(h.id, 'herb') < 0)).toBe(true); // no herbs yet at 8 minutes
    expect(shown.some((h) => gear(h.id, 'ground') >= 0)).toBe(true);
  }, 60_000);
});
