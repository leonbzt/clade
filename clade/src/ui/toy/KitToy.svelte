<script lang="ts">
  import { DEV_SPECIES } from '../../data/builds';
  import { BRANCHES, KIT } from '../../data/kit';
  import { KIT_BOARDS, type KitBoard } from '../../data/kit-boards';
  import { afterLife, branchOf, levelOf, nextLevel, startKit } from '../../sim/kit';
  import { newLife, type Life } from '../../sim/life';
  import LifeScreen from '../life/Life.svelte';
  import KitBody from './KitBody.svelte';
  import { bestOn, emptyProgress, freshSeed, levelBar, loadProgress, nextOpens, nextRun,
    openedBetween, rungName, saveProgress } from './kit-progress';

  let progress = $state.raw(loadProgress());
  let before = $state.raw(progress);
  let shownEggs = $state(progress.eggs);
  let run = $state(nextRun());
  let board = $state.raw<KitBoard | null>(null);
  let life = $state.raw<Life | null>(null);
  let over = $state(false);
  let resetting = $state(false);
  const level = $derived(levelOf(progress.eggs));
  const branch = $derived(over && life ? branchOf(life) : null);
  const solved = $derived(board && bestOn(before, board.id) < board.goal
    && bestOn(progress, board.id) >= board.goal);

  function start(picked: KitBoard) {
    saveProgress(progress);
    const build = structuredClone(DEV_SPECIES.find((species) => species.id === 'root-worm')!.build);
    const next = newLife(picked.board, build, {}, freshSeed());
    startKit(next, level, progress.plan);
    before = progress; shownEggs = progress.eggs;
    over = false; resetting = false; board = picked; run = nextRun(run); life = next;
  }

  function finish() {
    if (over || !life || !board) return;
    progress = afterLife(before, board.id, life.eggs);
    saveProgress(progress);
    over = true;
    // Paint the previous total first so the result's bar moves to the saved total.
    const finishedRun = run;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (over && run === finishedRun) shownEggs = progress.eggs;
    }));
  }

  function body() {
    life = null; board = null; over = false;
  }

  function reset() {
    if (!resetting) { resetting = true; return; }
    progress = emptyProgress();
    saveProgress(progress);
    resetting = false;
  }
</script>

{#snippet meter(eggs: number)}
  {@const bar = levelBar(eggs)}
  <div class="kit-level">
    <h2>Level {levelOf(eggs)}</h2>
    <div class="level-bar" role="progressbar" aria-label="Level"
      aria-valuemax={bar.span} aria-valuenow={bar.value}>
      <div class="level-fill" style:width={bar.percent} style:transition-duration={`${KIT.beatMs}ms`}></div>
    </div>
    <p>{eggs} / {bar.at} eggs</p>
    {#if nextLevel(eggs)}<p>Next: {nextOpens(eggs)}</p>{:else}<p>Everything is open.</p>{/if}
  </div>
{/snippet}

<div class="kit-toy">
  {#if life && board}
    <header class="kit-header">
      <span>{board.name}</span>
      <button id="kit-restart" onclick={() => start(board!)}>Restart</button>
    </header>
    <div class="kit-life">
      {#key run}
        <LifeScreen {life} purpose={board.name} complete={finish} />
      {/key}
    </div>
    {#if over}
      <div class="toy-result">
        <section class="toy-card">
          <h2>{branch === null ? 'A bare Life' : BRANCHES[branch].life}</h2>
          <p>Eggs {life.eggs} · {life.cause === 'season' ? 'Season ended' : 'Died'}</p>
          <ul>
            {#each life.kit?.order ?? [] as id (id)}
              <li>{rungName(id, life.kit?.rungs[id])}</li>
            {/each}
          </ul>
          {@render meter(shownEggs)}
          {#if level > levelOf(before.eggs)}
            <p>Level {level}: opens {openedBetween(before.eggs, progress.eggs)}</p>
          {/if}
          {#if solved}
            <p>Solved: {life.eggs} eggs on {board.name}. A chapter done; the next board waits.</p>
          {/if}
          <div class="toy-actions">
            <button id="kit-again" onclick={() => start(board!)}>Again</button>
            <button id="kit-body" onclick={body}>Body</button>
          </div>
        </section>
      </div>
    {/if}
  {:else}
    <div class="toy-start">
      <section class="toy-card">
        {@render meter(progress.eggs)}
        <KitBody {level} plan={progress.plan} change={(plan) => { progress = { ...progress, plan }; }} />
        <section class="toy-boards">
          <h2>Boards</h2>
          {#each KIT_BOARDS as picked (picked.id)}
            <button data-board={picked.id} onclick={() => start(picked)}>
              {picked.name}
              <small>{picked.asks}</small>
              <small>Best {bestOn(progress, picked.id)} / goal {picked.goal}
                {#if bestOn(progress, picked.id) >= picked.goal}★{/if}
              </small>
            </button>
          {/each}
        </section>
        <button id="kit-reset-progress" class="kit-reset" onclick={reset}>
          {resetting ? 'Tap again to reset' : 'Reset progress'}
        </button>
      </section>
    </div>
  {/if}
</div>

<style>
  .kit-toy { position: absolute; inset: 0; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
  .kit-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; background: var(--panel); }
  .kit-header span { min-width: 0; overflow-wrap: anywhere; }
  .kit-header button { flex-shrink: 0; }
  .kit-life { position: relative; flex: 1; min-height: 0; min-width: 0; }
  .toy-start, .toy-result { position: absolute; inset: 0; display: grid; justify-items: center; align-items: start; padding: 16px; overflow-y: auto; }
  .toy-start { background: var(--ink); }
  .toy-result { z-index: 4; }
  .toy-card { width: 100%; min-width: 0; max-width: 340px; box-sizing: border-box; padding: 16px; background: var(--panel); border: 2px solid var(--line); overflow-wrap: anywhere; }
  h2 { font-size: 16px; margin: 0 0 8px; }
  p { margin: 8px 0; }
  ul { padding-left: 16px; }
  .kit-level { margin-bottom: 16px; }
  .level-bar { height: 8px; overflow: hidden; background: var(--ink); border: 1px solid var(--line); }
  .level-fill { height: 100%; background: var(--dim); transition-property: width; transition-timing-function: ease; }
  .toy-boards { display: grid; gap: 8px; margin-top: 16px; }
  .toy-boards h2 { margin-bottom: 0; }
  .toy-boards button { min-width: 0; text-align: left; white-space: normal; overflow-wrap: anywhere; }
  small { display: block; font: inherit; color: var(--dim); margin-top: 2px; }
  .toy-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .kit-reset { margin-top: 16px; }
</style>
