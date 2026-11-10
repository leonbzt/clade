// Habitat names (proposal): exposure + substrate + depth word, "Lee mud flats" (no exposure on the slope and deeps). The habitat nearest a vent or at a
// stream's mouth takes that word instead of the exposure; twins take a compass word. Same seed, same names.
import { DEPTHS, GROUND, WORDS } from '../data/ground';
import { F_STREAM, SEA } from '../data/island';
import type { Ground } from './ground';
import type { Habitat } from './habitats';

export function nameHabitats(g: Ground, list: Habitat[], of: Int32Array) {
  const { w, h } = g, feature = new Map<number, string>();
  // The habitat tile nearest each vent.
  for (const v of g.island.vents) {
    const vx = (v % g.island.w) + g.ox, vy = ((v / g.island.w) | 0) + g.oy;
    let best = -1, bd = Infinity;
    for (let i = 0; i < w * h; i++) {
      if (of[i] < 0) continue;
      const d = (i % w - vx) ** 2 + (((i / w) | 0) - vy) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    if (best >= 0) feature.set(of[best], WORDS.vent);
  }
  // Stream tiles on the coast: the habitats next to them.
  for (let i = 0; i < w * h; i++) {
    if (g.feature[i] !== F_STREAM) continue;
    const x = i % w, y = (i / w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const j = (y + dy) * w + x + dx;
      if (g.land[j] === SEA && of[j] >= 0 && !feature.has(of[j])) feature.set(of[j], WORDS.stream);
    }
  }
  for (const hab of list) {
    const k = hab.kind;
    const waves = DEPTHS.indexOf(k.depth) < GROUND.exposureBands; // exposure means nothing below the waves' reach
    const name = [feature.get(hab.id) ?? (waves ? WORDS.exposure[k.exposure] : ''), WORDS.substrate[k.substrate], WORDS.depth[k.depth]];
    hab.name = name.filter(Boolean).join(' ').replace(/^./, (c) => c.toUpperCase());
  }
  // Twins: a compass word from the island's centre, then a number if they still clash.
  const groups = new Map<string, Habitat[]>();
  for (const hab of list) groups.set(hab.name, [...(groups.get(hab.name) ?? []), hab]);
  for (const twins of groups.values()) {
    if (twins.length < 2) continue;
    for (const hab of twins) {
      const a = Math.atan2(hab.centre.y - h / 2, hab.centre.x - w / 2), k = Math.round((a / (Math.PI * 2)) * 8 + 8) % 8;
      hab.name = `${WORDS.compass[k]} ${hab.name[0].toLowerCase()}${hab.name.slice(1)}`;
    }
  }
  const seen = new Map<string, number>();
  for (const hab of list) {
    const c = (seen.get(hab.name) ?? 0) + 1;
    seen.set(hab.name, c);
    if (c > 1) hab.name += ` ${c}`;
  }
}
