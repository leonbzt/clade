<!-- Slice 20B: the equipment view. The creature large with its six places, the choices at the chosen place as
     trade-off cards, the same build at board size. Since 20C it is the Life's launcher; since 20D the places are icon
     slots (`Slots.svelte`) and the cards carry icons; since 21A it offers only the line's parts, and its presets are
     the line's saved species (plus the style presets the pool allows); since 21B the newest three show unless you ask
     for more, slots show their upkeep and the info line the part's ranks. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { BODY_RULE, PLACE_NAMES, type PlaceId, type PresetId, type Rows } from '../data/body';
  import { PLANS, STYLES, type PartId, type PlanId } from '../data/life';
  import * as B from '../sim/body';
  import type { Species } from '../sim/lineage';
  import { makeEquipStage, type EquipStage } from '../view/equip-stage';
  import { homes, legalFor, numbers, optionsAt, places, presetsOf, startDesign, verbName, type Option } from './equip';
  import { feel } from './feel';
  import PartIcon from './PartIcon.svelte';
  import Slots from './Slots.svelte';
  import { rankText, slotUpkeep } from './line';

  let { plan, line, species = [], context, preset, design: given, size = 1, onstart, onclose }: {
    plan: PlanId; line?: B.LinePool; species?: Species[]; context: string; preset?: PresetId; design?: Rows; size?: number;
    onstart?: (design: Rows) => void; onclose: () => void;
  } = $props();

  /** The chips: saved species first, then the style presets this line's pool allows. */
  const SHOWN = 3;
  let more = $state(false);
  const chips = $derived([
    ...species.map((sp, k) => ({ id: `sp${k}`, name: sp.name, rows: sp.rows })),
    ...presetsOf(plan).filter((p) => legalFor(plan, startDesign(plan, p), line)).map((p) => ({ id: p as string, name: p === 'hunter' ? 'Hunter' : STYLES[p].name, rows: startDesign(plan, p) })),
  ]);
  const first = untrack(() => given ? { id: null, rows: $state.snapshot(given) as Rows }
    : (species.length ? chips[0] : chips.find((c) => c.id === preset)) ?? chips[0] ?? { id: null, rows: startDesign(plan) }); // the newest species first
  let design: Rows = $state(structuredClone(first.rows));
  let sel: PlaceId = $state('front'), hover: PartId | null = $state(null), presetOn: string | null = $state(first.id);
  let host: HTMLDivElement | undefined = $state();
  let stage = $state.raw<EquipStage | null>(null);
  let peek: Option | null = $state(null);

  const res = $derived(B.startBuild(plan, design, line));
  const build = $derived(res.build);
  const shown = $derived({ ...build, size });
  const view = $derived(places(plan, build));
  const opts = $derived(optionsAt(plan, design, sel, line));
  const nums = $derived(numbers(build));
  const legal = $derived(hover ? homes(plan, hover) : []);

  $effect(() => {
    if (!host) return;
    let alive = true, made: EquipStage | null = null;
    const el = host;
    makeEquipStage(el, untrack(() => shown), feel.pixel).then((s) => { if (alive) { made = s; stage = s; } else s.destroy(); });
    return () => { alive = false; made?.destroy(); stage = null; };
  });
  $effect(() => { stage?.setBuild(shown); });
  $effect(() => { stage?.mark(sel, legal); });

  function choose(o: Option) {
    const next: Rows = { ...design };
    if (o.row) next[sel] = [...o.row]; else delete next[sel];
    design = next; presetOn = null;
  }
  function useChip(c: { id: string; rows: Rows }) { design = structuredClone(c.rows); presetOn = c.id; }
  const trade = (o: Option) => [
    o.gained.length ? `gains ${o.gained.map(verbName).join(', ')}` : '', o.lost.length ? `loses ${o.lost.map(verbName).join(', ')}` : '',
    `upkeep ${nums.upkeep} → ${o.upkeepAfter}`,
  ].filter(Boolean).join(' · ');
  const was = $derived(build.rows[sel]?.length ? B.describeRow(build.rows[sel]!) : null);
  /** The info line: the hovered card, else the current one. */
  const info = $derived(peek ?? opts.find((o) => o.current) ?? null);
  const pick = (p: PlaceId) => { sel = p; peek = null; };
  const enter = (o: Option) => { peek = o; hover = o.row?.[o.row.length - 1] ?? null; };
  const leave = () => { peek = null; hover = null; };
</script>

