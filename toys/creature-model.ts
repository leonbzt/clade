// Toy 18: builds and recipes, with no drawing. A build is a lineage, a size and the parts on its slots. `become` turns a
// finished build into its new lineage in one of three ways, and never loses a part: each goes in, on a slot or on the list.
import { LINEAGES, PARTS, type Lineage, type LineageId, type PartId, type Recipe, type SlotKind, type Span } from './creature-data';

export interface Slot { id: string; kind: SlotKind; f: number }
export interface Fused { part: PartId; slot: string }
export interface Build { lineage: LineageId; size: number; parts: Record<string, PartId>; fused: Fused[]; kept: PartId[]; name?: string }
export type Mode = 'integrated' | 'default' | 'mix';
export const MODES: { id: Mode; name: string; say: string }[] = [
  { id: 'mix', name: 'One drawn in, rest removable', say: 'The signature part is drawn in. The others start on slots.' },
  { id: 'integrated', name: 'All drawn in', say: 'Every recipe part is drawn in: no slot, no swapping.' },
  { id: 'default', name: 'All removable', say: 'Every recipe part starts on a slot you can change.' },
];

export const spanAt = (s: number | Span | undefined, size: number, or = 1) => (s === undefined ? or : typeof s === 'number' ? s : Math.max(1, Math.round(s[0] + s[1] * size)));
export const SIZE_MIN = 1, SIZE_MAX = 5;

/** Every slot the lineage has, in order. */
export function allSlots(l: Lineage): Slot[] {
  const out: Slot[] = [], s = l.slots;
  for (let k = 0; k < s.front; k++) out.push({ id: `front${k}`, kind: 'front', f: 0 });
  for (let k = 0; k < s.crown; k++) out.push({ id: `crown${k}`, kind: 'crown', f: 0.1 });
  const row = (kind: 'side' | 'back', [n, a, b]: [number, number, number]) => { for (let k = 0; k < n; k++) out.push({ id: `${kind}${k}`, kind, f: a + ((b - a) * (k + 0.5)) / n }); };
  row('side', s.side); row('back', s.back);
  for (let k = 0; k < s.tail; k++) out.push({ id: `tail${k}`, kind: 'tail', f: 1 });
  return out;
}

/** The slots still open: a part drawn in takes its slot away. */
export function slotsOf(b: Build): Slot[] { const gone = new Set(b.fused.map((u) => u.slot)); return allSlots(LINEAGES[b.lineage]).filter((s) => !gone.has(s.id)); }
export const fits = (part: PartId, kind: SlotKind) => PARTS[part].kinds.includes(kind);

export function newBuild(lineage: LineageId, size = 3, parts: Record<string, PartId> = {}): Build {
  return { lineage, size, parts: { ...(LINEAGES[lineage].starts as Record<string, PartId> | undefined), ...parts }, fused: [], kept: [] };
}
export const cloneBuild = (b: Build): Build => ({ ...b, parts: { ...b.parts }, fused: b.fused.map((u) => ({ ...u })), kept: [...b.kept] });

/** Put a part on a slot or clear it. A named form keeps what comes off on its list, and takes from the list what goes on. */
export function setPart(b: Build, slot: string, part: PartId | null) {
  const had = b.parts[slot];
  if (had === part) return;
  if (had && b.name) b.kept.push(had);
  if (part) { b.parts[slot] = part; const k = b.kept.indexOf(part); if (k >= 0) b.kept.splice(k, 1); } else delete b.parts[slot];
}

/** Every part in the body: drawn in, then on slots. */
export const partsIn = (b: Build): PartId[] => [...b.fused.map((u) => u.part), ...Object.values(b.parts)];
const countOf = (list: PartId[], p: PartId) => list.filter((q) => q === p).length;

export interface Progress { have: number; need: number; ready: boolean; rows: { part: PartId; have: number; need: number }[] }
export function progress(b: Build, r: Recipe): Progress {
  const list = partsIn(b), rows = (Object.entries(r.needs) as [PartId, number][]).map(([part, need]) => ({ part, need, have: Math.min(need, countOf(list, part)) }));
  const have = rows.reduce((a, q) => a + q.have, 0), need = rows.reduce((a, q) => a + q.need, 0);
  return { have, need, ready: have === need && b.lineage === r.from, rows };
}

/** A form's name from its base and the parts it carries beyond the recipe, such as "Rockplate" or "Thornplate". */
export function formName(r: Recipe, extras: PartId[]) {
  let best: PartId | null = null, n = 0;
  for (const p of extras) { const c = countOf(extras, p); if (c > n) { best = p; n = c; } }
  return (best ? PARTS[best].word : r.word) + r.suffix;
}

export interface Became { build: Build; fused: PartId[]; onSlots: PartId[]; kept: PartId[] }

/**
 * A build becomes the recipe's lineage. Recipe parts go in by `mode`, spread along the body. Extra parts go on the list, or stay
 * on the body with `keepExtras` if a slot is free. If a slot runs out, the part goes on the list; nothing is ever lost.
 */
export function become(b: Build, r: Recipe, mode: Mode, keepExtras = false): Became {
  const to = allSlots(LINEAGES[r.to]), pool = partsIn(b), fused: Fused[] = [], parts: Record<string, PartId> = {}, kept: PartId[] = [...b.kept];
  const taken = new Set<string>(), groups: [PartId, number][] = [];
  for (const [part, n] of Object.entries(r.needs) as [PartId, number][]) {
    let got = 0;
    for (let k = 0; k < n; k++) { const at = pool.indexOf(part); if (at >= 0) { pool.splice(at, 1); got++; } }
    if (got) groups.push([part, got]);
  }
  groups.sort((x, y) => +(y[0] === r.signature) - +(x[0] === r.signature));
  let sig = mode === 'mix';
  for (const [part, n] of groups) {
    const open = to.filter((s) => !taken.has(s.id) && fits(part, s.kind));
    for (let k = 0; k < n; k++) {
      const slot = n <= open.length ? open[Math.floor(((k + 0.5) * open.length) / n)] : open[k];
      if (!slot) { kept.push(part); continue; }
      taken.add(slot.id);
      if (mode === 'integrated' || (sig && part === r.signature)) { fused.push({ part, slot: slot.id }); sig = false; } else parts[slot.id] = part;
    }
  }
  const name = formName(r, pool);
  for (const part of pool) {
    const slot = keepExtras ? to.find((s) => !taken.has(s.id) && fits(part, s.kind)) : undefined;
    if (slot) { taken.add(slot.id); parts[slot.id] = part; } else kept.push(part);
  }
  const build: Build = { lineage: r.to, size: b.size, parts, fused, kept, name };
  return { build, fused: fused.map((u) => u.part), onSlots: Object.values(parts), kept };
}

/** The one part that marks this body on the map: what it carries most of, the rarer shape on a tie; else the lineage's own. */
const MARK_ORDER: PartId[] = ['claw', 'flap', 'enrol', 'plate', 'spine', 'fan', 'tentacles', 'gill', 'leg', 'bristles', 'eye'];
export function signatureOf(b: Build): PartId {
  const list = partsIn(b);
  let best: PartId | null = null, n = 0;
  for (const p of MARK_ORDER) { const c = countOf(list, p); if (c > n) { best = p; n = c; } }
  return best ?? LINEAGES[b.lineage].sig;
}
