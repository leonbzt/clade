// Small text helpers shared by the panels.
import { ATTRS, type Genes } from '../data/genes';

/** "Roots +1", or "sport: Shade +2, Pace −1". */
export function upText(u: { genes: Genes; changed: number[]; sport: boolean }, from: Genes): string {
  const parts = u.changed.map((i) => { const d = u.genes[i] - from[i]; return `${ATTRS[i].name} ${d > 0 ? '+' : '−'}${Math.abs(d)}`; });
  return `${u.sport ? 'sport: ' : ''}${parts.join(', ')}`;
}
