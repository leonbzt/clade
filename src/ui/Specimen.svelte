<script lang="ts">
  import type { VariantLook } from '../view/look';
  import { specimen } from '../view/plants';

  let { look, scale = 3, size = 48 }: { look: VariantLook; scale?: number; size?: number } = $props();
  let canvas: HTMLCanvasElement;

  $effect(() => {
    const img = specimen(look.species, look.traits, size, look.tint);
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0);
  });
</script>

<canvas bind:this={canvas} style:width="{size * scale}px" style:height="{size * scale}px"></canvas>

<style>
  canvas { image-rendering: pixelated; display: block; background: var(--panel-dark); border: 2px solid var(--ink); }
</style>
