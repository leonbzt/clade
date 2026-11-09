import { expect, it } from 'vitest';
import { changes, replayLines, replayTitle } from '../src/ui/replay';
import type { Spread } from '../src/sim/sea-life';
import { freshSeaSave, serializeSeaSave } from '../src/sim/sea-save';
import { markerCounts } from '../src/view/sea-map-data';

it('shows the release first, then compares generations, distinguishes growth and falls, and explains an unchanged line', () => {
  const s = freshSeaSave(1, 0), spread: Spread = {
    species: s.sea.species[0].id, patch: 0, eggs: 4, before: [6, 0], frames: [
      { gen: 0, pop: [10, 0], news: [] },
      { gen: 1, pop: [8, 2], news: [{ kind: 'spread', sp: 0, patches: [1], gen: 1, cause: 'from a neighbour', from: 0, to: 2 }] },
      { gen: 2, pop: [8, 2], news: [] },
    ],
  };
  const before = serializeSeaSave(s);
  expect(changes(spread, 0)).toEqual([{ patch: 0, from: 6, to: 10, grew: true }]);
  expect(replayLines(s.sea, spread, 0)).toEqual(['4 eggs settle in patch 1.']);
  expect(replayTitle(spread, 0)).toBe('Your eggs settle');
  expect(changes(spread, 1)).toEqual([{ patch: 0, from: 10, to: 8, grew: false }, { patch: 1, from: 0, to: 2, grew: true }]);
  expect(replayLines(s.sea, spread, 1)[0]).toContain('from a neighbour');
  expect(replayTitle(spread, 1)).toBe('The sea moves on · 1 of 2');
  expect(changes(spread, 2)).toEqual([]);
  expect(replayLines(s.sea, spread, 2)).toEqual(['Your line held patch 1.']);
  expect(serializeSeaSave(s)).toBe(before);
});

it('draws populations from the replay frame even when the saved sea is already empty', () => {
  const s = freshSeaSave(1, 0), before = serializeSeaSave(s);
  const pop = s.sea.patches.map((p) => p.id === 0 ? 10 : 0);
  expect(markerCounts(s.sea)).toEqual([]);
  expect(markerCounts(s.sea, { species: 0, pop })).toEqual([{ patch: 0, species: 0, count: 1 }]);
  expect(serializeSeaSave(s)).toBe(before);
});
