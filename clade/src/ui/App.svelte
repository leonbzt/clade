<!-- The home map: your habitats in gold, the neighbours you can colonise with a letter and a reason, the rest named
     only. The dev bar (seed, views, presets, skips, the build preview) sits behind the dev toggle. -->
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
  import { capsuleCounts } from '../view/living';
  import { VIEWS, type MapMode } from '../view/paint';
  import HabitatCard from './HabitatCard.svelte';
  import { remember } from './history';
  import { place } from './placement';
  import { applyPreset, skip } from './scenarios';
  import { runLife, type SeaRun } from './sea-run';
  import LifeScreen from './life/Life.svelte';
  import Hatch from './Hatch.svelte';
  import type { Card } from '../sim/clutch';
  import { launch, finish, type Colonisation } from './life/colonise';
  import { clutchOf } from './life/hatching';
  import { homeLabel, visibleLabels } from '../view/home';
  import { YOUR_LINE } from '../data/lines';
  import { levelOf, pointsOf, spend } from '../sim/line';
  import type { PartId, Species } from '../sim/records';
  import LineView from './Line.svelte';
  import TreeView from './Tree.svelte';

  const asked = Number(new URLSearchParams(location.search).get('seed'));
  const initialSeed = Number.isInteger(asked) && asked > 0 ? asked : 1;
  const initialWorld = makeWorld(initialSeed), initialPast = applyPreset(initialWorld, 'first-worm');
  let seed = $state(initialSeed);
  let mode = $state<MapMode>('habitats');
  let selected = $state(-1);
  let pickedId = $state('root-worm');
  let presetId = $state('first-worm');
  let dev = $state(false);
  let lineOpen = $state<string | null>(null);
  let treeOpen = $state(false);
  let cam = $state<Camera>({ x: 0, y: 0, z: 4 });
  let ready = $state(false);
  let host: HTMLDivElement;
  const view = new MapView();
  const ground = $derived.by(() => { const g = makeGround(seed); return { g, hab: findHabitats(g) }; });
  let world = $state.raw(initialWorld);
  let past = $state.raw(initialPast);
  const picked = $derived(world.species.find((s) => s.id === pickedId) ?? DEV_SPECIES.find((s) => s.id === pickedId));
  const ranks = $derived(ranksOf(world, picked?.lineage ?? null));
  const labels = $derived(world.habitats.map((h) => ({ hab: h, held: heldSlots(h, world), home: homeLabel(world, h),
    preview: dev && picked ? bestFit(picked.build, ranks, h, world) : undefined })));
  const line = $derived(world.lineages.find((l) => l.id === YOUR_LINE));
  const shownLine = $derived(world.lineages.find((l) => l.id === lineOpen));
  // Labels never overlap. Widths come from the font; yours, then targets, then the larger habitat keep theirs.
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = "16px 'Clade Text'";
  const shown = $derived(visibleLabels(labels.map(({ hab: h, home }) => {
    const sub = dev ? (picked ? 36 : 20) : home.kind === 'fog' ? 0 : 36;
    const extra = !dev && home.kind === 'target' ? 24 + measure.measureText(home.reason).width : 0;
    const rank = (h.id === selected ? 4e9 : 0) + (!dev && home.kind === 'yours' ? 2e9 : !dev && home.kind === 'target' ? 1e9 : 0) + h.area;
    return { id: h.id, rank, x: cam.x + (h.centre.x + 0.5) * cam.z, y: cam.y + (h.centre.y + 0.5) * cam.z,
      w: Math.max(measure.measureText(h.name).width + 12, extra) + 8, h: 20 + sub };
  })));
  let fitted = 0;
  let active = $state.raw<Colonisation | null>(null);
  let lifeCount = 0;
  const colonisePicked = () => !!picked && send(picked);
  function send(species: Species, adopting = false) {
    if (active) return false;
    const next = launch(world, selected, species, lifeCount + 1, adopting);
    if (!next) return false;
    lifeCount++; active = next; return true;
  }
  let clutch = $state.raw<ReturnType<typeof clutchOf>>(null);
  // The Life is over: roll its clutch once and open hatching. No eggs, no cards: settle the parent at once.
  function completeLife() {
    if (!active || clutch) return;
    clutch = clutchOf(world, active);
    if (clutch && !clutch.offers.length) settle(null);
  }
  function settle(card: Card | null) {
    if (!active || active.report || !finish(world, active, card)) return;
    world = { ...world }; past = remember(past, world); active = { ...active };
  }
  let seaRun = $state.raw<SeaRun | null>(null);
  // Back to the map: the sea ran while you lived. Its report and news are kept for the replay and the notes.
  function backToMap() {
    if (!active?.report) return;
    const ran = runLife(world, past);
    past = ran.history; seaRun = ran.run; world = { ...world };
    selected = active.habitat; active = null; clutch = null;
  }

  function spendPart(part: PartId) {
    const l = world.lineages.find((x) => x.id === lineOpen);
    if (!l || !spend(l, part, world.species)) return;
    // A fresh line object, so the line view re-reads it.
    world.lineages = world.lineages.map((x) => (x === l ? { ...l, ranks: { ...l.ranks } } : x));
    world = { ...world }; past = remember(past, world);
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

  // Open on your habitats and the neighbours you can reach; the whole island when you have none.
  const home = () => view.frame(labels.filter((l) => l.home.kind !== 'fog').map((l) => l.hab.centre));

  onMount(() => {
    view.onCamera = (c) => (cam = c);
    view.onTap = (t) => (selected = t >= 0 ? ground.hab.of[t] : -1);
    view.init(host).then(() => (ready = true));
    // For the look script: drive the map without taps.
    Object.assign(window, { __clade: { setSeed, select, pick, setPreset, skip: advance, place: placePicked, colonise: colonisePicked, back: backToMap, toggleDev: () => (dev = !dev), openLine: (id = YOUR_LINE) => (lineOpen = id), openTree: () => (treeOpen = true), get tree() { return treeOpen; }, spend: spendPart, get dev() { return dev; },
      send: (id: string, adopting = false) => { const s = world.species.find((x) => x.id === id); return !!s && send(s, adopting); },
      hatch: (i: number) => settle(i < 0 ? null : clutch?.offers[i]?.card ?? null), get clutch() { return clutch; }, get news() { return seaRun?.news.map((l) => l.text) ?? []; },
      get session() { return active; }, get lifeCount() { return lifeCount; },
      setMode: (m: MapMode) => (mode = m), fit: () => view.fit(), look: (x: number, y: number, z: number) => view.look(x, y, z),
      get world() { return world; }, get ground() { return ground; }, get history() { return past; } } });
  });

  $effect(() => {
    if (!ready) return;
    view.show(ground.g, ground.hab, mode, selected);
    if (fitted !== ground.g.seed) { fitted = ground.g.seed; home(); }
  });
  // Living paint follows the populations (view only).
  $effect(() => { if (ready && ground) view.living.sync(capsuleCounts(world)); });
</script>

<div class="shell" inert={active !== null || lineOpen !== null || treeOpen}>
  <header class="bar">
    {#if line}<button class="line" onclick={() => (lineOpen = YOUR_LINE)}>Worm line · level {levelOf(line.xp)}{#if pointsOf(line) > 0} · {pointsOf(line)} point{pointsOf(line) === 1 ? '' : 's'}{/if}</button>{/if}
    <span class="gap"></span>
    <button class="tree" onclick={() => (treeOpen = true)}>tree</button>
    <button onclick={home}>home</button>
    <button class="dev" class:on={dev} onclick={() => (dev = !dev)}>dev</button>
    {#if dev}
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
    {/if}
  </header>
  <div class="map" bind:this={host}>
    <div class="labels">
      {#each labels as { hab: h, held, preview, home } (h.id)}
        {#if shown.has(h.id)}
        <span class="label" class:picked={h.id === selected} class:yours={!dev && home.kind === 'yours'} style:left="{cam.x + (h.centre.x + 0.5) * cam.z}px" style:top="{cam.y + (h.centre.y + 0.5) * cam.z}px">{h.name}
          <span class="letters">
            {#if !dev}
              {#if home.kind === 'yours'}{#each home.letters as l, i (i)}<b class="big">{l}</b>{/each}
              {:else if home.kind === 'target'}<b class="big">{home.letter}</b><span class="reason">{home.reason}</span>{/if}
            {:else if picked}
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
        {/if}
      {/each}
    </div>
    {#if selected >= 0 && world.habitats[selected]}
      {#key `${selected}:${pickedId}`}
        <HabitatCard hab={world.habitats[selected]} {world} history={past} {select} picked={dev ? picked : undefined} {ranks} place={placePicked} colonise={colonisePicked} {send} adopt={(s) => send(s, true)} />
      {/key}
    {/if}
  </div>
</div>

{#if treeOpen && !active}<TreeView {world} open={(id) => (lineOpen = id)} back={() => (treeOpen = false)} />{/if}
{#if shownLine && !active}<LineView {world} line={shownLine} spend={spendPart} back={() => (lineOpen = null)} />{/if}
{#if active}
  <LifeScreen life={active.life} purpose={active.purpose} complete={completeLife} />
  {#if clutch}<Hatch session={active} {world} {clutch} {settle} back={backToMap} />{/if}
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
  .preview, .big { font-size: 32px; }
  .letters { align-items: baseline; }
  .reason { color: var(--dim); }
  .label.yours { color: var(--gold); }
  .label.yours::before { content: ''; display: inline-block; width: 8px; height: 8px; margin-right: 4px; background: var(--gold); }
  .label.yours .big { color: var(--gold); }
  .line { color: var(--gold); }
</style>
