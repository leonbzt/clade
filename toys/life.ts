// Toy: a Life, the page. Build a starter body, then click tiles to move; moult and lay from the panel.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import { COLS, LOW_OXYGEN, NODES, PARTS, PLANS, PREDATOR_AT, ROWS, RULE, TERRAIN, TURNS, type PartId, type PlanId } from './life-data';
import {
  at, begin, canLay, canMoult, clutch, dests, finish, foraging, hitOn, isLow, known, lay, lockOf, moult, moultCost, move, newLife, newLineage,
  nextTier, oxygenMax, placeAt, range, sense, starterPool, startersLeft, stay, tierOf, upkeep, xy, type Dest, type Dir, type Hit, type Life, type Lineage,
} from './life-sim';
import { BODY_H, BODY_SCALE, BODY_W, C, SCALE, draw, drawBody, icon, slotAt, tileAt } from './life-view';

const $ = (id: string) => document.getElementById(id)!;
const cv = $('board') as HTMLCanvasElement, g2 = cv.getContext('2d')!;
cv.width = COLS * C; cv.height = ROWS * C; cv.style.width = `${COLS * C * SCALE}px`;
const bodyCv = $('body') as HTMLCanvasElement, bg = bodyCv.getContext('2d')!;
bodyCv.width = BODY_W; bodyCv.height = BODY_H;

const KEY = 'clade-life-toy';
function load(): Lineage {
  try { return { ...newLineage(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return newLineage(); }
}
function save(v: Lineage) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* the toy still plays */ } }

let lineage = load(), plan: PlanId = 'arthropod', l: Life = newLife(Date.now() % 1e9, plan, lineage), hover = -1, hoverSlot = -1, note = '', done = false;
const start = (seed: number) => { l = newLife(seed, plan, lineage); hover = hoverSlot = -1; note = ''; done = false; render(); };
const DIRS = ['north', 'east', 'south', 'west'];

function hitText(h: Hit): string {
  if (h.kind === 'buried') return 'Strike misses: you are buried.';
  if (h.kind === 'enrolled') return 'Strike glances off: you roll up.';
  if (h.kind === 'blocked') return `Strike on your ${h.side}: your ${PARTS[h.part!].name.toLowerCase()} blocks it.`;
  const tear = h.tear >= 0 ? `your ${PARTS[h.part!].name.toLowerCase()} is torn off` : '';
  const dmg = h.damage ? `−${h.damage} health` : '';
  return `Strike on your ${h.side}: ${[tear, dmg].filter(Boolean).join(', ')}.`;
}

function tileText(i: number): string {
  const t = l.tiles[i], [x, y] = xy(i), parts: string[] = [];
  const d: Dest | undefined = dests(l).get(i);
  if (d) {
    if (d.grab) parts.push('Click: grab it without moving.');
    else parts.push(`Click: move here, facing ${DIRS[d.dir]}.`);
    const tx = d.grab ? l.x : x, ty = d.grab ? l.y : y;
    if (l.pred?.marks.includes(at(tx, ty))) parts.push(hitText(hitOn(l, l.pred.dir, d.dir, !d.grab, tx, ty)));
    else if (l.pred?.marks.length) parts.push('Clear of the strike.');
  }
  if (l.rival.x === x && l.rival.y === y) parts.push('A rival grazer: it eats the nearest mat.');
  if (l.pred && l.pred.x === x && l.pred.y === y) parts.push(`The predator, Anomalocaris: ${l.pred.state === 'rest' ? 'recovering.' : l.pred.state === 'strike' ? 'about to strike the marked tiles.' : 'hunting you, 2 tiles a turn.'}`);
  if (t.node && known(t)) {
    const n = NODES[t.node], lock = lockOf(l, t.node);
    parts.push(`${n.name}, +${n.food} food${lock ? `: ${lock}` : ''}. ${n.real}`);
  } else parts.push(TERRAIN[t.t] + (t.t === 'mud' && !t.seen ? ', unexplored' : '') + '.');
  return parts.join(' ');
}

function card(id: PartId, on: boolean): HTMLButtonElement {
  const p = PARTS[id], el = document.createElement('button'), ic = document.createElement('canvas');
  el.className = `card${p.rare ? ' rare' : ''}${on ? ' on' : ''}`;
  icon(ic, id);
  el.append(ic);
  el.insertAdjacentHTML('beforeend', `<b>${p.rare ? 'RARE: ' : ''}${p.name}</b><small>${p.does}</small><small>${p.upkeep ? `−${p.upkeep} food a turn` : 'no upkeep'} · goes on: ${p.slots.join(' or ')}</small>`);
  el.onmouseenter = () => { note = p.real; $('hover').textContent = note; };
  el.onclick = () => { l.held = l.held === id ? null : id; render(); };
  return el;
}

