<script lang="ts">
  // The run screen: the side view (animated pulses), the offers, cuts, the brood, winter and the release.
  import { onMount } from 'svelte';
  import { FORMS, tierOf } from '../data/genes';
  import { H, PULSE, W } from '../data/run';
  import { cancelRun } from '../sim/game';
  import { measure } from '../sim/run/plant';
  import { advance, autoPick, cutAt, pick, pulseTicks, runScore, springRun } from '../sim/run/run';
  import { cutPreview, subtree } from '../sim/run/verbs';
  import { camFor, drawGhost, drawOffers, drawPlant, drawPlot, toWorld } from '../view/side';
  import { S, bump, ui } from './state.svelte';
  import Stats from './Stats.svelte';
  import Genes from './Genes.svelte';
  import Brood from './Brood.svelte';
  import Release from './Release.svelte';

  const r = S.run!;
  let cv: HTMLCanvasElement;
  let rv = $state(0), hover = $state(-1), cutting = $state(false), cutNode = $state(-1), fast = $state(false);
  let pickSince = performance.now(), acc = 0, last = 0;

  const live = $derived.by(() => { rv; return measure(r.plant, r.plot).raw; });
  const hoverAfter = $derived.by(() => { rv; return hover >= 0 ? r.offers[hover]?.after ?? null : null; });
  /** A snapshot of the run for the template (the run itself is a plain object, not reactive). */
  const v = $derived.by(() => {
    rv;
    return { phase: r.phase, season: r.season, pulse: r.pulse, offers: [...r.offers], history: [...r.history], genes: [...r.plant.genes], changed: r.changed, e: r.plant.energy, w: r.plant.water, n: r.plant.nutrient };
  });
  const cutInfo = $derived.by(() => { rv; return cutNode > 0 ? cutPreview(r.plant, cutNode) : null; });
  const changed = () => { rv++; pickSince = performance.now(); };

  onMount(() => {
    let raf = 0;
    const loop = (now: number) => {
      const dt = last ? now - last : 0;
      last = now;
      if (r.phase === 'grow') {
        acc += (dt * pulseTicks(r.form)) / (PULSE.animMs / (fast ? 4 : 1));
        const n = Math.floor(acc);
        if (n > 0) { acc -= n; const ph = r.phase; advance(r, n); if (r.phase !== ph) changed(); else if (Math.random() < 0.2) rv++; }
      } else if (r.phase === 'pick' && ui.auto && now - pickSince > PULSE.autoDelayMs / (fast ? 3 : 1)) {
        choose(autoPick(r));
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  });

  function draw() {
    if (!cv) return;
    const c = cv.getContext('2d')!, cam = camFor(r.plant);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.setTransform(cam.s, 0, 0, cam.s, -cam.ox * cam.s, -cam.oy * cam.s);
    drawPlot(c, r.plot);
    drawPlant(c, r.plant);
    if (cutting && cutNode > 0) drawGhost(c, r.plant.nodes, subtree(r.plant, cutNode));
    if (r.phase === 'pick' && !cutting) drawOffers(c, r.plant, r.offers, hover, cam.s);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (r.plot.dry) { c.fillStyle = '#7a5a20'; c.font = 'bold 14px system-ui'; c.textAlign = 'left'; c.fillText('Dry spell: the moss is dormant', 12, 22); }
  }

  function at(e: MouseEvent) {
    const b = cv.getBoundingClientRect();
    return toWorld(camFor(r.plant), ((e.clientX - b.left) / b.width) * W, ((e.clientY - b.top) / b.height) * H);
  }
  function move(e: MouseEvent) {
    const p = at(e), s = camFor(r.plant).s;
    if (cutting) {
      let best = -1, bd = (10 / s) ** 2;
      r.plant.nodes.forEach((n, i) => { if (i > 0 && !n.dead && n.len > 0 && n.kind === 'shoot') { const d = (n.x - p.x) ** 2 + (n.y - p.y) ** 2; if (d < bd) { bd = d; best = i; } } });
      cutNode = best; return;
    }
    let best = -1, bd = (14 / s) ** 2;
    r.offers.forEach((o, i) => { const d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2; if (d < bd) { bd = d; best = i; } });
    hover = r.phase === 'pick' ? best : -1;
  }
  function click() {
    if (cutting) { if (cutNode > 0 && cutAt(r, cutNode)) { cutNode = -1; changed(); } return; }
    if (hover >= 0) choose(hover);
  }
  function choose(i: number) { if (pick(r, i)) { hover = -1; acc = 0; changed(); } }
  function abandon() { if (!confirm('Abandon the run? The sprout and the biomass come back.')) return; cancelRun(S.game); S.run = null; ui.screen = 'island'; bump(); }
  const cost = (o: { nutrient: number; energy: number }) => [o.nutrient ? `${o.nutrient.toFixed(1)} nutrient` : '', o.energy ? `${o.energy.toFixed(1)} energy` : ''].filter(Boolean).join(', ') || 'free';
  const bestOffer = $derived.by(() => { rv; return autoPick(r); });
</script>

<main>
  <section class="view">
    <canvas bind:this={cv} width={W} height={H} onmousemove={move} onmouseleave={() => { hover = -1; cutNode = -1; }} onclick={click} class:cut={cutting}></canvas>
    <div class="bar row">
      <span><b>{FORMS[r.form].name}</b> · season {v.season}/{FORMS[r.form].seasons} · pulse {Math.min(v.pulse + 1, PULSE.perSeason)}/{PULSE.perSeason}{v.phase === 'grow' ? ' · growing…' : ''}</span>
      <span class="muted">energy {v.e.toFixed(1)} · water {v.w.toFixed(1)} · nutrient {v.n.toFixed(1)}</span>
      <span>
        <button class:on={ui.auto} onclick={() => (ui.auto = !ui.auto)} title="pick the best previewed offer">auto</button>
        <button class:on={fast} onclick={() => (fast = !fast)}>fast</button>
        <button class:on={cutting} disabled={v.phase !== 'pick' && v.phase !== 'winter'} onclick={() => { cutting = !cutting; cutNode = -1; }}>cut</button>
        <button onclick={abandon}>abandon</button>
      </span>
    </div>
    {#if v.phase === 'brood'}<Brood {r} onpick={changed} />{/if}
    {#if v.phase === 'end'}<Release {r} />{/if}
  </section>

  <aside>
    <div class="panel">
      <h2>Offers</h2>
      {#if v.phase === 'pick'}
        {#each v.offers as o, i}
          <div class="card click" class:on={hover === i} role="button" tabindex="0" onmouseenter={() => (hover = i)} onmouseleave={() => (hover = -1)} onclick={() => choose(i)} onkeydown={(e) => e.key === 'Enter' && choose(i)}>
            <div class="row"><b>{i + 1}. {o.label}</b><span class:gold={i === bestOffer}>{o.after ? `→ ${tierOf(runScore(r, o.after))} ${runScore(r, o.after)}` : ''}</span></div>
            <div class="muted">{o.ok ? cost(o) : `can't pay: ${cost(o)}`}</div>
          </div>
        {/each}
        <button onclick={() => choose(-1)}>Let the genes decide</button>
      {:else if v.phase === 'winter'}
        <p>Winter: the leaves fell, the wood thickened. Cut if you like; spring brings leaves on the outer twigs.</p>
        <button class="primary" onclick={() => { springRun(r); cutting = false; changed(); }}>Spring</button>
      {:else if v.phase === 'grow'}<p class="muted">Growing…</p>
      {:else if v.phase === 'brood'}<p class="muted">Pick the heir below.</p>
      {:else}<p class="muted">The run is over: release it.</p>{/if}
      {#if cutting}<p class="muted">{cutInfo ? `Cut ${cutInfo.segs} segments (${cutInfo.leaves} leaves), +${cutInfo.back.toFixed(1)} nutrient${cutInfo.wakes ? `, wakes ${cutInfo.wakes} buds` : ''}${cutInfo.sprout ? ', the stump sprouts' : ''}` : 'Hover a shoot to cut it.'}</p>{/if}
    </div>
    <div class="panel"><h2>Body</h2><Stats raw={live} form={r.form} niche={r.niche} after={hoverAfter} /></div>
    <div class="panel"><h2>Genes</h2><Genes genes={v.genes} changed={v.changed} form={r.form} /></div>
    {#if v.history.length}
      <div class="panel"><h2>Seasons</h2>{#each v.history as h}<div class="row muted"><span>season {h.season}</span><span>{h.score}</span></div>{/each}</div>
    {/if}
  </aside>
</main>

<style>
  main { display: flex; gap: 14px; padding: 12px 16px; align-items: flex-start; flex-wrap: wrap; }
  .view { flex: 1 1 640px; max-width: 980px; display: flex; flex-direction: column; gap: 8px; }
  .view canvas { width: 100%; cursor: pointer; image-rendering: auto; }
  .view canvas.cut { cursor: crosshair; }
  .bar { flex-wrap: wrap; font-size: 13px; }
  aside { width: 320px; display: flex; flex-direction: column; gap: 10px; }
</style>
