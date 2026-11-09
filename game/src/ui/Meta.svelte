<!-- Living patch map and the Life launcher (the equipment view, 20C). -->
<script lang="ts">
  import { HABITATS } from '../data/habitats';
  import { HUNT, PLANS, type PlanId } from '../data/life';
  import { boardForPatch, nextBoard } from '../sim/door';
  import { launchBodies, launchPatches } from '../sim/sea-life';
  import { headlineText } from '../sim/sea-news';
  import { makeMap, type View } from '../view/sea-map';
  import { historyPaths, linePatches, speciesColour, speciesKey } from '../view/sea-map-data';
  import { feedsAs } from '../sim/feeding';
  import { PLAN_IDS } from '../data/life';
  import { bump, ctx, ui } from './meta.svelte';
  import Equip from './Equip.svelte';
  import Lines from './Lines.svelte';
  import LineView from './LineView.svelte';
  import Placement from './Placement.svelte';
  import Replay from './Replay.svelte';
  import Tree from './Tree.svelte';
  import { changes } from './replay';
  import { toggleDev } from './dev';
  import type { PresetId, Rows } from '../data/body';

  let cv: HTMLCanvasElement | undefined = $state();
  let patchList: HTMLDetailsElement | undefined = $state();
  let map = $state.raw<ReturnType<typeof makeMap> | null>(null);
  let view = $state<View>('holder'), selectedLine = $state<string | undefined>();
  let body: PlanId = $state('worm'), usingDesign = $state(false);
  const g = $derived((ui.tick, ctx.save.sea));
  const eligible = $derived((ui.tick, launchPatches(ctx.save)));
  const bodies = $derived((ui.tick, launchBodies(ctx.save)));
  const patch = $derived(ui.patch === null ? null : g.patches[ui.patch]);
  const board = $derived((ui.tick, patch ? boardForPatch(g, patch.id) : null));
  const continuation = $derived((ui.tick, ctx.save.continuation));
  const pending = $derived((ui.tick, ctx.save.pending));
  const releaseChoices = $derived(pending ? [pending.patch, ...g.patches[pending.patch].nb] : []);
  const stocks = $derived((ui.tick, patch ? [{ name: 'Mats', value: patch.mats }, { name: 'Detritus', value: patch.rot }, { name: 'Oxygen', value: patch.oxygen }] : []));
  const populations = $derived((ui.tick, patch ? g.species.map((sp, k) => ({ sp, pop: patch.pop[k] })).filter((e) => e.pop >= 1) : []));

  const activeSpecies = $derived(ui.feedback?.species ?? selectedLine ?? continuation?.species);
  const activeLine = $derived(g.species.find((sp) => sp.id === activeSpecies));
  const distribution = $derived((ui.tick, linePatches(g, activeSpecies)));
  const history = $derived((ui.tick, patch ? historyPaths(g, patch) : []));
  const replayFrame = $derived(ui.replay && ui.replayFrame >= 0 ? ui.replay.frames[ui.replayFrame] : null);
  const mapVisible = $derived(ui.open && !ui.niche && !ui.menu && !ui.clutch && !ui.gain && !ui.line && !ui.tree && !ui.away && !ui.notice);
  $effect(() => {
    if (!cv) return;
    const renderer = makeMap(cv); renderer.setSea(g); map = renderer;
    return () => { map = null; };
  });
  $effect(() => {
    void ui.tick;
    if (!map) return;
    map.setReplay(replayFrame && ui.replay ? { species: g.species.findIndex((sp) => sp.id === ui.replay!.species), pop: replayFrame.pop } : null);
    map.setView(view); map.updateHerds();
    map.mark(ui.placing ? releaseChoices : replayFrame ? [] : eligible, ui.patch ?? ui.feedback?.patch ?? null, continuation?.patch ?? null,
      replayFrame ? replayFrame.pop.flatMap((n, k) => n >= 1 ? [k] : []) : distribution, ui.placing);
    map.draw();
  });
  $effect(() => {
    if (!map || !ui.feedback || ui.replay) return;
    map.pulse(ui.feedback.patch, [255, 224, 51]);
    cv?.closest('#meta')?.scrollTo(0, 0);
  });
  $effect(() => {
    if (!map || !ui.replay || !replayFrame) return;
    const sp = g.species.find((sp) => sp.id === ui.replay!.species)!;
    for (const c of changes(ui.replay, ui.replayFrame)) map.pulse(c.patch, c.grew ? speciesColour(sp) : [255, 70, 55]);
    cv?.closest('#meta')?.scrollTo(0, 0);
  });
  const feedbackPop = $derived((ui.tick, ui.feedback ? g.patches[ui.feedback.patch].pop[g.species.findIndex((sp) => sp.id === ui.feedback!.species)] ?? 0 : 0));
  const feedbackName = $derived(ui.feedback ? g.species.find((sp) => sp.id === ui.feedback!.species)?.name ?? ui.feedback.species : '');
  $effect(() => {
    if (!map || !mapVisible) return;
    const renderer = map; let frame = 0, last = 0;
    const draw = (now: number) => { if (now - last >= 32) { renderer.draw(); last = now; } frame = requestAnimationFrame(draw); };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  });
  function tapMap(e: MouseEvent) {
    if (replayFrame) { ctx.skipReplay(); return; }
    const id = map?.patchAt(e.clientX, e.clientY) ?? -1;
    if (id >= 0) openPatch(id);
  }
  function openPatch(id: number) {
    if (ui.placing && !releaseChoices.includes(id)) return;
    ui.patch = id; ui.hab = g.patches[id].ground; ui.niche = null;
  }
  function backToMap() { ui.patch = null; ui.hab = null; ui.niche = null; }
  function live(as: PlanId, shared = false) {
    body = as; usingDesign = shared;
    ui.niche = continuation?.plan === as ? continuation.role : as === 'worm' ? 'burrower' : as === 'swimmer' ? 'predator' : 'grazer';
  }
  const plan = $derived<PlanId>(body);
  const line = $derived((ui.tick, ctx.save.lines[plan]));
  const design0 = $derived<Rows | undefined>(usingDesign && ui.design?.body === plan ? ui.design.rows : undefined);
  const equipPreset = $derived<PresetId | undefined>(plan === 'swimmer' ? 'hunter' : ui.niche === 'grazer' ? 'sweeper' : ui.niche === 'burrower' ? 'digger' : undefined);
  const equipContext = $derived(patch && board ? `Patch ${patch.id + 1} · ${HABITATS[patch.ground].name}. ${nextBoard(board)}${plan === 'swimmer' ? ` Lurk a turn: prey don't notice you, and your next swim goes ${HUNT.ambush}× as far. Frenzy: +1 speed for each catch in a row.` : ''}` : '');
  function start(d: Rows) { if (ui.patch !== null) ctx.start(ui.patch, plan, d); }
</script>

{#if ui.saveError}
  <aside class="saveWarning" role="alert"><p>{ui.saveError}</p><button onclick={() => ctx.retrySave()}>Retry saving</button></aside>
{/if}
{#if ui.open}
<div id="meta" class="panel" hidden={!mapVisible}>
  <div class="metaTop"><h2>Clade</h2><span class="gen">Gen {replayFrame?.gen ?? (ui.tick, g.gen)}</span><button class="small" disabled={!!pending || !!replayFrame} onclick={() => { ctx.skip(); bump(); }}>Skip +10</button><button class="small" disabled={!!replayFrame} onclick={() => (ui.menu = true)}>Menu</button>{#if import.meta.env.DEV}<button class="small" onclick={toggleDev}>Dev</button>{/if}</div>
  {#if ui.feedback && !replayFrame}
    <aside class="returnFeedback" role="status">
      {#if ui.feedback.gain}<p><b>{ui.feedback.gain}</b></p>{/if}
      <p>{ui.feedback.eggs > 0 ? `${ui.feedback.eggs} eggs released · ${feedbackName} · patch ${ui.feedback.patch + 1}.` : 'No new eggs released. Your previous continuation remains available; before founding, retry any patch.'}</p>
      <p>Current population of this line in that patch: {Math.round(feedbackPop)} after two sea generations. • marks its current occupied patches, including earlier populations.</p>
      <button class="small" onclick={() => { selectedLine = ui.feedback!.species; ui.feedback = null; }}>Dismiss</button>
    </aside>
  {/if}
  <div class="mapViews" aria-label="Map view" hidden={!!replayFrame}>
    {#each [['holder', 'Population'], ['mats', 'Mats'], ['oxygen', 'Oxygen'], ['hunters', 'Hunters']] as [id, name]}
      <button class="small" class:on={view === id} aria-pressed={view === id} onclick={() => view = id as View}>{name}</button>
    {/each}
  </div>
  <canvas bind:this={cv} class="isle" onclick={tapMap} aria-label="Living sea patches; choose a patch below for keyboard access"></canvas>
  {#if replayFrame}
    <Replay />
  {:else if ui.placing && pending}
    <Placement />
  {:else}
  <section class="playNext" aria-labelledby="playNextTitle">
    <h3 id="playNextTitle">Play next</h3>
    {#if continuation}
      <div class="habList">
        {#each eligible as id}
          <button class="habBtn" onclick={() => openPatch(id)}><b>Patch {id + 1} · {HABITATS[g.patches[id].ground].name}</b><small>{id === continuation.patch ? 'Last clutch' : 'Neighbour'}</small></button>
        {/each}
      </div>
    {:else}
      <p class="mapKey">Every patch is available for your first worm Life.</p>
      <button onclick={() => { if (patchList) { patchList.open = true; patchList.querySelector('button')?.focus(); } }}>Choose a founding patch</button>
    {/if}
  </section>
  <p class="mapKey">White: selected · gold: last clutch · green: eligible · •: current line. Tap water patches to inspect.</p>
  <p class="mapKey">{view === 'holder' ? 'Fill: dominant prey’s colour; brighter means more prey. Moving bars: animals; white tip: capture tools. Worms are long, trilobites broad; names and keys are below.' : view === 'mats' ? 'Green brightness: mats, 0–70+.' : view === 'oxygen' ? 'Red → blue: oxygen, 0–80+.' : 'Red brightness: hunters, 0–28+. Hunting comes from capture parts.'}</p>
  {#if activeLine}<p class="mapKey">{speciesKey(activeLine)}: current line in patches {distribution.map((id) => id + 1).join(', ') || 'none (continuation still available)'}. These are aggregate populations, including earlier clutches.</p>{/if}
  <details class="mapLegend"><summary>Species key</summary>{#each g.species.filter((_sp, k) => g.patches.some((p) => p.pop[k] >= 1)) as sp}
    <p><i style:background={`rgb(${speciesColour(sp).join(',')})`}></i>{speciesKey(sp)}{feedsAs(sp).hunt ? ' · hunter' : ''}{!sp.plan || !PLAN_IDS.includes(sp.plan) ? ' · sea-only, generic marker' : ''}</p>
  {:else}<p>No animals; no animal markers.</p>{/each}</details>
  <p class="pitch">{continuation ? `Your last successful clutch is in patch ${continuation.patch + 1}. Start there or in a direct neighbour; retries remain available even after extinction.` : 'The sea has no animals yet. Choose a patch and found it with your first worm’s eggs.'}</p>
  <details bind:this={patchList} class="patchList"><summary>Named patches · {eligible.length} eligible</summary><div class="habList">
    {#each [...g.patches].sort((a, b) => Number(eligible.includes(b.id)) - Number(eligible.includes(a.id)) || a.id - b.id) as p}
      <button class="habBtn" onclick={() => openPatch(p.id)}><b>Patch {p.id + 1} · {HABITATS[p.ground].name}</b><small>{eligible.includes(p.id) ? 'eligible' : 'outside clutch range'}</small></button>
    {/each}
  </div></details>
  <Lines />
  <h3>News</h3>
  <ul class="news">{#each (ui.tick, ctx.save.news.slice(0, 8)) as n}<li class:yours={g.species[n.sp].line} class:lineEvent={g.species[n.sp].id === activeSpecies}>{headlineText(g, n)}</li>{:else}<li><small>No ecological headlines yet.</small></li>{/each}</ul>
  {/if}
</div>
{/if}

{#if mapVisible && patch && board && !ui.placing}
<div class="metaWrap patchWrap"><div class="panel habCard">
  <div class="metaTop"><h2>{board.name}</h2><button class="small" onclick={backToMap}>Map</button></div>
  {#if !ui.niche}
    <p class="pitch">{eligible.includes(patch.id) ? continuation?.patch === patch.id ? 'Your last successful clutch: continue here or in a direct neighbour.' : continuation ? 'Direct neighbour of your last clutch: you can continue here.' : 'Founding patch: your first Life is a worm.' : 'Outside the last clutch’s direct neighbours. Descendant populations do not make this a launch point.'}</p>
    <div class="habStocks">
      {#each stocks as b}
        <span>{b.name}</span><div class="habStock"><i style:width={`${b.value}%`}></i></div><small>{Math.round(b.value)}</small>
      {/each}
    </div>
    <p class="pitch next"><b>Next board:</b> {nextBoard(board)}. A few food spots near the start are protected.</p>
    <h3>Populations here</h3>
    {#each populations as e}<button class="populationKey" onclick={() => selectedLine = e.sp.id}><i style:background={`rgb(${speciesColour(e.sp).join(',')})`}></i>{speciesKey(e.sp)} · {Math.round(e.pop)}{feedsAs(e.sp).hunt ? ' · hunter' : ''}{!e.sp.plan || !PLAN_IDS.includes(e.sp.plan) ? ' · sea-only, generic marker' : ''}</button>{:else}<p class="note">No animals here.</p>{/each}
    <p class="note">Current line in patches: {distribution.map((id) => id + 1).join(', ') || 'none'}. Aggregate body/diet populations; not individual ancestry. Tap a population name to highlight its distribution.</p>
    <svg class="patchHistory" viewBox="0 0 300 74" role="img" aria-label="Recorded stock and prey history">{#each history as h}<polyline points={h.points} fill="none" stroke={h.colour} stroke-width="2" />{/each}</svg>
    <p class="mapKey">Recorded generations {Math.max(0, g.gen - 59)}–{g.gen}. {#each history as h}<span style:color={h.colour}>{h.name} 0–{Math.round(h.scale)} </span>{/each}</p>
    {#each bodies as as}<button class="liveBtn" disabled={!eligible.includes(patch.id) || !!pending} onclick={() => live(as)}>Live as {PLANS[as].name.toLowerCase()}</button>{/each}
    {#if ui.design}
      <button class="liveBtn" disabled={!eligible.includes(patch.id) || !bodies.includes(ui.design.body) || !!pending} onclick={() => live(ui.design!.body, true)}>Use the pasted {PLANS[ui.design.body].name.toLowerCase()} design</button>
      {#if !bodies.includes(ui.design.body)}<p class="note">{continuation ? 'This lineage is locked: its recipe is under Your lines.' : 'Found the sea with a worm before using this body.'}</p>{/if}
    {/if}
    <h3>News here</h3><ul class="news">{#each (ui.tick, ctx.save.news.filter((n) => n.patches.includes(patch.id)).slice(0, 6)) as n}<li>{headlineText(g, n)}</li>{:else}<li><small>Quiet so far.</small></li>{/each}</ul>
  {/if}
</div></div>
{/if}

{#if ui.open && patch && board && ui.niche}
  {#key `${plan}${usingDesign}`}<Equip {plan} line={line} species={line?.species} context={equipContext} preset={equipPreset} design={design0} onstart={start} onclose={() => (ui.niche = null)} />{/key}
{/if}

{#if ui.open && ui.line && ctx.save.lines[ui.line]}
  {#key ui.line}<LineView plan={ui.line} />{/key}
{/if}

{#if ui.open && ui.tree && !ui.line}<Tree />{/if}

{#if ui.notice}
<div class="metaWrap"><div class="panel habCard"><h2>{ui.notice.title}</h2><p class="pitch">{ui.notice.text}</p><button class="go" onclick={() => (ui.notice = null)}>Continue</button></div></div>
{/if}
{#if ui.away}
<div class="metaWrap"><div class="panel habCard">
  <h2>While you were away</h2><p class="pitch">{ui.away.gens} generations passed in the sea.</p>
  <ul class="news">{#each ui.away.news.slice(0, 10) as n}<li>{headlineText(g, n)}</li>{:else}<li><small>No ecological headlines.</small></li>{/each}</ul>
  <button class="go" onclick={() => (ui.away = null)}>Back to the sea</button>
</div></div>
{/if}
<style>
  .playNext { display: grid; gap: 6px; }
  .playNext .habList { grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); }
  .playNext button { min-width: 0; overflow-wrap: anywhere; }
  .saveWarning { position: fixed; z-index: 100; top: 0; left: 0; right: 0; padding: 8px; background: #38231e; color: #ffe5c4; font-size: 14px; }
  .saveWarning p { margin: 0 0 4px; }
</style>
