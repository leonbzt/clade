import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    include: ['tests/**/*.test.ts', 'spikes/pixi-life/tests/**/*.test.ts'],
    passWithNoTests: true,
  },
});
