<script lang="ts">
  // The body's 6 stats against the niche: raw value, its scaled bar, the niche's weight, the pressure, the score.
  import { ATTRS, STATS, STAT_NAMES, attr, tierOf, type FormId, type Genes } from '../data/genes';
  import { NICHES, PRESSURES } from '../data/niches';
  import { fullScore, ramp, scaled } from '../sim/species';
  let { raw, form, niche, genes, after = null }: { raw: number[]; form: FormId; niche: number; genes: Genes; after?: number[] | null } = $props();
  const sn = $derived(scaled(form, raw));
  const sa = $derived(after ? scaled(form, after) : null);
  const score = $derived(fullScore(sn, genes, NICHES[niche]));
  const scoreA = $derived(sa ? fullScore(sa, genes, NICHES[niche]) : null);
  const pr = $derived(PRESSURES[NICHES[niche].pressure]);
  const armourName = $derived(ATTRS.find((a) => a.id === pr.armour)!.name);
  const w = $derived(NICHES[niche].w as Record<string, number | undefined>);
</script>

<div class="row head">
  <span>{NICHES[niche].name}</span>
  <span class="score"><b class="gold">{tierOf(score)}</b> {score}{#if scoreA !== null}<span class={scoreA >= score ? 'up' : 'down'}> → {scoreA}</span>{/if}</span>
</div>
<div class="row press" title="the score × this; armour it to reach ×1">
  <span>{pr.icon} {pr.name}: {armourName} {attr(genes, pr.armour)}/{NICHES[niche].need}</span><span>×{ramp(genes, NICHES[niche]).toFixed(2)}</span>
</div>
{#each STATS as id, k}
  <div class="stat" class:weighted={w[id]}>
    <span class="name">{STAT_NAMES[id]}</span>
    <span class="bar"><i style:width="{sn[k] * 100}%"></i>{#if sa}<i class="ghost" style:width="{sa[k] * 100}%"></i>{/if}</span>
    <span class="w">{w[id] ? (w[id]! > 0 ? '+' : '−') + Math.round(Math.abs(w[id]!) * 100) : ''}</span>
  </div>
{/each}

<style>
  .head { font-size: 12.5px; margin-bottom: 2px; }
  .press { font-size: 11.5px; margin-bottom: 3px; }
  .score { font-size: 15px; }
  .stat { display: flex; align-items: center; gap: 6px; font-size: 11.5px; opacity: .55; }
  .stat.weighted { opacity: 1; }
  .name { width: 72px; }
  .bar { position: relative; flex: 1; height: 7px; background: #333a42; border-radius: 3px; overflow: hidden; }
  .bar i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--accent); }
  .bar i.ghost { background: transparent; border-right: 2px solid var(--gold); }
  .w { width: 30px; text-align: right; color: var(--muted); }
</style>
