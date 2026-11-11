// One generation, in grams: choose a slot and eat → breed/die → regrow → simultaneous spread. Regrow runs after the
// eating so the stored stock is the standing food: what the next eaters find and what every letter reads.
// Every slot and prediction below is temporary. World holds only the records, never a role or tier.
import { FOODS, REGROW, SEA } from '../data/sea';
import { bodyMass, ceiling, density, reach, score, slots, stats } from './fitness';
import { makeGround } from './ground';
import { findHabitats, type Habitat } from './habitats';
import type { Build, Ranks, Slot, World } from './records';

export function makeWorld(seed: number): World {
  const habitats = findHabitats(makeGround(seed)).list;
  for (const h of habitats) for (const food of FOODS) h.stocks[food] = ceiling(h, food);
  return { seed, generation: 0, habitats, species: [], lineages: [] };
}

function best(build: Build, ranks: Ranks, h: Habitat, world: World, available = slots(h, world)) {
  let chosen: { slot: Slot; fit: ReturnType<typeof score> } | undefined;
  for (const slot of available) {
    if (slot.foods.every((food) => h.stocks[food] <= 0)) continue;
    const fit = score(build, ranks, slot, h); // fitness without its sentences
    if (!chosen || fit.value > chosen.fit.value) chosen = { slot, fit };
  }
  return chosen;
}

/** A newcomer grows where appetite × value beats deaths at today's food: it moves only there. */
const grows = (value: number) => SEA.appetite * value > SEA.deaths;

/** Mutates ecological state in place; geometry and the species/lineage records stay unchanged. */
export function step(world: World): void {
  const { habitats, species } = world;
  const lines = new Map(world.lineages.map((line) => [line.id, line.ranks]));
  const ranks: Ranks[] = species.map((s) => s.lineage === null ? {} : lines.get(s.lineage) ?? {});
  const brood = species.map((s, i) => stats(s.build, ranks[i]).brood);

  const available = habitats.map((h) => slots(h, world)); // slots read ceilings only, not stocks

  habitats.forEach((h, hi) => {
    const choices = species.map((s, i) => (h.pops[s.id] ?? 0) > 0 ? best(s.build, ranks[i], h, world, available[hi]) : undefined);
    const eaten = new Float64Array(species.length);

    // 2. Each species eats in its best slot: pop × appetite × fitness's intake term (reach × food per tile), so a
    // grazed-down stock feeds less and the letter is the growth rate. Shortages are shared by pop × reach.
    for (const food of FOODS) {
      const per = density(h, food);
      const wants = species.map((s, i) => choices[i]?.slot.foods.includes(food)
        ? h.pops[s.id] * SEA.appetite * reach(s.build, ranks[i], food, h) * per : 0);
      const total = wants.reduce((sum, want) => sum + want, 0);
      const share = total > 0 ? Math.min(1, h.stocks[food] / total) : 0;
      const consumed = Math.min(h.stocks[food], total);
      for (let i = 0; i < species.length; i++) eaten[i] += wants[i] * share;
      h.stocks[food] = Math.max(0, h.stocks[food] - consumed);
    }

    // 3. Breed and die, damp once, then remove populations under two heads' mass.
    species.forEach((s, i) => {
      const pop = h.pops[s.id] ?? 0;
      if (pop <= 0) return;
      const fit = choices[i]?.fit;
      const target = pop * (1 - SEA.deaths) + (fit ? eaten[i] * brood[i] / fit.upkeep * fit.survival : 0);
      const next = pop + SEA.damping * (target - pop);
      if (next < SEA.extinctionHeads * bodyMass(s.build)) delete h.pops[s.id];
      else h.pops[s.id] = next;
    });
  });

  // 1. Regrow toward yield × area, once per food and habitat.
  for (const h of habitats) for (const food of FOODS) h.stocks[food] += REGROW[food] * (ceiling(h, food) - h.stocks[food]);

  // 5. Spread where the newcomer would grow on the regrown stocks it finds. Cache only for this generation.
  const byId = new Map(habitats.map((h, i) => [h.id, i]));
  const predictions = habitats.map(() => new Map<number, boolean>());
  const nextPops = habitats.map((h) => ({ ...h.pops }));
  habitats.forEach((h, from) => {
    if (h.perimeter <= 0) return;
    species.forEach((s, i) => {
      const pop = h.pops[s.id] ?? 0;
      if (pop <= 0) return;
      h.neighbours.forEach((id, border) => {
        const to = byId.get(id);
        if (to === undefined) return;
        let allowed = predictions[to].get(i);
        if (allowed === undefined) {
          const prediction = best(s.build, ranks[i], habitats[to], world, available[to]);
          allowed = !!prediction && grows(prediction.fit.value);
          predictions[to].set(i, allowed);
        }
        if (!allowed) return;
        const moved = pop * SEA.spread * h.borders[border] / h.perimeter;
        if (moved < SEA.extinctionHeads * bodyMass(s.build)) return; // under two heads it would only die there
        nextPops[from][s.id] -= moved;
        nextPops[to][s.id] = (nextPops[to][s.id] ?? 0) + moved;
      });
    });
  });
  habitats.forEach((h, i) => (h.pops = nextPops[i]));
  world.generation++;
}
