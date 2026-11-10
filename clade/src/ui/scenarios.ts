// Dev controls, outside the sim: interpret preset data and keep the graph through every skipped generation.
import { DEV_SPECIES } from '../data/builds';
import { PRESETS } from '../data/presets';
import { bodyMass } from '../sim/fitness';
import type { World } from '../sim/records';
import { step } from '../sim/sea';
import { bestFit } from '../view/tiers';
import { remember, type Frame } from './history';
import { place } from './placement';

export function skip(world: World, history: Frame[], generations: number): Frame[] {
  for (let i = 0; i < generations; i++) {
    step(world);
    history = remember(history, world);
  }
  return history;
}

/** Apply to a fresh world. Prefer the strongest shared fit, within the requested ground kind. Ties keep map order. */
export function applyPreset(world: World, id: string): Frame[] {
  const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0];
  const used = new Set<number>();
  for (const group of preset.groups) {
    const species = group.species.map((id) => DEV_SPECIES.find((s) => s.id === id)!);
    const unused = world.habitats.filter((h) => !used.has(h.id));
    const matching = unused.filter((h) => (!group.depth || h.kind.depth === group.depth) && (!group.substrate || h.kind.substrate === group.substrate));
    const candidates = matching.length ? matching : unused;
    const ranked = candidates.map((h) => ({ h, value: Math.min(...species.map((s) =>
      bestFit(s.build, s.lineage === 'worm-line' ? preset.ranks : {}, h, world)?.fit.value ?? 0)) }));
    const chosen = ranked.reduce<(typeof ranked)[number] | undefined>((best, p) => !best || p.value > best.value ? p : best, undefined);
    if (!chosen) continue;
    used.add(chosen.h.id);
    for (const s of species) {
      place(world, chosen.h.id, s);
      chosen.h.pops[s.id] = group.heads * bodyMass(s.build);
    }
  }
  const worms = world.lineages.find((l) => l.id === 'worm-line');
  if (worms) worms.ranks = { ...preset.ranks };
  return skip(world, remember([], world), preset.generations);
}
