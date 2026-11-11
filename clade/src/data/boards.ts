// The Life's board numbers. Boards are generated from the habitat (*decided 11 Nov*); the shares, features and turns
// start from the three old templates in game/src/data/habitats.ts (mud flats, sand shallows, volcanic rock).
import type { Depth, Substrate } from './ground';
import type { BoardEvent } from '../sim/life';

export const BOARD = {
  shadow: true, // hunter: a shadow from deep water at the bottom type's turn; off = no hunter until N4
  rivalAt: 6, // rivals: minimum resident heads (grams ÷ body mass); game/'s BOARD.rivalAt counted heads
  rivals: 1, // rivals: residents on the board, heaviest first
  rivalGap: 4, // rivals: minimum steps from the start
  nodes: 14, // food: nodes of a food at the reference density (the templates held 10–21)
  maxShare: 1.5, // food: at most this many times `nodes`
  smooth: 2, // ground: blur passes over the noise; more passes make bigger patches
  band: 3, // events: rows or columns in the shore or the deep band
};

/** Ground by bottom type: shares of the board's cells, the features and the shadow's turn (from the templates). */
export const GROUNDS: Record<Substrate, { mud: number; wall: number; shells: number; carcasses: number; shadowTurn: number }> = {
  mud: { mud: 0.68, wall: 0.03, shells: 2, carcasses: 1, shadowTurn: 6 }, // the old mud flats
  sand: { mud: 0.09, wall: 0.03, shells: 8, carcasses: 1, shadowTurn: 4 }, // the old sand shallows
  rock: { mud: 0.05, wall: 0.26, shells: 6, carcasses: 0, shadowTurn: 5 }, // the old volcanic rock
};

type EventId = 'lowTide' | 'mudslide' | 'ventSurge' | 'upwelling';
type EventSpec = Omit<BoardEvent, 'rows' | 'cols'> & { band?: 'shore' | 'deep' };

export const EVENTS: Record<EventId, EventSpec> = {
  lowTide: { from: 9, to: 12, where: 'all', band: 'shore', name: 'Low tide', text: 'the band by the shore runs dry', look: 'dry' },
  mudslide: { from: 12, to: 15, where: 'mud', name: 'Mudslide', text: 'no oxygen in the mud', look: 'murk' },
  ventSurge: { from: 8, to: 10, where: 'all', name: 'Vent surge', text: 'warm water, oxygen falls everywhere', look: 'haze' },
  upwelling: { from: 10, to: 13, where: 'all', band: 'deep', name: 'Upwelling', text: 'cold deep water, no oxygen on the deep side', look: 'murk' }, // new, 11 Nov
};

/** Tides make the flats; below them the bottom type picks the event. */
const BELOW: Record<Substrate, EventId> = { sand: 'upwelling', mud: 'mudslide', rock: 'ventSurge' };
export const EVENT_AT: Record<Depth, Record<Substrate, EventId>> = {
  flat: { sand: 'lowTide', mud: 'lowTide', rock: 'lowTide' },
  shallows: BELOW, slope: BELOW, deep: BELOW,
};
