<script lang="ts">
  import { onMount } from 'svelte';
  import type { Life } from '../../sim/life';
  import { LifeStage } from '../../view/life-stage';
  import './life.css';

  let { life, purpose, complete }: { life: Life; purpose: string; complete: () => void } = $props();
  let host: HTMLDivElement;
  let revision = $state(0);
  let error = $state('');
  let devBusy = $state(true);
  let stage: LifeStage;
  onMount(() => {
    stage = new LifeStage(life, complete, () => { revision++; devBusy = stage.busy; });
    stage.init(host).catch((e) => { error = `The board could not open: ${e.message}`; });
    return () => stage.destroy();
  });
</script>

<div class="life-screen" data-revision={revision}>
  <header class="life-head">
    <h1>{purpose}</h1>
    <div class="life-counts"><span id="turn"></span><span id="eggs"></span><span id="body"></span></div>
    <div class="stocks">
      <span class="stock">Food <span class="pips food" id="food"></span><b id="foodN"></b></span>
      <span class="stock">Health <span class="pips hp" id="hp"></span><b id="hpN"></b></span>
      <span class="stock">Oxygen <span class="pips oxy" id="oxy"></span><b id="oxyN"></b></span>
    </div>
    <p id="forecast"></p>
  </header>
  <div id="stage" bind:this={host}>
    <div id="banner"></div><div id="floaters"></div><div id="flash"></div>
    {#if error}<p class="board-error">{error}</p>{/if}
  </div>
  <aside class="life-controls">
    <p id="info" aria-live="polite"></p>
    <div class="life-actions"><button id="grow">Grow</button><button id="lay">Lay</button><button id="wait">Wait</button></div>
    <div id="verbs"></div>
    <h2>Enforce</h2><div id="enforce"></div>
    <div class="life-dev" aria-label="Life dev controls">
      <span>Dev</span><button disabled={devBusy || life.phase !== 'play'} onclick={() => stage.addFood()}>+10 food</button>
      <button disabled={devBusy || life.phase !== 'play'} onclick={() => stage.endSeason()}>End the season</button>
    </div>
  </aside>
</div>
