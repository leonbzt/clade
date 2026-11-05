// The prey of the predator Life (slice 11): each flees by one rule. Plain data; the garden will supply them (slice 13).
import type { NodeId } from './life';

export type PreyKind = 'worm' | 'trilobite' | 'wiwaxia';
export type FleeRule = 'burrow' | 'run' | 'hunker';
export const PREY: Record<PreyKind, { name: string; food: number; sense: number; rule: FleeRule; eats: NodeId; armour: boolean; flees: string }> = {
  worm: { name: 'Priapulid worm', food: 8, sense: 2, rule: 'burrow', eats: 'buried', armour: false, flees: 'Burrows when you come near on mud; on sand it crawls toward mud.' },
  trilobite: { name: 'Trilobite', food: 10, sense: 3, rule: 'run', eats: 'mat', armour: false, flees: 'Runs 2 tiles straight away from you; rock, mud and vent water stop it.' },
  wiwaxia: { name: 'Wiwaxia', food: 12, sense: 2, rule: 'hunker', eats: 'mat', armour: true, flees: "Doesn't run, it raises its spines: they cut you, unless you ambush it or have arm spines." },
};
export const PREY_BACK = 3; // turns until a caught prey's kind comes back at the board's edge
export const PREY_HIDE = 2; // turns a burrowed worm stays down
