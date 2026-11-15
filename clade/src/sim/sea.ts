// One generation, in grams: choose a slot and eat → breed/die → regrow → simultaneous spread. Regrow runs after the
// eating so the stored stock is the standing food: what the next eaters find and what every letter reads.
// Every slot and prediction below is temporary. World holds only the records, never a role or tier.
import { FOODS, HUNT, REGROW, SEA } from '../data/sea';
import { bodyMass, bodyOf, ceiling, density, reach, score, slots, stocked, valueIn, type Body } from './fitness';
import { makeGround } from './ground';
import { findHabitats, type Habitat } from './habitats';
import { hunted, speciesKit, threat } from './hunt';
import type { Build, Id, Ranks, Slot, SlotId, Species, World } from './records';
import { bud, prune, type Bud } from './wild';

export function makeWorld(seed: number): World {
  const habitats = findHabitats(makeGround(seed)).list;
  for (const h of habitats) for (const food of FOODS) h.stocks[food] = ceiling(h, food);
  return { seed, generation: 0, habitats, species: [], lineages: [] };
}

export const ranksOf = (world: World, lineage: Species['lineage']): Ranks =>
  world.lineages.find((line) => line.id === lineage)?.ranks ?? {};

/** Survival is the same in every slot, so it never changes the choice; pass it when the caller already knows it. */
export function bestSlot(build: Build, ranks: Ranks, h: Habitat, world: World, available = slots(h, world), survival?: number,
  body: Body = bodyOf(build, ranks)) {
  let chosen: { slot: Slot; fit: ReturnType<typeof score> } | undefined;
  for (const slot of available) {
    // The diet rule: a hunter scores 0 on food and a grazer 0 on prey, so skip those slots.
    if (!stocked(slot, h) || !!slot.prey !== body.hunts) continue;
    survival ??= threat(build, h, world).survival;
    const fit = score(build, ranks, slot, h, survival, body); // fitness without its sentences
    if (!chosen || fit.value > chosen.fit.value) chosen = { slot, fit };
  }
  return chosen;
}

/** A newcomer grows where appetite × value beats deaths at today's food: it moves only there. */
export const grows = (value: number) => SEA.appetite * value > SEA.deaths;

/** The sea's choice: the first stocked slot of the body's diet with the highest value, as `bestSlot` picks it. */
function choose(body: Body, h: Habitat, available: Slot[], survival: number) {
  let slot: Slot | undefined, best = 0;
  for (const s of available) {
    if (!stocked(s, h) || !!s.prey !== body.hunts) continue;
    const value = valueIn(body, s, h, survival);
    if (!slot || value > best) { slot = s; best = value; }
  }
  return slot && { slot, value: best };
}

/** One population's generation: grams born from what it ate, and grams that died (deaths, and the rest when it fell
 *  under two heads). The hunters' take is in `hunts`. */
export interface Tally { habitat: number; species: Id; born: number; died: number }
export interface Hunt { habitat: number; hunter: Id; prey: Id; grams: number }
export interface Move { from: number; to: number; species: Id; grams: number }
/** What one generation did, for the news, the paint and the replay. The UI keeps it; never World (law 2). */
export interface StepReport { generation: number; tallies: Tally[]; hunts: Hunt[]; moves: Move[]; buds: Bud[]; gone: Species[] }

