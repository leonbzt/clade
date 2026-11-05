import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    include: ['game/tests/**/*.test.ts'], // the plant game (src/, tests/) is the archive
    passWithNoTests: true,
  },
});
