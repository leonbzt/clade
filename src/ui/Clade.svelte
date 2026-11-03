<script lang="ts">
  import { FORMS, tierOf } from '../data/genes';
  import { gramsBySpecies } from '../sim/game';
  import type { Species } from '../sim/species';
  import { S, ui } from './state.svelte';

  /** Your species as a tree from the founder: depth-first, with each one's best score and held grams. */
  const items = $derived.by(() => {
    ui.v;
    const g = S.game, grams = gramsBySpecies(g), out: { sp: Species; depth: number; best: number; kg: number }[] = [];
    const walk = (id: number, depth: number) => {
      const sp = g.species[id];
      out.push({ sp, depth, best: Math.max(-1, ...sp.scores), kg: (grams.get(id) ?? 0) / 1000 });
      for (const c of g.species) if (c.parent === id && !c.native) walk(c.id, depth + 1);
    };
    walk(g.founder, 0);
    return out;
  });
</script>

{#each items as it (it.sp.id)}
  <div class="item" class:gone={it.sp.id !== S.game.founder && it.kg === 0} style:padding-left="{it.depth * 14}px">
    <span class="dot" style:background={it.sp.color}></span>
    <span>{it.sp.name}</span>
    <span class="muted">{FORMS[it.sp.form].name.toLowerCase()}{it.best >= 0 ? ` · ${tierOf(it.best)} ${it.best}` : ''}{it.kg ? ` · ${it.kg.toFixed(it.kg < 10 ? 1 : 0)} kg` : ''}</span>
  </div>
{/each}

<style>
  .item { display: flex; gap: 6px; align-items: center; font-size: 12.5px; margin: 2px 0; }
  .gone { opacity: .45; text-decoration: line-through; }
</style>
