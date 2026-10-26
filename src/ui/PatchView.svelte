<script lang="ts">
  import { store } from './game.svelte';
  import { hexCorners, hexToPixel } from '../core/hex';
  import { NUMBERS } from '../data/numbers';
  import { PALETTE as P, VIEW } from '../data/view';
  import { mix } from './color';
  import type { Tile } from '../core/types';
  import Steam from './Steam.svelte';

  const s = $derived(store.s);
  const c = $derived(s.colony!);
  const size = VIEW.patchHexSize;
  const extent = size * 2 * (NUMBERS.patch.radius + 1);
  const w = $derived(c.weather);
  const stressShare = $derived(w.stress / NUMBERS.drySpell.peakStress);

  function fill(t: Tile): string {
    if (!t.covered) return mix(P.lava, P.lavaDamp, t.dampness);
    if (t.brown) return P.brown;
    const green = mix(P.colony, P.colonyDamp, t.dampness);
    return t.recovery < 1 ? mix(P.recovering, green, t.recovery) : green;
  }
</script>

<div class="wrap" class:warning={w.state === 'warning'}>
  <svg viewBox="{-extent} {-extent * 0.88} {extent * 2} {extent * 1.76}" class="patch">
    <rect x={-extent * 2} y={-extent * 2} width={extent * 4} height={extent * 4} fill={P.lava} />
    {#each c.tiles as t (t.q + ',' + t.r)}
      {@const p = hexToPixel(t, size)}
      <polygon points={hexCorners(p.x, p.y, size - 1)} fill={fill(t)} stroke={P.lavaEdge} stroke-width="1" class="tile" />
    {/each}
    <Steam x={0} y={0} scale={1.4} />
    {#if w.state === 'dry'}
      <rect x={-extent * 2} y={-extent * 2} width={extent * 4} height={extent * 4} fill={P.dry} opacity={0.18 * stressShare} />
    {/if}
    {#if w.state === 'rain'}
      <rect x={-extent * 2} y={-extent * 2} width={extent * 4} height={extent * 4} fill={P.rain} opacity="0.15" />
      {#each Array(40) as _, i (i)}
        <line class="drop" x1={((i * 97) % (extent * 2)) - extent} y1={-extent} x2={((i * 97) % (extent * 2)) - extent - 6} y2={-extent + 14} stroke={P.rain} stroke-width="1.5" style="animation-delay: {(i % 10) * -0.08}s" />
      {/each}
    {/if}
  </svg>
</div>

<style>
  .wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1c1b1c;
    transition: box-shadow 0.3s;
  }
  .wrap.warning {
    box-shadow: inset 0 0 60px rgba(217, 164, 65, 0.45);
  }
  .patch {
    width: 100%;
    height: 100%;
    animation: zoom 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .tile {
    transition: fill 0.5s;
  }
  .drop {
    animation: fall 0.5s linear infinite;
  }
  @keyframes fall {
    to {
      transform: translate(-20px, 360px);
    }
  }
  @keyframes zoom {
    from {
      transform: scale(0.15);
      opacity: 0;
    }
  }
</style>
