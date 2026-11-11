<!-- Slice 21B: a creature drawn large on the 20B stage, with anything laid over it (the slots). The screens after a
     Life and the line's close-up use it; Equip and LifeBody still own their stages. -->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import type { PlaceId } from '../data/body';
  import type { Build } from '../sim/body';
  import { makeEquipStage, type EquipStage } from '../view/equip-stage';
  import { feel } from './feel';

  let { build, mark = null, legal = [], height = 320, compact = false, children }: {
    build: Build; mark?: PlaceId | null; legal?: PlaceId[]; height?: number; compact?: boolean; children?: Snippet;
  } = $props();
  let host: HTMLDivElement | undefined = $state();
  let stage = $state.raw<EquipStage | null>(null);

  $effect(() => {
    if (!host) return;
    let alive = true, made: EquipStage | null = null;
    makeEquipStage(host, untrack(() => $state.snapshot(build) as Build), feel.pixel, compact).then((s) => { if (alive) { made = s; stage = s; } else s.destroy(); });
    return () => { alive = false; made?.destroy(); stage = null; };
  });
  $effect(() => { stage?.setBuild($state.snapshot(build) as Build); });
  $effect(() => { stage?.mark(mark, legal); });
</script>

<div class="creature">
  <div class="box" class:compact bind:this={host} style:height="{height}px"></div>
  {@render children?.()}
</div>

<style>
  .creature { position: relative; min-width: 0; }
  .box { position: relative; min-height: 200px; background: #0b2730; border: 3px solid var(--ink); overflow: hidden; }
  .box.compact { min-height: 0; }
  .box :global(canvas) { position: absolute; inset: 0; }
</style>
