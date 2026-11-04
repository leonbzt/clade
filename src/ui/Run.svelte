<script lang="ts">
  // The run screen: the stand growing live in the 2D low-poly look, steered by clicks; the saplings' cards; winter's
  // pick of the founder; the release after the last year. Space pauses, Tab cycles the saplings, 1/2/3 set the speed.
  import { onMount } from 'svelte';
  import { ATTRS, FORMS, tierOf } from '../data/genes';
  import { NICHES, PRESSURES } from '../data/niches';
  import { GROUND, STAND } from '../data/run';
  import { cancelRun } from '../sim/game';
  import { measure } from '../sim/run/plant';
  import { advance, found, runScore, tickRate, yearTicks } from '../sim/run/run';
  import { camFor, drawRun, newView, toCanvas, toWorld, type View } from '../view/side';
  import { act, cutAt, hoverAt, type Hover } from './aim';
  import { S, bump, ui } from './state.svelte';
  import Stats from './Stats.svelte';
  import Genes from './Genes.svelte';
  import Release from './Release.svelte';

  const r = S.run!;
  let cv: HTMLCanvasElement, view: View | null = null, mouse: { x: number; y: number } | null = null, acts = 0;
  let rv = $state(0), paused = $state(false), speed = $state(1), hover = $state<Hover | null>(null), tip = $state({ x: 0, y: 0 });

  /** A snapshot of the run for the template (the run itself is a plain object, not reactive). */
  const v = $derived.by(() => {
    rv;
    const cam = camFor(r), lab = (x: number, y: number) => { const c = toCanvas(cam, x, y); return `left:${c.u * 100}%;top:${c.v * 100}%`; };
    return {
      phase: r.phase, year: r.year, sel: r.sel, dry: r.plot.dry, done: r.t / yearTicks(r.form), history: [...r.history],
      saps: r.stand.map((s, k) => {
        const p = s.plant, b = measure(p, r.plot), end = r.last?.[k];
        return { grams: end?.grams ?? b.biomass, score: end?.score ?? runScore(r, b.raw, p.genes), raw: b.raw, genes: [...p.genes], changed: s.changed, sport: s.sport,
          e: p.energy, w: p.water, n: p.nutrient, wilt: p.flow.wilting, fed: !!p.feed, at: lab(p.x, GROUND + 14) };
      }),
      natives: r.plot.neighbours.map((nb) => ({ name: nb.name, at: lab(nb.x, GROUND - nb.h * r.plot.grow - 10) })),
    };
  });
  const cur = $derived(v.saps[v.sel]);
  const change = (s: { changed: number[]; sport: boolean }) =>
    s.changed.map((i, k) => `${ATTRS[i].name} ${k ? '−1' : s.sport ? '+2' : '+1'}`).join(', ');

  onMount(() => {
    view = newView(cv);
    if (import.meta.env.DEV) Object.assign(globalThis, { clade: { r, view, drawRun } }); // for timing in the console
    let raf = 0, last = 0, acc = 0, lastRv = 0, drawn = 0;
    const loop = (now: number) => {
      const dt = last ? Math.min(100, now - last) : 0;
      last = now;
      if (!paused && r.phase === 'grow') {
        acc += (dt / 1000) * tickRate(r.form) * speed;
        const n = Math.floor(acc);
        if (n > 0) { acc -= n; const ph = r.phase; advance(r, n); if (r.phase !== ph) { rv++; aimAgain(); } }
      }
      if (now - lastRv > 250) { lastRv = now; rv++; aimAgain(); }
      if (view && now - drawn >= 33) { drawn = now; drawRun(view, r, hover?.aim ?? null, now / 1000, r.t + r.sel * 1e4 + acts * 1e5); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') { e.preventDefault(); paused = !paused; }
      else if (e.key === 'Tab') { e.preventDefault(); r.sel = (r.sel + (e.shiftKey ? r.stand.length - 1 : 1)) % r.stand.length; rv++; aimAgain(); }
      else if (e.key >= '1' && e.key <= '3') speed = STAND.speeds[+e.key - 1];
    };
    addEventListener('keydown', key);
    return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); };
  });

  const radius = () => 9 / (r.form === 'moss' ? 2 : 1);
  function aimAgain() { hover = mouse ? hoverAt(r, mouse.x, mouse.y, radius()) : null; }
  function move(e: MouseEvent) {
    const b = cv.getBoundingClientRect();
    mouse = toWorld(camFor(r), (e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height);
    tip = { x: e.clientX - b.left, y: e.clientY - b.top };
    aimAgain();
  }
  function leave() { mouse = null; hover = null; }
  function click() { if (hover && act(r, hover)) { acts++; rv++; aimAgain(); } }
  function rightClick(e: MouseEvent) { e.preventDefault(); if (hover && cutAt(r, hover)) { acts++; rv++; aimAgain(); } }
  function pickFounder(k: number) { found(r, k); acts++; rv++; }
  function abandon() { if (!confirm('Abandon the run? The sprout and the biomass come back.')) return; cancelRun(S.game); S.run = null; ui.screen = 'island'; bump(); }
  const season = (t: number) => (t < 0.25 ? 'spring' : t < 0.6 ? 'summer' : 'autumn');
</script>

<main class="run">
  <section class="view">
    <div class="bar row">
      <span><b>{FORMS[r.form].name}</b> · year {v.year}/{FORMS[r.form].years} · {v.phase === 'grow' ? season(v.done) : v.phase === 'winter' ? 'winter' : 'the end'}</span>
      <span class="year"><i style="width:{Math.min(100, v.done * 100)}%"></i></span>
      <span>
        <button class:on={paused} onclick={() => (paused = !paused)} title="Space">{paused ? 'paused' : 'pause'}</button>
        {#each STAND.speeds as s, i}<button class:on={speed === s && !paused} onclick={() => { speed = s; paused = false; }} title="key {i + 1}">{s}×</button>{/each}
        <button onclick={abandon}>abandon</button>
      </span>
    </div>
    <div class="stage">
      <canvas bind:this={cv} onmousemove={move} onmouseleave={leave} onclick={click} oncontextmenu={rightClick} class:aim={hover && hover.verb !== 'none'}></canvas>
      {#each v.natives as nb}<span class="label native" style={nb.at}>{nb.name}</span>{/each}
      {#each v.saps as s, k}<span class="label sap" class:sel={k === v.sel} style={s.at}>{k + 1}</span>{/each}
      {#if v.dry}<div class="banner">Dry spell: the moss is dormant</div>{/if}
      {#if v.phase === 'winter'}<div class="banner">Winter: pick the founder of next year's stand</div>{/if}
      {#if hover && (hover.text || hover.cut)}
        <div class="tip" style="left:{tip.x + 14}px;top:{tip.y + 12}px">
          {#if hover.text}<div class:bad={!hover.ok}>{hover.text}</div>{/if}
          {#if hover.cut}<div class="muted">{hover.cut}</div>{/if}
        </div>
      {/if}
    </div>
    <p class="muted">Click the soil: send a root · the sky: lean a shoot · a shoot: feed it · right-click: cut · Tab: next sapling · Space: pause</p>
    {#if v.phase === 'end'}{#key v.sel}<Release {r} />{/key}{/if}
  </section>

  <aside>
    <div class="panel">
      <h2>The stand</h2>
      {#each v.saps as s, k}
        <div class="card click" class:on={k === v.sel} role="button" tabindex="0" onclick={() => { r.sel = k; rv++; }} onkeydown={(e) => e.key === 'Enter' && ((r.sel = k), rv++)}>
          <div class="row"><b>Sapling {k + 1}</b><span>{s.grams.toFixed(0)} g · <span class="tier">{tierOf(s.score)}</span> {s.score}</span></div>
          <div class="row muted"><span class:gold={s.sport}>{s.changed.length ? change(s) : 'the founder'}</span><span>{s.wilt ? 'wilting · ' : ''}{s.fed ? 'fed · ' : ''}n {s.n.toFixed(1)}</span></div>
          {#if v.phase === 'winter'}<button class="primary" onclick={(e) => { e.stopPropagation(); pickFounder(k); }}>Found next year</button>{/if}
        </div>
      {/each}
      {#if v.phase === 'end'}<p class="muted">The last year is over: pick the sapling to release.</p>{/if}
    </div>
    <div class="panel">
      <h2>Sapling {v.sel + 1}</h2>
      <p class="muted">energy {cur.e.toFixed(1)} · water {cur.w.toFixed(1)} · nutrient {cur.n.toFixed(1)} · {PRESSURES[NICHES[r.niche].pressure].icon} {NICHES[r.niche].name}</p>
      <Stats raw={cur.raw} form={r.form} niche={r.niche} genes={cur.genes} />
    </div>
    <div class="panel"><h2>Attributes</h2><Genes genes={cur.genes} changed={cur.changed} /></div>
    {#if v.history.length}
      <div class="panel"><h2>Years</h2>{#each v.history as h}<div class="row muted"><span>year {h.year}</span><span>{h.results.map((x) => x.score).join(' · ')}</span></div>{/each}</div>
    {/if}
  </aside>
</main>

<style>
  main { display: flex; gap: 14px; padding: 12px 16px; align-items: flex-start; flex-wrap: wrap; }
  .view { flex: 1 1 640px; max-width: 980px; display: flex; flex-direction: column; gap: 8px; }
  .stage { position: relative; }
  .stage canvas { width: 100%; image-rendering: pixelated; cursor: default; border-radius: 0; }
  .stage canvas.aim { cursor: crosshair; }
  .label { position: absolute; transform: translate(-50%, -50%); font-size: 12px; color: #cfd9de; text-shadow: 1px 1px 0 var(--ink); pointer-events: none; white-space: nowrap; }
  .label.sap { font-weight: 700; color: #9fb2bd; }
  .label.sap.sel { color: var(--gold); }
  .banner { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); background: rgba(7, 14, 17, 0.9); border: 2px solid #7d8f98; padding: 3px 10px; font-weight: 700; pointer-events: none; }
  .tip { position: absolute; background: rgba(7, 14, 17, 0.94); border: 2px solid #7d8f98; padding: 4px 8px; font-size: 13px; pointer-events: none; max-width: 300px; z-index: 2; }
  .tip .bad { color: var(--bad); }
  .bar { flex-wrap: wrap; font-size: 14px; }
  .year { flex: 1; min-width: 80px; height: 8px; background: #1b2a30; border: 2px solid var(--ink); }
  .year i { display: block; height: 100%; background: var(--gold); }
  .tier { color: var(--gold); font-weight: 700; }
  aside { width: 330px; display: flex; flex-direction: column; gap: 10px; }
</style>
