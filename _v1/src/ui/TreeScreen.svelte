<script lang="ts">
  // The tree of life screen, over the map: the overview and the milestones. Left, the clades with your species as
  // leaves and what the next nodes need; right, the spindle diagram of your lineages over time.
  import TreePanel from './TreePanel.svelte';
  import Spindle from './Spindle.svelte';
  import { ui } from './game.svelte';
</script>

<div class="screen" role="presentation" onclick={(e) => e.target === e.currentTarget && (ui.tree = false)}>
  <div class="panel box">
    <header><h2>Tree of life</h2><span class="dim small">T or Esc to close</span><button onclick={() => (ui.tree = false)}>×</button></header>
    <div class="cols">
      <section class="nodes"><TreePanel /></section>
      <section class="time">
        <h3>Your lineages over time <span class="dim small">(band = tiles; a branch starts from the form it grew from)</span></h3>
        <Spindle />
      </section>
    </div>
  </div>
</div>

<style>
  .screen { position: fixed; inset: 0; background: rgba(14, 11, 8, 0.7); display: flex; justify-content: center; align-items: flex-start;
    padding: 24px 16px; z-index: 20; overflow-y: auto; }
  .box { width: min(1180px, 100%); }
  header { display: flex; gap: 12px; align-items: baseline; }
  header h2 { margin: 0; flex: 1; }
  .cols { display: grid; grid-template-columns: minmax(300px, 380px) 1fr; gap: 16px; margin-top: 8px; }
  .time { min-width: 0; }
  .small { font-size: 13px; }
  @media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
</style>
