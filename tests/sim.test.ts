import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { LAYER_IDS } from '../src/data/fields';
import { SPECIES_INDEX } from '../src/data/species';
import { createState, SEA, VENT, type State } from '../src/sim/state';
import { advance } from '../src/sim/tick';
import { botTick } from '../src/sim/bot';
import { canFoundSpecies, coverCount, evolve, found, foundingCost, foundSpecies } from '../src/sim/commands';
import { buildProfile, fit, profiles } from '../src/sim/fit';
import { keyCarrier, keyInnovations } from '../src/sim/keys';
import { comboOf, genomeKey, mutation, poolOf, rarity, recount, variantFor, ZERO } from '../src/sim/variants';
import { GENES, KEYS, TIER } from '../src/data/genes';
import { changed, snapshot } from '../src/sim/metrics';

function hash(s: State): number {
  let h = 2166136261;
  const feed = (v: number) => { h = Math.imul(h ^ (v | 0), 16777619); };
  for (const a of [s.occ, s.terrain]) for (const v of a) feed(v);
  for (const id of LAYER_IDS) for (const v of s.layers[id]) feed(v * 1e6);
  feed(s.biomass * 1e3);
  return h >>> 0;
}

const ventTile = (s: State) => s.terrain.findIndex((t) => t === VENT);

function play(seed: number): State {
  const s = createState(seed);
  evolve(s, 'cyanobacteria');
  found(s, 'cyano', ventTile(s) + 2);
  advance(s, 1200);
  return s;
}

function bot(seed: number, minutes: number): { s: State; turn: number } {
  const s = createState(seed);
  for (let k = 0; k < (minutes - 2) * 600; k++) botTick(s);
  const before = snapshot(s);
  for (let k = 0; k < 2 * 600; k++) botTick(s);
  return { s, turn: changed(s, before, snapshot(s)) };
}

