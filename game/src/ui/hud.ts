// The screen around the board (DOM): season track, eggs and tier, stock bars that tick pip by pip, the three
// buttons, the info line, floaters, the banner, the red flash and the cards (start, moult, end).
import { PLANS, RULE, TURNS, VERBS, type VerbId } from '../data/life';
import * as L from '../sim/life';
import { verbNote } from '../sim/verbs';
import { speed } from '../sim/hunt';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const TIER_INK: Record<string, string> = { S: '#ffe033', A: '#7fd14e', B: '#5ec4d6', C: '#f3e9cc' };

/** A stock as a row of pips that ticks one pip at a time toward its value, with the number on the right. */
class PipBar {
  target = 0; shown = 0; max = 0; private acc = 0; private pips: HTMLElement[] = []; private more: HTMLElement;
  constructor(el: HTMLElement, private num: HTMLElement, private cap: number) {
    for (let k = 0; k < cap; k++) { const i = document.createElement('i'); el.appendChild(i); this.pips.push(i); }
    this.more = document.createElement('span'); this.more.className = 'more'; el.appendChild(this.more);
  }
  set(v: number, max = -1, instant = false) {
    this.target = v; if (max >= 0) this.max = max;
    if (instant) { this.shown = v; this.paint(-1); }
  }
  tick(dt: number) {
    if (this.shown === this.target) { this.acc = 0; return; }
    this.acc += dt;
    const step = Math.abs(this.target - this.shown) < 10 ? 0.045 : 0.022;
    while (this.acc >= step && this.shown !== this.target) {
      this.acc -= step;
      const up = this.target > this.shown;
      this.shown += up ? 1 : -1;
      this.paint(up ? this.shown - 1 : this.shown);
    }
  }
  private paint(changed: number) {
    const n = this.max > 0 ? Math.min(this.cap, this.max) : this.cap;
    this.pips.forEach((p, k) => {
      p.className = k >= n ? 'empty' : k < this.shown ? 'on' : '';
      p.style.display = k >= n && this.max > 0 ? 'none' : '';
      if (k === changed) { p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
    });
    this.more.textContent = this.shown > this.cap ? '+' : '';
    this.num.textContent = this.max > 0 ? `${this.shown}/${this.max}` : `${this.shown}`;
    if (changed >= 0) { this.num.classList.add('bump'); setTimeout(() => this.num.classList.remove('bump'), 90); }
  }
}

export class Hud {
  food = new PipBar($('food'), $('foodN'), 20);
  oxy = new PipBar($('oxy'), $('oxyN'), 20);
  hp = new PipBar($('hp'), $('hpN'), 20);
  card = $('cardWrap');
  private track: HTMLElement[] = [];
  private bannerT = 0;

