<script lang="ts">
  import { DEV_SPECIES } from '../../data/builds';
  import { PARTS } from '../../data/parts';
  import { TOY_BOARDS, type ToyBoard } from '../../data/toy-boards';
  import { BRANCHES } from '../../data/tree';
  import { newLife, type Life } from '../../sim/life';
  import { branchOf, startTree } from '../../sim/tree';
  import LifeScreen from '../life/Life.svelte';

  let run = $state(0);
  let board = $state.raw<ToyBoard | null>(null);
  let life = $state.raw<Life | null>(null);
  let over = $state(false);
  const branch = $derived(over && life ? branchOf(life) : null);

  function start(picked: ToyBoard) {
    over = false; board = picked; run++;
    const build = structuredClone(DEV_SPECIES.find((s) => s.id === 'root-worm')!.build);
    const next = newLife(picked.board, build, {}, run);
    startTree(next); life = next;
  }
</script>

<div class="build-toy">
  {#if life && board}
    {#key run}
      <LifeScreen {life} purpose={board.name} complete={() => (over = true)} />
    {/key}
    {#if over}
      <div class="toy-result">
        <section class="toy-card" aria-label="Life result">
          <h2>{branch === null ? 'A bare Life' : BRANCHES[branch].life}</h2>
          <p>Eggs {life.eggs} · {life.cause === 'season' ? 'Season ended' : 'Died'}</p>
          <ul>
            {#each life.tree?.grown ?? [] as place (place)}
              {@const part = life.build.parts[place]}
              {#if part}<li>{PARTS[part].name} · rank {life.enforced[part] ?? 0}</li>{/if}
            {:else}
              <li>No nodes grown.</li>
            {/each}
          </ul>
          <div class="toy-actions">
            <button onclick={() => start(board!)}>Again</button>
            <button onclick={() => { life = null; board = null; over = false; }}>Boards</button>
          </div>
        </section>
      </div>
    {/if}
  {:else}
    <div class="toy-start">
      <section class="toy-card">
        <h1>The build toy</h1>
        <div class="toy-boards">
          {#each TOY_BOARDS as b (b.id)}
            <button onclick={() => start(b)}>{b.name}<small>{b.asks}</small></button>
          {/each}
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .build-toy { position: absolute; inset: 0; }
  .toy-start, .toy-result { position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; overflow-y: auto; }
  .toy-start { background: var(--ink); }
  .toy-result { z-index: 4; }
  .toy-card { width: 100%; max-width: 340px; box-sizing: border-box; padding: 16px; background: var(--panel); border: 2px solid var(--line); }
  h1, h2 { font-size: 16px; margin: 0 0 8px; }
  p { margin: 8px 0; }
  ul { padding-left: 16px; }
  .toy-boards { display: grid; gap: 8px; }
  .toy-boards button { text-align: left; }
  small { display: block; font: inherit; color: var(--dim); margin-top: 2px; }
  .toy-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
</style>
