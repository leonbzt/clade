// Dev only: the garden's pace after the first release (area, biomass, sprouts over 8 h). `npx tsx scripts/dev/pace.ts`
import { gameStep, newGame, release, startRun } from '../../src/sim/game';
import { yourArea } from '../../src/sim/save';
const raw = (process.argv[2] ?? '4,60,40,0.9,1.2,1.4').split(',').map(Number);
const g = newGame(7);
startRun(g, g.sprouts[0].id, g.sprouts[0].patch);
const sp = release(g, raw, g.species[g.founder].genes, 'Test');
console.log('score', sp.scores.filter((s) => s >= 0).join(' '));
let t = 0;
for (const at of [600, 1800, 3600, 3 * 3600, 8 * 3600]) {
  while (t < at) { gameStep(g); t++; }
  console.log(`${(at / 3600).toFixed(1)} h: area ${yourArea(g).toFixed(1)} tiles, held ${(g.yours / 1000).toFixed(1)} kg, biomass ${(g.biomass / 1000).toFixed(0)} k, sprouts made ${g.nextSprout - 1}`);
}
