// Typecheck + tests. Prints only failures (and one line when everything passes).
import { spawnSync } from 'node:child_process';

const steps = [
  ['typecheck', 'npx', ['svelte-check', '--tsconfig', './tsconfig.json', '--threshold', 'warning', '--output', 'human']],
  ['tests', 'npx', ['vitest', 'run', '--reporter=dot']],
];

let failed = false;
for (const [name, cmd, args] of steps) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    failed = true;
    console.log(`✗ ${name}\n${r.stdout}${r.stderr}`);
  }
}
if (failed) process.exit(1);
console.log('✓ check passed');
