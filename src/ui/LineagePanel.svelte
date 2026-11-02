<script lang="ts">
  // The lineage card (home): its name, class, form in gene words, level and XP, one line per run, the finds of the
  // last run, and the Run button.
  import { THEMES, SIZES } from '../data/islands';
  import { canRun, classOf, formWords, levelOf, runCost } from '../sim/lineage';
  import { home, ui } from './game.svelte';
  import { grams } from './format';

  const END = { clock: 'the clock ran out', home: 'brought home', died: 'the line died' } as const;

  const card = $derived.by(() => {
    ui.v; ui.gen;
    const L = home.lineage!, lv = levelOf(L.xp), can = canRun(home);
    return { L, lv, cls: classOf(L.form), words: formWords(L.form), cost: runCost(home), can: can.ok, why: can.ok ? '' : can.reason };
  });
</script>

<div class="lineage">
  <h2>{card.L.name}</h2>
  <p class="dim small">{card.cls} · your pioneer, the first plant at the vent</p>
  <p>Form: <b class="gold">{card.L.form.name}</b> <span class="dim">({card.words})</span></p>
  <div class="level">
    <span>Level <b>{card.lv.level}</b></span>
    <span class="bar"><span class="fill" style:width="{Math.min(100, (100 * card.lv.into) / card.lv.need)}%"></span></span>
    <span class="dim small">{Math.floor(card.lv.into)} / {Math.round(card.lv.need)} XP</span>
  </div>
  {#if card.lv.level >= 2}<p class="small good">Perk: a fourth brood card (a second Wild).</p>{/if}

  <button class="run" disabled={!card.can} title={card.why} onclick={() => (ui.runSetup = true)}>Run · {grams(card.cost)}</button>
  {#if !card.can}<span class="dim small">{card.why}</span>{/if}

  {#if ui.lastRun}
    <p class="small">Back from the run: <b>+{ui.lastRun.xp} XP</b>, {END[ui.lastRun.end]}. The line came home as <b>{ui.lastRun.form}</b>.</p>
  {/if}

  <h3>Runs</h3>
  {#each card.L.runs as r, k (k)}
    <p class="small">{k + 1}. {THEMES[r.theme].name}, {SIZES[r.size].name} · {r.seasons} seasons · {END[r.end]} · {r.form} · +{r.xp} XP</p>
  {:else}
    <p class="small dim">None yet. A run takes the line to a young island for eight seasons; it comes back changed.</p>
  {/each}

  {#if card.L.finds.length}
    <h3>Shown variants from the last run</h3>
    <p class="small">{card.L.finds.join(' · ')}</p>
    <p class="small dim">They come home with the line in the next slice.</p>
  {/if}
</div>

<style>
  .lineage h2 { margin-top: 0; }
  .small { font-size: 14px; }
  p { margin: 4px 0; }
  .level { display: flex; gap: 8px; align-items: center; margin: 6px 0; }
  .bar { flex: 1; height: 10px; background: var(--ink); border: 1px solid var(--edge); }
  .fill { display: block; height: 100%; background: var(--gold); }
  .run { margin: 8px 0 2px; color: var(--gold); }
</style>
