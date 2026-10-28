<script lang="ts">
  import TopBar from './TopBar.svelte';
  import MapView from './MapView.svelte';
  import SpeciesPanel from './SpeciesPanel.svelte';
  import TreeScreen from './TreeScreen.svelte';
  import DevPanel from './DevPanel.svelte';
  import Toasts from './Toasts.svelte';
  import TilePanel from './TilePanel.svelte';
  import AnimalCard from './AnimalCard.svelte';
  import { ui } from './game.svelte';
  import { VIEWS } from '../view/render';

  function key(e: KeyboardEvent) {
    // The backtick is a dead key on German keyboards, so match the physical key (left of 1) and F2 too.
    if (e.code === 'Backquote' || e.key === '`' || e.key === 'F2') { e.preventDefault(); ui.dev = !ui.dev; }
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'Escape') { ui.placing = null; ui.tree = false; }
    if (e.key === 't' || e.key === 'T') ui.tree = !ui.tree;
    // Number keys switch the map view: 1 Garden, 2 Zones, 3 Water, ... 7 Variants
    const k = Number(e.key);
    if (k >= 1 && k <= VIEWS.length) ui.view = VIEWS[k - 1];
  }
</script>

<svelte:window onkeydown={key} />

<div class="app">
  <TopBar />
  <main>
    <MapView />
    <aside class="panel side">
      <nav class="tabs">
        <button class="treebtn" onclick={() => (ui.tree = true)} title="The tree of life (T)">Tree of life</button>
        <button class:on={ui.tab === 'species'} onclick={() => (ui.tab = 'species')}>Species</button>
        <button class:on={ui.tab === 'tile'} onclick={() => (ui.tab = 'tile')}>Tile</button>
        {#if ui.follow >= 0}<button class:on={ui.tab === 'animal'} onclick={() => (ui.tab = 'animal')}>Animal</button>{/if}
      </nav>
      {#if ui.tab === 'species'}<SpeciesPanel />{:else if ui.tab === 'animal'}<AnimalCard />{:else}<TilePanel />{/if}
    </aside>
  </main>
  {#if ui.tree}<TreeScreen />{/if}
  {#if ui.dev}<DevPanel />{/if}
  <Toasts />
</div>

<style>
  /* Fixed to the window: no page scrollbar can appear and resize the map. */
  .app { display: flex; flex-direction: column; gap: 8px; padding: 8px; height: 100vh; overflow: hidden; }
  main { display: flex; gap: 8px; align-items: flex-start; flex: 1; min-height: 0; }
  .side { width: 380px; flex: none; max-height: 100%; overflow-y: auto; scrollbar-gutter: stable; }
  .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
  .tabs button { flex: 1; }
  .tabs .treebtn { color: var(--gold); }
  @media (max-width: 900px) {
    .app { height: auto; overflow: visible; }
    main { flex-direction: column; }
    .side { width: 100%; max-height: none; }
  }
</style>
