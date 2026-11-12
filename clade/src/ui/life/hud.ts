// Ported pip bars and feedback; controls read the Life's economy directly.
import { RULE, TURNS, VERBS } from '../../data/life';
import { ENFORCE_EFFECT, ENFORCE_HEADROOM } from '../../data/economy';
import { PARTS } from '../../data/parts';
import * as E from '../../sim/economy';
import * as L from '../../sim/life';
import { activeParts, mature } from '../../sim/life-body';
import { verbNote } from '../../sim/verbs';
import type { PartId, VerbId } from '../../sim/records';

import { FEEDBACK } from '../../view/shade';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
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
  private bannerT = 0;
  private timers = new Set<ReturnType<typeof setTimeout>>();

  constructor(private on: { wait: () => void; grow: () => void; lay: () => void; verb: (v: VerbId) => void; enforce: (p: PartId) => void }) {
    $('wait').onclick = on.wait; $('grow').onclick = on.grow; $('lay').onclick = on.lay;
  }
  tick(dt: number) { this.food.tick(dt); this.oxy.tick(dt); this.hp.tick(dt); }
  destroy() { clearTimeout(this.bannerT); this.timers.forEach(clearTimeout); }

  refresh(l: L.Life, instant = false, busy = false) {
    $('turn').textContent = `Turn ${l.turn}/${TURNS}`;
    this.setEggs(l.eggs);
    this.food.set(l.food, 0, instant); this.oxy.set(l.oxygen, L.oxygenMax(l), instant); this.hp.set(l.health, RULE.health, instant);
    $('body').textContent = `Size ${l.size} · ${L.stage(l)} · upkeep ${L.upkeep(l)}${l.soft ? ' · soft' : ''}`;
    $('mutant').textContent = l.mutation ? `Mutation: ${PARTS[l.mutation.part].name}` : '';
    const ev = l.board.event;
    $('forecast').textContent = `${ev ? `${ev.name} · turns ${ev.from}–${ev.to}` : 'Quiet water'}${l.board.predatorAt !== null ? ` · ${l.board.predator?.name ?? 'shadow'} at ${l.board.predatorAt}` : ''}`;
    const play = l.phase === 'play' && !busy;
    $<HTMLButtonElement>('wait').disabled = !play;
    const grow = $<HTMLButtonElement>('grow');
    grow.textContent = l.size >= RULE.maxSize ? 'Full grown' : `Grow · ${E.growCost(l)} food`;
    grow.disabled = !play || !E.canGrow(l);
    const lay = $<HTMLButtonElement>('lay');
    lay.textContent = mature(l) ? `Lay · ${E.layCost(l)} food → ${E.layYield(l)} eggs` : `Lay · from size ${RULE.adultSize}`;
    lay.disabled = !play || !E.canLay(l);
    const verbs = $('verbs'); verbs.replaceChildren();
    for (const v of L.verbs(l)) {
      const b = this.button(VERBS[v].name, v === 'dash' && l.dash ? 'next move ×2' : verbNote(l, v));
      b.disabled = !play || !L.ready(l, v) || (v === 'dash' && l.dash);
      b.title = VERBS[v].does; b.onclick = () => this.on.verb(v); verbs.appendChild(b);
    }
    const list = $('enforce'); list.replaceChildren();
    for (const part of activeParts(l)) {
      const effect = ENFORCE_EFFECT[part]; if (!effect) continue;
      const rank = l.enforced[part] ?? 0, cap = ENFORCE_HEADROOM + Math.max(0, l.ranks[part] ?? 0), cost = E.enforceCost(l);
      const done = rank >= cap;
      const label = `${PARTS[part].name}${l.mutation?.part === part ? ' (mutation)' : ''}${rank ? ` · rank ${rank}` : ''} · ${done ? 'cap reached' : cost === null ? 'limit reached' : `${cost} food`}`;
      const effectText = effect.kind === 'meal' ? `+${effect.amount} food per ${effect.meals.replace(/mats$/, 'mat').replace(/meals$/, 'meal')}` : effect.text;
      const note = E.payback(l, part) ?? 'all Enforce spent';
      const b = this.button(label, effect.kind === 'meal' ? `${effectText} · ${note}` : note);
      b.disabled = !play || !E.canEnforce(l, part); b.onclick = () => this.on.enforce(part);
      list.appendChild(b);
    }
  }

  private button(label: string, note: string) {
    const b = document.createElement('button'), s = document.createElement('small');
    b.textContent = label; s.textContent = note; b.appendChild(s); return b;
  }
  setEggs(n: number) { $('eggs').textContent = `Eggs ${n}`; }
  info(text: string) { $('info').textContent = text; }
  banner(text: string, color = FEEDBACK.gold) {
    const b = $('banner'); b.textContent = text; b.style.color = color; b.classList.add('on');
    clearTimeout(this.bannerT); this.bannerT = window.setTimeout(() => b.classList.remove('on'), 1800);
  }
  floater(x: number, y: number, text: string, color: string) {
    const f = document.createElement('div'); f.className = 'floater'; f.textContent = text; f.style.color = color;
    f.style.left = `${Math.max(40, x)}px`; f.style.top = `${Math.max(44, y - 14)}px`;
    $('floaters').appendChild(f);
    const timer = setTimeout(() => { f.remove(); this.timers.delete(timer); }, 1000); this.timers.add(timer);
  }
  flash(alpha: number) {
    const f = $('flash'); f.style.transition = 'none'; f.style.opacity = `${alpha}`; void f.offsetWidth;
    f.style.transition = 'opacity 0.4s ease-out'; f.style.opacity = '0';
  }
}
