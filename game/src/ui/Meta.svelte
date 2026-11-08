<!-- Living patch map and the existing Life loadout. -->
<script lang="ts">
  import { HABITATS } from '../data/habitats';
  import { HUNT, MAX_VERBS, PARTS, PLANS, RULE, STYLES, STYLE_VERBS, VERBS, VERB_IDS, VERB_PART, type GrazerId, type PlanId, type StyleId, type VerbId } from '../data/life';
  import { boardForPatch, nextBoard } from '../sim/door';
  import { formFor, launchBodies, launchPatches } from '../sim/sea-life';
  import { headlineText } from '../sim/sea-news';
  import { newLife, partsFor, startParts } from '../sim/life';
  import { makeMap, type View } from '../view/sea-map';
  import { historyPaths, linePatches, speciesColour, speciesKey } from '../view/sea-map-data';
  import { feedsAs } from '../sim/feeding';
  import { PLAN_IDS } from '../data/life';
  import { bump, ctx, ui } from './meta.svelte';

  let cv: HTMLCanvasElement | undefined = $state();
  let map = $state.raw<ReturnType<typeof makeMap> | null>(null);
  let view = $state<View>('holder'), selectedLine = $state<string | undefined>();
  let verbs: VerbId[] = $state([...STYLE_VERBS.digger]);
  let note = $state(''), body: PlanId = $state('worm'), carry = $state(true), usingDesign = $state(false);
  const g = $derived((ui.tick, ctx.save.sea));
  const eligible = $derived((ui.tick, launchPatches(ctx.save)));
  const bodies = $derived((ui.tick, launchBodies(ctx.save)));
  const patch = $derived(ui.patch === null ? null : g.patches[ui.patch]);
  const board = $derived((ui.tick, patch ? boardForPatch(g, patch.id) : null));
  const continuation = $derived((ui.tick, ctx.save.continuation));
  const pending = $derived((ui.tick, ctx.save.pending));
  const stocks = $derived((ui.tick, patch ? [{ name: 'Mats', value: patch.mats }, { name: 'Detritus', value: patch.rot }, { name: 'Oxygen', value: patch.oxygen }] : []));
  const populations = $derived((ui.tick, patch ? g.species.map((sp, k) => ({ sp, pop: patch.pop[k] })).filter((e) => e.pop >= 1) : []));

  const activeSpecies = $derived(ui.feedback?.species ?? selectedLine ?? continuation?.species);
  const activeLine = $derived(g.species.find((sp) => sp.id === activeSpecies));
  const distribution = $derived((ui.tick, linePatches(g, activeSpecies)));
  const history = $derived((ui.tick, patch ? historyPaths(g, patch) : []));
  const mapVisible = $derived(ui.open && !ui.niche && !ui.menu && !ui.clutch && !ui.away && !ui.notice);
  $effect(() => {
    if (!cv) return;
    const renderer = makeMap(cv); renderer.setSea(g); map = renderer;
    return () => { map = null; };
  });
  $effect(() => {
    void ui.tick;
    if (!map) return;
    map.setView(view); map.updateHerds();
    map.mark(eligible, ui.patch ?? ui.feedback?.patch ?? null, continuation?.patch ?? null, distribution);
    map.draw();
  });
  $effect(() => {
    if (!map || !ui.feedback) return;
    map.pulse(ui.feedback.patch, [255, 224, 51]);
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
    const id = map?.patchAt(e.clientX, e.clientY) ?? -1;
    if (id >= 0) openPatch(id);
  }
  function openPatch(id: number) { ui.patch = id; ui.hab = g.patches[id].ground; ui.niche = null; }
  function backToMap() { ui.patch = null; ui.hab = null; ui.niche = null; }
  const defaults = (role: string) => [...STYLE_VERBS[role === 'grazer' ? 'sweeper' : 'digger']];
  function live(as: PlanId, shared = false) {
    body = as; usingDesign = shared; carry = true; note = '';
    ui.niche = shared ? ui.design!.role : continuation?.plan === as ? continuation.role : as === 'worm' ? 'burrower' : as === 'swimmer' ? 'predator' : 'grazer';
    verbs = shared ? [...ui.design!.verbs] : roomFor(defaults(ui.niche));
  }
  const plan = $derived<PlanId>(body);
  const form = $derived((ui.tick, usingDesign ? ui.design?.form : patch && ui.niche ? formFor(ctx.save, patch.id, plan, ui.niche) : undefined));
  const formFits = $derived(!!form && PARTS[form].plans.includes(plan));
  const carried = $derived(carry && formFits ? form : undefined);
  function fits(vs: VerbId[]) {
    const parts = startParts(plan, vs, carried), l = newLife(1, plan, HABITATS[ui.hab ?? 'mud'], parts);
    return l.order.length === parts.length && new Set(parts.map((p) => PARTS[p].verb).filter(Boolean)).size <= MAX_VERBS;
  }
  /** As many of these verbs as the body has room for, in order; if none fit, the first verb that does. */
  function roomFor(vs: VerbId[]) {
    const out: VerbId[] = [];
    for (const v of vs) if (fits([...out, v])) out.push(v);
    if (!out.length) { const v = VERB_IDS.find((q) => fits([q])); if (v) out.push(v); }
    return out;
  }
  function toggle(v: VerbId) {
    note = '';
    if (verbs.includes(v)) { if (verbs.length > 1) verbs = verbs.filter((q) => q !== v); else note = 'Keep at least one verb.'; return; }
    const next = [...verbs, v];
    if (next.length > MAX_VERBS) { note = 'Three verbs at most: drop one first.'; return; }
    if (!fits(next)) { note = `No room: ${PARTS[partsFor(plan, [v])[0]].name} needs a slot your form or another verb's part already takes, or you're at three verbs.`; return; }
    verbs = next;
  }
  function pickStyle(s: StyleId) {
    verbs = roomFor([...STYLE_VERBS[s]]);
    note = STYLES[s].blurb + (verbs.length < STYLE_VERBS[s].length ? ' Your form holds a slot one of its verbs needs.' : '');
  }
  function toggleCarry() { carry = !carry; note = ''; if (ui.niche) verbs = roomFor(defaults(ui.niche)); }
  const upkeep = $derived(RULE.baseUpkeep + startParts(plan, verbs, carried).reduce((n, p) => n + PARTS[p].upkeep, 0));
  function start() { if (ui.patch !== null && ui.niche) ctx.start(ui.patch!, ui.niche, verbs, plan, carried); }
</script>

{#if ui.saveError}
  <aside class="saveWarning" role="alert"><p>{ui.saveError}</p><button onclick={() => ctx.retrySave()}>Retry saving</button></aside>
{/if}
{#if ui.open}
<div id="meta" class="panel">
  <div class="metaTop"><h2>Clade</h2><span class="gen">Gen {(ui.tick, g.gen)}</span><button class="small" disabled={!!pending} onclick={() => { ctx.skip(); bump(); }}>Skip +10</button><button class="small" onclick={() => (ui.menu = true)}>Menu</button></div>
  {#if ui.feedback}
    <aside class="returnFeedback" role="status">
      <p>{ui.feedback.eggs > 0 ? `${ui.feedback.eggs} eggs released · ${feedbackName} · patch ${ui.feedback.patch + 1}.` : 'No new eggs released. Your previous continuation remains available; before founding, retry any patch.'}</p>
      <p>Current population of this line in that patch: {Math.round(feedbackPop)} after two sea generations. • marks its current occupied patches, including earlier populations.</p>
      <button class="small" onclick={() => { selectedLine = ui.feedback!.species; ui.feedback = null; }}>Dismiss</button>
    </aside>
  {/if}
  <div class="mapViews" aria-label="Map view">
    {#each [['holder', 'Population'], ['mats', 'Mats'], ['oxygen', 'Oxygen'], ['hunters', 'Hunters']] as [id, name]}
      <button class="small" class:on={view === id} aria-pressed={view === id} onclick={() => view = id as View}>{name}</button>
    {/each}
  </div>
  <canvas bind:this={cv} class="isle" onclick={tapMap} aria-label="Living sea patches; choose a patch below for keyboard access"></canvas>
  <p class="mapKey">White: selected · gold: last clutch · green: eligible · •: current line. Tap water patches to inspect.</p>
  <p class="mapKey">{view === 'holder' ? 'Fill: dominant prey’s colour; brighter means more prey. Moving bars: animals; white tip: capture tools. Worms are long, trilobites broad; names and keys are below.' : view === 'mats' ? 'Green brightness: mats, 0–70+.' : view === 'oxygen' ? 'Red → blue: oxygen, 0–80+.' : 'Red brightness: hunters, 0–28+. Hunting comes from capture parts.'}</p>
  {#if activeLine}<p class="mapKey">{speciesKey(activeLine)}: current line in patches {distribution.map((id) => id + 1).join(', ') || 'none (continuation still available)'}. These are aggregate populations, including earlier clutches.</p>{/if}
  <details class="mapLegend"><summary>Species key</summary>{#each g.species.filter((_sp, k) => g.patches.some((p) => p.pop[k] >= 1)) as sp}
    <p><i style:background={`rgb(${speciesColour(sp).join(',')})`}></i>{speciesKey(sp)}{feedsAs(sp).hunt ? ' · hunter' : ''}{!sp.plan || !PLAN_IDS.includes(sp.plan) ? ' · sea-only, generic marker' : ''}</p>
  {:else}<p>No animals; no animal markers.</p>{/each}</details>
  <p class="pitch">{continuation ? `Your last successful clutch is in patch ${continuation.patch + 1}. Start there or in a direct neighbour; retries remain available even after extinction.` : 'The sea has no animals yet. Choose a patch and found it with your first worm’s eggs.'}</p>
  {#if continuation}<button class="go" onclick={() => openPatch(continuation.patch)}>Continue from patch {continuation.patch + 1}</button>{/if}
  <details class="patchList"><summary>Named patches · {eligible.length} eligible</summary><div class="habList">
    {#each [...g.patches].sort((a, b) => Number(eligible.includes(b.id)) - Number(eligible.includes(a.id)) || a.id - b.id) as p}
      <button class="habBtn" onclick={() => openPatch(p.id)}><b>Patch {p.id + 1} · {HABITATS[p.ground].name}</b><small>{eligible.includes(p.id) ? 'eligible' : 'outside clutch range'}</small></button>
    {/each}
  </div></details>
  <h3>News</h3>
  <ul class="news">{#each (ui.tick, ctx.save.news.slice(0, 8)) as n}<li class:yours={g.species[n.sp].line} class:lineEvent={g.species[n.sp].id === activeSpecies}>{headlineText(g, n)}</li>{:else}<li><small>No ecological headlines yet.</small></li>{/each}</ul>
</div>
{/if}

{#if ui.open && patch && board}
<div class="metaWrap patchWrap" class:loadout={!!ui.niche}><div class="panel habCard">
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
      <button class="liveBtn" disabled={!eligible.includes(patch.id) || !bodies.includes(ui.design.plan) || !!pending} onclick={() => live(ui.design!.plan, true)}>Use {ui.design.name}’s {PLANS[ui.design.plan].name.toLowerCase()} design</button>
      {#if !bodies.includes(ui.design.plan)}<p class="note">Found the sea with a worm before using this body.</p>{/if}
    {/if}
    <h3>News here</h3><ul class="news">{#each (ui.tick, ctx.save.news.filter((n) => n.patches.includes(patch.id)).slice(0, 6)) as n}<li>{headlineText(g, n)}</li>{:else}<li><small>Quiet so far.</small></li>{/each}</ul>
  {:else}
    <p class="pitch">{PLANS[plan].name} in patch {patch.id + 1}. {PLANS[plan].blurb} Parts and verbs determine feeding; diet is recorded during play.</p>
    <p class="note">{nextBoard(board)}</p>
      {#if form}
        <div class="form">
          {#if formFits}<button class="chip" class:on={carry} onclick={toggleCarry}>{carry ? 'Carrying' : 'Leaving behind'}: {PARTS[form].name}</button> <small>{PARTS[form].does} Holds the {PARTS[form].slots.join(' or ')} slot.</small>
          {:else}Your form here, {PARTS[form].name}, doesn't fit this body.{/if}
        </div>
      {/if}
      {#if plan === 'swimmer'}
        <div class="rules"><b>The hunter's rules</b><small><b>Lurk</b> a turn: prey don't notice you, and your next swim goes {HUNT.ambush}× as far.</small><small><b>Frenzy</b>: +1 speed for each catch in a row.</small></div>
      {:else}
        <h3>Verbs <span class="hint">pick 1–3 · each grows its part</span></h3>
        <div class="chips">{#each Object.keys(STYLES) as StyleId[] as s}<button class="chip" class:on={STYLE_VERBS[s].every((v) => verbs.includes(v)) && verbs.length === 2} onclick={() => pickStyle(s)}>{STYLES[s].name}</button>{/each}</div>
        <div class="pickList two">
          {#each VERB_IDS as v}
            {@const part = PARTS[VERB_PART[plan as GrazerId][v]]}
            <button class="verbCard" class:on={verbs.includes(v)} onclick={() => toggle(v)}><b>{VERBS[v].name}</b><small>{VERBS[v].does}</small><em>{part.name} · upkeep {part.upkeep} · {VERBS[v].free ? 'free' : 'your turn'}, every {VERBS[v].recharge}</em></button>
          {/each}
        </div>
        <div class="note">{note || `${verbs.length} of ${MAX_VERBS} verbs · upkeep ${upkeep} food a turn at the start.`}</div>
      {/if}
      <div class="row2"><button onclick={() => (ui.niche = null)}>Back</button><button class="go" onclick={start}>Start the Life</button></div>
  {/if}
</div></div>
{/if}

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
  .saveWarning { position: fixed; z-index: 100; top: 0; left: 0; right: 0; padding: 8px; background: #38231e; color: #ffe5c4; font-size: 14px; }
  .saveWarning p { margin: 0 0 4px; }
</style>
