import { describe, expect, it } from 'vitest';
import { DEV_SPECIES } from '../src/data/builds';
import { CLUTCH } from '../src/data/clutch';
import { COLS, ROWS } from '../src/data/life';
import { PARTS } from '../src/data/parts';
import { clutchSize, clutchWeight, heirBuild, rollClutch, type Card } from '../src/sim/clutch';
import { grow, lay, resultOf } from '../src/sim/economy';
import { loseAt, newLife, stay, type Board } from '../src/sim/life';
import { pickMutation } from '../src/sim/mutation';
import type { Build, Species } from '../src/sim/records';

const bare = DEV_SPECIES.find((s) => s.id === 'root-worm')!;
const parent = DEV_SPECIES.find((s) => s.id === 'grazer-worm')!;
const SEEDS = [7, 17, 42, 99];
const report = (eggs = 10) => ({
  eggs, mutation: null, eggsAfter: 0, enforced: {}, ate: {}, cause: 'season' as const, witnessed: [],
});

describe('the clutch', () => {
  it('gives no cards at zero eggs, two below ten, and three from ten onwards, including the sure mutation', () => {
    expect([-1, 0, 1, 9, 10, 100].map(clutchSize)).toEqual([0, 0, 2, 2, 3, 3]);
    for (const eggs of [0, 1, 9, 10, 100]) {
      const result = { ...report(eggs), mutation: { part: 'eye' as const, place: 'eyes' as const }, eggsAfter: eggs };
      expect(rollClutch(report(eggs), parent, 7)).toHaveLength(clutchSize(eggs));
      expect(rollClutch(result, parent, 7)).toHaveLength(clutchSize(eggs));
    }
  });

  it('repeats for the same result, parent and seed, varies by seed and mutates no input', () => {
    const result = { ...report(), enforced: { tentacles: 2, sclerite: 1 } };
    const before = structuredClone({ result, parent });
    const draws = SEEDS.map((seed) => {
      const cards = rollClutch(result, parent, seed);
      expect(rollClutch(result, parent, seed)).toEqual(cards);
      return JSON.stringify(cards);
    });
    expect(new Set(draws).size).toBeGreaterThan(1);
    expect({ result, parent }).toEqual(before);
  });

  it.each(['worm', 'arthropod', 'trilobite', 'swimmer'] as const)('makes legal single-part changes for %s', (clade) => {
    const species: Species = { ...parent, build: { ...parent.build, clade,
      parts: { front: clade === 'worm' ? 'tentacles' : clade === 'swimmer' ? 'arms' : 'rake', sides: 'gill' } } };
    const kinds = new Set<string>();
    for (const seed of SEEDS) for (const card of rollClutch(report(), species, seed)) {
      kinds.add(card.kind);
      const carried = species.build.parts[card.place];
      if (card.kind === 'lose') expect(card.part).toBe(carried);
      else {
        expect(PARTS[card.part].plans).toContain(clade);
        expect(PARTS[card.part].rare).not.toBe(true);
        expect(card.place).toBe(PARTS[card.part].place);
        if (card.kind === 'gain') expect(carried).toBeUndefined();
        else { expect(carried).toBeDefined(); expect(card.part).not.toBe(carried); }
      }
      const heir = heirBuild(species.build, card);
      expect(Object.keys({ ...species.build.parts, ...heir.parts }).filter((place) =>
        species.build.parts[place as keyof Build['parts']] !== heir.parts[place as keyof Build['parts']]))
        .toEqual([card.place]);
    }
    expect([...kinds].sort()).toEqual(['gain', 'lose', 'swap']);
  });

  it('keeps gain and lose equally weighted regardless of how many parts each pool holds', () => {
    expect(CLUTCH.kinds.gain).toBe(CLUTCH.kinds.lose);
    const light = { ...parent, build: { ...parent.build, parts: { front: 'tentacles' as const } } };
    const kinds = new Set<string>();
    for (const seed of SEEDS) {
      const a = rollClutch(report(), light, seed).map((c) => c.kind);
      const b = rollClutch(report(), parent, seed).map((c) => c.kind);
      expect(a).toEqual(b);
      a.forEach((kind) => kinds.add(kind));
    }
    expect([...kinds].sort()).toEqual(['gain', 'lose', 'swap']);
  });

  it('handles bare and fully occupied builds by rolling only kinds that can change them', () => {
    const full: Species = { ...parent, build: { ...parent.build, clade: 'arthropod',
      parts: { front: 'rake', eyes: 'eye', limbs: 'leg', sides: 'spine', back: 'shield', tail: 'pouch' } } };
    for (const seed of SEEDS) {
      expect(rollClutch(report(), bare, seed).every((c) => c.kind === 'gain')).toBe(true);
      const cards = rollClutch(report(), full, seed);
      expect(cards).toHaveLength(3);
      expect(cards.every((c) => c.kind === 'swap' || c.kind === 'lose')).toBe(true);
    }
  });

  it('doubles a family per enforced rank across its parts, including parts the parent does not carry', () => {
    const enforced = { tentacles: 2, bulb: 1, sclerite: 1, eye: 0 };
    expect(['tentacles', 'proboscis', 'gut', 'sclerite', 'gill', 'eye', 'pouch'].map((part) =>
      clutchWeight(enforced, part as keyof typeof PARTS))).toEqual([8, 8, 8, 2, 2, 1, 1]);
    expect(clutchWeight({}, 'tentacles')).toBe(1);
    expect(SEEDS.map((seed) => rollClutch({ ...report(), enforced }, parent, seed)))
      .not.toEqual(SEEDS.map((seed) => rollClutch(report(), parent, seed)));
  });

  it('leads with the mutation only after laying, even after it is shed, without duplicating that gain', () => {
    const board: Board = {
      substrate: 'sand', map: Array.from({ length: ROWS }, () => '.'.repeat(COLS)),
      start: [3, 1], entry: [0, 0], predatorAt: null, event: null, rivals: [],
    };
    const life = newLife(board, structuredClone(bare.build), {}, 7);
    life.food = 99;
    grow(life); stay(life); grow(life);
    const part = life.mutationOffer![0];
    expect(pickMutation(life, part)).toBe(true);
    lay(life);
    loseAt(life, life.mutation!.place);
    life.phase = 'over'; life.cause = 'season';
    const result = resultOf(life)!;
    expect(result.eggsAfter).toBeGreaterThan(0);
    for (const seed of SEEDS) {
      const cards = rollClutch(result, bare, seed);
      expect(cards[0]).toEqual({ kind: 'gain', part, place: PARTS[part].place });
      expect(cards.filter((c) => c.part === part)).toHaveLength(1);
      expect(heirBuild(bare.build, cards[0]).parts[PARTS[part].place]).toBe(part);
      expect(rollClutch({ ...result, eggsAfter: 0 }, bare, seed)).toEqual(rollClutch(report(result.eggs), bare, seed));
      expect(rollClutch({ ...result, mutation: null }, bare, seed)).toEqual(rollClutch(report(result.eggs), bare, seed));
      expect(rollClutch({ ...result, eggs: 0 }, bare, seed)).toEqual([]);
    }
    expect(life.lost).toContain(PARTS[part].place);
    expect(bare.build.parts).toEqual({});
  });
});

describe('the heir build', () => {
  it.each<Card>([
    { kind: 'gain', part: 'eye', place: 'eyes' },
    { kind: 'swap', part: 'proboscis', place: 'front' },
    { kind: 'lose', part: 'tentacles', place: 'front' },
    { kind: 'lose', part: 'pouch', place: 'sides' },
  ])('applies $kind of $part at $place without sharing the parent\'s parts or genes', (card) => {
    const build: Build = { clade: 'worm', parts: { front: 'tentacles', sides: 'pouch' }, genes: { size: 2, gut: 3 } };
    const before = structuredClone(build);
    const heir = heirBuild(build, card);
    const parts = { ...build.parts };
    if (card.kind === 'lose') delete parts[card.place];
    else parts[card.place] = card.part;
    expect(heir).toEqual({ ...build, parts });
    expect(build).toEqual(before);
    heir.parts.back = 'gut'; heir.genes.size++;
    expect(build).toEqual(before);
  });
});
