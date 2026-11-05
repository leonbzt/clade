// Builds the spike on its own: `npx vite build spikes/pixi-life`, then `node spikes/pixi-life/inline.mjs` makes one
// self-contained page (dist/clade-mud-flats.html) for the phone link.
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 100_000, // the two font files go inline
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
