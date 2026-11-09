<!-- Slice 20D: the six equipment slots around the large creature (heading up), one icon each; on a phone one row
     under it. States are drawn: held, empty, locked, unsupported, selected, legal, and a moult's old → new. Since 21B a
     slot can carry a badge: its upkeep after ranks. -->
<script lang="ts">
  import { PLACES, type PlaceId, type Row, type Rows } from '../data/body';
  import type { PlaceView } from './equip';
  import PartIcon from './PartIcon.svelte';

  let { rows, views, sel = null, legal = [], change = null, upkeep = {}, onpick }: {
    rows: Rows; views: PlaceView[]; sel?: PlaceId | null; legal?: PlaceId[];
    change?: { place: PlaceId; row: Row } | null; upkeep?: Partial<Record<PlaceId, number>>; onpick?: (p: PlaceId) => void;
  } = $props();

  /** Slot centres in % of the stage: ahead, above, below and behind the creature. */
  const AT: Record<PlaceId, [number, number]> = { front: [50, 12], eyes: [9, 24], back: [91, 24], limbs: [9, 62], sides: [91, 62], tail: [50, 87] };
  const view = (p: PlaceId) => views.find((v) => v.place === p)!;
</script>

<div class="slotRing">
  {#each PLACES as p}
    {@const v = view(p)}
    {@const hit = change?.place === p}
    <button class="slot {v.state}" class:on={p === sel} class:legal={legal.includes(p)} class:hit style="left:{AT[p][0]}%;top:{AT[p][1]}%"
      aria-pressed={p === sel} title="{v.name}: {v.holds}" onclick={() => onpick?.(p)}>
      <span class="boxes">
        {#if hit}<span class="box old"><PartIcon row={rows[p]} size={18} /></span><span class="arrow">→</span>{/if}
        <span class="box">
          {#if hit}<PartIcon row={change!.row} />
          {:else if v.state === 'locked'}<PartIcon id="lock" size={18} />
          {:else if rows[p]?.length}<PartIcon row={rows[p]} />{/if}
          {#if upkeep[p] !== undefined && !hit}<i class="up" class:free={upkeep[p] === 0} title="upkeep">{upkeep[p]}</i>{/if}
        </span>
      </span>
      <small>{v.name}</small>
    </button>
  {/each}
</div>

<style>
  .slotRing { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
  .slot { position: absolute; transform: translate(-50%, -50%); pointer-events: auto; display: grid; justify-items: center; gap: 0;
    margin: 0; padding: 0; min-height: 0; background: none; border: 0; color: var(--dim); }
  /* The global button press (translateY, inset shadow) and hover fill would replace the centring transform. */
  .slot:active:not(:disabled) { transform: translate(-50%, calc(-50% + 2px)); box-shadow: none; }
  .slot:hover:not(:disabled) { background: none; }
  .boxes { display: flex; align-items: center; gap: 2px; }
  .box { width: 44px; height: 44px; display: grid; place-items: center; background: #1b2a30; border: 3px solid var(--ink); outline: 1px solid var(--edge); }
  .box { position: relative; }
  .up { position: absolute; right: -6px; bottom: -6px; min-width: 16px; padding: 0 2px; font: 700 16px/16px var(--font); font-style: normal;
    color: var(--food); background: var(--ink); text-align: center; }
  .up.free { color: var(--good); }
  .box.old { width: 30px; height: 30px; opacity: 0.6; }
  .arrow { color: var(--gold); }
  .slot small { font-size: 16px; text-shadow: var(--outline); }
  .slot.empty .box, .slot.locked .box { background: #12201f; }
  .slot.unsupported { opacity: 0.45; }
  .slot.unsupported .box { background: repeating-linear-gradient(45deg, #12201f 0 4px, #1b2a30 4px 8px); }
  .slot.legal .box { outline: 3px solid var(--good); }
  .slot.on .box, .slot.hit .box:not(.old) { outline: 3px solid var(--gold); }
  .slot.on small, .slot.hit small { color: var(--gold); }
  @media (max-width: 720px) {
    .slotRing { position: static; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 2px; margin-top: 6px; }
    .slot, .slot:active:not(:disabled) { position: static; transform: none; }
    .boxes { position: relative; }
    .box.old { position: absolute; left: -4px; top: -4px; width: 24px; height: 24px; z-index: 1; opacity: 0.85; }    .arrow { display: none; }
  }
</style>
