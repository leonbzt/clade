import { describe, expect, it } from 'vitest';
import { SPECIES, SPECIES_INDEX, type SpeciesDef } from '../src/data/species';
import { STRATA } from '../src/data/fields';
import { agentsStep, spawn, tileOf } from '../src/sim/agents';
import { arrivals } from '../src/sim/arrivals';
import { evolve } from '../src/sim/commands';
import { profiles } from '../src/sim/fit';
import { createState, SEA, VENT, type State } from '../src/sim/state';
import { recount, speciesIndex, variantFor } from '../src/sim/variants';

/** A damp land tile next to a vent, with nothing on it. */
function dampTile(s: State): number {
  const v = s.terrain.findIndex((t) => t === VENT);
  return [v + 2, v - 2, v + 2 * s.w, v - 2 * s.w].find((i) => s.terrain[i] !== SEA && s.terrain[i] !== VENT)!;
}

function animal(s: State, id: string, i: number, e = 0.6) {
  const sp = speciesIndex(s, id), v = variantFor(s, sp, s.species[sp].genome);
  spawn(s, v, i, 1, 'test');
  const a = s.agents[s.agents.length - 1];
  a.e = e; a.age = a.life * 0.3;
  return a;
}

/** A full moss plant on tile i, with or without the Bitter gene. */
function moss(s: State, i: number, bitter = false) {
  const sp = speciesIndex(s, 'moss'), v = variantFor(s, sp, { axes: [0, 0, 0, 0], traits: bitter ? ['bitter'] : [] });
  const slot = STRATA.indexOf('ground') * s.w * s.h + i;
  s.occ[slot] = v; s.cover[slot] = 1; s.health[slot] = 1;
  return slot;
}

describe('animals', () => {
  it('a fed animal breeds and its young copy its genome; a starving one dies and leaves litter', () => {
    const s = createState(1), i = dampTile(s), a = animal(s, 'snail', i, 0.9);
    recount(s);
    agentsStep(s, profiles(s), 0.1);
    const young = s.agents.filter((b) => b.mom === a.id);
    expect(young.length).toBeGreaterThan(0);
    for (const b of young) expect(s.variants[b.v].genome).toEqual(s.variants[a.v].genome);
    const c = animal(s, 'snail', i, 0.00001);
    s.fall.fill(0);
    agentsStep(s, profiles(s), 0.1);
    expect(s.agents.find((b) => b.id === c.id)).toBeUndefined();
    expect(s.obits.at(-1)).toMatchObject({ id: c.id, text: 'starved' });
    expect(s.fall[i]).toBeGreaterThan(0);
  });

  it('an arrival shows up at its landmark once its node is ready, and adopting puts the animals there', () => {
    const s = createState(2);
    s.reached.push('animals'); s.ready.push('snails');
    arrivals(s, 1);
    const at = s.visitors.snails;
    expect(at).toBeDefined();
    expect(s.landmarks[s.mark[at]].kind).toBe('beach');
    s.biomass = 1000;
    expect(evolve(s, 'snails').ok).toBe(true);
    const snails = s.agents.filter((a) => s.species[a.sp].id === 'snail');
    expect(snails.length).toBe(5);
    for (const a of snails) expect(tileOf(s, a)).toBe(at);
    expect(s.visitors.snails).toBeUndefined();
  });

  it('grazing takes cover and adds nitrogen; Bitter cuts what grazers take', () => {
    const graze = (bitter: boolean) => {
      const s = createState(3), i = dampTile(s), slot = moss(s, i, bitter), a = animal(s, 'snail', i, 0.5);
      const n0 = s.layers.nitrogen[i];
      for (let k = 0; k < 20; k++) { a.e = 0.5; agentsStep(s, profiles(s), 0.1); }
      return { lost: 1 - s.cover[slot], n: s.layers.nitrogen[i] - n0 };
    };
    const plain = graze(false), bitter = graze(true);
    expect(plain.lost).toBeGreaterThan(0);
    expect(plain.n).toBeGreaterThan(0);
    expect(bitter.lost).toBeLessThan(plain.lost * 0.5);
  });

  it('a new animal added only as data lives, eats and breeds', () => {
    const springtail = SPECIES[SPECIES_INDEX.springtail];
    const bug: SpeciesDef = { ...springtail, id: 'testbug', name: 'Test bugs', short: 'Bug',
      animal: { ...springtail.animal!, tag: 'testbug', group: 1, young: 2, diet: [{ stock: 'litter', rate: 0.01, gain: 10 }] } };
    SPECIES.push(bug); SPECIES_INDEX.testbug = SPECIES.length - 1;
    try {
      const s = createState(4), i = dampTile(s);
      for (let k = 0; k < s.layers.litter.length; k++) if (s.terrain[k] !== SEA) s.layers.litter[k] = 0.3;
      const a = animal(s, 'testbug', i, 0.5);
      for (let k = 0; k < 600; k++) { recount(s); agentsStep(s, profiles(s), 0.1); }
      expect(a.ate).toBeGreaterThan(0);
      expect(s.agents.filter((b) => s.species[b.sp].id === 'testbug').length).toBeGreaterThan(1);
    } finally {
      SPECIES.pop(); delete SPECIES_INDEX.testbug;
    }
  });
});
