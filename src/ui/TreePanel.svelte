<script lang="ts">
  import { SPECIES, SPECIES_INDEX } from '../data/species';
  import { TREE } from '../data/tree';
  import { canEvolve, reqStatus } from '../sim/commands';
  import Specimen from './Specimen.svelte';
  import { doEvolve, game, startPlacing, ui } from './game.svelte';
  import { fmt } from './format';

  const depth = (id: string | null): number => {
    const n = TREE.find((t) => t.id === id);
    return n?.parent ? 1 + depth(n.parent) : 0;
  };

  const nodes = $derived.by(() => {
    ui.v;
    return TREE.map((n) => {
      const reached = game.reached.includes(n.id);
      const open = !n.parent || game.reached.includes(n.parent);
      return {
        ...n, depth: depth(n.id), reached, open,
        can: canEvolve(game, n.id).ok,
        // Requirements stay met once reached.
        reqs: n.reqs.map((r) => { const st = reqStatus(game, r); return game.ready.includes(n.id) ? { ...st, met: true } : st; }),
        speciesName: n.species ? SPECIES[SPECIES_INDEX[n.species]].name : null,
        placed: n.species ? game.foundings[n.species] > 0 : false,
      };
    });
  });
</script>

<div class="tree">
  {#each nodes as n (n.id)}
    <div class="node" class:reached={n.reached} class:locked={!n.open} style:margin-left="{n.depth * 18}px">
      <div class="head">
        {#if n.species && n.reached}<Specimen species={n.species} traits={game.traits[n.species]} scale={1} size={32} />{/if}
        <b>{n.reached ? '✔ ' : ''}{n.name}</b>
      </div>
      {#if n.reached}
        <p class="dim fact">{n.fact}</p>
        {#if n.species && !n.placed}
          <button class="go" onclick={() => { startPlacing(n.species!); ui.tab = 'species'; }}>Found {n.speciesName} on the island</button>
        {/if}
      {:else if !n.open}
        <p class="dim">Reach its parent first.</p>
      {:else}
        {#each n.reqs as r (r.text)}
          <div class="req" class:met={r.met}>
            <span>{r.met ? '✔' : '○'} {r.text}</span><span>{Math.min(r.have, r.need)} / {r.need}</span>
          </div>
        {/each}
        <button class="go" disabled={!n.can} onclick={() => doEvolve(n.id)}>
          Evolve{n.cost ? ` · ${fmt(n.cost)} biomass` : ''}
        </button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .tree { display: flex; flex-direction: column; gap: 6px; }
  .node { padding: 6px 8px; background: var(--panel-dark); border: 2px solid var(--ink); border-left: 4px solid var(--edge); }
  .node.reached { border-left-color: var(--good); }
  .node.locked { opacity: 0.5; }
  .head { display: flex; gap: 8px; align-items: center; }
  .fact { margin: 4px 0; font-size: 14px; }
  .req { display: flex; justify-content: space-between; font-size: 15px; }
  .req.met { color: var(--good); }
  .go { margin-top: 6px; width: 100%; }
  p { margin: 4px 0; }
</style>
