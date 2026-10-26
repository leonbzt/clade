<script lang="ts">
  import type { TraitId } from '../data/traits';
  import { drawSpecimen } from './specimen';

  let { traits }: { traits: TraitId[] } = $props();
  const shapes = $derived(drawSpecimen(traits));
  const key = $derived(traits.join(','));
</script>

{#key key}
  <svg viewBox="0 0 120 112" class="specimen" aria-label="type specimen">
    {#each shapes as sh, i (i)}
      {#if sh.kind === 'path'}
        <path d={sh.d} stroke={sh.stroke} stroke-width={sh.width} fill={sh.fill ?? 'none'} stroke-linecap="round" stroke-linejoin="round" />
      {:else}
        <ellipse cx={sh.cx} cy={sh.cy} rx={sh.rx} ry={sh.ry} fill={sh.fill} transform="rotate({sh.rot} {sh.cx} {sh.cy})" />
      {/if}
    {/each}
  </svg>
{/key}

<style>
  .specimen {
    width: 100%;
    height: 100%;
    animation: redraw 0.9s ease-out;
  }
  @keyframes redraw {
    from {
      opacity: 0.2;
      transform: scale(0.94);
      filter: brightness(1.8);
    }
  }
</style>
