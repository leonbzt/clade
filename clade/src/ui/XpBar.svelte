<!-- The line's XP bar, ported from game/src/ui/XpBar.svelte. Fills from `from` to `to`; `level` is bound so the
     screen can count the points gained as the bar passes each level. -->
<script lang="ts">
  import { LINE_RULE } from '../data/lines';
  import { barOf } from '../sim/line';

  let { from, to, level = $bindable(0), done = $bindable(false) }: { from: number; to: number; level?: number; done?: boolean } = $props();
  let xp = $state(0);

  $effect(() => {
    const a = from, b = to;
    if (a === b) { xp = b; level = barOf(b).level; done = true; return; }
    const t0 = performance.now(), dur = Math.min(2600, 700 + (b - a) * 6);
    let f = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      xp = a + (b - a) * (1 - (1 - k) ** 2);
      level = barOf(xp).level;
      if (k < 1) f = requestAnimationFrame(tick); else done = true;
    };
    done = false; f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  });
  const b = $derived(barOf(xp));
</script>

<div class="xp">
  <div class="row"><b>Level {b.level}</b><small>{b.step ? `${Math.floor(b.into)} / ${b.step} XP` : `level ${LINE_RULE.cap}, the cap`}</small></div>
  <div class="track"><i style:width="{b.pct * 100}%"></i></div>
</div>

<style>
  .xp { display: grid; gap: 4px; }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .row b { color: var(--gold); }
  .row small { color: var(--dim); }
  .track { height: 12px; background: var(--ink); border: 2px solid var(--line); }
  .track i { display: block; height: 100%; background: var(--gold); }
</style>
