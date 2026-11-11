import type { PartId } from '../sim/records';
import type { NodeId } from './life';

export const GROW_SHARE = 0.5; // Grow: fraction of the full moult price, rounded up
export const LAY_COST = 4; // Lay: food paid for the Life's first clutch
export const LAY_STEP = 2; // Lay: each later clutch of the same Life costs this much more (decided 11 Nov)
export const ENFORCE_COSTS = [3, 5, 7, 9, 11] as const; // Enforce: food paid per purchase across the Life
export const ENFORCE_HEADROOM = 1; // Enforce: ranks a part can reach above its line rank
export const HEADS_PER_EGG = 2; // Founding: heads supplied by each egg

type Effect =
  | { kind: 'meal'; amount: number; nodes?: readonly NodeId[]; meals: string }
  | { kind: 'block' | 'oxygen' | 'eggs' | 'range' | 'tunnel' | 'speed' | 'sight'; amount: number; text: string };

const mats = { kind: 'meal', amount: 1, nodes: ['mat'], meals: 'mats' } as const;
const buried = { kind: 'meal', amount: 1, nodes: ['buried'], meals: 'buried meals' } as const;
const shells = { kind: 'meal', amount: 1, nodes: ['shell', 'carcass'], meals: 'shell or carcass meals' } as const;
const guard = { kind: 'block', amount: 1, text: 'blocks the next hit' } as const;

// Enforce: extra effect per purchased rank while the part is on.
export const ENFORCE_EFFECT: Partial<Record<PartId, Effect>> = {
  tentacles: mats, rake: mats, bulb: buried, digger: buried, deep: buried,
  claw: shells, proboscis: shells, hook: shells,
  gut: { kind: 'meal', amount: 1, meals: 'meals' },
  sclerite: guard, spine: guard, shield: guard, enrol: guard,
  gill: { kind: 'oxygen', amount: 1, text: '+1 oxygen' },
  pouch: { kind: 'eggs', amount: 1, text: '+1 egg each lay' },
  leg: { kind: 'range', amount: 1, text: '+1 range' },
  chaetae: { kind: 'tunnel', amount: 1, text: '+1 tunnel' },
  flap: { kind: 'speed', amount: 1, text: '+1 speed' },
  eye: { kind: 'sight', amount: 2, text: '+2 sight' },
};
