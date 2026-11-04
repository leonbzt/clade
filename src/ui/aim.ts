// What the pointer would do on the run's canvas, with its cost: select a sapling, feed a shoot, send a root to a soil
// cell, lean a shoot into the sky (moss: send a creeping edge along the ground), cut a part (right-click).
import { GROUND, STAND } from '../data/run';
import { tickRate, type Run } from '../sim/run/run';
import { cut, cutPreview, feed, feedPreview, rootPreview, rootToward, shootPreview, shootToward } from '../sim/run/verbs';
import type { Aim } from '../view/side';

export type Verb = 'select' | 'feed' | 'root' | 'shoot' | 'none';
export interface Hover { verb: Verb; sap: number; node: number; x: number; y: number; text: string; cut: string; ok: boolean; aim: Aim | null }

const pay = (ok: boolean, cost: number) => `${cost.toFixed(1)} nutrient${ok ? '' : " (can't pay)"}`;

/** The nearest living part under the pointer: any sapling's shoots, the selected one's roots. */
function partAt(r: Run, x: number, y: number, rad: number) {
  let sap = -1, node = -1, bd = rad;
  r.stand.forEach((s, k) => s.plant.nodes.forEach((n, i) => {
    if (i === 0 || n.dead || !n.len || (n.kind === 'root' && k !== r.sel)) return;
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < bd) { bd = d; sap = k; node = i; }
  }));
  return { sap, node };
}

export function hoverAt(r: Run, x: number, y: number, rad: number): Hover {
  const { sap, node } = partAt(r, x, y, rad), base = { sap: r.sel, node: -1, x, y, cut: '', ok: true, aim: null };
  const cutText = (k: number, i: number) => { const c = cutPreview(r.stand[k].plant, i); return `right-click: cut ${c.segs} parts, +${c.back.toFixed(1)} nutrient`; };
  if (sap >= 0 && sap !== r.sel) return { ...base, verb: 'select', sap, node, text: `select sapling ${sap + 1}`, cut: r.phase === 'grow' ? cutText(sap, node) : '' };
  if (r.phase !== 'grow') return { ...base, verb: 'none', text: '' };
  const p = r.stand[r.sel].plant, cutLine = node > 0 ? cutText(r.sel, node) : '';
  if (node > 0 && p.nodes[node].kind === 'shoot') {
    const f = feedPreview(p, node);
    if (f && f.tips) return { ...base, verb: 'feed', node, ok: f.ok, cut: cutLine, aim: { sap: r.sel, path: null, ok: f.ok, part: node },
      text: `feed: its ${f.tips} tip${f.tips > 1 ? 's' : ''} grow first for ${Math.round(STAND.feed.ticks / tickRate(r.form))} s · ${pay(f.ok, f.cost)}` };
  }
  if (y > GROUND && p.form !== 'moss') {
    const d = rootPreview(p, r.plot, x, y);
    if (!d) return { ...base, verb: 'none', node, cut: cutLine, text: 'stone: no root gets through' };
    const n = p.nodes[d.from];
    return { ...base, verb: 'root', node, ok: d.ok, cut: cutLine, aim: { sap: r.sel, path: [n.x, n.y, d.x, d.y], ok: d.ok, part: -1 }, text: `dig: a new root heads here · ${pay(d.ok, d.cost)}` };
  }
  const d = shootPreview(p, x, y);
  if (!d) return { ...base, verb: 'none', node, cut: cutLine, text: 'no shoot tip to send' };
  const n = p.nodes[d.from], what = p.form === 'moss' ? 'the nearest edge creeps' : d.fresh ? 'a bud wakes and grows' : 'the nearest tip leans';
  return { ...base, verb: 'shoot', node, ok: d.ok, cut: cutLine, aim: { sap: r.sel, path: [n.x, n.y, d.x, d.y], ok: d.ok, part: -1 }, text: `${what} here · ${pay(d.ok, d.cost)}` };
}

/** A click: true if something changed. */
export function act(r: Run, h: Hover): boolean {
  const p = r.stand[r.sel].plant;
  if (h.verb === 'select') { r.sel = h.sap; return true; }
  if (r.phase !== 'grow') return false;
  if (h.verb === 'feed') return feed(p, h.node);
  if (h.verb === 'root') return rootToward(p, r.plot, h.x, h.y) >= 0;
  if (h.verb === 'shoot') return shootToward(p, h.x, h.y);
  return false;
}

/** A right-click: cut the part under the pointer (any sapling's shoot, the selected one's root). */
export function cutAt(r: Run, h: Hover): boolean {
  if (r.phase !== 'grow' || h.node <= 0) return false;
  cut(r.stand[h.sap].plant, h.node);
  return true;
}
