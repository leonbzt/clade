import { fullOf, setMass } from '../src/sim/life';
import { describe, expect, it } from 'vitest';
import { GENES } from '../src/data/genes';
import { SPECIES, SPECIES_INDEX, type SpeciesDef } from '../src/data/species';
import { STRATA } from '../src/data/fields';
import { MASS } from '../src/data/masses';
import { LITTER_G } from '../src/sim/tally';
import { agentsStep, spawn, tileOf } from '../src/sim/agents';
import { arrivals } from '../src/sim/arrivals';
import { evolve, foundSpecies, splitCost, speciesCost } from '../src/sim/commands';
import { profiles } from '../src/sim/fit';
import { createState, SEA, VENT, type State } from '../src/sim/state';
import { recount, speciesIndex, variantFor } from '../src/sim/variants';

/** A damp land tile next to a vent, with nothing on it. */
function dampTile(s: State): number {
  const v = s.terrain.findIndex((t) => t === VENT);
  return [v + 2, v - 2, v + 2 * s.w, v - 2 * s.w].find((i) => s.terrain[i] !== SEA && s.terrain[i] !== VENT)!;
}

/** One tick for the animals (each updates on its own pace). */
function tick(s: State) {
  s.tick++;
  agentsStep(s, profiles(s));
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
  s.occ[slot] = v; setMass(s, slot, fullOf(s, v)); s.health[slot] = 1;
  return slot;
}

describe('animals', () => {
  it('a full group splits and the half walks off with its genome; pace changes how often, not how much', () => {
    const s = createState(1), i = dampTile(s), a = animal(s, 'snail', i, 0.9);
    a.n = 11;
    recount(s);
    for (let k = 0; k < 4; k++) tick(s);
    const half = s.agents.find((b) => b.mom === a.id)!;
    expect(half.n).toBeGreaterThan(4);
    expect(half.go).toBe(true);
    expect(Math.hypot(half.tx - a.x, half.ty - a.y)).toBeGreaterThan(3);
    expect(s.variants[half.v].genome).toEqual(s.variants[a.v].genome);
    // A resting snail spends the same energy over 10 s at its own pace (4) as when it updates every tick.
    const rest = () => {
      const t = createState(1), b = animal(t, 'snail', dampTile(t), 1);
      for (let k = 0; k < 100; k++) tick(t);
      return b.e;
    };
    const body = SPECIES[SPECIES_INDEX.snail].animal!, own = rest();
    body.pace = 1;
    try { expect(Math.abs(own - rest())).toBeLessThan(0.01); } finally { body.pace = 4; }
    expect(own).toBeLessThan(1);
  });

  it('a starving animal dies and leaves litter', () => {
    const s = createState(1), i = dampTile(s);
    const c = animal(s, 'snail', i, 0.00001);
    s.fall.fill(0);
    for (let k = 0; k < 4; k++) tick(s);
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
    s.biomass = 1e9;
    expect(evolve(s, 'snails').ok).toBe(true);
    const snails = s.agents.filter((a) => s.species[a.sp].id === 'snail');
    expect(snails.reduce((m, a) => m + a.n, 0)).toBe(5);
    for (const a of snails) expect(tileOf(s, a)).toBe(at);
    expect(s.visitors.snails).toBeUndefined();
  });

  it('grazing takes cover and adds nitrogen; Bitter cuts what grazers take', () => {
    const graze = (bitter: boolean) => {
      const s = createState(3), i = dampTile(s), slot = moss(s, i, bitter), a = animal(s, 'snail', i, 0.5);
      const n0 = s.layers.nitrogen[i];
      for (let k = 0; k < 20; k++) { a.e = 0.5; tick(s); }
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
      animal: { ...springtail.animal!, tag: 'testbug', group: 1, store: 3, young: 2, diet: [{ stock: 'litter' }] } }; // alone, it needs a store to make a young as big as itself
    SPECIES.push(bug); SPECIES_INDEX.testbug = SPECIES.length - 1; MASS.testbug = 0.0001;
    try {
      const s = createState(4), i = dampTile(s);
      for (let k = 0; k < s.layers.litter.length; k++) if (s.terrain[k] !== SEA) { s.layers.litter[k] = 0.3; s.litN[k] = 0.3 * LITTER_G * 0.015; } // 1.5% nitrogen
      const a = animal(s, 'testbug', i, 0.9);
      for (let k = 0; k < 600; k++) { recount(s); tick(s); }
      expect(a.ate).toBeGreaterThan(0);
      expect(s.agents.filter((b) => s.species[b.sp].id === 'testbug').length).toBeGreaterThan(1);
    } finally {
      SPECIES.pop(); delete SPECIES_INDEX.testbug; delete MASS.testbug;
    }
  });

  it('a springtail with the insect key splits into a bristletail, also once insects are reached', () => {
    const s = createState(1), sp = speciesIndex(s, 'springtail'), bt = SPECIES_INDEX.bristletail;
    s.reached.push('animals', 'hexapods', 'insects');
    s.biomass = 1e12;
    const v = variantFor(s, sp, { axes: [1, 0, 0, 0], traits: ['cuticle', 'insectBody'] });
    s.variants[v].shown = true;
    spawn(s, v, dampTile(s), 3, 'test');
    const made = s.made, reached = s.reached.length;
    expect(splitCost(s, v)).toBe(speciesCost(s, bt)); // a new species of the clade, not the door again
    expect([...s.terrain.keys()].some((i) => foundSpecies(s, v, i, 'Dry Bristletail').ok)).toBe(true);
    const x = s.species[s.species.length - 1];
    expect([x.base, x.genome.traits, s.made, s.reached.length]).toEqual([bt, [], made + 1, reached]);
    expect(s.agents.some((a) => a.v === v)).toBe(!!GENES.fresh); // start fresh: the variant's animals stay
  });
});
