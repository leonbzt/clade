<script lang="ts">
  import { onMount } from 'svelte';
  import { NUM } from '../data/numbers';
  import { DETAIL_FROM, ZOOM_STEPS } from '../data/view';
  import { FIELDS, type LayerId } from '../data/fields';
  import { GardenRenderer, VIEWS, type View } from '../view/render';
  import MapReadout from './MapReadout.svelte';
  import { animalAt } from '../view/animals';
  import { doFound, followAnimal, game, selectPlace, selectTile, ui } from './game.svelte';
  import EventFeed from './EventFeed.svelte';
  import SlotIcon from './SlotIcon.svelte';
  import { loadout } from './board';
  import { bucketOf } from '../sim/tally';

  const T = NUM.map.tile, W = NUM.map.w * T, H = NUM.map.h * T;

  let canvas: HTMLCanvasElement;
  let wrap: HTMLElement;
  let viewport: HTMLElement;
  let renderer: GardenRenderer | null = null;

  let fitScale = $state(1); // screen px per art px when the whole island fits
  let zi = $state(Number(new URLSearchParams(location.search).get('zoom')) || 0); // index into ZOOM_STEPS (dev: ?zoom=3)
  let pan = $state({ x: 0, y: 0 });
  const scale = $derived(fitScale * ZOOM_STEPS[zi]);
  // Landmark names show once you zoom in (not in the Habitats view, where the habitats carry their names).
  const labels = $derived.by(() => {
    ui.gen;
    return game.landmarks.map((m) => ({ name: m.name, x: ((m.at % game.w) + 0.5) * T, y: Math.floor(m.at / game.w) * T }));
  });
  // A loadout card on each habitat shown: its six mini icons, and its name when zoomed in (they follow ui.v).
  const habitatCards = $derived.by(() => {
    ui.gen; ui.v;
    return game.habitats.filter((h) => h.shown && h.at >= 0).map((h) => ({ p: h.id, name: h.name, cards: loadout(game, h.id), x: ((h.at % game.w) + 0.5) * T, y: (Math.floor(h.at / game.w) + 0.5) * T }));
  });

  $effect(() => {
    ui.gen;
    renderer = new GardenRenderer(game, canvas);
  });

  // Set up once. (An $effect here would re-run whenever zoom or pan change, since it reads them.)
  onMount(() => {
    let raf = 0;
    const loop = (t: number) => {
      const follow = ui.tab === 'animal' ? ui.follow : -1;
      renderer?.draw({ placing: ui.placing, hover: ui.hover, view: ui.view, time: t, detail: scale >= DETAIL_FROM, selected: ui.tab === 'tile' ? ui.selected : -1, focus: ui.focus, hoverVariant: ui.hoverVariant, follow, lit: ui.tab === 'habitats' ? ui.lit : null, place: ui.tab === 'habitats' ? ui.place : -1 });
      if (follow >= 0 && zi > 0 && !press) centreOn(follow);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(fitToSpace);
    ro.observe(wrap.parentElement!);
    fitToSpace();
    viewport.addEventListener('wheel', wheel, { passive: false });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); viewport.removeEventListener('wheel', wheel); };
  });

  /** Fills the space left by the fixed rows under the map. Whole-number steps when there's room, so pixels stay crisp. */
  function fitToSpace() {
    const rows = wrap.scrollHeight - viewport.offsetHeight, room = (wrap.parentElement!.clientHeight || window.innerHeight) - rows - 4;
    const s = Math.max(0.5, Math.min(wrap.clientWidth / W, room / H));
    fitScale = s >= 2 ? Math.floor(s) : s;
    clampPan();
  }

  /** Keeps the followed animal in the middle of the view (when zoomed in). */
  function centreOn(id: number) {
    const a = game.agents.find((x) => x.id === id);
    if (!a) return;
    const want = { x: (W * fitScale) / 2 - a.x * T * scale, y: (H * fitScale) / 2 - a.y * T * scale };
    pan = { x: pan.x + (want.x - pan.x) * 0.1, y: pan.y + (want.y - pan.y) * 0.1 };
    clampPan();
  }

  function clampPan() {
    const vw = W * fitScale, vh = H * fitScale, cw = W * scale, ch = H * scale;
    pan = { x: Math.min(0, Math.max(vw - cw, pan.x)), y: Math.min(0, Math.max(vh - ch, pan.y)) };
  }

  /** Zoom to a step, keeping the point under (cx, cy) in place. */
  function zoomTo(next: number, cx = (W * fitScale) / 2, cy = (H * fitScale) / 2) {
    next = Math.max(0, Math.min(ZOOM_STEPS.length - 1, next));
    const old = scale, nz = fitScale * ZOOM_STEPS[next];
    const wx = (cx - pan.x) / old, wy = (cy - pan.y) / old;
    zi = next;
    pan = { x: cx - wx * nz, y: cy - wy * nz };
    clampPan();
  }

  function wheel(e: WheelEvent) {
    e.preventDefault();
    const r = viewport.getBoundingClientRect();
    zoomTo(zi + (e.deltaY < 0 ? 1 : -1), e.clientX - r.left, e.clientY - r.top);
  }

  function tileAt(e: PointerEvent): number {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((((e.clientX - r.left) / r.width) * W) / T);
    const y = Math.floor((((e.clientY - r.top) / r.height) * H) / T);
    return x >= 0 && y >= 0 && x < game.w && y < game.h ? y * game.w + x : -1;
  }

  // Drag to pan; a press that barely moves is a click.
  let press = $state<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  function down(e: PointerEvent) {
    if (e.button === 2) return;
    press = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
    viewport.setPointerCapture(e.pointerId);
  }

  function move(e: PointerEvent) {
    ui.hover = tileAt(e);
    if (!press) return;
    const dx = e.clientX - press.x, dy = e.clientY - press.y;
    if (!press.moved && Math.hypot(dx, dy) > 5) press.moved = true;
    if (press.moved) { pan = { x: press.px + dx, y: press.py + dy }; clampPan(); }
  }

  function up(e: PointerEvent) {
    if (press && !press.moved) click(tileAt(e), e);
    press = null;
  }

  function click(i: number, e: PointerEvent) {
    if (i < 0) return;
    if (ui.placing) { doFound(i); return; }
    const r = canvas.getBoundingClientRect();
    const a = animalAt(game, (((e.clientX - r.left) / r.width) * W) / T, (((e.clientY - r.top) / r.height) * H) / T, Math.max(0.5, 1.2 / ZOOM_STEPS[zi]));
    if (a) { followAnimal(a.id); return; }
    if (ui.view === 'habitats' && game.habitats[bucketOf(game, i)]?.shown) { selectPlace(bucketOf(game, i)); ui.selected = i; return; }
    selectTile(i);
  }

  const NAMES: Partial<Record<View, string>> = { none: 'Garden', zones: 'Zones', variants: 'Variants', animals: 'Animals', habitats: 'Habitats' };
  const label = (v: View) => NAMES[v] ?? FIELDS[v as LayerId].name;