<div class="metaWrap equipWrap"><div class="panel habCard equip">
  <div class="metaTop"><h2>{PLANS[plan].name} · starting body</h2><button class="small" onclick={onclose}>Back</button></div>
  <p class="note">{context}</p>
  <div class="equipGrid">
    <div class="stageWrap">
      <div class="stageBox" bind:this={host}><span class="boardTag">board size</span></div>
      <Slots rows={build.rows} views={view} {sel} {legal} upkeep={slotUpkeep(build)} onpick={pick} />
    </div>
    <div class="equipSide">
      <div class="chips">
        {#each chips.filter((c, k) => more || k < SHOWN || !c.id.startsWith('sp') || presetOn === c.id) as c}<button class="chip" class:on={presetOn === c.id} onclick={() => useChip(c)}>{c.name}</button>{/each}
        {#if species.length > SHOWN}<button class="chip" onclick={() => (more = !more)}>{more ? 'Fewer' : `+${species.length - SHOWN} species`}</button>{/if}
      </div>
      <h3>{PLACE_NAMES[sel]} <span class="hint">{view.find((v) => v.place === sel)?.lock ? `locked: ${view.find((v) => v.place === sel)?.lock}` : was ? `now: ${was}` : 'empty'}</span></h3>
      {#if view.find((v) => v.place === sel)?.state === 'unsupported'}
        <p class="note">This body has no part for this place yet.</p>
      {:else}
        {#if info}<p class="info"><b>{info.name}:</b> {info.does}{info.verb ? ` Verb: ${info.verb}.` : ''}{#each (info.row ?? []).flatMap((p) => rankText(p, line?.ranks)) as r}<span class="rank"> {r}.</span>{/each}</p>{/if}
        <div class="pickList">
          {#each opts as o}
            <button class="verbCard partCard" class:on={o.current} aria-current={o.current} onclick={() => { if (!o.current) choose(o); }}
              onpointerenter={() => enter(o)} onpointerleave={leave} onfocus={() => enter(o)} onblur={leave}>
              <span class="ic"><PartIcon row={o.row} size={24} /></span>
              <b>{o.name}{o.current ? ' · now' : ''}</b>
              <em>{o.current ? `upkeep ${o.upkeep}` : trade(o)}</em>
              {#each o.problems as p}<em class="bad">{p}</em>{/each}
            </button>
          {/each}
        </div>
      {/if}
      <div class="sum">
        <p><b>Verbs:</b> {nums.verbs.join(', ') || 'none'} <small>({nums.ceiling})</small></p>
        <p><b>Upkeep {nums.upkeep}</b> food a turn <small>= {nums.upkeepSum}</small></p>
        <p><small>{nums.move} · sense {nums.sense} · oxygen {nums.oxygen} · clutch {nums.clutch} at size 3</small></p>
        {#each res.problems as p}<p class="bad">{p}</p>{/each}
      </div>
      <p class="note">At most {BODY_RULE.maxVerbs} verbs; Dash from walking legs is free. Moults add the rest.</p>
      {#if onstart}<button class="go" disabled={res.problems.length > 0} onclick={() => onstart($state.snapshot(design))}>Start the Life</button>{/if}
    </div>
  </div>
</div></div>

<style>
  .equipWrap { position: fixed; inset: 0; z-index: 30; overflow: auto; place-items: start center; }
  .equip { max-width: 980px; width: min(980px, 96vw); box-sizing: border-box; }
  .equipGrid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); grid-template-areas: 'stage side'; gap: 8px 12px; align-items: start; }
  .stageWrap { grid-area: stage; position: relative; min-width: 0; } .equipSide { grid-area: side; }
  .stageBox { position: relative; height: min(70vh, 560px); min-height: 360px; background: #0b2730; border: 3px solid var(--ink); overflow: hidden; }
  .stageBox :global(canvas) { position: absolute; inset: 0; }
  .info { margin: 0; min-height: 40px; }
  .boardTag { position: absolute; right: 6px; bottom: 4px; color: var(--dim); text-shadow: var(--outline); pointer-events: none; }
  .equipSide { display: grid; gap: 8px; min-width: 0; }
  .equipSide h3 { margin: 4px 0 0; }
  .sum p { margin: 2px 0; }
  .bad { color: var(--red); }
  .rank { color: var(--good); }
  .equip .go { position: sticky; bottom: 4px; z-index: 2; }
  @media (max-width: 720px) {
    .equipGrid { grid-template-columns: 1fr; grid-template-areas: 'stage' 'side'; }
    .stageBox { height: 46vh; min-height: 260px; }
  }
</style>
