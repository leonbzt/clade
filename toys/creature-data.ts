// Toy 18: the body toy's data. Every animal is one record below: a spine, a width along it, a skin, a gait and what it has
// drawn in. No record has code; a new lineage is a new record. All numbers are proposals. Lengths are in tiles (24 world units).
export type SlotKind = 'front' | 'crown' | 'side' | 'back' | 'tail';
export type PartId = 'claw' | 'eye' | 'leg' | 'spine' | 'plate' | 'gill' | 'bristles' | 'tentacles' | 'flap' | 'fan' | 'enrol';
export type GaitId = 'ripple' | 'legs' | 'flaps' | 'creep';
export type LineageId = 'worm' | 'bristle' | 'wiwaxia' | 'arthropod' | 'trilobite' | 'anomalocaris' | 'lobopod' | 'crusher';
export type RampKey = 'flesh' | 'you' | 'rival' | 'hunter' | 'shell' | 'amber' | 'leaf' | 'trilo' | 'wiwaxia';
export type Span = [number, number]; // base + per size

/** A part drawn into the body: no slot, no choice. `n` copies between `f`; `k` scales it; `style` picks a variant of the part. */
export interface Built { part: PartId; n?: number | Span; f?: Span; k?: number; style?: string; kind?: SlotKind }
export interface Lineage {
  name: string; blurb: string; gait: GaitId; skin: 'bead' | 'ridge'; ramp: RampKey; sig: PartId;
  joints: Span; len: Span; R: Span; // how many joints, how long, the widest half-width
  width: [number, number][]; // half-width along the body, 0 head … 1 tail, as a share of R
  bend: number; turn: number; // how far the whole body may curve (radians), how fast it turns
  ridge?: number; plates?: Span; seams?: boolean; lobes?: boolean; lift: number; // lift: height above the floor (its shadow)
  head?: { len: number; wide: number; facets: number; pale?: number; genal?: boolean; antennae?: boolean };
  built: Built[]; starts?: Partial<Record<string, PartId>>; slots: { front: number; crown: number; side: [number, number, number]; back: [number, number, number]; tail: number };
}

export const PARTS: Record<PartId, { name: string; kinds: SlotKind[]; word: string }> = {
  claw: { name: 'Claw', kinds: ['front'], word: 'Pincer' },
  tentacles: { name: 'Tentacles', kinds: ['front'], word: 'Frond' },
  eye: { name: 'Eye', kinds: ['crown'], word: 'Keen' },
  leg: { name: 'Leg', kinds: ['side'], word: 'Long' },
  gill: { name: 'Gill', kinds: ['side'], word: 'Gill' },
  bristles: { name: 'Bristles', kinds: ['side'], word: 'Bristle' },
  flap: { name: 'Flap', kinds: ['side'], word: 'Sail' },
  spine: { name: 'Spine', kinds: ['side', 'back', 'tail'], word: 'Thorn' },
  plate: { name: 'Plate', kinds: ['back'], word: 'Rock' },
  fan: { name: 'Tail fan', kinds: ['tail'], word: 'Fan' },
  enrol: { name: 'Roll-up tail', kinds: ['tail'], word: 'Curl' },
};

