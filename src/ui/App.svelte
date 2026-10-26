<script lang="ts">
  import { store, act } from './game.svelte';
  import { letItGrow } from '../core/actions';
  import { commonTraits } from '../core/modifiers';
  import { fitAll } from '../core/release';
  import { TEXT } from '../data/text';
  import TopBar from './TopBar.svelte';
  import IslandView from './IslandView.svelte';
  import PatchView from './PatchView.svelte';
  import SpeciesCard from './SpeciesCard.svelte';
  import SplitControl from './SplitControl.svelte';
  import GenePool from './GenePool.svelte';
  import SkillBar from './SkillBar.svelte';
  import TreePanel from './TreePanel.svelte';
  import ReleasePanel from './ReleasePanel.svelte';
  import ReleaseScreen from './ReleaseScreen.svelte';
  import CodexCard from './CodexCard.svelte';
  import GardenSlot from './GardenSlot.svelte';
  import Toasts from './Toasts.svelte';
  import DevPanel from './DevPanel.svelte';
  import Modal from './Modal.svelte';

  const s = $derived(store.s);
  const traits = $derived(commonTraits(s));
  const fit = $derived(s.reveal.fit ? fitAll(s) : null);
  let releaseOpen = $state(false);
  let gardenCard = $state<number | null>(null);
  const shown = $derived(gardenCard !== null ? s.garden.species[gardenCard] : null);
</script>

<div class="app">
  {#if s.phase !== 'intro'}
    <TopBar />
  {/if}
  <main>
    <section class="view">
      {#if s.phase === 'colony'}
        <PatchView />
      {:else}
        <IslandView onMossTap={(i) => (gardenCard = i)} />
      {/if}
    </section>

    {#if s.phase === 'colony'}
      <aside class="side">
        <SpeciesCard name={s.speciesName} {traits} {fit} editable />
        <SplitControl />
        <SkillBar />
        {#if s.genePool.open}<GenePool />{/if}
        {#if s.reveal.tree}<TreePanel />{/if}
        {#if s.reveal.releasePreview}<ReleasePanel onOpen={() => (releaseOpen = true)} />{/if}
      </aside>
    {:else if s.phase === 'dispersal' || s.phase === 'garden'}
      <aside class="side">
        <GardenSlot />
        <SkillBar />
        <TreePanel />
      </aside>
    {/if}
  </main>

  {#if s.phase === 'arrival'}
    <Modal>
      <SpeciesCard name={s.speciesName} {traits} fit={null} editable />
      <button class="primary wide" onclick={() => act(letItGrow)}>{TEXT.letItGrow}</button>
    </Modal>
  {/if}

  {#if releaseOpen && s.phase === 'colony'}
    <ReleaseScreen onClose={() => (releaseOpen = false)} />
  {/if}

  {#if s.codexOpen}
    <CodexCard node={s.codexOpen} />
  {/if}

  {#if shown}
    <Modal onClose={() => (gardenCard = null)}>
      <SpeciesCard name={shown.name} traits={shown.traits} fit={shown.fit} editable={false} />
      <button class="wide" onclick={() => (gardenCard = null)}>{TEXT.card.close}</button>
    </Modal>
  {/if}

  <Toasts />
  <DevPanel />
</div>

<style>
  :global(:root) {
    --bg: #15171a;
    --panel: #1f2328;
    --panel-2: #272c32;
    --line: #353b42;
    --text: #e4e6e3;
    --muted: #9aa19c;
    --accent: #8fbf5a;
    --accent-2: #b9d98f;
    --warn: #d9a441;
    --bronze: #b0794a;
    --silver: #b9c0c6;
    --gold: #e0b84a;
    color-scheme: dark;
  }
  :global(*) {
    box-sizing: border-box;
  }
  :global(html, body) {
    margin: 0;
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font: 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  :global(#app) {
    height: 100%;
  }
  :global(button) {
    font: inherit;
    color: var(--text);
    background: var(--panel-2);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
  }
  :global(button:hover:not(:disabled)) {
    border-color: var(--accent);
  }
  :global(button:disabled) {
    opacity: 0.45;
    cursor: default;
  }
  :global(button.primary) {
    background: #3f5f2a;
    border-color: var(--accent);
  }
  :global(button.wide) {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
  }
  :global(.card) {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px;
  }
  :global(.card h3) {
    margin: 0 0 8px;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 600;
  }
  :global(.muted) {
    color: var(--muted);
  }
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  main {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .view {
    flex: 1;
    min-width: 0;
    position: relative;
  }
  .side {
    width: 360px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    border-left: 1px solid var(--line);
  }
  @media (max-width: 760px) {
    main {
      flex-direction: column;
      overflow-y: auto;
    }
    .view {
      flex: none;
      height: 55vh;
    }
    .side {
      width: 100%;
      border-left: none;
      overflow: visible;
    }
  }
</style>
