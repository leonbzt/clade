<script lang="ts">
  import TopBar from './TopBar.svelte';
  import MapView from './MapView.svelte';
  import SpeciesPanel from './SpeciesPanel.svelte';
  import TreePanel from './TreePanel.svelte';
  import DevPanel from './DevPanel.svelte';
  import Toasts from './Toasts.svelte';
  import TilePanel from './TilePanel.svelte';
  import { ui } from './game.svelte';
  import { VIEWS } from '../view/render';

  function key(e: KeyboardEvent) {
    // The backtick is a dead key on German keyboards, so match the physical key (left of 1) and F2 too.
    if (e.code === 'Backquote' || e.key === '`' || e.key === 'F2') { e.preventDefault(); ui.dev = !ui.dev; }
    if (e.key === 'Escape') ui.placing = null;
    // Number keys switch the map view: 1 Garden, 2 Zones, 3 Water, ...
    const k = Number(e.key);
    if (k >= 1 && k <= VIEWS.length && !(e.target instanceof HTMLInputElement)) ui.view = VIEWS[k - 1];
  }
</script>

<svelte:window onkeydown={key} />

<div class="app">
  <TopBar />
  <main>
    <MapView />
    <aside class="panel side">
      <nav class="tabs">
        <button class:on={ui.tab === 'tree'} onclick={() => (ui.tab = 'tree')}>Tree of life</button>
        <button class:on={ui.tab === 'species'} onclick={() => (ui.tab = 'species')}>Species</button>
        <button class:on={ui.tab === 'tile'} onclick={() => (ui.tab = 'tile')}>Tile</button>
      </nav>
      {#if ui.tab === 'species'}<SpeciesPanel />{:else if ui.tab === 'tile'}<TilePanel />{:else}<TreePanel />{/if}
    </aside>
  </main>
  {#if ui.dev}<DevPanel />{/if}
  <Toasts />
</div>

<style>
  .app { display: flex; flex-direction: column; gap: 8px; padding: 8px; min-height: 100vh; }
  main { display: flex; gap: 8px; align-items: flex-start; }
  .side { width: 360px; flex: none; max-height: calc(100vh - 80px); overflow-y: auto; }
  .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
  .tabs button { flex: 1; }
  @media (max-width: 900px) {
    main { flex-direction: column; }
    .side { width: 100%; max-height: none; }
  }
</style>
