<!-- A zoom window for the sea map: + / − buttons, native scrolling (touch), drag to pan (mouse). With a `focus`
     (placing, the replay) it zooms in on those patches by itself and zooms back out when the focus ends. -->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import type { Sea } from '../sim/sea';

  let { sea, focus = [], children }: { sea: Sea; focus?: number[]; children: Snippet } = $props();
  const MAX = 3;
  let box: HTMLDivElement | undefined = $state();
  let zoom = $state(1), auto = false;
  let drag: { x: number; y: number; l: number; t: number } | null = null, moved = false;

  function scrollTo(fx: number, fy: number) {
    requestAnimationFrame(() => {
      if (!box) return;
      box.scrollLeft = fx * box.scrollWidth - box.clientWidth / 2;
      box.scrollTop = fy * box.scrollHeight - box.clientHeight / 2;
    });
  }
  /** The middle of the patches' tiles, as fractions of the map. */
  function centreOf(ids: number[]): [number, number] {
    const { w, h } = sea.isl;
    let x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (const id of ids) for (const t of sea.patches[id]?.tiles ?? []) {
      const x = t % w, y = (t / w) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); y0 = Math.min(y0, y); y1 = Math.max(y1, y + 1);
    }
    return x1 > x0 ? [(x0 + x1) / 2 / w, (y0 + y1) / 2 / h] : [0.5, 0.5];
  }
  function setZoom(z: number) {
    if (!box) return;
    const fx = (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth, fy = (box.scrollTop + box.clientHeight / 2) / box.scrollHeight;
    zoom = z; auto = false;
    scrollTo(fx, fy);
  }

  const key = $derived(focus.join(','));
  $effect(() => {
    const ids = key ? key.split(',').map(Number) : [];
    untrack(() => { // only a new focus moves the view; the buttons stay free while it lasts
      if (!ids.length) { if (auto) { zoom = 1; auto = false; } return; }
      if (zoom < 2) { zoom = 2; auto = true; }
      scrollTo(...centreOf(ids));
    });
  });

  function down(e: PointerEvent) {
    if (!box || e.pointerType !== 'mouse' || e.button !== 0 || zoom === 1) return;
    drag = { x: e.clientX, y: e.clientY, l: box.scrollLeft, t: box.scrollTop }; moved = false;
  }
  function move(e: PointerEvent) {
    if (!drag || !box) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    box.scrollLeft = drag.l - dx; box.scrollTop = drag.t - dy;
  }
  /** A drag that panned is not a tap on a patch. */
  function click(e: MouseEvent) { if (moved) { e.stopPropagation(); moved = false; } }
</script>

<div class="mapFrame">
  <div class="isleBox" role="group" aria-label="Sea map" class:zoomed={zoom > 1} style:--zoom={zoom} bind:this={box}
    onpointerdown={down} onpointermove={move} onpointerup={() => (drag = null)} onpointerleave={() => (drag = null)} onclickcapture={click}>
    {@render children()}
  </div>
  <div class="zoomButtons">
    <button class="small" aria-label="Zoom in" disabled={zoom >= MAX} onclick={() => setZoom(zoom + 1)}>+</button>
    <button class="small" aria-label="Zoom out" disabled={zoom <= 1} onclick={() => setZoom(zoom - 1)}>−</button>
  </div>
</div>

<style>
  .mapFrame { position: relative; flex-shrink: 0; border: 3px solid var(--ink); outline: 2px solid var(--brass); outline-offset: -1px; }
  .isleBox { overflow: hidden; }
  .isleBox.zoomed { overflow: auto; aspect-ratio: 4 / 3; max-height: 62vh; overscroll-behavior: contain; }
  .isleBox.zoomed :global(canvas) { cursor: grab; }
  .isleBox :global(canvas) { display: block; width: calc(var(--zoom) * 100%); }
  .zoomButtons { position: absolute; top: 4px; right: 4px; display: flex; flex-direction: column; gap: 4px; }
  .zoomButtons button { min-width: 34px; padding: 0; font-size: 20px; line-height: 1; }
</style>
