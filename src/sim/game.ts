// The game state and its loop: the island, the garden, your species, biomass, sprouts and the ladder. No DOM.
import { ECONOMY, GARDEN } from '../data/garden';
import { ATTRS, B_TIER, FORMS, FOUNDER_GENES, MAX_PIPS, tierOf, type FormId, type Genes } from '../data/genes';
import { SUCCESSION } from '../data/island';
import { NICHES, NICHE_AT } from '../data/niches';
import { addGrams, gardenStep, newGarden, type Garden } from './garden';
import { findHabitats, type Habitats } from './habitats';
import { makeIsland, type Island } from './island';
import { seeded, type Rng } from './rng';
import { autoName, makeNatives, scaled, scoresFor, speciesColor, type Species } from './species';
import { succession } from './succession';
import { bumped } from './run/verbs';

export interface Sprout { id: number; sp: number; genes: Genes; form: FormId; patch: number; note: string; born: number }
export interface News { t: number; text: string; big?: boolean }
export interface Game {
  seed: number; isl: Island; hab: Habitats; garden: Garden; species: Species[];
  biomass: number; sprouts: Sprout[]; sproutClock: number; nextSprout: number;
  forms: Record<FormId, boolean>; firsts: Record<string, true>; // `${niche}:${tier}`
  news: News[]; yours: number; founder: number;
  holders: number[]; // per niche: the species with the most grams (not saved; for the news)
  run: { sprout: Sprout; cost: number } | null; // a run in progress (refunded if the page closes mid-run)
  rng: Rng;
}

export function newGame(seed: number): Game {
  const isl = makeIsland(seed), hab = findHabitats(isl), species = makeNatives();
  const founder: Species = {
    id: species.length, name: 'The founder', form: 'moss', layer: 0, genes: [...FOUNDER_GENES], stats: [], sn: [0, 0, 0, 0, 0, 0],
    scores: NICHES.map(() => -1), parent: -1, native: false, color: speciesColor(species.length, 'moss'), born: 0, niche: -1,
  };
  species.push(founder);
  const g: Game = {
    seed, isl, hab, garden: newGarden(hab, species), species, biomass: ECONOMY.startBiomass, sprouts: [], sproutClock: 0,
    nextSprout: 1, forms: { moss: true, herb: false, tree: false }, firsts: {}, news: [], yours: 0, founder: founder.id, run: null, holders: [],
    rng: seeded(seed * 31 + 7),
  };
  g.sprouts.push({ id: g.nextSprout++, sp: founder.id, genes: [...FOUNDER_GENES], form: 'moss', patch: homePatch(g, 'moss'), note: 'the founder: a free first run', born: 0 });
  say(g, 'A young island. Your founder moss waits by the vent.', true);
  return g;
}

export const say = (g: Game, text: string, big = false) => {
  g.news.unshift({ t: g.garden.t, text, big });
  if (g.news.length > 40) g.news.pop();
};

/** Patches a form can be grown in: the kind has the form's layer. */
export const canGrowIn = (g: Game, form: FormId, patch: number) => NICHE_AT[g.hab.patches[patch].kind][FORMS[form].layer] >= 0;

/** The valid patch nearest the first vent (the founder's home), or nearest a given patch. */
export function homePatch(g: Game, form: FormId, near = -1): number {
  const w = g.isl.w, at = near >= 0 ? g.hab.patches[near].at : g.isl.vents[0];
  const ax = at % w, ay = (at / w) | 0;
  let best = -1, bd = Infinity;
  for (const p of g.hab.patches) {
    if (!canGrowIn(g, form, p.id)) continue;
    const d = Math.hypot(p.x - ax, p.y - ay) - Math.min(p.tiles.length, 30) * 0.05;
    if (d < bd) { bd = d; best = p.id; }
  }
  return best;
}

export const runCost = (g: Game, s: Sprout) => (s.sp === g.founder && s.note.startsWith('the founder') ? 0 : ECONOMY.cost[s.form]);

/** One second of the game. */
export function gameStep(g: Game) {
  g.yours = gardenStep(g.garden, g.hab, g.species);
  g.biomass += (g.yours / 1000) * ECONOMY.perKg;
  const S = ECONOMY.sprout, has = g.species.some((s) => !s.native && s.id !== g.founder);
  if (has) {
    g.sproutClock += Math.min(S.max, Math.max(S.min, g.garden.seedy / 1000 / S.refKg)) / S.every; // Spread: more often
    if (g.sproutClock >= 1) { g.sproutClock -= 1; gardenSprout(g); }
  }
  if (g.garden.t % SUCCESSION.every === 0) {
    watchHolders(g);
    const r = succession(g.isl, g.hab, g.garden, g.species);
    if (r) {
      const at = g.sprouts.map((s) => g.hab.patches[s.patch]?.at ?? -1);
      g.hab = r.hab;
      g.sprouts.forEach((s, k) => {
        const q = at[k] >= 0 ? g.hab.of[at[k]] : -1;
        s.patch = q >= 0 && canGrowIn(g, s.form, q) ? q : homePatch(g, s.form);
      });
      for (const c of r.changes) if (c.tiles >= 4 || c.to === 'Forest floor') say(g, `${c.tiles} tile${c.tiles > 1 ? 's' : ''} of ${c.from} turned to ${c.to}`, c.to === 'Forest floor');
    }
  }
}