  constructor(private on: { wait: () => void; moult: () => void; lay: () => void; verb: (v: VerbId) => void }) {
    for (let k = 0; k < TURNS; k++) { const i = document.createElement('i'); $('track').appendChild(i); this.track.push(i); }
    $('wait').onclick = on.wait; $('moult').onclick = on.moult; $('lay').onclick = on.lay;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      this.food.tick(dt); this.oxy.tick(dt); this.hp.tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  get cardOpen() { return !this.card.hidden; }

  refresh(l: L.Life, instant = false, busy = false) {
    $('turn').textContent = `Turn ${l.turn}/${TURNS}`;
    this.setEggs(l.eggs, L.tierOf(l.hab, l.eggs));
    this.track.forEach((c, k) => {
      const t = k + 1;
      c.className = (t < l.turn ? 'done' : t === l.turn ? 'now' : '') + (t >= l.hab.event.from && t <= l.hab.event.to ? ' ev' : '') + (t === l.hab.predatorAt ? ' pred' : '');
    });
    this.food.set(l.food, 0, instant);
    this.oxy.set(l.oxygen, L.oxygenMax(l), instant);
    this.hp.set(l.health, RULE.health, instant);
    const nt = L.nextTier(l.hab, l.eggs);
    const hunt = l.plan === 'swimmer' ? ` · speed ${speed(l)}${l.still ? ' (ambush)' : ''}${l.frenzy ? ` · frenzy ${l.frenzy}` : ''}` : '';
    $('body').textContent = `${l.hab.name} · ${PLANS[l.plan].name}, size ${l.size} (${L.stage(l)}) · upkeep ${L.upkeep(l)}${hunt}` +
      (L.mature(l) && nt ? ` · ${nt[0]} at ${nt[1]} eggs` : '');
    const play = l.phase === 'play' && !busy, w = $<HTMLButtonElement>('wait');
    w.disabled = !play; w.textContent = l.plan === 'swimmer' ? 'Lurk' : 'Wait';
    const m = $<HTMLButtonElement>('moult');
    m.textContent = l.size >= RULE.maxSize ? 'Full grown' : `Moult −${L.moultCost(l)}`;
    m.disabled = !play || !L.canMoult(l);
    const ly = $<HTMLButtonElement>('lay');
    ly.textContent = L.mature(l) ? `Lay +${L.clutch(l)}` : `Lay (size ${RULE.adultSize})`;
    ly.disabled = !play || !L.canLay(l);
    this.verbs(l, play);
  }

  /** One button per verb: its name, what it would do now, and its recharge as pips. */
  private verbs(l: L.Life, play: boolean) {
    const box = $('verbs');
    box.innerHTML = '';
    for (const v of L.verbs(l)) {
      const V = VERBS[v], b = document.createElement('button'), rc = l.recharge[v] ?? 0;
      b.className = (V.free ? 'free' : '') + (v === 'dash' && l.dash ? ' armed' : '');
      b.innerHTML = `${V.name}<small>${v === 'dash' && l.dash ? 'next move ×2' : verbNote(l, v)}</small><span class="rc">${Array.from({ length: V.recharge }, (_, k) => `<i class="${k < V.recharge - rc ? 'on' : ''}"></i>`).join('')}</span>`;
      b.disabled = !play || !L.ready(l, v) || (v === 'dash' && l.dash);
      b.onclick = () => this.on.verb(v);
      box.appendChild(b);
    }
  }

  setEggs(n: number, tier: string) {
    $('eggs').textContent = `Eggs ${n}`;
    const t = $('tier'); t.textContent = tier; t.style.color = TIER_INK[tier] ?? '#ff6a4c';
  }

  info(text: string) { $('info').textContent = text; }

  banner(text: string, color = '#ffd75e') {
    const b = $('banner');
    b.textContent = text; b.style.color = color; b.classList.add('on');
    clearTimeout(this.bannerT);
    this.bannerT = window.setTimeout(() => b.classList.remove('on'), 1800);
  }

  /** Text that rises from a point on the board (CSS pixels in the board area) and fades. */
  floater(x: number, y: number, text: string, color: string) {
    const f = document.createElement('div');
    f.className = 'floater'; f.textContent = text; f.style.color = color;
    f.style.left = `${Math.max(40, x)}px`; f.style.top = `${Math.max(44, y - 14)}px`;
    $('floaters').appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }

  flash(alpha: number) {
    const f = $('flash');
    f.style.transition = 'none'; f.style.opacity = `${alpha}`;
    void f.offsetWidth;
    f.style.transition = 'opacity 0.4s ease-out'; f.style.opacity = '0';
  }

  /** A centred card with a title, some text and a column of buttons. */
  showCard(title: string, text: string, buttons: { label: string; note?: string; rare?: boolean; on: () => void }[]) {
    $('cardTitle').textContent = title;
    const p = $('cardText'); p.textContent = text; p.hidden = !text;
    const box = $('cardButtons'); box.innerHTML = '';
    for (const b of buttons) {
      const el = document.createElement('button');
      el.textContent = b.label;
      if (b.rare) el.className = 'rare';
      if (b.note) { const s = document.createElement('small'); s.textContent = b.note; el.appendChild(s); }
      el.onclick = b.on;
      box.appendChild(el);
    }
    this.card.hidden = false;
    const c = $('card'); c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
  }
  hideCard() { this.card.hidden = true; }
}
