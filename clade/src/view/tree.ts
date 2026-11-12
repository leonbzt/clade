// The tree of life, read-only: clade nodes laid out by chapter (oldest at the bottom), lit where you have a line,
// with each unlit clade's gate as a hint, one line per part ("sclerites +", "proboscis", "1 of 2 carried").
import { CLADES, OLD_LIFE } from '../data/clades';
import { PARTS } from '../data/parts';
import { levelOf } from '../sim/line';
import type { CladeId, Lineage, World } from '../sim/records';

export const TREE = { w: 340, h: 580, top: 50, step: 150 };

export interface TreeNode {
  id: CladeId; name: string; x: number; y: number; parent: { x: number; y: number; lit: boolean } | null;
  line: Lineage | null; level: number; hint: string[] | null; trunk: boolean; // hint: gate parts, then the count
}

const yOf = (chapter: number) => TREE.top + (3 - chapter) * TREE.step;

export function treeOf(world: World): TreeNode[] {
  const out: TreeNode[] = [];
  const carried = (clade: CladeId) => new Set(world.species.filter((s) => world.lineages.find((l) => l.id === s.lineage)?.clade === clade)
    .flatMap((s) => Object.values(s.build.parts)));
  const lay = (id: CladeId, x0: number, x1: number, parent: TreeNode | null) => {
    const c = CLADES[id], line = world.lineages.find((l) => l.clade === id) ?? null;
    const have = c.parent ? carried(c.parent) : new Set();
    const hint = line || !c.gate.length ? null
      : [...c.gate.map((p, i) => `${PARTS[p].name.toLowerCase()}${i < c.gate.length - 1 ? ' +' : ''}`), `${c.gate.filter((p) => have.has(p)).length} of ${c.gate.length} carried`];
    const node: TreeNode = { id, name: c.name, x: (x0 + x1) / 2, y: yOf(c.chapter), parent: parent && { x: parent.x, y: parent.y, lit: !!parent.line },
      line, level: line ? levelOf(line.xp) : 0, hint, trunk: !c.playable };
    out.push(node);
    const kids = (Object.keys(CLADES) as CladeId[]).filter((k) => CLADES[k].parent === id);
    kids.forEach((k, i) => lay(k, x0 + ((x1 - x0) * i) / kids.length, x0 + ((x1 - x0) * (i + 1)) / kids.length, node));
  };
  lay('cell', 0, TREE.w, null);
  return out;
}

/** Old life branches off the trunk between the first cell and the worm's label, alternating sides. */
export function oldLife() {
  const y0 = yOf(0) - 10, y1 = yOf(1) + 50, x = TREE.w / 2;
  return OLD_LIFE.map((name, i) => {
    const y = y0 - ((y0 - y1) * i) / (OLD_LIFE.length - 1), side = i % 2 ? 1 : -1;
    return { name, from: { x, y }, to: { x: x + side * 60, y: y - 14 }, side };
  });
}
