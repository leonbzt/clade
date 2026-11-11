// Typecheck + tests, run in parallel. Prints only failures (and one line when everything passes).
//   node scripts/check.mjs          the new game, clade/
//   node scripts/check.mjs game     the frozen game, game/
import { spawn } from 'node:child_process';

const game = process.argv[2] === 'game';
const tsconfig = game ? './tsconfig.game.json' : './tsconfig.json';
const env = { ...process.env, CHECK: game ? 'game' : 'clade' };
const steps = [
  ['typecheck', 'npx', ['svelte-check', '--tsconfig', tsconfig, '--threshold', 'warning', '--output', 'human']],
  // One reused worker avoids competing timed laws and repeated process/module startup.
  ['tests', 'npx', ['vitest', 'run', '--maxWorkers=1', '--no-isolate', '--reporter=dot']],
];

const run = ([name, cmd, args]) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args, { env });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('close', (code, signal) => resolve(code === 0 ? null : `✗ ${name} (${signal ?? `exit ${code}`})\n${out}`));
  });

const t0 = Date.now();
const failures = (await Promise.all(steps.map(run))).filter(Boolean);
if (failures.length) {
  console.log(failures.join('\n'));
  process.exit(1);
}
console.log(`✓ check passed (${game ? 'game' : 'clade'}, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
