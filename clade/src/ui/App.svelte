<!-- The bare map's shell: the dev bar, the map with its labels, and the card of the tapped habitat. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { makeGround } from '../sim/ground';
  import { findHabitats } from '../sim/habitats';
  import { MapView, type Camera } from '../view/map';
  import { VIEWS, type MapMode } from '../view/paint';
  import HabitatCard from './HabitatCard.svelte';

  const asked = Number(new URLSearchParams(location.search).get('seed'));
  let seed = $state(Number.isInteger(asked) && asked > 0 ? asked : 1);
  let mode = $state<MapMode>('habitats');
  let selected = $state(-1);
  let cam = $state<Camera>({ x: 0, y: 0, z: 4 });
  let ready = $state(false);
  let host: HTMLDivElement;
  const view = new MapView();
  const world = $derived.by(() => { const g = makeGround(seed); return { g, hab: findHabitats(g) }; });
  let fitted = 0;

  function setSeed(s: number) {
    seed = Math.max(1, Math.floor(s));
    selected = -1;
    history.replaceState(null, '', `?seed=${seed}`);
  }
  const select = (id: number) => (selected = id);

  onMount(() => {
    view.onCamera = (c) => (cam = c);
    view.onTap = (t) => (selected = t >= 0 ? world.hab.of[t] : -1);
    view.init(host).then(() => (ready = true));
    // For the look script: drive the map without taps.
    Object.assign(window, { __clade: { setSeed, select, setMode: (m: MapMode) => (mode = m), fit: () => view.fit(), look: (x: number, y: number, z: number) => view.look(x, y, z), get world() { return world; } } });
  });

  $effect(() => {
    if (!ready) return;
    view.show(world.g, world.hab, mode, selected);
    if (fitted !== world.g.seed) { fitted = world.g.seed; view.fit(); }
  });
</script>

<div class="shell">
  <header class="bar">
    <button onclick={() => setSeed(seed - 1)} disabled={seed <= 1}>−</button>
    <span class="seed">seed {seed}</span>
    <button onclick={() => setSeed(seed + 1)}>+</button>
    <span class="gap"></span>
    {#each VIEWS as v (v)}
      <button class:on={mode === v} onclick={() => (mode = v)}>{v}</button>
    {/each}
    <span class="gap"></span>
    <button onclick={() => view.fit()}>fit</button>
    <span class="count">{world.hab.list.length} habitats</span>
  </header>
  <div class="map" bind:this={host}>
    <div class="labels">
      {#each world.hab.list as h (h.id)}
        <span class="label" class:picked={h.id === selected} style:left="{cam.x + (h.centre.x + 0.5) * cam.z}px" style:top="{cam.y + (h.centre.y + 0.5) * cam.z}px">{h.name}</span>
      {/each}
    </div>
    {#if selected >= 0 && world.hab.list[selected]}
      <HabitatCard hab={world.hab.list[selected]} all={world.hab.list} {select} />
    {/if}
  </div>
</div>

<style>
  .shell { position: absolute; inset: 0; display: flex; flex-direction: column; }
  .bar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: var(--ink); flex-wrap: wrap; }
  .seed { min-width: 80px; text-align: center; }
  .gap { width: 12px; }
  .count { margin-left: auto; color: var(--dim); }
  .map { position: relative; flex: 1; overflow: hidden; touch-action: none; }
  .labels { position: absolute; inset: 0; pointer-events: none; }
  .label { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; color: var(--paper);
    text-shadow: 1px 0 var(--ink), -1px 0 var(--ink), 0 1px var(--ink), 0 -1px var(--ink); }
  .label.picked { font-weight: 700; }
</style>