</script>

<section class="map" bind:this={wrap}>
  <div
    class="viewport"
    class:placing={!!ui.placing}
    class:grabbing={press?.moved}
    bind:this={viewport}
    style:width="{W * fitScale}px"
    style:height="{H * fitScale}px"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointerleave={() => (ui.hover = -1)}
    oncontextmenu={(e) => { e.preventDefault(); ui.placing = null; }}
    role="application"
  >
    <canvas
      bind:this={canvas}
      style:width="{W * scale}px"
      style:height="{H * scale}px"
      style:transform="translate({pan.x}px, {pan.y}px)"
    ></canvas>
    {#if ui.view === 'habitats'}
      {#each habitatCards as l (l.p)}
        <button class="label card" class:on={l.p === ui.place} style:left="{l.x * scale + pan.x}px" style:top="{l.y * scale + pan.y}px"
          onpointerdown={(e) => e.stopPropagation()} onclick={() => selectPlace(l.p)} title={l.name}>
          {#if zi > 0}<span>{l.name}</span>{/if}
          <span class="icons">{#each l.cards as c (c.k)}<SlotIcon slot={c} size={8} />{/each}</span>
        </button>
      {/each}
    {:else if zi > 0}
      {#each labels as l (l.name)}
        <span class="label" style:left="{l.x * scale + pan.x}px" style:top="{l.y * scale + pan.y}px">{l.name}</span>
      {/each}
    {/if}
    {#if ui.banner}{#key ui.banner.id}<div class="banner panel">{ui.banner.text}</div>{/key}{/if}
  </div>

  <div class="panel tools">
    <span class="group">
      <button onclick={() => zoomTo(zi - 1)} disabled={zi === 0} title="Zoom out (mouse wheel)">−</button>
      <button onclick={() => zoomTo(zi + 1)} disabled={zi === ZOOM_STEPS.length - 1} title="Zoom in (mouse wheel)">+</button>
      <button onclick={() => zoomTo(0)} disabled={zi === 0}>Fit</button>
    </span>
    <span class="group">
      {#each VIEWS as v, k (v)}
        <button class:on={ui.view === v} onclick={() => (ui.view = v)} title="Key {k + 1}">{label(v)}</button>
      {/each}
    </span>
  </div>
  <div class="panel readout"><MapReadout /></div>
  <EventFeed />
</section>

<style>
  .map { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .viewport { position: relative; overflow: hidden; border: 3px solid var(--ink); box-shadow: 0 0 0 2px var(--edge);
    background: #142a44; cursor: grab; touch-action: none; box-sizing: content-box; }
  .viewport.placing { cursor: crosshair; }
  .viewport.grabbing { cursor: grabbing; }
  canvas { position: absolute; left: 0; top: 0; image-rendering: pixelated; display: block; transform-origin: 0 0; }
  .label { position: absolute; transform: translate(-50%, -100%); pointer-events: none; white-space: nowrap; font-size: 14px;
    color: var(--text); text-shadow: 1px 1px 0 var(--ink), -1px 1px 0 var(--ink), 1px -1px 0 var(--ink), -1px -1px 0 var(--ink); }
  .label.card { transform: translate(-50%, -50%); font-size: 13px; pointer-events: auto; cursor: pointer; display: flex; flex-direction: column;
    align-items: center; gap: 2px; padding: 2px; margin: 0; background: #140f0b99; border: 1px solid transparent; box-shadow: none; }
  .label.card:hover, .label.card.on { color: var(--gold); background: #140f0bcc; border-color: var(--gold); }
  .icons { display: grid; grid-template-columns: repeat(3, auto); gap: 3px; }
  .banner { position: absolute; left: 50%; top: 12px; transform: translateX(-50%); max-width: 80%; padding: 6px 14px; text-align: center;
    color: var(--gold); border-color: var(--gold); pointer-events: none; animation: drop 4s steps(8) forwards; }
  @keyframes drop { 0% { opacity: 0; } 8%, 88% { opacity: 1; } 100% { opacity: 0; } }
  .tools { display: flex; gap: 14px; align-items: center; justify-content: space-between; width: 100%; height: 44px; padding: 2px 10px; }
  .readout { width: 100%; height: 56px; padding: 4px 10px; overflow: hidden; }
  .group { display: flex; gap: 2px; }
</style>
