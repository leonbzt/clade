<script lang="ts">
  import { NUM } from '../data/numbers';
  import { TIER_COLORS } from '../data/palette';
  import { SPECIES, SPECIES_INDEX } from '../data/species';
  import { foundingCost, unlockedSpecies } from '../sim/commands';
  import { TERRAIN_NAMES, SEA } from '../sim/state';
  import { allStats, fit, moistureAt, tierOf } from '../sim/stats';
  import { GardenRenderer } from '../view/render';
  import { doFound, game, ui } from './game.svelte';

  let canvas: HTMLCanvasElement;
  let wrap: HTMLElement;
  let renderer: GardenRenderer | null = null;

  $effect(() => {
    ui.gen;
    renderer = new GardenRenderer(game, canvas);
    fitToSpace();
  });

  $effect(() => {
    let raf = 0;
    const loop = (t: number) => {
      renderer?.draw({ placing: ui.placing, hover: ui.hover, overlay: ui.overlay, time: t });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(fitToSpace);
    ro.observe(wrap);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  });

  /** Scale the pixel canvas up: whole-number steps when there's room, so pixels stay crisp. */
  function fitToSpace() {
    if (!canvas || !wrap) return;
    const byW = wrap.clientWidth / canvas.width, byH = (window.innerHeight - 150) / canvas.height;
    const s = Math.max(1, Math.min(byW, byH));
    const scale = s >= 2 ? Math.floor(s) : s;
    canvas.style.width = `${Math.floor(canvas.width * scale)}px`;
  }

  function tileAt(e: PointerEvent | MouseEvent): number {
    const r = canvas.getBoundingClientRect(), T = NUM.map.tile;
    const x = Math.floor(((e.clientX - r.left) / r.width) * canvas.width / T);
    const y = Math.floor(((e.clientY - r.top) / r.height) * canvas.height / T);
    return x >= 0 && y >= 0 && x < game.w && y < game.h ? y * game.w + x : -1;
  }

  function click(e: MouseEvent) {
    const i = tileAt(e);
    if (i < 0) return;
    if (ui.placing) { doFound(i); return; }
    const sp = game.occ[i];
    if (sp >= 0) { ui.focus = SPECIES[sp].id; ui.tab = 'species'; }
  }

  const readout = $derived.by(() => {
    ui.v;
    const i = ui.hover;
    if (i < 0 || game.terrain[i] === SEA) return null;
    const st = allStats(game), occ = game.occ[i];
    const fits = unlockedSpecies(game).map((id) => {
      const sp = SPECIES_INDEX[id];
      return { name: SPECIES[sp].name, tier: tierOf(fit(game, st[sp], sp, i)) };
    });
    return {
      terrain: TERRAIN_NAMES[game.terrain[i]],
      moisture: moistureAt(game, i).toFixed(2),
      soil: game.soil[i].toFixed(1),
      occupant: occ >= 0 ? `${SPECIES[occ].name} (${Math.round(game.growth[i] * 100)}%)` : 'bare',
      fits,
    };
  });

  const placingInfo = $derived.by(() => {
    ui.v;
    if (!ui.placing) return null;
    const cost = foundingCost(game, ui.placing);
    return { name: SPECIES[SPECIES_INDEX[ui.placing]].name, cost };
  });
</script>

<section class="map" bind:this={wrap}>
  <canvas
    bind:this={canvas}
    class:placing={!!ui.placing}
    onpointermove={(e) => (ui.hover = tileAt(e))}
    onpointerleave={() => (ui.hover = -1)}
    onclick={click}
    oncontextmenu={(e) => { e.preventDefault(); ui.placing = null; }}
  ></canvas>

  <div class="panel readout">
    {#if placingInfo}
      <span class="gold">Founding {placingInfo.name}</span>
      <span>{placingInfo.cost ? `${placingInfo.cost} biomass` : 'free'}</span>
      <span class="legend">
        {#each Object.entries(TIER_COLORS) as [t, c] (t)}<span class="tier" style:background={c}>{t}</span>{/each}
        <span class="dim">fit · faded = held by a stronger species · dark = can't live · Esc cancels</span>
      </span>
    {:else if readout}
      <span>{readout.terrain}</span>
      <span class="dim">moisture {readout.moisture} · soil {readout.soil}</span>
      <span>{readout.occupant}</span>
      {#each readout.fits as f (f.name)}
        <span class="dim">{f.name} {#if f.tier}<span class="tier" style:background={TIER_COLORS[f.tier]}>{f.tier}</span>{:else}–{/if}</span>
      {/each}
    {:else}
      <span class="dim">Hover the island to inspect a tile. Click a plant to see its species.</span>
    {/if}
    <button class="soil" class:on={ui.overlay === 'soil'} onclick={() => (ui.overlay = ui.overlay === 'soil' ? 'none' : 'soil')}>Soil view</button>
  </div>
</section>

<style>
  .map { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; align-items: center; }
  canvas { image-rendering: pixelated; display: block; border: 3px solid var(--ink); box-shadow: 0 0 0 2px var(--edge); }
  canvas.placing { cursor: crosshair; }
  .readout { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; width: 100%; min-height: 44px; padding: 6px 10px; font-size: 16px; }
  .legend { display: flex; gap: 4px; align-items: center; }
  .soil { margin-left: auto; }
</style>
