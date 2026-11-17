// The kit toy's three boards (B0 round two, 17 Nov). Hand-made so each asks for another build; tuned by play.
// Cells are data/life.ts CELL: . sand, ~ mud, # rock, m mat, s shell bed, c carcass, b buried food.
// `goal`: the eggs that mark the board as solved (a star, and you move on). `predatorAt` is in kit turns (KIT.season).
import type { Board } from '../sim/life';

export interface KitBoard { id: string; name: string; asks: string; goal: number; board: Board }

const quiet = (): Pick<Board, 'rivals' | 'event'> => ({ rivals: [], event: null });

export const KIT_BOARDS: readonly KitBoard[] = [
  { id: 'mats', name: 'The mat field', asks: 'Mats everywhere, three shell beds for a strong bite, nothing hunts.', goal: 24,
    board: { ...quiet(), substrate: 'sand', start: [3, 10], entry: [4, 0], predatorAt: null, map: [
      '..m...s.',
      '.m..m...',
      '...#..m.',
      'm..m....',
      '..m..c..',
      '.m...m.#',
      's..m....',
      'm.#..m.s',
      '..m.....',
      '.m..m.m.',
      '........',
    ] } },
  { id: 'mud', name: 'The mud flat', asks: 'The food is buried and hidden. Two mats to start on.', goal: 18,
    board: { ...quiet(), substrate: 'mud', start: [1, 10], entry: [6, 0], predatorAt: null, map: [
      '~~b~~~b~',
      '~b~~b~~~',
      '~~~#~~b~',
      '..~~b~~~',
      '.m~b~~~b',
      '..~~~b~~',
      '~~b~~~~.',
      '~b~~#~m.',
      '~~~b~~..',
      '.~~~~b~.',
      '...~~...',
    ] } },
  { id: 'hunted', name: 'The hunted sand', asks: 'Good grazing, and a hunter from turn 15. Mud hides a worm; defence 2 turns its strike.', goal: 14,
    board: { ...quiet(), substrate: 'sand', start: [4, 10], entry: [3, 0], predatorAt: 15, map: [
      '..m..s..',
      '.m....m.',
      '..~~..m.',
      'm.~b~...',
      '..~~.m..',
      '.m...#.c',
      '....m...',
      'm.~~...m',
      '..~b~.m.',
      '.m.~~...',
      '........',
    ] } },
];
