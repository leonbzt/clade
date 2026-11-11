<!-- The bare map's shell: the dev bar, the map with its labels, and the card of the tapped habitat. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { makeGround } from '../sim/ground';
  import { findHabitats } from '../sim/habitats';
  import { makeWorld } from '../sim/sea';
  import { css } from '../data/palette';
  import { DEV_SPECIES } from '../data/builds';
  import { PRESETS } from '../data/presets';
  import { bestFit, heldSlots, ranksOf } from '../view/tiers';
  import { MapView, type Camera } from '../view/map';
  import { VIEWS, type MapMode } from '../view/paint';
  import HabitatCard from './HabitatCard.svelte';
  import { remember } from './history';
  import { place } from './placement';
  import { applyPreset, skip } from './scenarios';
  import LifeScreen from './life/Life.svelte';
  import Result from './life/Result.svelte';
  import { launch, finish, type Colonisation } from './life/colonise';

  const asked = Number(new URLSearchParams(location.search).get('seed'));
  const initialSeed = Number.isInteger(asked) && asked > 0 ? asked : 1;
  const initialWorld = makeWorld(initialSeed);
  let seed = $state(initialSeed);
  let mode = $state<MapMode>('habitats');
  let selected = $state(-1);
  let pickedId = $state('');
  let presetId = $state('empty');
  let cam = $state<Camera>({ x: 0, y: 0, z: 4 });
  let ready = $state(false);
  let host: HTMLDivElement;
  const view = new MapView();
  const ground = $derived.by(() => { const g = makeGround(seed); return { g, hab: findHabitats(g) }; });
  let world = $state.raw(initialWorld);
  let past = $state.raw(remember([], initialWorld));
  const picked = $derived(world.species.find((s) => s.id === pickedId) ?? DEV_SPECIES.find((s) => s.id === pickedId));
  const ranks = $derived(ranksOf(world, picked?.lineage ?? null));
  const labels = $derived(world.habitats.map((h) => ({ hab: h, held: heldSlots(h, world), preview: picked ? bestFit(picked.build, ranks, h, world) : undefined })));
  let fitted = 0;
  let active = $state.raw<Colonisation | null>(null);
  let lifeCount = 0;
  function colonisePicked() {
    if (active || !picked) return false;
    const next = launch(world, selected, picked, lifeCount + 1);
    if (!next) return false;
    lifeCount++; active = next; return true;
  }
  function completeLife() {
    if (!active || !finish(world, active)) return;
    world = { ...world }; past = remember(past, world); active = { ...active };
  }
  function backToMap() {
    if (!active?.report) return;
    selected = active.habitat; active = null;
  }

  function setSeed(s: number) {
    if (active) return;
    lifeCount = 0;
    seed = Math.max(1, Math.floor(s));
    world = makeWorld(seed);
    past = applyPreset(world, presetId);
    selected = -1;
    window.history.replaceState(null, '', `?seed=${seed}`);
  }
  const select = (id: number) => (selected = id);
  const pick = (id: string) => (pickedId = id);
  function placePicked() {
    if (active || !picked || !place(world, selected, picked)) return;
    world = { ...world };
    past = remember(past, world);
  }
  function setPreset(id: string) {
    if (active) return;
    lifeCount = 0;
    presetId = id;
    world = makeWorld(seed);
    past = applyPreset(world, id);
    world = { ...world };
    selected = -1;
    pickedId = '';
  }
  function advance(generations: number) {
    if (active) return;
    past = skip(world, past, generations);
    world = { ...world };
  }

  onMount(() => {
    view.onCamera = (c) => (cam = c);
    view.onTap = (t) => (selected = t >= 0 ? ground.hab.of[t] : -1);
    view.init(host).then(() => (ready = true));
    // For the look script: drive the map without taps.
    Object.assign(window, { __clade: { setSeed, select, pick, setPreset, skip: advance, place: placePicked, colonise: colonisePicked, back: backToMap,
      get session() { return active; }, get lifeCount() { return lifeCount; },
      setMode: (m: MapMode) => (mode = m), fit: () => view.fit(), look: (x: number, y: number, z: number) => view.look(x, y, z),
      get world() { return world; }, get ground() { return ground; }, get history() { return past; } } });
  });

  $effect(() => {
    if (!ready) return;
    view.show(ground.g, ground.hab, mode, selected);
    if (fitted !== ground.g.seed) { fitted = ground.g.seed; view.fit(); }
  });
</script>

<div class="shell" inert={active !== null}>
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
    <span class="count">{world.habitats.length} habitats</span>
    <label class="build">Build
      <select aria-label="Build" bind:value={pickedId}>
        <option value="">Holders</option>
        {#each DEV_SPECIES as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
      </select>
    </label>
    <label class="build">Preset
      <select aria-label="Preset" value={presetId} onchange={(e) => setPreset(e.currentTarget.value)}>
        {#each PRESETS as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
      </select>
    </label>
    <span>gen {world.generation}</span>
    {#each [1, 10, 100] as n}<button onclick={() => advance(n)}>skip {n}</button>{/each}
  </header>
  <div class="map" bind:this={host}>
    <div class="labels">
      {#each labels as { hab: h, held, preview } (h.id)}
        <span class="label" class:picked={h.id === selected} style:left="{cam.x + (h.centre.x + 0.5) * cam.z}px" style:top="{cam.y + (h.centre.y + 0.5) * cam.z}px">{h.name}
          <span class="letters">
            {#if picked}
              {#if preview}<b class="preview" style:color={css(preview.slot.accent)} title={`${picked.name}: ${preview.slot.name}`}>{preview.fit.letter}</b>{:else}<b>—</b>{/if}
            {:else}
            {#each held as { slot, holders } (slot.id)}
              {#each holders as holder (holder.species.id)}
                <b style:color={css(slot.accent)} title={`${slot.name}: ${holder.species.name}`}>{holder.best?.fit.letter}</b>
              {/each}
            {/each}
            {/if}
          </span>
        </span>
      {/each}
    </div>
    {#if selected >= 0 && world.habitats[selected]}
      {#key `${selected}:${pickedId}`}
        <HabitatCard hab={world.habitats[selected]} {world} history={past} {select} {picked} {ranks} place={placePicked} colonise={colonisePicked} />
      {/key}
    {/if}
  </div>
</div>

{#if active}
  <LifeScreen life={active.life} purpose={active.purpose} complete={completeLife} />
  {#if active.report}<Result session={active} back={backToMap} />{/if}
{/if}

<style>
  .shell { position: absolute; inset: 0; display: flex; flex-direction: column; }
  .bar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: var(--ink); flex-wrap: wrap; }
  .seed { min-width: 80px; text-align: center; }
  .gap { width: 12px; }
  .count { margin-left: auto; color: var(--dim); }
  .build { display: flex; align-items: center; gap: 6px; }
  select { font: inherit; color: var(--paper); background: var(--panel); border: 2px solid var(--line); padding: 4px; max-width: 200px; }
  .map { position: relative; flex: 1; overflow: hidden; touch-action: none; }
  .labels { position: absolute; inset: 0; pointer-events: none; }
  .label { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; color: var(--paper);
    text-shadow: 1px 0 var(--ink), -1px 0 var(--ink), 0 1px var(--ink), 0 -1px var(--ink); }
  .label.picked { font-weight: 700; }
  .letters { display: flex; justify-content: center; gap: 6px; }
  .preview { font-size: 32px; }
</style>
