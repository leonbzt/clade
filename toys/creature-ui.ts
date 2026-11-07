// Toy 18: the side panel, the part picker and the family card's words. DOM only.
import { FROM_DATA, GAIT_IDS, LINEAGES, PARTS, RECIPES, STARTERS, type LineageId, type PartId, type Recipe } from './creature-data';
import { fits, MODES, progress, SIZE_MAX, SIZE_MIN, type Build, type Mode, type Slot } from './creature-model';
import { SHARED, gaitLines, lineageLines } from './creature-cost';
import type { State } from './creature';
import type { CrowdMode } from './creature-views';

export interface Actions {
  lineage(id: LineageId): void; size(n: number): void; view(v: State['view']): void; mono(on: boolean): void; native(on: boolean): void; walk(on: boolean): void;
  mode(m: Mode): void; extras(on: boolean): void; become(r: Recipe): void; back(): void; pin(): void; clearPins(): void; withParts(on: boolean): void; crowdMode(m: CrowdMode): void;
  pinCount(): number; withPartsOn(): boolean; crowdRead(): { ms: number; frame: number; mode: CrowdMode };
}
export interface Ui { refresh(): void; readCost(): void; sized(): void }

const NAMES: Record<string, string> = { front: 'Front', crown: 'Head top', side: 'Side pair', back: 'Back', tail: 'Tail' };
const count = (list: PartId[]) => { const o = new Map<PartId, number>(); for (const p of list) o.set(p, (o.get(p) ?? 0) + 1); return [...o].map(([p, n]) => (n > 1 ? `${PARTS[p].name} ×${n}` : PARTS[p].name)).join(', '); };

export function pickerHtml(b: Build, slot: Slot | null) {
  if (!slot) return '<span class="dim">Tap a slot on the creature, then pick a part.</span>';
  const now = b.parts[slot.id], kept = (p: PartId) => b.kept.filter((q) => q === p).length;
  const opts = (Object.keys(PARTS) as PartId[]).filter((p) => fits(p, slot.kind));
  return `<b>${NAMES[slot.kind]}</b><button data-part="" class="${now ? '' : 'on'}">Empty</button>` + opts.map((p) => `<button data-part="${p}" class="${now === p ? 'on' : ''}">${PARTS[p].name}${kept(p) ? ` <em>kept ${kept(p)}</em>` : ''}</button>`).join('');
}

export function cardHtml(S: State) {
  const b = S.became!, r = S.from!.recipe, list = (t: string, l: PartId[]) => (l.length ? `<div>${t}: ${count(l)}</div>` : '');
  return `<div><b>${b.build.name}</b>: ${LINEAGES[r.from].name} → ${LINEAGES[r.to].name}</div>` + list('Gained, drawn in', b.fused) + list('Gained, removable', b.onSlots) + list('Kept on the list', b.kept);
}

