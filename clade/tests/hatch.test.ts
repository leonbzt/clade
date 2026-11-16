import { describe, expect, it } from 'vitest';
import { DEV_LINEAGES, DEV_SPECIES } from '../src/data/builds';
import { HEADS_PER_EGG } from '../src/data/economy';
import type { Card } from '../src/sim/clutch';
import { bodyMass } from '../src/sim/fitness';
import { hatch } from '../src/sim/hatch';
import { levelOf, pointsOf } from '../src/sim/line';
import type { Letter } from '../src/sim/records';
import { makeWorld } from '../src/sim/sea';

function fixture(id = 'root-worm') {
  const world = makeWorld(1), line = structuredClone(DEV_LINEAGES[0]);
  const parent = structuredClone(DEV_SPECIES.find((s) => s.id === id)!);
  world.generation = 17;
  world.lineages.push(line);
  world.species = structuredClone(DEV_SPECIES.filter((s) => s.id === 'root-worm' && s.id !== id));
  world.species.push(parent);
  return { world, line, parent, habitat: world.habitats[0] };
}

describe('hatching', () => {
  it('keeping the parent preserves its form and history, adds its founder biomass and earns line XP', () => {
    const { world, line, parent, habitat } = fixture('grazer-worm');
    line.xp = 55;
    habitat.pops[parent.id] = 13;
    const before = structuredClone(world), original = structuredClone(parent);
    expect(hatch(world, habitat, structuredClone(parent), null, 12, 'A')).toBe(parent);
    expect(parent).toEqual(original);
    expect(habitat.pops[parent.id]).toBe(13 + 12 * HEADS_PER_EGG * bodyMass(parent.build));
    expect([line.xp, levelOf(line.xp), pointsOf(line)]).toEqual([115, 2, 1]);
    expect(world.species).toEqual(before.species);
    expect(world.generation).toBe(17);
    expect(world.habitats.slice(1)).toEqual(before.habitats.slice(1));
    expect(habitat.stocks).toEqual(before.habitats[0].stocks);
  });

  it.each([
    { id: 'root-worm', card: { kind: 'gain', part: 'bulb', place: 'tail' },
      parts: { tail: 'bulb' }, name: 'Burrowing bulb worm' },
    { id: 'tentacle-worm', card: { kind: 'swap', part: 'proboscis', place: 'front' },
      parts: { front: 'proboscis' }, name: 'Proboscis worm' },
    { id: 'grazer-worm', card: { kind: 'lose', part: 'pouch', place: 'tail' },
      parts: { front: 'tentacles', sides: 'sclerite' }, name: 'Brood pouch worm' },
  ] as const)('a $card.kind card founds an independent child of the played parent', ({ id, card, parts, name }) => {
    const { world, line, parent, habitat } = fixture(id);
    parent.build.genes = { size: 3, gut: 2 };
    const original = structuredClone(parent), choice = structuredClone(card);
    const child = hatch(world, habitat, parent, card, 9, 'B')!;
    expect(child).toMatchObject({ lineage: parent.lineage, parent: parent.id, born: 17, name,
      build: { clade: parent.build.clade, parts, genes: { size: 3, gut: 2 } } });
    expect(child.id).not.toBe(parent.id);
    expect(world.species.find((s) => s.id === child.id)).toBe(child);
    expect(habitat.pops).toEqual({ [child.id]: 9 * HEADS_PER_EGG * bodyMass(child.build) });
    expect(line.xp).toBe(36);
    expect(parent).toEqual(original);
    expect(card).toEqual(choice);
    child.build.genes.size++;
    child.build.parts.eyes = 'eye';
    expect(parent).toEqual(original);
  });

  it('reuses a build anywhere in the same line regardless of part key order, preserving its name and ancestry', () => {
    const { world, line, parent, habitat } = fixture('tentacle-worm');
    const existing = { ...structuredClone(parent), id: 'old-heir', name: 'Older form', born: 3, parent: 'root-worm' };
    existing.build.parts = { tail: 'bulb', front: 'tentacles' };
    world.species.push(existing);
    habitat.pops[existing.id] = 7;
    const before = structuredClone(existing), count = world.species.length;
    const child = hatch(world, habitat, parent, { kind: 'gain', part: 'bulb', place: 'tail' }, 2, 'D');
    expect(child).toBe(existing);
    expect(existing).toEqual(before);
    expect(world.species).toHaveLength(count);
    expect(habitat.pops[existing.id]).toBe(7 + 2 * HEADS_PER_EGG * bodyMass(existing.build));
    expect(habitat.pops[parent.id]).toBeUndefined();
    expect(line.xp).toBe(4);
  });

  it('a loss returning to an ancestor reuses it rather than making another bare form', () => {
    const { world, parent, habitat } = fixture('tentacle-worm');
    const ancestor = world.species[0], original = structuredClone(ancestor);
    expect(hatch(world, habitat, parent, { kind: 'lose', part: 'tentacles', place: 'front' }, 3, 'C')).toBe(ancestor);
    expect(ancestor).toEqual(original);
    expect(world.species).toHaveLength(2);
    expect(habitat.pops).toEqual({ [ancestor.id]: 3 * HEADS_PER_EGG * bodyMass(ancestor.build) });
  });

  it('matches the complete build and line, including genes and the actual part places', () => {
    const { world, parent, habitat } = fixture();
    const lookalikes = Array.from({ length: 6 }, (_, i) => ({ ...structuredClone(parent), id: `other-${i}` }));
    for (const s of lookalikes) s.build.parts = { tail: 'pouch' };
    lookalikes[0].lineage = null;
    lookalikes[1].lineage = 'other-line';
    lookalikes[2].build.clade = 'arthropod';
    lookalikes[3].build.genes.size++;
    lookalikes[4].build.genes.gut++;
    lookalikes[5].build.parts = { sides: 'pouch' };
    world.species.push(...lookalikes);
    const child = hatch(world, habitat, parent, { kind: 'gain', part: 'pouch', place: 'tail' }, 1, 'F')!;
    expect(lookalikes.map((s) => s.id)).not.toContain(child.id);
    expect(child).toMatchObject({ lineage: 'worm-line', parent: parent.id, build: { parts: { tail: 'pouch' } } });
    expect(world.species).toHaveLength(8);
  });

  it('numbers taken names, avoids ID collisions and reuses the new form on a later hatch', () => {
    const { world, line, parent, habitat } = fixture();
    world.species.push(
      { ...structuredClone(parent), id: `${parent.id}-child-1`, name: 'Burrowing bulb worm' },
      { ...structuredClone(parent), id: 'another-name', lineage: null, name: 'Burrowing bulb worm 2' },
    );
    const card: Card = { kind: 'gain', part: 'bulb', place: 'tail' };
    const child = hatch(world, habitat, parent, card, 1, 'D')!;
    expect([child.id, child.name]).toEqual([`${parent.id}-child-2`, 'Burrowing bulb worm 3']);
    const count = world.species.length;
    expect(hatch(world, habitat, parent, card, 2, 'D')).toBe(child);
    expect(world.species).toHaveLength(count);
    expect(habitat.pops[child.id]).toBe(3 * HEADS_PER_EGG * bodyMass(child.build));
    expect(line.xp).toBe(6);
  });

  it('keeps the played parent even when its line already contains another species with the same build', () => {
    const { world, parent, habitat } = fixture();
    world.species.unshift({ ...structuredClone(parent), id: 'twin', name: 'Twin' });
    expect(hatch(world, habitat, parent, null, 1, 'D')).toBe(parent);
    expect(habitat.pops).toEqual({ [parent.id]: HEADS_PER_EGG * bodyMass(parent.build) });
  });

  it('awards the supplied Life letter weight and stores only XP, with points and levels still derived', () => {
    for (const [letter, weight] of [['F', 1], ['D', 2], ['C', 3], ['B', 4], ['A', 5], ['S', 6]] as [Letter, number][]) {
      const { world, line, parent, habitat } = fixture();
      line.xp = 55;
      line.ranks = { tentacles: 1 };
      hatch(world, habitat, parent, { kind: 'gain', part: 'tentacles', place: 'front' }, 20, letter);
      expect(line.xp).toBe(55 + 20 * weight);
      expect(pointsOf(line)).toBe(levelOf(line.xp) - 2);
      expect(Object.keys(line).sort()).toEqual(['clade', 'id', 'job', 'ranks', 'xp']);
      expect(Object.keys(world).sort()).toEqual(['bars', 'claimed', 'generation', 'habitats', 'lineages', 'seed', 'species']);
      expect(JSON.stringify(world)).not.toMatch(/"(?:points?|level|letters?|tiers?|slots?|cards?|eggs|mutation)":/);
    }
  });

  it('zero eggs keep the parent with no population, XP or other world change', () => {
    const { world, parent, habitat } = fixture(), before = structuredClone(world);
    expect(hatch(world, habitat, parent, null, 0, 'S')).toBe(parent);
    expect(world).toEqual(before);
  });

  it('rejects a missing parent, line or habitat and invalid eggs without partial settlement', () => {
    const { world, parent, habitat } = fixture(), before = structuredClone(world);
    const card: Card = { kind: 'gain', part: 'bulb', place: 'tail' };
    for (const eggs of [-1, NaN, Infinity]) expect(hatch(world, habitat, parent, card, eggs, 'B')).toBeNull();
    expect(hatch(world, { ...habitat, id: -1 }, parent, card, 3, 'B')).toBeNull();
    expect(hatch(world, habitat, { ...parent, id: 'missing' }, card, 3, 'B')).toBeNull();
    expect(world).toEqual(before);
    world.lineages = [];
    const withoutLine = structuredClone(world);
    expect(hatch(world, habitat, parent, card, 3, 'B')).toBeNull();
    expect(world).toEqual(withoutLine);
  });
});
