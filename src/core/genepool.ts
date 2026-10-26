// Generations, variant offers and favouring. The home nudges drought traits by itself.
import { NUMBERS } from '../data/numbers';
import { TEXT } from '../data/text';
import { TRAITS, TRAIT_BY_ID, type TraitId } from '../data/traits';
import { NODES, TARGET_NODE } from '../data/tree';
import { isCommon } from './modifiers';
import { random } from './rng';
import { logEvent } from './state';
import type { Colony, GameState, Offer } from './types';

const G = NUMBERS.generation;
const TARGET = NODES.find((n) => n.id === TARGET_NODE)!;

export function generationTime(s: GameState): number {
  return Math.min(G.maxTime, G.baseTime + G.stepTime * Math.max(0, s.genePool.generation - 1));
}

export function favourCost(s: GameState): number {
  return Math.round(G.favourBaseCost * Math.pow(G.favourCostGrowth, s.genePool.favours));
}

export function autoGenerations(s: GameState): boolean {
  return s.skill.level >= NUMBERS.photosynthesis.autoGenerationsAt;
}

export function precursorsCommon(s: GameState): number {
  return TARGET.precursors.filter((id) => isCommon(s.genePool.freq[id])).length;
}

export function keyInnovationUnlocked(s: GameState): boolean {
  return precursorsCommon(s) === TARGET.precursors.length;
}

function offerable(s: GameState, id: TraitId): boolean {
  if (s.genePool.freq[id] >= G.offerMaxFreq) return false;
  if (TRAIT_BY_ID[id].keyInnovation) return keyInnovationUnlocked(s);
  return true;
}

function pickFrom(s: GameState, ids: TraitId[]): TraitId {
  return ids[Math.floor(random(s) * ids.length)];
}

/** Three variants: the key innovation once unlocked, an uncommon precursor if any, the rest at random. */
export function makeOffer(s: GameState): Offer | null {
  const pool = s.genePool;
  const candidates = TRAITS.map((t) => t.id).filter((id) => offerable(s, id));
  if (candidates.length === 0) return null;
  const variants: TraitId[] = [];
  const take = (id: TraitId) => {
    if (!variants.includes(id)) variants.push(id);
  };
  const key = candidates.find((id) => TRAIT_BY_ID[id].keyInnovation && !isCommon(pool.freq[id]));
  if (key) take(key);
  const precursors = candidates.filter((id) => TARGET.precursors.includes(id) && !isCommon(pool.freq[id]));
  if (precursors.length > 0) take(pickFrom(s, precursors));
  while (variants.length < Math.min(G.variantsPerGeneration, candidates.length)) {
    take(pickFrom(s, candidates.filter((id) => !variants.includes(id))));
  }
  // shuffle so the guaranteed ones aren't always first
  for (let i = variants.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [variants[i], variants[j]] = [variants[j], variants[i]];
  }
  return { id: pool.nextOfferId++, variants };
}

function dryEdgeShare(c: Colony | null): number {
  if (!c) return 0;
  const covered = c.tiles.filter((t) => t.covered);
  if (covered.length === 0) return 0;
  return covered.filter((t) => t.dampness < G.dryEdgeDampness).length / covered.length;
}

function raise(s: GameState, id: TraitId, by: number): void {
  s.genePool.freq[id] = Math.min(1, s.genePool.freq[id] + by);
}

/** Records newly common traits, unlocks the key innovation and reaches the node. */
export function checkProgress(s: GameState): void {
  const unlockedBefore = TARGET.precursors.every((id) => s.traitsFound.includes(id));
  for (const t of TRAITS) {
    if (isCommon(s.genePool.freq[t.id]) && !s.traitsFound.includes(t.id)) {
      s.traitsFound.push(t.id);
      logEvent(s, TEXT.events.becameCommon(t.name));
    }
  }
  if (!unlockedBefore && keyInnovationUnlocked(s) && TARGET.keyInnovation) {
    const key = TRAIT_BY_ID[TARGET.keyInnovation];
    if (!isCommon(s.genePool.freq[key.id])) {
      logEvent(s, TEXT.events.keyInnovation(key.name));
      // the mutation shows up in the offer you're looking at
      const front = s.genePool.offers[0];
      if (front && !front.variants.includes(key.id)) front.variants[front.variants.length - 1] = key.id;
    }
  }
  if (TARGET.keyInnovation && isCommon(s.genePool.freq[TARGET.keyInnovation]) && !s.reached.includes(TARGET.id)) {
    s.reached.push(TARGET.id);
    s.codexOpen = TARGET.id;
    logEvent(s, TEXT.events.reached(TARGET.name));
  }
}

function completeGeneration(s: GameState, nudge: boolean): void {
  const pool = s.genePool;
  pool.generation++;
  pool.timer = 0;
  if (nudge) {
    const by = G.homeNudge + G.homeNudgeDryBonus * dryEdgeShare(s.colony);
    for (const t of TRAITS) if (t.drought) raise(s, t.id, by);
    if (pool.generation === 2) logEvent(s, TEXT.events.homeNudge); // said once, at the first nudge
  }
  const offer = makeOffer(s);
  if (offer) pool.offers.push(offer);
  checkProgress(s);
}

export function openGenePool(s: GameState): void {
  s.genePool.open = true;
  logEvent(s, TEXT.events.genePoolOpens);
  completeGeneration(s, false);
}

export function stepGenePool(s: GameState, dt: number): void {
  const pool = s.genePool;
  if (!pool.open) return;
  const limit = autoGenerations(s) ? G.queueMax : 1;
  if (pool.offers.length >= limit) return;
  pool.timer += dt;
  if (pool.timer >= generationTime(s)) completeGeneration(s, true);
}

export function favour(s: GameState, offerId: number, trait: TraitId): boolean {
  const pool = s.genePool;
  const offer = pool.offers.find((o) => o.id === offerId);
  const cost = favourCost(s);
  if (!offer || !offer.variants.includes(trait) || s.genes < cost) return false;
  s.genes -= cost;
  raise(s, trait, G.favourGain);
  pool.favours++;
  pool.offers = pool.offers.filter((o) => o !== offer);
  checkProgress(s);
  return true;
}

export function pass(s: GameState, offerId: number): void {
  s.genePool.offers = s.genePool.offers.filter((o) => o.id !== offerId);
}
