// Read-only projections of the two saved settlement steps. Neither playback nor skipping calls the sim.
import type { Spread } from '../sim/sea-life';
import type { Sea } from '../sim/sea';
import { headlineText } from '../sim/sea-news';

export function changes(spread: Spread, index: number) {
  const before = index ? spread.frames[index - 1].pop : spread.before;
  return spread.frames[index].pop.flatMap((pop, patch) => Math.abs(pop - before[patch]) < 1e-6 ? []
    : [{ patch, from: before[patch], to: pop, grew: pop > before[patch] }]);
}

export function replayLines(sea: Sea, spread: Spread, index: number): string[] {
  const moved = changes(spread, index), news = spread.frames[index].news.map((n) => headlineText(sea, n));
  if (!moved.length) return [`Your line held patch ${spread.patch + 1}.`, ...news];
  return news.length ? news : moved.map((c) => `Patch ${c.patch + 1}: your line ${c.grew ? 'grew' : 'fell'}, ${c.from.toFixed(1)} → ${c.to.toFixed(1)}.`);
}
