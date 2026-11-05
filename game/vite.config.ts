// The game's build: `npm run build:game` (vite build game, then game/inline.mjs) makes one self-contained page,
// game/dist/clade.html, for itch and the phone link.
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 100_000, // the two font files go inline
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