/** News when a row's holder changes to or from one of your lines. */
function watchHolders(g: Game) {
  const now = tierList(g).map((r) => r.holder?.id ?? -1), first = !g.holders.length;
  now.forEach((h, n) => {
    const was = g.holders[n] ?? -1;
    if (first || h === was || h < 0) return;
    const sp = g.species[h], old = was >= 0 ? g.species[was] : null;
    if (!sp.native) say(g, `${NICHES[n].name}: ${sp.name} now holds the most${old ? `, ahead of ${old.name}` : ''}`, true);
    else if (old && !old.native) say(g, `${NICHES[n].name}: ${sp.name} took the lead back from ${old.name}`);
  });
  g.holders = now;
}

/** The garden throws up a sprout where your lines hold grams: a seedling with a rare pip (or a sport), or the next form. */
export function gardenSprout(g: Game) {
  const S = ECONOMY.sprout, rng = g.rng, picks: [number, number, number][] = []; // patch, species, grams
  let total = 0;
  g.garden.life.forEach((life, p) => life.slots.forEach((slot) => slot?.forEach((e) => {
    if (g.species[e.sp].native) return;
    picks.push([p, e.sp, e.g]); total += e.g;
  })));
  if (!total) return;
  let r = rng() * total, at = picks[0];
  for (const x of picks) { r -= x[2]; if (r <= 0) { at = x; break; } }
  const sp = g.species[at[1]], next = FORMS[sp.form].next;
  let form = sp.form, note: string, genes = [...sp.genes];
  const open = ATTRS.map((_, i) => i).filter((i) => genes[i] < MAX_PIPS);
  if (next && g.forms[next] && rng() < S.formChance) {
    form = next; note = `came up as a ${FORMS[next].name.toLowerCase()}`;
  } else if (open.length) {
    const u = bumped(genes, open[Math.floor(rng() * open.length)], rng() < S.sportChance, rng);
    genes = u.genes;
    note = `${u.sport ? 'a sport' : 'a rare pip'}: ${u.changed.map((i) => `${ATTRS[i].name} ${genes[i] > sp.genes[i] ? '+' : '−'}${Math.abs(genes[i] - sp.genes[i])}`).join(', ')}`;
  } else note = 'a seedling';
  addSprout(g, { id: g.nextSprout++, sp: sp.id, genes, form, patch: canGrowIn(g, form, at[0]) ? at[0] : homePatch(g, form, at[0]), note, born: g.garden.t });
}

function addSprout(g: Game, s: Sprout) {
  g.sprouts.push(s);
  say(g, `A sprout of ${g.species[s.sp].name}: ${s.note}`);
  while (g.sprouts.length > ECONOMY.sprout.hold) {
    const old = g.sprouts.shift()!;
    say(g, `The oldest sprout (${g.species[old.sp].name}) wilted`);
  }
}

/** Start a run: pay, take the sprout. Returns an error text, or null. */
export function startRun(g: Game, sproutId: number, patch: number): string | null {
  const s = g.sprouts.find((x) => x.id === sproutId);
  if (!s) return 'no such sprout';
  if (!canGrowIn(g, s.form, patch)) return `a ${s.form} can't grow there`;
  const cost = runCost(g, s);
  if (g.biomass < cost) return 'not enough biomass';
  g.biomass -= cost;
  g.sprouts = g.sprouts.filter((x) => x !== s);
  g.run = { sprout: { ...s, patch }, cost };
  return null;
}

/** A run left unfinished: the sprout and the biomass come back. */
export function cancelRun(g: Game) {
  if (!g.run) return;
  g.biomass += g.run.cost;
  g.sprouts.unshift(g.run.sprout);
  g.sprouts = g.sprouts.slice(0, ECONOMY.sprout.hold);
  g.run = null;
}

/** The scores a body would get, per niche (for the release preview). */
export const previewScores = (form: FormId, raw: number[], genes: Genes) => scoresFor(form, scaled(form, raw), genes);