/** Mutates ecological state in place; geometry stays. Species records change only by wild buds and pruning. */
export function step(world: World): StepReport {
  const { habitats, species } = world, n = species.length;
  const lines = new Map(world.lineages.map((line) => [line.id, line.ranks]));
  const bodies = species.map((s) => bodyOf(s.build, s.lineage === null ? {} : lines.get(s.lineage) ?? {}, speciesKit(s)));
  const floors = species.map((s) => SEA.extinctionHeads * bodyMass(s.build)); // two heads' mass
  const available = habitats.map((h) => slots(h, world)); // food slots read ceilings; the hunt slot reads opening prey
  const index = new Map(species.map((s, i) => [s.id, i]));
  const pops = new Float64Array(n), eaten = new Float64Array(n), lost = new Float64Array(n);
  const choices: (Slot | undefined)[] = new Array(n);
  const held = habitats.map(() => new Set<SlotId>());
  const report: StepReport = { generation: world.generation, tallies: [], hunts: [], moves: [], buds: [], gone: [] };

  for (let hi = 0; hi < habitats.length; hi++) {
    const h = habitats[hi];
    let armed = false;
    for (let i = 0; i < n; i++) {
      pops[i] = h.pops[species[i].id] ?? 0;
      eaten[i] = lost[i] = 0;
      if (pops[i] > 0 && bodies[i].hunts) armed = true;
    }
    // 4. Hunt, read on the generation's opening populations: what each hunter eats, what each prey loses.
    const prey = available[hi].find((slot) => slot.prey)?.prey; // the hunt slot's prey: these opening populations
    if (armed && prey) for (const take of hunted(h, world, undefined, prey)) {
      eaten[index.get(take.hunter)!] += take.grams;
      lost[index.get(take.prey)!] += take.grams;
      report.hunts.push({ habitat: h.id, hunter: take.hunter, prey: take.prey, grams: take.grams });
    }
    for (let i = 0; i < n; i++) {
      choices[i] = pops[i] > 0 ? choose(bodies[i], h, available[hi], 1 - lost[i] / pops[i])?.slot : undefined;
      if (choices[i]) held[hi].add(choices[i]!.id);
    }

    // 2. Each species eats in its best slot: pop × appetite × fitness's intake term (reach × food per tile), so a
    // grazed-down stock feeds less and the letter is the growth rate. Shortages are shared by pop × reach.
    for (const food of FOODS) {
      const per = density(h, food);
      let total = 0;
      const wants = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        if (!choices[i]?.foods.includes(food)) continue;
        wants[i] = pops[i] * SEA.appetite * reach(species[i].build, {}, food, h, bodies[i]) * per;
        total += wants[i];
      }
      const share = total > 0 ? Math.min(1, h.stocks[food] / total) : 0;
      for (let i = 0; i < n; i++) eaten[i] += wants[i] * share;
      h.stocks[food] = Math.max(0, h.stocks[food] - Math.min(h.stocks[food], total));
    }

    // 3. Breed and die, damp once, then the hunters' take comes off exactly; remove populations under two heads' mass.
    for (let i = 0; i < n; i++) {
      const pop = pops[i];
      if (pop <= 0) continue;
      const born = SEA.damping * (choices[i] ? eaten[i] * bodies[i].traits.brood / bodies[i].upkeep : 0);
      const next = pop + born - SEA.damping * pop * SEA.deaths - lost[i];
      const tally = { habitat: h.id, species: species[i].id, born, died: SEA.damping * pop * SEA.deaths };
      report.tallies.push(tally);
      if (next >= floors[i]) h.pops[species[i].id] = next;
      else { delete h.pops[species[i].id]; tally.died += Math.max(0, next); }
    }
  }

  // 1. Regrow toward yield × area, once per food and habitat.
  for (const h of habitats) for (const food of FOODS) h.stocks[food] += REGROW[food] * (ceiling(h, food) - h.stocks[food]);

  // 5. Spread where the newcomer would grow on the regrown stocks it finds. Cache only for this generation.
  // Survival 1: a newcomer is rare prey, and the commonest-prey rule leaves it almost untouched at first.
  const byId = new Map(habitats.map((h, i) => [h.id, i]));
  const allowed = new Int8Array(habitats.length * n); // 0 unknown, 1 grows there, −1 doesn't
  const nextPops = habitats.map((h) => ({ ...h.pops }));
  habitats.forEach((h, from) => {
    if (h.perimeter <= 0) return;
    for (let i = 0; i < n; i++) {
      const id = species[i].id, pop = h.pops[id] ?? 0;
      if (pop <= 0) continue;
      for (let border = 0; border < h.neighbours.length; border++) {
        const to = byId.get(h.neighbours[border]);
        if (to === undefined) continue;
        const moved = pop * SEA.spread * h.borders[border] / h.perimeter;
        if (moved < floors[i]) continue; // under two heads it would only die there
        const k = to * n + i;
        if (!allowed[k]) {
          const best = choose(bodies[i], habitats[to], available[to], 1);
          // A hunter arrives only where the prey above the refuge weighs `HUNT.from` (N4 fix C).
          allowed[k] = best && grows(best.value) && (!best.slot.prey || best.slot.capacity >= HUNT.from) ? 1 : -1;
        }
        if (allowed[k] < 0) continue;
        nextPops[from][id] -= moved;
        nextPops[to][id] = (nextPops[to][id] ?? 0) + moved;
        report.moves.push({ from: h.id, to: habitats[to].id, species: id, grams: moved });
      }
    }
  });
  habitats.forEach((h, i) => (h.pops = nextPops[i]));

  // 6. Bud: a slot with food that nobody chose may grow a wild branch. Then wild species living nowhere leave.
  report.buds = bud(world, available, held);
  report.gone = prune(world);
  world.generation++;
  return report;
}
