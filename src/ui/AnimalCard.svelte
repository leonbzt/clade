<script lang="ts">
  // The animal you clicked: who it is, what it's doing, how full it is, and its last few events. The map follows it
  // while this card is open (when zoomed in). When it dies, the card says how.
  import { TIERS } from '../data/genes';
  import { NUM } from '../data/numbers';
  import { fit, profile } from '../sim/fit';
  import { bodyOf, tileOf } from '../sim/agents';
  import { placeName, variantName, geneText } from '../sim/variants';
  import { genomeLook } from '../view/look';
  import Specimen from './Specimen.svelte';
  import { clock } from './format';
  import { count } from '../data/units';
  import { defOf } from '../sim/variants';
  import { game, ui } from './game.svelte';

  const DOING = { look: 'looking around', walk: 'on the move', eat: 'eating', rest: 'resting, full', hunt: 'hunting' } as const;

  const card = $derived.by(() => {
    ui.v;
    const a = game.agents.find((x) => x.id === ui.follow);
    if (!a) return { gone: game.obits.find((o) => o.id === ui.follow) ?? null };
    const x = game.variants[a.v], sp = game.species[a.sp], i = tileOf(game, a), p = profile(game, a.v);
    return {
      a, sp: sp.name, spId: sp.id, perM2: a.n * (defOf(game, a.sp).animal?.stands ?? 0), kin: bodyOf(game, a.sp).kin, look: genomeLook(game, a.sp, x.genome), form: variantName(game, a.v), tier: TIERS[x.tier],
      genes: geneText(game, a.v), where: placeName(game, i), fit: Math.round(fit(game, p, i) * 100),
      age: Math.round(a.age), life: Math.round(a.life), energy: Math.round(a.e * 100),
      log: [...a.log].reverse().map((l) => ({ ...l, time: clock(l.tick, NUM.ticksPerSec) })),
    };
  });
</script>

{#if card.a}
  <div class="top">
    <Specimen look={card.look} scale={2} />
    <div>
      <h2>{card.kin ? `${card.sp}, ${card.kin}` : card.sp} #{card.a.id}</h2>
      <div class="dim small">≈ {count(card.perM2 * NUM.mass.tile)} {card.sp.toLowerCase()}, {count(card.perM2)} per m²{card.a.go ? ', walking off to settle' : ''}</div>
      <div><b style:color={card.tier.color}>{card.tier.name}</b> {card.form}</div>
      <div class="dim small">{card.genes}</div>
    </div>
  </div>
  <p>Now: <b>{DOING[card.a.doing]}</b> {card.where} <span class="dim">(fit here {card.fit}%)</span></p>
  <div class="row"><span>Energy</span><span class="bar"><span style:width="{card.energy}%"></span></span><span>{card.energy}%</span></div>
  <div class="row"><span>Age</span><span class="bar"><span class="age" style:width="{Math.min(100, (100 * card.age) / card.life)}%"></span></span><span>{card.age} / {card.life} s</span></div>
  <p class="dim">Young: {card.a.kids}{card.a.mom >= 0 ? ` · child of #${card.a.mom}` : ' · arrived from elsewhere'}</p>
  <h3>Lately</h3>
  {#each card.log as l (l.tick + l.text)}<div class="ev"><span class="dim">{l.time}</span> {l.text}</div>{/each}
  <div class="btns">
    <button onclick={() => { ui.focus = card.spId; ui.tab = 'species'; }}>Its species</button>
    <button onclick={() => { ui.follow = -1; ui.tab = 'species'; }}>Stop following</button>
  </div>
{:else}
  <p>{card.gone ? `#${ui.follow} ${card.gone.text}.` : 'Click an animal on the map to follow it.'}</p>
  <button onclick={() => { ui.follow = -1; ui.tab = 'species'; }}>Back</button>
{/if}

<style>
  .top { display: flex; gap: 10px; align-items: center; }
  h2 { margin: 0; }
  .row { display: grid; grid-template-columns: 60px 1fr 90px; gap: 8px; align-items: center; margin: 4px 0; }
  .bar { height: 8px; background: var(--panel-dark); border: 1px solid var(--ink); }
  .bar span { display: block; height: 100%; background: var(--good, #9ad05c); }
  .bar .age { background: var(--text-dim, #b5a383); }
  .ev { font-size: 14px; }
  .btns { display: flex; gap: 6px; margin-top: 10px; }
  p { margin: 6px 0; }
</style>
