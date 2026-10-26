<script lang="ts">
  import { store, act } from './game.svelte';
  import { setSplit } from '../core/actions';
  import type { Split } from '../core/types';
  import { TEXT } from '../data/text';

  type Part = keyof Split;
  const parts: { id: Part; name: string; hint: string }[] = [
    { id: 'spread', name: TEXT.split.spread, hint: TEXT.split.spreadHint },
    { id: 'cushion', name: TEXT.split.cushion, hint: TEXT.split.cushionHint },
    { id: 'spores', name: TEXT.split.spores, hint: TEXT.split.sporesHint },
  ];

  const split = $derived(store.s.colony?.split ?? { spread: 1 / 3, cushion: 1 / 3, spores: 1 / 3 });

  // Moving one slider rescales the other two to keep the total at 100%.
  function change(id: Part, value: number) {
    const v = Math.min(1, Math.max(0, value));
    const others = parts.filter((p) => p.id !== id).map((p) => p.id);
    const rest = others.reduce((sum, o) => sum + split[o], 0);
    const next = { ...split, [id]: v } as Split;
    for (const o of others) next[o] = rest > 0 ? (split[o] / rest) * (1 - v) : (1 - v) / others.length;
    act((g) => setSplit(g, next));
  }
</script>

<div class="card">
  <h3>{TEXT.split.title}</h3>
  <div class="bar">
    {#each parts as p (p.id)}
      <div class="seg {p.id}" style="width: {split[p.id] * 100}%"></div>
    {/each}
  </div>
  {#each parts as p (p.id)}
    <label class="row">
      <span class="name"><b>{p.name}</b> <span class="muted">{p.hint}</span></span>
      <input
        type="range"
        min="0"
        max="100"
        value={Math.round(split[p.id] * 100)}
        oninput={(e) => change(p.id, Number(e.currentTarget.value) / 100)}
      />
      <span class="pct">{Math.round(split[p.id] * 100)}%</span>
    </label>
  {/each}
</div>

<style>
  .bar {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .seg.spread {
    background: #6fa04a;
  }
  .seg.cushion {
    background: #5b8fb8;
  }
  .seg.spores {
    background: #c7b45a;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 120px 40px;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }
  .pct {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  input {
    width: 100%;
  }
</style>
