// Toy: a Life, the screen. Shared by toys/life2.html and toys/garden.html. The host passes in a board and gets the finished Life back.
import { COLS, NODES, PARTS, PLANS, ROWS, RULE, STAGES, TERRAIN, TURNS, type PartId, type PlanId } from './life2-data';
import { NO_PREDATOR, type Habitat } from './life2-habitats';
import {
  at, begin, canLay, canMoult, clutch, dests, eventOn, foraging, giveVariant, hitOn, known, lay, lockOf, mature, moult, moultCost, move, newLife, nextTier,
  oxygenMax, partsOn, placeAt, range, sense, starterPool, startersLeft, stay, tierOf, tunnel, upkeep, xy, type Dest, type Dir, type Hit, type Life, type Lineage,
} from './life2-sim';
import { BODY_H, BODY_SCALE, BODY_W, C, SCALE, draw, drawBody, icon, slotAt, tileAt } from './life2-view';

export interface LifeHost {
  board(): Habitat; // asked each time a Life opens
  lineage(): Lineage;
  over(l: Life): void; // once, when the Life ends
  leave(): void;
}

const HTML = `
  <section>
    <div class="frame"><div><div style="padding: 6px"><canvas id="board"></canvas></div></div></div>
    <div class="hover sh1" id="hover"></div>
    <div id="parts"></div>
    <div class="frame" id="logbox" style="margin-top: 8px"><div><div><div class="log" id="log"></div></div></div></div>
  </section>
  <aside>
    <div class="frame"><div><div>
      <div class="row"><span class="label sh1" id="turn"></span><span class="muted" id="where"></span></div>
      <div class="track" id="track"></div>
      <div class="muted" id="forecast" style="margin-top: 6px"></div>
    </div></div></div>
    <div class="frame" id="scorebox"><div><div>
      <div class="row">
        <div><div class="label sh1">Eggs</div><span class="eggs sh" id="eggs"></span> <span class="muted" id="next"></span></div>
        <span class="tier" id="tier"></span>
      </div>
      <div class="stocks" id="stocks" style="margin-top: 8px"></div>
      <div class="muted" id="stats" style="margin-top: 6px"></div>
    </div></div></div>
    <div class="frame"><div><div>
      <div class="label sh1" id="bodyname"></div>
      <canvas id="body"></canvas>
      <div class="muted">Top row: your left side. Bottom row: your right side.</div>
      <div id="panel"></div>
    </div></div></div>
    <details class="muted">
      <summary>Rules</summary>
      <p>Each turn: move (click a marked tile), lay eggs, or stay and turn. Then you pay upkeep, rivals feed, and the predator acts.
      Landing on food eats it unless it's locked. Moulting costs food, adds a size and gives you a part; it doesn't use your turn.</p>
      <p>You can lay from size 3. A lay costs 4 food and gives (1 + pouches) × size eggs. Out of food: your body absorbs its newest
      part, then you lose health. Out of oxygen: you lose health. Reaching size 5 heals you.</p>
      <p>The predator hunts you and marks the tiles it will strike next, but it won't enter dead water. A strike from your side tears off
      a part on that side, or costs 1 health if the side is bare. A guard on that side blocks it. You face the way you last moved, so
      how you arrive decides which side it hits.</p>
      <p>Eggs you laid count even if you die. A rare part only joins your lineage if you lay an egg after getting it. Each habitat holds its own rare parts.</p>
    </details>
  </aside>`;

const DIRS = ['north', 'east', 'south', 'west'];

