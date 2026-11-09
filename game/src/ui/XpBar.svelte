<!-- Slice 21B: the line's XP bar. Static at `to`, or filling from `from` (level by level) with `level` and `done`
     bound so the screen can reveal its lines as the bar passes each level. -->
<script lang="ts">
  import { LINE_RULE } from '../data/lineages';
  import { bar } from './line';

  let { from, to, level = $bindable(0), done = $bindable(false) }: { from?: number; to: number; level?: number; done?: boolean } = $props();
  let xp = $state(0);

  $effect(() => {
    const a = from ?? to, b = to;
    if (a === b) { xp = b; level = bar(b).level; done = true; return; }
    const t0 = performance.now(), dur = Math.min(2600, 700 + (b - a) * 6);
    let f = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      xp = a + (b - a) * (1 - (1 - k) ** 2);
      level = bar(xp).level;
      if (k < 1) f = requestAnimationFrame(tick); else done = true;
    };
    done = false; f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  });
  const b = $derived(bar(xp));
</script>

<div class="xp">
  <div class="row"><b>Level {b.level}</b><small>{b.step ? `${b.into} / ${b.step} XP` : `level ${LINE_RULE.cap}, the cap`}</small></div>
  <div class="track"><i style:width="{b.pct * 100}%"></i></div>
</div>

<style>
  .xp { display: grid; gap: 4px; }
  .row { display: flex; justify-content: space-between; align-items: baseline; }
  .row b { color: var(--gold); text-shadow: var(--outline); }
  .row small { color: var(--dim); font-size: 16px; }
  .track { height: 16px; background: var(--ink); border: 2px solid var(--edge); }
  .track i { display: block; height: 100%; background: var(--gold); }
</style>
