// The board's grid: directions, indices, bounds, distance. Shared by the Life's rules and the hunt.
import { COLS, ROWS } from '../data/life';

export type Dir = 0 | 1 | 2 | 3; // north, east, south, west
export const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
export const at = (x: number, y: number) => y * COLS + x;
export const inB = (x: number, y: number) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
export const xy = (i: number): [number, number] => [i % COLS, Math.floor(i / COLS)];
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) + Math.abs(ay - by);