export function mountLife(root: HTMLElement, host: LifeHost) {
  root.innerHTML = HTML;
  const $ = (id: string) => document.getElementById(id)!;
  const cv = $('board') as HTMLCanvasElement, g2 = cv.getContext('2d')!;
  cv.width = COLS * C; cv.height = ROWS * C; cv.style.width = `${COLS * C * SCALE}px`;
  const bodyCv = $('body') as HTMLCanvasElement, bg = bodyCv.getContext('2d')!;
  bodyCv.width = BODY_W; bodyCv.height = BODY_H; bodyCv.style.width = `${BODY_W * BODY_SCALE}px`;

  let plan: PlanId = 'arthropod', l: Life | null = null, hover = -1, hoverSlot = -1, note = '', done = false;

  function open(opts: { plan?: PlanId; gift?: PartId } = {}) {
    if (opts.plan) plan = opts.plan;
    l = newLife(Date.now() % 1e9, plan, host.lineage(), host.board());
    if (opts.gift) giveVariant(l, opts.gift);
    hover = hoverSlot = -1; note = ''; done = false;
    root.hidden = false;
    render();
  }
  const close = () => { root.hidden = true; l = null; };

  function hitText(h: Hit): string {
    if (h.kind === 'buried') return 'Strike misses: you are buried.';
    if (h.kind === 'enrolled') return 'Strike glances off: you roll up.';
    if (h.kind === 'blocked') return `Strike on your ${h.side}: your ${PARTS[h.part!].name.toLowerCase()} blocks it.`;
    const tear = h.tear >= 0 ? `your ${PARTS[h.part!].name.toLowerCase()} is torn off` : '';
    const dmg = h.damage ? `−${h.damage} health` : '';
    return `Strike on your ${h.side}: ${[tear, dmg].filter(Boolean).join(', ')}.`;
  }

  function tileText(l: Life, i: number): string {
    const t = l.tiles[i], [x, y] = xy(i), parts: string[] = [];
    const d: Dest | undefined = dests(l).get(i);
    if (d) {
      if (d.grab) parts.push('Click: grab it without moving.');
      else parts.push(`Click: ${d.path.length > 1 && l.plan === 'worm' ? 'tunnel' : 'move'} here, facing ${DIRS[d.dir]}.`);
      const tx = d.grab ? l.x : x, ty = d.grab ? l.y : y;
      if (l.pred?.marks.includes(at(tx, ty))) parts.push(hitText(hitOn(l, l.pred.dir, d.dir, !d.grab, tx, ty)));
      else if (l.pred?.marks.length) parts.push('Clear of the strike.');
    }
    for (const v of l.rivals) if (v.x === x && v.y === y) parts.push(`A rival: ${v.name}. It eats the nearest ${NODES[v.eats].name.toLowerCase()}.`);
    if (l.pred && l.pred.x === x && l.pred.y === y) parts.push(`The predator, ${l.hab.predator}: ${l.pred.state === 'rest' ? 'recovering.' : l.pred.state === 'strike' ? 'about to strike the marked tiles.' : 'hunting you, 2 tiles a turn.'}`);
    if (t.node && known(t)) {
      const n = NODES[t.node], lock = lockOf(l, t.node);
      parts.push(`${n.name}, +${n.food} food${lock ? `: ${lock}` : ''}. ${n.real}`);
    } else parts.push(TERRAIN[t.t] + (t.t === 'mud' && !t.seen ? ', unexplored' : '') + '.');
    return parts.join(' ');
  }

  function card(l: Life, id: PartId, on: boolean): HTMLButtonElement {
    const p = PARTS[id], el = document.createElement('button'), ic = document.createElement('canvas');
    el.className = `card${p.rare ? ' rare' : ''}${on ? ' on' : ''}`;
    icon(ic, id);
    el.append(ic);
    el.insertAdjacentHTML('beforeend', `<b>${p.rare ? 'RARE: ' : ''}${p.name}</b><small>${p.does}</small><small>${p.upkeep ? `−${p.upkeep} food a turn` : 'no upkeep'} · ${p.slots.join(' or ')}</small>`);
    el.onmouseenter = () => { note = p.real; $('hover').textContent = note; };
    el.onclick = () => { l.held = l.held === id ? null : id; render(); };
    return el;
  }

  /** The parts you can pick right now, under the board so all of them show at once. */
  function partsPanel(l: Life) {
    const box = $('parts');
    box.innerHTML = '';
    const ids = l.phase === 'build' ? starterPool(l) : l.phase === 'offer' ? l.offers : [];
    ids.forEach((id) => box.append(card(l, id, l.held === id)));
    $('logbox').hidden = l.phase === 'build';
  }

  function panel(l: Life) {
    const box = $('panel');
    box.innerHTML = '';
    if (l.phase === 'build') {
      const plans = document.createElement('div');
      plans.className = 'row'; plans.style.marginTop = '6px';
      const grp = document.createElement('div'); grp.className = 'grp';
      (Object.keys(PLANS) as PlanId[]).forEach((id) => {
        const b = document.createElement('button');
        b.textContent = PLANS[id].name; b.className = id === plan ? 'on' : '';
        b.onclick = () => open({ plan: id });
        grp.append(b);
      });
      const go = document.createElement('button');
      go.className = 'big'; go.innerHTML = 'Begin <kbd>Enter</kbd>';
      go.onclick = () => { begin(l); render(); };
      plans.append(grp, go); box.append(plans);
      box.insertAdjacentHTML('beforeend', `<div class="muted" style="margin-top: 6px">${PLANS[plan].blurb} ${PLANS[plan].real}</div><div class="label sh1" style="margin-top: 8px">Starter parts: ${startersLeft(l)} left. Pick one below the board, then click a slot here. Click a filled slot to clear it.</div>`);
    } else if (l.phase === 'offer') {
      box.insertAdjacentHTML('beforeend', `<div class="label sh1" style="margin-top: 8px">You grew! Pick a part below the board, then click a slot. A filled slot swaps out its part.</div>`);
    } else if (l.phase === 'play') {
      const row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '8px'; row.style.alignItems = 'flex-start';
      const acts = document.createElement('div'); acts.style.cssText = 'display: flex; flex-direction: column; gap: 4px; flex: 1';
      const mb = document.createElement('button'), lb = document.createElement('button');
      mb.innerHTML = l.size >= RULE.maxSize ? 'Full grown' : `Moult: −${moultCost(l)} food, grow <kbd>M</kbd>`;
      mb.disabled = !canMoult(l); mb.onclick = () => { moult(l); render(); };
      mb.onmouseenter = () => { $('hover').textContent = PLANS[l.plan].soft ? 'Moulting makes you soft this turn: a strike costs 1 more health. It does not use your turn.' : 'Growing does not use your turn.'; };
      lb.innerHTML = mature(l) ? `Lay: −${RULE.layCost} food, +${clutch(l)} eggs <kbd>L</kbd>` : `Lay: from size ${RULE.adultSize}`;
      lb.onmouseenter = () => { $('hover').textContent = 'Laying uses your turn, so you stay where you are, facing the same way.'; };
      lb.disabled = !canLay(l); lb.onclick = () => { lay(l); render(); };
      acts.append(mb, lb);
      const pad = document.createElement('div'); pad.className = 'pad';
      const arrows: [string, Dir | null][] = [['', null], ['↑', 0], ['', null], ['←', 3], ['·', l.facing], ['→', 1], ['', null], ['↓', 2], ['', null]];
      arrows.forEach(([txt, d]) => {
        if (d === null) { pad.append(document.createElement('span')); return; }
        const b = document.createElement('button');
        b.textContent = txt; b.title = txt === '·' ? 'Stay (Space)' : `Stay and face ${DIRS[d]} (arrow key)`;
        b.classList.toggle('on', d === l.facing && txt !== '·');
        b.onclick = () => { stay(l, d); render(); };
        b.onmouseenter = () => {
          const p = l.pred;
          $('hover').textContent = `Stay here, facing ${DIRS[d]}.` + (p?.marks.includes(at(l.x, l.y)) ? ` ${hitText(hitOn(l, p.dir, d, false, l.x, l.y))}` : '');
        };
        pad.append(b);
      });
      row.append(acts, pad); box.append(row);
      if (l.pred?.marks.includes(at(l.x, l.y))) box.insertAdjacentHTML('beforeend', `<div class="danger sh1">You are marked. If you stay: ${hitText(hitOn(l, l.pred.dir, l.facing, false, l.x, l.y))}</div>`);
      if (l.rareGot && !l.rarePassed) box.insertAdjacentHTML('beforeend', `<div class="passed sh1" style="font-size: 13px; margin-top: 4px">${PARTS[l.rareGot].name} is not passed on yet. Lay an egg, or it dies with you.</div>`);
    } else {
      const was = l.lineage, rare = l.rareGot;
      const lines = [l.cause === 'died' ? `<b class="down">You died on turn ${l.turn}.</b> The eggs you laid still count.` : '<b class="up">You lived to the end of the season.</b>'];
      if (rare) lines.push(l.rarePassed ? `<span class="passed">${PARTS[rare].name} passed on: you can start with it from now on.</span>` : `<span class="down">${PARTS[rare].name} died with you. No egg carried it.</span>`);
      lines.push(`You ate ${l.eaten} food.${foraging(was.xp) < 2 && foraging(l.xp) >= 2 ? ' <span class="up">Foraging 2: sponge gardens are open!</span>' : ''}`);
      lines.push(`<span class="muted">${l.eggs} eggs join the population in the ${l.hab.name.toLowerCase()}.</span>`);
      box.insertAdjacentHTML('beforeend', `<div style="margin-top: 8px; font-size: 14px">${lines.join('<br>')}</div>`);
      const row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '8px';
      const again = document.createElement('button'); again.className = 'big'; again.innerHTML = 'Live here again <kbd>N</kbd>';
      again.onclick = () => open();
      const back = document.createElement('button'); back.className = 'big'; back.innerHTML = 'Garden <kbd>G</kbd>';
      back.onclick = host.leave;
      row.append(again, back); box.append(row);
    }
  }

  function render() {
    if (!l) return;
    if (l.phase === 'over' && !done) { done = true; host.over(l); }
    draw(g2, l, hover);
    drawBody(bg, l, hoverSlot);
    const h0 = l.hab, ev = h0.event, hunted = h0.predatorAt !== NO_PREDATOR;
    $('turn').textContent = l.phase === 'build' ? 'Before the Life: look at the board' : `Turn ${l.turn} of ${TURNS}`;
    $('where').textContent = h0.name;
    const track = $('track');
    track.innerHTML = '';
    for (let k = 1; k <= TURNS; k++) {
      const c = document.createElement('i');
      c.className = [k < l.turn ? 'done' : k === l.turn && l.phase !== 'build' ? 'now' : '', k === h0.predatorAt ? 'pred' : '', k >= ev.from && k <= ev.to ? 'low' : ''].join(' ');
      track.append(c);
    }
    $('forecast').innerHTML = `${hunted ? `<span class="down">${h0.predator}: turn ${h0.predatorAt}</span> (dashed tile)` : '<span class="up">No predator here right now</span>'}${ev.name ? ` · <span class="w">${ev.name}, turns ${ev.from}–${ev.to}: ${ev.text}</span>` : ''}`;
    $('eggs').textContent = String(l.eggs);
    const nx = nextTier(h0, l.eggs);
    $('next').textContent = nx ? `${nx[0]} at ${nx[1]}` : 'top tier';
    const t = $('tier'), tr = tierOf(h0, l.eggs);
    t.textContent = tr; t.dataset.t = tr;
    $('scorebox').classList.toggle('gold', l.phase === 'over');
    const here = l.tiles[at(l.x, l.y)].t, low = (eventOn(l) && (ev.where === 'all' || ev.where === here)) || here === 'dead';
    $('stocks').innerHTML = `<span class="e sh1">Food</span><b class="e sh1">${l.food}</b><span class="muted">−${upkeep(l)} a turn</span>`
      + `<span class="w sh1">Oxygen</span><b class="w sh1">${l.oxygen}/${oxygenMax(l)}</b><span class="muted">${low ? '−1 this turn' : '+1 a turn; −1 in dead water'}</span>`
      + `<span class="down sh1">Health</span><b class="down sh1">${l.health}/${RULE.health}</b><span class="muted">${l.soft ? 'soft: strikes cost 1 more' : 'heals only when full grown'}</span>`;
    $('stats').textContent = `Moves ${l.plan === 'worm' ? `1, tunnels ${tunnel(l)}` : range(l)} · senses ${sense(l) > 10 ? 'all' : sense(l)} · a lay gives ${clutch(l)} eggs${mature(l) ? '' : ` once you are size ${RULE.adultSize}`}`;
    $('bodyname').textContent = `${PLANS[l.plan].name}: ${STAGES[l.size - 1]}, size ${l.size} of ${RULE.maxSize} · ${partsOn(l).length}/${l.slots.length} parts`;
    $('log').innerHTML = l.log.slice().reverse().map((m, k) => `<div style="opacity: ${1 - k * 0.17}">${m}</div>`).join('') || '<span class="muted">Hover anything to see what it does.</span>';
    panel(l);
    partsPanel(l);
    const h = $('hover');
    if (hoverSlot >= 0) {
      const s = l.slots[hoverSlot];
      h.textContent = s.part ? `${PARTS[s.part].name}, on your ${s.side}: ${PARTS[s.part].does} ${PARTS[s.part].real}` : `Empty ${s.kind === 'side' ? `${s.side} side` : s.kind} slot.`;
    } else if (hover >= 0) h.textContent = tileText(l, hover);
    else h.textContent = note || (l.phase === 'build' ? `${h0.real} Look at the board first: what is locked, where the mud is, where the predator comes from.` : '');
  }

  const pos = (el: HTMLCanvasElement, e: MouseEvent, w: number, h: number): [number, number] => {
    const b = el.getBoundingClientRect();
    return [Math.floor(((e.clientX - b.left) / b.width) * w), Math.floor(((e.clientY - b.top) / b.height) * h)];
  };
  cv.onmousemove = (e) => { const [x, y] = pos(cv, e, COLS, ROWS), i = tileAt(x, y); if (i !== hover) { hover = i; hoverSlot = -1; render(); } };
  cv.onmouseleave = () => { hover = -1; render(); };
  cv.onclick = (e) => { const [x, y] = pos(cv, e, COLS, ROWS), i = tileAt(x, y); if (l && i >= 0 && l.phase === 'play') { move(l, i); render(); } };
  bodyCv.onmousemove = (e) => { if (!l) return; const [x, y] = pos(bodyCv, e, BODY_W, BODY_H), k = slotAt(l, x, y); if (k !== hoverSlot) { hoverSlot = k; hover = -1; render(); } };
  bodyCv.onmouseleave = () => { hoverSlot = -1; render(); };
  bodyCv.onclick = (e) => { if (!l) return; const [x, y] = pos(bodyCv, e, BODY_W, BODY_H), k = slotAt(l, x, y); if (k >= 0) { placeAt(l, k); render(); } };
  document.addEventListener('click', () => (document.activeElement as HTMLElement | null)?.blur?.()); // so Space never re-presses a button
  window.addEventListener('keydown', (e) => {
    if (!l) return;
    const k = e.key, keys: Record<string, Dir> = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
    if (k === 'g' || k === 'G') { host.leave(); return; }
    if ((k === 'n' || k === 'N') && l.phase === 'over') { open(); return; }
    if (k === 'Enter' && l.phase === 'build') { e.preventDefault(); begin(l); }
    else if (k === 'm' || k === 'M') moult(l);
    else if (k === 'l' || k === 'L') lay(l);
    else if (k === ' ') { e.preventDefault(); stay(l); }
    else if (keys[k] !== undefined) { e.preventDefault(); stay(l, keys[k]); }
    else if (['1', '2', '3', '4'].includes(k) && l.phase === 'offer' && l.offers[+k - 1]) l.held = l.offers[+k - 1];
    else return;
    render();
  });
  return { open, close };
}