export const LINEAGES: Record<LineageId, Lineage> = {
  worm: {
    name: 'Worm', blurb: 'A loose chain of soft rings', gait: 'ripple', skin: 'bead', ramp: 'flesh', sig: 'bristles', lift: 2.5,
    joints: [4, 2], len: [0.42, 0.11], R: [0.12, 0.024], width: [[0, 0.92], [0.14, 1], [1, 0.58]], bend: 7, turn: 40,
    built: [],
    slots: { front: 1, crown: 1, side: [4, 0.18, 0.86], back: [3, 0.22, 0.8], tail: 1 },
  },
  bristle: {
    name: 'Bristle worm', blurb: 'A loose chain with bristles on every ring', gait: 'ripple', skin: 'bead', ramp: 'rival', sig: 'bristles', lift: 2.5,
    joints: [5, 2], len: [0.5, 0.12], R: [0.11, 0.022], width: [[0, 0.8], [0.14, 1], [1, 0.62]], bend: 6, turn: 40,
    built: [{ part: 'bristles', n: [3, 1], f: [0.1, 0.92], k: 0.62, style: 'tuft' }, { part: 'tentacles', k: 0.7, style: 'palp', kind: 'front' }],
    slots: { front: 1, crown: 1, side: [4, 0.18, 0.86], back: [4, 0.2, 0.84], tail: 1 },
  },
  wiwaxia: {
    name: 'Wiwaxia', blurb: 'A short body on a foot, scaled and spined', gait: 'creep', skin: 'ridge', ramp: 'wiwaxia', sig: 'spine', lift: 3, ridge: 5.5, plates: [4, 0.5], seams: true,
    joints: [4, 0], len: [0.54, 0.05], R: [0.21, 0.018], width: [[0, 0.5], [0.12, 0.8], [0.32, 1], [0.7, 0.98], [0.9, 0.72], [1, 0.42]], bend: 0.3, turn: 8,
    built: [{ part: 'spine', n: 5, f: [0.16, 0.84], k: 0.9, style: 'row', kind: 'side' }],
    slots: { front: 1, crown: 1, side: [3, 0.2, 0.8], back: [5, 0.14, 0.86], tail: 1 },
  },
  arthropod: {
    name: 'Arthropod', blurb: 'A stiff plated body on walking legs', gait: 'legs', skin: 'ridge', ramp: 'amber', sig: 'leg', lift: 4, ridge: 4, plates: [2, 1], seams: true,
    joints: [5, 0], len: [0.6, 0.108], R: [0.24, 0.036], width: [[0, 0.75], [0.3, 1.02], [1, 0.39]], bend: 0, turn: 18,
    head: { len: 0.3, wide: 1.05, facets: 8, antennae: true },
    built: [{ part: 'leg', n: [3, 1], f: [0.28, 0.84], k: 0.72, style: 'walk' }, { part: 'eye', style: 'dot', kind: 'crown' }, { part: 'fan', k: 0.5, style: 'stub', kind: 'tail' }],
    slots: { front: 1, crown: 1, side: [6, 0.3, 0.86], back: [4, 0.34, 0.84], tail: 1 },
  },
  trilobite: {
    name: 'Trilobite', blurb: 'A broad shield, three lobes, a tail shield', gait: 'legs', skin: 'ridge', ramp: 'trilo', sig: 'plate', lift: 4, ridge: 4, plates: [3, 1], seams: true, lobes: true,
    joints: [5, 0], len: [0.55, 0.1], R: [0.264, 0.036], width: [[0, 0.75], [0.3, 1.02], [0.86, 0.5], [1, 0.34]], bend: 0, turn: 18,
    head: { len: 0.3, wide: 1.26, facets: 8, pale: 0.35, genal: true, antennae: true },
    built: [{ part: 'leg', n: [3, 1], f: [0.3, 0.8], k: 0.5, style: 'walk' }, { part: 'eye', style: 'dot', kind: 'crown' }, { part: 'enrol', style: 'plain', kind: 'tail' }],
    slots: { front: 1, crown: 1, side: [6, 0.34, 0.84], back: [4, 0.34, 0.8], tail: 1 },
  },
  anomalocaris: {
    name: 'Anomalocaris', blurb: 'A long hull, rows of flaps, two grasping arms', gait: 'flaps', skin: 'ridge', ramp: 'hunter', sig: 'claw', lift: 9, ridge: 5,
    joints: [7, 0], len: [0.74, 0.079], R: [0.127, 0.0134], width: [[0, 0.48], [0.074, 0.96], [0.167, 1], [0.24, 0.78], [0.37, 0.87], [0.52, 0.87], [0.67, 0.78], [0.81, 0.65], [0.93, 0.48], [1, 0.3]], plates: [8, 0], bend: 0.7, turn: 12,
    head: { len: 0.13, wide: 0.78, facets: 2, pale: 0.15 },
    built: [{ part: 'flap', n: 10, f: [0.28, 0.9], kind: 'side' }, { part: 'claw', style: 'arm', kind: 'front' }, { part: 'eye', style: 'stalk', kind: 'crown' }, { part: 'fan', kind: 'tail' }],
    slots: { front: 1, crown: 1, side: [3, 0.3, 0.8], back: [3, 0.3, 0.8], tail: 1 },
  },
  lobopod: {
    name: 'Lobopod', blurb: 'A soft body on stubby legs', gait: 'legs', skin: 'bead', ramp: 'leaf', sig: 'leg', lift: 3,
    joints: [5, 2], len: [0.5, 0.12], R: [0.135, 0.026], width: [[0, 0.85], [0.12, 1], [0.8, 0.92], [1, 0.62]], bend: 3.5, turn: 26,
    built: [{ part: 'leg', n: [4, 1], f: [0.14, 0.9], k: 0.68, style: 'stub' }],
    slots: { front: 1, crown: 1, side: [5, 0.2, 0.88], back: [4, 0.2, 0.86], tail: 1 },
    starts: { side1: 'leg', side3: 'leg', back0: 'spine', back2: 'spine' },
  },
  crusher: {
    name: 'Crusher', blurb: 'A crab-like Cambrian: a wide carapace over a tucked tail', gait: 'legs', skin: 'ridge', ramp: 'amber', sig: 'claw', lift: 4, ridge: 5, plates: [1, 1], seams: true,
    joints: [4, 0], len: [0.48, 0.08], R: [0.3, 0.045], width: [[0, 0.72], [0.22, 1.02], [0.58, 1.06], [0.86, 0.66], [1, 0.3]], bend: 0, turn: 20,
    head: { len: 0.56, wide: 1.12, facets: 9, pale: 0.12, antennae: true },
    built: [{ part: 'leg', n: [2, 0.5], f: [0.3, 0.78], k: 0.76, style: 'walk' }, { part: 'eye', style: 'dot', kind: 'crown' }],
    slots: { front: 1, crown: 1, side: [6, 0.22, 0.84], back: [2, 0.62, 0.86], tail: 1 },
    starts: { front0: 'claw', side0: 'leg', side2: 'leg', side3: 'leg', side5: 'leg' },
  },
};

