// Slice 21B: the words and numbers the line screens show.
import { describe, expect, it } from 'vitest';
import { LINEAGES, LINEAGE_IDS, LINE_RULE } from '../src/data/lineages';
import type { PlanId } from '../src/data/life';
import { newLine, settleLine, type Lines } from '../src/sim/lineage';
import * as B from '../src/sim/body';
import { afterLines, bar, childrenOf, levelLines, partsAt, rankText, slotUpkeep, track } from '../src/ui/line';

it('every lineage reaches the worm exactly once through its recipe ancestry', () => {
  const seen = new Set<PlanId>();
  function visit(plan: PlanId) {
    expect(seen.has(plan), `cycle or duplicate at ${plan}`).toBe(false);
    seen.add(plan);
    for (const child of childrenOf(plan)) {
      expect(LINEAGES[child].recipe?.from).toBe(plan);
      visit(child);
    }
  }
  expect(LINEAGES.worm.recipe).toBeNull();
  visit('worm');
  expect([...seen].sort()).toEqual([...LINEAGE_IDS].sort());
});

describe('21B line screens', () => {
  it('the bar, the track and the lines a Life reveals', () => {
    expect(bar(LINE_RULE.xpAt[2] + 7)).toMatchObject({ level: 2, into: 7, step: LINE_RULE.xpAt[3] - LINE_RULE.xpAt[2] });
    expect(bar(1e6)).toMatchObject({ level: LINE_RULE.cap, pct: 1 });
    const lines: Lines = { worm: newLine('worm') }, laid = B.defaultBuild('worm');
    const g = settleLine(lines, 'worm', 40, 'B', laid, 'pouch', 1, { rows: laid.rows, branched: false }); // 160 XP: levels 2 and 3
    expect(levelLines(g).map((l) => l.text)).toEqual(['Level 2: +1 point · unlocked Gill', 'Level 3: +1 point · unlocked Proboscis']);
    expect(afterLines(g)).toEqual(["Kept card: Brood pouch joins your line's parts", 'New species: Worm 1 (brood pouch)']);
    expect(track('worm', lines.worm!).filter((t) => t.reached).length).toBe(3);
    expect(track('worm', lines.worm!)[9].end).toBe('Ottoia');
  });

  it('parts per place, ranks in words, upkeep per slot after ranks', () => {
    const line = newLine('worm');
    expect(partsAt('worm', line, 'eyes')).toEqual(['eye']);
    line.ranks.eye = ['lean'];
    expect(rankText('eye', line.ranks)[0]).toMatch(/^Lean: upkeep \d → \d$/);
    const b = { ...B.defaultBuild('worm'), rows: { eyes: ['eye' as const] }, ranks: line.ranks };
    expect(slotUpkeep(b).eyes).toBe(B.partUpkeep(b, 'eye'));
  });
});
