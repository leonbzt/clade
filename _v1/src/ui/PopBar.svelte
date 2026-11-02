<script lang="ts">
  // One species' population as a single strip, like a chromosome: its shown variants as segments sized by tiles,
  // in their Variants-view colours, biggest first; unshown mutants as a grey rest. Hover a segment to light up
  // that variant's tiles on the map.
  import { TIERS } from '../data/genes';
  import { poolOf, variantName } from '../sim/variants';
  import { variantColors } from '../view/overlays';
  import { game, ui } from './game.svelte';

  let { sp }: { sp: number } = $props();

  const bar = $derived.by(() => {
    ui.v;
    const pool = poolOf(game, sp), colors = variantColors(game, sp), total = game.count[sp] || 1;
    const segs = pool.filter((v) => game.variants[v].shown).map((v) => {
      const x = game.variants[v];
      return { v, pct: (100 * x.tiles) / total, color: colors.get(v)!, tier: TIERS[x.tier], title: `${variantName(game, v)} · ${TIERS[x.tier].name} · ${x.tiles} tiles` };
    });
    const rest = pool.filter((v) => !game.variants[v].shown).reduce((a, v) => a + game.variants[v].tiles, 0);
    return { segs, rest: (100 * rest) / total };
  });
</script>

<div class="bar" role="presentation" onmouseleave={() => (ui.hoverVariant = -1)}>
  {#each bar.segs as g (g.v)}
    <span class="seg" class:hot={ui.hoverVariant === g.v} style:width="{g.pct}%" style:background={g.color}
      style:border-top-color={g.tier.color} title={g.title} role="presentation"
      onmouseenter={() => (ui.hoverVariant = g.v)}></span>
  {/each}
  {#if bar.rest > 0}<span class="seg rest" style:width="{bar.rest}%" title="new mutants, not shown yet"></span>{/if}
</div>

<style>
  .bar { display: flex; height: 10px; border: 1px solid var(--ink); border-radius: 5px; overflow: hidden; background: var(--ink); }
  .seg { height: 100%; min-width: 2px; border-right: 1px solid var(--ink); border-top: 2px solid transparent; box-sizing: border-box; }
  .seg.hot { filter: brightness(1.35); }
  .rest { background: var(--panel-light); opacity: 0.5; border-top: none; }
</style>
