// Typecheck + tests, run in parallel. Prints only failures (and one line when everything passes).
import { spawn } from 'node:child_process';

const steps = [
  ['typecheck', 'npx', ['svelte-check', '--tsconfig', './tsconfig.json', '--threshold', 'warning', '--output', 'human']],
  ['tests', 'npx', ['vitest', 'run', '--reporter=dot']],
];

const run = ([name, cmd, args]) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args);
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('close', (code) => resolve(code === 0 ? null : `✗ ${name}\n${out}`));
  });

const failures = (await Promise.all(steps.map(run))).filter(Boolean);
if (failures.length) {
  console.log(failures.join('\n'));
  process.exit(1);
}
console.log('✓ check passed');