// A recipe names body parts. `signature` is the one part that goes in first when only one is integrated.
export interface Recipe { id: string; from: LineageId; to: LineageId; needs: Partial<Record<PartId, number>>; signature: PartId; suffix: string; word: string }
export const RECIPES: Recipe[] = [
  { id: 'crusher', from: 'arthropod', to: 'crusher', needs: { claw: 1, leg: 4 }, signature: 'claw', suffix: 'claw', word: 'Crag' },
  { id: 'trilobite', from: 'arthropod', to: 'trilobite', needs: { plate: 3, enrol: 1 }, signature: 'enrol', suffix: 'plate', word: 'Rock' },
  { id: 'lobopod', from: 'worm', to: 'lobopod', needs: { leg: 3, spine: 2 }, signature: 'leg', suffix: 'strider', word: 'Soft' },
  { id: 'wiwaxia', from: 'bristle', to: 'wiwaxia', needs: { plate: 3, spine: 2 }, signature: 'plate', suffix: 'scale', word: 'Mail' },
];

export const STARTERS: LineageId[] = ['worm', 'bristle', 'wiwaxia', 'arthropod', 'trilobite', 'anomalocaris'];
export const FROM_DATA: LineageId[] = ['lobopod', 'crusher'];
export const GAIT_IDS: GaitId[] = ['ripple', 'legs', 'flaps', 'creep'];
