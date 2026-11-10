import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// `npm run check` tests the new game in clade/; `npm run check:game` (CHECK=game) the frozen one in game/.
// The plant game (src/, tests/) is the archive.
const tests = process.env.CHECK === 'game' ? 'game/tests/**/*.test.ts' : 'clade/tests/**/*.test.ts';

export default defineConfig({
  plugins: [svelte()],
  test: { include: [tests], passWithNoTests: true },
});