function panel() {
  const box = $('panel'), scrolled = box.querySelector('.cards')?.scrollTop ?? 0;
  box.innerHTML = '';
  if (l.phase === 'build') {
    const plans = document.createElement('div'), left = startersLeft(l);
    plans.className = 'row'; plans.style.marginTop = '6px';
    const grp = document.createElement('div'); grp.className = 'grp';
    (Object.keys(PLANS) as PlanId[]).forEach((id) => {
      const b = document.createElement('button');
      b.textContent = PLANS[id].name; b.className = id === plan ? 'on' : '';
      b.onclick = () => { plan = id; start(l.seed); };
      grp.append(b);
    });
    const go = document.createElement('button');
    go.className = 'big'; go.innerHTML = 'Begin <kbd>Enter</kbd>';
    go.onclick = () => { begin(l); render(); };
    plans.append(grp, go); box.append(plans);
    box.insertAdjacentHTML('beforeend', `<div class="muted" style="margin-top: 6px">${PLANS[plan].blurb} ${PLANS[plan].real}</div><div class="label sh1" style="margin-top: 8px">Starter parts: ${left} left. Pick one, then click a slot. Click a filled slot to clear it.</div>`);
    const cards = document.createElement('div'); cards.className = 'cards';
    starterPool(l).forEach((id) => cards.append(card(id, l.held === id)));
    box.append(cards);
    cards.scrollTop = scrolled;
  } else if (l.phase === 'offer') {
    box.insertAdjacentHTML('beforeend', `<div class="label sh1" style="margin-top: 8px">New segment! Pick a part, then click a slot.</div>`);
    const cards = document.createElement('div'); cards.className = 'cards open';
    l.offers.forEach((id) => cards.append(card(id, l.held === id)));
    box.append(cards);
  } else if (l.phase === 'play') {
    const row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '8px'; row.style.alignItems = 'flex-start';
    const acts = document.createElement('div'); acts.style.cssText = 'display: flex; flex-direction: column; gap: 4px; flex: 1';
    const mb = document.createElement('button'), lb = document.createElement('button');
    mb.innerHTML = l.segments >= PLANS[l.plan].maxSegments ? 'Fully grown' : `Moult: −${moultCost(l)} food, grow <kbd>M</kbd>`;
    mb.disabled = !canMoult(l); mb.onclick = () => { moult(l); render(); };
    mb.onmouseenter = () => { $('hover').textContent = PLANS[l.plan].soft ? 'Moulting makes you soft this turn: a strike costs 1 more health. It does not use your turn.' : 'Growing does not use your turn.'; };
    lb.innerHTML = `Lay: −${RULE.layCost} food, +${clutch(l)} eggs <kbd>L</kbd>`;
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
    lines.push(`<span class="muted">Later, these ${l.eggs} eggs would found your species in the biome.</span>`);
    box.insertAdjacentHTML('beforeend', `<div style="margin-top: 8px; font-size: 14px">${lines.join('<br>')}</div>`);
    const row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '8px';
    const again = document.createElement('button'); again.className = 'big'; again.innerHTML = 'Next Life <kbd>N</kbd>';
    again.onclick = () => start(Date.now() % 1e9);
    row.append(again); box.append(row);
  }
}

