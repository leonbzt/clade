<!-- One build in one slot. Fitness supplies every letter and sentence. -->
<script lang="ts">
  import { css } from '../data/palette';
  import { fitness } from '../sim/fitness';
  import type { Habitat } from '../sim/habitats';
  import type { Build, Ranks, Slot, World } from '../sim/records';

  let { build, ranks, slot, hab, world, name }: {
    build: Build; ranks: Ranks; slot: Slot; hab: Habitat; world: World; name: string;
  } = $props();
  const fit = $derived(fitness(build, ranks, slot, hab, world));
</script>

<article class="tier" style:--accent={css(slot.accent)}>
  <strong class="letter" aria-label={`${name}: ${fit.letter} in ${slot.name}`}>{fit.letter}</strong>
  <div>
    <strong>{name}</strong>
    {#each fit.reasons as reason}<p>{reason}</p>{/each}
  </div>
</article>

<style>
  .tier { display: flex; gap: 8px; border-left: 2px solid var(--accent); padding: 4px 0 4px 8px; }
  .letter { color: var(--accent); font-size: 32px; line-height: 1; min-width: 24px; }
  p { margin: 2px 0 0; }
</style>
