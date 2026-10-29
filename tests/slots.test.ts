import { describe, expect, it } from 'vitest';
import { STRATA } from '../src/data/fields';
import { GROUPS, LITTER, ROLES } from '../src/data/roles';
import { SPECIES, SPECIES_INDEX } from '../src/data/species';
import { botTick } from '../src/sim/bot';
import { pickHolder } from '../src/sim/slots';
import { createState, type State } from '../src/sim/state';
import { at } from '../src/sim/tally';

const role = (id: string) => ROLES.find((r) => r.id === id)!;

describe('slots', () => {
  it('makes roles from the data, eaten or not', () => {
    const eatsHerbs = SPECIES.some((d) => d.animal?.diet.some((f) => 'plants' in f && f.plants === 'herb'));
    expect(eatsHerbs).toBe(false);
    expect(role('graze:fern').food).toBe(SPECIES_INDEX.fern);
    expect(role('prey:slug').name).toBe('Slug eater');
    expect(ROLES.filter((r) => r.kind === 'lead').length).toBe(STRATA.length);
  });

  it('keeps a holder at a near-equal share, and opens when nobody takes enough', () => {
    const r = role('prey:snail'), takes = new Array(GROUPS).fill(0), beetle = SPECIES_INDEX.beetle, slug = SPECIES_INDEX.slug;
    takes[beetle] = 0.5; takes[slug] = 0.53; // slugs can't hunt, so a second hunter is faked with an animal group
    expect(pickHolder(r, takes, 1, beetle)[0]).toBe(beetle);
    takes[slug] = 0.7;
    expect(pickHolder(r, takes, 1, beetle)[0]).toBe(slug);
    takes.fill(0); takes[beetle] = 0.1;
    expect(pickHolder(r, takes, 1, -1)[0]).toBe(-1);
    expect(pickHolder(r, takes, 1, beetle)[0]).toBe(beetle); // a holder keeps it down to `keep`
  });

  it('takes no more than was made plus what was there', () => {
    const s = createState(1);
    for (let k = 0; k < 20 * 600; k++) botTick(s);
    const stock = standing(s);
    for (let k = 0; k < 300; k++) botTick(s);
    const B = s.board;
    for (let f = 0; f <= GROUPS; f++) {
      let made = 0, took = 0;
      for (let b = 0; b < s.regions.length; b++) {
        made += B.last[at(b, f, 0)] / 2;
        for (let g = 0; g < GROUPS; g++) took += B.last[at(b, f, 1 + g)] / 2;
      }
      expect(took, f === LITTER ? 'litter' : SPECIES[f].id).toBeLessThanOrEqual(made + stock[f] + 1e-3);
    }
  }, 120_000);
});

/** Cover per plant group, members per animal group, and the litter on the land, right after a window update. */
function standing(s: State): number[] {
  const out = new Array(GROUPS + 1).fill(0), n = s.w * s.h;
  for (let slot = 0; slot < s.occ.length; slot++) if (s.occ[slot] >= 0 && s.region[slot % n] >= 0) out[s.species[s.variants[s.occ[slot]].sp].base] += s.cover[slot];
  for (const a of s.agents) out[s.species[a.sp].base] += a.n;
  for (let i = 0; i < n; i++) if (s.region[i] >= 0) out[LITTER] += s.layers.litter[i];
  return out;
}
