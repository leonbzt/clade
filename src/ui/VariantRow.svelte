<script lang="ts">
  // One shown variant under its species: tier colour, name, tiles, gene pips (4 axes, then trait genes), a combo
  // badge, and "Found as new species" when it's Rare or better. Founding asks for a name, then a spot on the map.
  // One already founded as a species is a single faint line pointing to it. Hovering lights its tiles up.
  import { AXES, COMBOS, GENES, TIERS } from '../data/genes';
  import { canFoundSpecies, foundedAs, speciesCost, suggestName } from '../sim/commands';
  import { variantColors } from '../view/overlays';
  import { defOf, geneText, variantName } from '../sim/variants';
  import { fmt } from './format';
  import { game, startFounding, ui } from './game.svelte';

  let { v, fresh }: { v: number; fresh: boolean } = $props();
  let naming = $state<string | null>(null);

  const row = $derived.by(() => {
    ui.v;
    const x = game.variants[v];
    if (!x?.alive) return null;
    const base = game.species[x.sp].genome, def = defOf(game, x.sp);
    const can = canFoundSpecies(game, v);
    return {
      tier: TIERS[x.tier], color: variantColors(game, x.sp).get(v), name: variantName(game, v), tiles: x.tiles, genes: geneText(game, v),
      axes: AXES.map((a, k) => ({ id: a.id, d: x.genome.axes[k] - base.axes[k], word: a.name })),
      traits: def.traits.map((t) => ({ id: t.id, name: t.name, on: x.genome.traits.includes(t.id) })),
      combo: COMBOS.find((c) => c.id === x.combo) ?? null,
      foundedAs: foundedAs(game, v), canFound: can.ok, why: can.ok ? '' : can.reason, rareEnough: x.tier >= GENES.foundFrom, cost: speciesCost(game),
    };
  });

  function pick() {
    if (naming === null) return;
    startFounding(v, naming);
    naming = null;
  }
</script>

{#if row?.foundedAs}
<button class="founded" onmouseenter={() => (ui.hoverVariant = v)}
  onclick={() => (ui.focus = game.species.find((o) => o.name === row.foundedAs)!.id)}>
  <span class="dot" style:background={row.color}></span>{row.name} · {row.tiles} tiles → {#if row.foundedAs === row.name}now its own species{:else}founded as <b>{row.foundedAs}</b>{/if}
</button>
{:else if row}
<div class="variant" title={row.genes} role="presentation" onmouseenter={() => (ui.hoverVariant = v)}>
  <span class="dot" style:background={row.color} style:outline="2px solid {row.tier.color}"></span>
  <span class="name"><b style:color={row.tier.color}>{row.name}</b>{#if fresh}<span class="new"> ✦ new</span>{/if}
    <span class="dim small">{row.tier.name} · {row.tiles} tiles</span></span>
  <span class="pips">
    {#each row.axes as a (a.id)}
      <span class="axis" title="{a.word} {a.d > 0 ? '+' : ''}{a.d}">
        {#each [-2, -1, 0, 1, 2] as k (k)}<i class:mid={k === 0} class:on={k !== 0 && (a.d > 0 ? k > 0 && k <= a.d : k < 0 && k >= a.d)}
          class:far={Math.abs(k) === 2 && Math.abs(a.d) > 2 && Math.sign(k) === Math.sign(a.d)}></i>{/each}
      </span>
    {/each}
    {#each row.traits as t (t.id)}<span class="gene" class:on={t.on} title={t.name}>{t.name[0]}</span>{/each}
  </span>
  {#if row.combo}<span class="combo" title={row.combo.text}>{row.combo.name}</span>{/if}
</div>
{#if row.rareEnough}
  {#if naming !== null}
    <div class="naming">
      <input bind:value={naming} maxlength="32" onkeydown={(e) => e.key === 'Enter' && pick()} />
      <button onclick={pick} disabled={!naming.trim()}>Pick a spot</button>
      <button onclick={() => (naming = null)}>×</button>
    </div>
  {:else}
    <button class="found" disabled={!row.canFound} title={row.why} onclick={() => (naming = suggestName(game, v))}>
      Found as new species · {fmt(row.cost)}
    </button>
  {/if}
{/if}
{/if}

<style>
  .variant { display: flex; gap: 6px; align-items: center; padding: 2px 4px 2px 16px; font-size: 15px; }
  .dot { display: inline-block; width: 8px; height: 8px; flex: none; border: 1px solid var(--ink); }
  .founded .dot { margin-right: 6px; }
  .name { flex: 1; display: flex; flex-direction: column; line-height: 1.1; }
  .new { color: var(--gold); font-size: 13px; }
  .pips { display: flex; gap: 3px; align-items: center; }
  .axis { display: flex; gap: 1px; }
  .axis i { width: 3px; height: 7px; background: var(--panel-light); }
  .axis i.mid { background: var(--edge); width: 1px; }
  .axis i.on { background: var(--good); }
  .axis i.far { background: var(--gold); }
  .gene { font-size: 11px; width: 11px; height: 11px; line-height: 11px; text-align: center; color: var(--ink); background: var(--panel-light); }
  .gene.on { background: var(--gold); }
  .combo { font-size: 12px; padding: 0 3px; background: var(--gold); color: var(--ink); }
  .founded { display: block; width: calc(100% - 16px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 2px 16px; font-size: 13px; color: var(--dim); opacity: 0.8;
    background: none; border: none; padding: 1px 4px; text-align: left; cursor: pointer; }
  .found { margin: 0 0 4px 30px; font-size: 14px; }
  .naming { display: flex; gap: 4px; margin: 0 0 4px 30px; }
  .naming input { flex: 1; min-width: 0; font: inherit; font-size: 14px; background: var(--ink); color: var(--text); border: 2px solid var(--edge); padding: 1px 4px; }
  .small { font-size: 13px; }
</style>