/** Release the run's final body as a new species into the patch it grew in. Returns the new species. */
export function release(g: Game, raw: number[], genes: Genes, name: string | null): Species {
  const run = g.run!, s = run.sprout, sn = scaled(s.form, raw), id = g.species.length, layer = FORMS[s.form].layer;
  const taken = new Set(g.species.map((x) => x.name));
  const sp: Species = {
    id, name: name?.trim() || autoName(s.form, sn, taken), form: s.form, layer, genes: [...genes], stats: [...raw], sn,
    scores: scoresFor(s.form, sn, genes), parent: s.sp, native: false, color: speciesColor(id, s.form), born: g.garden.t,
    niche: NICHE_AT[g.hab.patches[s.patch].kind][layer],
  };
  g.species.push(sp);
  addGrams(g.garden, g.hab, g.species, s.patch, layer, id, GARDEN.releaseGrams[layer]);
  g.run = null;
  const was = g.species[s.sp].scores[sp.niche] ?? -1, gain = was >= 0 && g.species[s.sp].form === s.form ? ` (${sp.scores[sp.niche] - was >= 0 ? '+' : '−'}${Math.abs(sp.scores[sp.niche] - was)})` : '';
  say(g, `${sp.name} released in the ${NICHES[sp.niche].name}: ${sp.scores[sp.niche]} ${tierOf(sp.scores[sp.niche])}${gain}`, true);
  // First time at a tier in a row: a sprout.
  for (const n of NICHES) {
    const sc = sp.scores[n.id];
    if (sc < 0) continue;
    const tier = tierOf(sc), key = `${n.id}:${tier}`;
    if (tier === 'F' || g.firsts[key]) continue;
    g.firsts[key] = true;
    say(g, `First ${tier} in ${n.name}: a sprout`, true);
    addSprout(g, { id: g.nextSprout++, sp: id, genes: [...genes], form: s.form, patch: s.patch, note: `first ${tier} in ${n.name}`, born: g.garden.t });
  }
  // The ladder: B in a mat row opens the herb; B in a herb row opens the tree.
  for (const [layer0, form] of [[0, 'herb'], [1, 'tree']] as const) {
    if (g.forms[form]) continue;
    if (NICHES.some((n) => n.layer === layer0 && sp.scores[n.id] >= B_TIER)) {
      g.forms[form] = true;
      say(g, `B in a ${layer0 ? 'herb' : 'mat'} row: the ${form} is open, and its rows`, true);
    }
  }
  return sp;
}

export interface Row {
  niche: number; open: boolean; why: string; best: Species | null; bestScore: number;
  holder: Species | null; holderShare: number; area: number; tiles: number; native: Species;
}

/** The tier list: per niche, your best species there, the holder (most grams), and the area your lines hold. */
export function tierList(g: Game): Row[] {
  return NICHES.map((n) => {
    const formOpen = Object.entries(g.forms).some(([f, on]) => on && FORMS[f as FormId].layer === n.layer);
    let tiles = 0, area = 0, total = 0;
    const grams = new Map<number, number>();
    for (const p of g.hab.patches) {
      if (p.kind !== n.kind) continue;
      tiles += p.tiles.length;
      const life = g.garden.life[p.id], slot = life.slots[n.layer];
      if (!slot) continue;
      let mine = 0;
      for (const e of slot) {
        grams.set(e.sp, (grams.get(e.sp) ?? 0) + e.g); total += e.g;
        if (!g.species[e.sp].native) mine += e.g;
      }
      if (life.cap[n.layer] > 0) area += p.tiles.length * Math.min(1, mine / life.cap[n.layer]);
    }
    let best: Species | null = null;
    for (const s of g.species) if (!s.native && s.scores[n.id] >= 0 && (!best || s.scores[n.id] > best.scores[n.id])) best = s;
    let hold = -1, hg = 0;
    for (const [s, gr] of grams) if (gr > hg) { hg = gr; hold = s; }
    const native = g.species.find((s) => s.native && s.niche === n.id)!;
    return {
      niche: n.id, open: formOpen && tiles > 0, why: !formOpen ? `opens with the ${['moss', 'herb', 'tree'][n.layer]}` : tiles ? '' : 'no such ground yet',
      best, bestScore: best ? best.scores[n.id] : -1, holder: hold >= 0 ? g.species[hold] : null, holderShare: total ? hg / total : 0,
      area, tiles, native,
    };
  });
}

/** Grams your lines hold per species (for the clade tree). */
export function gramsBySpecies(g: Game): Map<number, number> {
  const m = new Map<number, number>();
  for (const life of g.garden.life) for (const slot of life.slots) if (slot) for (const e of slot) if (!g.species[e.sp].native) m.set(e.sp, (m.get(e.sp) ?? 0) + e.g);
  return m;
}

