<script lang="ts">
  import { store, act } from './game.svelte';
  import { canFound, found, skipDispersal } from '../core/actions';
  import { coveredCells } from '../core/garden';
  import { hexCorners, hexKey, hexToPixel } from '../core/hex';
  import { islandCells, nicheCellCount } from '../core/island';
  import { ISLAND } from '../data/island';
  import { NUMBERS } from '../data/numbers';
  import { TEXT } from '../data/text';
  import { PALETTE as P, VIEW } from '../data/view';
  import Steam from './Steam.svelte';

  let { onMossTap }: { onMossTap: (speciesIndex: number) => void } = $props();

  const s = $derived(store.s);
  const size = VIEW.islandHexSize;
  const cells = islandCells();
  const extent = size * 2 * (ISLAND.radius + 1.5);
  const vent = hexToPixel(ISLAND.vent, size);
  const covered = $derived(coveredCells(s.garden));

  // Intro: the island fades in, then a spore drifts to the vent
  const intro = NUMBERS.intro;
  const sporeT = $derived(
    s.phase === 'intro' ? Math.min(1, Math.max(0, (s.phaseTime - intro.sporeArrivesAt) / (intro.foundButtonAt - intro.sporeArrivesAt))) : 1,
  );
  const sporeStart = { x: -extent * 0.9, y: -extent * 0.7 };
  const sporePos = $derived({
    x: sporeStart.x + (vent.x - sporeStart.x) * sporeT,
    y: sporeStart.y + (vent.y - sporeStart.y) * sporeT + Math.sin(sporeT * 9) * 14 * (1 - sporeT),
  });

  // Dispersal: spores drift from the vent to the cells the newest species will fill
  const targets = $derived.by(() => {
    const sp = s.garden.species[s.garden.species.length - 1];
    if (!sp) return [];
    return cells.filter((c) => c.order < Math.round(sp.share[c.niche] * nicheCellCount(c.niche))).map((c) => hexToPixel(c, size));
  });
  const particles = $derived.by(() => {
    if (s.phase !== 'dispersal' || targets.length === 0) return [];
    const p = s.phaseTime / NUMBERS.release.dispersalTime;
    return Array.from({ length: VIEW.sporeParticles }, (_, i) => {
      const t = targets[(i * 7) % targets.length];
      const delay = (i / VIEW.sporeParticles) * 0.6;
      const k = Math.min(1, Math.max(0, (p - delay) / 0.4));
      const ease = 1 - (1 - k) * (1 - k);
      return {
        x: vent.x + (t.x - vent.x) * ease + Math.sin(i + k * 6) * 10 * (1 - k),
        y: vent.y + (t.y - vent.y) * ease - Math.sin(k * Math.PI) * 30,
        o: k <= 0 || k >= 1 ? 0 : 0.9,
        landed: k >= 1,
        t,
      };
    });
  });
  const landed = $derived(new Set(particles.filter((p) => p.landed).map((p) => `${p.t.x},${p.t.y}`)));

  function cellFill(c: (typeof cells)[number]): string {
    if (covered.has(hexKey(c))) return P.moss;
    if (s.phase === 'dispersal') {
      const p = hexToPixel(c, size);
      if (landed.has(`${p.x},${p.y}`)) return P.mossEdge;
    }
    return c.niche === 'beach' ? P.beach : P.lava;
  }
</script>

<div class="wrap">
  <svg viewBox="{-extent} {-extent * 0.9} {extent * 2} {extent * 1.8}" class="island" class:fadein={s.phase === 'intro'}>
    <rect x={-extent * 2} y={-extent * 2} width={extent * 4} height={extent * 4} fill={P.sea} />
    {#each cells as c (hexKey(c))}
      {@const p = hexToPixel(c, size)}
      {@const sp = covered.get(hexKey(c))}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <polygon
        points={hexCorners(p.x, p.y, size)}
        fill={cellFill(c)}
        stroke={c.niche === 'beach' ? P.beachEdge : P.lavaEdge}
        stroke-width="0.8"
        class:moss={sp !== undefined && s.phase === 'garden'}
        onclick={() => sp !== undefined && s.phase === 'garden' && onMossTap(sp)}
      />
    {/each}
    <Steam x={vent.x} y={vent.y} />
    {#if s.phase === 'intro' && s.phaseTime >= intro.sporeArrivesAt}
      <circle cx={sporePos.x} cy={sporePos.y} r="3" fill={P.spore} class="spore" />
    {/if}
    {#if s.phase === 'arrival'}
      <circle cx={vent.x} cy={vent.y} r="4" fill={P.colonyDamp} class="speck" />
    {/if}
    {#each particles as p, i (i)}
      <circle cx={p.x} cy={p.y} r="2" fill={P.spore} opacity={p.o} />
    {/each}
  </svg>

  {#if s.phase === 'intro'}
    <div class="caption">
      <p class="line">{TEXT.coldOpen}</p>
      {#if s.phaseTime >= intro.sporeArrivesAt}<p class="line sub">{TEXT.sporeArrives}</p>{/if}
      {#if canFound(s)}<button class="primary found" onclick={() => act(found)}>{TEXT.foundHere}</button>{/if}
    </div>
  {/if}
  {#if s.phase === 'dispersal'}
    <div class="caption">
      <p class="line sub">{TEXT.release.dispersing}</p>
      <button onclick={() => act(skipDispersal)}>{TEXT.release.skip}</button>
    </div>
  {/if}
</div>

<style>
  .wrap {
    position: absolute;
    inset: 0;
    background: #56616a;
  }
  .island {
    width: 100%;
    height: 100%;
  }
  .fadein {
    animation: fade 3s ease-out;
  }
  polygon.moss {
    cursor: pointer;
  }
  polygon.moss:hover {
    filter: brightness(1.2);
  }
  .spore {
    filter: drop-shadow(0 0 3px #fff);
  }
  .speck {
    animation: grow 1.5s ease-out;
  }
  .caption {
    position: absolute;
    left: 0;
    right: 0;
    top: 8%;
    text-align: center;
    pointer-events: none;
  }
  .caption button {
    pointer-events: auto;
  }
  .line {
    font-size: 20px;
    margin: 0 16px 8px;
    text-shadow: 0 1px 6px #000;
    animation: fade 2s ease-out;
  }
  .line.sub {
    font-size: 15px;
    color: #d6dad6;
  }
  .found {
    margin-top: 12px;
    font-size: 18px;
    padding: 10px 24px;
    animation: fade 0.8s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @keyframes grow {
    from {
      r: 0;
    }
  }
</style>
