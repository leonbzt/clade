<!-- N3 I: the tree of life, from the map bar. A faded trunk down to the first cell with old life as faded side
     branches; the worm lit with its level; the clades above as silhouettes with their gate as a hint. Tap a lit
     node: its line view. Nodes are shapes and names; creature art is L1. -->
<script lang="ts">
  import type { World } from '../sim/records';
  import { TREE, oldLife, treeOf } from '../view/tree';

  let { world, open, back }: { world: World; open: (lineage: string) => void; back: () => void } = $props();
  const nodes = $derived(treeOf(world));
  const old = oldLife();
</script>

<div class="shade">
  <div class="tree" role="dialog" aria-modal="true" aria-labelledby="tree-title" tabindex="-1">
    <h2 id="tree-title">Tree of life</h2>
    <p class="dim">Everything you can play descends from your first worm. Tap a lit line.</p>
    <svg viewBox="0 0 {TREE.w} {TREE.h}" width={TREE.w} height={TREE.h} role="img" aria-label="Tree of life">
      {#each old as o (o.name)}
        <line class="faded" x1={o.from.x} y1={o.from.y} x2={o.to.x} y2={o.to.y} />
        <text class="faded" x={o.to.x + o.side * 6} y={o.to.y + 5} text-anchor={o.side > 0 ? 'start' : 'end'}>{o.name}</text>
      {/each}
      {#each nodes as n (n.id)}
        {#if n.parent}<line class:faded={!n.line || !n.parent.lit} class:lit={!!n.line && n.parent.lit} x1={n.parent.x} y1={n.parent.y} x2={n.x} y2={n.y} />{/if}
      {/each}
      {#each nodes as n (n.id)}
        <g class="node" class:on={!!n.line} class:trunk={n.trunk} data-clade={n.id}
          role="button" tabindex={n.line ? 0 : -1} aria-disabled={!n.line}
          onclick={() => n.line && open(n.line.id)} onkeydown={(e) => e.key === 'Enter' && n.line && open(n.line.id)}>
          <circle cx={n.x} cy={n.y} r={n.trunk ? 8 : 14} />
          <text x={n.x} y={n.y + (n.trunk ? 26 : 34)} text-anchor="middle">{n.name}{n.line ? ` · level ${n.level}` : ''}</text>
          {#each n.hint ?? [] as h, i (i)}<text class="hint" x={n.x} y={n.y + 54 + i * 18} text-anchor="middle">{h}</text>{/each}
        </g>
      {/each}
    </svg>
    <div class="actions"><button onclick={back}>Back to the map</button></div>
  </div>
</div>

<style>
  .shade { position: absolute; inset: 0; display: grid; place-items: start center; grid-template-columns: minmax(0, 1fr); padding: 12px; box-sizing: border-box; background: var(--line); overflow: auto; z-index: 5; }
  .tree { background: var(--panel); border: 2px solid var(--paper); padding: 12px; width: 100%; max-width: 440px; min-width: 0; box-sizing: border-box; display: grid; gap: 8px; justify-items: center; }
  h2 { font-size: 16px; margin: 0; justify-self: start; }
  p { margin: 0; justify-self: start; }
  .dim { color: var(--dim); }
  svg { max-width: 100%; height: auto; overflow: visible; }
  line { stroke: var(--dim); stroke-width: 2; }
  line.lit { stroke: var(--gold); }
  .faded { opacity: 0.45; }
  text { font: 16px 'Clade Text', system-ui, sans-serif; fill: var(--dim); paint-order: stroke; stroke: var(--panel); stroke-width: 6px; stroke-linejoin: round; }
  text.faded { fill: var(--dim); }
  .hint { fill: var(--dim); opacity: 0.8; }
  .node circle { fill: var(--ink); stroke: var(--line); stroke-width: 2; }
  .node.trunk { opacity: 0.45; }
  .node.trunk circle { fill: var(--dim); stroke: none; }
  .node.on { cursor: pointer; }
  .node.on circle { fill: var(--gold); stroke: var(--paper); }
  .node.on text { fill: var(--gold); font-weight: 700; }
  .actions { justify-self: start; }
</style>
