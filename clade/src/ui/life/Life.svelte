<script lang="ts">
  import { onMount } from 'svelte';
  import type { Life } from '../../sim/life';
  import { LifeStage } from '../../view/life-stage';
  import Mutation from './Mutation.svelte';
  import './life.css';

  let { life, purpose, complete }: { life: Life; purpose: string; complete: () => void } = $props();
  let host: HTMLDivElement;
  let revision = $state(0);
  let error = $state('');
  let devBusy = $state(true);
  let stage: LifeStage;
  // `life` is a plain object the stage mutates; `revision` re-reads it after each settled action.
  const offer = $derived.by(() => {
    void revision;
    return !devBusy && stage?.offering ? [...(life.mutationOffer ?? [])] : [];
  });
  onMount(() => {
    stage = new LifeStage(life, complete, () => { revision++; devBusy = stage.busy; });
    stage.init(host).catch((e) => { error = `The board could not open: ${e.message}`; });
    return () => stage.destroy();
  });
</script>

<div class="life-screen" class:tree-mode={!!life.tree} data-revision={revision}>
  <header class="life-head">
    <h1>{purpose}</h1>
    <div class="life-counts"><span id="turn"></span><span id="eggs"></span><span id="body"></span><span id="mutant" class="mutant"></span></div>
    <div class="stocks">
      <span class="stock">Food <span class="pips food" id="food"></span><b id="foodN"></b></span>
      <span class="stock">Health <span class="pips hp" id="hp"></span><b id="hpN"></b></span>
      <span class="stock">Oxygen <span class="pips oxy" id="oxy"></span><b id="oxyN"></b></span>
    </div>
    <p id="forecast"></p>
  </header>
  <div id="stage" bind:this={host}>
    <div id="banner"></div><div id="floaters"></div><div id="flash"></div>
    {#if offer.length}<Mutation {offer} ranks={life.ranks} pick={(p) => void stage.mutate(p)} />{/if}
    {#if error}<p class="board-error">{error}</p>{/if}
  </div>
  <aside class="life-controls">
    <p id="info" aria-live="polite"></p>
    <div class="life-actions"><button id="grow">Grow</button><button id="lay">Lay</button><button id="wait">Wait</button></div>
    <div id="verbs"></div>
    <h2 id="enforceHeading">Enforce</h2><div id="enforce"></div>
    <div class="life-dev" aria-label="Life dev controls">
      <span>Dev</span><button disabled={devBusy || offer.length > 0 || life.phase !== 'play'} onclick={() => stage.addFood()}>+10 food</button>
      <button disabled={devBusy || offer.length > 0 || life.phase !== 'play'} onclick={() => stage.endSeason()}>End the season</button>
    </div>
  </aside>
</div>

<style>
  .tree-mode :global(#enforce h3) { font-size: 16px; margin: 8px 0 0; }
  .tree-mode :global(#enforce .grown) { border-color: var(--gold); }
</style>
