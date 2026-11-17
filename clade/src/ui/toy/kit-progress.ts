import { KIT, WORM_KIT, type KitNode, type KitProgress, type Rung } from '../../data/kit';
import { levelOf, nextLevel, nodeOf, planOk } from '../../sim/kit';

const KEY = 'clade.kit.v1';
export const emptyProgress = (): KitProgress => ({ eggs: 0, best: {}, plan: [] });
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function loadProgress(): KitProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!saved || !count(saved.eggs) || !saved.best || typeof saved.best !== 'object'
      || Array.isArray(saved.best) || !Object.values(saved.best).every(count)) return emptyProgress();
    const plan = Array.isArray(saved.plan) && planOk(levelOf(saved.eggs), saved.plan) ? saved.plan : [];
    return { eggs: saved.eggs, best: saved.best, plan };
  } catch { return emptyProgress(); }
}

export function saveProgress(progress: KitProgress): void {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* Play without storage. */ }
}

export const freshSeed = (): number => Date.now() % 1e6;
export const nextRun = (run?: number): number => (run ?? 0) + 1;
export const planLimit = (level: number): number => KIT.planSlots[level - 1];
export const bestOn = (progress: KitProgress, board: string): number => progress.best[board] ?? 0;
export const firstRung = (node: KitNode): Rung => node.rungs[0];
export const rungName = (id: KitNode['id'], rung: number | undefined): string =>
  nodeOf(id)!.rungs[(rung ?? 1) - 1].name;
export const addsText = (rung: Rung): string =>
  Object.entries(rung.adds).map(([stat, amount]) => `+${amount} ${stat}`).join(' · ');

function extras(from: number, to: number): string[] {
  const result: string[] = [];
  if (KIT.rungCap[to - 1] > KIT.rungCap[from - 1]) result.push('a third rung');
  if (KIT.planSlots[to - 1] > KIT.planSlots[from - 1]) result.push('one more planned part');
  return result;
}

export function nextOpens(eggs: number): string {
  const next = nextLevel(eggs);
  return next ? [...next.opens.map((id) => firstRung(nodeOf(id)!).name),
    ...extras(levelOf(eggs), next.level)].join(', ') : '';
}

export function openedBetween(before: number, after: number): string {
  const from = levelOf(before), to = levelOf(after);
  return [...WORM_KIT.filter((node) => node.level > from && node.level <= to)
    .map((node) => firstRung(node).name), ...extras(from, to)].join(', ');
}

/** Keep the bar relative to the displayed level, including a full bar at the top. */
export function levelBar(eggs: number): { value: number; span: number; at: number; percent: string } {
  const level = levelOf(eggs), next = nextLevel(eggs);
  const start = KIT.levelEggs[level - 1], at = next?.at ?? start;
  const span = next ? at - start : 1, value = next ? eggs - start : span;
  return { value, span, at, percent: `${value / span * 100}%` };
}
