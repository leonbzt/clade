// The three boards from game/src/data/habitats.ts. Percent tiles become rock and sulfur mats become mats.
import type { Substrate } from './ground';
import type { Board, BoardEvent } from '../sim/life';

type Template = Pick<Board, 'map' | 'start' | 'entry'> & {
  predatorAt: number; rivalSpots: [number, number][]; event: BoardEvent;
};

export const BOARD = {
  shadow: true, // hunter: use the template's arrival turn
  maxShare: 1.5, // food: upper bound on the share of template nodes
  rivalAt: 6, // rivals: minimum resident heads (grams ÷ body mass); game/'s BOARD.rivalAt counted heads
};

export const TEMPLATES: Record<Substrate, Template> = {
  mud: {
    map: [
      'm.m.sm.s',
      '.m..#.m.',
      '~~~~~~~m',
      '~b~b~~b~',
      'b~~~bb~b',
      '~~#~~~~~',
      '.~~..~~~',
      'm~~mc~bb',
      '~~b~~#~~',
      '~b~b~~b.',
      'b~~~b~mm',
    ],
    start: [3, 1], entry: [1, 10], predatorAt: 6, rivalSpots: [[4, 9]],
    event: { from: 12, to: 15, where: 'mud', name: 'Mudslide', text: 'no oxygen in the mud', look: 'murk' },
  },
  sand: {
    map: [
      'mm.m.mm.',
      '.m.m..m.',
      'm..s.m.m',
      '.m..#.m.',
      '.s.~~..s',
      '...~b.m.',
      'm.s....s',
      'm.#..m.m',
      '.s...~~.',
      'm..s.~b.',
      '..c...s.',
    ],
    start: [4, 6], entry: [7, 10], predatorAt: 4, rivalSpots: [[1, 8]],
    event: { from: 9, to: 12, where: 'all', rows: [0, 2], name: 'Low tide', text: 'the three rows by the shore run dry', look: 'dry' },
  },
  rock: {
    map: [
      'm.#..#.m',
      '.s#.m#s.',
      'm.##m#.m',
      'm..m#...',
      '##.##.##',
      '.m.mm.m.',
      's#.~b.#s',
      'm#.~~.#m',
      'm..##m..',
      '.s.#m#m.',
      '.mm#.ms.',
    ],
    start: [5, 5], entry: [0, 5], predatorAt: 5, rivalSpots: [[7, 10]],
    event: { from: 8, to: 10, where: 'all', name: 'Vent surge', text: 'warm water, oxygen falls everywhere', look: 'haze' },
  },
};
