<!-- Slice 20C: the body during a Life. Inspection, or a moult's offers: each legal change previewed on the creature
     before you commit, plus growing without a part. Reuses the 20B stage; since 20D the 20D icon slots, where the
     changed slot shows old → new. Tapping a slot names its part (and picks the offer that changes it). -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { PLACE_NAMES, type PlaceId } from '../data/body';
  import { PARTS, PLANS, VERBS } from '../data/life';
  import * as B from '../sim/body';
  import { makeEquipStage, type EquipStage } from '../view/equip-stage';
  import { numbers, places, rowUpkeep } from './equip';
  import { feel } from './feel';
  import { ctx, ui } from './meta.svelte';
  import PartIcon from './PartIcon.svelte';
  import Slots from './Slots.svelte';

  const v = $derived(ui.body);
  let sel = $state(-1), look: PlaceId | null = $state(null);
  let host: HTMLDivElement | undefined = $state();
  let stage = $state.raw<EquipStage | null>(null);
  $effect(() => { if (v) untrack(() => { sel = v.options.length ? 0 : -1; look = null; }); });

  const offer = $derived(v && sel >= 0 ? v.options[sel] : null);
  const shown = $derived(v ? $state.snapshot(offer?.change?.build ?? v.build) as B.Build : null);
  const nums = $derived(shown ? numbers(shown) : null);
  const views = $derived(v ? places(v.build.body, v.build) : []);
  const change = $derived(offer?.change ? { place: offer.change.place, row: offer.change.row } : null);
  /** The info line: a tapped slot's part, else the chosen offer's. */
  const info = $derived.by(() => {
    if (!v) return '';
    if (look) {
      const row = v.build.rows[look];
      return row?.length ? `${PLACE_NAMES[look]}: ${B.describeRow(row)}. ${[...new Set(row.map((p) => PARTS[p].does))].join(' ')} Upkeep ${rowUpkeep(row)}.` : `${PLACE_NAMES[look]}: ${views.find((x) => x.place === look)?.holds}.`;
    }
    return offer?.part ? `${PARTS[offer.part].name}: ${PARTS[offer.part].does}` : offer ? 'Grow a size without a new part.' : '';
  });
  function tap(p: PlaceId) {
    look = p;
    const k = v?.options.findIndex((o) => o.change?.place === p) ?? -1;
    if (k >= 0 && v!.options[sel]?.change?.place !== p) sel = k;
  }

  $effect(() => {
    if (!host) return;
    let alive = true, made: EquipStage | null = null;
    makeEquipStage(host, untrack(() => shown!), feel.pixel).then((s) => { if (alive) { made = s; stage = s; } else s.destroy(); });
    return () => { alive = false; made?.destroy(); stage = null; };
  });
  $effect(() => { if (stage && shown) stage.setBuild(shown); });
  $effect(() => { stage?.mark(offer?.change?.place ?? null, []); });

  const vn = (l: string[]) => l.map((x) => VERBS[x as keyof typeof VERBS].name).join(', ');
  const label = (o: NonNullable<typeof offer>) => (o.part && o.change ? `${PARTS[o.part].name} → ${PLACE_NAMES[o.change.place]}` : 'Grow without a part');
  const trade = (o: NonNullable<typeof offer>) => {
    if (!o.change) return `upkeep stays ${v!.upkeep}`;
    const c = o.change;
    return [c.gained.length ? `gains ${vn(c.gained)}` : '', c.lost.length ? `loses ${vn(c.lost)}` : '', `upkeep ${v!.upkeep} → ${c.upkeep}`].filter(Boolean).join(' · ');
  };
</script>

{#if v}
<div class="metaWrap lifeBodyWrap"><div class="panel habCard lifeBody">
  <div class="metaTop">
    <h2>{v.options.length ? `Moult to size ${v.moultSize}` : `${PLANS[v.build.body].name} · your body`}</h2>
    {#if !v.options.length}<button class="small" onclick={() => (ui.body = null)}>Close</button>{/if}
  </div>
  <div class="grid">
    <div class="left">
      <div class="stageWrap">
        <div class="stageBox" bind:this={host}></div>
        <Slots rows={v.build.rows} {views} sel={look} {change} onpick={tap} />
      </div>
    </div>
    <div class="side">
      {#if info}<p class="info">{info}</p>{/if}
      {#if v.options.length}
        <p class="note">Pick one change. The creature and its slots show it before you commit.</p>
        <div class="pickList">
          {#each v.options as o, k}
            <button class="verbCard partCard" class:on={sel === k} aria-pressed={sel === k} onclick={() => { sel = k; look = null; }}>
              <span class="ic"><PartIcon id={o.part ?? undefined} size={24} /></span>
              <b>{label(o)}</b>
              <em>{trade(o)}</em>
            </button>
          {/each}
        </div>
        <button class="go" disabled={!offer} onclick={() => offer && ctx.pick(offer.part, offer.change?.place)}>{offer ? (offer.part ? `Grow ${PARTS[offer.part].name}` : 'Grow without a part') : 'Pick one'}</button>
      {/if}
      {#if nums}
        <div class="sum">
          <p><b>Verbs:</b> {nums.verbs.join(', ') || 'none'} <small>({nums.ceiling})</small></p>
          <p><b>Upkeep {nums.upkeep}</b> <small>= {nums.upkeepSum}</small></p>
          <p><small>{nums.move} · sense {nums.sense} · oxygen {nums.oxygen}</small></p>
        </div>
      {/if}
    </div>
  </div>
</div></div>
{/if}

<style>
  .lifeBodyWrap { position: fixed; inset: 0; z-index: 30; overflow: auto; place-items: start center; }
  .lifeBody { max-width: 860px; width: min(860px, 96vw); box-sizing: border-box; }
  .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
  .stageBox { position: relative; height: min(60vh, 460px); min-height: 300px; background: #0b2730; border: 3px solid var(--ink); overflow: hidden; }
  .stageBox :global(canvas) { position: absolute; inset: 0; }
  .side { display: grid; gap: 8px; min-width: 0; }
  .sum p { margin: 2px 0; }
  .left { display: grid; gap: 6px; min-width: 0; }
  .stageWrap { position: relative; min-width: 0; }
  .info { margin: 0; min-height: 40px; }
  .side .go { position: sticky; bottom: 4px; z-index: 2; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } .stageBox { height: 36vh; min-height: 220px; } }
</style>
