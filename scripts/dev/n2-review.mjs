// Bounded, deterministic N2 review: three normal Lives and nine Enforce-order comparisons.
// Run from the repository root: node scripts/dev/n2-review.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, logLevel: 'silent' });
try {
  const { makeWorld } = await server.ssrLoadModule('/clade/src/sim/sea.ts');
  const { applyPreset } = await server.ssrLoadModule('/clade/src/ui/scenarios.ts');
  const { DEV_SPECIES } = await server.ssrLoadModule('/clade/src/data/builds.ts');
  const { launch, finish } = await server.ssrLoadModule('/clade/src/ui/life/colonise.ts');
  const { rehearse } = await server.ssrLoadModule('/scripts/dev/n2-play.ts');
  const world = makeWorld(3); applyPreset(world, 'first-worm');
  const habitats = [['flat', 'mud'], ['shallows', 'mud'], ['slope', 'sand']]
    .map(([depth, substrate]) => world.habitats.find((h) => h.kind.depth === depth && h.kind.substrate === substrate));
  const plays = habitats.map((h, i) => {
    const species = DEV_SPECIES.find((s) => s.id === (i === 0 ? 'grazer-worm' : 'digger-worm'));
    const session = launch(world, h.id, species, i + 1);
    const order = i === 0 ? ['tentacles', 'pouch', 'sclerite'] : ['bulb', 'pouch', 'eye'];
    const result = rehearse(session.life, order), report = finish(world, session);
    return { habitat: h.name, species: species.name, ...result, report, grams: h.pops[species.id] };
  });
  const comparisons = [];
  const fresh = makeWorld(3); applyPreset(fresh, 'first-worm');
  const digger = DEV_SPECIES.find((s) => s.id === 'digger-worm');
  for (const [i, h] of habitats.entries()) for (const order of [['bulb', 'pouch', 'eye'], ['pouch', 'bulb', 'eye'], ['eye', 'bulb', 'pouch']]) {
    const r = rehearse(launch(fresh, h.id, digger, i + 1).life, order);
    comparisons.push({ habitat: h.name, order, eggs: r.eggs, health: r.health, cause: r.cause, enforced: r.enforced });
  }
  const report = { seed: world.seed, generation: world.generation, plays, comparisons };
  mkdirSync('docs/playtests/n2-sheet', { recursive: true });
  writeFileSync('docs/playtests/n2-sheet/play-results.json', JSON.stringify(report, null, 2) + '\n');
  console.log(plays.map((p) => `${p.habitat}: ${p.eggs} eggs → ${p.report.heads} heads · ${p.cause}`).join('\n'));
  console.log(`${comparisons.length} Enforce comparisons recorded; sea generation ${world.generation}.`);
} finally { await server.close(); }
