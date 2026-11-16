// The build toy's three boards (B0, 16 Nov). Hand-made so each asks for another build; tuned by play.
// Cells are data/life.ts CELL: . sand, ~ mud, # rock, m mat, s shell bed, c carcass, b buried food.
import type { Board } from '../sim/life';

export interface ToyBoard { id: string; name: string; asks: string; board: Board }

const quiet = (): Pick<Board, 'rivals' | 'event'> => ({ rivals: [], event: null });

export const TOY_BOARDS: readonly ToyBoard[] = [
  { id: 'mats', name: 'The mat field', asks: 'Mats everywhere, a few shell beds, nothing hunts.',
    board: { ...quiet(), substrate: 'sand', start: [3, 10], entry: [4, 0], predatorAt: null, map: [
      '..m...s.',
      '.m..m...',
      '...#..m.',
      'm..m....',
      '..m..c..',
      '.m...m.#',
      '...m....',
      'm.#..m.s',
      '..m.....',
      '.m..m.m.',
      '........',
    ] } },
  { id: 'mud', name: 'The mud flat', asks: 'The food is buried and hidden. Two mats to start on.',
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
  { id: 'hunted', name: 'The hunted sand', asks: 'Good grazing, and a hunter from turn 5. Mud hides a worm.',
    board: { ...quiet(), substrate: 'sand', start: [4, 10], entry: [3, 0], predatorAt: 5, map: [
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