describe('sim', () => {
  it('is deterministic: same seed and commands give the same state', () => {
    expect(hash(play(7))).toBe(hash(play(7)));
    expect(hash(play(7))).not.toBe(hash(play(8)));
  }, 60_000);

  it('regions: 8–14 per seed, each of at least 60 tiles, every land tile in one, unique names', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const s = createState(seed), sizes = s.regions.map(() => 0);
      s.terrain.forEach((t, i) => { if (t !== SEA) { expect(s.region[i]).toBeGreaterThanOrEqual(0); sizes[s.region[i]]++; } else expect(s.region[i]).toBe(-1); });
      expect(s.regions.length).toBeGreaterThanOrEqual(8);
      expect(s.regions.length).toBeLessThanOrEqual(14);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(60);
      expect(new Set(s.regions.map((g) => g.name)).size).toBe(s.regions.length);
    }
  });

  it('the wind: open lava on the windward side starts wetter than in the lee', () => {
    const s = createState(5), med = (ww: boolean) => {
      const v = [...s.base.water].filter((_, i) => s.region[i] >= 0 && s.regions[s.region[i]].kind === 'lava' && (s.windward[i] >= 0.5) === ww).sort((a, b) => a - b);
      return v[v.length >> 1];
    };
    expect(med(true) - med(false)).toBeGreaterThan(0.06);
  });

  it('makes every kind of landmark, and strong salt only on beaches', () => {
    const s = createState(4), kinds = new Set(s.landmarks.map((m) => m.kind));
    expect([...kinds].sort()).toEqual(['beach', 'cave', 'spring', 'vent']);
    const beach = new Set(s.landmarks.filter((m) => m.kind === 'beach').flatMap((m) => m.tiles));
    s.statuses.salty.forEach((v, i) => { if (v >= 1) expect(beach.has(i)).toBe(true); });
  });

  it('starts bare', () => {
    expect(createState(1).occ.every((o) => o < 0)).toBe(true);
  });

  it('needs the node before founding, and the first founding is free', () => {
    const s = createState(1), i = ventTile(s) + 2;
    expect(found(s, 'cyano', i).ok).toBe(false);
    evolve(s, 'cyanobacteria');
    expect(foundingCost(s, 'cyano')).toBe(0);
    expect(found(s, 'cyano', i).ok).toBe(true);
    expect(coverCount(s, 'cyano')).toBeGreaterThan(1);
    expect(foundingCost(s, 'cyano')).toBeGreaterThan(0);
  });

  it('refuses tiles a species cannot live on', () => {
    const s = createState(1);
    evolve(s, 'cyanobacteria');
    expect(found(s, 'cyano', 0).ok).toBe(false); // the corner is always sea
  });

  it('lichens fade from deep soil; ferns need it', () => {
    const s = createState(2), i = ventTile(s);
    s.layers.soil[i] = 0.9;
    expect(fit(s, buildProfile(s, SPECIES_INDEX.lichen, ZERO), i)).toBe(0);
    s.layers.soil[i] = 0;
    expect(fit(s, buildProfile(s, SPECIES_INDEX.fern, ZERO), i)).toBe(0);
  });

  it('after 10 bot minutes: layers stay in 0–1, several species live, and tiles keep changing', () => {
    const { s, turn } = bot(3, 10);
    for (const id of LAYER_IDS) for (const v of s.layers[id]) expect(v >= 0 && v <= 1).toBe(true);
    for (const c of s.cover) expect(Number.isFinite(c)).toBe(true);
    expect(Array.from(s.count).filter((c) => c > 0).length).toBeGreaterThanOrEqual(3);
    expect(turn).toBeGreaterThan(0);
    expect(Number.isFinite(s.biomass)).toBe(true);
  }, 120_000);

  it('variants: within the cap, no orphan slots, the bot opens Mosses by a split, and a Rare+ variant splits off', () => {
    const s = createState(5);
    for (let k = 0; k < 16 * 600; k++) {
      botTick(s);
      if (k % 600 === 0) {
        for (let sp = 0; sp < s.species.length; sp++) {
          const pool = poolOf(s, sp), shown = pool.filter((v) => s.variants[v].shown).length;
          expect(shown).toBeLessThanOrEqual(GENES.cap);
          expect(pool.length - shown).toBeLessThanOrEqual(GENES.hidden);
        }
        for (const v of s.occ) if (v >= 0) expect(s.variants[v].alive).toBe(true);
      }
    }
    expect(s.innovations.leafy).toBeDefined();
    expect(s.reached).toContain('mosses');
    const moss = s.species.find((x) => x.base === SPECIES_INDEX.moss && x.parent >= 0)!;
    expect(moss.form).toMatch(/^Leafy/);
    expect(moss.genome.traits).toEqual([]);
    // A hand-made Rare: three steps from the base genome; it founds a new species with its genome as the base.
    const g = { axes: [2, 0, 0, -1], traits: [] };
    expect(comboOf(g)?.id).toBe('crust');
    expect(rarity(s, SPECIES_INDEX.cyano, g)).toBe(TIER.rare);
    const v = s.variants.findIndex((x) => x.alive && x.sp === SPECIES_INDEX.cyano);
    Object.assign(s.variants[v], { genome: g, key: '2,0,0,-1|', tier: TIER.rare, shown: true });
    s.biomass = 1e9;
    expect(canFoundSpecies(s, v).ok).toBe(true);
    const held = s.occ.filter((o) => o === v).length;
    const before = s.species.length, tile = [...s.terrain.keys()].find((i) => foundSpecies(s, v, i, 'Salt Crust').ok);
    expect(tile).toBeDefined();
    expect(s.species.length).toBe(before + 1);
    expect(s.species[before].genome.axes).toEqual([2, 0, 0, -1]);
    // A split, not a twin: the variant's tiles went with it.
    expect(s.occ.some((o) => o === v)).toBe(false);
    recount(s);
    expect(coverCount(s, s.species[before].id)).toBeGreaterThanOrEqual(held);
    expect(canFoundSpecies(s, v).ok).toBe(false); // once only
  }, 120_000);

  it('a door: a candidate gets the key, and its split keeps the axis genes and drops the traits', () => {
    const s = createState(3), th = SPECIES_INDEX.thallus, leafy = KEYS.find((k) => k.id === 'leafy')!;
    s.reached.push('cyanobacteria', 'land');
    s.biomass = 1e9;
    const at = ventTile(s) + 2;
    expect(found(s, 'thallus', at).ok).toBe(true);
    recount(s);
    let P = profiles(s);
    const g = { axes: [1, 0, 0, 1], traits: ['rhizoids'] }, v0 = poolOf(s, th)[0], v = variantFor(s, th, g, P);
    for (let k = 0; k < s.occ.length; k++) if (s.occ[k] === v0) s.occ[k] = v;
    recount(s);
    expect(s.variants[v].shown).toBe(true);
    for (let k = 0; k < 4 * 60 && keyCarrier(s, leafy) < 0; k++) { P = profiles(s); keyInnovations(s, P, 1); recount(s); }
    const c = keyCarrier(s, leafy);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(s.variants[c].tier).toBe(TIER.legendary);
    expect(genomeKey(s.variants[c].genome)).toBe('1,0,0,1|leafy,rhizoids');
    const tile = [...s.terrain.keys()].find((i) => foundSpecies(s, c, i, 'Vent Moss').ok);
    expect(tile).toBeDefined();
    const moss = s.species[s.species.length - 1];
    expect(moss.base).toBe(SPECIES_INDEX.moss);
    expect(moss.parent).toBe(th);
    expect(moss.genome).toEqual({ axes: [1, 0, 0, 1], traits: [] });
    expect(s.reached).toContain('mosses');
    expect(s.occ.some((o) => o === c)).toBe(false);
  });

  it('founding helps: a species founded at dry +2 steps to +3 far more often than its parent does', () => {
    const s = createState(2), cy = SPECIES_INDEX.cyano, g = { axes: [2, 0, 0, 0], traits: [] };
    const toThree = () => { let n = 0; for (let k = 0; k < 20000; k++) if (mutation(s, s.species.length - 1, g)?.axes[0] === 3) n++; return n; };
    s.species.push({ ...s.species[cy], id: 'parent' });
    const fromParent = toThree();
    s.species.push({ ...s.species[cy], id: 'founded', genome: g, parent: cy });
    const fromFounded = toThree();
    expect(fromFounded).toBeGreaterThan(2.5 * fromParent);
    expect(mutation(s, s.species.length - 1, { axes: [4, 0, 0, 0], traits: [] })?.axes[0] ?? 3).toBeLessThanOrEqual(4);
  });

  it('the sim has no clock or unseeded randomness', () => {
    for (const f of readdirSync('src/sim')) {
      const code = readFileSync(`src/sim/${f}`, 'utf8');
      expect(code, f).not.toMatch(/Math\.random|Date\.now|performance\.now/);
    }
  });
});
