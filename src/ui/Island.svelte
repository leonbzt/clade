<script lang="ts">
  import { FORMS, tierOf } from '../data/genes';
  import { KIND_NAMES } from '../data/island';
  import { TILE_PX } from '../data/look';
  import { NICHES, NICHE_AT } from '../data/niches';
  import { effScore, why } from '../sim/garden';
  import { canGrowIn, runCost, type Game } from '../sim/game';
  import { beginRun } from '../sim/play';
  import { IslandPainter, dimExcept, markYours, outlinePatch } from '../view/island';
  import { S, bump, ui } from './state.svelte';
  import TierList from './TierList.svelte';
  import Clade from './Clade.svelte';

  let cv: HTMLCanvasElement;
  let painter: IslandPainter | null = null, painted: Game | null = null;
  let hover = $state(-1), error = $state('');

  const sprouts = $derived.by(() => { ui.v; return S.game.sprouts.map((s) => ({ ...s, name: S.game.species[s.sp].name, cost: runCost(S.game, s) })); });
  const choosing = $derived(sprouts.find((s) => s.id === ui.choosing) ?? null);
  const news = $derived.by(() => { ui.v; return S.game.news.slice(0, 12); });

  /** What a patch holds, per layer. */
  const info = $derived.by(() => {
    ui.v;
    const g = S.game, p = hover >= 0 ? g.hab.patches[hover] : null;
    if (!p) return null;
    const life = g.garden.life[p.id];
    const layers = [0, 1, 2].filter((l) => life.slots[l]).map((l) => {
      const slot = life.slots[l]!, total = slot.reduce((a, e) => a + e.g, 0), n = NICHE_AT[p.kind][l];
      return {
        niche: NICHES[n].name, fill: life.cap[l] ? total / life.cap[l] : 0, light: life.light[l],
        who: [...slot].sort((a, b) => b.g - a.g).slice(0, 3).map((e) => ({ sp: g.species[e.sp], share: total ? e.g / total : 0, eff: Math.round(effScore(g.species[e.sp], p, life, l)), why: why(g.species[e.sp], life, l) })),
      };
    });
    return { p, kind: KIND_NAMES[p.kind], layers, water: life.water, nutrient: life.nutrient };
  });

  $effect(() => {
    ui.v; hover; ui.choosing; ui.patch;
    draw();
  });

  function draw() {
    if (!cv) return;
    const g = S.game, ctx = cv.getContext('2d')!;
    if (!painter) painter = new IslandPainter(g);
    if (painted !== g) { painter.setGame(g); painted = g; }
    cv.width = painter.w; cv.height = painter.h;
    painter.paint(ctx);
    markYours(ctx, g);
    if (choosing) {
      dimExcept(ctx, g, (p) => canGrowIn(g, choosing.form, p));
      if (ui.patch >= 0) outlinePatch(ctx, g, ui.patch, '#ffe36b', 'rgba(255,227,107,0.15)');
    }
    for (const s of g.sprouts) {
      const p = g.hab.patches[s.patch];
      if (!p) continue;
      const x = (p.x + 0.5) * TILE_PX, y = (p.y + 0.5) * TILE_PX - 7; // a little sprout: stem and two leaves
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = s.id === ui.choosing ? '#ffe36b' : '#b5f07a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + d * 3, y, 3.2, 1.8, d * -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    }
    if (hover >= 0) outlinePatch(ctx, g, hover, 'rgba(255,255,255,0.85)');
  }

  function patchAt(e: MouseEvent): number {
    const r = cv.getBoundingClientRect(), g = S.game;
    const tx = Math.floor(((e.clientX - r.left) / r.width) * g.isl.w), ty = Math.floor(((e.clientY - r.top) / r.height) * g.isl.h);
    return tx < 0 || ty < 0 || tx >= g.isl.w || ty >= g.isl.h ? -1 : g.hab.of[ty * g.isl.w + tx];
  }
  function click(e: MouseEvent) {
    const p = patchAt(e);
    if (choosing && p >= 0 && canGrowIn(S.game, choosing.form, p)) ui.patch = p;
  }
  function choose(id: number, patch: number) { ui.choosing = id; ui.patch = patch; error = ''; }
  function go() {
    const r = beginRun(S.game, ui.choosing, ui.patch);
    if (typeof r === 'string') { error = r; return; }
    S.run = r; ui.choosing = -1; ui.screen = 'run'; bump();
  }
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<main>
  <section class="map">
    <canvas bind:this={cv} onmousemove={(e) => (hover = patchAt(e))} onmouseleave={() => (hover = -1)} onclick={click}></canvas>
    <div class="hover panel">
      {#if info}
        <div class="row"><b>{info.kind}</b><span class="muted">{info.p.tiles.length} tiles · water {info.water.toFixed(2)} · nutrient {info.nutrient.toFixed(2)}</span></div>
        {#each info.layers as L}
          <div class="layer">
            <span class="muted">{L.niche}: {pct(Math.min(1, L.fill))} full{L.light < 0.95 ? `, light ${pct(L.light)}` : ''}</span>
            {#each L.who as w}<span class="chip"><span class="dot" style:background={w.sp.color}></span>{w.sp.name} {pct(w.share)} · {w.eff} {tierOf(w.eff)}{w.why ? ` (${w.why})` : ''}</span>{/each}
          </div>
        {/each}
      {:else}<span class="muted">Hover a patch to see who holds it. Your lines are the bright colours.</span>{/if}
    </div>
    <TierList />
  </section>

  <aside>
    <div class="panel">
      <h2>Sprouts ({sprouts.length}/3)</h2>
      {#if !sprouts.length}<p class="muted">The garden throws up sprouts where your lines hold grams.</p>{/if}
      {#each sprouts as s (s.id)}
        <div class="card click" class:on={s.id === ui.choosing} role="button" tabindex="0" onclick={() => choose(s.id, s.patch)} onkeydown={(e) => e.key === 'Enter' && choose(s.id, s.patch)}>
          <div class="row"><b>{FORMS[s.form].name} of {s.name}</b><span class="muted">{s.cost ? `${s.cost / 1000} k` : 'free'}</span></div>
          <div class="muted">{s.note}</div>
        </div>
      {/each}
      {#if choosing}
        <div class="go">
          {#if ui.patch >= 0}
            {@const p = S.game.hab.patches[ui.patch]}
            <p>Grow it in <b>{NICHES[NICHE_AT[p.kind][FORMS[choosing.form].layer]].name}</b> ({p.tiles.length} tiles). Click the map for another patch.</p>
          {:else}<p>Click a lit patch on the map.</p>{/if}
          <button class="primary" disabled={ui.patch < 0 || S.game.biomass < choosing.cost} onclick={go}>Start the run</button>
          <button onclick={() => (ui.choosing = -1)}>Cancel</button>
          {#if error}<p class="down">{error}</p>{/if}
        </div>
      {/if}
    </div>
    <div class="panel"><h2>Your clade</h2><Clade /></div>
    <div class="panel news">
      <h2>News</h2>
      {#each news as n}<p class:big={n.big}>{n.text}</p>{/each}
    </div>
  </aside>
</main>

<style>
  main { display: flex; gap: 14px; padding: 12px 16px; align-items: flex-start; flex-wrap: wrap; }
  .map { flex: 1 1 640px; max-width: 980px; display: flex; flex-direction: column; gap: 8px; }
  .map canvas { width: 100%; cursor: pointer; }
  aside { width: 330px; display: flex; flex-direction: column; gap: 10px; }
  .hover { min-height: 52px; font-size: 12.5px; }
  .layer { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 3px; }
  .go { margin-top: 6px; border-top: 1px solid var(--line); padding-top: 6px; }
  .news p { font-size: 12px; color: var(--muted); margin: 2px 0; }
  .news p.big { color: var(--text); }
</style>
