// The wide toy's board rules (W1 part A): cells, a Life as one tap, colonists and variants on bars, the next goal.
// The signatures and shapes are the contract (docs/slices/w1-the-wide-toy.md); the bodies are part A's work.
// Numbers come from data/roster/toy.ts; every judgement comes from model/laws.ts. No dice: the same seed and the
// same taps give the same board. Nothing here may name a clade, a species or a mutation.
import type { Build, Fitness, HabitatKind, JobId, Named, Site } from './types';
import { START } from '../data/roster/toy';

/** Who holds a cell. `fade` counts the generations in a row its letter has read F. */
export interface Holder { build: Build; mine: boolean; grams: number; fade: number }
/** A challenger beside your holder: the heir one dial step away, or with one mutation more. `left` generations
 *  until it goes. `what` says the difference in the clade's own words. */
export interface Variant { build: Build; what: string; left: number }
/** One job of one place. `bar` counts up to a colonist while the cell is open; `variantBar` up to the next variant
 *  while you hold it; `variants` is how many it has had. */
export interface Cell { job: JobId; holder: Holder | null; bar: number; variantBar: number; variant: Variant | null; variants: number }
export interface Place { id: number; name: string; kind: HabitatKind; area: number; next: number[]; cells: Cell[] }
/** `main` is the clade you play; `heir` is the build a Life founds. `news` is newest last, one cause a line. */
export interface Board { seed: number; gen: number; main: string; heir: Build; places: Place[]; news: string[] }

export type Act = 'take' | 'beat' | 'improve';
/** A Life you could live now. `fit` is the heir on the job; `holder` is the holder's fitness there, if any. */
export interface Option { place: number; job: JobId; act: Act; fit: Fitness; holder: Fitness | null }
export type GoalKind = 'adopt' | 'hold' | 'race' | 'take' | 'beat' | 'improve' | 'wait';
/** The one next goal: a sentence that names the place and gives one reason. `wait` has no place. */
export interface Goal { kind: GoalKind; place: number | null; job: JobId | null; text: string }

const todo = (..._args: unknown[]): never => { throw new Error('W1 part A: not built'); };

/** The young island: every place of data/roster/toy.ts, its producer if one grows there, no animals, nothing yours. */
export function newBoard(seed: number, heir: Build = START): Board { return todo(seed, heir); }
/** A place as the laws read it. */
export function siteOf(place: Place): Site { return todo(place); }
/** One generation: grams, fading, colonist bars, variant bars, cells that appear and go. */
export function step(board: Board): void { todo(board); }
/** Every Life you could live now, best value first. */
export function options(board: Board): Option[] { return todo(board); }
/** One Life: found the heir in this cell, then `TOY.lifeGens` generations pass. False (and nothing changes) if it
 *  is not one of `options`. */
export function live(board: Board, place: number, job: JobId): boolean { return todo(board, place, job); }
/** Take the variant in a cell of yours: it becomes the heir and holds the cell. No time passes. */
export function adopt(board: Board, place: number, job: JobId): boolean { return todo(board, place, job); }
/** Who is on the way to an open cell and in how many generations; null if no bar runs there. */
export function coming(board: Board, place: number, job: JobId): { named: Named; gens: number } | null { return todo(board, place, job); }
/** The real species a build is, if its dials sit within half a step of one and it has that species' mutations. */
export function nameOf(build: Build): Named | null { return todo(build); }
/** The one next goal. */
export function nextGoal(board: Board): Goal { return todo(board); }