function render() {
  if (l.phase === 'over' && !done) { lineage = finish(l); save(lineage); done = true; }
  draw(g2, l, hover);
  drawBody(bg, l, hoverSlot);
  bodyCv.style.width = `${BODY_W * BODY_SCALE}px`;
  $('turn').textContent = l.phase === 'build' ? 'Before the Life: look at the board' : `Turn ${l.turn} of ${TURNS}`;
  const track = $('track');
  track.innerHTML = '';
  for (let k = 1; k <= TURNS; k++) {
    const c = document.createElement('i');
    c.className = [k < l.turn ? 'done' : k === l.turn && l.phase !== 'build' ? 'now' : '', k === PREDATOR_AT ? 'pred' : '', isLow(k) ? 'low' : ''].join(' ');
    track.append(c);
  }
  $('forecast').innerHTML = `<span class="down">Predator: turn ${PREDATOR_AT}</span> (dashed tile) · <span class="w">Low oxygen: turns ${LOW_OXYGEN[0]}–${LOW_OXYGEN[1]}</span>`;
  $('eggs').textContent = String(l.eggs);
  const nx = nextTier(l.eggs);
  $('next').textContent = nx ? `${nx[0]} at ${nx[1]}` : 'top tier';
  const t = $('tier'), tr = tierOf(l.eggs);
  t.textContent = tr; t.dataset.t = tr;
  $('scorebox').classList.toggle('gold', l.phase === 'over');
  const low = isLow(l.turn) || l.tiles[at(l.x, l.y)].t === 'dead';
  $('stocks').innerHTML = `<span class="e sh1">Food</span><b class="e sh1">${l.food}</b><span class="muted">−${upkeep(l)} a turn</span>`
    + `<span class="w sh1">Oxygen</span><b class="w sh1">${l.oxygen}/${oxygenMax(l)}</b><span class="muted">${low ? '−1 this turn' : '+1 a turn; −1 in dead water'}</span>`
    + `<span class="down sh1">Health</span><b class="down sh1">${l.health}/${RULE.health}</b><span class="muted">${l.soft ? 'soft: strikes cost 1 more' : 'does not heal'}</span>`;
  $('stats').textContent = `Size ${l.segments} · moves ${l.plan === 'worm' ? 1 : range(l)} · senses ${sense(l) > 10 ? 'all' : sense(l)} · a lay gives ${clutch(l)} eggs`;
  $('bodyname').textContent = `${PLANS[l.plan].name}, facing ${DIRS[l.facing]}`;
  $('log').innerHTML = l.log.slice().reverse().map((m, k) => `<div style="opacity: ${1 - k * 0.17}">${m}</div>`).join('') || '<span class="muted">Hover anything to see what it does.</span>';
  const fl = foraging(lineage.xp);
  $('lineage').innerHTML = `Foraging ${fl}${fl < 2 ? ` (${l.xp}/${RULE.foragingAt} food eaten; level 2 opens sponge gardens)` : ''}<br>`
    + `Passed on: ${lineage.rare.length ? lineage.rare.map((id) => `<span class="passed">${PARTS[id].name}</span>`).join(', ') : 'nothing yet'}<br>`
    + `Best: worm ${lineage.best.worm}, arthropod ${lineage.best.arthropod} · ${lineage.lives} Lives`;
  panel();
  const h = $('hover');
  if (hoverSlot >= 0) {
    const s = l.slots[hoverSlot];
    h.textContent = s.part ? `${PARTS[s.part].name}, on your ${s.side}: ${PARTS[s.part].does} ${PARTS[s.part].real}` : `Empty ${s.kind === 'side' ? `${s.side} side` : s.kind} slot.`;
  } else if (hover >= 0) h.textContent = tileText(hover);
  else h.textContent = note || (l.phase === 'build' ? 'Look at the board first: what is locked, where the mud is, where the predator comes from.' : '');
}

const pos = (el: HTMLCanvasElement, e: MouseEvent, w: number, h: number): [number, number] => {
  const b = el.getBoundingClientRect();
  return [Math.floor(((e.clientX - b.left) / b.width) * w), Math.floor(((e.clientY - b.top) / b.height) * h)];
};
cv.onmousemove = (e) => { const [x, y] = pos(cv, e, COLS, ROWS), i = tileAt(x, y); if (i !== hover) { hover = i; hoverSlot = -1; render(); } };
cv.onmouseleave = () => { hover = -1; render(); };
cv.onclick = (e) => { const [x, y] = pos(cv, e, COLS, ROWS), i = tileAt(x, y); if (i >= 0 && l.phase === 'play') { move(l, i); render(); } };
bodyCv.onmousemove = (e) => { const [x, y] = pos(bodyCv, e, BODY_W, BODY_H), k = slotAt(l, x, y); if (k !== hoverSlot) { hoverSlot = k; hover = -1; render(); } };
bodyCv.onmouseleave = () => { hoverSlot = -1; render(); };
bodyCv.onclick = (e) => { const [x, y] = pos(bodyCv, e, BODY_W, BODY_H), k = slotAt(l, x, y); if (k >= 0) { placeAt(l, k); render(); } };
$('again').onclick = () => start(l.seed);
$('fresh').onclick = () => start(Date.now() % 1e9);
$('reset').onclick = () => { lineage = newLineage(); save(lineage); start(l.seed); };
document.addEventListener('click', () => (document.activeElement as HTMLElement | null)?.blur?.()); // so Space never re-presses a button
window.onkeydown = (e) => {
  const k = e.key, keys: Record<string, Dir> = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
  if (k === 'n' || k === 'N') { start(Date.now() % 1e9); return; }
  if (k === 'Enter' && l.phase === 'build') { e.preventDefault(); begin(l); }
  else if (k === 'm' || k === 'M') moult(l);
  else if (k === 'l' || k === 'L') lay(l);
  else if (k === ' ') { e.preventDefault(); stay(l); }
  else if (keys[k] !== undefined) { e.preventDefault(); stay(l, keys[k]); }
  else if (['1', '2', '3', '4'].includes(k) && l.phase === 'offer' && l.offers[+k - 1]) l.held = l.offers[+k - 1];
  else return;
  render();
};
render();