export function buildPanel(S: State, A: Actions): Ui {
  const panel = document.getElementById('panel')!, views = document.getElementById('views')!, sw = document.getElementById('switches')!;
  const on = (id: string, fn: () => void) => { document.getElementById(id)?.addEventListener('click', fn); };

  function top() {
    views.innerHTML = (['build', 'compare', 'crowd'] as const).map((v) => `<button data-v="${v}" class="${S.view === v ? 'on' : ''}">${{ build: 'Build', compare: 'Compare with today', crowd: 'Crowd of 50' }[v]}</button>`).join('');
    views.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => A.view(b.dataset.v as State['view'])));
    sw.innerHTML = `<button id="swMono" class="${S.mono ? 'on' : ''}">One colour</button><button id="swNative" class="${S.native ? 'on' : ''}">Native colours</button>`;
    on('swMono', () => A.mono(!S.mono)); on('swNative', () => A.native(!S.native));
  }

  function sizeRow() { return `<h2>Size <span id="sizeNum">${S.build.size}</span></h2><input id="size" type="range" min="${SIZE_MIN}" max="${SIZE_MAX}" step="1" value="${S.build.size}" />`; }
  function hookSize() { document.getElementById('size')?.addEventListener('input', (e) => A.size(+(e.target as HTMLInputElement).value)); }

  function buildView() {
    const btn = (id: LineageId) => `<button data-l="${id}" class="${S.build.lineage === id ? 'on' : ''}">${LINEAGES[id].name}</button>`;
    const here = RECIPES.filter((r) => r.from === S.build.lineage);
    const recipes = here.map((r) => {
      const p = progress(S.build, r);
      const rows = p.rows.map((q) => `<span class="${q.have >= q.need ? 'ok' : 'no'}">${PARTS[q.part].name} ${q.have}/${q.need}</span>`).join(' · ');
      return `<div class="recipe"><div><b>${LINEAGES[r.to].name}</b> <span class="dim">${p.have} of ${p.need} parts</span></div><div>${rows}</div><button data-r="${r.id}" ${p.ready ? '' : 'disabled'}>Become ${LINEAGES[r.to].name}</button></div>`;
    }).join('') || `<div class="dim">${S.from ? 'This form is a new animal. Try Back to feel a different way in.' : 'No recipe starts here: try Worm, Bristle worm or Arthropod.'}</div>`;
    const modes = MODES.map((m) => `<button data-m="${m.id}" class="${S.mode === m.id ? 'on' : ''}">${m.name}</button>`).join('');
    panel.innerHTML = `
      <div class="panel"><h2>Lineage</h2><div class="grp">${STARTERS.map(btn).join('')}</div>
        <div class="dim" style="margin-top: 4px">From data alone:</div><div class="grp">${FROM_DATA.map(btn).join('')}</div>
        <div class="dim" style="margin-top: 4px">${LINEAGES[S.build.lineage].blurb}</div></div>
      <div class="panel">${sizeRow()}
        <div class="grp" style="margin-top: 4px"><button id="pin">Pin to compare</button><button id="pins" ${A.pinCount() ? '' : 'disabled'}>Clear pins (${A.pinCount()})</button><button id="walk" class="${S.walk ? 'on' : ''}">Walk on the spot</button></div></div>
      <div class="panel"><h2>Recipes</h2>${recipes}
        <h2>How parts go in</h2><div class="stack">${modes}</div>
        <div class="dim" style="margin-top: 3px">${MODES.find((m) => m.id === S.mode)!.say}</div>
        <h2 style="margin-top: 6px">Your extra parts</h2><div class="grp"><button id="exList" class="${S.keepExtras ? '' : 'on'}">Go to the list</button><button id="exKeep" class="${S.keepExtras ? 'on' : ''}">Stay on the body</button></div>
        ${S.from ? '<div style="margin-top: 6px"><button id="back">Back to the parent</button></div>' : ''}
        ${S.build.kept.length ? `<div style="margin-top: 6px"><b>On the list:</b> ${count(S.build.kept)}</div>` : ''}</div>
      ${costPanel()}`;
    panel.querySelectorAll<HTMLButtonElement>('[data-l]').forEach((b) => b.addEventListener('click', () => A.lineage(b.dataset.l as LineageId)));
    panel.querySelectorAll<HTMLButtonElement>('[data-r]').forEach((b) => b.addEventListener('click', () => { const r = RECIPES.find((q) => q.id === b.dataset.r); if (r) A.become(r); }));
    panel.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.addEventListener('click', () => A.mode(b.dataset.m as Mode)));
    hookSize();
    on('exList', () => A.extras(false)); on('exKeep', () => A.extras(true)); on('pin', A.pin); on('pins', A.clearPins); on('walk', () => A.walk(!S.walk)); on('back', A.back);
  }

  function costPanel() {
    const rows = [...STARTERS, ...FROM_DATA].map((id) => `<tr><td>${LINEAGES[id].name}</td><td>${lineageLines(id)}</td></tr>`).join('');
    const gaits = GAIT_IDS.map((id) => `<tr><td>Gait: ${id}</td><td>${gaitLines(id)}</td></tr>`).join('');
    return `<div class="panel"><h2>Cost, in lines of source</h2><table>${rows}${gaits}<tr><td>The body (shared)</td><td>${SHARED.body}</td></tr><tr><td>The 11 parts (shared)</td><td>${SHARED.parts}</td></tr></table>
      <div class="dim" style="margin-top: 3px">Today: 80–195 lines a class. Draw time: see Crowd of 50.</div></div>`;
  }

  function compareView() {
    panel.innerHTML = `<div class="panel"><h2>Today against the new body</h2><div class="dim">Left: today's hand-written drawing. Right: the same animal as data. Same colours, same size, same path.</div></div>
      <div class="panel">${sizeRow()}<div style="margin-top: 4px"><button id="wp" class="${A.withPartsOn() ? 'on' : ''}">Same parts on both</button></div><div class="dim" style="margin-top: 3px">Only worms and arthropods have parts today.</div></div>`;
    hookSize();
    on('wp', () => A.withParts(!A.withPartsOn()));
  }

  function crowdView() {
    const r = A.crowdRead();
    panel.innerHTML = `<div class="panel"><h2>Fifty on screen</h2><div class="grp"><button id="cNew" class="${r.mode === 'new' ? 'on' : ''}">New body</button><button id="cOld" class="${r.mode === 'today' ? 'on' : ''}">Today's classes</button><button id="cFull" class="${r.mode === 'loaded' ? 'on' : ''}">New, loaded with parts</button></div>
      <div style="margin-top: 6px" id="crowdCost"></div><div class="dim" style="margin-top: 3px">Your machine, one main-thread frame with only these 50: the commands, then the whole frame with Pixi's geometry. A frame at 60 fps is 16.7 ms.</div></div>`;
    on('cNew', () => A.crowdMode('new')); on('cOld', () => A.crowdMode('today')); on('cFull', () => A.crowdMode('loaded'));
    readCost();
  }

  function readCost() {
    const el = document.getElementById('crowdCost');
    if (el) { const r = A.crowdRead(); el.textContent = `${r.ms.toFixed(1)} ms commands · ${r.frame.toFixed(1)} ms whole frame`; }
  }

  return {
    refresh() { top(); if (S.view === 'build') buildView(); else if (S.view === 'compare') compareView(); else crowdView(); },
    readCost,
    sized() { const el = document.getElementById('sizeNum'); if (el) el.textContent = String(S.build.size); },
  };
}
